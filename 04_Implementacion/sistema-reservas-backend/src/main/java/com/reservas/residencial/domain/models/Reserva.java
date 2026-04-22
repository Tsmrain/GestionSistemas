package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
 * @referencia_diseño: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "huesped_id", nullable = false)
    private Huesped huesped;

    @ManyToOne
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @Column(name = "montoTotal")
    private Double montoTotal;

    @Column(name = "fechaCreacion")
    private LocalDate fechaCreacion = LocalDate.now();
    
    @Column(name = "fechaIngreso")
    private LocalDate fechaIngreso;
    
    @Column(name = "cantidadBloques")
    private Integer cantidadBloques;

    private String estado; // PENDIENTE_PAGO, PAGADA, CANCELADA
}
