package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
 * @referencia_diseño: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "huesped_id", nullable = false)
    private Huesped huesped;

    @ManyToOne
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    @Column(name = "monto_total")
    private Double montoTotal;

    @Column(name = "fecha_creacion")
    private LocalDate fechaCreacion = LocalDate.now();
    
    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;
    
    @Column(name = "cantidad_bloques")
    private Integer cantidadBloques;

    private String estado; // PENDIENTE_PAGO, PAGADA, CANCELADA

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL)
    private List<Pago> pagos;

    public void confirmarPago() {
        this.estado = "PAGADA";
    }
}
