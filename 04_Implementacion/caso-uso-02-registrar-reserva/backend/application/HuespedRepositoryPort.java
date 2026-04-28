package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Huesped;

public interface HuespedRepositoryPort {
    Huesped save(Huesped huesped);
}
