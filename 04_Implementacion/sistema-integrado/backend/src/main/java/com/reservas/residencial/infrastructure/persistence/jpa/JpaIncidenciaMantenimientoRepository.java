package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.IncidenciaMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaIncidenciaMantenimientoRepository extends JpaRepository<IncidenciaMantenimiento, Long> {
    List<IncidenciaMantenimiento> findByHabitacionId(Long habitacionId);
    boolean existsByHabitacionIdAndEstado(Long habitacionId, String estado);
}
