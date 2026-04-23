package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface JpaReservaRepository extends JpaRepository<Reserva, Long> {

    boolean existsByHabitacionIdAndFechaIngresoAndEstadoIgnoreCaseNot(
            Long habitacionId,
            LocalDate fechaIngreso,
            String estado
    );
}
