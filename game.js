// --- ESTADOS INICIALES ---
const petStats = {
    hunger: 70,
    happiness: 80,
    energy: 50
};

const gameSettings = {
    sound: true,
    music: true
};

let currentRoom = 'sala';

// --- DATOS DE LAS HABITACIONES ---
const roomData = {
    'sala': {
        title: 'Sala de Estar',
        actions: ['play'] 
    },
    'cocina': {
        title: 'Cocina',
        actions: ['feed'] 
    },
    'dormitorio': {
        title: 'Dormitorio',
        actions: ['sleep'] 
    },
    'bano': {
        title: 'Baño',
        actions: [] 
    },
    'jardin': {
        title: 'Jardín',
        actions: ['play'] 
    },
    'tienda': {
        title: 'Tienda',
        actions: [] 
    }
};


// --- SELECTORES DEL DOM ---
const hungerBar = document.getElementById('hunger-bar');
const happinessBar = document.getElementById('happiness-bar');
const energyBar = document.getElementById('energy-bar');

const actionButtonsContainer = document.getElementById('action-buttons');
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const sleepBtn = document.getElementById('sleep-btn');

const roomNav = document.getElementById('room-nav');
const roomButtons = document.querySelectorAll('.room-btn');
const petArea = document.getElementById('pet-area');

// MODIFICADO: Selectores de animación
const roomContent = document.getElementById('room-content');
const currentRoomTitle = document.getElementById('current-room-title');

// Selectores de Modal de Ajustes
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const toggleSoundBtn = document.getElementById('toggle-sound-btn');
const toggleMusicBtn = document.getElementById('toggle-music-btn');
const settingsModalOverlay = document.getElementById('settings-modal-overlay');
const settingsModalCloseBtn = document.getElementById('settings-modal-close-btn');


// --- FUNCIONES DE LÓGICA ---
function updateUI() {
    hungerBar.value = petStats.hunger;
    happinessBar.value = petStats.happiness;
    energyBar.value = petStats.energy;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

// ==========================================
// --- LÓGICA DE CAMBIO DE CUARTO (MODIFICADA) ---
// ==========================================
function changeRoom(newRoom) {
    // Evitar clics dobles mientras se anima
    if (currentRoom === newRoom || roomContent.classList.contains('entering')) {
        return;
    }
    
    // 1. Iniciar animación de SALIDA
    roomContent.classList.add('exiting');
    currentRoom = newRoom; // Actualizar estado

    // 2. Esperar que termine la animación de salida (300ms, como en el CSS)
    setTimeout(() => {
        // 3. Actualizar el contenido (mientras está invisible)
        const data = roomData[newRoom];
        currentRoomTitle.textContent = data.title;
        
        // (Opcional) Actualizar Fondo
        // petArea.style.backgroundImage = data.background; 

        // 4. Actualizar botones de acción
        feedBtn.style.display = data.actions.includes('feed') ? 'block' : 'none';
        playBtn.style.display = data.actions.includes('play') ? 'block' : 'none';
        sleepBtn.style.display = data.actions.includes('sleep') ? 'block' : 'none';

        // 5. Iniciar animación de ENTRADA
        roomContent.classList.remove('exiting');
        roomContent.classList.add('entering');
        
        // Forzar un "reflow" (truco de JS) para que la animación 'entering' se aplique
        void roomContent.offsetWidth; 
        
        // 6. Quitar 'entering' para que la transición a (opacity: 1, transform: 0) ocurra
        roomContent.classList.remove('entering');

    }, 300); // Debe coincidir con la transición CSS

    // 7. Actualizar botones de navegación (esto es instantáneo)
    roomButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.room === newRoom);
    });
}


// --- FUNCIONES DE ACCIÓN ---
function feed() {
    petStats.hunger = clamp(petStats.hunger + 15, 0, 100);
    petStats.energy = clamp(petStats.energy - 5, 0, 100);
    updateUI();
}

function play() {
    petStats.happiness = clamp(petStats.happiness + 20, 0, 100);
    petStats.energy = clamp(petStats.energy - 10, 0, 100);
    petStats.hunger = clamp(petStats.hunger - 5, 0, 100);
    updateUI();
}

function sleep() {
    petStats.energy = 100;
    petStats.hunger = clamp(petStats.hunger - 10, 0, 100);
    updateUI();
}

// --- BUCLE DEL JUEGO (Game Loop) ---
function gameTick() {
    petStats.hunger = clamp(petStats.hunger - 1, 0, 100);
    petStats.happiness = clamp(petStats.happiness - 1, 0, 100);
    updateUI();
}

// --- EVENT LISTENERS (Acciones) ---
feedBtn.addEventListener('click', feed);
playBtn.addEventListener('click', play);
sleepBtn.addEventListener('click', sleep);


// --- EVENT LISTENERS (Navegación de Cuartos) ---
roomNav.addEventListener('click', (e) => {
    const clickedButton = e.target.closest('.room-btn');
    if (clickedButton) {
        changeRoom(clickedButton.dataset.room);
    }
});


// --- EVENT LISTENTEERS (Menú de Ajustes) ---
function openSettingsModal() {
    settingsModalOverlay.classList.add('visible');
}
function closeSettingsModal() {
    settingsModalOverlay.classList.remove('visible');
}

settingsToggleBtn.addEventListener('click', openSettingsModal);
settingsModalCloseBtn.addEventListener('click', closeSettingsModal);
settingsModalOverlay.addEventListener('click', (e) => {
    if (e.target === settingsModalOverlay) {
        closeSettingsModal();
    }
});

toggleSoundBtn.addEventListener('click', () => {
    gameSettings.sound = !gameSettings.sound;
    toggleSoundBtn.textContent = gameSettings.sound ? 'Sonidos: SÍ' : 'Sonidos: NO';
    console.log("Sonidos:", gameSettings.sound);
});

toggleMusicBtn.addEventListener('click', () => {
    gameSettings.music = !gameSettings.music;
    toggleMusicBtn.textContent = gameSettings.music ? 'Música: SÍ' : 'Música: NO';
    console.log("Música:", gameSettings.music);
});


// --- INICIALIZACIÓN DEL JUEGO ---
console.log("¡Dashboard del juego cargado!");
updateUI(); 
changeRoom(currentRoom); 
setInterval(gameTick, 3000);