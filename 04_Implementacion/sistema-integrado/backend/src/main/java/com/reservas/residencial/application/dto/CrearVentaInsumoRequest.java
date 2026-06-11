package com.reservas.residencial.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CrearVentaInsumoRequest(
        Long habitacionId,
        String numeroHabitacion,
        String cliente,

        @NotBlank(message = "La ubicación es obligatoria")
        String ubicacion,

        @NotBlank(message = "La recepcionista es obligatoria")
        String recepcionista,

        @NotNull(message = "Debe enviar los ítems")
        @NotEmpty(message = "Debe seleccionar al menos un insumo")
        List<@Valid ItemConsumoRequest> items
) {
}
