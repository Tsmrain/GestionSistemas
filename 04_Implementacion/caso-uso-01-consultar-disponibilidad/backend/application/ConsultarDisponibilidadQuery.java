package com.reservas.residencial.application.dto;

import java.time.LocalDate;

public record ConsultarDisponibilidadQuery(LocalDate fecha, String tipoNombre) {
}
