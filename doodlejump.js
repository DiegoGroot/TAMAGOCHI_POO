const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_SIZE = 40;
let player = {
    x: canvas.width/2 - PLAYER_SIZE/2,
    y: canvas.height - PLAYER_SIZE - 10,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    vy: 0
};

const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 12;
let platforms = [];
let score = 0;
let gameOver = false;

// Física
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;

// Generar plataformas iniciales
platforms.push({ x: 0, y: canvas.height - 10, width: canvas.width, height: 10 }); // piso
for(let i=1; i<=7; i++){
    platforms.push({
        x: Math.random() * (canvas.width - PLATFORM_WIDTH),
        y: canvas.height - i*80,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT
    });
}

// Controles
let left = false, right = false;
document.addEventListener('keydown', e => {
    if(e.key === "ArrowLeft") left = true;
    if(e.key === "ArrowRight") right = true;
});
document.addEventListener('keyup', e => {
    if(e.key === "ArrowLeft") left = false;
    if(e.key === "ArrowRight") right = false;
});

// Loop del juego
function loop() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Movimiento lateral
    if(left) player.x -= 5;
    if(right) player.x += 5;
    if(player.x < 0) player.x = 0;
    if(player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Gravedad y salto
    player.vy += GRAVITY;
    player.y += player.vy;

    // Colisión con plataformas
    platforms.forEach(p => {
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
    ctx.fillStyle = '#ffdd57';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Dibujar plataformas
    ctx.fillStyle = '#ff7f50';
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    // Subir plataformas si jugador sube
    if(player.y < canvas.height/2){
        let delta = Math.abs(player.vy);
        platforms.forEach(p => p.y += delta);
        score += Math.floor(delta);
    }

    // Regenerar plataformas que caen
    platforms.forEach((p,i) => {
        if(p.y > canvas.height){
            platforms[i] = {
                x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                y: 0,
                width: PLATFORM_WIDTH,
                height: PLATFORM_HEIGHT
            };
        }
    });

    // Game Over
    if(player.y > canvas.height){
        gameOver = true;
        alert(`Game Over 😵\nScore: ${score}`);
    }

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
