package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.IncidenciaMantenimiento;
import java.util.List;
import java.util.Optional;

public interface IncidenciaMantenimientoRepositoryPort {
    IncidenciaMantenimiento save(IncidenciaMantenimiento incidencia);
    Optional<IncidenciaMantenimiento> findById(Long id);
    Optional<IncidenciaMantenimiento> findByIdWithDetails(Long id);
    List<IncidenciaMantenimiento> findAll();
    List<IncidenciaMantenimiento> findByHabitacionId(Long habitacionId);
    boolean existsByHabitacionIdAndEstado(Long habitacionId, String estado);
}
