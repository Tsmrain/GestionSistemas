package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;

public record IncidenciaResponse(
        Long id,
        Long habitacionId,
        String numeroHabitacion,
        Long itemId,
        String nombreItem,
        String descripcion,
        LocalDateTime fechaReporte,
        String recepcionistaReporta,
        String estado,
        Double costoReparacion,
        LocalDateTime fechaResolucion,
        String recepcionistaResuelve
) {}
