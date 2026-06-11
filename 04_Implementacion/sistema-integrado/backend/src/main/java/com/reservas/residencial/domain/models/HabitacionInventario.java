package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "habitacion_inventario", uniqueConstraints = {@UniqueConstraint(columnNames = {"habitacion_id", "item_id"})})
@Data
@NoArgsConstructor
public class HabitacionInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventarioItem item;

    @Column(name = "cantidad_esperada", nullable = false)
    private Integer cantidadEsperada = 0;

    @Column(name = "cantidad_actual", nullable = false)
    private Integer cantidadActual = 0;

    @Column(name = "estado_verificacion", nullable = false)
    private String estadoVerificacion = "OK"; // OK, FALTANTE, DAÑADO

    public HabitacionInventario(Habitacion habitacion, InventarioItem item, Integer cantidadEsperada, Integer cantidadActual) {
        this.habitacion = habitacion;
        this.item = item;
        this.cantidadEsperada = cantidadEsperada;
        this.cantidadActual = cantidadActual;
        this.estadoVerificacion = "OK";
    }
}
