package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.CamareraRepositoryPort;
import com.reservas.residencial.domain.models.Camarera;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaCamareraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CamareraRepositoryAdapter implements CamareraRepositoryPort {

    private final JpaCamareraRepository repository;

    @Override
    public Camarera save(Camarera camarera) {
        return repository.save(camarera);
    }

    @Override
    public Optional<Camarera> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Camarera> findAll() {
        return repository.findAllByOrderByIdDesc();
    }

    @Override
    public List<Camarera> findActivas() {
        return repository.findByActivoTrueOrderByNombreAsc();
    }

    @Override
    public Optional<Camarera> findByNombre(String nombre) {
        return repository.findByNombreIgnoreCase(nombre);
    }
}
