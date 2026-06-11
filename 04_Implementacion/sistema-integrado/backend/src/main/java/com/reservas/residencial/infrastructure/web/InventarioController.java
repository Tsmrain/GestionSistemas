package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.*;
import com.reservas.residencial.application.usecases.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping("/items")
    public ResponseEntity<List<InventarioItemResponse>> listarItems() {
        return ResponseEntity.ok(inventarioService.listarItemsInventario());
    }

    @PostMapping("/items")
    public ResponseEntity<InventarioItemResponse> registrarItem(@Valid @RequestBody InventarioItemRequest request) {
        return ResponseEntity.ok(inventarioService.registrarItem(request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<InventarioItemResponse> actualizarItem(
            @PathVariable Long id,
            @Valid @RequestBody InventarioItemRequest request) {
        return ResponseEntity.ok(inventarioService.actualizarItem(id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> eliminarItem(@PathVariable Long id) {
        inventarioService.eliminarItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/habitacion/{habitacionId}")
    public ResponseEntity<List<HabitacionInventarioResponse>> listarInventarioHabitacion(@PathVariable Long habitacionId) {
        return ResponseEntity.ok(inventarioService.listarInventarioHabitacion(habitacionId));
    }

    @PostMapping("/habitacion/{habitacionId}/conciliar")
    public ResponseEntity<Void> conciliar(
            @PathVariable Long habitacionId,
            @RequestParam("itemId") Long itemId,
            @RequestParam("cantidadReal") Integer cantidadReal,
            @RequestParam("recepcionista") String recepcionista) {
        inventarioService.conciliarInventario(habitacionId, itemId, cantidadReal, recepcionista);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/incidencias")
    public ResponseEntity<List<IncidenciaResponse>> listarIncidencias() {
        return ResponseEntity.ok(inventarioService.listarIncidencias());
    }

    @PostMapping("/incidencias")
    public ResponseEntity<IncidenciaResponse> registrarIncidencia(@Valid @RequestBody IncidenciaRequest request) {
        return ResponseEntity.ok(inventarioService.registrarIncidencia(request));
    }

    @PostMapping("/incidencias/{id}/resolver")
    public ResponseEntity<IncidenciaResponse> resolverIncidencia(
            @PathVariable Long id,
            @RequestParam("costoReparacion") Double costoReparacion,
            @RequestParam("recepcionista") String recepcionista) {
        return ResponseEntity.ok(inventarioService.resolverIncidencia(id, costoReparacion, recepcionista));
    }

    @PostMapping("/habitacion/{habitacionId}/items")
    public ResponseEntity<Void> asignarItem(
            @PathVariable Long habitacionId,
            @RequestParam("itemId") Long itemId,
            @RequestParam("cantidadEsperada") Integer cantidadEsperada) {
        inventarioService.asignarItemAHabitacion(habitacionId, itemId, cantidadEsperada);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/habitacion/{habitacionId}/items/{itemId}")
    public ResponseEntity<Void> desasignarItem(
            @PathVariable Long habitacionId,
            @PathVariable Long itemId) {
        inventarioService.desasignarItemDeHabitacion(habitacionId, itemId);
        return ResponseEntity.noContent().build();
    }
}
