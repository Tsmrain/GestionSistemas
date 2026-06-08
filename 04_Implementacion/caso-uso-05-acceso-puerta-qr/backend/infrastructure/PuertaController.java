package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.PuertaAccesoResponse;
import com.reservas.residencial.application.dto.ValidarPuertaRequest;
import com.reservas.residencial.application.usecases.PuertaAccesoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/puerta")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PuertaController {

    private final PuertaAccesoService puertaAccesoService;

    @PostMapping("/validar")
    public ResponseEntity<PuertaAccesoResponse> validarAcceso(@Valid @RequestBody ValidarPuertaRequest request) {
        return ResponseEntity.ok(puertaAccesoService.validarAccesoPuerta(request));
    }
}
