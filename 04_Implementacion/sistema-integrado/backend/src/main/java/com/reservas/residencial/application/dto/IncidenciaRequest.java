package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IncidenciaRequest(
        @NotNull(message = "La habitación es obligatoria")
        Long habitacionId,

        Long itemId, // Puede ser null

        @NotBlank(message = "La descripción de la incidencia es obligatoria")
        String descripcion,

        @NotBlank(message = "El recepcionista que reporta es obligatorio")
        String recepcionistaReporta
) {}
