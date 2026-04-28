package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.LoginRecepcionistaRequest;
import com.reservas.residencial.application.dto.RecepcionistaResponse;
import com.reservas.residencial.application.dto.RegistroRecepcionistaRequest;
import com.reservas.residencial.application.usecases.AutenticacionRecepcionistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AutenticacionController {

    private final AutenticacionRecepcionistaService autenticacionService;

    @PostMapping("/recepcion/login")
    public ResponseEntity<RecepcionistaResponse> loginRecepcion(@RequestBody LoginRecepcionistaRequest request) {
        return ResponseEntity.ok(autenticacionService.login(request.username(), request.password()));
    }

    @PostMapping("/recepcion/registro")
    public ResponseEntity<RecepcionistaResponse> registrarRecepcion(@RequestBody RegistroRecepcionistaRequest request) {
        return ResponseEntity.ok(autenticacionService.registrar(
                request.nombre(),
                request.username(),
                request.password()
        ));
    }
}
