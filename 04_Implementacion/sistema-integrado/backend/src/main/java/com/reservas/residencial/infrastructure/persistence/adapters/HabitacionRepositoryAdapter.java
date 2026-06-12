package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHabitacionRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaTipoHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HabitacionRepositoryAdapter implements HabitacionRepositoryPort {

    private final JpaHabitacionRepository repository;
    private final JpaTipoHabitacionRepository tipoRepository;

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

    @Override
    public void updateEstadoActual(Long id, String estadoActual) {
        repository.updateEstadoActual(id, estadoActual);
    }

    // NUEVO
    @Override
    public List<Habitacion> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<TipoHabitacion> findAllTipos() {
        return tipoRepository.findAll();
    }

    @Override
    public Optional<TipoHabitacion> findTipoById(Long id) {
        return tipoRepository.findById(id);
    }

    @Override
    public Optional<Habitacion> findByNumero(String numero) {
        return repository.findByNumero(numero);
    }
}
