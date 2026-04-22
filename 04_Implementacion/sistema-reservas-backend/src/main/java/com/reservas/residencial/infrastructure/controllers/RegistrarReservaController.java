package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.application.services.ReservaService;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.controllers.dto.RegistroReservaRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controlador para el registro de reservas.
 * Nombre alineado con el diagrama de secuencia: RegistrarReservaController.
 */
@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegistrarReservaController {

    private final ReservaService reservaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registrarReserva(
            @Valid @ModelAttribute RegistroReservaRequest request,
            @RequestParam("fotoAnverso") MultipartFile fotoAnverso,
            @RequestParam("fotoReverso") MultipartFile fotoReverso) {
        try {
            // Transformación a Objetos del Dominio (LRG)
            Huesped huesped = new Huesped();
            huesped.setNombre(request.getHuespedNombre());
            huesped.setDocumentoIdentidad(request.getHuespedDocumentoIdentidad());
            huesped.setCelular(request.getHuespedCelular());

            Habitacion habitacion = new Habitacion();
            habitacion.setId(request.getHabitacionId());

            Reserva nuevaReserva = new Reserva();
            nuevaReserva.setHuesped(huesped);
            nuevaReserva.setHabitacion(habitacion);
            nuevaReserva.setFechaEntrada(request.getFechaEntrada());
            nuevaReserva.setFechaSalida(request.getFechaSalida());
            nuevaReserva.setMontoTotal(request.getMontoTotal());

            Reserva creada = reservaService.registrarReserva(nuevaReserva, fotoAnverso, fotoReverso);
            return ResponseEntity.ok(creada);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar la reserva: " + e.getMessage());
        }
    }

    @GetMapping("/huesped/{documentoIdentidad}")
    public ResponseEntity<?> buscarHuesped(@PathVariable String documentoIdentidad) {
        Huesped huesped = reservaService.buscarHuespedPorDocumento(documentoIdentidad);
        if (huesped != null) {
            return ResponseEntity.ok(huesped);
        }
        return ResponseEntity.notFound().build();
    }
}
