package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ventas_insumos")
@Data
@NoArgsConstructor
public class VentaInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habitacion_id")
    private Long habitacionId;

    @Column(name = "numero_habitacion")
    private String numeroHabitacion;

    @Column(name = "cliente")
    private String cliente;

    @Column(name = "ubicacion", nullable = false)
    private String ubicacion;

    @Column(name = "items_json", columnDefinition = "TEXT", nullable = false)
    private String itemsJson;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private String estado;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "recepcionista")
    private String recepcionista;

    public VentaInsumo(Long habitacionId, String numeroHabitacion, String cliente, String ubicacion,
                       String itemsJson, Double total, String recepcionista) {
        this.habitacionId = habitacionId;
        this.numeroHabitacion = numeroHabitacion;
        this.cliente = cliente;
        this.ubicacion = ubicacion;
        this.itemsJson = itemsJson;
        this.total = total;
        this.estado = "PAGADO";
        this.fecha = LocalDateTime.now();
        this.recepcionista = recepcionista;
    }
}
