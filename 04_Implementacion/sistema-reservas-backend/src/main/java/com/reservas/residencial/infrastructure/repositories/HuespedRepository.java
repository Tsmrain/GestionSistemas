package com.reservas.residencial.infrastructure.repositories;

import com.reservas.residencial.domain.models.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HuespedRepository extends JpaRepository<Huesped, Long> {
    Optional<Huesped> findByDocumentoIdentidad(String documentoIdentidad);
}
