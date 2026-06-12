package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Recepcionista;

import java.util.List;
import java.util.Optional;

public interface RecepcionistaRepositoryPort {
    Optional<Recepcionista> findByUsernameActivo(String username);
    Optional<Recepcionista> findByUsername(String username);
    Optional<Recepcionista> findById(Long id);
    List<Recepcionista> findAll();
    Recepcionista save(Recepcionista recepcionista);
}
