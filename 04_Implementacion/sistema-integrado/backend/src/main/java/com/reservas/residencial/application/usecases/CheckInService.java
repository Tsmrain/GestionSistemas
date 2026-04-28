package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.HabitacionResumenResponse;
import com.reservas.residencial.application.dto.HuespedResumenResponse;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

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
    private final PagoRepositoryPort pagoRepository;

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorCi(String ci) {
        return reservaRepository.findByHuespedCi(ci).stream()
                .filter(r -> "PENDIENTE_PAGO".equals(r.getEstado()) || "PAGADA".equals(r.getEstado()) || "ACTIVA".equals(r.getEstado()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorNombre(String nombre) {
        return reservaRepository.findByHuespedNombre(nombre).stream()
                .filter(this::esReservaVisibleParaCheckIn)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> buscarReservasPorCodigo(Long reservaId) {
        return reservaRepository.findById(reservaId)
                .filter(this::esReservaVisibleParaCheckIn)
                .map(this::toResponse)
                .map(List::of)
                .orElseGet(List::of);
    }

    @Transactional
    public ReservaResponse realizarCheckIn(Long reservaId, String acompananteNombre, String acompananteCi,
                                           LocalDate acompananteFechaNacimiento, String acompananteCelular,
                                           MultipartFile fotoAnverso, MultipartFile fotoReverso, String recepcionista) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (!"PAGADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar PAGADA antes de realizar el check-in. Estado actual: " + reserva.getEstado());
        }
        if (recepcionista == null || recepcionista.isBlank()) {
            throw new IllegalArgumentException("Debe iniciar sesion como recepcionista para realizar el check-in.");
        }

        Huesped acompananteGuardado = null;
        boolean tieneNombreAcompanante = acompananteNombre != null && !acompananteNombre.trim().isEmpty();
        boolean tieneCiAcompanante = acompananteCi != null && !acompananteCi.trim().isEmpty();
        boolean tieneFechaNacimientoAcompanante = acompananteFechaNacimiento != null;
        if (tieneNombreAcompanante || tieneCiAcompanante || tieneFechaNacimientoAcompanante) {
            if (!tieneNombreAcompanante || !tieneCiAcompanante || !tieneFechaNacimientoAcompanante) {
                throw new IllegalArgumentException("Para registrar acompanante debe ingresar nombre, CI y fecha de nacimiento.");
            }
        }

        if (tieneNombreAcompanante && tieneCiAcompanante && tieneFechaNacimientoAcompanante) {
            Huesped acompanante = new Huesped();
            acompanante.setNombre(acompananteNombre);
            acompanante.setCi(acompananteCi);
            acompanante.setFechaNacimiento(acompananteFechaNacimiento);
            acompanante.setCelular(acompananteCelular);

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

    private boolean esReservaVisibleParaCheckIn(Reserva reserva) {
        return "PENDIENTE_PAGO".equals(reserva.getEstado()) || "PAGADA".equals(reserva.getEstado()) || "ACTIVA".equals(reserva.getEstado());
    }

    private ReservaResponse toResponse(Reserva reserva) {
        Pago pago = pagoRepository.findLatestCompletedByReservaId(reserva.getId())
                .or(() -> pagoRepository.findLatestByReservaId(reserva.getId()))
                .orElse(null);

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
                        reserva.getHuesped().getFechaNacimiento(),
                        reserva.getHuesped().getCelular(),
                        reserva.getHuesped().getUrlFotoAnverso(),
                        reserva.getHuesped().getUrlFotoReverso()
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
                        reserva.getAcompanante().getFechaNacimiento(),
                        reserva.getAcompanante().getCelular(),
                        reserva.getAcompanante().getUrlFotoAnverso(),
                        reserva.getAcompanante().getUrlFotoReverso()
                ) : null,
                reserva.getHoraIngreso(),
                reserva.getHoraSalidaEstimada(),
                pago != null ? pago.getMetodo() : null,
                pago != null ? pago.getEstado() : null
        );
    }
}
