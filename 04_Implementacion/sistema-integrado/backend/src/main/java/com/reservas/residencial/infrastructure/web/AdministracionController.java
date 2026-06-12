package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.CamareraRequest;
import com.reservas.residencial.application.dto.CamareraResponse;
import com.reservas.residencial.application.dto.ClienteRequest;
import com.reservas.residencial.application.dto.ClienteResponse;
import com.reservas.residencial.application.dto.IncidenciaAdminRequest;
import com.reservas.residencial.application.dto.IncidenciaResponse;
import com.reservas.residencial.application.dto.RecepcionistaAdminRequest;
import com.reservas.residencial.application.dto.RecepcionistaAdminResponse;
import com.reservas.residencial.application.usecases.AdministracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdministracionController {

    private final AdministracionService administracionService;

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteResponse>> listarClientes(
            @RequestParam(value = "termino", required = false) String termino) {
        return ResponseEntity.ok(administracionService.listarClientes(termino));
    }

    @PostMapping("/clientes")
    public ResponseEntity<ClienteResponse> crearCliente(@RequestBody ClienteRequest request) {
        return ResponseEntity.ok(administracionService.crearCliente(request));
    }

    @PutMapping("/clientes/{id}")
    public ResponseEntity<ClienteResponse> actualizarCliente(@PathVariable Long id, @RequestBody ClienteRequest request) {
        return ResponseEntity.ok(administracionService.actualizarCliente(id, request));
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        administracionService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/camareras")
    public ResponseEntity<List<CamareraResponse>> listarCamareras() {
        return ResponseEntity.ok(administracionService.listarCamareras());
    }

    @GetMapping("/camareras/activas")
    public ResponseEntity<List<CamareraResponse>> listarCamarerasActivas() {
        return ResponseEntity.ok(administracionService.listarCamarerasActivas());
    }

    @PostMapping("/camareras")
    public ResponseEntity<CamareraResponse> crearCamarera(@RequestBody CamareraRequest request) {
        return ResponseEntity.ok(administracionService.crearCamarera(request));
    }

    @PutMapping("/camareras/{id}")
    public ResponseEntity<CamareraResponse> actualizarCamarera(@PathVariable Long id, @RequestBody CamareraRequest request) {
        return ResponseEntity.ok(administracionService.actualizarCamarera(id, request));
    }

    @DeleteMapping("/camareras/{id}")
    public ResponseEntity<Void> darBajaCamarera(@PathVariable Long id) {
        administracionService.darBajaCamarera(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recepcionistas")
    public ResponseEntity<List<RecepcionistaAdminResponse>> listarRecepcionistas() {
        return ResponseEntity.ok(administracionService.listarRecepcionistas());
    }

    @PostMapping("/recepcionistas")
    public ResponseEntity<RecepcionistaAdminResponse> crearRecepcionista(@RequestBody RecepcionistaAdminRequest request) {
        return ResponseEntity.ok(administracionService.crearRecepcionista(request));
    }

    @PutMapping("/recepcionistas/{id}")
    public ResponseEntity<RecepcionistaAdminResponse> actualizarRecepcionista(
            @PathVariable Long id,
            @RequestBody RecepcionistaAdminRequest request) {
        return ResponseEntity.ok(administracionService.actualizarRecepcionista(id, request));
    }

    @DeleteMapping("/recepcionistas/{id}")
    public ResponseEntity<Void> darBajaRecepcionista(@PathVariable Long id) {
        administracionService.darBajaRecepcionista(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/incidencias")
    public ResponseEntity<List<IncidenciaResponse>> listarIncidencias() {
        return ResponseEntity.ok(administracionService.listarIncidencias());
    }

    @PostMapping("/incidencias")
    public ResponseEntity<IncidenciaResponse> crearIncidencia(@RequestBody IncidenciaAdminRequest request) {
        return ResponseEntity.ok(administracionService.crearIncidencia(request));
    }

    @PutMapping("/incidencias/{id}")
    public ResponseEntity<IncidenciaResponse> actualizarIncidencia(
            @PathVariable Long id,
            @RequestBody IncidenciaAdminRequest request) {
        return ResponseEntity.ok(administracionService.actualizarIncidencia(id, request));
    }

    @DeleteMapping("/incidencias/{id}")
    public ResponseEntity<Void> darBajaIncidencia(
            @PathVariable Long id,
            @RequestParam(value = "recepcionista", required = false) String recepcionista) {
        administracionService.darBajaIncidencia(id, recepcionista);
        return ResponseEntity.noContent().build();
    }
}
