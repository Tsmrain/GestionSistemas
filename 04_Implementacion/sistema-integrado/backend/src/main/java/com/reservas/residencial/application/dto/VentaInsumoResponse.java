package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record VentaInsumoResponse(
        Long id,
        Long habitacionId,
        String numeroHabitacion,
        String cliente,
        String ubicacion,
        Double total,
        String estado,
        String recepcionista,
        List<ItemConsumoResponse> items,
        LocalDateTime fecha
) {
}
