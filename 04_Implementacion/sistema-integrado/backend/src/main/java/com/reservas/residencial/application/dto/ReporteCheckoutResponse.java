package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ReporteCheckoutResponse(
        Long id,
        Long reservaId,
        Long habitacionId,
        String numeroHabitacion,
        LocalDateTime fechaVerificacion,
        String recepcionista,
        String nombreCamarera,
        Boolean conforme,
        String observaciones,
        Double totalCargosExtra,
        List<DetalleReporteCheckoutResponse> detalles
) {
    public record DetalleReporteCheckoutResponse(
            Long id,
            Long itemId,
            String nombreItem,
            String estadoReportado,
            Integer cantidad,
            Double cargoAplicado,
            Boolean cobrado
    ) {}
}
