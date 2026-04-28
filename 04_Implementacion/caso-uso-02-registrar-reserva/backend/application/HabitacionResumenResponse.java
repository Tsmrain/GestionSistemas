package com.reservas.residencial.application.dto;

public record HabitacionResumenResponse(
        Long id,
        String numero,
        TipoHabitacionResponse tipo
) {
}
