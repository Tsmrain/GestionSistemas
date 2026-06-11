package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.InventarioItem;
import java.util.List;
import java.util.Optional;

public interface InventarioItemRepositoryPort {
    InventarioItem save(InventarioItem item);
    Optional<InventarioItem> findById(Long id);
    Optional<InventarioItem> findByNombre(String nombre);
    List<InventarioItem> findAll();
    void deleteById(Long id);
}
