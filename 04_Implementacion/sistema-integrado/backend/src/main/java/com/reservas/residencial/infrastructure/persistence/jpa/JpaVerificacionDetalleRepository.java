package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.VerificacionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaVerificacionDetalleRepository extends JpaRepository<VerificacionDetalle, Long> {
    List<VerificacionDetalle> findByVerificacionId(Long verificacionId);
}
