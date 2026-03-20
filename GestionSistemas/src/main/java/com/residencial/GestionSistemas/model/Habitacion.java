package com.residencial.GestionSistemas.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "habitaciones")
@Data // Esto genera getters, setters y constructores automáticamente por Lombok
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(nullable = false)
    private String tipo; // Estándar, VIP, SuperVIP

    @Column(nullable = false)
    private String estado; // Disponible, Ocupada, En Limpieza, En Mantenimiento

    @Column(nullable = false)
    private double precio; // Precio base de 150 Bs

    // El sistema debe ser capaz de conocer su propia disponibilidad (Regla de Jira)
    public boolean estaDisponible() {
        return "Disponible".equalsIgnoreCase(this.estado);
    }
}