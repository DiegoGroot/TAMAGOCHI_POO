from fastapi import FastAPI, Request, Body
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.responses import Response
from starlette.types import Scope
import sqlite3, os, socket
import datetime # Importamos datetime para la marca de tiempo

# -------------------------------------------------------
# CONFIGURACIÓN GENERAL
# -------------------------------------------------------
app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

# Carpetas necesarias
static_dir = os.path.join(BASE_DIR, "static")
templates_dir = os.path.join(BASE_DIR, "templates")

os.makedirs(static_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)


# -------------------------------------------------------
# SERVIDOR ESTÁTICO (para evitar errores con .js)
# -------------------------------------------------------
class JavaScriptStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope: Scope) -> Response:
        response = await super().get_response(path, scope)
        if path.endswith(".js"):
            response.media_type = "application/javascript"
        return response

app.mount("/static", JavaScriptStaticFiles(directory=static_dir), name="static")


# -------------------------------------------------------
# SISTEMA DE TEMPLATES
# -------------------------------------------------------
templates = Jinja2Templates(directory=templates_dir)

# url_for manual → solo CSS/JS
templates.env.globals["url_for"] = lambda name, **params: f"/static/{params.get('filename','')}"


# -------------------------------------------------------
# BASE DE DATOS
# -------------------------------------------------------
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game TEXT NOT NULL,
                player TEXT NOT NULL,
                score INTEGER NOT NULL
            )
        """)
        conn.commit()


# -------------------------------------------------------
# LISTA DE JUEGOS
# -------------------------------------------------------
JUEGOS = [
    {"id": "snake", "nombre": "Snake", "imagen": "/static/assets/thumbs/snake.png", "desbloqueado": True},
    {"id": "blocks", "nombre": "Blocks", "imagen": "/static/assets/thumbs/blocks.png", "desbloqueado": True},
    {"id": "memory", "nombre": "Memoria", "imagen": "/static/assets/thumbs/memory.png", "desbloqueado": True},
    {"id": "pong", "nombre": "Pong", "imagen": "/static/assets/thumbs/pong.jpg", "desbloqueado": True},
    {"id": "simon", "nombre": "Simon Dice", "imagen": "/static/assets/thumbs/simon.png", "desbloqueado": True},
    {"id": "jumper", "nombre": "Jumper", "imagen": "/static/assets/thumbs/Jumper.png", "desbloqueado": True},
    {"id": "doodlejump", "nombre": "Doodle Jump", "imagen": "/static/assets/thumbs/doodlejump.png", "desbloqueado": True},
    {"id": "asteroids", "nombre": "Asteroids", "imagen": "/static/assets/thumbs/asteroids.jpg", "desbloqueado": True},
    {"id": "spaceinvaders", "nombre": "Space Invaders", "imagen": "/static/assets/thumbs/space.png", "desbloqueado": True},
    {"id": "flappybird", "nombre": "Flappy Bird", "imagen": "/static/assets/thumbs/bird.png", "desbloqueado": True},
    {"id": "mansion", "nombre": "Mansion", "imagen": "/static/assets/thumbs/mansion.png", "desbloqueado": True},
    {"id": "water", "nombre": "Water", "imagen": "/static/assets/thumbs/water.png", "desbloqueado": True},
    {"id": "cargame", "nombre": "Car Game", "imagen": "/static/assets/thumbs/cargame.png", "desbloqueado": True},
    {"id": "breakout", "nombre": "Breakout", "imagen": "/static/assets/thumbs/breakout.png", "desbloqueado": True},
    {"id": "frogger", "nombre": "Frogger", "imagen": "/static/assets/thumbs/frogger.png", "desbloqueado": True},

    # Final Boss (solo si jumper ≥ 500)
    {"id": "finalboss", "nombre": "Final Boss", "imagen": "/static/assets/thumbs/finalboss.png", "desbloqueado": False},
]


# -------------------------------------------------------
# FUNCIONES AUXILIARES
# -------------------------------------------------------
def desbloquear_juego(id):
    for j in JUEGOS:
        if j["id"] == id:
            j["desbloqueado"] = True
            return True
    return False


def get_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except:
        ip = "127.0.0.1"
    finally:
        try: s.close()
        except: pass
    return ip


# -------------------------------------------------------
# RUTAS DE NAVEGACIÓN PRINCIPAL
# -------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def inicio(request: Request):
    """
    Ruta raíz: Carga la página de Inicio/Login (inicio.html). 
    """
    return templates.TemplateResponse("inicio.html", {"request": request, "title": "PetVirtua"})

@app.get("/inicio", response_class=HTMLResponse)
def inicio_fallback(request: Request):
    """Ruta /inicio por si acaso se usa en la navegación interna."""
    return templates.TemplateResponse("inicio.html", {"request": request, "title": "PetVirtua"})

@app.get("/logout", response_class=RedirectResponse)
def logout():
    """Cierra la sesión y redirige a la raíz (/)."""
    return RedirectResponse(url="/", status_code=302)


# --- RUTA DEL DASHBOARD DE MÉTRICAS (CORREGIDA) ---
# Se mantiene solo la ruta '/usuario' que es la que se usa en el JS.
@app.get("/usuario", response_class=HTMLResponse)
# 🛑 Eliminamos la ruta secundaria "@app.get("usuario/estadisticas", ...)" para evitar conflictos.
def dashboard_usuario(request: Request):
    """
    Muestra el Panel de Métricas del Usuario (templates/usuario.html). 
    """
    # ✅ Asumimos que el archivo HTML del dashboard se llama 'usuario.html'
    return templates.TemplateResponse("usuario.html", {"request": request, "title": "Panel de Métricas"})


# -------------------------------------------------------
# MENÚ DEL ARCADE
# -------------------------------------------------------
@app.get("/juegos", response_class=HTMLResponse)
def menu(request: Request):
    """Muestra el listado de juegos."""
    return templates.TemplateResponse("juegos.html", {"request": request, "juegos": JUEGOS})

@app.get("/{id}", response_class=HTMLResponse)
def redirigir_juego(id: str):
    """
    Intenta redirigir rutas cortas a la ruta completa del juego.
    """
    
    # 🛑 CORRECCIÓN CLAVE: Ignoramos rutas que contienen una extensión (.html, .css, etc.)
    if "." in id:
        return HTMLResponse("<h1>❌ Recurso no encontrado</h1>", status_code=404)
        
    # Si ID coincide con un juego, redirigimos a la ruta /juego/{id}
    if any(j["id"] == id for j in JUEGOS):
        return RedirectResponse(url=f"/juego/{id}")
    
    # Si no es un juego, devuelve un error 404
    return HTMLResponse("<h1>❌ Recurso no encontrado</h1>", status_code=404)


# -------------------------------------------------------
# PÁGINA DE UN JUEGO ESPECÍFICO
# -------------------------------------------------------
@app.get("/juego/{id}", response_class=HTMLResponse)
def juego(request: Request, id: str):
    juego = next((j for j in JUEGOS if j["id"] == id), None)

    if not juego:
        return HTMLResponse(f"<h1>❌ El juego '{id}' no existe.</h1>", status_code=404)

    if not juego["desbloqueado"]:
        return templates.TemplateResponse("bloqueado.html", {"request": request})

    html_file = f"{id}.html"
    html_path = os.path.join(templates_dir, html_file)

    if not os.path.exists(html_path):
        return templates.TemplateResponse("bloqueado.html", {"request": request, "title": juego["nombre"]})

    return templates.TemplateResponse(html_file, {"request": request, "juego": juego, "title": juego["nombre"]})


# -------------------------------------------------------
# API JSON (Sin cambios)
# -------------------------------------------------------

@app.post("/api/register")
async def register(data: dict = Body(...)):
    if not all(k in data for k in ("username", "password")):
        return JSONResponse({"status": "error", "message": "Datos incompletos para registro"}, status_code=400)
    
    username = data["username"]
    password = data["password"]
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")

    print(f"\n[{timestamp}] 💻 REGISTRO RECIBIDO DESDE JAVA:")
    print(f"  Usuario: {username}, Contraseña: {password}")

    return {"status": "ok", "message": "Recibido por API"}


@app.get("/api/juegos")
def api_juegos():
    return {"status": "ok", "data": JUEGOS}


@app.get("/api/desbloqueo")
def api_estado_desbloqueo():
    return {j["id"]: j["desbloqueado"] for j in JUEGOS}


@app.post("/api/desbloquear/{id}")
def api_desbloquear(id: str):
    if desbloquear_juego(id):
        return {"status": "ok", "desbloqueado": id}
    return JSONResponse({"status": "error", "message": "Juego no encontrado"}, status_code=404)


@app.post("/api/score")
async def save_score(data: dict = Body(...)):
    if not all(k in data for k in ("game", "player", "score")):
        return JSONResponse({"status": "error", "message": "Datos incompletos"}, status_code=400)

    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO scores (game, player, score) VALUES (?, ?, ?)",
                      (data["game"], data["player"], data["score"]))
            conn.commit()

        if data["game"] == "jumper" and int(data["score"]) >= 500:
            desbloquear_juego("finalboss")

        return {"status": "ok"}

    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


# -------------------------------------------------------
# SERVIDOR UVICORN
# -------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    init_db()
    ip = get_ip()

    print("✅ Servidor FastAPI iniciado correctamente.")
    print(f"  Local: http://127.0.0.1:8000")
    print(f"  LAN:   http://{ip}:8000")

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)