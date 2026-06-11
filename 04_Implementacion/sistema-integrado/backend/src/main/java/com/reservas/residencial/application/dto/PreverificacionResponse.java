package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PreverificacionResponse(
        Long id,
        Long reservaId,
        Long habitacionId,
        LocalDateTime fechaVerificacion,
        String recepcionista,
        String nombreCamarera,
        Boolean conforme,
        String observaciones,
        Double totalCargosExtra,
        List<DetalleVerificacionResponse> detalles
) {
    public record DetalleVerificacionResponse(
            Long id,
            Long itemId,
            String nombreItem,
            String estadoReportado,
            Integer cantidad,
            Double cargoAplicado,
            Boolean cobrado
    ) {}
}
