package com.reservas.residencial.infrastructure.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * DTO para la solicitud de registro de reserva.
 * Aplicando Low Representational Gap con el Modelo de Dominio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroReservaRequest {
    @NotBlank(message = "El nombre del huésped es obligatorio")
    private String huespedNombre;

    @NotBlank(message = "El documento de identidad es obligatorio")
    private String huespedDocumentoIdentidad;

    private String huespedCelular;

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long habitacionId;

    @NotNull(message = "La fecha de entrada es obligatoria")
    private LocalDate fechaEntrada;

    @NotNull(message = "La fecha de salida es obligatoria")
    private LocalDate fechaSalida;

    @NotNull(message = "El monto total es obligatorio")
    private Double montoTotal;
}
