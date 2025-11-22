// ==========================================================
// --- 1. PLANTILLAS HTML (Formularios) ---
// ==========================================================
const loginFormHTML = `
    <span class="modal-close">&times;</span>
    <h1 class="text-gradient">Iniciar Sesión</h1>
    <form id="login-form">
        <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" placeholder="tu@correo.com" required>
        </div>
        <div class="input-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="Tu contraseña" required>
        </div>
        <button type="submit" class="btn-form">Entrar</button>
        <p class="form-link">
            ¿No tienes cuenta? <a href="#" class="link-to-register">Regístrate</a>
        </p>
    </form>
`;

const registerFormHTML = `
    <span class="modal-close">&times;</span>
    <h1 class="text-gradient">Crear una Cuenta</h1>
    <form id="register-form">
        <div class="input-group">
            <label for="username">Nombre de Usuario</label>
            <input type="text" id="username" name="username" placeholder="Elige un nombre" required>
        </div>
        <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" placeholder="tu@correo.com" required>
        </div>
        <div class="input-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="Mínimo 8 caracteres" required>
        </div>
        <button type="submit" class="btn-form">Registrarse</button>
        <p class="form-link">
            ¿Ya tienes cuenta? <a href="#" class="link-to-login">Inicia Sesión</a>
        </p>
    </form>
`;

// ==========================================================
// --- 2. SELECTORES DEL DOM ---
// ==========================================================
const loginBtn = document.getElementById('open-login-btn');
const registerBtn = document.getElementById('open-register-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = modalOverlay ? modalOverlay.querySelector('.modal-box') : null;

// Selectores de la pantalla de carga
const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgressBar = document.getElementById('loading-progress-bar');
const loadingText = document.getElementById('loading-text');

// ==========================================================
// --- 3. FUNCIONES DE UTILIDAD ---
// ==========================================================
function openModal(contentHTML) {
    if (modalBox) {
        modalBox.innerHTML = contentHTML;
        modalOverlay.classList.add('visible');
    }
}

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('visible');
        if (modalBox) {
            modalBox.innerHTML = '';
        }
    }
}

// ==========================================================
// --- 4. EVENT LISTENERS (Abrir/Cerrar Modales) ---
// ==========================================================

// Listener para abrir el Login
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginFormHTML);
    });
}

// Listener para abrir el Registro
if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(registerFormHTML);
    });
}

// Listener general para cerrar y cambiar formularios
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        // Cerrar si clic fuera o en la X
        if (e.target === modalOverlay || e.target.classList.contains('modal-close')) {
            closeModal();
        }
        // Cambiar a Registro
        if (e.target.classList.contains('link-to-register')) {
            e.preventDefault();
            openModal(registerFormHTML);
        }
        // Cambiar a Login
        if (e.target.classList.contains('link-to-login')) {
            e.preventDefault();
            openModal(loginFormHTML);
        }
    });
}


// ==========================================================
// --- 5. LÓGICA DE SIMULACIÓN Y REDIRECCIÓN A '/USUARIO' ---
// ==========================================================

if (modalBox) {
    modalBox.addEventListener('submit', (e) => {
        e.preventDefault();

        // Verificamos que sea uno de nuestros formularios
        if (e.target.id === 'login-form' || e.target.id === 'register-form') {
            
            console.log("Formulario enviado. Iniciando carga...");
            
            closeModal(); 
            if (loadingOverlay) {
                loadingOverlay.classList.add('visible'); // Muestra la carga
            }
            
            // Variables para la animación de la barra
            let progress = 0;
            const totalDuration = 2000; // Duración total: 2 segundos
            const intervalTime = 100;   // Actualización cada 100ms
            const steps = totalDuration / intervalTime;
            const progressIncrement = 100 / steps;

            const loadingInterval = setInterval(() => {
                progress += progressIncrement;

                // Cuando la carga llega al 100%
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(loadingInterval);
                    if (loadingText) {
                         loadingText.textContent = "¡Bienvenido!";
                    }
                    
                    // ✅ REDIRECCIÓN FINAL CORRECTA A LA RUTA DEL DASHBOARD
                    setTimeout(() => {
                        window.location.href = '/usuario'; 
                    }, 500); 
                }

                // Actualizar la barra visualmente
                if(loadingProgressBar) {
                    loadingProgressBar.style.width = `${progress}%`;
                }
                if(loadingText) {
                    loadingText.textContent = `Conectando... ${Math.floor(progress)}%`;
                }
                
            }, intervalTime);
        }
    });
}