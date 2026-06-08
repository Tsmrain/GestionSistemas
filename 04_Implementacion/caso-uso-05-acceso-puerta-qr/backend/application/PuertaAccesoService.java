package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.HabitacionResumenResponse;
import com.reservas.residencial.application.dto.HuespedResumenResponse;
import com.reservas.residencial.application.dto.PuertaAccesoResponse;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.dto.ValidarPuertaRequest;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PuertaAccesoService {

    private final ReservaRepositoryPort reservaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final PagoRepositoryPort pagoRepository;

    @Transactional
    public PuertaAccesoResponse validarAccesoPuerta(ValidarPuertaRequest request) {
        Long reservaId = extraerReservaIdDesdeQR(request.codigo());
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada para el QR."));

        String habitacionReserva = reserva.getHabitacion().getNumero();
        if (!habitacionReserva.equals(String.valueOf(request.habitacion()).trim())) {
            throw new IllegalStateException("El QR pertenece a la habitacion " + habitacionReserva + ".");
        }

        if ("ACTIVA".equals(reserva.getEstado())) {
            return new PuertaAccesoResponse(true, "La puerta ya estaba abierta para esta reserva.", toResponse(reserva));
        }

        if (!"PAGADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar PAGADA antes de abrir la puerta. Estado actual: " + reserva.getEstado());
        }

        reserva.realizarCheckIn(null, "Tablet puerta");
        reserva.getHabitacion().setEstadoActual("Ocupada");
        habitacionRepository.save(reserva.getHabitacion());

        Reserva reservaActualizada = reservaRepository.save(reserva);
        return new PuertaAccesoResponse(true, "Acceso autorizado. La puerta esta abierta.", toResponse(reservaActualizada));
    }

    private Long extraerReservaIdDesdeQR(String codigo) {
        String valor = String.valueOf(codigo == null ? "" : codigo).trim();
        String soloDigitos = valor.replaceAll("\\D+", "");
        if (soloDigitos.isBlank()) {
            throw new IllegalArgumentException("El QR no contiene un codigo de reserva valido.");
        }
        return Long.valueOf(soloDigitos);
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
                null,
                reserva.getHoraIngreso(),
                reserva.getHoraSalidaEstimada(),
                pago != null ? pago.getMetodo() : null,
                pago != null ? pago.getEstado() : null
        );
    }
}
