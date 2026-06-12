package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Huesped;

import java.util.List;
import java.util.Optional;

public interface HuespedRepositoryPort {
    Huesped save(Huesped huesped);
    List<Huesped> findAll();
    List<Huesped> search(String termino);
    Optional<Huesped> findById(Long id);
    void deleteById(Long id);
}
