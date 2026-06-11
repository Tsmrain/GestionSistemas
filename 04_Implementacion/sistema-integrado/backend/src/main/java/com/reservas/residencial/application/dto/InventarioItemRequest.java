package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventarioItemRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El tipo es obligatorio")
        String tipo,

        @NotNull(message = "El stock actual es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stockActual,

        @Min(value = 0, message = "El precio de compra no puede ser negativo")
        Double precioCompra,

        @Min(value = 0, message = "El precio de venta no puede ser negativo")
        Double precioVenta,

        String emoji
) {}
