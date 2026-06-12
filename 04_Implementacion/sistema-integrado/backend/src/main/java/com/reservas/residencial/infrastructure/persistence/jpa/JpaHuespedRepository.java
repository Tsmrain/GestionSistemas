package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaHuespedRepository extends JpaRepository<Huesped, Long> {
    List<Huesped> findAllByOrderByIdDesc();
    List<Huesped> findByNombreContainingIgnoreCaseOrCiContainingIgnoreCaseOrderByIdDesc(String nombre, String ci);
}
