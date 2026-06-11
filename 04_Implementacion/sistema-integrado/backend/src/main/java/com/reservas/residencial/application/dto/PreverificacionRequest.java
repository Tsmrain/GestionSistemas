package com.reservas.residencial.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PreverificacionRequest(
        @NotNull(message = "La reserva es obligatoria")
        Long reservaId,

        @NotBlank(message = "El recepcionista es obligatorio")
        String recepcionista,

        String nombreCamarera,

        String observaciones,

        @NotEmpty(message = "Debe enviar los detalles de verificación")
        List<@Valid ItemPreverificacion> detalles
) {}
