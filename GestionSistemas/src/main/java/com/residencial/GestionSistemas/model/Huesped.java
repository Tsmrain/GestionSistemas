package com.residencial.GestionSistemas.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "huespedes")
@Data
public class Huesped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_completo", nullable = false)
    private String nombreCompleto;

    @Column(nullable = false, unique = true)
    private String ci;

    private String telefono;
}
