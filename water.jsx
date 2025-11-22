const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
let player = {
    x: canvas.width/2 - PLAYER_WIDTH/2,
    y: canvas.height - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 6
};

let bullets = [];
let targets = [];
let score = 0;
let gameOver = false;

// 🎮 Controles
let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 🌟 Generar objetivos aleatorios
function spawnTarget() {
    targets.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        vy: 2 + Math.random() * 2
    });
}

// Inicial 5 objetivos
for(let i=0;i<5;i++) spawnTarget();

// 🔫 Disparar balas
function shoot() {
    bullets.push({
        x: player.x + player.width/2 - 5,
        y: player.y,
        width: 10,
        height: 20,
        vy: -7
    });
}

// Escuchar tecla espacio
document.addEventListener('keydown', e => {
    if(e.key === ' ') shoot();
});

// 🔄 Loop del juego
function loop() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

    // Dibujar jugador
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Actualizar y dibujar balas
    bullets.forEach((b,i)=>{
        b.y += b.vy;
        ctx.fillStyle = "cyan";
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Eliminar balas fuera del canvas
        if(b.y + b.height < 0) bullets.splice(i,1);
    });

    // Actualizar y dibujar objetivos
    targets.forEach((t,i)=>{
        t.y += t.vy;
        ctx.fillStyle = "red";
        ctx.fillRect(t.x, t.y, t.width, t.height);

        // Colisión con balas
        bullets.forEach((b,j)=>{
            if(b.x < t.x + t.width &&
               b.x + b.width > t.x &&
               b.y < t.y + t.height &&
               b.y + b.height > t.y){
                   bullets.splice(j,1);
                   targets.splice(i,1);
                   score += 10;
                   spawnTarget();
            }
        });

        // Game Over si objetivo llega al jugador
        if(t.y + t.height >= canvas.height){
            gameOver = true;
            alert(`Game Over 😵\nScore: ${score}`);
        }
    });

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
