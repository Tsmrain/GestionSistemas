package com.residencial.GestionSistemas.controller;

import com.residencial.GestionSistemas.model.Habitacion;
import com.residencial.GestionSistemas.service.DisponibilidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/disponibilidad")
@CrossOrigin(origins = "*") // Permite a la Vista (React) consumir estos datos sin error de CORS
public class DisponibilidadController {

    @Autowired
    private DisponibilidadService service;

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarHabitaciones(@RequestParam String tipo, @RequestParam String fecha) {
        try {
            LocalDate fechaIngreso = LocalDate.parse(fecha);
            List<Habitacion> resultados = service.consultar(tipo, fechaIngreso);

            // Regla de Jira: Mensaje de no disponibilidad con sugerencias
            if (resultados.isEmpty()) {
                return ResponseEntity.ok("No hay habitaciones de tipo " + tipo
                        + " disponibles. Sugerencia: Consulte disponibilidad para tipo Estándar o en otras fechas.");
            }

            // Retorna los resultados (número, tipo, precio, estado)
            return ResponseEntity.ok(resultados);

        } catch (IllegalArgumentException e) {
            // Regla de Jira: Mensaje de error si la fecha es menor a la actual
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Formato de fecha inválido. Use AAAA-MM-DD.");
        }
    }
}