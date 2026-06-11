package com.reservas.residencial.application.ports.out;

import com.reservas.residencial.domain.models.Egreso;
import java.time.LocalDateTime;
import java.util.List;

public interface EgresoRepositoryPort {
    Egreso save(Egreso egreso);
    List<Egreso> findAll();
    List<Egreso> findBetweenDates(LocalDateTime start, LocalDateTime end);
}
