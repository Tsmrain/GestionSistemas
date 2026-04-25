package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

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
    private Reserva reserva;

    private Double monto;
    private String metodo; // EFECTIVO, QR_BNB
    private String estado; // PENDIENTE, COMPLETADO, FALLIDO
    private String externalId; // ID del QR o transacción externa
    private LocalDateTime fecha = LocalDateTime.now();

    public Pago(Reserva reserva, Double monto, String metodo, String estado) {
        this.reserva = reserva;
        this.monto = monto;
        this.metodo = metodo;
        this.estado = estado;
        this.fecha = LocalDateTime.now();
    }
}
