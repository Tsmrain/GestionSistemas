class ReservaController {
    constructor() {
        this.view = new ReservaView();
        this.reservaPendienteSinPagoId = null;
        this.habitacionEnFormulario = null;
        this.borradorReserva = null;
        this._escucharBotonesReservar();
        this._escucharCancelarReserva();
        this._cancelarPendienteAlSalir();
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
                self.view.marcarHabitacionSeleccionada(habitacion.id);
                self._abrirFormulario(habitacion);
            }
        });
    }

    // Abre el formulario modal y espera el submit
    _abrirFormulario(habitacion, borrador) {
        var self = this;
        this.habitacionEnFormulario = habitacion;
        this.view.mostrarFormulario(habitacion, borrador);

        this.view.onSubmit(function(formData) {
            self._enviarReserva(formData);
        });
    }

    // Envía la reserva al backend
    async _enviarReserva(formData) {
        this.view.mostrarCargando();
        var metodoPago = formData.get("metodoPago") || "QR_BNB";
        this.borradorReserva = this.view.obtenerBorradorFormulario();

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
            reserva.metodoPagoSeleccionado = metodoPago;
            this.reservaPendienteSinPagoId = reserva.id;
            window.reservaPendienteSinPagoId = reserva.id;
            if (reserva.habitacion) {
                this.view.ocultarHabitacionReservada(reserva.habitacion.id);
            }
            if (window.pagoApp) {
                window.pagoApp.abrirPagoConMetodo(reserva, metodoPago);
            } else {
                this.view.mostrarExito(reserva);
            }

        } catch (error) {
            console.error("[DEBUG] Error al enviar reserva:", error);
            this.view.mostrarError("No se pudo conectar con el servidor.");
            this.view.restaurarBoton();
        }
    }

    _escucharCancelarReserva() {
        var self = this;
        document.addEventListener("click", async function(e) {
            if (!e.target.classList.contains("btn-cancelar-reserva")) return;

            var reservaId = e.target.getAttribute("data-reserva-id");
            await self._cancelarReservaPendiente(reservaId);
            self.reservaPendienteSinPagoId = null;
            window.reservaPendienteSinPagoId = null;
            self.view.limpiarFlujo();

            var buscar = document.getElementById("btn-buscar");
            if (buscar) buscar.click();
        });
    }

    async _cancelarReservaPendiente(reservaId) {
        if (!reservaId) return;

        try {
            await fetch("/api/v1/reservas/" + reservaId + "/cancelar-pendiente", {
                method: "POST"
            });
        } catch (error) {
            console.error("[DEBUG] No se pudo cancelar la reserva pendiente:", error);
        }
    }

    async volverAlFormularioDesdePago(reservaId) {
        await this._cancelarReservaPendiente(reservaId);
        this.reservaPendienteSinPagoId = null;
        window.reservaPendienteSinPagoId = null;
        this.view.mostrarHabitacionesEnReserva();

        if (this.habitacionEnFormulario) {
            this.view.marcarHabitacionSeleccionada(this.habitacionEnFormulario.id);
            this._abrirFormulario(this.habitacionEnFormulario, this.borradorReserva);
        } else {
            this.view.limpiarFlujo();
        }
    }

    _cancelarPendienteAlSalir() {
        var cancelar = () => {
            var reservaId = window.reservaPendienteSinPagoId || this.reservaPendienteSinPagoId;
            if (!reservaId) return;

            navigator.sendBeacon("/api/v1/reservas/" + reservaId + "/cancelar-pendiente", new Blob([], { type: "text/plain" }));
        };

        window.addEventListener("beforeunload", cancelar);
        window.addEventListener("pagehide", cancelar);
    }
}

// Se inicializa junto con DisponibilidadController
var reservaApp = new ReservaController();
