package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Recepcionista;

import java.util.Optional;

public interface RecepcionistaRepositoryPort {
    Optional<Recepcionista> findByUsernameActivo(String username);
    Recepcionista save(Recepcionista recepcionista);
}
