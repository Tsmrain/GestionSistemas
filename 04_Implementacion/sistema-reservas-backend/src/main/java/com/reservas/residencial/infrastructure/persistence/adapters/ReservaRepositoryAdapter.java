package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ReservaRepositoryAdapter implements ReservaRepositoryPort {

    private final JpaReservaRepository repository;

    @Override
    public Reserva save(Reserva reserva) {
        return repository.save(reserva);
    }

    @Override
    public boolean existsActiveByHabitacionAndFecha(Long habitacionId, LocalDate fechaIngreso, String estadoExcluido) {
        return repository.existsReservaVigenteByHabitacionAndFecha(habitacionId, fechaIngreso);
    }

    @Override
    public java.util.Optional<Reserva> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public java.util.List<Reserva> findByHuespedCi(String ci) {
        return repository.findByHuespedCi(ci);
    }

    @Override
    public java.util.List<Reserva> findByHuespedNombre(String nombre) {
        return repository.findByHuespedNombreContainingIgnoreCase(nombre);
    }

    @Override
    public java.util.Optional<Reserva> findActiveByHabitacionAndFecha(Long habitacionId, LocalDate fechaIngreso, String estadoExcluido) {
        return repository.findFirstByHabitacionIdAndFechaIngresoAndEstadoIgnoreCaseNotOrderByIdDesc(
                habitacionId,
                fechaIngreso,
                estadoExcluido
        );
    }
}
