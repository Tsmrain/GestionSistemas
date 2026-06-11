package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.ConsumoExtra;

import java.util.List;
import java.util.Optional;

public interface ConsumoExtraRepositoryPort {
    ConsumoExtra save(ConsumoExtra consumoExtra);

    Optional<ConsumoExtra> findById(Long id);

    List<ConsumoExtra> findByReservaId(Long reservaId);
}
