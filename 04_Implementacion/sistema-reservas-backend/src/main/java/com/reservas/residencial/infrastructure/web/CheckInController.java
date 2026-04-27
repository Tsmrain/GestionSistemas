package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.usecases.CheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @referencia: CU-04 Realizar Check-in
 */
@RestController
@RequestMapping("/api/checkin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @GetMapping("/buscar")
    public ResponseEntity<List<ReservaResponse>> buscarPorCi(@RequestParam("ci") String ci) {
        return ResponseEntity.ok(checkInService.buscarReservasPorCi(ci));
    }

    @PostMapping(value = "/{reservaId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReservaResponse> realizarCheckIn(
            @PathVariable Long reservaId,
            @RequestParam(value = "acompananteNombre", required = false) String acompananteNombre,
            @RequestParam(value = "acompananteCi", required = false) String acompananteCi,
            @RequestParam(value = "fotoAnverso", required = false) MultipartFile fotoAnverso,
            @RequestParam(value = "fotoReverso", required = false) MultipartFile fotoReverso,
            @RequestParam(value = "recepcionista", required = false, defaultValue = "Recepcionista 1") String recepcionista) {
        
        return ResponseEntity.ok(checkInService.realizarCheckIn(reservaId, acompananteNombre, acompananteCi, fotoAnverso, fotoReverso, recepcionista));
    }

    @PostMapping("/{reservaId}/cancelar")
    public ResponseEntity<Void> cancelarCheckIn(@PathVariable Long reservaId) {
        checkInService.cancelarPorInconsistenciaIdentidad(reservaId);
        return ResponseEntity.noContent().build();
    }
}
