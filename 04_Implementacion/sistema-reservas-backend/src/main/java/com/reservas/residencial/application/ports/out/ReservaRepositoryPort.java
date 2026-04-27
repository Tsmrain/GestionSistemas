package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Reserva;

import java.time.LocalDate;

public interface ReservaRepositoryPort {
    Reserva save(Reserva reserva);

    boolean existsActiveByHabitacionAndFecha(Long habitacionId, LocalDate fechaIngreso, String estadoExcluido);

    java.util.Optional<Reserva> findById(Long id);
}
