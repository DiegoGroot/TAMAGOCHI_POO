// =========================
// 🎮 CONTROL CENTRAL DE MINIJUEGOS
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById("bg-music");
  const btn = document.getElementById("music-btn");

  // =====================
  // 🎵 CONTROL DE MÚSICA
  // =====================
  if (music && btn) {
    music.volume = 0.4;

    const isPlaying = localStorage.getItem("musicPlaying") === "true";
    if (isPlaying) {
      music.play().catch(() => {});
      btn.textContent = "🔊";
    }

    btn.addEventListener("click", () => {
      if (music.paused) {
        music.play()
          .then(() => {
            btn.textContent = "🔊";
            localStorage.setItem("musicPlaying", "true");
          })
          .catch(() => console.warn("⚠️ Error al reproducir audio"));
      } else {
        music.pause();
        btn.textContent = "🎵";
        localStorage.setItem("musicPlaying", "false");
      }
    });
  }

  // =====================
  // 🔒 CONTROL DE DESBLOQUEOS
  // =====================
  async function actualizarDesbloqueo() {
    try {
      const res = await fetch('/api/desbloqueo');
      const estado = await res.json();

      document.querySelectorAll('.card').forEach(card => {
        const id = card.dataset.id;
        if (!estado[id]) {
          if (!card.classList.contains('locked')) {
            card.classList.add('locked');
            const lock = document.createElement('span');
            lock.className = 'lock-icon';
            lock.textContent = '🔒';
            card.appendChild(lock);
          }
        } else {
          card.classList.remove('locked');
          const lock = card.querySelector('.lock-icon');
          if (lock) lock.remove();
        }
      });
    } catch (err) {
      console.error("Error al obtener estados:", err);
    }
  }

  actualizarDesbloqueo();
  setInterval(actualizarDesbloqueo, 2500);
});
