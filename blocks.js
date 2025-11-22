const blocksCanvas = document.getElementById('blocksCanvas');
const scoreEl = document.getElementById('score');
const extraEl = document.getElementById('extra');
const titulo = document.getElementById('titulo');

let score = 0;

const Blocks = (function () {
    const canvas = blocksCanvas;
    const ctx = canvas.getContext('2d');
    let frameId, running = false, paused = false;

    let config = {
        canvasBgColor: '#071029',
        minDropSpeed: 2,
        paddleWidth: 80
    };

    let paddle = { x: 0, y: 0, w: config.paddleWidth, h: 12, vx: 0 };
    let drops = [];
    let spawnTimer = 0;
    let lives = 3;

    function loadConfig() {
        try {
            const savedConfig = localStorage.getItem('blocksConfig');
            if (savedConfig) {
                config = JSON.parse(savedConfig);
                paddle.w = config.paddleWidth;
            }
        } catch (e) {
            console.error('Error al cargar la configuración:', e);
        }
    }

    function saveConfig() {
        localStorage.setItem('blocksConfig', JSON.stringify(config));
    }

    loadConfig();

    function setConfig(newConfig) {
        Object.assign(config, newConfig);
        paddle.w = config.paddleWidth;
        saveConfig();
    }

    function getConfig(key) {
        return config[key];
    }

    function reset() {
        drops = [];
        spawnTimer = 0;
        score = 0;
        lives = 3;
        paddle.x = canvas.width / 2 - paddle.w / 2;
        paddle.y = canvas.height - 24;
        scoreEl.textContent = score;
        extraEl.textContent = lives;
    }

    function spawnDrop() {
        drops.push({
            x: Math.random() * (canvas.width - 12),
            y: -12,
            vy: config.minDropSpeed + Math.random() * 2,
            size: 12,
            color: '#f59e0b'
        });
    }

    function draw() {
        ctx.fillStyle = config.canvasBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

        drops.forEach(d => {
            ctx.fillStyle = d.color;
            ctx.fillRect(d.x, d.y, d.size, d.size);
        });
    }

    function update() {
        paddle.x += paddle.vx;
        paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

        for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];
            d.y += d.vy;

            if (d.y > canvas.height) {
                drops.splice(i, 1);
                lives--;
                extraEl.textContent = lives;
                if (lives <= 0) {
                    stop();
                    titleFlash('Game Over');
                    saveScore();
                    return;
                }
                continue;
            }

            if (d.y + d.size >= paddle.y &&
                d.x + d.size > paddle.x &&
                d.x < paddle.x + paddle.w) {
                drops.splice(i, 1);
                score += 5;
                scoreEl.textContent = score;
            }
        }

        spawnTimer++;
        if (spawnTimer > 30) {
            spawnTimer = 0;
            spawnDrop();
        }
    }

    function loop() {
        if (!running) return;
        if (!paused) update();
        draw();
        frameId = requestAnimationFrame(loop);
    }

    function onKey(e) {
        if (e.key === 'ArrowLeft') paddle.vx = -6;
        else if (e.key === 'ArrowRight') paddle.vx = 6;
        else if (e.key === ' ') paused = !paused;
    }

    function onKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') paddle.vx = 0;
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, x - paddle.w / 2));
    }

    function titleFlash(text, ms = 900) {
        const prev = titulo.textContent;
        titulo.textContent = text;
        setTimeout(() => (titulo.textContent = prev), ms);
    }

    function saveScore() {
        fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game: "blocks", player: "Jugador", score: score })
        });
        localStorage.setItem('ultimaPuntuacionBlocks', score);
    }

    function pause(shouldPause) {
        if (running) {
            paused = shouldPause;
            if (shouldPause) titleFlash('PAUSA');
            else titleFlash('Blocks');
        }
    }

    function start() {
        if (running) return;
        running = true;
        paused = false;
        reset();
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKeyUp);
        canvas.addEventListener('mousemove', onMouseMove);
        frameId = requestAnimationFrame(loop);
    }

    function stop() {
        running = false;
        cancelAnimationFrame(frameId);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('mousemove', onMouseMove);
    }

    return { start, stop, saveScore, setConfig, getConfig, pause };
})();
