// Encapsulado
(() => {
  let scene, camera, renderer;
  let player, targetLane = 1;
  const obstacles = [], coins = [], lanes = [-2, 0, 2], buildings = [], floorSegments = [];
  let speed = 0.01, jumpVelocity = 0.2, isJumping = false, yVelocity = 0;
  let timer = 0, lives = 3, coinCount = 0;
  let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
  let gameStarted = false;

  const timerEl = document.getElementById("timer");
  const livesEl = document.getElementById("lives");
  const coinsEl = document.getElementById("coins");
  const hudEl = document.getElementById("hud");
  const startScreenEl = document.getElementById("startScreen");
  const startBtnEl = document.getElementById("startButton");
  const overlayEl = document.getElementById("loaderOverlay");

  startBtnEl.onclick = async () => {
    // Desbloquear audio en el gesto del usuario
    try { if (window.AUDIO_CTX && window.AUDIO_CTX.state !== "running") await window.AUDIO_CTX.resume(); } catch(_) {}

    const waitAssets = async (timeoutMs = 60000) => {
      const t0 = performance.now();
      while (!window.ASSETS_READY && performance.now() - t0 < timeoutMs) {
        await new Promise(r => setTimeout(r, 100));
      }
      return !!window.ASSETS_READY;
    };
    const ok = await waitAssets(60000);

    startScreenEl.style.display = "none";
    hudEl.style.display = "block";
    init();
    animate();
    setInterval(() => { if (gameStarted) { timer++; timerEl.textContent = timer; } }, 1000);

    if (!ok) {
      console.warn("Assets did not finish loading in time. Using fallbacks where needed.");
      overlayEl.style.display = "none";
    }
  };

  function animate() {
    requestAnimationFrame(animate);

    player.position.x += (lanes[targetLane] - player.position.x) * 0.2;

    if (isJumping) {
      player.position.y += yVelocity;
      yVelocity -= 0.01;
      if (player.position.y <= 0.5) {
        player.position.y = 0.5;
        isJumping = false;
      }
    }

    // Obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.position.z += speed * 50;
      if (obs.position.z > 10) {
        scene.remove(obs);
        obstacles.splice(i, 1);
      } else if (
        Math.abs(player.position.z - obs.position.z) < 1 &&
        Math.abs(player.position.x - obs.position.x) < 1 &&
        Math.abs(player.position.y - (obs.position.y || 0.5)) < 1
      ) {
        // Hit + vida
        if (window.SFX) window.SFX.play("hit");
        lives--;
        livesEl.textContent = lives;

        // Si aún quedan vidas, reproduce "life" para feedback
        if (lives > 0 && window.SFX) setTimeout(() => window.SFX.play("life"), 60);

        scene.remove(obs);
        obstacles.splice(i, 1);

        if (lives <= 0) {
          // Game Over: sonido y reinicio tras ~1.2s para dejar sonar
          if (window.SFX) window.SFX.play("gameover");
          alert("Game Over!! \nScore: " + coinCount)
          //setTimeout(() => location.reload(), 1200);
          location.reload()
        }
      }
    }

    // Monedas
    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      if (coin.rotation) coin.rotation.y += 0.1;
      coin.position.z += speed * 50;
      if (coin.position.z > 10) {
        scene.remove(coin);
        coins.splice(i, 1);
      } else if (
        Math.abs(player.position.z - coin.position.z) < 1 &&
        Math.abs(player.position.x - coin.position.x) < 1 &&
        Math.abs(player.position.y - (coin.position.y || 0.5)) < 1
      ) {
        coinCount++;
        coinsEl.textContent = coinCount;
        if (window.SFX) window.SFX.play("coin");
        scene.remove(coin);
        coins.splice(i, 1);
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

    renderer.render(scene, camera);
  }

  function init() {
    gameStarted = true;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    for (let i = 0; i < 20; i++) {
      const floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.1, 10),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      floor.position.z = -i * 10;
      floorSegments.push(floor);
      scene.add(floor);
    }

    player = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    player.position.set(lanes[targetLane], 0.5, 5);
    scene.add(player);

    camera.position.set(0, 3, 10);
    camera.lookAt(player.position);

    generateObstacle();
    generateCoin();
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
  function generateObstacle() {
    const laneX = lanes[Math.floor(Math.random() * 3)];
    const fbxClone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("obstacles")
      : null;

    let obs;
    if (fbxClone) {
      obs = fbxClone;
      obs.position.set(laneX, 1, -100);
    } else {
      obs = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      obs.position.set(laneX, 0.5, -100);
    }

    scene.add(obs);
    obstacles.push(obs);
    setTimeout(generateObstacle, 2000);
  }

  function generateCoin() {
    const laneX = lanes[Math.floor(Math.random() * 3)];
    const fbxClone = (typeof window.GET_RANDOM_ASSET_CLONE === "function")
      ? window.GET_RANDOM_ASSET_CLONE("coins")
      : null;

    let coin;
    if (fbxClone) {
      coin = fbxClone;
      coin.position.set(laneX, 1, -80);
    } else {
      coin = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
      );
      coin.position.set(laneX, 0.5, -80);
    }

    scene.add(coin);
    coins.push(coin);
    setTimeout(generateCoin, 1500);
  }

  function generateCity() {
    // Tu versión que llama a GET_RANDOM_ASSET_CLONE("city") ya existente
    const sides = [-7, 7], zStart = -20, zEnd = -200, step = 10;
    const hasCity = (typeof window.GET_RANDOM_ASSET_CLONE === "function");
    for (let z = zStart; z > zEnd; z -= step) {
      for (let side of sides) {
        let obj = hasCity ? window.GET_RANDOM_ASSET_CLONE("city") : null;
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
