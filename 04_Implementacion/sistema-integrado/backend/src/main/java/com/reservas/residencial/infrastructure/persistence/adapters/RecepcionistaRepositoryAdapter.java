package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.RecepcionistaRepositoryPort;
import com.reservas.residencial.domain.models.Recepcionista;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaRecepcionistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RecepcionistaRepositoryAdapter implements RecepcionistaRepositoryPort {

    private final JpaRecepcionistaRepository repository;

    @Override
    public Optional<Recepcionista> findByUsernameActivo(String username) {
        return repository.findByUsernameAndActivoTrue(username);
    }

    @Override
    public Optional<Recepcionista> findByUsername(String username) {
        return repository.findByUsername(username);
    }

    @Override
    public Optional<Recepcionista> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Recepcionista> findAll() {
        return repository.findAllByOrderByIdDesc();
    }

    @Override
    public Recepcionista save(Recepcionista recepcionista) {
        return repository.save(recepcionista);
    }
}
