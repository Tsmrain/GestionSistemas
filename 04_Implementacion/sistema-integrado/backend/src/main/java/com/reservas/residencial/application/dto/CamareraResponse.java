package com.reservas.residencial.application.dto;

public record CamareraResponse(
        Long id,
        String nombre,
        String celular,
        Boolean activo
) {}
