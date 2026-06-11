package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.ConsumoExtra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaConsumoExtraRepository extends JpaRepository<ConsumoExtra, Long> {
    List<ConsumoExtra> findByReservaIdOrderByFechaCreacionDesc(Long reservaId);
}
