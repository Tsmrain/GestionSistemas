package com.reservas.residencial.application.dto;

import java.time.LocalDate;

public record HuespedResumenResponse(
        Long id,
        String nombre,
        String ci,
        LocalDate fechaNacimiento,
        String celular,
        String urlFotoAnverso,
        String urlFotoReverso
) {
}
