package com.reservas.residencial.application.dto;

public record IncidenciaAdminRequest(
        Long habitacionId,
        Long itemId,
        String descripcion,
        String seguimiento,
        String recepcionistaReporta,
        String estado,
        Double costoReparacion,
        String recepcionistaResuelve
) {}
