package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.ComprobanteRepositoryPort;
import com.reservas.residencial.domain.models.Comprobante;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaComprobanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ComprobanteRepositoryAdapter implements ComprobanteRepositoryPort {

    private final JpaComprobanteRepository jpaComprobanteRepository;

    @Override
    public Comprobante save(Comprobante comprobante) {
        return jpaComprobanteRepository.save(comprobante);
    }
}
