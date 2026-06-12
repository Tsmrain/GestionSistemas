package com.reservas.residencial.application.dto;

public record RecepcionistaAdminRequest(
        String nombre,
        String username,
        String password,
        Boolean activo
) {}
