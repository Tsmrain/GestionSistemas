package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
 * @patron: Especificación (Descripción) - Larman cap. 13
 */
@Entity
@Table(name = "habitaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Habitacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    @ManyToOne
    @JoinColumn(name = "tipo_id")
    private TipoHabitacion tipo;

    @Column(name = "estado_actual")
    private String estadoActual; // Disponible, Ocupada, Limpieza

    @Version
    private Long version;

    public Double getPrecioBase() {
        return this.tipo.getPrecioBase();
    }

    public boolean estaDisponible() {
        return "Disponible".equalsIgnoreCase(this.estadoActual);
    }
}
