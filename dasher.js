const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
let player, platforms, score, gameOver;

const GRAVITY = 0.4;
const JUMP_VELOCITY = -10;
let keys = {};

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

function initGame() {
  player = { x: canvas.width/2 - 25, y: canvas.height - 100, vy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
  platforms = [];
  score = 0;
  gameOver = false;

  for(let i=0; i<8; i++){
      platforms.push({ x: Math.random()*(canvas.width-100), y: i*75, width: 100, height: 10 });
  }

  loop();
}

function loop(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(keys['ArrowLeft']) player.x -= 5;
  if(keys['ArrowRight']) player.x += 5;

  player.vy += GRAVITY;
  player.y += player.vy;

  platforms.forEach(p=>{
      if(player.vy > 0 &&
         player.x + player.width > p.x &&
         player.x < p.x + p.width &&
         player.y + player.height > p.y &&
         player.y + player.height < p.y + p.height + player.vy){
          player.y = p.y - player.height;
          player.vy = JUMP_VELOCITY;
      }
  });

  // Dibujar jugador
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Dibujar plataformas
  ctx.fillStyle = 'brown';
  platforms.forEach(p=> ctx.fillRect(p.x, p.y, p.width, p.height));

  // Mover plataformas si jugador sube
  if(player.y < canvas.height/2){
      platforms.forEach(p => p.y += Math.abs(player.vy));
      score += Math.floor(Math.abs(player.vy));
  }

  // Regenerar plataformas
  platforms.forEach((p,i)=>{
      if(p.y > canvas.height){
          platforms[i] = { x: Math.random()*(canvas.width-100), y: 0, width: 100, height: 10 };
      }
  });

  // Game over
  if(player.y > canvas.height){
      gameOver = true;
      alert("Game Over 😵\nScore: " + score);
  }

  document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
  jumperLoop = requestAnimationFrame(loop);
}

// 🔹 Función global para botón Jugar
function startGame(){
  cancelAnimationFrame(jumperLoop);
  initGame();
}
