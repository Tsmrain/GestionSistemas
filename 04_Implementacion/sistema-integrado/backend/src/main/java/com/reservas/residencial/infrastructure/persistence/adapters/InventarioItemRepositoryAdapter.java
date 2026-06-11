package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.InventarioItemRepositoryPort;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaInventarioItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InventarioItemRepositoryAdapter implements InventarioItemRepositoryPort {

    private final JpaInventarioItemRepository repository;

    @Override
    public InventarioItem save(InventarioItem item) {
        return repository.save(item);
    }

    @Override
    public Optional<InventarioItem> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<InventarioItem> findByNombre(String nombre) {
        return repository.findByNombre(nombre);
    }

    @Override
    public List<InventarioItem> findAll() {
        return repository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
