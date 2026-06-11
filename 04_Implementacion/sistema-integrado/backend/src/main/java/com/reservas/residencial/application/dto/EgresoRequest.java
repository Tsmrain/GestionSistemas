package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EgresoRequest(
        @NotBlank(message = "La descripción es obligatoria")
        String descripcion,

        @NotNull(message = "El monto es obligatorio")
        @Positive(message = "El monto debe ser positivo")
        Double monto,

        @NotBlank(message = "La categoría es obligatoria")
        String categoria,

        @NotBlank(message = "El recepcionista es obligatorio")
        String recepcionista,

        String urlComprobante
) {}
