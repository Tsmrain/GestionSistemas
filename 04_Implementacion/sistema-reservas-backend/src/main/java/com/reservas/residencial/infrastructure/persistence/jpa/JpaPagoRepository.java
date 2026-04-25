package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JpaPagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findFirstByReservaIdOrderByFechaCreacionDesc(Long reservaId);
    Optional<Pago> findFirstByReservaIdAndEstadoOrderByFechaCreacionDesc(Long reservaId, String estado);
}
