package com.reservas.residencial.application.dto;

public record ProductoConsumoResponse(
        String id,
        String nombre,
        String emoji,
        Double precio,
        Integer stock,
        Double precioCompra
) {
}
