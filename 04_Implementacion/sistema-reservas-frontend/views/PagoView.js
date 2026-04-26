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
            '<p class="pago-instruccion">Confirma el pago de la reserva con QR BNB.</p>' +
            '<div class="pago-botones">' +
            '<button class="btn-pago-qr" id="btn-qr">Generar QR de pago</button>' +
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
    mostrarComprobante(pago) {
        if (this.modal) this.modal.remove();

        var exito = document.createElement("div");
        exito.className = "modal-overlay";
        exito.innerHTML =
            '<div class="modal modal-exito">' +
            '<div class="exito-icon">✅</div>' +
            '<h2>Pago Confirmado</h2>' +
            '<p class="exito-detalle">Comprobante N°: <strong>' + pago.nroComprobante + '</strong></p>' +
            '<p class="exito-detalle">Tienes hasta las <strong>' + pago.obtenerHoraLimiteCheckIn() + '</strong> para llegar al residencial.</p>' +
            '<button class="btn-confirmar" id="btn-cerrar-comprobante">Aceptar</button>' +
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
