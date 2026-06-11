package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidencias_mantenimiento")
@Data
@NoArgsConstructor
public class IncidenciaMantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private InventarioItem item;

    @Column(nullable = false)
    private String descripcion;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDateTime fechaReporte;

    @Column(name = "recepcionista_reporta", nullable = false)
    private String recepcionistaReporta;

    @Column(nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE, REPARADO, DE_BAJA

    @Column(name = "costo_reparacion")
    private Double costoReparacion = 0.0;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "recepcionista_resuelve")
    private String recepcionistaResuelve;

    public IncidenciaMantenimiento(Habitacion habitacion, InventarioItem item, String descripcion, String recepcionistaReporta) {
        this.habitacion = habitacion;
        this.item = item;
        this.descripcion = descripcion;
        this.recepcionistaReporta = recepcionistaReporta;
        this.fechaReporte = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }

    public void resolver(Double costo, String recepcionista) {
        this.estado = "REPARADO";
        this.costoReparacion = costo;
        this.recepcionistaResuelve = recepcionista;
        this.fechaResolucion = LocalDateTime.now();
    }
}
