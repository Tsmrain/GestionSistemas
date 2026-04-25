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
        return repository.existsByHabitacionIdAndFechaIngresoAndEstadoIgnoreCaseNot(
                habitacionId,
                fechaIngreso,
                estadoExcluido
        );
    }
}
