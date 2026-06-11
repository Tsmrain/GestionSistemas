package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventario_items")
@Data
@NoArgsConstructor
public class InventarioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private String tipo; // VENTA, CORTESIA, REUSABLE, ACTIVO_FIJO

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual = 0;

    @Column(name = "precio_compra")
    private Double precioCompra;

    @Column(name = "precio_venta")
    private Double precioVenta;

    private String emoji;

    public InventarioItem(String nombre, String tipo, Integer stockActual, Double precioCompra, Double precioVenta, String emoji) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.stockActual = stockActual;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.emoji = emoji;
    }
}
