const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
let bird = { x: 80, y: canvas.height/2, vy: 0, width: BIRD_WIDTH, height: BIRD_HEIGHT };
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

const GRAVITY = 0.6;
const FLAP = -10;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;

// Control con espacio
document.addEventListener('keydown', e => {
    if(e.code === 'Space') bird.vy = FLAP;
});

// Generar obstáculos
function createPipe() {
    const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - PIPE_GAP
    });
}

// Colisión
function checkCollision(pipe) {
    if(
        bird.x < pipe.x + PIPE_WIDTH &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ){
        return true;
    }
    return false;
}

// Loop principal
function loop() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Gravedad
    bird.vy += GRAVITY;
    bird.y += bird.vy;

    // Dibujar pájaro
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Dibujar tuberías
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, PIPE_WIDTH, pipe.bottom);
    });

    // Mover tuberías
    pipes.forEach(pipe => pipe.x -= 3);

    // Eliminar pipes que se salen de pantalla y aumentar score
    pipes = pipes.filter(pipe => {
        if(pipe.x + PIPE_WIDTH < 0) {
            score++;
            return false;
        }
        return true;
    });

    // Generar nuevas pipes cada cierto frame
    if(frame % 90 === 0) createPipe();
    frame++;

    // Colisiones
    for(let pipe of pipes){
        if(checkCollision(pipe) || bird.y + bird.height > canvas.height || bird.y < 0){
            gameOver = true;
            alert("Game Over 😵\nScore: " + score);
        }
    }

    // Mostrar score
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;

    requestAnimationFrame(loop);
}

loop();
