// Encapsulado para evitar colisiones globales
(() => {
  console.log("[assets@132] init");

  const overlayEl = document.getElementById("loaderOverlay");
  const fillEl    = document.getElementById("loaderFill");
  const percentEl = document.getElementById("loaderPercent");

  // Estado global mínimo
  window.ASSETS_READY = false;
  window.ASSETS = { coinFBX: null, obstacleFBX: null };

  // Asegurar que THREE y el loader existan (con estas CDN debería)
  if (typeof THREE === "undefined") {
    console.error("[assets@132] THREE no está definido. Revisa el <script> de three.min.js");
    overlayEl.style.display = "none";
    window.ASSETS_READY = true; // permite fallback
    return;
  }
  if (typeof THREE.FBXLoader !== "function") {
    console.error("[assets@132] FBXLoader no disponible en THREE.FBXLoader. Revisa el <script> del loader y su orden.");
    overlayEl.style.display = "none";
    window.ASSETS_READY = true; // permite fallback
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
    setTimeout(() => { overlayEl.style.display = "none"; }, 200);
  };
  manager.onError = (url) => console.warn("[assets@132] error:", url);

  const fbxLoader = new THREE.FBXLoader(manager);

  // Rutas a tus modelos (evita '+' por espacios; usa %20 o renombra)
  const COIN_FBX_URL     = "assets/3d/deodorantSprayUltra.fbx";
  const OBSTACLE_FBX_URL = "assets/3d/obstacleTrafficCone.fbx";

  // Comprobación rápida
  for (const u of [COIN_FBX_URL, OBSTACLE_FBX_URL]) {
    const abs = new URL(u, location.href).href;
    fetch(abs)
      .then(r => console.log("[check]", abs, r.status, r.ok ? "OK" : "FAIL"))
      .catch(e => console.error("[check error]", abs, e));
  }

  // Clon simple (vale para FBX estáticos). Si tus FBX son "skinned",
  // avísame y cambiamos a SkeletonUtils (ESM) o GLTF.
  window.FBX_ASSET_CLONE = (obj) => (obj && typeof obj.clone === "function") ? obj.clone(true) : obj;

  const coinPromise = new Promise((resolve) => {
    console.log("[assets@132] coinPromise");
    fbxLoader.load(
      COIN_FBX_URL,
      (fbx) => {
        fbx.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
        fbx.scale.setScalar(2.5);
        // fbx.rotation.x = Math.PI / 2; // quítalo si tu modelo se ve bien
        resolve(fbx);
      },
      (xhr) => {
        const pct = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
        console.log(`Coin load: ${pct}% (${xhr.loaded}/${xhr.total || "?"})`);
      },
      (e) => {
        console.error("Coin FBX load error:", e);
        resolve(null);
      }
    );
  });

  const obstaclePromise = new Promise((resolve) => {
    console.log("[assets@132] obstaclePromise");
    fbxLoader.load(
      OBSTACLE_FBX_URL,
      (fbx) => {
        fbx.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }});
        fbx.scale.setScalar(2.5);
        resolve(fbx);
      },
      (xhr) => {
        const pct = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
        console.log(`Obstacle load: ${pct}% (${xhr.loaded}/${xhr.total || "?"})`);
      },
      (e) => {
        console.error("Obstacle FBX load error:", e);
        resolve(null);
      }
    );
  });

  Promise.all([coinPromise, obstaclePromise]).then(([coinFBX, obstacleFBX]) => {
    console.log("[assets@132] resueltos", { coin: !!coinFBX, obstacle: !!obstacleFBX });
    window.ASSETS.coinFBX = coinFBX;
    window.ASSETS.obstacleFBX = obstacleFBX;
  });

  // Helper para el juego
  window.GET_ASSET_CLONE = (key) => {
    const src = window.ASSETS?.[key];
    return src ? window.FBX_ASSET_CLONE(src) : null;
  };

  // Diagnóstico global
  window.addEventListener("error", (e) => console.error("[window error]", e.error || e.message));
  window.addEventListener("unhandledrejection", (e) => console.error("[unhandledrejection]", e.reason));
})();
