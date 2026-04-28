package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.TipoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaTipoHabitacionRepository extends JpaRepository<TipoHabitacion, Long> {
    Optional<TipoHabitacion> findByNombreTipo(String nombreTipo);
}
