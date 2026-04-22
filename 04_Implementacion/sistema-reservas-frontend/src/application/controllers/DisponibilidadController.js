/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
class DisponibilidadController {
    constructor() {
        this.view = new DisponibilidadView();
        window.disponibilidadController = this;

        this.view.onBuscar((tipo, fecha) => {
            this.consultarDisponibilidad(fecha, tipo);
        });
    }

    // @mensaje: 1: consultarDisponibilidad(fecha, tipoNombre) | @patron: Controlador
    async consultarDisponibilidad(fecha, tipoNombre) {
        if (!this.validarFecha(fecha)) {
            return;
        }

        this.view.limpiar();

        try {
            const url = `http://localhost:8081/api/habitaciones/disponibles?fecha=${fecha}&tipoNombre=${tipoNombre}`;
            const response = await fetch(url);

            if (!response.ok) {
                this.view.mostrarError("Error al conectar con el servidor.");
                return;
            }

            const data = await response.json();

            // Transformación a Objetos del Dominio (Baja Brecha de Representación)
            const habitaciones = data.map(h =>
                new Habitacion(h.id, h.numero, h.tipo, h.estadoActual)
            );

            if (habitaciones.length === 0) {
                this.view.mostrarError(`No hay habitaciones disponibles.`);
                return;
            }

            this.ultimoResultado = habitaciones; 
            this.view.mostrarResultados(habitaciones);
            this.configurarEventosReserva(fecha);

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    configurarEventosReserva(fecha) {
        const botones = document.querySelectorAll(".btn-reservar");
        botones.forEach((btn) => {
            btn.onclick = () => {
                const habitacionId = btn.dataset.id;
                const habitacion = this.ultimoResultado.find(h => h.id == habitacionId);
                
                if (window.reservaController) {
                    window.reservaController.abrirFormulario(habitacion, fecha);
                }
            };
        });
    }

    validarFecha(fecha) {
        const hoy = new Date().toISOString().split('T')[0];
        if (!fecha) {
            this.view.mostrarError("Por favor selecciona una fecha");
            return false;
        }
        if (fecha < hoy) {
            this.view.mostrarError("La fecha no puede ser menor a hoy.");
            return false;
        }
        return true;
    }
}

const app = new DisponibilidadController();