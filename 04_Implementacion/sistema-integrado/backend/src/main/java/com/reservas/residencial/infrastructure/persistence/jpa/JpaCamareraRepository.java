package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Camarera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JpaCamareraRepository extends JpaRepository<Camarera, Long> {
    List<Camarera> findAllByOrderByIdDesc();
    List<Camarera> findByActivoTrueOrderByNombreAsc();
    Optional<Camarera> findByNombreIgnoreCase(String nombre);
}
