package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.ConsumoExtraResponse;
import com.reservas.residencial.application.dto.CrearConsumoExtraRequest;
import com.reservas.residencial.application.dto.ProductoConsumoResponse;
import com.reservas.residencial.application.usecases.ConsumoExtraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/consumos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ConsumoExtraController {

    private final ConsumoExtraService consumoExtraService;

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoConsumoResponse>> listarProductos() {
        return ResponseEntity.ok(consumoExtraService.listarProductos());
    }

    @PostMapping("/pagar")
    public ResponseEntity<ConsumoExtraResponse> iniciarPago(@Valid @RequestBody CrearConsumoExtraRequest request) {
        return ResponseEntity.ok(consumoExtraService.iniciarPagoConsumo(request));
    }

    @PostMapping("/{consumoId}/confirmar")
    public ResponseEntity<ConsumoExtraResponse> confirmarPago(@PathVariable Long consumoId) {
        return ResponseEntity.ok(consumoExtraService.confirmarPagoConsumo(consumoId));
    }
}
