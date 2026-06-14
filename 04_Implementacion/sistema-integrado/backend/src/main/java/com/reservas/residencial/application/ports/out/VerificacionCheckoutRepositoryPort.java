package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.VerificacionCheckout;
import com.reservas.residencial.domain.models.VerificacionDetalle;
import java.util.List;
import java.util.Optional;

public interface VerificacionCheckoutRepositoryPort {
    VerificacionCheckout save(VerificacionCheckout verificacion);
    VerificacionDetalle saveDetalle(VerificacionDetalle detalle);
    Optional<VerificacionCheckout> findById(Long id);
    List<VerificacionCheckout> findAll();
    List<VerificacionCheckout> findByReservaId(Long reservaId);
    List<VerificacionDetalle> findDetallesByVerificacionId(Long verificacionId);
}
