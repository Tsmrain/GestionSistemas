package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Comprobante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaComprobanteRepository extends JpaRepository<Comprobante, Long> {
}
