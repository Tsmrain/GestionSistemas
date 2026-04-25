package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.IniciarPagoRequest;
import com.reservas.residencial.application.dto.PagoStatusResponse;
import com.reservas.residencial.application.usecases.ProcesarPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final ProcesarPagoService pagoService;

    @PostMapping("/iniciar")
    public ResponseEntity<PagoStatusResponse> iniciarPago(@RequestBody IniciarPagoRequest request) {
        return ResponseEntity.ok(pagoService.iniciarProcesoPago(request));
    }

    @GetMapping("/verificar/{reservaId}")
    public ResponseEntity<PagoStatusResponse> verificarEstado(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.verificarEstadoPago(reservaId));
    }
}
