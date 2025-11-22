/* ============================================================
   Juego de Saltos - game.js
   ============================================================ */

// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Botones
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const muteBtn = document.getElementById("muteBtn");

// Textos
const scoreText = document.getElementById("score");
const bestText  = document.getElementById("best");

// Variables del juego
let player, obstacles, score, best, gravity, gameSpeed;
let paused = false;
let running = false;
let muted = false;

// Sonidos
const jumpSound = new Audio("jump.wav");
const hitSound  = new Audio("hit.wav");

jumpSound.volume = 0.6;
hitSound.volume = 0.7;

/* ================================
   INICIALIZAR
   ================================ */
function initGame() {
  player = {
    x: 50,
    y: 260,
    w: 40,
    h: 40,
    vy: 0,
    jumping: false
  };

  obstacles = [];
  score = 0;
  gameSpeed = 6;
  gravity = 1.2;

  scoreText.textContent = 0;

  best = localStorage.getItem("bestScore") || 0;
  bestText.textContent = best;

  running = true;
  paused = false;

  loop();
}

/* ================================
   SALTO
   ================================ */
function jump() {
  if (!running || paused) return;

  if (!player.jumping) {
    player.vy = -20;
    player.jumping = true;

    if (!muted) jumpSound.play();
  }
}

/* ================================
   CREAR OBSTÁCULO
   ================================ */
function spawnObstacle() {
  let size = 40 + Math.random() * 20;

  obstacles.push({
    x: canvas.width + size,
    y: 300 - size,
    w: size,
    h: size
  });
}

/* ================================
   DIBUJAR JUGADOR
   ================================ */
function drawPlayer() {
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

/* ================================
   DIBUJAR OBSTÁCULOS
   ================================ */
function drawObstacles() {
  ctx.fillStyle = "#ef4444";

  for (let o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }
}

/* ================================
   ACTUALIZAR JUGADOR
   ================================ */
function updatePlayer() {
  player.vy += gravity;
  player.y += player.vy;

  if (player.y >= 260) {
    player.y = 260;
    player.jumping = false;
  }
}

/* ================================
   ACTUALIZAR OBSTÁCULOS
   ================================ */
function updateObstacles() {
  for (let o of obstacles) {
    o.x -= gameSpeed;
  }

  // Eliminar los que ya salieron
  obstacles = obstacles.filter(o => o.x + o.w > 0);
}

/* ================================
   COLISIONES
   ================================ */
function checkCollision() {
  for (let o of obstacles) {
    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      gameOver();
      return;
    }
  }
}

/* ================================
   FIN DEL JUEGO
   ================================ */
function gameOver() {
  running = false;

  if (!muted) hitSound.play();

  if (score > best) {
    localStorage.setItem("bestScore", score);
    bestText.textContent = score;
  }

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "28px Arial";
  ctx.fillText("¡Has perdido!", 230, 170);

  ctx.font = "20px Arial";
  ctx.fillText("Presiona INICIAR para jugar de nuevo", 170, 210);
}

/* ================================
   BUCLE PRINCIPAL
   ================================ */
let frame = 0;

function loop() {
  if (!running || paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  frame++;

  // Crear obstáculos cada cierto tiempo
  if (frame % 90 === 0) {
    spawnObstacle();
  }

  updatePlayer();
  updateObstacles();
  checkCollision();

  drawPlayer();
  drawObstacles();

  // Aumentar puntuación
  score++;
  scoreText.textContent = score;

  // Aumentar dificultad
  if (score % 300 === 0) {
    gameSpeed += 0.5;
  }

  requestAnimationFrame(loop);
}

/* ================================
   PAUSA
   ================================ */
function togglePause() {
  if (!running) return;

  paused = !paused;

  if (!paused) loop();
}

/* ================================
   MUTE
   ================================ */
function toggleMute() {
  muted = !muted;

  jumpSound.muted = muted;
  hitSound.muted = muted;

  muteBtn.textContent = muted ? "🔇" : "🔊";
}

/* ================================
   EVENTOS
   ================================ */
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
  if (e.code === "KeyP") togglePause();
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", jump);

startBtn.addEventListener("click", initGame);
pauseBtn.addEventListener("click", togglePause);
muteBtn.addEventListener("click", toggleMute);
