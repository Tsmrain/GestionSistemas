package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.usecases.ReservaService;
import com.reservas.residencial.infrastructure.web.dto.RegistroReservaRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @referencia: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
@RestController
@RequestMapping("/api/v1/reservas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ReservaResponse registrarReserva(
            @Valid @ModelAttribute RegistroReservaRequest dto,
            @RequestParam("fotoAnverso") MultipartFile fotoAnverso,
            @RequestParam("fotoReverso") MultipartFile fotoReverso) {
        return reservaService.registrarReserva(dto.toCommand(), fotoAnverso, fotoReverso);
    }
}
