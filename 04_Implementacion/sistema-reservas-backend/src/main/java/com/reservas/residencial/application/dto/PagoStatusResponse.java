package com.reservas.residencial.application.dto;

public record PagoStatusResponse(
    Long reservaId,
    String estado,
    String qrData, // Solo si es QR
    Long comprobanteId
) {}
