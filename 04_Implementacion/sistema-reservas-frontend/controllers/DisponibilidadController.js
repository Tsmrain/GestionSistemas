class DisponibilidadController {
    constructor() {
        this.view = new DisponibilidadView();

        this.view.onBuscar((tipo, fecha) => {
            this.buscar(tipo, fecha);
        });
    }

    async buscar(tipo, fecha) {
        const hoy = new Date().toISOString().split('T')[0];
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
            const url = "/api/habitaciones/disponibles?fecha=" + fecha + "&tipoNombre=" + tipo;
            console.log("[DEBUG] Fetching:", url);

            const response = await fetch(url);
            console.log("[DEBUG] Response status:", response.status);

            if (!response.ok) {
                this.view.mostrarError("Error al conectar con el servidor. Status: " + response.status);
                return;
            }

            const data = await response.json();
            console.log("[DEBUG] Data received:", data);

            if (!Array.isArray(data) || data.length === 0) {
                this.view.mostrarError("No hay habitaciones disponibles para esa fecha.");
                return;
            }

            // Mapeo seguro del JSON del backend al modelo del frontend
            const habitaciones = data.map(function(h) {
                var tipoNombre = (h.tipo && h.tipo.nombreTipo) ? h.tipo.nombreTipo : "Sin Tipo";
                var estadoActual = h.estadoActual || "Disponible";
                var precio = (h.tipo && h.tipo.precioBase) ? h.tipo.precioBase : 0;
                return new Habitacion(h.id, h.numero, tipoNombre, estadoActual, precio);
            });

            this.view.renderizarHabitaciones(habitaciones);

        } catch (error) {
            console.error("[DEBUG] Fetch error:", error);
            this.view.mostrarError("No se pudo conectar con el servidor. Revisa la consola (F12).");
        }
    }
}

const app = new DisponibilidadController();