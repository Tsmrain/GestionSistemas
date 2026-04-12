package com.residencial.GestionSistemas.model;
import com.residencial.GestionSistemas.model.Habitacion;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservas")
@Data
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "hora_entrada")
    private LocalTime horaEntrada;

    @Column(name = "hora_salida_estimada")
    private LocalTime horaSalidaEstimada;

    @Column(name = "hora_salida_real")
    private LocalTime horaSalidaReal;

    @Column(nullable = false)
    private String estado; // Pendiente / Confirmada / Activa / Finalizada / Cancelada

    @ManyToOne(optional = false)
    @JoinColumn(name = "huesped_id", nullable = false)
    private Huesped huesped;

    @ManyToOne(optional = false)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;
}
