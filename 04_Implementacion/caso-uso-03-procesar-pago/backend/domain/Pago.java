package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @referencia_diseño: 03_Diseño/CU-03-Procesar-Pago/CU-03_Clases_Diseño.mmd
 *
 * Representa una transacción monetaria asociada a una Reserva.
 * Camino alternativo 7a: si el QR vence, el sistema puede comparar
 * LocalDateTime.now() con fechaExpiracion para detectarlo.
 */
@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Reserva reserva;

    private Double monto;

    /** EFECTIVO | QR_BNB */
    private String metodo;

    /** PENDIENTE | COMPLETADO | FALLIDO */
    private String estado;

    /** ID externo retornado por el API del BNB (externalId del QR) */
    @Column(name = "external_id")
    private String externalId;

    /** Imagen QR en Base64. Puede superar 255 caracteres. */
    @Column(name = "qr_data", columnDefinition = "TEXT")
    private String qrData;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    /**
     * Vencimiento del QR — 5 minutos (Camino alternativo 7a del CU-03).
     * Si LocalDateTime.now() > fechaExpiracion → QR vencido.
     */
    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    /**
     * Constructor semántico: Experto en Información.
     * Calcula la expiración automáticamente al instanciar un pago QR.
     */
    public Pago(Reserva reserva, Double monto, String metodo, String estado) {
        this.reserva = reserva;
        this.monto = monto;
        this.metodo = metodo;
        this.estado = estado;
        this.fechaCreacion = LocalDateTime.now();
        if ("QR_BNB".equals(metodo)) {
            this.fechaExpiracion = this.fechaCreacion.plusMinutes(5);
        }
    }

    /** Experto en Información: el Pago sabe si su QR ha expirado. */
    public boolean estaExpirado() {
        return fechaExpiracion != null && LocalDateTime.now().isAfter(fechaExpiracion);
    }
}
