package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.HabitacionEstadoResponse;
import com.reservas.residencial.application.dto.GuardarHabitacionRequest;
import com.reservas.residencial.application.dto.TipoHabitacionRequest;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.usecases.DisponibilidadService;
import com.reservas.residencial.infrastructure.web.dto.ConsultaDisponibilidadRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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

    // ✅ NUEVO — lista todas las habitaciones con su estado para el dashboard
    @GetMapping
    public List<HabitacionEstadoResponse> listarTodasHabitaciones() {
        return disponibilidadService.listarTodasConEstado();
    }

    @PatchMapping("/{habitacionId}/limpieza")
    public HabitacionEstadoResponse marcarEnLimpieza(@PathVariable Long habitacionId) {
        return disponibilidadService.marcarEnLimpieza(habitacionId);
    }

    @PatchMapping("/{habitacionId}/disponible")
    public HabitacionEstadoResponse marcarDisponible(@PathVariable Long habitacionId) {
        return disponibilidadService.marcarDisponible(habitacionId);
    }

    @GetMapping("/tipos")
    public List<TipoHabitacionResponse> listarTipos() {
        return disponibilidadService.listarTodosTipos();
    }

    @PostMapping("/tipos")
    @ResponseStatus(HttpStatus.CREATED)
    public TipoHabitacionResponse crearTipoHabitacion(@Valid @RequestBody TipoHabitacionRequest request) {
        return disponibilidadService.crearTipoHabitacion(request);
    }

    @PutMapping("/tipos/{id}")
    public TipoHabitacionResponse actualizarTipoHabitacion(@PathVariable Long id, @Valid @RequestBody TipoHabitacionRequest request) {
        return disponibilidadService.actualizarTipoHabitacion(id, request);
    }

    @DeleteMapping("/tipos/{id}")
    public ResponseEntity<Void> eliminarTipoHabitacion(@PathVariable Long id) {
        disponibilidadService.eliminarTipoHabitacion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HabitacionEstadoResponse crearHabitacion(@Valid @RequestBody GuardarHabitacionRequest request) {
        return disponibilidadService.crearHabitacion(request);
    }

    @PutMapping("/{id}")
    public HabitacionEstadoResponse actualizarHabitacion(@PathVariable Long id, @Valid @RequestBody GuardarHabitacionRequest request) {
        return disponibilidadService.actualizarHabitacion(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHabitacion(@PathVariable Long id) {
        disponibilidadService.eliminarHabitacion(id);
        return ResponseEntity.noContent().build();
    }
}
