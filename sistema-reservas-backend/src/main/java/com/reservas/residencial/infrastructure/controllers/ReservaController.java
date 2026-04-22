package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.application.services.ReservaService;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.controllers.dto.ReservaRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> registrarReserva(@RequestBody ReservaRequestDTO request) {
        try {
            Reserva nuevaReserva = new Reserva();
            nuevaReserva.setClienteNombre(request.getClienteNombre());
            nuevaReserva.setFechaInicio(request.getFechaInicio());
            nuevaReserva.setFechaFin(request.getFechaFin());
            nuevaReserva.setMontoTotal(request.getMontoTotal());
            
            Habitacion h = new Habitacion();
            h.setId(request.getHabitacionId());
            nuevaReserva.setHabitacion(h);

            Reserva creada = reservaService.crearReserva(nuevaReserva);
            return ResponseEntity.ok(creada);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar la reserva: " + e.getMessage());
        }
    }
}
