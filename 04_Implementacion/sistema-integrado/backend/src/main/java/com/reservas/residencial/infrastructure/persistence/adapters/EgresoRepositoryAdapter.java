package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.EgresoRepositoryPort;
import com.reservas.residencial.domain.models.Egreso;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaEgresoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EgresoRepositoryAdapter implements EgresoRepositoryPort {

    private final JpaEgresoRepository repository;

    @Override
    public Egreso save(Egreso egreso) {
        return repository.save(egreso);
    }

    @Override
    public List<Egreso> findAll() {
        return repository.findAll();
    }

    @Override
    public List<Egreso> findBetweenDates(LocalDateTime start, LocalDateTime end) {
        return repository.findBetweenDates(start, end);
    }
}
