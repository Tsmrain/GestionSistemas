package com.reservas.residencial.application.ports.out;

public interface BnbPaymentPort {
    /**
     * Genera un QR dinámico en el sandbox de BNB.
     * @return qrData o URL del QR
     */
    String generarQR(Double monto, String glosa, Long reservaId);

    /**
     * Consulta el estado de la transacción en el BNB.
     * @return estado (COMPLETADO, PENDIENTE, FALLIDO)
     */
    String consultarEstado(String externalId);
}
