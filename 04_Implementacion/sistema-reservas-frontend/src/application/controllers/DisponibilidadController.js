class DisponibilidadController {
    constructor() {
        // el controlador crea la vista y el modelo (mediador)
        this.view = new DisponibilidadView();
        this.habitacionDominio = new Habitacion();
        window.disponibilidadController = this; // Para que ReservaController pueda recargar

        // Registro de manejador de eventos según Larman (delegación)
        this.view.onBuscar((tipo, fecha) => {
            this.consultarDisponibilidad(tipo, fecha);
        });
    }

    async consultarDisponibilidad(tipoHabitacion, fechaConsulta) {
        // 1. Validar la fecha (Regla de negocio simple delegada al controlador de aplicación)
        if (!this.validarFecha(fechaConsulta)) {
            return;
        }

        // 2. Limpiar la interfaz (Presentación)
        this.view.limpiar();

        // 3. Consultar al sistema (Backend) - Operación del Sistema
        try {
            const url = `http://localhost:8081/api/habitaciones/disponibles?tipoHabitacion=${tipoHabitacion}&fechaConsulta=${fechaConsulta}`;
            const response = await fetch(url);

            if (!response.ok) {
                this.view.mostrarError("Error al conectar con el servidor.");
                return;
            }

            const data = await response.json();

            // 4. Transformación a Objetos del Dominio (Baja Brecha de Representación)
            const habitaciones = data.map(h =>
                new Habitacion(h.id, h.numero, h.tipo, h.estado)
            );

            // 5. Verificar si hay resultados (Postcondición del CU)
            if (habitaciones.length === 0) {
                this.view.mostrarError(`No hay habitaciones disponibles.`);
                return;
            }

            // 6. Actualizar la vista
            this.ultimoResultado = habitaciones; // Guardamos para referencia
            this.view.mostrarResultados(habitaciones);

            // 7. Configurar eventos de reserva
            this.configurarEventosReserva(fechaConsulta);

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    configurarEventosReserva(fecha) {
        const botones = document.querySelectorAll(".btn-reservar");
        botones.forEach((btn, index) => {
            btn.onclick = () => {
                // Obtenemos la habitación correspondiente de la lista cargada
                const habitacionId = btn.dataset.id;
                // Como no guardamos todo en data-attributes para evitar redundancia, 
                // buscamos en la lista que ya tenemos en memoria
                const habitacion = this.ultimoResultado.find(h => h.id == habitacionId);
                
                if (window.reservaController) {
                    window.reservaController.abrirFormulario(habitacion, fecha);
                }
            };
        });
    }

    validarFecha(fechaConsulta) {
        const hoy = new Date().toISOString().split('T')[0];
        if (!fechaConsulta) {
            this.view.mostrarError("Por favor selecciona una fecha");
            return false;
        }
        if (fechaConsulta < hoy) {
            this.view.mostrarError("La fecha no puede ser menor a hoy.");
            return false;
        }
        return true;
    }
}

// Inicialización de la aplicación (Controller)
const app = new DisponibilidadController();