class DisponibilidadController {
    constructor() {
        this.view = new DisponibilidadView();

        this.view.onBuscar((tipo, fecha) => {
            this.buscar(tipo, fecha);
        });
    }

    async buscar(tipo, fecha) {
        const d = new Date();
        const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!fecha) {
            this.view.mostrarError("Por favor selecciona una fecha");
            return;
        }
        if (fecha < hoy) {
            this.view.mostrarError("La fecha no puede ser menor a hoy.");
            return;
        }

        this.view.limpiar();

        try {
            const url = "/api/v1/habitaciones/disponibles?fecha=" + fecha + "&tipoNombre=" + tipo;
            console.log("[DEBUG] Fetching:", url);

            const response = await fetch(url);
            console.log("[DEBUG] Response status:", response.status);

            if (!response.ok) {
                if (response.status === 502 || response.status === 503 || response.status === 504) {
                    this.view.mostrarError("El servidor esta iniciando. Espera unos segundos y vuelve a buscar.");
                    return;
                }
                this.view.mostrarError("Error al conectar con el servidor. Status: " + response.status);
                return;
            }

            const data = await response.json();
            console.log("[DEBUG] Data received:", data);

            if (!Array.isArray(data) || data.length === 0) {
                this.view.mostrarError("No hay habitaciones disponibles para esa fecha.");
                return;
            }

            window.fechaBusquedaActual = fecha;

            // Mapeo seguro del JSON del backend al modelo del frontend
            const habitaciones = data.map(function(h) {
                var tipoNombre = (h.tipo && h.tipo.nombreTipo) ? h.tipo.nombreTipo : "Sin Tipo";
                var estadoActual = h.estadoActual || "Disponible";
                var precio = (h.tipo && h.tipo.precioBase) ? h.tipo.precioBase : 0;
                var duracionHoras = (h.tipo && h.tipo.duracionHoras) ? h.tipo.duracionHoras : 12;
                return new Habitacion(h.id, h.numero, tipoNombre, estadoActual, precio, duracionHoras);
            });

            this.view.renderizarHabitaciones(habitaciones);

        } catch (error) {
            console.error("[DEBUG] Fetch error:", error);
            this.view.mostrarError("No se pudo conectar con el servidor. Revisa la consola (F12).");
        }
    }
}

// Inicializar fecha de hoy por defecto en el input
(function() {
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const input = document.getElementById("fecha-input");
    if (input) {
        input.value = hoy;
        input.setAttribute("min", hoy);
    }
})();

if (document.getElementById("btn-buscar")) {
    const app = new DisponibilidadController();
}
