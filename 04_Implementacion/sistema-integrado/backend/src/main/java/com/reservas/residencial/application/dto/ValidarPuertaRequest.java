package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;

public record ValidarPuertaRequest(
        @NotBlank(message = "El codigo QR es obligatorio")
        String codigo,

        @NotBlank(message = "La habitacion es obligatoria")
        String habitacion
) {
}
