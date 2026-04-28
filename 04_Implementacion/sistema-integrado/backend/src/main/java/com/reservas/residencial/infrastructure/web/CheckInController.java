package com.reservas.residencial.infrastructure.web;

import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.usecases.CheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
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
    public ResponseEntity<List<ReservaResponse>> buscar(
            @RequestParam(value = "ci", required = false) String ci,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "codigo", required = false) Long codigo,
            @RequestParam(value = "termino", required = false) String termino) {
        if (codigo != null) {
            return ResponseEntity.ok(checkInService.buscarReservasPorCodigo(codigo));
        }
        if (ci != null && !ci.isBlank()) {
            return ResponseEntity.ok(checkInService.buscarReservasPorCi(ci));
        }
        if (nombre != null && !nombre.isBlank()) {
            return ResponseEntity.ok(checkInService.buscarReservasPorNombre(nombre));
        }
        if (termino != null && !termino.isBlank()) {
            String valor = termino.trim();
            if (valor.matches("\\d+")) {
                List<ReservaResponse> porCodigo = checkInService.buscarReservasPorCodigo(Long.valueOf(valor));
                if (!porCodigo.isEmpty()) {
                    return ResponseEntity.ok(porCodigo);
                }
                return ResponseEntity.ok(checkInService.buscarReservasPorCi(valor));
            }
            return ResponseEntity.ok(checkInService.buscarReservasPorNombre(valor));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping(value = "/{reservaId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReservaResponse> realizarCheckIn(
            @PathVariable Long reservaId,
            @RequestParam(value = "acompananteNombre", required = false) String acompananteNombre,
            @RequestParam(value = "acompananteCi", required = false) String acompananteCi,
            @RequestParam(value = "acompananteFechaNacimiento", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate acompananteFechaNacimiento,
            @RequestParam(value = "acompananteCelular", required = false) String acompananteCelular,
            @RequestParam(value = "fotoAnverso", required = false) MultipartFile fotoAnverso,
            @RequestParam(value = "fotoReverso", required = false) MultipartFile fotoReverso,
            @RequestParam(value = "recepcionista") String recepcionista) {
        
        return ResponseEntity.ok(checkInService.realizarCheckIn(
                reservaId,
                acompananteNombre,
                acompananteCi,
                acompananteFechaNacimiento,
                acompananteCelular,
                fotoAnverso,
                fotoReverso,
                recepcionista
        ));
    }

    @PostMapping("/{reservaId}/cancelar")
    public ResponseEntity<Void> cancelarCheckIn(@PathVariable Long reservaId) {
        checkInService.cancelarPorInconsistenciaIdentidad(reservaId);
        return ResponseEntity.noContent().build();
    }
}
