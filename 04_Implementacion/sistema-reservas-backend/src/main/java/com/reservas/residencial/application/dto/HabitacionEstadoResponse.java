package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;

public record HabitacionEstadoResponse(
                Long id,
                String numero,
                String estadoActual,
                TipoHabitacionResponse tipo,
                LocalDateTime horaSalidaEstimada) {
}