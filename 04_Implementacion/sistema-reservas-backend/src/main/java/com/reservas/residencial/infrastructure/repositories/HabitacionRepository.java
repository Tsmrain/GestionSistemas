package com.reservas.residencial.infrastructure.repositories;

import com.reservas.residencial.domain.models.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    List<Habitacion> findByEstadoActual(String estadoActual);
    List<Habitacion> findByTipo_NombreTipoAndEstadoActual(String nombreTipo, String estadoActual);
}
