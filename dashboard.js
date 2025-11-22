document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Dashboard de Métricas cargado. Listo para interactuar.');

    // --- Selectores de Elementos Clave ---
    const userNameElement = document.getElementById('user-name');
    
    // Simulación de los selectores de las tarjetas de métricas
    const totalScoresValue = document.querySelector('.metric-card:nth-child(1) .card-value');
    const highestScoreValue = document.querySelector('.metric-card:nth-child(2) .card-value');


    /**
     * Función para simular la carga de datos del usuario desde la API de FastAPI.
     * En una aplicación real, aquí harías una llamada 'fetch'.
     */
    async function loadDashboardData() {
        // En un entorno de desarrollo real, la URL sería:
        // const API_URL = 'http://127.0.0.1:8000/api/metrics/current_user';
        
        try {
            // Ejemplo de FETCH (Asume que tu API devuelve un JSON con las métricas):
            /*
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar datos del dashboard.');
            }
            const data = await response.json();
            */

            // --- DATOS SIMULADOS ---
            const data = {
                name: "Julián Márquez",
                total_scores: "5,301",
                highest_score: "3,450",
                highest_score_game: "Defensa del Reino",
                // ... y el resto de las 8 métricas
            };
            
            // --- ACTUALIZACIÓN DE LA INTERFAZ ---
            if (userNameElement) {
                userNameElement.textContent = data.name;
            }

            if (totalScoresValue) {
                totalScoresValue.textContent = data.total_scores;
            }

            if (highestScoreValue) {
                highestScoreValue.textContent = data.highest_score;
            }
            
            console.log(`Datos de usuario cargados para: ${data.name}`);

        } catch (error) {
            console.error('⚠️ No se pudieron cargar las métricas desde la API:', error);
            // Puedes mostrar un mensaje de error en la interfaz si la API falla
        }
    }

    /**
     * Función para simular el estado activo de la navegación de la barra lateral.
     * Marca el enlace 'Dashboard' como seleccionado.
     */
    function setSidebarActiveState() {
        // Buscamos el enlace específico del Dashboard
        const dashboardLink = document.querySelector('a[href="/arcade/dashboard"]');
        
        if (dashboardLink) {
            // Aplicamos estilos para simular el botón verde/activo de la imagen
            dashboardLink.style.backgroundColor = '#4CAF50'; 
            dashboardLink.style.color = 'white';
            dashboardLink.style.borderRadius = '5px';
            dashboardLink.style.fontWeight = 'bold';
            dashboardLink.style.paddingLeft = '10px';
        }
    }


    // --- Ejecución Inicial ---
    
    // Carga las métricas al iniciar (o usa los datos estáticos de HTML si la API no está lista)
    // loadDashboardData(); 

    // Marca el botón "Dashboard" como activo
    setSidebarActiveState();
});