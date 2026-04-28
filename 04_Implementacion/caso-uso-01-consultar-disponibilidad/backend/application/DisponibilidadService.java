package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.HabitacionEstadoResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private static final String ESTADO_CANCELADA = "CANCELADA";
    private static final String ESTADO_DISPONIBLE = "Disponible";
    private static final String ESTADO_LIMPIEZA = "Limpieza";

    private final HabitacionRepositoryPort habitacionRepository;
    private final ReservaRepositoryPort reservaRepository;

    public List<HabitacionDisponibleResponse> consultarDisponibilidad(ConsultarDisponibilidadQuery query) {
        String tipoNormalizado = normalizarTipo(query.tipoNombre());
        List<Habitacion> habitaciones = tipoNormalizado == null
                ? habitacionRepository.findDisponibles(query.fecha())
                : habitacionRepository.findDisponibles(query.fecha(), tipoNormalizado);

        return habitaciones.stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ NUEVO — lista todas las habitaciones con su estado actual
    public List<HabitacionEstadoResponse> listarTodasConEstado() {
        return habitacionRepository.findAll()
                .stream()
                .map(this::toEstadoResponse)
                .toList();
    }

    public HabitacionEstadoResponse marcarEnLimpieza(Long habitacionId) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada: " + habitacionId));

        reservaRepository.findActiveByHabitacionAndFecha(habitacionId, LocalDate.now(), ESTADO_CANCELADA)
                .filter(reserva -> "ACTIVA".equals(reserva.getEstado()))
                .ifPresent(reserva -> {
                    reserva.finalizarEstadia();
                    reservaRepository.save(reserva);
                });

        habitacion.setEstadoActual(ESTADO_LIMPIEZA);
        return toEstadoResponse(habitacionRepository.save(habitacion));
    }

    public HabitacionEstadoResponse marcarDisponible(Long habitacionId) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada: " + habitacionId));

        habitacion.setEstadoActual(ESTADO_DISPONIBLE);
        return toEstadoResponse(habitacionRepository.save(habitacion));
    }

    private String normalizarTipo(String tipoNombre) {
        if (tipoNombre == null)
            return null;
        String tipoNormalizado = tipoNombre.trim();
        if (tipoNormalizado.isBlank()
                || "Todas".equalsIgnoreCase(tipoNormalizado)
                || "Todas las habitaciones".equalsIgnoreCase(tipoNormalizado)) {
            return null;
        }
        return tipoNormalizado;
    }

    private HabitacionDisponibleResponse toResponse(Habitacion habitacion) {
        return new HabitacionDisponibleResponse(
                habitacion.getId(),
                habitacion.getNumero(),
                habitacion.getEstadoActual(),
                new TipoHabitacionResponse(
                        habitacion.getTipo().getId(),
                        habitacion.getTipo().getNombreTipo(),
                        habitacion.getTipo().getPrecioBase(),
                        habitacion.getTipo().getDuracionHoras(),
                        habitacion.getTipo().getDescripcion()));
    }

    // ✅ NUEVO
    private HabitacionEstadoResponse toEstadoResponse(Habitacion habitacion) {
        Reserva reservaVigente = reservaRepository
                .findActiveByHabitacionAndFecha(habitacion.getId(), LocalDate.now(), ESTADO_CANCELADA)
                .filter(reserva -> "PENDIENTE_PAGO".equals(reserva.getEstado())
                        || "PAGADA".equals(reserva.getEstado())
                        || "ACTIVA".equals(reserva.getEstado()))
                .orElse(null);

        String estadoPanel = reservaVigente != null
                ? reservaVigente.getEstado()
                : habitacion.getEstadoActual();

        return new HabitacionEstadoResponse(
                habitacion.getId(),
                habitacion.getNumero(),
                estadoPanel,
                new TipoHabitacionResponse(
                        habitacion.getTipo().getId(),
                        habitacion.getTipo().getNombreTipo(),
                        habitacion.getTipo().getPrecioBase(),
                        habitacion.getTipo().getDuracionHoras(),
                        habitacion.getTipo().getDescripcion()),
                reservaVigente != null ? reservaVigente.getHoraSalidaEstimada() : null);
    }
}
