package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.ConsumoExtra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaConsumoExtraRepository extends JpaRepository<ConsumoExtra, Long> {
}
