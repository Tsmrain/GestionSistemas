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

        overlay.innerHTML =
            '<div class="modal">' +
            '<h2 class="modal-titulo">Procesar Pago</h2>' +
            '<div class="modal-habitacion-info">' +
            '<div class="numero-box">' + reserva.habitacion.numero + '</div>' +
            '<div>' +
            '<p class="hab-num">Habitacion ' + reserva.habitacion.numero + '</p>' +
            '<p class="hab-tipo">' + reserva.habitacion.tipo + ' - Bs ' + reserva.montoTotal + '</p>' +
            '</div>' +
            '</div>' +
            '<p class="pago-instruccion">Selecciona el metodo de pago:</p>' +
            '<div class="pago-botones">' +
            '<button class="btn-pago-qr" id="btn-qr">Pagar con QR (BNB)</button>' +
            '<button class="btn-pago-efectivo" id="btn-efectivo">Pagar en Efectivo</button>' +
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

    // Publico — escucha cuando el recepcionista elige efectivo
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
            '</div>';
    }

    // Publico — muestra formulario de efectivo
    mostrarFormularioEfectivo() {
        var contenido = document.getElementById("pago-contenido");
        contenido.innerHTML =
            '<div class="efectivo-container">' +
            '<p class="efectivo-instruccion">El recepcionista confirma la recepcion del monto:</p>' +
            '<button class="btn-confirmar" id="btn-confirmar-efectivo">Confirmar pago en efectivo</button>' +
            '</div>';
    }

    // Publico — escucha confirmacion de efectivo
    onConfirmarEfectivo(callback) {
        document.getElementById("btn-confirmar-efectivo").addEventListener("click", callback);
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
}
