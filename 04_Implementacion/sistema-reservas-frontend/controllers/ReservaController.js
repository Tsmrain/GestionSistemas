class ReservaController {
    constructor() {
        this.view = new ReservaView();
        this._escucharBotonesReservar();
    }

    // Escucha clicks en los botones "Reservar" de cada tarjeta
    _escucharBotonesReservar() {
        var self = this;
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("btn-reservar")) {
                var btn = e.target;
                var habitacion = {
                    id: btn.getAttribute("data-id"),
                    numero: btn.getAttribute("data-numero"),
                    tipo: btn.getAttribute("data-tipo"),
                    precio: btn.getAttribute("data-precio"),
                    duracionHoras: btn.getAttribute("data-duracion"),
                    fechaIngreso: window.fechaBusquedaActual || ""
                };
                self._abrirFormulario(habitacion);
            }
        });
    }

    // Abre el formulario modal y espera el submit
    _abrirFormulario(habitacion) {
        var self = this;
        this.view.mostrarFormulario(habitacion);

        this.view.onSubmit(function(formData) {
            self._enviarReserva(formData);
        });
    }

    // Envía la reserva al backend
    async _enviarReserva(formData) {
        this.view.mostrarCargando();

        try {
            var response = await fetch("/api/v1/reservas", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                var errorText = await response.text();
                console.error("[DEBUG] Error del servidor:", errorText);
                this.view.mostrarError("Error del servidor: " + response.status);
                this.view.restaurarBoton();
                return;
            }

            var reserva = await response.json();
            console.log("[DEBUG] Reserva creada:", reserva);
            this.view.mostrarExito(reserva);

        } catch (error) {
            console.error("[DEBUG] Error al enviar reserva:", error);
            this.view.mostrarError("No se pudo conectar con el servidor.");
            this.view.restaurarBoton();
        }
    }
}

// Se inicializa junto con DisponibilidadController
var reservaApp = new ReservaController();
