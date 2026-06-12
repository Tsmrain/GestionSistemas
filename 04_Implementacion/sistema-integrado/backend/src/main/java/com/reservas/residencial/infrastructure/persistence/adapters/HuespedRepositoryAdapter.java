package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHuespedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HuespedRepositoryAdapter implements HuespedRepositoryPort {

    private final JpaHuespedRepository repository;

    @Override
    public Huesped save(Huesped huesped) {
        return repository.save(huesped);
    }

    @Override
    public List<Huesped> findAll() {
        return repository.findAllByOrderByIdDesc();
    }

    @Override
    public List<Huesped> search(String termino) {
        return repository.findByNombreContainingIgnoreCaseOrCiContainingIgnoreCaseOrderByIdDesc(termino, termino);
    }

    @Override
    public Optional<Huesped> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
