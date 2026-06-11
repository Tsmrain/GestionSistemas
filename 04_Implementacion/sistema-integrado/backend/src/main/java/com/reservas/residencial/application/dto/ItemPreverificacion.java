package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ItemPreverificacion(
        @NotNull(message = "El item de inventario es obligatorio")
        Long itemId,

        @NotBlank(message = "El estado del item es obligatorio")
        String estadoReportado, // OK, FALTANTE, DAÑADO

        @NotNull(message = "La cantidad es obligatoria")
        @PositiveOrZero(message = "La cantidad debe ser mayor o igual a cero")
        Integer cantidad,

        Boolean cobrado // Si se cobrará al huésped
) {}
