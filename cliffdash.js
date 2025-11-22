const canvas = document.getElementById("cliffCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const vidasEl = document.getElementById("vidas");

let gameRunning = false;
let player, ground, obstacles, score, vidas;
let gravity = 0.6;
let jumpForce = -10;
let speed = 4;

function resetGame() {
  player = { x: 80, y: 0, w: 30, h: 30, vy: 0, grounded: false };
  ground = { y: canvas.height - 50 };
  obstacles = [];
  score = 0;
  vidas = 3;
  scoreEl.textContent = score;
  vidasEl.textContent = vidas;
}

function spawnObstacle() {
  const gap = 120 + Math.random() * 150;
  obstacles.push({ x: canvas.width, y: ground.y, w: gap, type: "gap" });
}

function draw() {
  // Fondo
  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Suelo
  ctx.fillStyle = "#10b981";
  ctx.fillRect(0, ground.y, canvas.width, 50);

  // Obstáculos / huecos
  ctx.fillStyle = "#0d9488";
  obstacles.forEach(o => {
    ctx.clearRect(o.x, o.y, o.w, 50); // Hueco
  });

  // Jugador
  ctx.fillStyle = "#facc15";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function update() {
  // Movimiento del suelo (huecos)
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= speed;

    // Eliminar obstáculos fuera de pantalla
    if (obstacles[i].x + obstacles[i].w < 0) {
      obstacles.splice(i, 1);
      score++;
      scoreEl.textContent = score;
    }

    // Verificar si jugador cae en hueco
    if (
      player.x + player.w > obstacles[i].x &&
      player.x < obstacles[i].x + obstacles[i].w &&
      player.y + player.h >= ground.y
    ) {
      vidas--;
      vidasEl.textContent = vidas;
      if (vidas <= 0) endGame();
      else resetPosition();
    }
  }

  // Física del jugador
  player.vy += gravity;
  player.y += player.vy;

  if (player.y + player.h >= ground.y) {
    player.y = ground.y - player.h;
    player.vy = 0;
    player.grounded = true;
  }

  // Spawning de huecos
  if (Math.random() < 0.01) spawnObstacle();
}

function resetPosition() {
  player.x = 80;
  player.y = 0;
  player.vy = 0;
}

function loop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function jump() {
  if (player.grounded) {
    player.vy = jumpForce;
    player.grounded = false;
  }
}

function startGame() {
  resetGame();
  gameRunning = true;
  loop();
}

function endGame() {
  gameRunning = false;
  localStorage.setItem("ultimaPuntuacionCliff", score);
  alert(`Fin del juego. Puntuación: ${score}`);
}

// Controles
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

// Volver al menú
document.getElementById("btnVolverMenu").addEventListener("click", () => {
  localStorage.setItem("ultimaPuntuacionCliff", score);
  window.location.href = "menu.html";
});

// Iniciar
startGame();
