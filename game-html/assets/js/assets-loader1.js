// Encapsulado para evitar colisiones
(() => {
  console.log("[assets@132] init (multi-model + per-file config)");

  const overlayEl = document.getElementById("loaderOverlay");
  const fillEl    = document.getElementById("loaderFill");
  const percentEl = document.getElementById("loaderPercent");

  // Estado global
  window.ASSETS_READY = false;
  // Cada entrada del pool tendrá: { model:Object3D, cfg:Object }
  window.ASSET_POOLS = { coins: [], obstacles: [] };

  // ===========================
  // 1) CONFIGURA TUS MODELOS AQUÍ
  // ===========================
  // Sugerencia: evita espacios (o usa %20). Ajusta scale/rotDeg/posY/weight/spinY por modelo.
  const COIN_MODELS = [
    { url: "assets/3d/coin1.fbx",  scale: 0.012, rotDeg: [90, 0, 0], posY: 0.5, weight: 3, spinY: 0.12 },
    { url: "assets/3d/coin2.fbx",  scale: 0.010, rotDeg: [0,  0, 0], posY: 0.48, weight: 1, spinY: 0.08 },
  ];

  const OBSTACLE_MODELS = [
    { url: "assets/3d/obstacle1.fbx", scale: 0.010, rotDeg: [0, 0, 0], posY: 0.0, weight: 2 },
    { url: "assets/3d/obstacle2.fbx", scale: 0.012, rotDeg: [0, 0, 0], posY: 0.0, weight: 1 },
  ];
  // Campos soportados por modelo:
  // - url: string (ruta FBX)
  // - scale: number | [sx,sy,sz]  (por defecto 0.01)
  // - rotDeg: [x,y,z] en grados  (opcional; usa rotRad si prefieres radianes)
  // - rotRad: [x,y,z] en radianes (opcional)
  // - posY: número (altura al spawnear; por defecto 0.5)
  // - weight: probabilidad relativa (por defecto 1)
  // - spinY: velocidad de giro en Y que usará el juego (opcional; útil para monedas)

  // ===========================
  // 2) DEPENDENCIAS BÁSICAS
  // ===========================
  if (typeof THREE === "undefined") {
    console.error("[assets@132] THREE no está definido. Revisa el <script> de three.min.js");
    overlayEl.style.display = "none"; window.ASSETS_READY = true; return;
  }
  if (!window.fflate) {
    console.error("[assets@132] fflate no está cargado. Debe ir ANTES de FBXLoader.js");
    overlayEl.style.display = "none"; window.ASSETS_READY = true; return;
  }
  if (typeof THREE.FBXLoader !== "function") {
    console.error("[assets@132] FBXLoader no disponible. Revisa el orden de scripts.");
    overlayEl.style.display = "none"; window.ASSETS_READY = true; return;
  }

  // ===========================
  // 3) LOADING MANAGER + LOADER
  // ===========================
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
    setTimeout(() => { overlayEl.style.display = "none"; }, 200);
  };
  manager.onError = (url) => console.warn("[assets@132] error:", url);

  const fbxLoader = new THREE.FBXLoader(manager);

  // ===========================
  // 4) UTILIDADES
  // ===========================
  const deg2rad = (d) => d * Math.PI / 180;

  function applyTransforms(obj, cfg, kind /* 'coin' | 'obstacle' */) {
    // sombras
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
    // escala
    if (Array.isArray(cfg.scale)) {
      const [sx=1, sy=1, sz=1] = cfg.scale;
      obj.scale.set(sx, sy, sz);
    } else if (typeof cfg.scale === "number") {
      obj.scale.setScalar(cfg.scale);
    } else {
      obj.scale.setScalar(0.01); // default
    }
    // rotación (prioriza rotRad > rotDeg)
    if (Array.isArray(cfg.rotRad)) {
      const [rx=0, ry=0, rz=0] = cfg.rotRad;
      obj.rotation.set(rx, ry, rz);
    } else if (Array.isArray(cfg.rotDeg)) {
      const [dx=0, dy=0, dz=0] = cfg.rotDeg;
      obj.rotation.set(deg2rad(dx), deg2rad(dy), deg2rad(dz));
    }
    // marca tipo y spin propuesto (el juego puede usarlo)
    obj.userData.kind = kind;
    if (typeof cfg.spinY === "number") obj.userData.spinY = cfg.spinY;
  }

  function loadFBX(url, cfg, kind) {
    return new Promise((resolve) => {
      fbxLoader.load(
        url,
        (fbx) => { applyTransforms(fbx, cfg, kind); resolve(fbx); },
        (xhr) => {
          const pct = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
          console.log(`${kind} ${url} : ${pct}% (${xhr.loaded}/${xhr.total || "?"})`);
        },
        (e) => { console.error(`${kind} FBX load error:`, url, e); resolve(null); }
      );
    });
  }

  async function loadPool(configList, kind) {
    // (opcional) chequeo de accesibilidad
    configList.forEach(({url}) => {
      const abs = new URL(url, location.href).href;
      fetch(abs).then(r => console.log("[check]", abs, r.status, r.ok ? "OK" : "FAIL"))
                .catch(e => console.error("[check error]", abs, e));
    });

    const loaded = await Promise.all(
      configList.map(cfg => loadFBX(cfg.url, cfg, kind).then(obj => ({ obj, cfg })))
    );
    // filtra nulos
    return loaded.filter(e => !!e.obj).map(e => ({ model: e.obj, cfg: normalizeCfg(e.cfg) }));
  }

  function normalizeCfg(cfg) {
    return {
      ...cfg,
      weight: (typeof cfg.weight === "number" && cfg.weight > 0) ? cfg.weight : 1,
      posY: (typeof cfg.posY === "number") ? cfg.posY : 0.5,
    };
  }

  // elección ponderada
  function pickWeighted(entries) {
    if (!entries.length) return null;
    const total = entries.reduce((acc, e) => acc + (e.cfg.weight || 1), 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= (e.cfg.weight || 1);
      if (r <= 0) return e;
    }
    return entries[entries.length - 1];
  }

  // Exponer un helper que devuelve { object:Object3D, cfg:Object }
  window.GET_RANDOM_ASSET = (poolName /* 'coins'|'obstacles' */) => {
    const pool = window.ASSET_POOLS?.[poolName] || [];
    if (!pool.length) return null;
    const entry = pickWeighted(pool);
    const src = entry.model;
    const clone = (src && typeof src.clone === "function") ? src.clone(true) : src;
    // re-aplica transform por si el clone pierde algo (suele conservarlos)
    applyTransforms(clone, entry.cfg, poolName === 'coins' ? 'coin' : 'obstacle');
    // Conserva configuración útil en userData
    clone.userData.config = entry.cfg;
    return { object: clone, cfg: entry.cfg };
  };

  // ===========================
  // 5) CARGA DE POOLS
  // ===========================
  (async () => {
    const [coinPool, obstaclePool] = await Promise.all([
      loadPool(COIN_MODELS, "coin"),
      loadPool(OBSTACLE_MODELS, "obstacle"),
    ]);

    window.ASSET_POOLS.coins = coinPool;
    window.ASSET_POOLS.obstacles = obstaclePool;

    console.log("[assets@132] pools", {
      coins: coinPool.length,
      obstacles: obstaclePool.length
    });
  })();

  // Diagnóstico global
  window.addEventListener("error", (e) => console.error("[window error]", e.error || e.message));
  window.addEventListener("unhandledrejection", (e) => console.error("[unhandledrejection]", e.reason));
})();
