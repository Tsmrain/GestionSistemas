package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
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

    private String nombre;
    
    private String celular;

    @Column(name = "urlFotoAnverso")
    private String urlFotoAnverso;

    @Column(name = "urlFotoReverso")
    private String urlFotoReverso;
}
