package com.residencial.GestionSistemas.repository;

import com.residencial.GestionSistemas.model.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HuespedRepository extends JpaRepository<Huesped, Long> {
    Optional<Huesped> findByCi(String ci);
}
