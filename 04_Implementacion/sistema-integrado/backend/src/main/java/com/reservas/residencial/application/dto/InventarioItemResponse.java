package com.reservas.residencial.application.dto;

public record InventarioItemResponse(
        Long id,
        String nombre,
        String tipo,
        Integer stockActual,
        Double precioCompra,
        Double precioVenta,
        String emoji
) {}
