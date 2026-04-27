package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HabitacionRepositoryAdapter implements HabitacionRepositoryPort {

    private final JpaHabitacionRepository repository;

    @Override
    public List<Habitacion> findDisponibles(LocalDate fecha) {
        return repository.findDisponibles(fecha);
    }

    @Override
    public List<Habitacion> findDisponibles(LocalDate fecha, String tipoNombre) {
        return repository.findDisponibles(fecha, tipoNombre);
    }

    @Override
    public Optional<Habitacion> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Habitacion save(Habitacion habitacion) {
        return repository.save(habitacion);
    }
}
