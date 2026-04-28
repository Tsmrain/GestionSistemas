package com.reservas.residencial.application.dto;

import java.time.LocalDate;

public record RegistroReservaCommand(
        String nombre,
        String ci,
        String celular,
        LocalDate fechaIngreso,
        Integer cantidadBloques,
        Long habitacionId
) {
}
