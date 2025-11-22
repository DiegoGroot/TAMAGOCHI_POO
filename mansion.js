const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_SIZE = 40;
let player = {
    x: canvas.width/2 - PLAYER_SIZE/2,
    y: canvas.height/2 - PLAYER_SIZE/2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 5
};

const GHOST_SIZE = 30;
let ghosts = [];
let score = 0;
let gameOver = false;

// 🎮 Controles
let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 🌟 Generar fantasmas aleatorios
function spawnGhost() {
    ghosts.push({
        x: Math.random()*(canvas.width - GHOST_SIZE),
        y: Math.random()*(canvas.height - GHOST_SIZE),
        vx: (Math.random() > 0.5 ? 1 : -1) * 2,
        vy: (Math.random() > 0.5 ? 1 : -1) * 2
    });
}

// Inicial 5 fantasmas
for(let i=0;i<5;i++) spawnGhost();

// 🔄 Loop del juego
function loop() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Movimiento del jugador
    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
    if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y + player.height < canvas.height) player.y += player.speed;

    // Dibujar jugador
    ctx.fillStyle = "green";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Actualizar y dibujar fantasmas
    ghosts.forEach((g,i)=>{
        g.x += g.vx;
        g.y += g.vy;

        // Rebotar paredes
        if(g.x < 0 || g.x + GHOST_SIZE > canvas.width) g.vx *= -1;
        if(g.y < 0 || g.y + GHOST_SIZE > canvas.height) g.vy *= -1;

        ctx.fillStyle = "red";
        ctx.fillRect(g.x, g.y, GHOST_SIZE, GHOST_SIZE);

        // Colisión jugador-fantasma
        if(player.x < g.x + GHOST_SIZE &&
           player.x + player.width > g.x &&
           player.y < g.y + GHOST_SIZE &&
           player.y + player.height > g.y){
            ghosts.splice(i,1);
            score += 10;
            // Spawnear un fantasma nuevo
            spawnGhost();
        }
    });

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
