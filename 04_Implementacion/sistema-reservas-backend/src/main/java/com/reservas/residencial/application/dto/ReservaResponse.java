package com.reservas.residencial.application.dto;

import java.time.LocalDate;

public record ReservaResponse(
        Long id,
        String estado,
        LocalDate fechaIngreso,
        Integer cantidadBloques,
        Double montoTotal,
        HuespedResumenResponse huesped,
        HabitacionResumenResponse habitacion,
        HuespedResumenResponse acompanante,
        java.time.LocalDateTime horaIngreso,
        java.time.LocalDateTime horaSalidaEstimada
) {
}
