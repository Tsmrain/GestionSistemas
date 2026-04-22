package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.application.services.DisponibilidadService;
import com.reservas.residencial.infrastructure.controllers.dto.ConsultaDisponibilidadRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*") 
public class DisponibilidadController {

    @Autowired
    private DisponibilidadService disponibilidadService;

    // @mensaje: 1: consultarDisponibilidad(solicitud) | @patron: Controlador (Fachada)
    @GetMapping("/disponibles")
    public List<Habitacion> consultarDisponibilidad(ConsultaDisponibilidadRequest solicitud) {
        return disponibilidadService.consultarDisponibilidad(
                solicitud.getFecha(), 
                solicitud.getTipoNombre()
        );
    }
}
