// Encapsulado
(() => {
  let scene, camera, renderer;
  let player, targetLane = 1;
  const obstacles = [], coins = [], lanes = [-2, 0, 2], buildings = [], floorSegments = [];
  let speed = 0.01, jumpVelocity = 0.2, isJumping = false, yVelocity = 0;
  let timer = 0, lives = 3, coinCount = 0;
  let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
  let gameStarted = false;
  let hitPauseUntil = 0;
  let isPaused = false;
  let hitFlashTimeout = null;
  const HIT_FLASH_CLASS = "hit-flash";
  const clock = new THREE.Clock();
  let mixer = null;
  let groundY = 0.5;
  let playerHalfHeight = 0.5;
  let playerHalfWidth = 0.5;
  let playerHalfDepth = 0.5;
  const OBSTACLE_POOL_SIZE = 6;
  const COIN_POOL_SIZE = 8;
  const SCORE_ENDPOINT = ((window && window.__APP_CONFIG__ && window.__APP_CONFIG__.remoteApiBaseUrl) || "https://www.pressstartevolution.com/tbwa/mexana/admin/apigame/") + "recpuntaje.php";
  const BASIC_AUTH_TOKEN =
    (window && window.BASIC_AUTH_TOKEN) ||
    (window && window.__APP_CONFIG__ && window.__APP_CONFIG__.basicAuthToken) ||
    "UHJlc3NzdGFydGV2b2x1dGlvbjpQcjNzdCQkMjAyNQ==";
  let gameStartTimestamp = null;
  let scoreSubmitted = false;
  let pendingScorePromise = null;

  const timerEl = document.getElementById("timer");
  const livesEl = document.getElementById("lives");
  const coinsEl = document.getElementById("coins");
  const hudEl = document.getElementById("hud");
  const startScreenEl = document.getElementById("startScreen");
  const overlayEl = document.getElementById("loaderOverlay");
  const countdownEl = document.getElementById("countdown");
  const startHintEl = document.getElementById("startHint");

  const triggerHitPause = (duration = 700) => {
    hitPauseUntil = performance.now() + duration;
    isPaused = true;

    if (hitFlashTimeout) clearTimeout(hitFlashTimeout);
    document.body.classList.add(HIT_FLASH_CLASS);
    hitFlashTimeout = setTimeout(() => {
      document.body.classList.remove(HIT_FLASH_CLASS);
      hitFlashTimeout = null;
    }, duration);
  };

  const waitAssets = async (timeoutMs = 60000) => {
    const t0 = performance.now();
    while (!window.ASSETS_READY && performance.now() - t0 < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return !!window.ASSETS_READY;
  };

  let countdownActive = false;
  let countdownInterval = null;
  let timerHandle = null;

  const startGameAfterCountdown = async () => {
    if (countdownActive) return;
    countdownActive = true;

    try {
      if (window.AUDIO_CTX && window.AUDIO_CTX.state !== "running") {
        await window.AUDIO_CTX.resume();
      }
    } catch (_) {}

    const assetsReady = await waitAssets(60000);

    if (startHintEl) startHintEl.style.display = "none";
    if (countdownEl) {
      countdownEl.style.display = "block";
      let value = 3;
      countdownEl.textContent = String(value);

      countdownInterval = setInterval(() => {
        value -= 1;
        if (value > 0) {
          countdownEl.textContent = String(value);
          return;
        }

        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownEl.textContent = "¡Vamos!";

        setTimeout(() => {
          startScreenEl.style.display = "none";
          countdownEl.style.display = "none";
          countdownEl.textContent = "3";

          hudEl.style.display = "block";
          gameStartTimestamp = Date.now();
          scoreSubmitted = false;
          pendingScorePromise = null;
          init();
          animate();
          if (!timerHandle) {
            timerHandle = setInterval(() => {
              if (gameStarted && !isPaused) {
                timer++;
                timerEl.textContent = timer;
              }
            }, 1000);
          }

          if (!assetsReady) {
            console.warn("Assets did not finish loading in time. Using fallbacks where needed.");
            overlayEl.style.display = "none";
          }
        }, 450);
      }, 1000);
    }
  };

  const handleStartInteraction = () => {
    startGameAfterCountdown().catch((error) => console.error("Failed to start game:", error));
  };

  startScreenEl.addEventListener("click", handleStartInteraction, { once: false });
  startScreenEl.addEventListener("touchstart", handleStartInteraction, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    if (hitPauseUntil && now >= hitPauseUntil) {
      hitPauseUntil = 0;
    }
    isPaused = hitPauseUntil > 0;

    const delta = clock.getDelta();
    if (!isPaused && mixer) {
      mixer.update(delta);
    }

    if (!isPaused) {
      player.position.x += (lanes[targetLane] - player.position.x) * 0.2;

      if (isJumping) {
        player.position.y += yVelocity;
        yVelocity -= 0.01;
        if (player.position.y <= groundY) {
          player.position.y = groundY;
          isJumping = false;
        }
      }

      // Obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.position.z += speed * 50;
      if (obs.position.z > 10) {
        recycleObstacle(obs);
        continue;
      }
      if (
        Math.abs(player.position.z - obs.position.z) < (playerHalfDepth + 0.8) &&
        Math.abs(player.position.x - obs.position.x) < (playerHalfWidth + 0.8) &&
        Math.abs(player.position.y - (obs.position.y || groundY)) < (playerHalfHeight + 0.6)
      ) {
        // Hit + vida
        if (window.SFX) window.SFX.play("hit");
        lives--;
        livesEl.textContent = lives;
        triggerHitPause();

        // Si aún quedan vidas, reproduce "life" para feedback
        if (lives > 0 && window.SFX) setTimeout(() => window.SFX.play("life"), 60);

        recycleObstacle(obs);

        if (lives <= 0 && !scoreSubmitted) {
          scoreSubmitted = true;
          lives = 0;
          livesEl.textContent = lives;

          if (window.SFX) window.SFX.play("gameover");

          const goToRanking = () => {
            const target = (window.parent && window.parent !== window) ? window.parent : window;
            try {
              const origin = window.origin || (window.location.protocol + '//' + window.location.host);
              const basePath = (window.__APP_CONFIG__ && window.__APP_CONFIG__.basePath)
                || (function () {
                  const p = window.location.pathname || '';
                  const idx = p.indexOf('/game/');
                  return idx > -1 ? p.slice(0, idx) : '';
                })();
              const dest = origin + basePath + '/ranking/';
              target.location.href = dest;
            } catch (_) {
              target.location.href = 'https://www.pressstartevolution.com/tbwa/mexana/game-runner/ranking/';
            }
          };

          const endTimestamp = Date.now();
          try { console.info("[game] Game over. Submitting score..."); } catch(_) {}
          const scorePromise = submitGameScore(endTimestamp);
          pendingScorePromise = scorePromise
            ? scorePromise.catch((error) => {
                console.error("No se pudo registrar el puntaje:", error);
                throw error;
              })
            : null;

          setTimeout(async () => {
            alert(`Game Over!!\nScore: ${coinCount}`);
            if (pendingScorePromise && typeof pendingScorePromise.then === "function") {
              try {
                await pendingScorePromise;
              } catch (_) {
                // Error already logged above; continue to ranking.
              }
            }
            goToRanking();
          }, 250);
        }
      }
    }

    // Monedas
    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      if (coin.rotation) coin.rotation.y += 0.1;
      coin.position.z += speed * 50;
      if (coin.position.z > 10) {
        recycleCoin(coin);
        continue;
      }
      if (
        Math.abs(player.position.z - coin.position.z) < (playerHalfDepth + 0.8) &&
        Math.abs(player.position.x - coin.position.x) < (playerHalfWidth + 0.8) &&
        Math.abs(player.position.y - (coin.position.y || groundY)) < (playerHalfHeight + 0.6)
      ) {
        coinCount++;
        coinsEl.textContent = coinCount;
        if (window.SFX) window.SFX.play("coin");
        recycleCoin(coin);
      }
    }

      for (let seg of floorSegments) {
        seg.position.z += speed * 50;
        if (seg.position.z > 10) seg.position.z -= 200;
      }
      for (let bld of buildings) {
        bld.position.z += speed * 50;
        if (bld.position.z > 10) bld.position.z -= 200;
      }
    }

    renderer.render(scene, camera);
  }

  function init() {
    gameStarted = true;
    clock.start();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0b3fe6, 1);
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x0b3fe6);

    const ambientLight = new THREE.AmbientLight(0xfffbe6, 1.15);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xfff2cc, 1.1);
    sunLight.position.set(40, 60, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    for (let i = 0; i < 20; i++) {
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.1, 10),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      floor.position.z = -i * 10;
      floorSegments.push(floor);
      scene.add(floor);
    }

    const basePlayer = window.PLAYER_MODEL;
    if (basePlayer) {
      player = basePlayer;
      window.PLAYER_MODEL = null;
      scene.add(player);
      player.position.set(0, 0, 0);
      player.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(player);
      const size = bbox.getSize(new THREE.Vector3());
      playerHalfHeight = size.y / 2 || 0.5;
      playerHalfWidth = size.x / 2 || 0.5;
      playerHalfDepth = size.z / 2 || 0.5;
      groundY = bbox.min.y + playerHalfHeight;
      player.position.set(lanes[targetLane], groundY, 5);

      const clips =
        (player.animations && player.animations.length ? player.animations : window.PLAYER_ANIMATIONS) || [];
      if (clips.length > 0) {
        mixer = new THREE.AnimationMixer(player);
        const action = mixer.clipAction(clips[0]);
        action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      } else {
        console.warn("Player model loaded without animations.");
      }
    } else {
      player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      playerHalfHeight = 0.5;
      playerHalfWidth = 0.5;
      playerHalfDepth = 0.5;
      groundY = 0.5;
      player.position.set(lanes[targetLane], groundY, 5);
      scene.add(player);
    }

    camera.position.set(0, 3, 10);
    camera.lookAt(player.position);

    initializeObstacles();
    initializeCoins();
    generateCity();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Controles: teclado
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft" && targetLane > 0) {
        targetLane--;
        if (window.SFX) window.SFX.play("move");
      }
      if (e.code === "ArrowRight" && targetLane < 2) {
        targetLane++;
        if (window.SFX) window.SFX.play("move");
      }
      if (e.code === "ArrowUp" && !isJumping) {
        yVelocity = jumpVelocity;
        isJumping = true;
        if (window.SFX) window.SFX.play("jump");
      }
    });

    // Controles: touch (swipe)
    window.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });
    window.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30 && targetLane < 2) {
          targetLane++;
          if (window.SFX) window.SFX.play("move");
        } else if (dx < -30 && targetLane > 0) {
          targetLane--;
          if (window.SFX) window.SFX.play("move");
        }
      } else {
        if (dy < -30 && !isJumping) {
          yVelocity = jumpVelocity;
          isJumping = true;
          if (window.SFX) window.SFX.play("jump");
        }
      }
    });
  }

  // --- Generadores: usan tus helpers de assets ---
  function randomLaneX() {
    return lanes[Math.floor(Math.random() * lanes.length)];
  }

  function ensureUserData(node) {
    if (!node.userData || typeof node.userData !== "object") {
      node.userData = {};
    }
    return node.userData;
  }

  function createObstacleMesh() {
    const clone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("obstacles")
      : null;

    if (clone) {
      const data = ensureUserData(clone);
      if (data.baseY == null) {
        clone.position.set(0, 0, 0);
        clone.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(clone);
        const minY = bbox.min.y;
        const maxY = bbox.max.y;
        const align = isFinite(minY) ? -minY : 0;
        const height = isFinite(maxY) && isFinite(minY) ? maxY - minY : 1;
        data.baseY = align + height * 0.05 + 0.35;
      }
      return clone;
    }

    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    const data = ensureUserData(fallback);
    fallback.scale.set(1, 1, 1);
    data.baseY = 1.25;
    return fallback;
  }

  function createCoinMesh() {
    const clone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("coins")
      : null;

    if (clone) {
      const data = ensureUserData(clone);
      if (data.baseY == null) {
        clone.position.set(0, 0, 0);
        clone.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(clone);
        const minY = bbox.min.y;
        const maxY = bbox.max.y;
        const align = isFinite(minY) ? -minY : 0;
        const height = isFinite(maxY) && isFinite(minY) ? maxY - minY : 0.6;
        data.baseY = align + height * 0.25 + 0.6;
      }
      return clone;
    }

    const fallback = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    const data = ensureUserData(fallback);
    data.baseY = 0.85;
    return fallback;
  }

  function initializeObstacles() {
    obstacles.forEach((obs) => scene.remove(obs));
    obstacles.length = 0;
    let cursor = -40;

    for (let i = 0; i < OBSTACLE_POOL_SIZE; i++) {
      const obstacle = createObstacleMesh();
      const spacing = 35 + Math.random() * 25;
      cursor -= spacing;
      const baseY = obstacle.userData?.baseY ?? 1;
      obstacle.position.set(randomLaneX(), baseY, cursor);
      scene.add(obstacle);
      obstacles.push(obstacle);
    }
  }

  function initializeCoins() {
    coins.forEach((coin) => scene.remove(coin));
    coins.length = 0;
    let cursor = -20;

    for (let i = 0; i < COIN_POOL_SIZE; i++) {
      const coin = createCoinMesh();
      const spacing = 18 + Math.random() * 20;
      cursor -= spacing;
      const baseY = coin.userData?.baseY ?? 0.5;
      coin.position.set(randomLaneX(), baseY, cursor);
      if (coin.rotation) coin.rotation.set(0, 0, 0);
      scene.add(coin);
      coins.push(coin);
    }
  }

  function recycleObstacle(obstacle) {
    let farthestZ = Infinity;
    for (const other of obstacles) {
      if (other === obstacle) continue;
      if (other.position.z < farthestZ) farthestZ = other.position.z;
    }
    if (!isFinite(farthestZ)) farthestZ = -40;
    const spacing = 35 + Math.random() * 25;
    const newZ = farthestZ - spacing;
    obstacle.position.x = randomLaneX();
    obstacle.position.y = obstacle.userData?.baseY ?? 1;
    obstacle.position.z = newZ;
  }

  function recycleCoin(coin) {
    let farthestZ = Infinity;
    for (const other of coins) {
      if (other === coin) continue;
      if (other.position.z < farthestZ) farthestZ = other.position.z;
    }
    if (!isFinite(farthestZ)) farthestZ = -20;
    const spacing = 18 + Math.random() * 20;
    const newZ = farthestZ - spacing;
    coin.position.x = randomLaneX();
    coin.position.y = coin.userData?.baseY ?? 0.5;
    coin.position.z = newZ;
    if (coin.rotation) coin.rotation.set(0, 0, 0);
  }

  function getStoredSessionData() {
    try {
      if (!window.localStorage) return null;
      const raw = window.localStorage.getItem("session");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("No se pudo leer la sesión guardada:", error);
      return null;
    }
  }

  function toNumberOrZero(value) {
    if (value === null || value === undefined) return 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function buildScorePayload(endTimestamp) {
    const session = getStoredSessionData();
    const safeEnd = typeof endTimestamp === "number" ? endTimestamp : Date.now();
    const safeStart =
      typeof gameStartTimestamp === "number" && Number.isFinite(gameStartTimestamp)
        ? gameStartTimestamp
        : safeEnd;
    const duration = Math.max(0, safeEnd - safeStart);

    return {
      id_user_game: toNumberOrZero(session?.id_user_game),
      id_factura: toNumberOrZero(session?.id_factura),
      puntaje: coinCount,
      tiempo_jugado: duration,
      vidas_restantes: Math.max(0, lives),
      fecha_inicio: new Date(safeStart).toISOString(),
      fecha_fin: new Date(safeEnd).toISOString(),
    };
  }

  async function submitGameScore(endTimestamp) {
    if (typeof fetch !== "function") {
      return;
    }

    const payload = buildScorePayload(endTimestamp);
    try {
      console.info("[score] Submitting to:", SCORE_ENDPOINT);
      console.info("[score] Payload:", payload);
    } catch (_) {}

    try {
      const response = await fetch(SCORE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${BASIC_AUTH_TOKEN}`,
        },
        body: JSON.stringify(payload),
        credentials: "include",
        keepalive: true,
        cache: "no-store",
      });

      if (response.ok) {
        try { console.info("[score] Submitted OK"); } catch (_) {}
        return response;
      }

      const message = await response
        .text()
        .catch(() => "");

      if (message) {
        throw new Error(message);
      }

      throw new Error(`Error ${response.status} al registrar el puntaje.`);
    } catch (err) {
      try { console.error("[score] Submit failed:", err); } catch (_) {}
      throw err;
    }
  }

  function generateCity() {
    const sides = [-10, 10];
    const walkwayStart = -20;
    const walkwayEnd = -210;
    const walkwayStep = 12;
    const hasCity = typeof window.GET_RANDOM_ASSET_CLONE === "function";
    const hasScenery =
      hasCity && Array.isArray(window.ASSET_POOLS?.cityScenery) && window.ASSET_POOLS.cityScenery.length > 0;
    const hasBuildings =
      hasCity && Array.isArray(window.ASSET_POOLS?.cityBuildings) && window.ASSET_POOLS.cityBuildings.length > 0;

    // Continuous building rows
    if (hasCity && hasBuildings) {
      const buildingStart = -120;
      const buildingEnd = -380;
      const buildingStep = 16;
      for (let side of sides) {
        let cursor = buildingStart;
        while (cursor > buildingEnd) {
          let building = window.GET_RANDOM_ASSET_CLONE("cityBuildings");
          if (!building) break;
          building.position.set(0, 0, 0);
          building.rotation.set(0, 0, 0);
          building.updateMatrixWorld(true);
          const bbox = new THREE.Box3().setFromObject(building);
          const minY = bbox.min.y;
          building.position.y = isFinite(minY) ? -minY : 0;
          const lateralOffset = side < 0 ? -3.8 : 3.8;
          building.position.x = side + lateralOffset;
          building.position.z = cursor;
          building.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
          cursor -= buildingStep;
          scene.add(building);
          buildings.push(building);
        }
      }
    }

    // Foreground elements (trees, paraderos, etc.)
    for (let z = walkwayStart; z > walkwayEnd; z -= walkwayStep) {
      for (let side of sides) {
        let obj = null;
        if (hasScenery) {
          obj = window.GET_RANDOM_ASSET_CLONE("cityScenery");
        }
        if (!obj && hasCity) {
          obj = window.GET_RANDOM_ASSET_CLONE("city");
        }
        if (obj && obj.userData?.assetCategory === "building") {
          obj = null;
        }
        if (obj) {
          obj.position.set(0, 0, 0);
          obj.rotation.set(0, Math.random() * Math.PI * 2, 0);
          obj.updateMatrixWorld(true);
          const bbox = new THREE.Box3().setFromObject(obj);
          const minY = bbox.min.y;
          obj.position.y = isFinite(minY) ? -minY : 0;
          obj.position.x = side;
          obj.position.z = z;
          scene.add(obj);
          buildings.push(obj);
        } else {
          const h = Math.random() * 5 + 1;
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, h, 2),
            new THREE.MeshStandardMaterial({ color: 0x8888ff })
          );
          box.position.set(side, h / 2, z);
          scene.add(box);
          buildings.push(box);
        }
      }
    }
  }
})();
