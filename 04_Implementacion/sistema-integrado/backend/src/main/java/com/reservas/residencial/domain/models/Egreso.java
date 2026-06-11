package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "egresos")
@Data
@NoArgsConstructor
public class Egreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false)
    private String categoria; // INVENTARIO, REPARACION_MANTENIMIENTO, LAVANDERIA, SERVICIOS, SALARIOS, OTROS

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private String recepcionista;

    @Column(name = "url_comprobante")
    private String urlComprobante;

    public Egreso(String descripcion, Double monto, String categoria, String recepcionista, String urlComprobante) {
        this.descripcion = descripcion;
        this.monto = monto;
        this.categoria = categoria;
        this.recepcionista = recepcionista;
        this.urlComprobante = urlComprobante;
        this.fecha = LocalDateTime.now();
    }
}
