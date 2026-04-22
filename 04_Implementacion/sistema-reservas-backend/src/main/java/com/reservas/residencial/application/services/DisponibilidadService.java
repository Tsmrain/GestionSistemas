package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DisponibilidadService {

    @Autowired
    private HabitacionRepository habitacionRepository;

    public List<Habitacion> obtenerHabitacionesDisponibles(String tipoHabitacion, String fechaConsulta) {
        if (tipoHabitacion == null || tipoHabitacion.equals("Todo")) {
            return habitacionRepository.findByEstado("Disponible");
        }
        return habitacionRepository.findByTipoAndEstado(tipoHabitacion, "Disponible");
    }
}
