package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.domain.models.IncidenciaMantenimiento;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaIncidenciaMantenimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class IncidenciaMantenimientoRepositoryAdapter implements IncidenciaMantenimientoRepositoryPort {

    private final JpaIncidenciaMantenimientoRepository repository;

    @Override
    public IncidenciaMantenimiento save(IncidenciaMantenimiento incidencia) {
        return repository.save(incidencia);
    }

    @Override
    public Optional<IncidenciaMantenimiento> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<IncidenciaMantenimiento> findAll() {
        return repository.findAll();
    }

    @Override
    public List<IncidenciaMantenimiento> findByHabitacionId(Long habitacionId) {
        return repository.findByHabitacionId(habitacionId);
    }
}
