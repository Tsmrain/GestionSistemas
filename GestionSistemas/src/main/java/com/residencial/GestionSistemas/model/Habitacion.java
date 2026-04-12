package com.residencial.GestionSistemas.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "habitaciones")
@Data // Esto genera getters, setters y constructores automáticamente por Lombok
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @Column(nullable = false, unique = true)
    @JsonProperty("numero")
    private Integer numero;

    @Column(nullable = false)
    @JsonProperty("tipo")
    private String tipo; // Estándar, VIP, SuperVIP

    @Column(nullable = false)
    @JsonProperty("estado")
    private String estado; // Disponible, Ocupada, En Limpieza, En Mantenimiento

    @Column(nullable = false)
    @JsonProperty("precio")
    private double precio; // Precio base de 150 Bs

    // El sistema debe ser capaz de conocer su propia disponibilidad (Regla de Jira)
    public boolean estaDisponible() {
        return "Disponible".equalsIgnoreCase(this.estado);
    }
}