package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Comprobante;

public interface ComprobanteRepositoryPort {
    Comprobante save(Comprobante comprobante);
}
