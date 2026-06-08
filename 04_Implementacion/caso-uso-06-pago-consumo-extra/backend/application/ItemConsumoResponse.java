package com.reservas.residencial.application.dto;

public record ItemConsumoResponse(
        String productoId,
        String nombre,
        String emoji,
        Integer cantidad,
        Double precioUnitario,
        Double subtotal
) {
}
