const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 50;
const ROWS = 10;
const COLS = 10;

let frog = { x: 4, y: 9 }; // Posición inicial (fila/columna)
let score = 0;
let gameOver = false;

const cars = [
  { y: 6, speed: 2, positions: [0,3,6] },
  { y: 7, speed: 3, positions: [1,5,8] },
  { y: 8, speed: 2.5, positions: [2,6] }
];

const logs = [
  { y: 1, speed: 1.5, positions: [0,4] },
  { y: 2, speed: 2, positions: [2,6] },
  { y: 3, speed: 1, positions: [1,5,8] }
];

document.addEventListener('keydown', e => {
    if(gameOver) return;
    if(e.key === "ArrowUp" && frog.y>0) frog.y--;
    if(e.key === "ArrowDown" && frog.y<ROWS-1) frog.y++;
    if(e.key === "ArrowLeft" && frog.x>0) frog.x--;
    if(e.key === "ArrowRight" && frog.x<COLS-1) frog.x++;
});

// 🔹 Dibujar el tablero
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Dibujar fondo
    for(let r=0; r<ROWS; r++){
        for(let c=0; c<COLS; c++){
            if(r<=3) ctx.fillStyle="#1e88e5"; // Río
            else if(r>=6) ctx.fillStyle="#7f8c8d"; // Carretera
            else ctx.fillStyle="#27ae60"; // Pasto
            ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Dibujar logs
    ctx.fillStyle = "#8d6e63";
    logs.forEach(log => {
        log.positions.forEach((pos,i) => {
            let x = (pos * TILE_SIZE + log.speed) % canvas.width;
            ctx.fillRect(x, log.y*TILE_SIZE, TILE_SIZE*2, TILE_SIZE);
        });
    });

    // Dibujar autos
    ctx.fillStyle = "#e74c3c";
    cars.forEach(car => {
        car.positions.forEach((pos,i) => {
            let x = (pos * TILE_SIZE + car.speed) % canvas.width;
            ctx.fillRect(x, car.y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });
    });

    // Dibujar rana
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(frog.x*TILE_SIZE, frog.y*TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // Actualizar score y colisiones
    checkCollision();
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
}

// 🔹 Comprobar colisiones y logica
function checkCollision() {
    // Collisión con coches
    for(let car of cars){
        car.positions.forEach((pos,i) => {
            let carX = (pos * TILE_SIZE + car.speed) % canvas.width;
            let carRect = {x: carX, y: car.y*TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE};
            if(frog.x*TILE_SIZE < carRect.x + carRect.width &&
               frog.x*TILE_SIZE + TILE_SIZE > carRect.x &&
               frog.y*TILE_SIZE < carRect.y + carRect.height &&
               frog.y*TILE_SIZE + TILE_SIZE > carRect.y){
                   gameOver = true;
                   alert(`Game Over 😵\nScore: ${score}`);
            }
        });
    }

    // Collisión con río
    if(frog.y>=0 && frog.y<=3){
        let onLog = false;
        for(let log of logs){
            if(log.y === frog.y){
                log.positions.forEach(pos=>{
                    let logX = (pos*TILE_SIZE + log.speed) % canvas.width;
                    if(frog.x*TILE_SIZE + TILE_SIZE > logX && frog.x*TILE_SIZE < logX + TILE_SIZE*2){
                        onLog = true;
                        frog.x += log.speed / TILE_SIZE;
                    }
                });
            }
        }
        if(!onLog){
            gameOver = true;
            alert(`Game Over 😵\nScore: ${score}`);
        }
    }

    // Meta
    if(frog.y === 0){
        score += 10;
        frog.x = 4;
        frog.y = 9;
    }
}

// 🔹 Loop principal
function loop() {
    if(gameOver) return;

    // Mover autos
    cars.forEach(car => {
        for(let i=0;i<car.positions.length;i++){
            car.positions[i] += car.speed/50;
            if(car.positions[i]*TILE_SIZE > canvas.width) car.positions[i] = -1;
        }
    });

    // Mover logs
    logs.forEach(log => {
        for(let i=0;i<log.positions.length;i++){
            log.positions[i] += log.speed/50;
            if(log.positions[i]*TILE_SIZE > canvas.width) log.positions[i] = -2;
        }
    });

    draw();
    requestAnimationFrame(loop);
}

loop();
