const BOX = 20;
const MAX_HIGH_SCORES = 5;

// Mapeo de colores/sprites a estilos de dibujo
const colors = {
    verde: { head: "#00FF00", body: "#009900" },
    azul: { head: "#00FFFF", body: "#00AABB" },
    rojo: { head: "#FF5555", body: "#AA0000" }
    // Puedes añadir más colores/sprites si los defines en el modal de configuración
};


document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");

    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const configBtn = document.getElementById("configBtn");
    const endGameBtn = document.getElementById("endGameBtn");
    
    // Modales y Controles
    const configModal = document.getElementById("configModal");
    const closeModal = document.getElementById("closeModal");
    const recordModal = document.getElementById("recordModal");
    
    // Elementos de Configuración
    const bgColorInput = document.getElementById("bgColor");
    const bgImageSelect = document.getElementById("bgImage");
    const spriteSelect = document.getElementById("snakeSprite");
    const speedSelect = document.getElementById("snakeSpeed");
    const gridSizeSelect = document.getElementById("gridSize");
    const wrapModeSelect = document.getElementById("wrapMode");
    const saveConfigBtn = document.getElementById("saveConfig");
    const applyPreviewBtn = document.getElementById("applyPreview");
    
    // Elementos de Récord
    const finalScoreEl = document.getElementById("finalScore");
    const playerNameInput = document.getElementById("playerName");
    const saveRecordBtn = document.getElementById("saveRecordBtn");
    const highScoreTableBody = document.querySelector("#highScoreTable tbody");
    
    // *************************************************************
    // ** MODAL GENÉRICO (Reemplazo de alert()) - REQUIERE HTML **
    // *************************************************************
    const messageModal = document.getElementById("messageModal");
    const messageModalTitle = document.getElementById("messageModalTitle");
    const messageModalText = document.getElementById("messageModalText");
    const messageModalClose = document.getElementById("messageModalClose");

    // Helper function para mostrar un modal con mensajes simples
    function showMessageModal(title, message) {
        if (messageModal && messageModalTitle && messageModalText) {
            messageModalTitle.textContent = title;
            messageModalText.textContent = message;
            messageModal.style.display = "flex";
        } else {
            // Fallback en consola si el modal no se encuentra (para debugging)
            console.error("Modal element not found (messageModal). Check HTML structure.");
            console.log(`[Message: ${title}] ${message}`);
        }
    }
    
    if (messageModalClose) {
        messageModalClose.addEventListener("click", () => {
            messageModal.style.display = "none";
        });
    }

    // Configuración y Estado del Juego
    let config = JSON.parse(localStorage.getItem("snake_config") || "null") || {
        bgColor: "#1a1a1a", // Fondo oscuro por defecto
        bgImage: "",
        sprite: "verde",
        speed: 120,
        gridSize: 400,
        wrapMode: "false"
    };

    let highScores = JSON.parse(localStorage.getItem("snake_highscores") || "[]");
    
    let snake = [];
    let direction = "RIGHT";
    let food = { x: 0, y: 0 };
    let running = false;
    let score = 0;
    let moveDelay = parseInt(config.speed || 120, 10);
    let lastTick = 0;

    // *************************************************************
    // ** FUNCIONES DE INICIALIZACIÓN Y DIBUJO **
    // *************************************************************

    function initAssets() {
        // 1. Set game speed
        moveDelay = parseInt(config.speed || 120, 10);

        // 2. Set canvas size (always a multiple of BOX)
        const rawSize = parseInt(config.gridSize || 400, 10);
        // Asegura que el tamaño es un múltiplo de BOX
        const gridCount = Math.floor(rawSize / BOX); 
        const newSize = gridCount * BOX;
        canvas.width = canvas.height = newSize;

        // 3. Apply background color to the canvas
        canvas.style.backgroundColor = config.bgColor;
    }
    
    function spawnFood() {
        const cols = canvas.width / BOX;
        const rows = canvas.height / BOX;
        let newFood;

        do {
            newFood = {
                x: Math.floor(Math.random() * cols) * BOX,
                y: Math.floor(Math.random() * rows) * BOX,
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        food = newFood;
    }
    
    function drawFood() {
        ctx.fillStyle = "#FF0000"; // Red food
        ctx.fillRect(food.x, food.y, BOX, BOX);
        
        // Efecto de brillo/borde
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(food.x + 1, food.y + 1, BOX - 2, BOX - 2);
    }
    
    function drawSnake() {
        const selectedColor = colors[config.sprite] || colors.verde;

        snake.forEach((segment, index) => {
            // Cabeza
            if (index === 0) {
                ctx.fillStyle = selectedColor.head;
            } else {
                // Cuerpo
                ctx.fillStyle = selectedColor.body;
            }

            ctx.fillRect(segment.x, segment.y, BOX, BOX);

            // Borde oscuro para separación de segmentos
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x, segment.y, BOX, BOX);
        });
    }

    function drawAll() { 
        // 1. Clear canvas and redraw background color
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = canvas.style.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Food
        drawFood();

        // 3. Draw Snake
        drawSnake();
    }

    // *************************************************************
    // ** LÓGICA DE PUNTUACIONES Y REINICIO **
    // *************************************************************
    
    function updateHighScoreDisplay() {
        // Mostrar el mejor récord en el elemento 'highScoreEl'
        const bestScore = highScores.length > 0 ? highScores[0].score : 0;
        highScoreEl.textContent = bestScore;

        // Llenar la tabla
        highScoreTableBody.innerHTML = '';
        highScores.slice(0, MAX_HIGH_SCORES).forEach((record, index) => {
            const row = highScoreTableBody.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${record.name}</td><td>${record.score}</td>`;
        });
    }

    function resetGame() {
        const gridCenter = (canvas.width / BOX / 2);
        // Iniciar la serpiente en el centro de la cuadrícula
        snake = [{ 
            x: Math.floor(gridCenter) * BOX, 
            y: Math.floor(gridCenter) * BOX 
        }];
        direction = "RIGHT";
        score = 0;
        scoreEl.textContent = score;
        spawnFood();
        lastTick = performance.now();
        running = true;
        drawAll(); // Dibuja el estado inicial
    }

    function gameOver() {
        running = false;
        const currentBestScore = highScores.length > 0 ? highScores[0].score : 0;
        
        if (score > currentBestScore || highScores.length < MAX_HIGH_SCORES) {
            // Es un nuevo récord o hay espacio en la tabla
            finalScoreEl.textContent = score;
            playerNameInput.value = '';
            recordModal.style.display = "flex";
        } else {
            // No es un récord, solo Game Over
            showGameOverMessage(score);
        }
    }
    
    function showGameOverMessage(currentScore) {
         showMessageModal("💀 Game Over", `Tu puntuación final es: ${currentScore}. ¡Inténtalo de nuevo!`);
    }


    // *************************************************************
    // ** LÓGICA PRINCIPAL DEL JUEGO **
    // *************************************************************

    function updateLogic() {
        const head = { x: snake[0].x, y: snake[0].y };
        if (direction === "LEFT") head.x -= BOX;
        if (direction === "RIGHT") head.x += BOX;
        if (direction === "UP") head.y -= BOX;
        if (direction === "DOWN") head.y += BOX;

        // Lógica de teletransporte (Wrap Mode)
        const isWrapMode = config.wrapMode === "true";
        if (isWrapMode) {
            if (head.x < 0) head.x = canvas.width - BOX;
            if (head.x >= canvas.width) head.x = 0;
            if (head.y < 0) head.y = canvas.height - BOX;
            if (head.y >= canvas.height) head.y = 0;
        } else {
            // Colisiones de bordes (Muro - Fin de Juego)
            if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
                return gameOver();
            }
        }

        // Colisión con si mismo
        if (snake.some((s, idx) => idx > 0 && s.x === head.x && s.y === head.y)) {
            return gameOver();
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.textContent = score;
            spawnFood();
        } else {
            snake.pop();
        }
    }

    function gameLoop(ts) {
        if (!running) return;
        if (!lastTick) lastTick = ts;
        const elapsed = ts - lastTick;
        if (elapsed >= moveDelay) {
            updateLogic();
            lastTick = ts;
        }
        drawAll();
        requestAnimationFrame(gameLoop);
    }

    // *************************************************************
    // ** EVENT LISTENERS **
    // *************************************************************

    // Teclado (Controles: Flechas y W/A/S/D)
    document.addEventListener("keydown", (e) => {
        if (!running) return;
        const key = e.key.toUpperCase();
        // Evita el movimiento inverso instantáneo
        if ((key === "ARROWLEFT" || key === "A") && direction !== "RIGHT") direction = "LEFT";
        if ((key === "ARROWRIGHT" || key === "D") && direction !== "LEFT") direction = "RIGHT";
        if ((key === "ARROWUP" || key === "W") && direction !== "DOWN") direction = "UP";
        if ((key === "ARROWDOWN" || key === "S") && direction !== "UP") direction = "DOWN";
    });

    // Botones de acción
    startBtn.addEventListener("click", () => {
        if (!running) {
            resetGame();
            requestAnimationFrame(gameLoop);
        }
    });

    endGameBtn.addEventListener("click", () => {
        if (running) {
            gameOver();
        }
    });

    restartBtn.addEventListener("click", () => {
        resetGame();
        requestAnimationFrame(gameLoop);
    });

    // Modal de Configuración
    configBtn.addEventListener("click", () => { configModal.style.display = "flex"; });
    closeModal.addEventListener("click", () => { configModal.style.display = "none"; });

    // Guardar y aplicar configuración
    function saveAndApplyConfig(applyPreview = false) {
        config.bgColor = bgColorInput.value;
        config.bgImage = bgImageSelect.value;
        config.sprite = spriteSelect.value;
        config.speed = speedSelect.value;
        config.gridSize = gridSizeSelect.value;
        config.wrapMode = wrapModeSelect.value;

        initAssets(); // Re-inicializa assets (tamaño, velocidad, sprites)
        resetGame();
        
        if (!applyPreview) {
            localStorage.setItem("snake_config", JSON.stringify(config));
            configModal.style.display = "none";
        }
        // drawAll() ya se llama dentro de resetGame() y el loop si está corriendo
    }

    saveConfigBtn.addEventListener("click", () => saveAndApplyConfig(false));
    applyPreviewBtn.addEventListener("click", () => saveAndApplyConfig(true));
    
    // Lógica de registro de récord
    saveRecordBtn.addEventListener("click", () => {
        const name = playerNameInput.value.trim().toUpperCase();
        if (name.length === 3) {
            highScores.push({ name: name, score: score });
            
            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, MAX_HIGH_SCORES);
            
            localStorage.setItem("snake_highscores", JSON.stringify(highScores));
            updateHighScoreDisplay();
            recordModal.style.display = "none";
            
            // Reemplazo de alert()
            showMessageModal("¡Récord Guardado!", `¡Felicidades, ${name}! Tu puntuación de ${score} ha sido guardada.`);
        } else {
            // Reemplazo de alert()
            showMessageModal("Error", "El nombre debe ser de 3 letras.");
        }
    });

    // *************************************************************
    // ** INICIALIZACIÓN **
    // *************************************************************

    function initUIFromConfig() {
        // Inicializar selectores de configuración con el valor guardado
        if (bgColorInput) bgColorInput.value = config.bgColor || "#1a1a1a";
        if (bgImageSelect) bgImageSelect.value = config.bgImage || "";
        if (spriteSelect) spriteSelect.value = config.sprite || "verde";
        if (speedSelect) speedSelect.value = config.speed || 120;
        if (gridSizeSelect) gridSizeSelect.value = config.gridSize || 400;
        if (wrapModeSelect) wrapModeSelect.value = config.wrapMode || "false";
        
        updateHighScoreDisplay();
    }

    // Proceso inicial
    initAssets();
    initUIFromConfig();
    resetGame();
    drawAll();
});