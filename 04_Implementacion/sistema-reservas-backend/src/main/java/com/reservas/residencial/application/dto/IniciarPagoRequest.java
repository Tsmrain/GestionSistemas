package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IniciarPagoRequest(
    @NotNull(message = "El ID de reserva es obligatorio")
    Long reservaId,
    
    @NotBlank(message = "El método de pago es obligatorio")
    String metodo // EFECTIVO, QR_BNB
) {}
