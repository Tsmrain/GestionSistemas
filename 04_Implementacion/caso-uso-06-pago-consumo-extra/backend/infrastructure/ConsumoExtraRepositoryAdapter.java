package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.ConsumoExtraRepositoryPort;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaConsumoExtraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ConsumoExtraRepositoryAdapter implements ConsumoExtraRepositoryPort {

    private final JpaConsumoExtraRepository repository;

    @Override
    public ConsumoExtra save(ConsumoExtra consumoExtra) {
        return repository.save(consumoExtra);
    }

    @Override
    public Optional<ConsumoExtra> findById(Long id) {
        return repository.findById(id);
    }
}
