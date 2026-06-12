package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Camarera;

import java.util.List;
import java.util.Optional;

public interface CamareraRepositoryPort {
    Camarera save(Camarera camarera);
    Optional<Camarera> findById(Long id);
    List<Camarera> findAll();
    List<Camarera> findActivas();
    Optional<Camarera> findByNombre(String nombre);
}
