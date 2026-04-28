package com.reservas.residencial.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * @referencia_diseño: 03_Diseño/CU-03-Procesar-Pago/CU-03_Clases_Diseño.mmd
 *
 * Comprobante digital emitido al confirmar el pago — Postcondición CU-03.
 */
@Entity
@Table(name = "comprobantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "pago_id", nullable = false)
    private Pago pago;

    @Column(name = "nro_comprobante", unique = true)
    private String nroComprobante;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision;

    /**
     * Constructor semántico: genera automáticamente el número de comprobante
     * y la fecha de emisión al instanciar — Experto en Información.
     */
    public Comprobante(Pago pago) {
        this.pago = pago;
        this.fechaEmision = LocalDateTime.now();
        this.nroComprobante = "COMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
