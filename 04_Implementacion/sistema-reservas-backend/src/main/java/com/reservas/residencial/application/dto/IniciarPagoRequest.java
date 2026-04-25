package com.reservas.residencial.application.dto;

public record IniciarPagoRequest(
    Long reservaId,
    String metodo // EFECTIVO, QR_BNB
) {}
