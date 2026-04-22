package com.reservas.residencial.infrastructure.repositories;

import com.reservas.residencial.domain.models.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HuespedRepository extends JpaRepository<Huesped, Long> {
}
