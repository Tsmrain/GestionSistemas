package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa a un Huésped en el sistema.
 * Aplicando Low Representational Gap: nombres sincronizados con el Modelo de Dominio.
 */
@Entity
@Table(name = "huespedes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Huesped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String documentoIdentidad;

    private String celular;
    private String urlFotoAnverso;
    private String urlFotoReverso;
}
