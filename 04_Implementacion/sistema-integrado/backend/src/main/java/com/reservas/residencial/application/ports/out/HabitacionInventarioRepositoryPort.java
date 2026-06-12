package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.HabitacionInventario;
import java.util.List;
import java.util.Optional;

public interface HabitacionInventarioRepositoryPort {
    HabitacionInventario save(HabitacionInventario habitacionInventario);
    List<HabitacionInventario> findByHabitacionId(Long habitacionId);
    Optional<HabitacionInventario> findByHabitacionIdAndItemId(Long habitacionId, Long itemId);
    Integer sumCantidadEsperadaByItemId(Long itemId);
    List<HabitacionInventario> saveAll(List<HabitacionInventario> items);
    void delete(HabitacionInventario habitacionInventario);
}
