package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@Service
public class DisponibilidadService {

    @Autowired
    private HabitacionRepository habitacionRepository;

    // @mensaje: 1: consultarDisponibilidad(fecha, tipoNombre) | @patron: Controlador
    public List<Habitacion> consultarDisponibilidad(LocalDate fecha, String tipoNombre) {
        if (tipoNombre == null || tipoNombre.equals("Todo")) {
            return habitacionRepository.findByEstadoActual("Disponible");
        }
        return habitacionRepository.findByTipo_NombreTipoAndEstadoActual(tipoNombre, "Disponible");
    }
}
