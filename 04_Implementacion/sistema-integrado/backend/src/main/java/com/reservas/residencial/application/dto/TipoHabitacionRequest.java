package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TipoHabitacionRequest(
        @NotBlank(message = "El nombre del tipo es obligatorio")
        String nombreTipo,

        @NotNull(message = "El precio base es obligatorio")
        @Positive(message = "El precio base debe ser positivo")
        Double precioBase,

        @NotNull(message = "La duración en horas es obligatoria")
        @Positive(message = "La duración debe ser positiva")
        Integer duracionHoras,

        String descripcion
) {}
