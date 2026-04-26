class PagoView {

    constructor() {
        this.modal = null;
        this._pollingInterval = null;
    }

    // Publico — el Controlador lo llama para abrir el modal de pago
    mostrarOpcionesPago(reserva) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-pago";
        var tipoHabitacion = this.#obtenerNombreTipo(reserva);
        var duracionHoras = this.#obtenerDuracionHoras(reserva);

        overlay.innerHTML =
            '<div class="modal">' +
            '<h2 class="modal-titulo">Procesar Pago</h2>' +
            '<div class="modal-habitacion-info">' +
            '<div class="numero-box">' + reserva.habitacion.numero + '</div>' +
            '<div>' +
            '<p class="hab-num">Habitacion ' + reserva.habitacion.numero + '</p>' +
            '<p class="hab-tipo">' + tipoHabitacion + ' - Bs ' + reserva.montoTotal + '</p>' +
            '<p class="hab-horario">' + duracionHoras + ' horas</p>' +
            '</div>' +
            '</div>' +
            '<p class="pago-instruccion">Confirma el pago de la reserva con QR BNB o Efectivo.</p>' +
            '<div class="pago-botones">' +
            '<button class="btn-pago-qr" id="btn-qr">Generar QR de pago</button>' +
            '<button class="btn-pago-efectivo" id="btn-efectivo">Pago en Efectivo</button>' +
            '</div>' +
            '<div id="pago-contenido"></div>' +
            '<div id="pago-error" class="form-error" style="display:none"></div>' +
            '</div>';

        document.body.appendChild(overlay);
        this.modal = overlay;
    }

    // Publico — escucha cuando el usuario elige QR
    onElegirQR(callback) {
        document.getElementById("btn-qr").addEventListener("click", callback);
    }

    // Publico — escucha cuando el usuario elige Efectivo
    onElegirEfectivo(callback) {
        document.getElementById("btn-efectivo").addEventListener("click", callback);
    }

    // Publico — muestra el QR en pantalla
    mostrarQR(qrData) {
        var contenido = document.getElementById("pago-contenido");
        contenido.innerHTML =
            '<div class="qr-container">' +
            '<p class="qr-instruccion">Escanea el QR con tu banca movil:</p>' +
            '<img class="qr-imagen" src="data:image/png;base64,' + qrData + '" alt="QR de pago BNB">' +
            '<p class="qr-espera">Esperando confirmacion del pago...</p>' +
            '<div class="qr-spinner"></div>' +
            '<button class="btn-confirmar btn-simular-pago" id="btn-simular-pago">Simular pago recibido</button>' +
            '</div>';
    }

    // Publico — escucha la confirmacion simulada del QR
    onSimularPago(callback) {
        document.getElementById("btn-simular-pago").addEventListener("click", callback);
    }

    // Publico — muestra comprobante final
    mostrarComprobante(pago, metodo) {
        if (this.modal) this.modal.remove();

        var esEfectivo = (metodo === "EFECTIVO");
        var titulo = esEfectivo ? "¡RESERVA REGISTRADA!" : "¡PAGO CONFIRMADO!";
        var icon = esEfectivo ? "🏨" : "✅";
        
        var avisoHTML = "";
        if (esEfectivo) {
            avisoHTML = 
                '<div class="pago-alerta">' +
                    '<span class="alerta-icon">⚠️</span>' +
                    '<div class="alerta-texto">' +
                        '<strong>AVISO:</strong> Debes pagar en recepción. Tienes 30 minutos para llegar; de lo contrario, la habitación se liberará automáticamente.' +
                    '</div>' +
                '</div>';
        } else {
            avisoHTML = 
                '<div class="pago-alerta">' +
                    '<span class="alerta-icon">🕒</span>' +
                    '<div class="alerta-texto">' +
                        '<strong>AVISO:</strong> Tienes 30 minutos para llegar al residencial. Si no te presentas, la reserva se cancelará sin derecho a reembolso.' +
                    '</div>' +
                '</div>';
        }

        var exito = document.createElement("div");
        exito.className = "modal-overlay";
        exito.innerHTML =
            '<div class="modal modal-exito">' +
            '<div class="exito-icon">' + icon + '</div>' +
            '<h2 style="text-transform: uppercase; letter-spacing: 1px;">' + titulo + '</h2>' +
            
            '<div class="comprobante-grid">' +
                '<div class="grid-item">' +
                    '<span class="label">Nro. Comprobante</span>' +
                    '<span class="valor">#' + pago.nroComprobante + '</span>' +
                '</div>' +
                '<div class="grid-item">' +
                    '<span class="label">Tiempo Límite de Llegada</span>' +
                    '<span class="valor" style="color: #7F77DD;">' + pago.obtenerHoraLimiteCheckIn() + '</span>' +
                '</div>' +
            '</div>' +

            avisoHTML +

            '<button class="btn-confirmar" id="btn-cerrar-comprobante">ACEPTAR</button>' +
            '</div>';

        document.body.appendChild(exito);

        document.getElementById("btn-cerrar-comprobante").addEventListener("click", function () {
            exito.remove();
            window.location.reload();
        });
    }

    // Publico — muestra error
    mostrarError(mensaje) {
        var errorDiv = document.getElementById("pago-error");
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = "block";
        }
    }

    // Privado — limpia el contenido interno del modal
    #limpiarContenido() {
        var contenido = document.getElementById("pago-contenido");
        if (contenido) contenido.innerHTML = "";
    }

    // Publico — cierra el modal
    cerrarModal() {
        this.#limpiarContenido();
        if (this.modal) this.modal.remove();
    }

    #obtenerNombreTipo(reserva) {
        if (!reserva.habitacion || !reserva.habitacion.tipo) return "Sin tipo";
        if (typeof reserva.habitacion.tipo === "string") return reserva.habitacion.tipo;
        return reserva.habitacion.tipo.nombreTipo || "Sin tipo";
    }

    #obtenerDuracionHoras(reserva) {
        if (!reserva.habitacion || !reserva.habitacion.tipo) return "";
        return reserva.habitacion.tipo.duracionHoras || "";
    }
}
