// Encapsulado para evitar colisiones globales
(async () => {
    console.log("[assets@132] init (multi-model)");

    const overlayEl = document.getElementById("loaderOverlay");
    const fillEl = document.getElementById("loaderFill");
    const percentEl = document.getElementById("loaderPercent");

    // Estado global mínimo
    window.ASSETS_READY = false;
    // Pools donde guardaremos TODOS los modelos precargados por tipo
    window.ASSET_POOLS = { coins: [], obstacles: [] };
    window.PLAYER_MODEL = null;
    window.PLAYER_ANIMATIONS = [];

    // --- Configura aquí tus listas de modelos ---
    // Evita '+' para espacios; usa %20 o renómbralos sin espacios
    const COIN_FBX_URLS = [
        "assets/3d/deodorantBottleAven.glb",
        "assets/3d/deodorantBottleClassic.glb",
        "assets/3d/deodorantBottleLady.glb",
        "assets/3d/deodorantSprayAven.glb",
        "assets/3d/deodorantSprayClassic.glb",
        "assets/3d/deodorantSprayLady.glb",
        "assets/3d/deodorantSprayUltra.glb",
    ];

    const OBSTACLE_FBX_URLS = [
        "assets/3d/obstacleCar.glb",
        "assets/3d/obstacleTrafficCone.glb",
        "assets/3d/obstacleBarrier.glb"
    ];

const CITY_FBX_URLS = [
    "assets/3d/cityBusStop1.glb",
    "assets/3d/cityBusStop2.glb",
    "assets/3d/cityLampPost.glb",
    "assets/3d/cityTree.glb",
    "assets/3d/buildingHouse.glb",
    "assets/3d/buildingOrange.glb",
    "assets/3d/buildingYellow.glb",
];
    const PLAYER_FBX_URL = "assets/3d/Boy_Running.glb";
    const STREET_GLB_URL = "assets/3d/Street_Final.glb";

    // ====== SFX: Precarga de sonidos WAV con Web Audio ======

    // Contexto de audio global (queda suspendido hasta el primer gesto del usuario)
    window.AUDIO_CTX = window.AUDIO_CTX || new (window.AudioContext || window.webkitAudioContext)();
    // Buffers de audio
    window.SFX_BUFFERS = window.SFX_BUFFERS || {};

    // Mapea cada evento a su archivo .wav
    const SFX_CONFIG = {
        jump: "assets/sounds/jump.wav",
        move: "assets/sounds/move.wav",
        coin: "assets/sounds/getCoin.wav",
        hit: "assets/sounds/hit.wav",
        life: "assets/sounds/lifeLost.wav",
        gameover: "assets/sounds/endGame.wav",
    };

    // --- Chequeos básicos de dependencias (three + fflate + loader) ---
    if (typeof THREE === "undefined") {
        console.error("[assets@132] THREE no está definido. Revisa el <script> de three.min.js");
        overlayEl.style.display = "none";
        window.ASSETS_READY = true;
        return;
    }
    if (!window.fflate) {
        console.error("[assets@132] fflate no está cargado. Debe ir ANTES de FBXLoader.js");
        overlayEl.style.display = "none";
        window.ASSETS_READY = true;
        return;
    }
    if (typeof THREE.FBXLoader !== "function") {
        console.error("[assets@132] FBXLoader no disponible en THREE.FBXLoader. Revisa el orden de scripts.");
        overlayEl.style.display = "none";
        window.ASSETS_READY = true;
        return;
    }
    if (typeof THREE.GLTFLoader !== "function") {
        console.error("[assets@132] GLTFLoader no disponible en THREE.GLTFLoader. Revisa el orden de scripts.");
        overlayEl.style.display = "none";
        window.ASSETS_READY = true;
        return;
    }

    // LoadingManager con barra
    const manager = new THREE.LoadingManager();
    manager.onStart = () => {
        overlayEl.style.display = "flex";
        fillEl.style.width = "0%";
        percentEl.textContent = "0%";
    };
    manager.onProgress = (url, loaded, total) => {
        const pct = total ? Math.round((loaded / total) * 100) : 0;
        fillEl.style.width = pct + "%";
        percentEl.textContent = pct + "%";
    };
    manager.onLoad = () => {
        fillEl.style.width = "100%";
        percentEl.textContent = "100%";
        window.ASSETS_READY = true;
        setTimeout(() => {
            overlayEl.style.display = "none";
        }, 200);
    };
    manager.onError = (url) => console.warn("[assets@132] error:", url);


    const fbxLoader = new THREE.FBXLoader(manager);
    const gltfLoader = new THREE.GLTFLoader(manager);

    // Transforms comunes (ajústalos a tus modelos si quieres)
    function applyCommonTransforms(obj, kind /* 'coin' | 'obstacle' | 'city' | 'player' */, resourceUrl = "") {
        obj.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                if (o.material) {
                    const materials = Array.isArray(o.material) ? o.material : [o.material];
                    materials.forEach((mat) => {
                        if ("skinning" in mat) {
                            mat.skinning = true;
                        }
                    });
                }
            }
        });
        obj.userData = obj.userData || {};
        if (resourceUrl) {
            obj.userData.sourceUrl = resourceUrl;
        }
        if (kind === "player") {
            if (obj.children) {
                obj.traverse((child) => {
                    child.visible = true;
                });
            }
            const bbox = new THREE.Box3().setFromObject(obj);
            const size = bbox.getSize(new THREE.Vector3());
            if (size.y > 0) {
                const desiredHeight = 0.004;
                const scaleFactor = desiredHeight / size.y;
                obj.scale.multiplyScalar(scaleFactor);
                const scaledBox = new THREE.Box3().setFromObject(obj);
                const minY = scaledBox.min.y;
                if (isFinite(minY)) {
                    obj.position.y -= minY;
                }
            }
            obj.rotation.y = Math.PI;
        } else if (kind === "street") {
            obj.scale.multiplyScalar(2);
            obj.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(obj);
            const minY = bbox.min.y;
            if (isFinite(minY)) obj.position.y = -minY;
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            obj.position.x -= center.x;
            obj.position.z -= center.z;
            const size = bbox.getSize(new THREE.Vector3());
            obj.userData.streetLength = size.z || 20;
            obj.userData.streetWidth = size.x || 20;
            obj.userData.assetCategory = "street";
            obj.rotation.y = 0;
        } else {
            obj.scale.setScalar(2.5);
            obj.rotation.y = -Math.PI / 2;
            // Si alguna moneda viene “de canto”, podrías activar:
            // if (kind === 'coin') obj.rotation.x = Math.PI / 2;
            if (kind === "coin") {
                obj.scale.multiplyScalar(0.5);
            }
            if (kind === "city" && resourceUrl) {
                if (resourceUrl.toLowerCase().includes("building")) {
                    obj.scale.multiplyScalar(4);
                    obj.userData.assetCategory = "building";
                } else {
                    obj.userData.assetCategory = "scenery";
                    obj.scale.multiplyScalar(2);
                }
            }
        }
        obj.updateMatrixWorld(true);
        if (kind === "city" && obj.userData?.assetCategory === "building") {
            const bbox = new THREE.Box3().setFromObject(obj);
            const size = bbox.getSize(new THREE.Vector3());
            obj.userData.buildingDepth = size.z || 14;
        }
    }

    // Clon simple (sirve para FBX estáticos). Para skinned, considera ESM + SkeletonUtils.
    window.FBX_ASSET_CLONE = (obj) => (obj && typeof obj.clone === "function" ? obj.clone(true) : obj);

    // Carga un FBX y devuelve la instancia
    function loadFBX(url, kind) {
        return new Promise((resolve) => {
            fbxLoader.load(
                url,
                (fbx) => {
                    applyCommonTransforms(fbx, kind, url);
                    resolve(fbx);
                },
                (xhr) => {
                    const pct = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
                    console.log(`${kind} ${url} : ${pct}% (${xhr.loaded}/${xhr.total || "?"})`);
                },
                (e) => {
                    console.error(`${kind} FBX load error:`, url, e);
                    resolve(null);
                },
            );
        });
    }

    // Carga un GLB
    function loadGLB(url, kind) {
        return new Promise((resolve) => {
            gltfLoader.load(
                url,
                (gltf) => {
                    const root = gltf.scene || gltf.scenes?.[0];
                    if (!root) { resolve(null); return; }
                                        if (gltf.animations) {
                        root.animations = gltf.animations;
                    }
root.userData = root.userData || {};
                    if (gltf.animations) {
                        root.userData.animations = gltf.animations;
                    } else {
                        root.userData.animations = root.animations || [];
                    }
                    applyCommonTransforms(root, kind, url); // tu misma función de transforms
                    resolve(root);
                },
                (xhr) => {
                    const pct = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
                    console.log(`${kind} ${url} : ${pct}% (${xhr.loaded}/${xhr.total || "?"})`);
                },
                (e) => {
                    console.error(`${kind} GLB load error:`, url, e);
                    resolve(null);
                }
            );
        });
    }

    // Utilidad: carga en paralelo una lista y filtra nulos
    async function loadAll(urls, kind) {
        // (Opcional) chequeo de accesibilidad
        urls.forEach((u) => {
            const abs = new URL(u, location.href).href;
            fetch(abs)
                .then((r) => console.log("[check]", abs, r.status, r.ok ? "OK" : "FAIL"))
                .catch((e) => console.error("[check error]", abs, e));
        });
        //const results = await Promise.all(urls.map((u) => loadFBX(u, kind)));
        const results = await Promise.all(urls.map((u) => loadGLB(u, kind)));
        return results.filter(Boolean);
    }

    // Flujo principal
    (async () => {
        const [coinModels, obstacleModels, cityModels, playerModel, streetModel] = await Promise.all([
            loadAll(COIN_FBX_URLS, "coin"),
            loadAll(OBSTACLE_FBX_URLS, "obstacle"),
            loadAll(CITY_FBX_URLS, "city"),
            loadGLB(PLAYER_FBX_URL, "player"),
            loadGLB(STREET_GLB_URL, "street"),
        ]);

        window.ASSET_POOLS.coins = coinModels;
        window.ASSET_POOLS.obstacles = obstacleModels;
        window.ASSET_POOLS.city = cityModels;
        const cityBuildings = cityModels.filter((model) => model?.userData?.assetCategory === "building");
        const cityScenery = cityModels.filter((model) => model?.userData?.assetCategory !== "building");
        window.ASSET_POOLS.cityBuildings = cityBuildings.length ? cityBuildings : cityModels;
        window.ASSET_POOLS.cityScenery = cityScenery.length ? cityScenery : cityModels;
        window.ASSET_POOLS.street = streetModel ? [streetModel] : [];
        if (playerModel) {
            window.PLAYER_MODEL = playerModel;
            const anims = playerModel.animations || playerModel.userData?.animations || [];
            window.PLAYER_ANIMATIONS = anims.map((clip) => clip.clone ? clip.clone() : clip);
            console.log("[assets@132] player animations:", window.PLAYER_ANIMATIONS.length);
        }

        console.log("[assets@132] pools", {
            coins: coinModels.length,
            obstacles: obstacleModels.length,
            city: cityModels.length,
            player: playerModel ? 1 : 0,
        });
    })();

    // Helpers para el juego
    window.GET_RANDOM_ASSET_CLONE = (poolName /* 'coins' | 'obstacles' | 'city' */) => {
        const pool = window.ASSET_POOLS?.[poolName] || [];
        if (!pool.length) return null;
        const src = pool[Math.floor(Math.random() * pool.length)];
        return window.FBX_ASSET_CLONE(src);
    };

    // Carga + decodificación de un wav
    async function loadSfx(name, url) {
        // Integra al LoadingManager para que la barra avance
        if (manager && typeof manager.itemStart === "function") manager.itemStart("sfx:" + name);
        try {
            const res = await fetch(url);
            const ab = await res.arrayBuffer();
            const buf = await window.AUDIO_CTX.decodeAudioData(ab);
            window.SFX_BUFFERS[name] = buf;
        } catch (e) {
            console.error("[sfx] error cargando", name, url, e);
        } finally {
            if (manager && typeof manager.itemEnd === "function") manager.itemEnd("sfx:" + name);
        }
    }

    // Carga todos los sfx en paralelo
    await Promise.all(
        Object.entries(SFX_CONFIG).map(([name, url]) => loadSfx(name, url))
    );

    // Motor SFX con master gain, volúmenes por defecto y rate-limit para "move"
    window.SFX = (() => {
        const ctx = window.AUDIO_CTX;
        const master = ctx.createGain();
        master.gain.value = 0.7; // volumen maestro
        master.connect(ctx.destination);

        const defaultVol = {
            jump: 0.8,
            move: 0.5,
            coin: 0.9,
            hit: 0.9,
            life: 1.5,
            gameover: 1.0,
        };

        const lastPlay = { move: 0 };
        const RL = { move: 120 }; // ms mínimo entre "move" seguidos

        function play(name, opts = {}) {
            const buf = window.SFX_BUFFERS[name];
            if (!buf) return;

            const nowMs = performance.now();
            if (RL[name]) {
                const last = lastPlay[name] || 0;
                if (nowMs - last < RL[name]) return;
                lastPlay[name] = nowMs;
            }

            const src = ctx.createBufferSource();
            src.buffer = buf;

            const g = ctx.createGain();
            g.gain.value = (typeof opts.volume === "number") ? opts.volume : (defaultVol[name] ?? 0.7);

            src.connect(g).connect(master);

            try { if (ctx.state !== "running") ctx.resume(); } catch (_) { }
            src.start(0);
        }

        return {
            play,
            setMasterVolume(v) { master.gain.value = Math.max(0, Math.min(1, v)); },
        };
    })();

    // Diagnóstico global
    window.addEventListener("error", (e) => console.error("[window error]", e.error || e.message));
    window.addEventListener("unhandledrejection", (e) => console.error("[unhandledrejection]", e.reason));
})();
