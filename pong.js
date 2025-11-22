const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');

// Configuración inicial
let aiEnabled = true;
let aiDifficulty = 0.08;
let initialSpeed = 5;

const player1 = { x: 20, y: 180, w: 12, h: 90, vy: 0 };
const player2 = { x: canvas.width - 32, y: 180, w: 12, h: 90, vy: 0 };
let ball = { x: canvas.width/2, y: canvas.height/2, r: 8, vx: initialSpeed, vy: 3 };

let score1 = 0, score2 = 0;
let running = false;
let frameId = null;

// ----- Dibujar elementos -----
function draw() {
  ctx.fillStyle = '#071029';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Línea central
  ctx.strokeStyle = '#16324a';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(player1.x, player1.y, player1.w, player1.h);
  ctx.fillRect(player2.x, player2.y, player2.w, player2.h);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();
}

function resetBall() {
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.vx = (Math.random() > 0.5 ? 1 : -1) * initialSpeed;
  ball.vy = (Math.random() > 0.5 ? 1 : -1) * 3;
}

// ----- Movimiento -----
function update() {
  player1.y += player1.vy;
  player2.y += player2.vy;

  // Limites
  [player1, player2].forEach(p => {
    if (p.y < 0) p.y = 0;
    if (p.y + p.h > canvas.height) p.y = canvas.height - p.h;
  });

  // Movimiento IA
  if (aiEnabled) {
    const centerAI = player2.y + player2.h / 2;
    player2.y += (ball.y - centerAI) * aiDifficulty;
  }

  // Movimiento bola
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height)
    ball.vy *= -1;

  // Colisiones
  if (ball.x - ball.r < player1.x + player1.w &&
      ball.y > player1.y && ball.y < player1.y + player1.h)
    ball.vx = Math.abs(ball.vx);

  if (ball.x + ball.r > player2.x &&
      ball.y > player2.y && ball.y < player2.y + player2.h)
    ball.vx = -Math.abs(ball.vx);

  // Puntos
  if (ball.x < 0) { score2++; resetBall(); }
  if (ball.x > canvas.width) { score1++; resetBall(); }

  score1El.textContent = score1;
  score2El.textContent = score2;
}

function loop() {
  if (!running) return;
  update();
  draw();
  frameId = requestAnimationFrame(loop);
}

// ----- Controles -----
function onKeyDown(e) {
  if (e.key === 'w') player1.vy = -6;
  if (e.key === 's') player1.vy = 6;
  if (!aiEnabled) {
    if (e.key === 'ArrowUp') player2.vy = -6;
    if (e.key === 'ArrowDown') player2.vy = 6;
  }
}
function onKeyUp(e) {
  if (['w','s'].includes(e.key)) player1.vy = 0;
  if (!aiEnabled && ['ArrowUp','ArrowDown'].includes(e.key)) player2.vy = 0;
}

// ----- Juego -----
document.getElementById('btnJugar').addEventListener('click', () => {
  if (!running) {
    running = true;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    loop();
  }
});

document.getElementById('btnVolverMenu').addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(frameId);
  window.location.href = "{{ url_for('menu') }}";
});

// ----- Modal Configuración -----
const modal = document.getElementById('configModal');
document.getElementById('btnConfig').onclick = () => modal.style.display = 'flex';
document.getElementById('btnCerrar').onclick = () => modal.style.display = 'none';

document.getElementById('aiDificultad').oninput = e => {
  document.getElementById('aiValor').textContent = e.target.value;
};
document.getElementById('ballSpeed').oninput = e => {
  document.getElementById('speedValor').textContent = e.target.value;
};

document.getElementById('btnGuardar').onclick = () => {
  aiEnabled = document.getElementById('aiEnabled').checked;
  aiDifficulty = parseFloat(document.getElementById('aiDificultad').value);
  initialSpeed = parseFloat(document.getElementById('ballSpeed').value);
  modal.style.display = 'none';
  resetBall();
};
