const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 70;

let player = {
    x: canvas.width/2 - PLAYER_WIDTH/2,
    y: canvas.height - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 6
};

let obstacles = [];
let score = 0;
let gameOver = false;

// 🎮 Controles
let keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// 🌟 Generar obstáculos
function spawnObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - 40),
        y: -60,
        width: 40,
        height: 60,
        vy: 4 + Math.random() * 2
    });
}

// Inicial 3 obstáculos
for(let i=0;i<3;i++) spawnObstacle();

// 🔄 Loop del juego
function loop() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Dibujar carretera (líneas)
    ctx.fillStyle = "#7f8c8d";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white";
    for(let y=0; y<canvas.height; y+=40){
        ctx.fillRect(canvas.width/2 - 2, y, 4, 20);
    }

    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;

    // Dibujar jugador
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Actualizar y dibujar obstáculos
    obstacles.forEach((o,i)=>{
        o.y += o.vy;
        ctx.fillStyle = "red";
        ctx.fillRect(o.x, o.y, o.width, o.height);

        // Colisión con jugador
        if(player.x < o.x + o.width &&
           player.x + player.width > o.x &&
           player.y < o.y + o.height &&
           player.y + player.height > o.y){
               gameOver = true;
               alert(`Game Over 😵\nScore: ${score}`);
        }

        // Reiniciar obstáculos al salir del canvas
        if(o.y > canvas.height){
            score += 10;
            obstacles.splice(i,1);
            spawnObstacle();
        }
    });

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
