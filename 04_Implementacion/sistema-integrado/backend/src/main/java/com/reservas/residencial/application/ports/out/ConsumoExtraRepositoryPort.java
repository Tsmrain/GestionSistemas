package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.ConsumoExtra;

import java.util.Optional;

public interface ConsumoExtraRepositoryPort {
    ConsumoExtra save(ConsumoExtra consumoExtra);

    Optional<ConsumoExtra> findById(Long id);
}
