package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.VerificacionCheckoutRepositoryPort;
import com.reservas.residencial.domain.models.VerificacionCheckout;
import com.reservas.residencial.domain.models.VerificacionDetalle;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaVerificacionCheckoutRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaVerificacionDetalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VerificacionCheckoutRepositoryAdapter implements VerificacionCheckoutRepositoryPort {

    private final JpaVerificacionCheckoutRepository repository;
    private final JpaVerificacionDetalleRepository detalleRepository;

    @Override
    public VerificacionCheckout save(VerificacionCheckout verificacion) {
        return repository.save(verificacion);
    }

    @Override
    public VerificacionDetalle saveDetalle(VerificacionDetalle detalle) {
        return detalleRepository.save(detalle);
    }

    @Override
    public Optional<VerificacionCheckout> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<VerificacionCheckout> findAll() {
        return repository.findAllByOrderByFechaVerificacionDesc();
    }

    @Override
    public List<VerificacionCheckout> findByReservaId(Long reservaId) {
        return repository.findByReservaId(reservaId);
    }

    @Override
    public List<VerificacionDetalle> findDetallesByVerificacionId(Long verificacionId) {
        return detalleRepository.findByVerificacionId(verificacionId);
    }
}
