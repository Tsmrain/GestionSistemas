package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface JpaReservaRepository extends JpaRepository<Reserva, Long> {

    boolean existsByHabitacionIdAndFechaIngresoAndEstadoIgnoreCaseNot(
            Long habitacionId,
            LocalDate fechaIngreso,
            String estado
    );

    @Query("""
            select count(r) > 0
            from Reserva r
            where r.habitacion.id = :habitacionId
              and r.fechaIngreso = :fechaIngreso
              and upper(r.estado) in ('PENDIENTE_PAGO', 'PAGADA', 'ACTIVA')
            """)
    boolean existsReservaVigenteByHabitacionAndFecha(
            @Param("habitacionId") Long habitacionId,
            @Param("fechaIngreso") LocalDate fechaIngreso
    );

    java.util.List<Reserva> findByHuespedCi(String ci);

    java.util.List<Reserva> findByHuespedNombreContainingIgnoreCase(String nombre);

    java.util.Optional<Reserva> findFirstByHabitacionIdAndFechaIngresoAndEstadoIgnoreCaseNotOrderByIdDesc(
            Long habitacionId,
            LocalDate fechaIngreso,
            String estado
    );
}
