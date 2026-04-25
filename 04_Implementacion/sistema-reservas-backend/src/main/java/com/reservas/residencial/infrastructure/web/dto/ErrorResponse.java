package com.reservas.residencial.infrastructure.web.dto;

import java.time.LocalDateTime;

/**
 * Estructura de respuesta de error uniforme para el frontend.
 * Siempre JSON, nunca HTML.
 */
public record ErrorResponse(
    int status,
    String mensaje,
    LocalDateTime timestamp
) {}
