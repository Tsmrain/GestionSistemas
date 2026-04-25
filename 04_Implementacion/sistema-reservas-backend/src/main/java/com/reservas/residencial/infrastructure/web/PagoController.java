package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.IniciarPagoRequest;
import com.reservas.residencial.application.dto.PagoStatusResponse;
import com.reservas.residencial.application.usecases.ProcesarPagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @referencia_diseño: 03_Diseño/CU-03-Procesar-Pago/CU-03_Clases_Diseño.mmd
 *
 * Cada endpoint corresponde a un actor / paso del CU-03 (Baja Brecha de Representación).
 */
@RestController
@RequestMapping("/api/v1/pagos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PagoController {

    private final ProcesarPagoService pagoService;

    /**
     * Paso 3 CU-03 — Actor selecciona método de pago (QR o Efectivo).
     * POST /api/v1/pagos/iniciar
     */
    @PostMapping("/iniciar")
    public ResponseEntity<PagoStatusResponse> iniciarPago(@Valid @RequestBody IniciarPagoRequest request) {
        return ResponseEntity.ok(pagoService.iniciarProcesoPago(request));
    }

    /**
     * Paso 7 CU-03 — Polling de verificación del estado del pago QR.
     * GET /api/v1/pagos/verificar/{reservaId}
     */
    @GetMapping("/verificar/{reservaId}")
    public ResponseEntity<PagoStatusResponse> verificarEstado(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.verificarEstadoPago(reservaId));
    }

    /**
     * Camino 3a CU-03 — Recepcionista confirma pago en efectivo.
     * POST /api/v1/pagos/efectivo/{reservaId}
     */
    @PostMapping("/efectivo/{reservaId}")
    public ResponseEntity<PagoStatusResponse> confirmarEfectivo(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.procesarPagoEfectivo(reservaId));
    }
}
