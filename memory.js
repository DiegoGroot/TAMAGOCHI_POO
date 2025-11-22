const memoryArea = document.getElementById('memoryArea');
const scoreEl = document.getElementById('score');
const lastScoreEl = document.getElementById('lastScore');

const MemoryGame = (function () {
    // Configuraciones por defecto (Fácil: 3x4)
    let rows = 3, cols = 4;
    
    // Lista de iconos (mínimo 10 para 4x5 = 20 tarjetas / 2 = 10 iconos)
    const allIcons = ['🍎','🍌','🍇','🍓','🍉','🥝','🍍','🍒','🥭','🥥','🍑','🍋'];
    
    let first = null, second = null, lock = false, matches = 0, totalCards = 0;

    // Cargar último puntaje al inicio
    const savedScore = localStorage.getItem('memory_lastScore');
    lastScoreEl.textContent = savedScore || '--';

    // Función auxiliar para mezclar un array
    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    // Configuración de dificultad (NUEVO)
    function setConfig(newRows, newCols) {
        rows = newRows;
        cols = newCols;
    }

    function buildBoard() {
        memoryArea.innerHTML = '';
        totalCards = rows * cols;
        const requiredIcons = totalCards / 2;

        if (requiredIcons > allIcons.length) {
            console.error('No hay suficientes iconos para este tamaño de tablero.');
            return;
        }

        // 1. Ajustar el estilo de la cuadrícula dinámicamente
        memoryArea.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // 2. Crear el mazo
        let deck = allIcons.slice(0, requiredIcons);
        deck = deck.concat(deck);
        deck = shuffle(deck);

        // 3. Crear las tarjetas
        deck.forEach((val) => {
            const card = document.createElement('div'); // Cambiado a <div> por semántica
            card.className = 'mem-card';
            card.dataset.val = val;
            
            // Contenido frontal y trasero
            card.innerHTML = `
                <span class="mem-front">?</span>
                <span class="mem-back">${val}</span>
            `;
            card.addEventListener('click', () => flipCard(card));
            memoryArea.appendChild(card);
        });

        matches = 0;
        scoreEl.textContent = matches;
    }

    function flipCard(card) {
        // Ignorar si está bloqueado, ya volteada o es la misma tarjeta
        if (lock || card.classList.contains('flipped') || card === first) return;

        card.classList.add('flipped');

        if (!first) {
            // Primera tarjeta volteada
            first = card;
        } else {
            // Segunda tarjeta volteada
            second = card;
            lock = true;
            
            setTimeout(() => {
                if (first.dataset.val === second.dataset.val) {
                    // Coincidencia
                    first.classList.add('matched');
                    second.classList.add('matched');
                    first.style.pointerEvents = 'none'; // Desactivar clics en tarjetas encontradas
                    second.style.pointerEvents = 'none';
                    
                    matches++;
                    scoreEl.textContent = matches;
                    
                    if (matches === totalCards / 2) {
                        // Juego Completado
                        titleFlash('¡Juego Completado!', 1500);
                        saveScore();
                    }
                } else {
                    // No Coincidencia
                    first.classList.remove('flipped');
                    second.classList.remove('flipped');
                }
                
                // Resetear el estado
                first = second = null;
                lock = false;
            }, 800); // Tiempo de volteo ligeramente más largo
        }
    }

    function titleFlash(text, ms=900) {
        const prev = document.getElementById('titulo').textContent;
        document.getElementById('titulo').textContent = text;
        setTimeout(() => document.getElementById('titulo').textContent = prev, ms);
    }

    function saveScore() {
        localStorage.setItem('memory_lastScore', matches);
        lastScoreEl.textContent = matches;
    }

    function start() {
        buildBoard();
    }

    function stop() {
        memoryArea.innerHTML = '';
        first = second = null;
        lock = false;
        matches = 0;
    }

    // Exportar la nueva función de configuración
    return { start, stop, saveScore, setConfig };
})();