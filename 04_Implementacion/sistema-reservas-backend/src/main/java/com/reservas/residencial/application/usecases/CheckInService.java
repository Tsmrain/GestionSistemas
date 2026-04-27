package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.HabitacionResumenResponse;
import com.reservas.residencial.application.dto.HuespedResumenResponse;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @referencia: CU-04 Realizar Check-in
 */
@Service
@RequiredArgsConstructor
public class CheckInService {

    private final ReservaRepositoryPort reservaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final HuespedRepositoryPort huespedRepository;
    private final FileStoragePort fileStoragePort;

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorCi(String ci) {
        return reservaRepository.findByHuespedCi(ci).stream()
                .filter(r -> "PENDIENTE_PAGO".equals(r.getEstado()) || "PAGADA".equals(r.getEstado()) || "ACTIVA".equals(r.getEstado()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservaResponse realizarCheckIn(Long reservaId, String acompananteNombre, String acompananteCi, 
                                           MultipartFile fotoAnverso, MultipartFile fotoReverso, String recepcionista) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!"PAGADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar PAGADA antes de realizar el check-in. Estado actual: " + reserva.getEstado());
        }

        Huesped acompananteGuardado = null;
        if (acompananteNombre != null && !acompananteNombre.trim().isEmpty() && acompananteCi != null && !acompananteCi.trim().isEmpty()) {
            Huesped acompanante = new Huesped();
            acompanante.setNombre(acompananteNombre);
            acompanante.setCi(acompananteCi);

            if (fotoAnverso != null && !fotoAnverso.isEmpty()) {
                acompanante.setUrlFotoAnverso(fileStoragePort.guardar(fotoAnverso));
            }
            if (fotoReverso != null && !fotoReverso.isEmpty()) {
                acompanante.setUrlFotoReverso(fileStoragePort.guardar(fotoReverso));
            }
            acompananteGuardado = huespedRepository.save(acompanante);
        }

        reserva.realizarCheckIn(acompananteGuardado, recepcionista);
        reserva.getHabitacion().setEstadoActual("Ocupada");
        
        habitacionRepository.save(reserva.getHabitacion());
        return toResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public void cancelarPorInconsistenciaIdentidad(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
                
        reserva.setEstado("CANCELADA");
        reserva.getHabitacion().setEstadoActual("Disponible");
        
        habitacionRepository.save(reserva.getHabitacion());
        reservaRepository.save(reserva);
    }

    private ReservaResponse toResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getEstado(),
                reserva.getFechaIngreso(),
                reserva.getCantidadBloques(),
                reserva.getMontoTotal(),
                new HuespedResumenResponse(
                        reserva.getHuesped().getId(),
                        reserva.getHuesped().getNombre(),
                        reserva.getHuesped().getCi(),
                        reserva.getHuesped().getCelular()
                ),
                new HabitacionResumenResponse(
                        reserva.getHabitacion().getId(),
                        reserva.getHabitacion().getNumero(),
                        new TipoHabitacionResponse(
                                reserva.getHabitacion().getTipo().getId(),
                                reserva.getHabitacion().getTipo().getNombreTipo(),
                                reserva.getHabitacion().getTipo().getPrecioBase(),
                                reserva.getHabitacion().getTipo().getDuracionHoras(),
                                reserva.getHabitacion().getTipo().getDescripcion()
                        )
                ),
                reserva.getAcompanante() != null ? new HuespedResumenResponse(
                        reserva.getAcompanante().getId(),
                        reserva.getAcompanante().getNombre(),
                        reserva.getAcompanante().getCi(),
                        reserva.getAcompanante().getCelular()
                ) : null,
                reserva.getHoraIngreso(),
                reserva.getHoraSalidaEstimada()
        );
    }
}
