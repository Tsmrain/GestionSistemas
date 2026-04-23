package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
 */
@Entity
@Table(name = "tipos_habitacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoHabitacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_tipo")
    private String nombreTipo;

    @Column(name = "precio_base")
    private Double precioBase;

    private String descripcion;

    public Double getPrecio() {
        return this.precioBase;
    }
}
