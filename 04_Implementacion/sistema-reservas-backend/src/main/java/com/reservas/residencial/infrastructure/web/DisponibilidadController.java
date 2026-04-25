package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.usecases.DisponibilidadService;
import com.reservas.residencial.infrastructure.web.dto.ConsultaDisponibilidadRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@RestController
@RequestMapping("/api/v1/habitaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;

    @GetMapping("/disponibles")
    public List<HabitacionDisponibleResponse> consultarDisponibilidad(
            @Valid @ModelAttribute ConsultaDisponibilidadRequest solicitud) {
        return disponibilidadService.consultarDisponibilidad(solicitud.toQuery());
    }
}
