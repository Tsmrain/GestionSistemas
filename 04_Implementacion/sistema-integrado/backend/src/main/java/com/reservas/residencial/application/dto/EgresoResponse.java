package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;

public record EgresoResponse(
        Long id,
        String descripcion,
        Double monto,
        String categoria,
        LocalDateTime fecha,
        String recepcionista,
        String destinoDestinatario,
        String urlComprobante
) {}
