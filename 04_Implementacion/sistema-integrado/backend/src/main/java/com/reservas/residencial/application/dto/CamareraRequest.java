package com.reservas.residencial.application.dto;

public record CamareraRequest(
        String nombre,
        String celular,
        Boolean activo
) {}
