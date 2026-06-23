package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.IncidenciaMantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaIncidenciaMantenimientoRepository extends JpaRepository<IncidenciaMantenimiento, Long> {
    @Query("""
            select i
            from IncidenciaMantenimiento i
            join fetch i.habitacion h
            left join fetch i.item it
            where i.id = :id
            """)
    Optional<IncidenciaMantenimiento> findByIdWithDetails(Long id);

    List<IncidenciaMantenimiento> findByHabitacionId(Long habitacionId);
    boolean existsByHabitacionIdAndEstado(Long habitacionId, String estado);
}
