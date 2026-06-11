package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.VerificacionCheckout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaVerificacionCheckoutRepository extends JpaRepository<VerificacionCheckout, Long> {
    List<VerificacionCheckout> findByReservaId(Long reservaId);
}
