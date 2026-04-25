package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * @referencia: 01_Modelado_Negocio/ModeloDominio.mmd
 * @referencia_diseño: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 * @referencia_diseño: 03_Diseño/CU-03-Procesar-Pago/CU-03_Clases_Diseño.mmd
 */
@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "pagos")
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

    /** PENDIENTE_PAGO | PAGADA | CANCELADA */
    private String estado;

    /** Registra la hora exacta del pago — Postcondición CU-03 */
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    /** Límite para hacer check-in: fechaPago + 30 min — Postcondición CU-03 */
    @Column(name = "ventana_check_in")
    private LocalDateTime ventanaCheckIn;

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL)
    private List<Pago> pagos;

    /**
     * Experto en Información (Larman): la Reserva conoce su propio estado.
     * Registra la hora de pago y calcula la ventana de 30 min para check-in.
     */
    public void confirmarPago() {
        this.estado = "PAGADA";
        this.fechaPago = LocalDateTime.now();
        this.ventanaCheckIn = this.fechaPago.plusMinutes(30);
    }
}
