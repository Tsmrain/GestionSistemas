package com.reservas.residencial.infrastructure.persistence.adapters;

import com.reservas.residencial.application.ports.out.HabitacionInventarioRepositoryPort;
import com.reservas.residencial.domain.models.HabitacionInventario;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHabitacionInventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class HabitacionInventarioRepositoryAdapter implements HabitacionInventarioRepositoryPort {

    private final JpaHabitacionInventarioRepository repository;

    @Override
    public HabitacionInventario save(HabitacionInventario habitacionInventario) {
        return repository.save(habitacionInventario);
    }

    @Override
    public List<HabitacionInventario> findByHabitacionId(Long habitacionId) {
        return repository.findByHabitacionId(habitacionId);
    }

    @Override
    public Optional<HabitacionInventario> findByHabitacionIdAndItemId(Long habitacionId, Long itemId) {
        return repository.findByHabitacionIdAndItemId(habitacionId, itemId);
    }

    @Override
    public Integer sumCantidadEsperadaByItemId(Long itemId) {
        return repository.sumCantidadEsperadaByItemId(itemId);
    }

    @Override
    public List<HabitacionInventario> saveAll(List<HabitacionInventario> items) {
        return repository.saveAll(items);
    }

    @Override
    public void delete(HabitacionInventario habitacionInventario) {
        repository.delete(habitacionInventario);
    }
}
