package com.reservas.residencial.infrastructure.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa la solicitud de consulta de disponibilidad.
 * Aplicando Low Representational Gap: nombres alineados con el Modelo de Dominio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaDisponibilidadRequest {
    private String tipoHabitacion;
    private String fechaConsulta;
}
