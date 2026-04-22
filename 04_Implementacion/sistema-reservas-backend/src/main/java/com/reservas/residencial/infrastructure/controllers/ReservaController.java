package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.application.services.ReservaService;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.controllers.dto.RegistroReservaRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * @referencia: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    // @mensaje: 2: registrarReserva(dto, files) | @patron: Controlador (Fachada)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Reserva registrarReserva(
            RegistroReservaRequest dto,
            @RequestParam("fotoAnverso") MultipartFile fotoAnverso,
            @RequestParam("fotoReverso") MultipartFile fotoReverso) {
        return reservaService.registrarReserva(dto, fotoAnverso, fotoReverso);
    }
}
