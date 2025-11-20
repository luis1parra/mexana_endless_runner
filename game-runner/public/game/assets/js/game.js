
// Encapsulado
(() => {
  console.log("PLAYER_VARIANT from game.js", window.PLAYER_VARIANT);
  console.log("ENABLE_TUTORIAL from game.js", window.ENABLE_TUTORIAL);

  let scene, camera, renderer;
  let player, targetLane = 1;
  const obstacles = [], coins = [], lanes = [-2, 0, 2], buildings = [], floorSegments = [];
  const COIN_OBSTACLE_Z_GAP = 8;
  const COIN_OBSTACLE_LANE_TOLERANCE = 0.2;
  const COIN_PLACEMENT_MAX_ATTEMPTS = 6;
  const buildingRows = { left: [], right: [] };
  const BUILDING_GRID = 0.5;
  const BUILDING_START = -5;
  const BUILDING_END = -380;
  let streetSegmentLength = 20;
  let streetLoopLength = 200;
  const snapToGrid = (value, grid = BUILDING_GRID) => {
    if (!grid) return value;
    const scaled = value / grid;
    if (!Number.isFinite(scaled)) return value;
    return Math.round(scaled) * grid;
  };
  const snapBackToGrid = (value, grid = BUILDING_GRID) => {
    if (!grid) return value;
    if (!Number.isFinite(value)) return value;
    const snapped = snapToGrid(value, grid);
    if (snapped === value) return snapped;
    return snapped <= value ? snapped : snapped - grid;
  };
  const SPEED_MULTIPLIER =
    typeof window !== "undefined" && Number.isFinite(Number(window.SPEED_MULTIPLIER))
      ? Math.max(0.1, Number(window.SPEED_MULTIPLIER))
      : 1;
  const BASE_SPEED = 0.01 * SPEED_MULTIPLIER;//0.01
  const MAX_SPEED = 0.05 * SPEED_MULTIPLIER;
  const SPEED_ACCELERATION = 0.0001 * SPEED_MULTIPLIER;
  const ENABLE_TUTORIAL = typeof window !== "undefined" ? window.ENABLE_TUTORIAL !== false : true;
  let speed = ENABLE_TUTORIAL ? 0 : BASE_SPEED;
  let jumpVelocity = 0.2,
    isJumping = false,
    yVelocity = 0;
  let timer = 0, lives = 3, coinCount = 0;
  let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
  let gameStarted = false;
  let hitPauseUntil = 0;
  let isPaused = false;
  let hitFlashTimeout = null;
  const HIT_FLASH_CLASS = "hit-flash";
  const clock = new THREE.Clock();
  const TARGET_FRAME_RATE = 60;
  const MAX_DELTA_SECONDS = 0.1;
  let mixer = null;
  let groundY = 0.5;
  let playerHalfHeight = 0.5;
  let playerState = "run";
  let playerHalfWidth = 0.5;
  let playerHalfDepth = 0.5;
  let groundBottom = 0;
  let skyMesh = null;
  let streetFrontOffset = 0;
  let streetRecycleThreshold = 0;
  let streetRecycleShift = 0;
  let cloudMesh = null;
  const pickupEffects = [];
  const characterSaturationMaterials = new WeakSet();
  const characterSaturationUniforms = new Set();
  const CHARACTER_SATURATION_DEFAULT =
    typeof window !== "undefined" && Number.isFinite(Number(window.CHARACTER_SATURATION))
      ? Number(window.CHARACTER_SATURATION)
      : 1;
  let characterSaturationValue = CHARACTER_SATURATION_DEFAULT;
  const cameraLookTarget = new THREE.Vector3();
  let lookTargetBaseY = 0;
  const tempForwardVec = new THREE.Vector3();
  const SKY_TOP_COLOR = new THREE.Color(0x0b3fe6);
  const SKY_BOTTOM_COLOR = new THREE.Color(0x5aa8ff);
  const detectMobileUA = () => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  };
  const detectCoarsePointer = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    try {
      return window.matchMedia("(pointer: coarse)").matches;
    } catch (_) {
      return false;
    }
  };
  const resolveMobileFlag = () => {
    if (typeof window === "undefined") {
      return detectMobileUA();
    }
    if (window.IS_MOBILE_ENV !== undefined) {
      return !!window.IS_MOBILE_ENV;
    }
    return detectMobileUA() || detectCoarsePointer();
  };
  const IS_MOBILE_ENV = resolveMobileFlag();
  const MAX_PIXEL_RATIO = IS_MOBILE_ENV ? 1.5 : 2;
  const rawObstaclePool = Number(window.OBSTACLE_POOL_SIZE);
  const OBSTACLE_POOL_SIZE = Number.isFinite(rawObstaclePool)
    ? Math.max(0, rawObstaclePool)
    : (IS_MOBILE_ENV ? 3 : 5);
  const rawCoinPool = Number(window.COIN_POOL_SIZE);
  const COIN_POOL_SIZE = Number.isFinite(rawCoinPool)
    ? Math.max(0, rawCoinPool)
    : (IS_MOBILE_ENV ? 5 : 8);
  const LOAD_CITY_ASSETS =
    typeof window !== "undefined" ? window.LOAD_CITY_ASSETS !== false : true;
  const LOAD_BUILDINGS =
    typeof window !== "undefined" ? window.LOAD_BUILDINGS !== false : true;
  const LOAD_DECORATION =
    typeof window !== "undefined" ? window.LOAD_DECORATION !== false : true;
  const PLAYER_VARIANT =
    typeof window !== "undefined" ? window.PLAYER_VARIANT_RESOLVED || window.PLAYER_VARIANT || "boy" : "boy";

  const managedEvents = [];
  const managedIntervals = new Set();
  const managedTimeouts = new Set();
  let rafHandle = null;
  let cleanedUp = false;
  let rejectionCheckInterval = null;
  let rejectionActive = false;
  const CAMERA_SETTINGS = IS_MOBILE_ENV
    ? {
      height: 3.6,
      distance: 5.0,
      lookOffsetY: 2.25,
      lookOffsetZ: -0.45,
      followXFactor: 0.8,
    }
    : {
      height: 4.0,
      distance: 5.0,
      lookOffsetY: 2.25,
      lookOffsetZ: -0.6,
      followXFactor: 0.8,
    };
  lookTargetBaseY = groundY + CAMERA_SETTINGS.lookOffsetY;

  const supportsPassiveOptions = (() => {
    if (typeof window === "undefined") return false;
    let supported = false;
    try {
      const opts = Object.defineProperty({}, "passive", {
        get() {
          supported = true;
          return true;
        },
      });
      window.addEventListener("testPassive", null, opts);
      window.removeEventListener("testPassive", null, opts);
    } catch (_) { }
    return supported;
  })();
  
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
  const tutorialOverlayEl = document.getElementById("tutorialOverlay");
  const tutorialInstructionEl = document.getElementById("tutorialInstruction");
  const coinBannerEl = document.getElementById("coinBanner");
  const coinBannerImageEl = document.getElementById("coinBannerImage");
  const coinBannerTitleEl = document.getElementById("coinBannerTitle");
  const coinBannerPointsValueEl = document.getElementById("coinBannerPointsValue");
  const coinBannerPointsSuffixEl = document.getElementById("coinBannerPointsSuffix");
  const coinsProgressFill = document.getElementById("coinsProgressFill");
  const livesProgressFill = document.getElementById("livesProgressFill");

  if (IS_MOBILE_ENV && tutorialOverlayEl) {
    tutorialOverlayEl.classList.add("tutorial-overlay--mobile");
  }

  if (rejectionExitButtonEl) {
    rejectionExitButtonEl.addEventListener("click", () => {
      redirectToHome();
    });
  }

  const COIN_PROGRESS_TARGET = Number.isFinite(window.COIN_TARGET_SCORE) && window.COIN_TARGET_SCORE > 0
    ? Number(window.COIN_TARGET_SCORE)
    : 5000;
  const rawLivesMax = Number(window.LIVES_MAX);
  const LIVES_MAX = Number.isFinite(rawLivesMax) && rawLivesMax > 0 ? Math.floor(rawLivesMax) : 3;

  function applyProgress(fillEl, ratio) {
    if (!fillEl || !fillEl.parentElement) return;
    const normalized = Math.max(0, Math.min(1, ratio));
    fillEl.style.transform = `scaleX(${normalized})`;
    fillEl.style.opacity = normalized <= 0 ? "0" : "1";
  }

  function updateCoinProgress() {
    const ratio = COIN_PROGRESS_TARGET > 0 ? coinCount / COIN_PROGRESS_TARGET : 0;
    applyProgress(coinsProgressFill, ratio);
  }

  function updateLivesProgress() {
    const ratio = LIVES_MAX > 0 ? lives / LIVES_MAX : 0;
    applyProgress(livesProgressFill, ratio);
  }

  function frameSmoothingFactor(perFrameAlpha, deltaMultiplier) {
    if (!Number.isFinite(perFrameAlpha)) return 0;
    const clampedAlpha = Math.min(Math.max(perFrameAlpha, 0), 1);
    if (clampedAlpha === 0 || deltaMultiplier <= 0) return 0;
    if (clampedAlpha === 1) return 1;
    return 1 - Math.pow(1 - clampedAlpha, deltaMultiplier);
  }

  updateCoinProgress();
  updateLivesProgress();

  let tutorialActive = ENABLE_TUTORIAL;
  const tutorialSteps = tutorialActive ? ["jump", "right", "left"] : [];
  let tutorialStepIndex = 0;
  let coinBannerTimeout = null;

  const tutorialCopy = IS_MOBILE_ENV
    ? {
      jump: "Desliza hacia arriba con el dedo",
      right: "Desliza hacia la derecha con el dedo para esquivar obstáculos",
      left: "Desliza hacia la izquierda con el dedo para esquivar obstáculos",
      done: "¡Perfecto! Ahora empieza el juego.",
    }
    : {
      jump: "Presiona la flecha ↑ para saltar.",
      right: "Presiona la flecha → para esquivar obstáculos.",
      left: "Presiona la flecha ← para esquivar obstáculos.",
      done: "¡Perfecto! Ahora empieza el juego.",
    };
  const tutorialConfigs = {
    jump: {
      layout: "up",
      text: tutorialCopy.jump,
    },
    right: {
      layout: "right",
      text: tutorialCopy.right,
    },
    left: {
      layout: "left",
      text: tutorialCopy.left,
    },
    done: {
      layout: "up",
      text: tutorialCopy.done,
      hideArrow: true,
    },
  };
  const TUTORIAL_ARROW_SRC = "./assets/2d/flechaTutorial.png";

  function showTutorialOverlay(messageKey) {
    if (!tutorialOverlayEl || !tutorialInstructionEl) return;
    const config = tutorialConfigs[messageKey];
    if (!config) return;
    const layout = config.layout || "up";
    const classes = ["tutorial-card", `tutorial-card--${layout}`];
    tutorialInstructionEl.className = classes.join(" ");
    const arrowMarkup = config.hideArrow
      ? ""
      : `<img src="${TUTORIAL_ARROW_SRC}" alt="" class="tutorial-arrow tutorial-arrow--${layout}">`;
    tutorialInstructionEl.innerHTML = `${arrowMarkup}<p class="tutorial-text-block">${config.text}</p>`;
    tutorialOverlayEl.classList.add("tutorial-overlay--active");
  }

  function hideTutorialOverlay(delay = 0) {
    if (!tutorialOverlayEl) return;
    if (delay <= 0) {
      tutorialOverlayEl.classList.remove("tutorial-overlay--active");
      return;
    }
    setManagedTimeout(() => {
      tutorialOverlayEl.classList.remove("tutorial-overlay--active");
    }, delay);
  }

  function updateTutorialUI() {
    if (!tutorialActive) {
      hideTutorialOverlay();
      return;
    }
    const step = tutorialSteps[tutorialStepIndex];
    showTutorialOverlay(step);
  }

  function completeTutorial() {
    tutorialActive = false;
    showTutorialOverlay("done");
    setManagedTimeout(() => {
      hideTutorialOverlay();
      speed = 0;
      startSequenceTriggered = true;
      runCountdown(() => { }, BASE_SPEED);
    }, 800);
  }

  function registerTutorialAction(action) {
    if (!tutorialActive) return;
    const expected = tutorialSteps[tutorialStepIndex];
    if (expected !== action) return;
    tutorialStepIndex += 1;
    if (tutorialStepIndex >= tutorialSteps.length) {
      completeTutorial();
      return;
    }
    updateTutorialUI();
  }

  if (!tutorialActive) {
    hideTutorialOverlay();
  }

  if (typeof window !== "undefined") {
    addManagedEvent(window, "pagehide", cleanupGame);
    addManagedEvent(window, "beforeunload", cleanupGame);
  }

  const triggerHitPause = (duration = 700) => {
    hitPauseUntil = performance.now() + duration;
    isPaused = true;

    if (hitFlashTimeout) {
      clearTimeout(hitFlashTimeout);
      managedTimeouts.delete(hitFlashTimeout);
    }
    document.body.classList.add(HIT_FLASH_CLASS);
    hitFlashTimeout = setManagedTimeout(() => {
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

  let countdownRunning = false;
  let countdownInterval = null;
  let worldInitialized = false;
  let startSequenceTriggered = false;
  let timerHandle = null;

  function addManagedEvent(target, type, handler, options) {
    if (!target) return;
    const opt = options || {};
    const useOnce = typeof opt === "object" && !!opt.once;
    const useCapture = typeof opt === "object" ? !!opt.capture : !!opt;
    const usePassive = typeof opt === "object" ? !!opt.passive : false;

    let wrapped = handler;
    if (useOnce) {
      wrapped = function (event) {
        handler(event);
        try {
          target.removeEventListener(type, wrapped, supportsPassiveOptions ? { capture: useCapture } : useCapture);
        } catch (_) {
          try {
            target.removeEventListener(type, wrapped, useCapture);
          } catch (_) { }
        }
      };
    }

    let eventOptions;
    if (supportsPassiveOptions) {
      eventOptions = { capture: useCapture };
      if (usePassive) eventOptions.passive = true;
    } else {
      eventOptions = useCapture;
    }

    try {
      target.addEventListener(type, wrapped, eventOptions);
    } catch (err) {
      try {
        target.addEventListener(type, wrapped, useCapture);
      } catch (_) { }
    }

    managedEvents.push({
      target,
      type,
      handler: wrapped,
      options: supportsPassiveOptions ? eventOptions : useCapture,
    });
  }

  function removeManagedEvents() {
    for (const { target, type, handler, options } of managedEvents) {
      try {
        target.removeEventListener(type, handler, options);
      } catch (_) { }
    }
    managedEvents.length = 0;
  }

  function setManagedInterval(fn, delay) {
    const id = setInterval(fn, delay);
    managedIntervals.add(id);
    return id;
  }

  function clearManagedInterval(id) {
    if (id != null) {
      clearInterval(id);
      managedIntervals.delete(id);
    }
  }

  function clearAllIntervals() {
    for (const id of managedIntervals) {
      clearInterval(id);
    }
    managedIntervals.clear();
  }

  function setManagedTimeout(fn, delay) {
    const id = setTimeout(() => {
      managedTimeouts.delete(id);
      fn();
    }, delay);
    managedTimeouts.add(id);
    return id;
  }

  function clearManagedTimeout(id) {
    if (id != null) {
      clearTimeout(id);
      managedTimeouts.delete(id);
    }
  }

  function clearAllTimeouts() {
    for (const id of managedTimeouts) {
      clearTimeout(id);
    }
    managedTimeouts.clear();
  }

  function disposeObjectResources(object) {
    if (!object) return;
    const materials = new Set();
    const textures = new Set();
    object.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        if (child.geometry) {
          try {
            child.geometry.dispose();
          } catch (_) { }
        }
        const material = child.material;
        if (Array.isArray(material)) {
          material.forEach((mat) => materials.add(mat));
        } else if (material) {
          materials.add(material);
        }
      }
    });

    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.map) textures.add(mat.map);
      if (mat.normalMap) textures.add(mat.normalMap);
      if (mat.roughnessMap) textures.add(mat.roughnessMap);
      if (mat.metalnessMap) textures.add(mat.metalnessMap);
      if (mat.emissiveMap) textures.add(mat.emissiveMap);
      try {
        mat.dispose();
      } catch (_) { }
    });

    textures.forEach((tex) => {
      if (!tex) return;
      try {
        tex.dispose();
      } catch (_) { }
    });
  }

  function cleanupGame() {
    if (cleanedUp) return;
    cleanedUp = true;

    if (rafHandle) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }

    if (timerHandle) {
      clearManagedInterval(timerHandle);
      timerHandle = null;
    }

    clearAllIntervals();
    rejectionCheckInterval = null;
    rejectionRequestInFlight = null;
    clearAllTimeouts();
    coinBannerTimeout = null;
    if (coinBannerEl) {
      coinBannerEl.classList.remove("coin-banner--visible");
    }
    if (coinBannerImageEl) {
      coinBannerImageEl.removeAttribute("src");
      coinBannerImageEl.style.visibility = "hidden";
      coinBannerImageEl.alt = "";
    }
    if (coinBannerTitleEl) coinBannerTitleEl.textContent = "";
    if (coinBannerPointsValueEl) coinBannerPointsValueEl.textContent = "";
    if (coinBannerPointsSuffixEl) coinBannerPointsSuffixEl.textContent = "";
    removeManagedEvents();
    hitFlashTimeout = null;

    if (startScreenEl) {
      startScreenEl.onclick = null;
    }

    if (countdownInterval) {
      clearManagedInterval(countdownInterval);
      countdownInterval = null;
    }

    if (mixer) {
      try {
        mixer.stopAllAction();
      } catch (_) { }
      mixer = null;
    }

    for (let i = pickupEffects.length - 1; i >= 0; i--) {
      const effect = pickupEffects[i];
      if (effect.points) scene?.remove(effect.points);
      effect.geometry?.dispose?.();
      effect.material?.dispose?.();
    }
    pickupEffects.length = 0;

    if (cloudMesh) {
      scene?.remove(cloudMesh);
      cloudMesh.geometry.dispose();
      cloudMesh.material.dispose();
      cloudMesh = null;
    }

    disposeObjectResources(scene);

    obstacles.length = 0;
    coins.length = 0;
    buildings.length = 0;
    floorSegments.length = 0;
    buildingRows.left.length = 0;
    buildingRows.right.length = 0;

    if (renderer) {
      try {
        renderer.dispose();
        renderer.forceContextLoss?.();
      } catch (_) { }
      try {
        renderer.domElement?.remove();
      } catch (_) { }
      renderer = null;
    }

    scene = null;
    camera = null;
  }

  function initializeWorld() {
    if (worldInitialized) return;
    worldInitialized = true;
    if (startScreenEl) startScreenEl.style.display = "none";
    if (countdownEl) {
      countdownEl.style.display = "none";
      countdownEl.textContent = "3";
    }
    if (hudEl) hudEl.style.display = "block";
    coinCount = 0;
    coinsEl.textContent = coinCount;
    lives = Math.max(0, LIVES_MAX);
    livesEl.textContent = lives;
    updateCoinProgress();
    updateLivesProgress();
    gameStartTimestamp = Date.now();
    scoreSubmitted = false;
    pendingScorePromise = null;

    init();
    animate();
    if (!timerHandle) {
      timerHandle = setManagedInterval(() => {
        if (gameStarted && !isPaused) {
          timer++;
          timerEl.textContent = timer;
        }
      }, 1000);
    }
  }

  function runCountdown(onComplete, targetSpeed = BASE_SPEED) {
    if (countdownRunning) return;
    countdownRunning = true;
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const finish = () => {
      if (countdownEl) {
        countdownEl.style.display = "none";
        countdownEl.style.transform = "";
        countdownEl.style.left = "";
        countdownEl.style.top = "";
        countdownEl.style.textShadow = "";
        countdownEl.style.zIndex = "";
        countdownEl.style.position = "";
        countdownEl.style.opacity = "";
        countdownEl.style.transition = "";
        countdownEl.style.color = "";
        countdownEl.style.display = "none";
        countdownEl.textContent = "3";
      }
      speed = targetSpeed;
      countdownRunning = false;
      // if (!rejectionActive) {
      //   startRejectionPolling();
      // }
      if (typeof onComplete === "function") onComplete();
    };

    if (!countdownEl) {
      finish();
      return;
    }

    if (countdownEl.parentElement !== document.body) {
      document.body.appendChild(countdownEl);
    }

    countdownEl.style.position = "fixed";
    countdownEl.style.left = "50%";
    countdownEl.style.top = "40%";
    countdownEl.style.transform = "translate(-50%, -50%)";
    countdownEl.style.zIndex = "250";
    countdownEl.style.textShadow = "0 12px 35px rgba(0,0,0,0.55)";
    countdownEl.style.color = "#ffffff";

    let value = 3;
    countdownEl.textContent = String(value);
    countdownEl.style.display = "block";
    countdownEl.style.opacity = "1";
    countdownEl.style.transition = "opacity 0.2s, transform 1s";
    countdownEl.style.transform = "translate(-50%, -50%) scale(1)";

    countdownInterval = setManagedInterval(() => {
      value -= 1;
      if (value > 0) {
        countdownEl.textContent = String(value);
        return;
      }

      clearManagedInterval(countdownInterval);
      countdownInterval = null;
      countdownEl.textContent = "¡Vamos!";
      countdownEl.style.transform = "translate(-50%, -50%) scale(0.85)";

      setManagedTimeout(finish, 450);
    }, 1000);
  }

  const startGameAfterCountdown = async () => {
    if (startSequenceTriggered) return;
    startSequenceTriggered = true;
    rejectionActive = false;
    stopRejectionPolling();

    try {
      if (window.AUDIO_CTX && window.AUDIO_CTX.state !== "running") {
        await window.AUDIO_CTX.resume();
      }
    } catch (_) { }

    const assetsReady = await waitAssets(60000);

    if (startHintEl) startHintEl.style.display = "none";

    const originalSpeed = speed;
    speed = 0;

    initializeWorld();

    if (tutorialActive) {
      updateTutorialUI();
      if (!assetsReady) {
        console.warn("Assets did not finish loading in time. Using fallbacks where needed.");
        overlayEl.style.display = "none";
      }
      startSequenceTriggered = false;
      return;
    }

    runCountdown(() => {
      if (!assetsReady) {
        console.warn("Assets did not finish loading in time. Using fallbacks where needed.");
        overlayEl.style.display = "none";
      }
    }, originalSpeed || BASE_SPEED);
  };

  const handleStartInteraction = () => {
    startGameAfterCountdown().catch((error) => console.error("Failed to start game:", error));
  };

  const startEventConfig = [
    ["click", undefined],
    ["touchstart", { passive: true }],
    ["pointerdown", { passive: true }],
  ];
  if (startScreenEl) {
    for (const [type, opts] of startEventConfig) {
      addManagedEvent(startScreenEl, type, handleStartInteraction, opts);
    }
  }
  for (const [type, opts] of startEventConfig) {
    let docOpts;
    if (typeof opts === "object" && opts !== null) {
      docOpts = { ...opts, once: true };
    } else {
      docOpts = { once: true };
    }
    addManagedEvent(document, type, handleStartInteraction, docOpts);
  }

  function animate() {
    rafHandle = requestAnimationFrame(animate);
    const now = performance.now();
    if (hitPauseUntil && now >= hitPauseUntil) {
      hitPauseUntil = 0;
    }
    isPaused = (hitPauseUntil > 0) || rejectionActive;

    const delta = Math.min(clock.getDelta(), MAX_DELTA_SECONDS);
    if (!isPaused && mixer) {
      mixer.update(delta);
    }

    if (!isPaused) {
      const deltaMultiplier = delta * TARGET_FRAME_RATE;
      if (!tutorialActive && speed < MAX_SPEED) {
        speed = Math.min(MAX_SPEED, speed + SPEED_ACCELERATION * delta);
      }
      if (camera && player) {
        const desiredX = player.position.x * CAMERA_SETTINGS.followXFactor;
        const cameraFollowFactor = frameSmoothingFactor(0.2, deltaMultiplier);
        const cameraLagFactor = frameSmoothingFactor(0.08, deltaMultiplier);
        camera.position.x += (desiredX - camera.position.x) * cameraFollowFactor;
        camera.position.y += (CAMERA_SETTINGS.height - camera.position.y) * cameraLagFactor;
        camera.position.z += ((player.position.z + CAMERA_SETTINGS.distance) - camera.position.z) * cameraLagFactor;
        cameraLookTarget.set(
          player.position.x,
          lookTargetBaseY,
          player.position.z + CAMERA_SETTINGS.lookOffsetZ
        );
        camera.lookAt(cameraLookTarget);
      }

      if (skyMesh) {
        skyMesh.position.set(
          camera.position.x,
          camera.position.y + 30,
          camera.position.z - 400
        );
        skyMesh.rotation.set(0, 0, 0);
      }
      const laneLerp = frameSmoothingFactor(0.2, deltaMultiplier);
      if (player) {
        player.position.x += (lanes[targetLane] - player.position.x) * laneLerp;
      }

      if (isJumping && player) {
        player.position.y += yVelocity * deltaMultiplier;
        yVelocity -= 0.01 * deltaMultiplier;
        if (player.position.y <= groundY) {
          player.position.y = groundY;
          isJumping = false;
          const data = ensureUserData(player);
          const baseMin = data.baseMin ?? 0;
          groundBottom = groundY + baseMin;
        }
      }
      if (!isJumping && playerState === "jump") {
        const previousPosition = player ? player.position.clone() : null;
        const previousRotationY = player ? player.rotation.y : Math.PI;
        swapToRunModel(previousPosition, previousRotationY);
      }

      // Obstáculos
      const playerFeet = player.position.y - playerHalfHeight;
      const playerHead = player.position.y + playerHalfHeight;
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.position.z += speed * 50 * deltaMultiplier;
        if (obs.position.z > 10) {
          recycleObstacle(obs);
          continue;
        }
        const obsMinLocal = obs.userData?.hitMin ?? -0.2;
        const obsMaxLocal = obs.userData?.hitMax ?? (obsMinLocal + 1);
        const obsBottom = obsMinLocal + obs.position.y;
        const obsTop = obsMaxLocal + obs.position.y;
        const verticalOverlap = playerFeet <= obsTop && playerHead >= obsBottom;
        if (
          Math.abs(player.position.z - obs.position.z) < (playerHalfDepth + 0.8) &&
          Math.abs(player.position.x - obs.position.x) < (playerHalfWidth + 0.8) &&
          verticalOverlap
        ) {
          if (tutorialActive) {
            recycleObstacle(obs);
            continue;
          }
          // Hit + vida
          if (window.SFX) window.SFX.play("hit");
          lives--;
          livesEl.textContent = lives;
          updateLivesProgress();
          triggerHitPause();

          // Si aún quedan vidas, reproduce "life" para feedback
          if (lives > 0 && window.SFX)
            setManagedTimeout(() => window.SFX.play("life"), 60);

          recycleObstacle(obs);

          if (lives <= 0 && !scoreSubmitted) {
            if (mixer) mixer.stopAllAction();
            isJumping = false;
            swapToDeathModel();
            speed = 0;
            scoreSubmitted = true;
            lives = 0;
            livesEl.textContent = lives;
            updateLivesProgress();

            if (window.SFX) window.SFX.play("gameover");

            const goToRanking = () => {
              stopRejectionPolling();
              navigateToAppPath('/resultados/', 'https://www.pressstartevolution.com/tbwa/mexana/game-runner/resultados/');
            };

            const endTimestamp = Date.now();
            try { console.info("[game] Game over. Submitting score..."); } catch (_) { }
            const scorePromise = submitGameScore(endTimestamp);
            pendingScorePromise = scorePromise
              ? scorePromise.catch((error) => {
                console.error("No se pudo registrar el puntaje:", error);
                throw error;
              })
              : null;

            setManagedTimeout(async () => {
              if (pendingScorePromise && typeof pendingScorePromise.then === "function") {
                try {
                  await pendingScorePromise;
                } catch (_) {
                  // Error already logged above; continue to ranking.
                }
              }
              goToRanking();
            }, 2500);
          }
        }
      }

      // Monedas
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (coin.rotation) coin.rotation.y += 0.1 * deltaMultiplier;
        coin.position.z += speed * 50 * deltaMultiplier;
        // coin.position.z = 0;
        if (coin.position.z > 10) {
          recycleCoin(coin);
          continue;
        }
        const coinMinLocal = coin.userData?.hitMin ?? -0.2;
        const coinMaxLocal = coin.userData?.hitMax ?? (coinMinLocal + 0.5);
        const coinBottom = coinMinLocal + coin.position.y;
        const coinTop = coinMaxLocal + coin.position.y;
        const verticalCoinOverlap = playerFeet <= coinTop && playerHead >= coinBottom;
        if (
          Math.abs(player.position.z - coin.position.z) < (playerHalfDepth + 0.8) &&
          Math.abs(player.position.x - coin.position.x) < (playerHalfWidth + 0.8) &&
          verticalCoinOverlap
        ) {
          const value = Number.isFinite(coin.userData?.scoreValue) ? coin.userData.scoreValue : 1;
          coinCount += value;
          coinsEl.textContent = coinCount;
          updateCoinProgress();
          const hudImage = coin.userData?.hudImage;
          const hudTitle = coin.userData?.hudTitle || "Recompensa obtenida";
          const hudSubtitle = coin.userData?.hudSubtitle || "puntos";
          if (coinBannerEl) {
            if (coinBannerImageEl) {
              if (hudImage) {
                coinBannerImageEl.src = hudImage;
                coinBannerImageEl.style.visibility = "visible";
              } else {
                coinBannerImageEl.removeAttribute("src");
                coinBannerImageEl.style.visibility = "hidden";
              }
              coinBannerImageEl.alt = hudTitle;
            }
            if (coinBannerTitleEl) {
              coinBannerTitleEl.textContent = hudTitle;
            }
            if (coinBannerPointsValueEl) {
              coinBannerPointsValueEl.textContent = `+${value}`;
            }
            if (coinBannerPointsSuffixEl) {
              coinBannerPointsSuffixEl.textContent = hudSubtitle;
            }
            coinBannerEl.classList.add("coin-banner--visible");
            if (coinBannerTimeout) {
              clearManagedTimeout(coinBannerTimeout);
              coinBannerTimeout = null;
            }
            coinBannerTimeout = setManagedTimeout(() => {
              coinBannerEl.classList.remove("coin-banner--visible");
              coinBannerTimeout = null;
            }, 1600);
          }
          spawnCoinPickupEffect(coin.position.clone());
          if (window.SFX) window.SFX.play("coin");
          recycleCoin(coin);
        }
      }

      const recycleThreshold = streetRecycleThreshold || (streetFrontOffset + streetSegmentLength);
      const recycleShift = streetRecycleShift || (streetLoopLength + streetSegmentLength);
      for (let seg of floorSegments) {
        seg.position.z += speed * 50 * deltaMultiplier;
        if (seg.position.z > recycleThreshold) {
          seg.position.z -= recycleShift;
        }
      }
      for (let bld of buildings) {
        bld.position.z += speed * 50 * deltaMultiplier;
        if (bld.position.z > 10) {
          recycleBuilding(bld);
        }
      }
    }

    if (cloudMesh) {
      cloudMesh.position.set(
        camera.position.x,
        camera.position.y + 30,
        camera.position.z - 400
      );
      cloudMesh.rotation.set(0, 0, 0);
    }

    for (let i = pickupEffects.length - 1; i >= 0; i--) {
      const effect = pickupEffects[i];
      effect.elapsed += delta;
      const t = effect.elapsed / effect.duration;
      if (t >= 1) {
        scene.remove(effect.points);
        effect.geometry.dispose();
        effect.material.dispose();
        pickupEffects.splice(i, 1);
        continue;
      }
      const positions = effect.geometry.attributes.position.array;
      const velocities = effect.velocities;
      for (let j = 0; j < positions.length; j += 3) {
        velocities[j + 1] += effect.gravity * delta;
        positions[j] += velocities[j] * delta;
        positions[j + 1] += velocities[j + 1] * delta;
        positions[j + 2] += velocities[j + 2] * delta;
      }
      effect.geometry.attributes.position.needsUpdate = true;
      effect.material.opacity = effect.baseOpacity * (1 - t);
    }

    renderer.render(scene, camera);
  }

  function init() {

    gameStarted = true;
    clock.start();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1));
    renderer.setClearColor(SKY_BOTTOM_COLOR.getHex(), 1);
    document.body.appendChild(renderer.domElement);

    skyMesh = createSkyDome();
    scene.add(skyMesh);

    const ambientLight = new THREE.AmbientLight(0xfffbe6, 1.15);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xfff2cc, IS_MOBILE_ENV ? 0.8 : 1.1);
    sunLight.position.set(40, 60, 10);
    if (!IS_MOBILE_ENV) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 120;
      sunLight.shadow.camera.left = -50;
      sunLight.shadow.camera.right = 50;
      sunLight.shadow.camera.top = 50;
      sunLight.shadow.camera.bottom = -50;
    }
    scene.add(sunLight);

    new THREE.TextureLoader().load(
      "assets/2d/clouds.png",
      (texture) => {
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
          depthTest: true,
        });
        const geometry = new THREE.PlaneGeometry(250, 100);
        cloudMesh = new THREE.Mesh(geometry, material);
        cloudMesh.renderOrder = -5;
        scene.add(cloudMesh);
      },
      undefined,
      (error) => {
        console.warn("Failed to load clouds texture", error);
      }
    );

    const streetPool = window.ASSET_POOLS?.street || [];
    if (streetPool.length > 0 && typeof window.GET_RANDOM_ASSET_CLONE === "function") {
      const primary = window.GET_RANDOM_ASSET_CLONE("street");
      if (primary) {
        primary.position.set(0, 0, 0);
        primary.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(primary);
        const minY = bbox.min.y;
        if (isFinite(minY)) primary.position.y = -minY;

        streetSegmentLength = primary.userData?.streetLength || bbox.getSize(new THREE.Vector3()).z || 20;
        if (!Number.isFinite(streetSegmentLength) || streetSegmentLength <= 0) streetSegmentLength = 20;
        const segmentsNeeded = Math.max(12, Math.ceil(240 / streetSegmentLength));
        streetLoopLength = streetSegmentLength * segmentsNeeded;
        const frontOffset = streetSegmentLength * 0.5 + 5;
        streetFrontOffset = frontOffset;
        streetRecycleThreshold = frontOffset + streetSegmentLength;
        streetRecycleShift = streetLoopLength + streetSegmentLength;
        const extraSeg = window.GET_RANDOM_ASSET_CLONE("street");
        for (let i = 0; i < segmentsNeeded; i++) {
          const seg = i === 0 ? primary : window.GET_RANDOM_ASSET_CLONE("street");
          if (!seg) break;
          if (i !== 0) {
            seg.position.set(0, 0, 0);
            seg.updateMatrixWorld(true);
            const bboxSeg = new THREE.Box3().setFromObject(seg);
            const minYS = bboxSeg.min.y;
            if (isFinite(minYS)) seg.position.y = -minYS;

          }
          seg.position.z = frontOffset - i * streetSegmentLength;
          floorSegments.push(seg);
          scene.add(seg);
        }
        if (extraSeg) {
          extraSeg.position.set(0, 0, 0);
          extraSeg.updateMatrixWorld(true);
          const bboxExtra = new THREE.Box3().setFromObject(extraSeg);
          const minExtra = bboxExtra.min.y;
          if (isFinite(minExtra)) extraSeg.position.y = -minExtra;
          extraSeg.position.z = frontOffset + streetSegmentLength;
          floorSegments.push(extraSeg);
          scene.add(extraSeg);
        }
      }
    }

    const baseFill = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
    );
    baseFill.rotation.x = -Math.PI / 2;
    baseFill.position.set(0, -0.02, 0);
    baseFill.renderOrder = -1;
    scene.add(baseFill);

    if (floorSegments.length === 0) {
      const fallbackLength = 10;
      streetSegmentLength = fallbackLength;
      if (!Number.isFinite(streetSegmentLength) || streetSegmentLength <= 0) streetSegmentLength = 10;
      const segmentsNeeded = 20;
      streetLoopLength = streetSegmentLength * segmentsNeeded;
      const frontOffset = streetSegmentLength * 0.5 + 5;
      streetFrontOffset = frontOffset;
      streetRecycleThreshold = frontOffset + streetSegmentLength;
      streetRecycleShift = streetLoopLength + streetSegmentLength;
      const extraFloor = new THREE.Mesh(
        new THREE.BoxGeometry(fallbackLength * 2, 0.1, fallbackLength),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      extraFloor.position.z = frontOffset + streetSegmentLength;
      extraFloor.position.y = -0.02;
      floorSegments.push(extraFloor);
      scene.add(extraFloor);
      for (let i = 0; i < segmentsNeeded; i++) {
        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(fallbackLength * 2, 0.1, fallbackLength),
          new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        floor.position.z = frontOffset - i * streetSegmentLength;
        floor.position.y = -0.02;
        floorSegments.push(floor);
        scene.add(floor);
      }
    }

    const basePlayer = window.PLAYER_MODEL;
    if (basePlayer) {
      const runInstance = prepareModel(basePlayer, window.PLAYER_ANIMATIONS);
      if (runInstance) {
        scene.add(runInstance);
        player = runInstance;
        player.position.set(0, 0, 0);
        player.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(player);
        const size = bbox.getSize(new THREE.Vector3());
        const data = ensureUserData(player);
        const baseMin = data.baseMin ?? bbox.min.y;
        const baseHeight = data.baseHeight ?? size.y;
        playerHalfHeight = baseHeight / 2 || 0.5;
        playerHalfWidth = size.x / 2 || 0.5;
        playerHalfDepth = size.z / 2 || 0.5;
        groundY = -baseMin;
        player.position.set(lanes[targetLane], groundY, 5);
        groundBottom = player.position.y + baseMin;
        const defaultRot = data.defaultRotationY;
        if (Number.isFinite(defaultRot)) {
          player.rotation.y = defaultRot;
        }

        const clips =
          (player.animations && player.animations.length ? player.animations : window.PLAYER_ANIMATIONS) || [];
        if (clips.length > 0) {
          mixer = new THREE.AnimationMixer(player);
          const clipIndex = 0;
          const action = mixer.clipAction(clips[clipIndex]);
          console.log("Using animation clip", clipIndex, clips[clipIndex]?.name);
          action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
        } else {
          console.warn("Player model loaded without animations.");
        }
      }
    }
    if (!player) {
      player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
      playerHalfHeight = 0.5;
      playerHalfWidth = 0.5;
      playerHalfDepth = 0.5;
      groundY = 0.5;
      player.position.set(lanes[targetLane], groundY, 5);
      groundBottom = groundY - playerHalfHeight;
      scene.add(player);
    }

    camera.position.set(0, CAMERA_SETTINGS.height, CAMERA_SETTINGS.distance);
    cameraLookTarget.set(
      player.position.x,
      lookTargetBaseY,
      player.position.z + CAMERA_SETTINGS.lookOffsetZ
    );
    camera.lookAt(cameraLookTarget);

    initializeObstacles();
    initializeCoins();
    generateCity();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateCoinProgress();
      updateLivesProgress();
    };
    addManagedEvent(window, "resize", handleResize);

    // Controles: teclado
    const handleKeyDown = (e) => {
      if (e.code === "ArrowLeft" && targetLane > 0) {
        targetLane--;
        if (window.SFX) window.SFX.play("move");
        registerTutorialAction("left");
      }
      if (e.code === "ArrowRight" && targetLane < 2) {
        targetLane++;
        if (window.SFX) window.SFX.play("move");
        registerTutorialAction("right");
      }
      if (e.code === "ArrowUp" && !isJumping) {
        if (mixer) mixer.stopAllAction();
        yVelocity = jumpVelocity;
        isJumping = true;
        swapToJumpModel();
        if (window.SFX) window.SFX.play("jump");
        registerTutorialAction("jump");
      }
    };
    addManagedEvent(window, "keydown", handleKeyDown);

    // Controles: touch (swipe)
    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30 && targetLane < 2) {
          targetLane++;
          if (window.SFX) window.SFX.play("move");
          registerTutorialAction("right");
        } else if (dx < -30 && targetLane > 0) {
          targetLane--;
          if (window.SFX) window.SFX.play("move");
          registerTutorialAction("left");
        }
      } else {
        if (dy < -30 && !isJumping) {
          if (mixer) mixer.stopAllAction();
          yVelocity = jumpVelocity;
          isJumping = true;
          swapToJumpModel();
          if (window.SFX) window.SFX.play("jump");
          registerTutorialAction("jump");
        }
      }
    };
    addManagedEvent(window, "touchstart", handleTouchStart, { passive: true });
    addManagedEvent(window, "touchend", handleTouchEnd, { passive: true });
  }

  // --- Generadores: usan tus helpers de assets ---
  function randomLaneX() {
    return lanes[Math.floor(Math.random() * lanes.length)];
  }

  function laneHasObstacleConflict(laneX, targetZ) {
    if (!obstacles.length) return false;
    for (const obstacle of obstacles) {
      const pos = obstacle?.position;
      if (!pos) continue;
      if (Math.abs(pos.x - laneX) > COIN_OBSTACLE_LANE_TOLERANCE) continue;
      if (Math.abs(pos.z - targetZ) < COIN_OBSTACLE_Z_GAP) return true;
    }
    return false;
  }

  function leastBlockedLane(targetZ) {
    if (!obstacles.length) return randomLaneX();
    let bestLane = randomLaneX();
    let bestScore = -Infinity;
    for (const lane of lanes) {
      let nearest = Infinity;
      for (const obstacle of obstacles) {
        const pos = obstacle?.position;
        if (!pos) continue;
        if (Math.abs(pos.x - lane) > COIN_OBSTACLE_LANE_TOLERANCE) continue;
        const dz = Math.abs(pos.z - targetZ);
        if (dz < nearest) nearest = dz;
      }
      const score = Number.isFinite(nearest) ? nearest : Infinity;
      if (score > bestScore) {
        bestScore = score;
        bestLane = lane;
      }
    }
    return bestLane;
  }

  function computeSafeCoinPlacement(targetZ) {
    let z = targetZ;
    for (let attempt = 0; attempt < COIN_PLACEMENT_MAX_ATTEMPTS; attempt++) {
      const safeLanes = lanes.filter((lane) => !laneHasObstacleConflict(lane, z));
      if (safeLanes.length) {
        const x = safeLanes[Math.floor(Math.random() * safeLanes.length)];
        return { x, z };
      }
      z -= COIN_OBSTACLE_Z_GAP;
    }
    return { x: leastBlockedLane(z), z };
  }

  function ensureUserData(node) {
    if (!node.userData || typeof node.userData !== "object") {
      node.userData = {};
    }
    return node.userData;
  }

  function enableCharacterMaterialSaturation(material) {
    if (!material || characterSaturationMaterials.has(material)) return;
    characterSaturationMaterials.add(material);

    const uniform = { value: characterSaturationValue };
    characterSaturationUniforms.add(uniform);

    const prevOnBeforeCompile = typeof material.onBeforeCompile === "function" ? material.onBeforeCompile.bind(material) : null;

    material.onBeforeCompile = function onBeforeCompile(shader, ...args) {
      if (prevOnBeforeCompile) {
        prevOnBeforeCompile(shader, ...args);
      }
      shader.uniforms.characterSaturation = uniform;
      if (!shader.fragmentShader.includes("characterSaturation")) {
        if (shader.fragmentShader.includes("uniform float opacity;")) {
          shader.fragmentShader = shader.fragmentShader.replace(
            "uniform float opacity;",
            "uniform float opacity;\nuniform float characterSaturation;"
          );
        } else {
          shader.fragmentShader = `uniform float characterSaturation;\n${shader.fragmentShader}`;
        }
        const mapInclude = "#include <map_fragment>";
        const handler = `#include <map_fragment>
        {
          float cSatGray = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = mix(vec3(cSatGray), diffuseColor.rgb, characterSaturation);
        }`;
        if (shader.fragmentShader.indexOf(mapInclude) !== -1) {
          shader.fragmentShader = shader.fragmentShader.replace(mapInclude, handler);
        } else {
          const fallbackToken = "vec4 diffuseColor = vec4( diffuse, opacity );";
          shader.fragmentShader = shader.fragmentShader.replace(
            fallbackToken,
            `${fallbackToken}
        {
          float cSatGray = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = mix(vec3(cSatGray), diffuseColor.rgb, characterSaturation);
        }`
          );
        }

        const saturationPost = `{
        float cSatGrayFinal = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor.rgb = mix(vec3(cSatGrayFinal), gl_FragColor.rgb, characterSaturation);
      }`;
        if (!shader.fragmentShader.includes("cSatGrayFinal")) {
          if (shader.fragmentShader.indexOf("#include <tonemapping_fragment>") !== -1) {
            shader.fragmentShader = shader.fragmentShader.replace("#include <tonemapping_fragment>", `${saturationPost}\n      #include <tonemapping_fragment>`);
          } else if (shader.fragmentShader.indexOf("#include <encodings_fragment>") !== -1) {
            shader.fragmentShader = shader.fragmentShader.replace("#include <encodings_fragment>", `${saturationPost}\n      #include <encodings_fragment>`);
          } else {
            shader.fragmentShader += `\n      ${saturationPost}`;
          }
        }
      }
    };

    const data = ensureUserData(material);
    data.characterSaturationUniform = uniform;
    material.needsUpdate = true;
  }

  function applyCharacterSaturationToObject(root) {
    if (!root || typeof root.traverse !== "function") return;
    root.traverse((child) => {
      if (!child || (!child.isMesh && !child.isSkinnedMesh)) return;
      const { material } = child;
      if (Array.isArray(material)) {
        for (const mat of material) enableCharacterMaterialSaturation(mat);
      } else {
        enableCharacterMaterialSaturation(material);
      }
    });
  }

  function setCharacterSaturation(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    characterSaturationValue = numeric;
    for (const uniform of characterSaturationUniforms) {
      uniform.value = characterSaturationValue;
    }
  }

  function getCharacterSaturation() {
    return characterSaturationValue;
  }

  if (typeof window !== "undefined") {
    if (typeof window.SET_CHARACTER_SATURATION !== "function") {
      window.SET_CHARACTER_SATURATION = setCharacterSaturation;
    }
    if (typeof window.GET_CHARACTER_SATURATION !== "function") {
      window.GET_CHARACTER_SATURATION = getCharacterSaturation;
    }
  }

  function prepareModel(template, animations) {
    if (!template) return null;
    const data = ensureUserData(template);
    template.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material && "skinning" in child.material) {
          child.material.skinning = true;
        }
        if (child.isSkinnedMesh) {
          child.frustumCulled = false;
        }
        if (child.geometry && !child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
      }
    });

    const clips =
      (animations && animations.length
        ? animations
        : template.animations || data.animations || template.userData?.animations || []);
    template.animations = clips;
    data.animations = clips;
    template.userData.animations = clips;
    if (typeof data.defaultRotationY !== "number" && typeof template.rotation?.y === "number") {
      data.defaultRotationY = template.rotation.y;
    }

    const bbox = new THREE.Box3().setFromObject(template);
    const size = bbox.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y === 0) {
      size.y = 1;
    }
    data.baseMin = data.baseMin ?? bbox.min.y;
    data.baseMax = data.baseMax ?? bbox.max.y;
    data.baseHeight = data.baseHeight ?? (bbox.max.y - bbox.min.y || size.y);

    applyCharacterSaturationToObject(template);
    return template;
  }

  function createSkyDome() {
    const radius = 500;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    geometry.scale(-1, 1, 1);
    const positionAttr = geometry.getAttribute("position");
    const colors = new Float32Array(positionAttr.count * 3);

    for (let i = 0; i < positionAttr.count; i++) {
      const y = positionAttr.getY(i);
      const t = THREE.MathUtils.clamp((y + radius) / (2 * radius), 0, 1);
      const color = SKY_BOTTOM_COLOR.clone().lerp(SKY_TOP_COLOR, t);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      vertexColors: true,
      depthWrite: false,
    });
    const dome = new THREE.Mesh(geometry, material);
    dome.name = "SkyDome";
    return dome;
  }

  function createObstacleMesh() {
    const clone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("obstacles")
      : null;

    if (clone) {
      const data = ensureUserData(clone);
      clone.position.set(0, 0, 0);
      clone.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(clone);
      const minY = bbox.min.y;
      const maxY = bbox.max.y;
      const align = isFinite(minY) ? -minY : 0;
      const desiredBottom = 0.02;
      data.baseY = align + desiredBottom;
      data.hitMin = minY;
      data.hitMax = maxY;
      return clone;
    }

    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    const data = ensureUserData(fallback);
    fallback.scale.set(1, 1, 1);
    fallback.position.set(0, 0, 0);
    fallback.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(fallback);
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const desiredBottom = 0.02;
    data.baseY = (isFinite(minY) ? -minY : 0) + desiredBottom;
    data.hitMin = minY;
    data.hitMax = maxY;
    return fallback;
  }

  function createCoinMesh() {
    const clone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("coins")
      : null;

    if (clone) {
      const data = ensureUserData(clone);
      clone.position.set(0, 0, 0);
      clone.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(clone);
      const minY = bbox.min.y;
      const maxY = bbox.max.y;
      const align = isFinite(minY) ? -minY : 0;
      const desiredBottom = 0.35;
      data.baseY = align + desiredBottom;
      data.hitMin = minY;
      data.hitMax = maxY;
      return clone;
    }

    const fallback = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    const data = ensureUserData(fallback);
    fallback.position.set(0, 0, 0);
    fallback.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(fallback);
    const minY = bbox.min.y;
    const maxY = bbox.max.y;
    const desiredBottom = 0.35;
    data.baseY = (isFinite(minY) ? -minY : 0) + desiredBottom;
    data.hitMin = minY;
    data.hitMax = maxY;
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
      const placement = computeSafeCoinPlacement(cursor);
      coin.position.set(placement.x, baseY, placement.z);
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
    const placement = computeSafeCoinPlacement(newZ);
    coin.position.x = placement.x;
    coin.position.y = coin.userData?.baseY ?? 0.5;
    coin.position.z = placement.z;
    if (coin.rotation) coin.rotation.set(0, 0, 0);
  }

  function recycleBuilding(building) {
    const data = ensureUserData(building);
    const category = data.assetCategory || "building";
    const side = data.streetSide ?? 0;
    const depth = data.buildingDepth ?? 14;
    const gap = data.streetGap ?? 1.5;
    const storedOffsetX = Number(data.streetOffsetX);
    const streetWidth = Number.isFinite(data.streetWidth) ? data.streetWidth : depth;
    const streetMargin = Number.isFinite(data.streetMarginX) ? data.streetMarginX : 1.5;
    const halfWidth = Math.max(1, streetWidth / 2);
    const computedOffset =
      side + (side < 0 ? -(halfWidth + streetMargin) : (halfWidth + streetMargin));
    const offsetX = Number.isFinite(storedOffsetX) ? storedOffsetX : snapToGrid(computedOffset);
    const rotationY = data.streetRotation ?? (side < 0 ? Math.PI : 0);

    if (category !== "building") {
      let farthestFront = Infinity;
      for (const other of buildings) {
        if (other === building) continue;
        const otherData = ensureUserData(other);
        if ((otherData.assetCategory || "building") !== category) continue;
        if ((otherData.streetSide ?? 0) !== side) continue;
        const otherDepth = otherData.buildingDepth ?? depth;
        const otherFrontRaw = otherData.streetFront ?? (other.position.z + otherDepth / 2);
        const otherFront = snapBackToGrid(otherFrontRaw);
        if (otherFront < farthestFront) farthestFront = otherFront;
      }

      if (!isFinite(farthestFront)) {
        farthestFront = snapBackToGrid(data.streetFront ?? -20);
      }

      //const newFrontRaw = farthestFront; //- (depth + gap);
      const spacing = Math.max(1, gap/1.5);
      const newFrontRaw = farthestFront - (depth + spacing);

      const newFront = snapBackToGrid(newFrontRaw);
      const centerZ = snapToGrid(newFront - depth / 2);
      building.position.z = centerZ;
      building.rotation.y = rotationY;
      building.position.x = offsetX;

      const updated = ensureUserData(building);
      updated.streetFront = newFront;
      updated.streetSide = side;
      updated.buildingDepth = depth;
      updated.streetGap = gap;
      updated.streetRotation = rotationY;
      updated.streetOffsetX = offsetX;
      updated.assetCategory = category;
      updated.streetWidth = streetWidth;
      updated.streetMarginX = streetMargin;

      building.updateMatrixWorld(true);
      return;
    }

    const row = side < 0 ? buildingRows.left : buildingRows.right;
    if (!row.includes(building)) row.push(building);

    let farthestFront = Infinity;
    for (const other of row) {
      if (other === building) continue;
      const otherData = ensureUserData(other);
      const otherDepth = otherData.buildingDepth ?? depth;
      const otherFrontRaw = otherData.streetFront ?? (other.position.z + otherDepth / 2);
      const otherFront = snapBackToGrid(otherFrontRaw);
      if (otherFront < farthestFront) farthestFront = otherFront;
    }

    if (!isFinite(farthestFront)) {
      farthestFront = snapBackToGrid(data.streetFront ?? -20);
    }

    
    const spacing = Math.max(1, gap);
    //const newFrontRaw = farthestFront  - (depth + spacing);
    const newFrontRaw = farthestFront; //- (depth + gap);
    const newFront = snapBackToGrid(newFrontRaw);
    const centerZ = snapToGrid(newFront - depth / 2);

    building.position.z = centerZ;
    building.rotation.y = rotationY;
    building.position.x = offsetX;

    const updated = ensureUserData(building);
    //updated.streetFront = newFront;
    updated.streetFront = snapBackToGrid(centerZ + depth / 2);
    updated.streetSide = side;
    updated.buildingDepth = depth;
    updated.streetGap = gap;
    updated.streetRotation = rotationY;
    updated.streetOffsetX = offsetX;
    updated.assetCategory = category;
    updated.streetWidth = streetWidth;
    updated.streetMarginX = streetMargin;

    building.updateMatrixWorld(true);
  }


  function spawnCoinPickupEffect(position) {
    if (!scene) return;
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = position.x;
      positions[idx + 1] = position.y + 0.5;
      positions[idx + 2] = position.z;

      const theta = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 1.5;
      velocities[idx] = Math.cos(theta) * speed;
      velocities[idx + 1] = 3 + Math.random() * 1.5;
      velocities[idx + 2] = Math.sin(theta) * speed;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x4faeff,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    material.depthTest = false;

    const points = new THREE.Points(geometry, material);
    points.renderOrder = 15;
    scene.add(points);

    pickupEffects.push({
      points,
      geometry,
      material,
      velocities,
      elapsed: 0,
      duration: 0.6,
      baseOpacity: material.opacity,
      gravity: -10,
    });
  }

  function swapToDeathModel() {
    const deathTemplate = window.PLAYER_DEATH_MODEL;
    playerState = "death";
    if (!deathTemplate || !scene) {
      return;
    }
    const deathAnimations = window.PLAYER_DEATH_ANIMATIONS || deathTemplate.animations || deathTemplate.userData?.animations || [];
    const previousPosition = player ? player.position.clone() : new THREE.Vector3(0, groundY, 5);
    const previousRotationY = player ? player.rotation.y : Math.PI;

    if (player) {
      scene.remove(player);
    }

    const deathInstance = prepareModel(deathTemplate, deathAnimations);
    if (!deathInstance) {
      swapToRunModel(previousPosition, previousRotationY);
      return;
    }
    scene.add(deathInstance);
    player = deathInstance;
    player.position.copy(previousPosition);
    if (previousRotationY !== undefined) {
      player.rotation.y = previousRotationY;
    } else {
      const defaultRot = ensureUserData(player).defaultRotationY;
      if (Number.isFinite(defaultRot)) player.rotation.y = defaultRot;
    }

    const bbox = new THREE.Box3().setFromObject(player);
    const size = bbox.getSize(new THREE.Vector3());
    const data = ensureUserData(player);
    const baseMin = data.baseMin ?? bbox.min.y;
    const baseHeight = data.baseHeight ?? size.y;
    playerHalfHeight = baseHeight / 2 || playerHalfHeight;
    playerHalfWidth = size.x / 2 || playerHalfWidth;
    playerHalfDepth = size.z / 2 || playerHalfDepth;
    const targetGround = previousPosition ? previousPosition.y : (groundBottom - baseMin);
    player.position.y = targetGround;
    groundY = targetGround;
    groundBottom = groundY + baseMin;

    hitPauseUntil = 0;
    isPaused = false;
    playerState = "death";

    mixer = new THREE.AnimationMixer(player);
    if (deathAnimations.length) {
      const action = mixer.clipAction(deathAnimations[0]);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      mixer.update(0.001);
    }
  }

  function swapToJumpModel() {
    const jumpTemplate = window.PLAYER_JUMP_MODEL;
    playerState = "jump";
    if (!jumpTemplate || !scene) {
      return;
    }
    const jumpAnimations = window.PLAYER_JUMP_ANIMATIONS || jumpTemplate.animations || jumpTemplate.userData?.animations || [];
    const previousPosition = player ? player.position.clone() : new THREE.Vector3(0, groundY, 5);
    const previousRotationY = player ? player.rotation.y : Math.PI;

    if (player) {
      scene.remove(player);
    }

    const jumpInstance = prepareModel(jumpTemplate, jumpAnimations);
    if (!jumpInstance) {
      swapToRunModel(previousPosition, previousRotationY);
      return;
    }
    scene.add(jumpInstance);
    player = jumpInstance;
    player.position.copy(previousPosition);
    if (previousRotationY !== undefined) {
      player.rotation.y = previousRotationY;
    } else {
      const defaultRot = ensureUserData(player).defaultRotationY;
      if (Number.isFinite(defaultRot)) player.rotation.y = defaultRot;
    }

    const bbox = new THREE.Box3().setFromObject(player);
    const size = bbox.getSize(new THREE.Vector3());
    const data = ensureUserData(player);
    const baseMin = data.baseMin ?? bbox.min.y;
    const baseHeight = data.baseHeight ?? size.y;
    playerHalfHeight = baseHeight / 2 || playerHalfHeight;
    playerHalfWidth = size.x / 2 || playerHalfWidth;
    playerHalfDepth = size.z / 2 || playerHalfDepth;
    const targetGround = previousPosition ? previousPosition.y : (groundBottom - baseMin);
    player.position.y = targetGround;
    groundY = targetGround;
    groundBottom = groundY + baseMin;

    mixer = new THREE.AnimationMixer(player);
    if (jumpAnimations.length) {
      const action = mixer.clipAction(jumpAnimations[0]);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      mixer.update(1 / 60);
    }
  }

  function swapToRunModel(previousPosition, previousRotationY) {
    const runTemplate = window.PLAYER_MODEL;
    playerState = "run";
    if (!runTemplate || !scene) {
      return;
    }
    const runAnimations = window.PLAYER_ANIMATIONS || runTemplate.animations || runTemplate.userData?.animations || [];

    const runInstance = prepareModel(runTemplate, runAnimations);
    if (!runInstance) {
      return;
    }

    if (player && player !== runInstance) {
      scene.remove(player);
    }

    scene.add(runInstance);
    player = runInstance;
    if (previousPosition) {
      player.position.copy(previousPosition);
    }
    if (previousRotationY !== undefined) {
      player.rotation.y = previousRotationY;
    } else {
      const defaultRot = ensureUserData(player).defaultRotationY;
      if (Number.isFinite(defaultRot)) player.rotation.y = defaultRot;
    }

    const bbox = new THREE.Box3().setFromObject(player);
    const size = bbox.getSize(new THREE.Vector3());
    const data = ensureUserData(player);
    const baseMin = data.baseMin ?? bbox.min.y;
    const baseHeight = data.baseHeight ?? size.y;
    playerHalfHeight = baseHeight / 2 || playerHalfHeight;
    playerHalfWidth = size.x / 2 || playerHalfWidth;
    playerHalfDepth = size.z / 2 || playerHalfDepth;
    const targetGround = previousPosition ? previousPosition.y : (groundBottom - baseMin);
    player.position.y = targetGround;
    groundY = targetGround;
    groundBottom = groundY + baseMin;

    hitPauseUntil = 0;
    isPaused = false;

    mixer = new THREE.AnimationMixer(player);
    if (runAnimations.length) {
      const action = mixer.clipAction(runAnimations[0]);
      action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      mixer.update(0.001);
    }
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

  function navigateToAppPath(path, fallbackUrl) {
    const target = window.parent && window.parent !== window ? window.parent : window;
    try {
      const origin = window.origin || (window.location.protocol + "//" + window.location.host);
      const basePath = (window.__APP_CONFIG__ && window.__APP_CONFIG__.basePath)
        || (function () {
          const p = window.location.pathname || "";
          const idx = p.indexOf("/game/");
          return idx > -1 ? p.slice(0, idx) : "";
        })();
      const dest = origin + basePath + path;
      target.location.href = dest;
    } catch (_) {
      target.location.href = fallbackUrl;
    }
  }

  function redirectToHome() {
    navigateToAppPath("/", "https://www.pressstartevolution.com/tbwa/mexana/");
  }

  function stopRejectionPolling() {
    if (rejectionCheckInterval != null) {
      clearManagedInterval(rejectionCheckInterval);
      rejectionCheckInterval = null;
    }
  }


  async function submitGameScore(endTimestamp) {
    const payload = buildScorePayload(endTimestamp);

    try {
      const parentWin = (window.parent && window.parent !== window) ? window.parent : null;
      if (parentWin && typeof parentWin.__submitScore === "function") {
        try {
          console.info("[score] Submitting via app bridge");
          console.info("[score] Payload:", payload);
        } catch (_) { }
        const result = await parentWin.__submitScore(payload);
        try { console.info("[score] Bridge submission OK"); } catch (_) { }
        return result;
      }
    } catch (_) { }
  }

  function generateCity() {
    const sides = [-10, 10];
    const walkwayStart = -10;
    const walkwayEnd = -210;
    const walkwayStep = 12;
    const minGap = 1.5;
    const tempVec = new THREE.Vector3();
    const tempBox = new THREE.Box3();
    const hasCity =
      LOAD_CITY_ASSETS &&
      typeof window.GET_RANDOM_ASSET_CLONE === "function";
    const hasScenery =
      LOAD_DECORATION &&
      hasCity &&
      Array.isArray(window.ASSET_POOLS?.cityScenery) &&
      window.ASSET_POOLS.cityScenery.length > 0;
    const hasBuildings =
      LOAD_BUILDINGS &&
      hasCity &&
      Array.isArray(window.ASSET_POOLS?.cityBuildings) &&
      window.ASSET_POOLS.cityBuildings.length > 0;

    const spawnBuildingSegment = (side, frontZ) => {
      const clone = window.GET_RANDOM_ASSET_CLONE("cityBuildings");
      if (!clone) return null;

      clone.userData = { ...(clone.userData || {}) };
      clone.position.set(0, 0, 0);
      clone.rotation.set(0, 0, 0);

      let rotationY = side < 0 ? 0 : Math.PI;
      const defaultRot = clone.userData?.defaultRotationY;
      if (clone.userData?.assetCategory !== "building" && Number.isFinite(defaultRot)) {
        clone.rotation.y = defaultRot;
        rotationY = clone.rotation.y;
      } else {
        clone.rotation.y = rotationY;
      }

      clone.updateMatrixWorld(true);
      const bbox = tempBox.setFromObject(clone);
      const size = bbox.getSize(tempVec);
      const rawDepth = clone.userData?.buildingDepth ?? (size.z || size.x || 14);
      const depth = Math.max(4, rawDepth);
      const minY = bbox.min.y;

      clone.position.y = Number.isFinite(minY) ? -minY : 0;
      const manualOffsetX = Number(clone.userData?.streetOffsetX);
      const baseMargin = Number.isFinite(clone.userData?.streetMarginX)
        ? clone.userData.streetMarginX
        : 1.5;
      const width = Number.isFinite(size.x) ? size.x : depth;
      const halfWidth = Math.max(1, width / 2);
      const computedOffset =
        side + (side < 0 ? -(halfWidth + baseMargin) : (halfWidth + baseMargin));
      const offsetX = Number.isFinite(manualOffsetX)
        ? manualOffsetX
        : snapToGrid(computedOffset);
      clone.position.x = offsetX;

      const placedFront = snapBackToGrid(frontZ);
      const zCenter = snapToGrid(placedFront - depth / 2);
      clone.position.z = zCenter;

      const data = ensureUserData(clone);
      data.streetSide = side;
      data.buildingDepth = depth;
      data.streetGap = minGap;
      data.streetRotation = clone.rotation.y;
      data.streetOffsetX = offsetX;
      data.streetFront = snapBackToGrid(zCenter + depth / 2);
      data.assetCategory = "building";
      data.streetGrid = BUILDING_GRID;
      data.streetWidth = width;
      data.streetMarginX = baseMargin;

      scene.add(clone);
      buildings.push(clone);
      const row = side < 0 ? buildingRows.left : buildingRows.right;
      row.push(clone);

      const nextFrontRaw = data.streetFront - (depth + minGap);
      const nextFront = snapBackToGrid(nextFrontRaw);
      if (!Number.isFinite(nextFront)) return null;
      return nextFront;
    };

    // Continuous building rows
    if (hasCity && hasBuildings) {
      buildingRows.left.length = 0;
      buildingRows.right.length = 0;

      const estimatedStep = walkwayStep;
      const segments = Math.ceil((BUILDING_START - BUILDING_END) / estimatedStep) + 4;

      for (const side of sides) {
        let frontZ = snapBackToGrid(BUILDING_START);
        for (let i = 0; i < segments; i += 1) {
          if (frontZ < BUILDING_END - estimatedStep) break;
          const lateralOffset = side < 0 ? 5 : -5;
          const nextFront = spawnBuildingSegment(side + lateralOffset, frontZ);
          if (!Number.isFinite(nextFront)) break;
          if (nextFront >= frontZ) break;
          frontZ = nextFront;
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
          obj.userData = { ...(obj.userData || {}) };
          obj.position.set(0, 0, 0);
          obj.rotation.set(0, 0, 0);
          const rotationY = side < 0 ? -Math.PI / 2 : Math.PI / 2;
          obj.rotation.y = rotationY;
          const data = ensureUserData(obj);
          const defaultRot = data.defaultRotationY;
          if (Number.isFinite(defaultRot)) {
            obj.rotation.y = defaultRot;
          }

          obj.updateMatrixWorld(true);
          const bbox = tempBox.setFromObject(obj);
          const size = bbox.getSize(tempVec);
          const depth = Math.max(2, obj.userData?.buildingDepth || size.z || size.x || 2);
          const minY = bbox.min.y;
          obj.position.y = isFinite(minY) ? -minY : 0;
          let lateralOffset = side < 0 ? 5 : -5;

          if (data.cityKey === "citylamppost.fbx") {
            const lampRot = side < 0 ? -Math.PI / 2 : Math.PI / 2;
            obj.rotation.y = lampRot;
            data.defaultRotationY = lampRot;
            lateralOffset = side < 0 ? 7 : -7;
          }
          const offsetX = side + lateralOffset;
          obj.position.x = offsetX;
          obj.position.z = z;
          const decorData = ensureUserData(obj);
          decorData.streetSide = side;
          decorData.buildingDepth = depth;
          decorData.streetGap = Math.max(1, walkwayStep - depth);
          decorData.streetRotation = rotationY;
          decorData.streetOffsetX = offsetX;
          decorData.streetFront = obj.position.z + depth / 2;
          decorData.assetCategory = decorData.assetCategory || "scenery";
          scene.add(obj);
          buildings.push(obj);
        } else {
          const h = Math.random() * 5 + 1;
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, h, 2),
            new THREE.MeshStandardMaterial({ color: 0x8888ff })
          );
          box.position.set(0, 0, 0);
          box.rotation.set(0, 0, 0);
          const rotationY = side < 0 ? Math.PI : 0;
          box.rotation.y = rotationY;
          box.updateMatrixWorld(true);
          const bbox = tempBox.setFromObject(box);
          const size = bbox.getSize(tempVec);
          const depth = Math.max(2, size.z || size.x || 2);
          const minY = bbox.min.y;
          box.position.y = isFinite(minY) ? -minY : 0;
          const lateralOffset = side < 0 ? 5 : -5;
          const offsetX = side + lateralOffset;
          box.position.x = offsetX;
          box.position.z = z;
          const data = ensureUserData(box);
          data.streetSide = side;
          data.buildingDepth = depth;
          data.streetGap = Math.max(1, walkwayStep - depth);
          data.streetRotation = rotationY;
          data.streetOffsetX = offsetX;
          data.streetFront = box.position.z + depth / 2;
          data.assetCategory = "scenery";
          scene.add(box);
          buildings.push(box);
        }
      }
    }
  }
})();
