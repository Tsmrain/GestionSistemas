package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.VentaInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaVentaInsumoRepository extends JpaRepository<VentaInsumo, Long> {
}
