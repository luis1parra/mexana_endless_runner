// Encapsulado para evitar colisiones globales
async function __runAssetPipeline() {
  if (typeof THREE !== "undefined" && THREE.Cache) {
    THREE.Cache.enabled = true;
  }
  console.log("[assets@132] init (multi-model)");

  const overlayEl = document.getElementById("loaderOverlay");
  const fillEl = document.getElementById("loaderFill");
  const percentEl = document.getElementById("loaderPercent");

  // Estado global mínimo
  window.ASSETS_READY = false;
  // Pools donde guardaremos TODOS los modelos precargados por tipo
  window.ASSET_POOLS = { coins: [], obstacles: [] };
  window.PLAYER_MODEL = null;
  window.PLAYER_JUMP_MODEL = null;
  window.PLAYER_JUMP_ANIMATIONS = [];
  window.PLAYER_DEATH_MODEL = null;
  window.PLAYER_DEATH_ANIMATIONS = [];
  window.PLAYER_ANIMATIONS = [];

  // --- Configura aquí tus listas de modelos ---
  // Evita '+' para espacios; usa %20 o renómbralos sin espacios
  const IS_MOBILE_ENV = /iPhone|iPad|iPod|Android/i.test((typeof navigator !== "undefined" && navigator.userAgent) || "");
  const LOAD_CITY_ASSETS = window.LOAD_CITY_ASSETS !== false;
  const LOAD_DECORATION = window.LOAD_DECORATION !== false;
  const LOAD_BUILDINGS = window.LOAD_BUILDINGS !== false;
  const COIN_MODEL_LIMIT = Number.isFinite(window.COIN_MODEL_LIMIT) ? Math.max(0, Number(window.COIN_MODEL_LIMIT)) : IS_MOBILE_ENV ? 2 : undefined;
  const OBSTACLE_MODEL_LIMIT = Number.isFinite(window.OBSTACLE_MODEL_LIMIT) ? Math.max(0, Number(window.OBSTACLE_MODEL_LIMIT)) : IS_MOBILE_ENV ? 2 : undefined;
  const CITY_DECOR_MODEL_LIMIT = Number.isFinite(window.CITY_DECOR_MODEL_LIMIT) ? Math.max(0, Number(window.CITY_DECOR_MODEL_LIMIT)) : IS_MOBILE_ENV ? 2 : undefined;
  const CITY_BUILDING_MODEL_LIMIT = Number.isFinite(window.CITY_BUILDING_MODEL_LIMIT) ? Math.max(0, Number(window.CITY_BUILDING_MODEL_LIMIT)) : IS_MOBILE_ENV ? 1 : undefined;
  window.IS_MOBILE_ENV = IS_MOBILE_ENV;

  const COIN_FBX_URLS = [
    "assets/3d/deodorantBottleAven.fbx",
    "assets/3d/deodorantBottleClassic.fbx",
    "assets/3d/deodorantBottleLady.fbx",
    "assets/3d/deodorantSprayAven.fbx",
    "assets/3d/deodorantSprayClassic.fbx",
    "assets/3d/deodorantSprayLady.fbx",
    "assets/3d/deodorantSprayUltra.fbx",
  ];

  const OBSTACLE_FBX_URLS = [
    "assets/3d/obstacleCar.fbx", 
    "assets/3d/obstacleTrafficCone.fbx", 
    "assets/3d/obstacleBarrier.fbx", 
  ];

  const COIN_SCORE_MAP = {
    "deodorantbottleaven.fbx": 1,
    "deodorantbottleclassic.fbx": 2,
    "deodorantbottlelady.fbx": 3,
    "deodorantsprayaven.fbx": 4,
    "deodorantsprayclassic.fbx": 5,
    "deodorantspraylady.fbx": 6,
    "deodorantsprayultra.fbx": 7,
  };

  const COIN_LABEL_MAP = {
    "deodorantbottleaven.fbx": "Mexsana Avena",
    "deodorantbottleclassic.fbx": "Mexsana Classic",
    "deodorantbottlelady.fbx": "Mexsana Lady",
    "deodorantsprayaven.fbx": "Mexsana Spray Avena",
    "deodorantsprayclassic.fbx": "Mexsana Spray Classic",
    "deodorantspraylady.fbx": "Mexsana Spray Lady",
    "deodorantsprayultra.fbx": "Mexsana Ultra",
  };

  const OBSTACLE_SCALE_MAP = {
    "obstaclecar.fbx": 0.025,
    "obstacletrafficcone.fbx": 1.4,
    "obstaclebarrier.fbx": 2.7,
  };

  const CITY_DECOR_ROTATION_MAP = {
    "citylamppost.fbx": Math.PI / 2,
  };

  const CITY_DECOR_FBX_URLS = [
    "assets/3d/cityBusStop1.fbx", 
    "assets/3d/cityBusStop2.fbx", 
    "assets/3d/cityLampPost.fbx", 
    "assets/3d/cityTree.fbx", 
  ];

  const CITY_DECOR_SCALE_MAP = {
    "citybusstop1.fbx": 0.01,
    "citybusstop2.fbx": 0.9,
    "citylamppost.fbx": 1,
    "citytree.fbx": 1,
  };

  const CITY_BUILDING_FBX_URLS = [
    "assets/3d/buildingBlue.fbx", 
    "assets/3d/buildingOrange.fbx", 
    "assets/3d/buildingYellow.fbx",
    //"assets/3d/buildingYellow-compressed.fbx",
    "assets/3d/buildingRed.fbx", 
  ];
  
  const PLAYER_VARIANT = (window.PLAYER_VARIANT || "boy").toLowerCase() === "girl" ? "girl" : "boy";

  window.PLAYER_VARIANT_RESOLVED = PLAYER_VARIANT;

  const PLAYER_MODEL_URLS = {
    boy: {
      run: "assets/3d/Boy_Running.fbx",
      jump: "assets/3d/Boy_Jump.fbx",
      death: "assets/3d/Boy_Death.fbx",
    },
    girl: {
      run: "assets/3d/Girl_Running.fbx",
      jump: "assets/3d/Giril_Jump.fbx",
      death: "assets/3d/Girl_Death.fbx",
    },
  };

  const coinUrls = Number.isFinite(COIN_MODEL_LIMIT) ? COIN_FBX_URLS.slice(0, COIN_MODEL_LIMIT) : COIN_FBX_URLS;
  const obstacleUrls = Number.isFinite(OBSTACLE_MODEL_LIMIT) ? OBSTACLE_FBX_URLS.slice(0, OBSTACLE_MODEL_LIMIT) : OBSTACLE_FBX_URLS;
  const decorUrls = Number.isFinite(CITY_DECOR_MODEL_LIMIT) ? CITY_DECOR_FBX_URLS.slice(0, CITY_DECOR_MODEL_LIMIT) : CITY_DECOR_FBX_URLS;
  const buildingUrls = Number.isFinite(CITY_BUILDING_MODEL_LIMIT) ? CITY_BUILDING_FBX_URLS.slice(0, CITY_BUILDING_MODEL_LIMIT) : CITY_BUILDING_FBX_URLS;

  const PLAYER_FBX_URL = PLAYER_MODEL_URLS[PLAYER_VARIANT].run;
  const PLAYER_JUMP_URL = PLAYER_MODEL_URLS[PLAYER_VARIANT].jump;
  const PLAYER_DEATH_URL = PLAYER_MODEL_URLS[PLAYER_VARIANT].death;
  const STREET_GLB_URL = "assets/3d/Street_Final.fbx";

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
  const playerTextureLoader = new THREE.TextureLoader(manager);
  let cachedPlayerTexture = null;

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
          if (child.isSkinnedMesh) {
            child.frustumCulled = false;
          }
          if (child.isMesh && child.geometry && !child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
        });
      }
      const bbox = new THREE.Box3().setFromObject(obj);
      const size = bbox.getSize(new THREE.Vector3());
      if (!Number.isFinite(size.y) || size.y <= 0) {
        size.y = 1;
      }
      if (size.y > 0) {
        const desiredHeight = 1.2;
        const scaleFactor = desiredHeight / size.y;
        obj.scale.multiplyScalar(scaleFactor);
        const scaledBox = new THREE.Box3().setFromObject(obj);
        const minY = scaledBox.min.y;
        if (isFinite(minY)) {
          obj.position.y -= minY;
        }
      }
      obj.rotation.y = Math.PI;
      obj.userData.defaultRotationY = obj.rotation.y;
    } else if (kind === "street") {
      const initialBox = new THREE.Box3().setFromObject(obj);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const targetLength = 13;
      const baseLength = initialSize.z || targetLength;
      const scaleFactor = targetLength / baseLength;     
      obj.scale.multiplyScalar(scaleFactor);
      obj.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(obj);
      const minY = bbox.min.y;
      if (isFinite(minY)) obj.position.y = -minY;
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      obj.position.x -= center.x;
      obj.position.z -= center.z;
      const size = bbox.getSize(new THREE.Vector3());
      obj.userData.streetLength = size.z || targetLength;
      obj.userData.streetWidth = size.x || 10;
      obj.userData.assetCategory = "street";
      obj.rotation.y = 0;
    } else if (kind === "obstacle") {
      const key = (resourceUrl || "").toLowerCase().split("/").pop();
      const scaleFactor = (key && OBSTACLE_SCALE_MAP[key]) || 0.6;
      obj.scale.multiplyScalar(scaleFactor);
      obj.rotation.y = -Math.PI / 2;
      obj.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(obj);
      const minY = bbox.min.y;
      if (isFinite(minY)) obj.position.y = -minY;
      obj.userData.assetCategory = "obstacle";
      obj.traverse((child) => {
        const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
        materials.forEach((mat) => {
          if (mat && mat.color && mat.color.isColor) {
            mat.color.offsetHSL(0, 0, 0.2);
          }
        });
      });
    } else if (kind === "coin") {
      const fileName = (resourceUrl || "").split("/").pop() || "";
      const key = fileName.toLowerCase();
      const value = (key && COIN_SCORE_MAP[key]) || 1;
      obj.scale.multiplyScalar(1.2);
      obj.userData.assetCategory = "coin";
      obj.userData.scoreValue = value;
      if (key && COIN_LABEL_MAP[key]) {
        obj.userData.hudTitle = COIN_LABEL_MAP[key];
      }
      obj.userData.hudSubtitle = "puntos frescura";
      if (resourceUrl) {
        obj.userData.hudImage = resourceUrl.replace(/assets\/3d\//i, "assets/2d/").replace(/\.[^.]+$/, ".png");
      }
      obj.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(obj);
      const minY = bbox.min.y;
      if (isFinite(minY)) obj.position.y = -minY;
      obj.traverse((child) => {
        const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
        materials.forEach((mat) => {
          if (mat && mat.color && mat.color.isColor) {
            mat.color.offsetHSL(0, 0, 0.35);
            mat.color.setRGB(1, 1, 1);
            mat.color.multiplyScalar(3);
          }
          if (mat && typeof mat.emissiveIntensity === "number") {
            //mat.emissiveIntensity = (mat.emissiveIntensity || 0) + 0.35;
          }
        });
      });
    } else {
      obj.scale.setScalar(2.5);
      obj.rotation.y = -Math.PI / 2;
      // Si alguna moneda viene “de canto”, podrías activar:
      // if (kind === 'coin') obj.rotation.x = Math.PI / 2;
      if (kind === "city" && resourceUrl) {
        const lower = resourceUrl.toLowerCase();
        const decorKey = lower.split("/").pop();
        if (lower.includes("building")) {
          obj.scale.multiplyScalar(0.06);
          obj.userData.assetCategory = "building";
        } else if (lower.includes("tree")) {
          obj.userData.assetCategory = "scenery";
          obj.scale.multiplyScalar(0.04); // reduce FBX tree drastically
          obj.rotation.y = 0;
        } else {
          obj.userData.assetCategory = "scenery";
          obj.scale.multiplyScalar(2);
        }
        if (decorKey && decorKey in CITY_DECOR_ROTATION_MAP) {
          obj.rotation.y = CITY_DECOR_ROTATION_MAP[decorKey];
        }
        console.log("resourceUrl", lower, decorKey, CITY_DECOR_SCALE_MAP[decorKey]);
        if (decorKey && decorKey in CITY_DECOR_SCALE_MAP) {
          console.log("resourceUrl", lower, decorKey, CITY_DECOR_SCALE_MAP[decorKey]);
          obj.scale.multiplyScalar(CITY_DECOR_SCALE_MAP[decorKey]);
        }
        obj.userData.cityKey = decorKey || null;
        obj.userData.defaultRotationY = obj.rotation?.y ?? 0;
      }
    }
    obj.updateMatrixWorld(true);
    if (kind === "city" && obj.userData?.assetCategory === "building") {
      const bbox = new THREE.Box3().setFromObject(obj);
      const size = bbox.getSize(new THREE.Vector3());
      obj.userData.buildingDepth = size.z || 14;
      obj.traverse((child) => {
        console.log("city_", obj, obj.userData.cityKey, child, child.material);
        
        const materials = child.material ? (Array.isArray(child.material) ? child.material : [child.material]) : [];
        materials.forEach((mat) => {
          if (mat && mat.color && mat.color.isColor) {
            // mat.color.setHSL(0, 0, 0);
            //mat.color.setRGB(1, 1, 1);
            // mat.color.offsetHSL(0, 0, -0.35);
            //mat.color.multiplyScalar(2);
            const sat = {
              "blinn1": {norColor: true, satu: 2},
              "blinn2": {norColor: true, satu: 2},
              "tripo_mat_ab050b58": {norColor: true, satu: 2},
              "Beige": {norColor: false, satu: 1.6},
              "ventanas": {norColor: false, satu: 1.8},
            };
            if (sat[mat.name]) {
              if(sat[mat.name].norColor) mat.color.setRGB(1, 1, 1);
              mat.color.multiplyScalar(sat[mat.name].satu);
            }
          }
          if (mat && typeof mat.emissiveIntensity === "number") {
            //mat.emissiveIntensity = (mat.emissiveIntensity || 0) + 0.35;
            mat.emissiveIntensity = 0.25;
          }
        });
      });
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
          fbx.userData = fbx.userData || {};
          if (fbx.animations && !fbx.userData.animations) {
            fbx.userData.animations = fbx.animations;
          }
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
          if (!root) {
            resolve(null);
            return;
          }
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
        },
      );
    });
  }

  // Utilidad: carga secuencialmente una lista y filtra nulos (menos pico de memoria)
  async function loadAll(urls, kind) {
    // (Opcional) chequeo de accesibilidad
    urls.forEach((u) => {
      const abs = new URL(u, location.href).href;
      fetch(abs)
        .then((r) => console.log("[check]", abs, r.status, r.ok ? "OK" : "FAIL"))
        .catch((e) => console.error("[check error]", abs, e));
    });

    const results = [];
    for (const url of urls) {
      const lower = (url || "").toLowerCase();
      const loader = lower.endsWith(".fbx") ? loadFBX : loadGLB;
      const res = await loader(url, kind);
      if (res) {
        results.push(res);
      }
    }
    return results;
  }

  // Flujo principal
  (async () => {
    const coinModels = await loadAll(coinUrls, "coin");
    const obstacleModels = await loadAll(obstacleUrls, "obstacle");
    let cityModels = [];
    if (LOAD_CITY_ASSETS) {
      const decorModels = LOAD_DECORATION ? await loadAll(decorUrls, "city") : [];
      const buildingModels = LOAD_BUILDINGS ? await loadAll(buildingUrls, "city") : [];
      cityModels = decorModels.concat(buildingModels);
    }
    const playerModel = await loadFBX(PLAYER_FBX_URL, "player");
    const streetModel = await loadFBX(STREET_GLB_URL, "street");
    const jumpModel = await loadFBX(PLAYER_JUMP_URL, "player");
    const deathModel = await loadFBX(PLAYER_DEATH_URL, "player");

    window.ASSET_POOLS.coins = coinModels;
    window.ASSET_POOLS.obstacles = obstacleModels;
    window.ASSET_POOLS.city = cityModels;
    const cityBuildings = cityModels.filter((model) => model?.userData?.assetCategory === "building");
    const cityScenery = cityModels.filter((model) => model?.userData?.assetCategory !== "building");
    window.ASSET_POOLS.cityBuildings = LOAD_BUILDINGS ? (cityBuildings.length ? cityBuildings : cityModels) : [];
    window.ASSET_POOLS.cityScenery = LOAD_DECORATION ? (cityScenery.length ? cityScenery : cityModels) : [];
    window.ASSET_POOLS.street = streetModel ? [streetModel] : [];
    if (playerModel) {
      window.PLAYER_MODEL = playerModel;
      const anims = playerModel.animations || playerModel.userData?.animations || [];
      window.PLAYER_ANIMATIONS = anims.map((clip) => (clip.clone ? clip.clone() : clip));
      console.log("[assets@132] player animations:", window.PLAYER_ANIMATIONS.length);
    }
    if (jumpModel) {
      window.PLAYER_JUMP_MODEL = jumpModel;
      const jumpAnims = jumpModel.animations || jumpModel.userData?.animations || [];
      window.PLAYER_JUMP_ANIMATIONS = jumpAnims.map((clip) => (clip.clone ? clip.clone() : clip));
      console.log("[assets@132] jump animations:", window.PLAYER_JUMP_ANIMATIONS.length);
    }
    if (deathModel) {
      window.PLAYER_DEATH_MODEL = deathModel;
      const deathAnims = deathModel.animations || deathModel.userData?.animations || [];
      window.PLAYER_DEATH_ANIMATIONS = deathAnims.map((clip) => (clip.clone ? clip.clone() : clip));
      console.log("[assets@132] death animations:", window.PLAYER_DEATH_ANIMATIONS.length);
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
  await Promise.all(Object.entries(SFX_CONFIG).map(([name, url]) => loadSfx(name, url)));

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
      g.gain.value = typeof opts.volume === "number" ? opts.volume : defaultVol[name] ?? 0.7;

      src.connect(g).connect(master);

      try {
        if (ctx.state !== "running") ctx.resume();
      } catch (_) {}
      src.start(0);
    }

    return {
      play,
      setMasterVolume(v) {
        master.gain.value = Math.max(0, Math.min(1, v));
      },
    };
  })();

  // Diagnóstico global
  window.addEventListener("error", (e) => console.error("[window error]", e.error || e.message));
  window.addEventListener("unhandledrejection", (e) => console.error("[unhandledrejection]", e.reason));
}

let __assetPipelinePromise = null;

function startAssetPipeline() {
  if (!__assetPipelinePromise) {
    __assetPipelinePromise = __runAssetPipeline().catch((err) => {
      console.error("[assets@132] init failed", err);
      __assetPipelinePromise = null;
      throw err;
    });
  }
  return __assetPipelinePromise;
}

(function scheduleAssetPipeline() {
  if (typeof window === "undefined") {
    startAssetPipeline();
    return;
  }

  window.START_ASSET_LOADING = startAssetPipeline;

  const delayMs = typeof window.ASSET_LOAD_DELAY_MS === "number" ? window.ASSET_LOAD_DELAY_MS : 2000;
  if (window.DEFER_ASSET_LOADING === true) {
    setTimeout(startAssetPipeline, delayMs);
  } else {
    startAssetPipeline();
  }
})();
