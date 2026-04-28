package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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

    private String ci;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    private String celular;

    @Column(name = "url_foto_anverso")
    private String urlFotoAnverso;

    @Column(name = "url_foto_reverso")
    private String urlFotoReverso;
}
