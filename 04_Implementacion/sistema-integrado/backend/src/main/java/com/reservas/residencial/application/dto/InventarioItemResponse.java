package com.reservas.residencial.application.dto;

public record InventarioItemResponse(
        Long id,
        String nombre,
        String tipo,
        Integer stockActual,
        Integer stockEnUso,
        Integer stockDisponible,
        Double precioCompra,
        Double precioVenta,
        String emoji
) {}
