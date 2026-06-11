package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "verificaciones_checkout")
@Data
@NoArgsConstructor
public class VerificacionCheckout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @Column(name = "fecha_verificacion", nullable = false)
    private LocalDateTime fechaVerificacion;

    @Column(nullable = false)
    private String recepcionista;

    @Column(name = "nombre_camarera")
    private String nombreCamarera;

    @Column(nullable = false)
    private Boolean conforme = true;

    private String observaciones;

    public VerificacionCheckout(Reserva reserva, Habitacion habitacion, String recepcionista, String nombreCamarera, Boolean conforme, String observaciones) {
        this.reserva = reserva;
        this.habitacion = habitacion;
        this.recepcionista = recepcionista;
        this.nombreCamarera = nombreCamarera;
        this.conforme = conforme;
        this.observaciones = observaciones;
        this.fechaVerificacion = LocalDateTime.now();
    }
}
