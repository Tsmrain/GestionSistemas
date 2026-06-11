package com.reservas.residencial.application.dto;

public record HabitacionInventarioResponse(
        Long id,
        Long itemId,
        String nombreItem,
        String tipoItem,
        Integer cantidadEsperada,
        Integer cantidadActual,
        String estadoVerificacion,
        String emoji
) {}
