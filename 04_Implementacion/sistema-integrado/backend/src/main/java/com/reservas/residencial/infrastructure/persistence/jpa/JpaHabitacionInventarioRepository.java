package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.HabitacionInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaHabitacionInventarioRepository extends JpaRepository<HabitacionInventario, Long> {
    List<HabitacionInventario> findByHabitacionId(Long habitacionId);
    Optional<HabitacionInventario> findByHabitacionIdAndItemId(Long habitacionId, Long itemId);
}
