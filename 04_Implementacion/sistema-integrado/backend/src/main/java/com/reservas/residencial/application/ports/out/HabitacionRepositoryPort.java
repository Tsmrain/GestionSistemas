package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Habitacion;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitacionRepositoryPort {
    List<Habitacion> findDisponibles(LocalDate fecha);

    List<Habitacion> findDisponibles(LocalDate fecha, String tipoNombre);

    Optional<Habitacion> findById(Long id);

    Habitacion save(Habitacion habitacion);

    void updateEstadoActual(Long id, String estadoActual);

    // ✅ NUEVO
    List<Habitacion> findAll();

    void deleteById(Long id);

    List<com.reservas.residencial.domain.models.TipoHabitacion> findAllTipos();

    Optional<com.reservas.residencial.domain.models.TipoHabitacion> findTipoById(Long id);

    Optional<Habitacion> findByNumero(String numero);
}
