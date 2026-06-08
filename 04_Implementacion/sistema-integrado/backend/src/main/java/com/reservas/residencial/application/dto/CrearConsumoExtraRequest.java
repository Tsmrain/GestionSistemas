package com.reservas.residencial.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CrearConsumoExtraRequest(
        @NotNull(message = "La reserva es obligatoria")
        Long reservaId,

        @NotEmpty(message = "Debe seleccionar al menos un consumo")
        List<@Valid ItemConsumoRequest> items
) {
}
