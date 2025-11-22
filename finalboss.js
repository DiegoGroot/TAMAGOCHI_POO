const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 4, COLS = 6;
const CELL_SIZE = 100;

let grid = Array.from({length: ROWS}, () => Array(COLS).fill(null));
let plants = [];
let bullets = [];
let enemies = [];
let score = 0;
let sun = 100;
let gameOver = false;
let bossHP = 900;

// 🌱 Plant class
class Plant {
  constructor(type, row, col) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.x = col*CELL_SIZE;
    this.y = row*CELL_SIZE;
    this.cooldown = 0;
    this.value = type === "shooter" ? 50 : 25;
  }
  shoot() {
    if(this.type !== "shooter") return;
    if(this.cooldown <=0){
      bullets.push(new Bullet(this.x + CELL_SIZE/2, this.y + CELL_SIZE/2));
      this.cooldown = 50;
    } else {
      this.cooldown--;
    }
  }
  draw() {
    if(this.type === "shooter") ctx.fillStyle = 'green';
    if(this.type === "sunflower") ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x+20, this.y+20, 60, 60);
  }
}

// 🔥 Bullet class
class Bullet {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.speed = 5;
  }
  update() { this.x += this.speed; }
  draw() {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI*2);
    ctx.fill();
  }
}

// 👾 Enemy class
class Enemy {
  constructor(row){
    this.x = canvas.width;
    this.y = row*CELL_SIZE;
    this.speed = 1 + Math.random();
    this.hp = 3;
    this.size = CELL_SIZE-40;
  }
  update(){ this.x -= this.speed; }
  draw() { ctx.fillStyle='red'; ctx.fillRect(this.x+20, this.y+20, this.size, this.size); }
}

// 🪴 Colocar planta
document.querySelectorAll(".plantBtn").forEach(btn => {
  btn.addEventListener("click", ()=>{
    const type = btn.dataset.type;
    canvas.onclick = function(e){
      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left)/CELL_SIZE);
      const row = Math.floor((e.clientY - rect.top)/CELL_SIZE);
      if(!grid[row][col] && sun >= (type==="shooter"?50:25)){
        const p = new Plant(type,row,col);
        grid[row][col] = p;
        plants.push(p);
        sun -= p.value;
        document.getElementById('sunCounter').innerText = `Sun: ${sun}`;
      }
    };
  });
});

// 🌟 Spawn enemies
function spawnEnemy(){
  const row = Math.floor(Math.random()*ROWS);
  enemies.push(new Enemy(row));
}

// 🔄 Game loop
function loop(){
  if(gameOver) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Plants shoot / draw
  plants.forEach(p => { 
    p.shoot(); 
    p.draw(); 
    if(p.type==="sunflower" && Math.random()<0.005){
      sun += 25;
      document.getElementById('sunCounter').innerText = `Sun: ${sun}`;
    }
  });

  // Bullets
  for(let i=bullets.length-1; i>=0; i--){
    const b = bullets[i];
    b.update(); b.draw();
    for(let j=enemies.length-1; j>=0; j--){
      const e = enemies[j];
      if(b.x > e.x && b.x < e.x+CELL_SIZE && b.y > e.y && b.y < e.y+CELL_SIZE){
        e.hp--; bullets.splice(i,1);
        if(e.hp<=0){ enemies.splice(j,1); score+=100; bossHP -=10; }
        break;
      }
    }
  }

  // Enemies
  for(let i=enemies.length-1; i>=0; i--){
    const e = enemies[i]; e.update(); e.draw();
    if(e.x<0){ gameOver=true; alert('Game Over 😵'); }
  }

  document.getElementById('scoreDisplay').innerText=`Score: ${score}`;
  document.getElementById('BossHealth').innerText=`Boss health: ${bossHP}`;

  if(bossHP<=0){ gameOver=true; alert('¡Has vencido al Final Boss! 🌟'); }

  requestAnimationFrame(loop);
}

// Enemigos cada 2s
setInterval(()=>{if(!gameOver) spawnEnemy();},2000);

loop();

