const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width/2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 20,
    vx: 0
};

let bullets = [];
let invaders = [];
let score = 0;
let gameOver = false;

// Configuración
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const INVADER_ROWS = 4;
const INVADER_COLS = 8;
const INVADER_WIDTH = 40;
const INVADER_HEIGHT = 20;
const INVADER_H_SPACING = 20;
const INVADER_V_SPACING = 20;
let invaderDirection = 1; // 1 = derecha, -1 = izquierda

// Crear invasores
for(let row=0; row<INVADER_ROWS; row++){
    for(let col=0; col<INVADER_COLS; col++){
        invaders.push({
            x: 50 + col*(INVADER_WIDTH+INVADER_H_SPACING),
            y: 50 + row*(INVADER_HEIGHT+INVADER_V_SPACING),
            width: INVADER_WIDTH,
            height: INVADER_HEIGHT,
        });
    }
}

// Controles
let left=false, right=false, space=false;
document.addEventListener('keydown', e=>{
    if(e.key === "ArrowLeft") left=true;
    if(e.key === "ArrowRight") right=true;
    if(e.key === " ") space=true;
});
document.addEventListener('keyup', e=>{
    if(e.key === "ArrowLeft") left=false;
    if(e.key === "ArrowRight") right=false;
    if(e.key === " ") space=false;
});

// Dibujar jugador
function drawPlayer(){
    ctx.fillStyle = "#0ff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Dibujar balas
function drawBullets(){
    ctx.fillStyle = "#f00";
    bullets.forEach(b=>{
        ctx.fillRect(b.x, b.y, 4, 10);
    });
}

// Dibujar invasores
function drawInvaders(){
    ctx.fillStyle = "#ff0";
    invaders.forEach(i=>{
        ctx.fillRect(i.x, i.y, i.width, i.height);
    });
}

// Actualizar
function update(){
    if(left) player.x -= PLAYER_SPEED;
    if(right) player.x += PLAYER_SPEED;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // Disparo
    if(space && bullets.length < 3){
        bullets.push({x: player.x + player.width/2 - 2, y: player.y, vy: -BULLET_SPEED});
        space = false; // solo un disparo por tecla
    }

    bullets.forEach((b,i)=>{
        b.y += b.vy;
        if(b.y < 0) bullets.splice(i,1);
    });

    // Mover invasores
    let moveDown = false;
    invaders.forEach(i=>{
        i.x += invaderDirection*0.5;
        if(i.x + i.width > canvas.width || i.x < 0) moveDown = true;
    });

    if(moveDown){
        invaderDirection *= -1;
        invaders.forEach(i=>i.y += 20);
    }

    // Colisiones balas-invasores
    bullets.forEach((b, bi)=>{
        invaders.forEach((i, ii)=>{
            if(b.x < i.x+i.width && b.x+4 > i.x && b.y < i.y+i.height && b.y+10 > i.y){
                bullets.splice(bi,1);
                invaders.splice(ii,1);
                score += 10;
            }
        });
    });

    // Game over
    invaders.forEach(i=>{
        if(i.y + i.height >= player.y){
            gameOver = true;
            alert(`Game Over 👾\nScore: ${score}`);
        }
    });
}

// Loop
function loop(){
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    update();
    drawPlayer();
    drawBullets();
    drawInvaders();
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
