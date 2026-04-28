class Pago {
    constructor(reservaId, estado, qrData, comprobanteId, nroComprobante, ventanaCheckIn) {
        this.reservaId = reservaId;
        this.estado = estado;
        this.qrData = qrData;
        this.comprobanteId = comprobanteId;
        this.nroComprobante = nroComprobante;
        this.ventanaCheckIn = ventanaCheckIn;
    }

    // Metodo publico — el Controlador lo usa para saber si el pago termino
    estaCompletado() {
        return this.estado === "COMPLETADO";
    }

    // Metodo publico — el Controlador lo usa para saber si mostrar el QR
    tienePendienteQR() {
        return this.estado === "PENDIENTE" && this.qrData !== null;
    }

    // Metodo privado — solo el modelo lo usa internamente
    #formatearVentana() {
        if (!this.ventanaCheckIn) return null;
        return new Date(this.ventanaCheckIn).toLocaleTimeString("es-BO", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    // Metodo publico — la Vista lo usa para mostrar la hora limite
    obtenerHoraLimiteCheckIn() {
        return this.#formatearVentana();
    }
}