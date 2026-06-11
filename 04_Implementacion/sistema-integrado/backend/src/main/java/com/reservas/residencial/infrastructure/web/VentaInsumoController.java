package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.CrearVentaInsumoRequest;
import com.reservas.residencial.application.dto.HistorialVentaInsumoResponse;
import com.reservas.residencial.application.dto.VentaInsumoResponse;
import com.reservas.residencial.application.usecases.VentaInsumoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas-insumos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VentaInsumoController {

    private final VentaInsumoService ventaInsumoService;

    @PostMapping
    public ResponseEntity<VentaInsumoResponse> registrarVenta(@Valid @RequestBody CrearVentaInsumoRequest request) {
        return ResponseEntity.ok(ventaInsumoService.registrarVenta(request));
    }

    @GetMapping
    public ResponseEntity<List<HistorialVentaInsumoResponse>> listarHistorial() {
        return ResponseEntity.ok(ventaInsumoService.listarHistorial());
    }
}
