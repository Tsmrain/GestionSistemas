package com.reservas.residencial.infrastructure.persistence.jpa;

import com.reservas.residencial.domain.models.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JpaHabitacionRepository extends JpaRepository<Habitacion, Long> {

    @Query("""
            select h
            from Habitacion h
            join fetch h.tipo t
            where h.estadoActual = 'Disponible'
              and not exists (
                  select 1
                  from Reserva r
                  where r.habitacion = h
                    and r.fechaIngreso = :fecha
                    and upper(r.estado) in ('PENDIENTE_PAGO', 'PAGADA', 'ACTIVA')
              )
            order by h.numero
            """)
    List<Habitacion> findDisponibles(@Param("fecha") LocalDate fecha);

    @Query("""
            select h
            from Habitacion h
            join fetch h.tipo t
            where h.estadoActual = 'Disponible'
              and lower(t.nombreTipo) = lower(:tipoNombre)
              and not exists (
                  select 1
                  from Reserva r
                  where r.habitacion = h
                    and r.fechaIngreso = :fecha
                    and upper(r.estado) in ('PENDIENTE_PAGO', 'PAGADA', 'ACTIVA')
              )
            order by h.numero
            """)
    List<Habitacion> findDisponibles(@Param("fecha") LocalDate fecha, @Param("tipoNombre") String tipoNombre);

    java.util.Optional<Habitacion> findByNumero(String numero);

    boolean existsByTipoId(Long tipoId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Habitacion h set h.estadoActual = :estadoActual where h.id = :id")
    void updateEstadoActual(@Param("id") Long id, @Param("estadoActual") String estadoActual);
}
