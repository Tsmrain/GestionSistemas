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
                self._abrirPago(reserva);
            }
        });
    }

    // Privado — abre el modal y conecta los eventos
    _abrirPago(reserva) {
        var self = this;
        this.view.mostrarOpcionesPago(reserva);

        this.view.onCancelarPago(function () {
            self._detenerPolling();
            if (window.reservaApp && window.reservaPendienteSinPagoId) {
                window.reservaApp._cancelarReservaPendiente(window.reservaPendienteSinPagoId);
                window.reservaApp.reservaPendienteSinPagoId = null;
                window.reservaPendienteSinPagoId = null;
                var buscar = document.getElementById("btn-buscar");
                if (buscar) buscar.click();
            }
            self.view.cerrarModal();
        });

        this.view.onElegirQR(function () {
            self._iniciarPagoQR(reserva.id);
        });

        this.view.onElegirEfectivo(function () {
            self._iniciarPagoEfectivo(reserva.id);
        });
    }

    // Privado — inicia el pago QR
    async _iniciarPagoQR(reservaId) {
        try {
            var response = await fetch("/api/v1/pagos/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reservaId,
                    metodo: "QR_BNB"
                })
            });

            if (!response.ok) {
                this.view.mostrarError("Error al generar el QR. Intente nuevamente.");
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

            // Mostrar el QR en pantalla
            this.view.mostrarQR(pago.qrData);
            this.view.onSimularPago(() => {
                this._simularPagoQR(reservaId);
            });
            this.view.onVolverMetodosPago(() => {
                this._detenerPolling();
                this.view.mostrarSeleccionMetodosPago();
            });

            // Iniciar polling cada 3 segundos
            this._iniciarPolling(reservaId);

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — inicia el pago en Efectivo
    async _iniciarPagoEfectivo(reservaId) {
        try {
            var response = await fetch("/api/v1/pagos/iniciar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reservaId,
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
            this.view.mostrarComprobante(pago, "EFECTIVO");

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — polling cada 3 segundos para verificar si el QR fue pagado
    _iniciarPolling(reservaId) {
        var self = this;
        var intentos = 0;
        var maxIntentos = 100; // 100 * 3s = 5 minutos

        this._detenerPolling();
        this._pollingInterval = setInterval(async function () {
            try {
                intentos++;
                var response = await fetch("/api/v1/pagos/verificar/" + reservaId);

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
                    self.view.mostrarComprobante(pago, "QR_BNB");
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
    async _simularPagoQR(reservaId) {
        try {
            var response = await fetch("/api/v1/pagos/simular-confirmacion/" + reservaId, {
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
                this.view.mostrarComprobante(pago, "QR_BNB");
            }
        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

}

// Inicializar el controlador
var pagoApp = new PagoController();
