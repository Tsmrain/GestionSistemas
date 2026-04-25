package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHuespedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HuespedRepositoryAdapter implements HuespedRepositoryPort {

    private final JpaHuespedRepository repository;

    @Override
    public Huesped save(Huesped huesped) {
        return repository.save(huesped);
    }
}
