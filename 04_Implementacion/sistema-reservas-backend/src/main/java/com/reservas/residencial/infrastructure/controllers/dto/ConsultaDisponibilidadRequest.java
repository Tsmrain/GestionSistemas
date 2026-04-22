package com.reservas.residencial.infrastructure.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaDisponibilidadRequest {
    private LocalDate fecha;
    private String tipoNombre;
}
