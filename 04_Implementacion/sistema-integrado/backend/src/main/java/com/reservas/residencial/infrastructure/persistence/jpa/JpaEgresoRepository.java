package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Egreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JpaEgresoRepository extends JpaRepository<Egreso, Long> {
    @Query("SELECT e FROM Egreso e WHERE e.fecha >= :start AND e.fecha <= :end")
    List<Egreso> findBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
