package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;

/**
 * @referencia_diseño: 03_Diseño/CU-03-Procesar-Pago/CU-03_Secuencia.mmd
 *
 * Respuesta unificada del proceso de pago.
 * qrData: presente sólo en flujo QR_BNB mientras el pago es PENDIENTE.
 * comprobanteId / nroComprobante: presentes sólo cuando estado = COMPLETADO.
 * ventanaCheckIn: hora límite para hacer check-in (fechaPago + 30 min) — Postcondición CU-03.
 */
public record PagoStatusResponse(
    Long reservaId,
    String estado,
    String qrData,
    Long comprobanteId,
    String nroComprobante,
    LocalDateTime ventanaCheckIn
) {}
