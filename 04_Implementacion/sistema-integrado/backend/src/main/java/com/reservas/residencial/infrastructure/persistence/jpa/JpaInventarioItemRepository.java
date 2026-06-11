package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.InventarioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaInventarioItemRepository extends JpaRepository<InventarioItem, Long> {
    Optional<InventarioItem> findByNombre(String nombre);
}
