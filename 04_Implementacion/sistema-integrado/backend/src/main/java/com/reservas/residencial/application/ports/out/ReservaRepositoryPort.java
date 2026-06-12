package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Reserva;

import java.time.LocalDate;
import java.util.Collection;

public interface ReservaRepositoryPort {
    Reserva save(Reserva reserva);

    boolean existsActiveByHabitacionAndFecha(Long habitacionId, LocalDate fechaIngreso, String estadoExcluido);

    java.util.Optional<Reserva> findById(Long id);

    java.util.List<Reserva> findByHuespedCi(String ci);

    java.util.List<Reserva> findByHuespedNombre(String nombre);

    java.util.Optional<Reserva> findActiveByHabitacionAndFecha(Long habitacionId, LocalDate fechaIngreso, String estadoExcluido);

    java.util.Optional<Reserva> findVisibleByHabitacionId(Long habitacionId);

    java.util.Optional<Reserva> findByHabitacionIdAndEstados(Long habitacionId, Collection<String> estados);

    java.util.List<Reserva> findAllByHabitacionIdAndEstados(Long habitacionId, Collection<String> estados);

    boolean existsByHabitacionId(Long habitacionId);

    boolean existsByHuespedId(Long huespedId);
}
