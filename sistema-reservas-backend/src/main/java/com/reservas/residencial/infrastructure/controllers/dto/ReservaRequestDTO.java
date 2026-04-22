package com.reservas.residencial.infrastructure.controllers.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservaRequestDTO {
    private String clienteNombre;
    private Long habitacionId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Double montoTotal;
}
