package com.reservas.residencial.application.dto;

public record TipoHabitacionResponse(
        Long id,
        String nombreTipo,
        Double precioBase,
        Integer duracionHoras,
        String descripcion
) {
}
