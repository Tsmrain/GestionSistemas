package com.reservas.residencial.application.dto;

public record RecepcionistaAdminResponse(
        Long id,
        String nombre,
        String username,
        Boolean activo
) {}
