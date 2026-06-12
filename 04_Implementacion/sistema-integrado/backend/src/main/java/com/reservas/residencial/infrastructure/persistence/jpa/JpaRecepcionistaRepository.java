package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JpaRecepcionistaRepository extends JpaRepository<Recepcionista, Long> {
    Optional<Recepcionista> findByUsernameAndActivoTrue(String username);
    Optional<Recepcionista> findByUsername(String username);
    List<Recepcionista> findAllByOrderByIdDesc();
}
