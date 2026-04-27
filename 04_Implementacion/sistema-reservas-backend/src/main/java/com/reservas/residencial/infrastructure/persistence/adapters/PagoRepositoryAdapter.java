package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaPagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PagoRepositoryAdapter implements PagoRepositoryPort {

    private final JpaPagoRepository jpaPagoRepository;

    @Override
    public Pago save(Pago pago) {
        return jpaPagoRepository.save(pago);
    }

    @Override
    public Optional<Pago> findLatestByReservaId(Long reservaId) {
        return jpaPagoRepository.findFirstByReservaIdOrderByFechaCreacionDesc(reservaId);
    }

    @Override
    public Optional<Pago> findPendingByReservaId(Long reservaId) {
        return jpaPagoRepository.findFirstByReservaIdAndEstadoOrderByFechaCreacionDesc(reservaId, "PENDIENTE");
    }
}
