package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.VerificacionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaVerificacionDetalleRepository extends JpaRepository<VerificacionDetalle, Long> {
}
