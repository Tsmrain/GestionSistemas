class PagoController {

    constructor() {
        this.view = new PagoView();
        this._pollingInterval = null;
        this._escucharBotonesPagar();
    }

    // Privado — escucha clicks en botones "Pagar" de las tarjetas de exito de reserva
    _escucharBotonesPagar() {
        var self = this;
        document.addEventListener("click", function (e) {
            if (e.target.classList.contains("btn-pagar")) {
                var reserva = JSON.parse(e.target.getAttribute("data-reserva"));
                self.abrirPagoConMetodo(reserva, reserva.metodoPagoSeleccionado);
            }
        });
    }

    // Publico — abre pago respetando el metodo elegido en la reserva
    abrirPagoConMetodo(reserva, metodoPago) {
        this._abrirPago(reserva, metodoPago);
    }

    // Privado — abre el modal y conecta los eventos
    _abrirPago(reserva, metodoPago) {
        var self = this;
        this.view.mostrarOpcionesPago(reserva);

        this.view.onCancelarPago(function () {
            self._detenerPolling();
            if (window.reservaApp && window.reservaPendienteSinPagoId) {
                window.reservaApp._cancelarReservaPendiente(window.reservaPendienteSinPagoId);
                window.reservaApp.reservaPendienteSinPagoId = null;
                window.reservaPendienteSinPagoId = null;
                if (window.disponibilidadApp) window.disponibilidadApp.cargarDisponiblesDeHoy();
            }
            self.view.cerrarModal();
        });

        this.view.onElegirQR(function () {
            self._iniciarPagoQR(reserva);
        });

        this.view.onElegirEfectivo(function () {
            self._iniciarPagoEfectivo(reserva);
        });

        if (metodoPago === "QR_BNB") {
            this._iniciarPagoQR(reserva);
        } else if (metodoPago === "EFECTIVO") {
            this._iniciarPagoEfectivo(reserva);
        }
    }

    // Privado — inicia el pago QR
    async _iniciarPagoQR(reserva) {
        try {
            var response = await fetch("/api/v1/pagos/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reserva.id,
                    metodo: "QR_BNB"
                })
            });

            if (!response.ok) {
                this.view.mostrarError("Error al generar el QR. Intente nuevamente.");
                return;
            }

            var data = await response.json();
            var pago = new Pago(
                data.reservaId,
                data.estado,
                data.qrData,
                data.comprobanteId,
                data.nroComprobante,
                data.ventanaCheckIn
            );

            // Mostrar el QR en pantalla
            this.view.mostrarQR(pago.qrData);
            this.view.onSimularPago(() => {
                this._simularPagoQR(reserva);
            });
            this.view.onVolverMetodosPago(() => {
                this._detenerPolling();
                if (window.reservaApp) {
                    window.reservaApp.volverAlFormularioDesdePago(reserva.id);
                } else {
                    this.view.mostrarSeleccionMetodosPago();
                }
            });

            // Iniciar polling cada 3 segundos
            this._iniciarPolling(reserva);

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — inicia el pago en Efectivo
    async _iniciarPagoEfectivo(reserva) {
        try {
            var response = await fetch("/api/v1/pagos/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reserva.id,
                    metodo: "EFECTIVO"
                })
            });

            if (!response.ok) {
                this.view.mostrarError("Error al procesar el pago en efectivo.");
                return;
            }

            this._desactivarCancelacionAutomatica();

            var data = await response.json();
            var pago = new Pago(
                data.reservaId,
                data.estado,
                data.qrData,
                data.comprobanteId,
                data.nroComprobante,
                data.ventanaCheckIn
            );

            // Mostrar el comprobante directamente con el mensaje de advertencia de efectivo
            this.view.mostrarComprobante(pago, "EFECTIVO", reserva);

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — polling cada 3 segundos para verificar si el QR fue pagado
    _iniciarPolling(reserva) {
        var self = this;
        var intentos = 0;
        var maxIntentos = 100; // 100 * 3s = 5 minutos

        this._detenerPolling();
        this._pollingInterval = setInterval(async function () {
            try {
                intentos++;
                var response = await fetch("/api/v1/pagos/verificar/" + reserva.id);

                if (!response.ok) return;

                var data = await response.json();
                var pago = new Pago(
                    data.reservaId,
                    data.estado,
                    data.qrData,
                    data.comprobanteId,
                    data.nroComprobante,
                    data.ventanaCheckIn
                );

                // Si ya esta completado detenemos el polling y mostramos comprobante
                if (pago.estaCompletado()) {
                    self._detenerPolling();
                    self._desactivarCancelacionAutomatica();
                    self.view.mostrarComprobante(pago, "QR_BNB", reserva);
                    return;
                }

                if (pago.estado === "QR_EXPIRADO" || pago.estado === "FALLIDO") {
                    self._detenerPolling();
                    self.view.mostrarError("El QR expiro o el pago fallo. Intenta generar otro QR.");
                    return;
                }

                if (intentos >= maxIntentos) {
                    self._detenerPolling();
                    self.view.mostrarError("Tiempo de espera agotado. Intenta nuevamente.");
                }

            } catch (error) {
                self._detenerPolling();
                self.view.mostrarError("Error al verificar el pago.");
            }

        }, 3000); // cada 3 segundos
    }

    // Privado — detiene el polling
    _detenerPolling() {
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
            this._pollingInterval = null;
        }
    }

    _desactivarCancelacionAutomatica() {
        window.reservaPendienteSinPagoId = null;
        if (window.reservaApp) {
            window.reservaApp.reservaPendienteSinPagoId = null;
        }
    }

    // Privado — simula la notificacion del banco para la demo
    async _simularPagoQR(reserva) {
        try {
            var response = await fetch("/api/v1/pagos/simular-confirmacion/" + reserva.id, {
                method: "POST"
            });

            if (!response.ok) {
                this.view.mostrarError("No se pudo simular la confirmacion del pago.");
                return;
            }

            var data = await response.json();
            var pago = new Pago(
                data.reservaId,
                data.estado,
                data.qrData,
                data.comprobanteId,
                data.nroComprobante,
                data.ventanaCheckIn
            );

            if (pago.estaCompletado()) {
                this._detenerPolling();
                this._desactivarCancelacionAutomatica();
                this.view.mostrarComprobante(pago, "QR_BNB", reserva);
            }
        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

}

// Inicializar el controlador
var pagoApp = new PagoController();
