const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bird = {
    x: 80,
    y: canvas.height/2,
    width: 30,
    height: 30,
    vy: 0
};

const GRAVITY = 0.6;
const JUMP = -10;
let pipes = [];
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
let score = 0;
let gameOver = false;

// Crear pipes iniciales
function createPipe(){
    let topHeight = Math.random()*(canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - PIPE_GAP
    });
}

// Controles
document.addEventListener('keydown', e=>{
    if(e.code === "Space") bird.vy = JUMP;
});
document.addEventListener('mousedown', e=>{
    bird.vy = JUMP;
});

// Loop
function loop(){
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Actualizar pájaro
    bird.vy += GRAVITY;
    bird.y += bird.vy;

    // Dibujar pájaro
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Mover pipes
    if(pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - 200){
        createPipe();
    }

    pipes.forEach((p,i)=>{
        p.x -= 3;

        // Dibujar pipe
        ctx.fillStyle = "green";
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, PIPE_WIDTH, p.bottom);

        // Colisión
        if(bird.x < p.x + PIPE_WIDTH &&
           bird.x + bird.width > p.x &&
           (bird.y < p.top || bird.y + bird.height > canvas.height - p.bottom)){
            gameOver = true;
            alert(`Game Over 🐦\nScore: ${score}`);
        }

        // Contar score
        if(!p.passed && bird.x > p.x + PIPE_WIDTH){
            score++;
            p.passed = true;
        }

        // Eliminar pipes fuera de pantalla
        if(p.x + PIPE_WIDTH < 0) pipes.splice(i,1);
    });

    // Bordes
    if(bird.y + bird.height > canvas.height || bird.y < 0){
        gameOver = true;
        alert(`Game Over 🐦\nScore: ${score}`);
    }

    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
