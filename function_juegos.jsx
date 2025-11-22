const { useEffect, useState, createElement: e } = React;
const rootElement = document.getElementById('root'); 

function App() {
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar lista de juegos
    useEffect(() => {
        const fetchJuegos = async () => {
            try {
                const res = await fetch('/api/juegos');
                if (!res.ok) throw new Error(`Error HTTP ${res.status}.`);
                const data = await res.json();
                if (data.status !== "ok" || !Array.isArray(data.data)) {
                    throw new Error("Respuesta de API con formato incorrecto.");
                }
                setJuegos(data.data);
            } catch (err) {
                setError(`Fallo al cargar juegos: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchJuegos();
    }, []);

    const abrirJuego = id => window.location.href = `/juego/${id}`;

    if (loading) return e('div', { className: 'loading' }, '⏳ Cargando juegos...');
    if (error) return e('div', { className: 'error' }, `⚠️ ${error}`);

    // Los elementos se renderizan directamente dentro del main/game-grid-container (sin wrapper adicional)
    return e(React.Fragment, null, 
        juegos.map(j => {
            const bloqueado = !j.desbloqueado;
            return e('div', {
                key: j.id,
                className: `card ${bloqueado ? 'bloqueado' : ''}`,
                onClick: () => !bloqueado && abrirJuego(j.id)
            },
                e('div', { className: 'thumb' },
                    e('img', {
                        src: j.imagen,
                        alt: j.nombre,
                        onError: ev => ev.target.src = "https://placehold.co/150x150/8B6E4B/FFFFFF?text=Juego"
                    })
                ),
                e('div', { className: 'info' },
                    e('h3', null, j.nombre),
                    bloqueado ? e('p', null, '🔒 Bloqueado') : null
                )
            );
        })
    );
}

document.addEventListener('DOMContentLoaded', () => {
    // Apuntamos directamente a 'root'
    const container = document.getElementById('root'); 
    const root = ReactDOM.createRoot(container);
    root.render(e(App));

    // 🎵 Lógica de Música
    const music = document.getElementById("bg-music");
    const musicBtn = document.getElementById("music-btn"); 
    if (music && musicBtn) {
        music.volume = 0.4;
        const isPlaying = localStorage.getItem("musicPlaying") === "true";
        musicBtn.textContent = isPlaying ? "🔊" : "🎵"; 
        
        if (isPlaying) music.play().catch(() => {
            localStorage.setItem("musicPlaying", "false");
            musicBtn.textContent = "🎵";
        });
        
        musicBtn.addEventListener("click", async () => {
            if (music.paused) {
                await music.play();
                musicBtn.textContent = "🔊";
                localStorage.setItem("musicPlaying", "true");
            } else {
                music.pause();
                musicBtn.textContent = "🎵";
                localStorage.setItem("musicPlaying", "false");
            }
        });
    }

    // 🎨 Lógica de Cambio de Tema
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem("userTheme");
        // Aplicar el tema morado si se guardó
        if (savedTheme === "purple") {
            document.body.classList.add("theme-purple");
        } else if (savedTheme === "green"){
            // Aplicar el tema por defecto (marrón)
            document.body.classList.add("theme-purple");
        } else{
            documentbody.classList.remove("theme-purple");
        }

        themeToggleBtn.addEventListener("click", () => {
            const isPurple = document.body.classList.contains("theme-purple");
            if (isPurple) {
                document.body.classList.remove("theme-purple");
                localStorage.setItem("userTheme", "default"); 
            } else {
                document.body.classList.add("theme-purple");
                localStorage.setItem("userTheme", "purple"); 
            }
        });
    }
});