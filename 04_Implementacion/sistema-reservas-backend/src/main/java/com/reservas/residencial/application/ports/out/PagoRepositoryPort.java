package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Pago;
import java.util.Optional;

public interface PagoRepositoryPort {
    Pago save(Pago pago);
    Optional<Pago> findLatestByReservaId(Long reservaId);
    Optional<Pago> findPendingByReservaId(Long reservaId);
}
