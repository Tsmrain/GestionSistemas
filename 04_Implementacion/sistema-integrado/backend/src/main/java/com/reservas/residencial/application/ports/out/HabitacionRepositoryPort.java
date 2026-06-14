package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;

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

    List<TipoHabitacion> findAllTipos();

    Optional<TipoHabitacion> findTipoById(Long id);

    Optional<TipoHabitacion> findTipoByNombre(String nombreTipo);

    TipoHabitacion saveTipo(TipoHabitacion tipo);

    void deleteTipoById(Long id);

    boolean existsByTipoId(Long tipoId);

    Optional<Habitacion> findByNumero(String numero);
}
