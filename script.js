/* ==========================================================
   ESTADO DE SPARKY
   ========================================================== */

let sparkyStatus = {
    hambre: 70, 
    felicidad: 80,
    energia: 50 
};

/* ==========================================================
   SELECTORES DEL DOM
   ========================================================== */

// Los selectores de login/registro se asumen que están en 'script.js' si es la página de inicio. 
// Aquí solo nos enfocamos en la lógica de la mascota.

const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsModalOverlay = document.getElementById('settings-modal-overlay');
const settingsModalCloseBtn = document.getElementById('settings-modal-close-btn');

/* ==========================================================
   FUNCIONES DE JUEGO
   ========================================================== */

function updateStatBars() {
    // Busca los elementos por su ID para mayor fiabilidad
    const hungerBar = document.getElementById('hunger-bar');
    const happinessBar = document.getElementById('happiness-bar');
    const energyBar = document.getElementById('energy-bar');

    if (hungerBar) hungerBar.value = sparkyStatus.hambre;
    if (happinessBar) happinessBar.value = sparkyStatus.felicidad;
    if (energyBar) energyBar.value = sparkyStatus.energia;
}


function handlePetAction(accion) {
    let mensaje;

    switch (accion) {
        case 'alimentar':
            sparkyStatus.hambre = Math.max(0, sparkyStatus.hambre - 30);
            sparkyStatus.felicidad = Math.min(100, sparkyStatus.felicidad + 15);
            mensaje = "Sparky ha comido. ¡Ya no tiene tanta hambre!";
            break;

        case 'jugar':
            sparkyStatus.hambre = Math.min(100, sparkyStatus.hambre + 10);
            sparkyStatus.felicidad = Math.min(100, sparkyStatus.felicidad + 30);
            sparkyStatus.energia = Math.max(0, sparkyStatus.energia - 20);
            mensaje = "Sparky está muy feliz después de jugar.";
            break;

        case 'dormir':
            sparkyStatus.hambre = Math.min(100, sparkyStatus.hambre + 5);
            sparkyStatus.felicidad = Math.min(100, sparkyStatus.felicidad + 10);
            sparkyStatus.energia = Math.min(100, sparkyStatus.energia + 40);
            mensaje = "Sparky está descansando. ¡Dulces sueños!";
            break;

        case 'salir':
            // Esta acción se manejaría desde la barra lateral, pero se mantiene la función por si acaso.
            window.location.href = '/logout';
            return;
    }
    
    updateStatBars(); 
    console.log(mensaje); // Reemplazamos 'alert' con 'console.log' para no interrumpir el flujo.
}

/* ==========================================================
   EVENTOS Y MODAL DE AJUSTES
   ========================================================== */

function openSettingsModal() {
    if (settingsModalOverlay) settingsModalOverlay.classList.add('visible');
}

function closeSettingsModal() {
    if (settingsModalOverlay) settingsModalOverlay.classList.remove('visible');
}

/* ==========================================================
   INICIALIZACIÓN DEL DASHBOARD (Página /usuario)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar barras con el estado actual
    updateStatBars();

    // 2. Eventos de los botones de acción
    document.getElementById('action-buttons').addEventListener('click', (e) => {
        if (!e.target.tagName === 'BUTTON') return; 

        const actionId = e.target.id;

        switch (actionId) {
            case 'feed-btn': handlePetAction('alimentar'); break;
            case 'play-btn': handlePetAction('jugar'); break;
            case 'sleep-btn': handlePetAction('dormir'); break;
        }
    });

    // 3. Eventos del Modal de Ajustes
    if (settingsToggleBtn) {
        settingsToggleBtn.addEventListener('click', openSettingsModal);
    }
    if (settingsModalCloseBtn) {
        settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
    }
    if (settingsModalOverlay) {
        settingsModalOverlay.addEventListener('click', (e) => {
            if (e.target === settingsModalOverlay) {
                closeSettingsModal();
            }
        });
    }

    // 4. Lógica de cambio de habitación
    const roomNav = document.getElementById('room-nav');
    const roomTitle = document.getElementById('current-room-title');

    if (roomNav && roomTitle) {
        roomNav.addEventListener('click', (e) => {
            if (!e.target.classList.contains('room-btn')) return;

            // Remover la clase activa de todos los botones
            roomNav.querySelectorAll('.room-btn').forEach(btn => btn.classList.remove('active'));

            // Añadir la clase activa al botón presionado
            e.target.classList.add('active');

            // Actualizar el título
            const roomName = e.target.title; 
            roomTitle.textContent = roomName;
            
            // Aquí agregarías la lógica para cambiar la imagen de fondo/sprite de la mascota
            console.log(`Cambiando a la habitación: ${roomName}`);
        });
    }
});