const colors = ['green', 'red', 'yellow', 'blue'];
let sequence = [];
let playerSequence = [];
let level = 1;
let waitingPlayer = false;
let aiMode = false;

const levelDisplay = document.getElementById('level');
const statusDisplay = document.getElementById('status');
const modeDisplay = document.getElementById('mode');

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const aiBtn = document.getElementById('aiBtn');

colors.forEach(color => {
  document.getElementById(color).addEventListener('click', () => handlePlayerInput(color));
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
aiBtn.addEventListener('click', toggleAI);

function startGame() {
  level = 1;
  sequence = [];
  aiMode = false;
  modeDisplay.textContent = "Jugador";
  nextRound();
}

function resetGame() {
  sequence = [];
  playerSequence = [];
  level = 1;
  waitingPlayer = false;
  aiMode = false;
  modeDisplay.textContent = "Jugador";
  levelDisplay.textContent = level;
  statusDisplay.textContent = "Reiniciado. Presiona Iniciar.";
}

function toggleAI() {
  aiMode = !aiMode;
  modeDisplay.textContent = aiMode ? "IA" : "Jugador";
  if (aiMode) {
    statusDisplay.textContent = "La IA está jugando...";
    startAI();
  }
}

function nextRound() {
  waitingPlayer = false;
  playerSequence = [];
  statusDisplay.textContent = 'Mira la secuencia...';
  const nextColor = colors[Math.floor(Math.random() * 4)];
  sequence.push(nextColor);
  playSequence();
}

function playSequence() {
  let i = 0;
  const interval = setInterval(() => {
    flash(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(interval);
      if (!aiMode) {
        waitingPlayer = true;
        statusDisplay.textContent = 'Tu turno...';
      } else {
        setTimeout(aiPlay, 1000);
      }
    }
  }, 800);
}

function flash(color) {
  const btn = document.getElementById(color);
  btn.classList.add('active');
  const sound = new Audio(`https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg`);
  sound.play();
  setTimeout(() => btn.classList.remove('active'), 400);
}

function handlePlayerInput(color) {
  if (!waitingPlayer || aiMode) return;
  flash(color);
  playerSequence.push(color);
  checkSequence();
}

function checkSequence() {
  const currentIndex = playerSequence.length - 1;
  if (playerSequence[currentIndex] !== sequence[currentIndex]) {
    fail();
    return;
  }

  if (playerSequence.length === sequence.length) {
    level++;
    levelDisplay.textContent = level;
    waitingPlayer = false;
    statusDisplay.textContent = 'Bien hecho!';
    setTimeout(nextRound, 1200);
  }
}

function fail() {
  statusDisplay.textContent = '¡Fallaste! Reiniciando...';
  const failSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
  failSound.play();
  setTimeout(startGame, 1500);
}

function aiPlay() {
  statusDisplay.textContent = "IA reproduciendo secuencia...";
  let i = 0;
  const aiInterval = setInterval(() => {
    flash(sequence[i]);
    i++;
    if (i >= sequence.length) {
      clearInterval(aiInterval);
      level++;
      levelDisplay.textContent = level;
      setTimeout(nextRound, 1000);
    }
  }, 900);
}

function startAI() {
  level = 1;
  sequence = [];
  nextRound();
}

function volver() {
  window.location.href = '/juegos';
}

// inicia automáticamente al cargar
window.onload = () => {
  statusDisplay.textContent = "Listo para jugar. Presiona Iniciar o IA.";
};
