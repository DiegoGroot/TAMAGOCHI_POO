const canvas = document.getElementById('asteroidsCanvas');
const ctx = canvas.getContext('2d');

let ship = {
    x: canvas.width/2,
    y: canvas.height/2,
    angle: 0,
    radius: 15,
    vx: 0,
    vy: 0
};

let bullets = [];
let asteroids = [];
let score = 0;
let gameOver = false;

// Configuración
const SHIP_ACCEL = 0.2;
const FRICTION = 0.99;
const ROTATION_SPEED = 0.05;
const BULLET_SPEED = 5;
const ASTEROID_SPEED = 1;
const ASTEROID_COUNT = 5;

// Generar asteroides iniciales
for(let i=0;i<ASTEROID_COUNT;i++){
    asteroids.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        radius: 20 + Math.random()*30,
        vx: (Math.random()-0.5)*ASTEROID_SPEED*2,
        vy: (Math.random()-0.5)*ASTEROID_SPEED*2
    });
}

// Controles
let left = false, right = false, up = false, space = false;
document.addEventListener('keydown', e => {
    if(e.key === "ArrowLeft") left = true;
    if(e.key === "ArrowRight") right = true;
    if(e.key === "ArrowUp") up = true;
    if(e.key === " ") space = true;
});
document.addEventListener('keyup', e => {
    if(e.key === "ArrowLeft") left = false;
    if(e.key === "ArrowRight") right = false;
    if(e.key === "ArrowUp") up = false;
    if(e.key === " ") space = false;
});

// Dibujar nave
function drawShip(){
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -ship.radius);
    ctx.lineTo(ship.radius, ship.radius);
    ctx.lineTo(0, ship.radius/2);
    ctx.lineTo(-ship.radius, ship.radius);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

// Dibujar asteroides
function drawAsteroids(){
    ctx.strokeStyle = "#ff0";
    ctx.lineWidth = 2;
    asteroids.forEach(a=>{
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI*2);
        ctx.stroke();
    });
}

// Dibujar balas
function drawBullets(){
    ctx.fillStyle = "#f00";
    bullets.forEach(b=>{
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
        ctx.fill();
    });
}

// Actualizar
function update(){
    // Rotación
    if(left) ship.angle -= ROTATION_SPEED;
    if(right) ship.angle += ROTATION_SPEED;

    // Aceleración
    if(up){
        ship.vx += Math.sin(ship.angle) * SHIP_ACCEL;
        ship.vy -= Math.cos(ship.angle) * SHIP_ACCEL;
    }

    // Movimiento
    ship.x += ship.vx;
    ship.y += ship.vy;

    ship.vx *= FRICTION;
    ship.vy *= FRICTION;

    // Bordes (rebote)
    if(ship.x < 0) ship.x = canvas.width;
    if(ship.x > canvas.width) ship.x = 0;
    if(ship.y < 0) ship.y = canvas.height;
    if(ship.y > canvas.height) ship.y = 0;

    // Disparo
    if(space && bullets.length < 5){
        bullets.push({
            x: ship.x + Math.sin(ship.angle)*ship.radius,
            y: ship.y - Math.cos(ship.angle)*ship.radius,
            vx: Math.sin(ship.angle)*BULLET_SPEED,
            vy: -Math.cos(ship.angle)*BULLET_SPEED
        });
        space = false; // un solo disparo por tecla
    }

    bullets.forEach((b,i)=>{
        b.x += b.vx;
        b.y += b.vy;
        if(b.x <0 || b.x>canvas.width || b.y<0 || b.y>canvas.height){
            bullets.splice(i,1);
        }
    });

    // Mover asteroides
    asteroids.forEach(a=>{
        a.x += a.vx;
        a.y += a.vy;
        // Rebote bordes
        if(a.x<0) a.x=canvas.width;
        if(a.x>canvas.width) a.x=0;
        if(a.y<0) a.y=canvas.height;
        if(a.y>canvas.height) a.y=0;
    });

    // Colisiones balas-asteroides
    bullets.forEach((b, bi)=>{
        asteroids.forEach((a, ai)=>{
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < a.radius){
                bullets.splice(bi,1);
                asteroids.splice(ai,1);
                score += 10;
                // Crear nuevo asteroide
                asteroids.push({
                    x: Math.random()*canvas.width,
                    y: Math.random()*canvas.height,
                    radius: 20 + Math.random()*30,
                    vx: (Math.random()-0.5)*ASTEROID_SPEED*2,
                    vy: (Math.random()-0.5)*ASTEROID_SPEED*2
                });
            }
        });
    });

    // Colisión nave-asteroide
    asteroids.forEach(a=>{
        let dx = ship.x - a.x;
        let dy = ship.y - a.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < ship.radius + a.radius){
            gameOver = true;
            alert(`Game Over 🚀\nScore: ${score}`);
        }
    });
}

// Loop principal
function loop(){
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    update();
    drawShip();
    drawAsteroids();
    drawBullets();
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
    requestAnimationFrame(loop);
}

loop();
