package com.residencial.GestionSistemas.repository;

import com.residencial.GestionSistemas.model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    // Consulta SQL automática de Spring: Filtra por Tipo y Estado


    @Query("SELECT h FROM Habitacion h WHERE LOWER(h.tipo) = LOWER(:tipo) AND h.estado = 'Disponible'")

    List<Habitacion> findDisponiblesPorTipo(@Param("tipo") String tipo);
}