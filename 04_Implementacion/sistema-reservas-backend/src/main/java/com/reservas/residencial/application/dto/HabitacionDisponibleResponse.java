package com.reservas.residencial.application.dto;

public record HabitacionDisponibleResponse(
        Long id,
        String numero,
        String estadoActual,
        TipoHabitacionResponse tipo
) {
}
