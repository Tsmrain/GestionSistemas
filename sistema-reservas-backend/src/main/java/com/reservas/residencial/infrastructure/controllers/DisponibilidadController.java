package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.application.services.DisponibilidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*") // Para desarrollo. En producción restringir.
public class DisponibilidadController {

    @Autowired
    private DisponibilidadService disponibilidadService;

    @GetMapping("/disponibles")
    public List<Habitacion> consultarDisponibilidad(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String tipo,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String fecha) {
        return disponibilidadService.obtenerHabitacionesDisponibles(tipo, fecha);
    }
}
