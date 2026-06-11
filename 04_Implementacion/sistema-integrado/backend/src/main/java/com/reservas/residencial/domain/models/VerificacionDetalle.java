package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "verificacion_detalles")
@Data
@NoArgsConstructor
public class VerificacionDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificacion_id", nullable = false)
    private VerificacionCheckout verificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InventarioItem item;

    @Column(name = "estado_reportado", nullable = false)
    private String estadoReportado; // FALTANTE, DAÑADO

    @Column(nullable = false)
    private Integer cantidad = 1;

    @Column(name = "cargo_aplicado")
    private Double cargoAplicado = 0.0;

    @Column(nullable = false)
    private Boolean cobrado = true;

    public VerificacionDetalle(VerificacionCheckout verificacion, InventarioItem item, String estadoReportado, Integer cantidad, Double cargoAplicado, Boolean cobrado) {
        this.verificacion = verificacion;
        this.item = item;
        this.estadoReportado = estadoReportado;
        this.cantidad = cantidad;
        this.cargoAplicado = cargoAplicado;
        this.cobrado = cobrado;
    }
}
