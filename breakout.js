const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;

let paddle = {
    x: (canvas.width - PADDLE_WIDTH)/2,
    y: canvas.height - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 7
};

let ball = {
    x: canvas.width/2,
    y: canvas.height - 30,
    radius: BALL_RADIUS,
    dx: 3,
    dy: -3
};

let rightPressed = false;
let leftPressed = false;

const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

let bricks = [];
for(let c=0; c<BRICK_COLUMN_COUNT; c++){
    bricks[c] = [];
    for(let r=0; r<BRICK_ROW_COUNT; r++){
        bricks[c][r] = { x:0, y:0, status:1 };
    }
}

let score = 0;
let gameOver = false;

// 🎮 Controles
document.addEventListener("keydown", e => {
    if(e.key === "ArrowRight") rightPressed = true;
    else if(e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
    if(e.key === "ArrowRight") rightPressed = false;
    else if(e.key === "ArrowLeft") leftPressed = false;
});

// 🔹 Detección colisiones
function collisionDetection() {
    for(let c=0; c<BRICK_COLUMN_COUNT; c++){
        for(let r=0; r<BRICK_ROW_COUNT; r++){
            let b = bricks[c][r];
            if(b.status === 1){
                if(ball.x > b.x && ball.x < b.x + BRICK_WIDTH &&
                   ball.y > b.y && ball.y < b.y + BRICK_HEIGHT){
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    if(score === BRICK_ROW_COUNT*BRICK_COLUMN_COUNT*10){
                        alert("¡Felicidades! Ganaste 🎉");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// 🔹 Dibujar ladrillos
function drawBricks() {
    for(let c=0; c<BRICK_COLUMN_COUNT; c++){
        for(let r=0; r<BRICK_ROW_COUNT; r++){
            if(bricks[c][r].status === 1){
                let brickX = c*(BRICK_WIDTH+BRICK_PADDING)+BRICK_OFFSET_LEFT;
                let brickY = r*(BRICK_HEIGHT+BRICK_PADDING)+BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.fillStyle = "#f39c12";
                ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            }
        }
    }
}

// 🔹 Dibujar pelota
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.closePath();
}

// 🔹 Dibujar paddle
function drawPaddle() {
    ctx.fillStyle = "#3498db";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// 🔹 Loop principal
function draw() {
    if(gameOver) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Movimiento paddle
    if(rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    if(leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

    // Rebote con paredes
    if(ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
    if(ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
    else if(ball.y + ball.dy > canvas.height - ball.radius){
        if(ball.x > paddle.x && ball.x < paddle.x + paddle.width){
            ball.dy = -ball.dy;
        } else {
            gameOver = true;
            alert("Game Over 😵\nScore: " + score);
        }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    document.getElementById("scoreDisplay").innerText = `Score: ${score}`;
    requestAnimationFrame(draw);
}

draw();
