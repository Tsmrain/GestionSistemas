package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.EgresoRequest;
import com.reservas.residencial.application.dto.EgresoResponse;
import com.reservas.residencial.application.dto.ReporteFinanzasResponse;
import com.reservas.residencial.application.usecases.FinanzasService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/finanzas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FinanzasController {

    private final FinanzasService finanzasService;

    @GetMapping("/reporte")
    public ResponseEntity<ReporteFinanzasResponse> obtenerReporte(
            @RequestParam(value = "fechaInicio", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(value = "fechaFin", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(finanzasService.obtenerReporteFinanzas(fechaInicio, fechaFin));
    }

    @PostMapping(value = "/egresos", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<EgresoResponse> registrarEgresoJson(@Valid @RequestBody EgresoRequest request) {
        return ResponseEntity.ok(finanzasService.registrarEgreso(request));
    }

    @PostMapping(value = "/egresos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EgresoResponse> registrarEgreso(
            @RequestParam("descripcion") String descripcion,
            @RequestParam("monto") Double monto,
            @RequestParam("categoria") String categoria,
            @RequestParam("recepcionista") String recepcionista,
            @RequestParam(value = "destinoDestinatario", required = false) String destinoDestinatario,
            @RequestParam(value = "comprobante", required = false) MultipartFile comprobante) {
        EgresoRequest request = new EgresoRequest(descripcion, monto, categoria, recepcionista, destinoDestinatario, null);
        return ResponseEntity.ok(finanzasService.registrarEgreso(request, comprobante));
    }
}
