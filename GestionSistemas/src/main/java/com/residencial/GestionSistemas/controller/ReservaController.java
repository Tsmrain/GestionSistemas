package com.residencial.GestionSistemas.controller;

import com.residencial.GestionSistemas.model.Huesped;
import com.residencial.GestionSistemas.model.Reserva;
import com.residencial.GestionSistemas.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    // Obtener huésped por CI si existe
    @GetMapping("/huesped/{ci}")
    public ResponseEntity<?> obtenerHuespedPorCi(@PathVariable String ci) {
        try {
            Huesped huesped = reservaService.buscarOCrearHuesped(ci, null, null);
            return ResponseEntity.ok(huesped);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.ok(null); // No existe el huésped
        }
    }

    // Registrar reserva
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarReserva(@RequestBody Map<String, Object> payload) {
        try {
            String ci = (String) payload.get("ci");
            if (ci == null || ci.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: El CI del huésped no fue ingresado."); // RN-04
            }
            
            String nombreCompleto = (String) payload.get("nombreCompleto");
            String telefono = (String) payload.get("telefono");
            
            Number idHabitacionObj = (Number) payload.get("idHabitacion");
            if (idHabitacionObj == null) {
                return ResponseEntity.badRequest().body("El id de la habitación es requerido.");
            }
            Long idHabitacion = idHabitacionObj.longValue();

            String fechaIngresoStr = (String) payload.get("fechaIngreso");
            // Mapearlo a un objeto Reserva parcial
            Reserva reservaDatos = new Reserva();
            if (fechaIngresoStr != null) {
                reservaDatos.setFechaIngreso(java.time.LocalDate.parse(fechaIngresoStr));
            }

            Reserva nuevaReserva = reservaService.registrarReserva(ci, nombreCompleto, telefono, idHabitacion, reservaDatos);
            
            // Retornar la reserva con el generador de código único de referencia
            return ResponseEntity.ok(nuevaReserva);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage()); // Mensaje de disponibilidad (Ej: La habitación ya no se encuentra disponible.)
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Ocurrió un error al registrar la reserva.");
        }
    }
}
