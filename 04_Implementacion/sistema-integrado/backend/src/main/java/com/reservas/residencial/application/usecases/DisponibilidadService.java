package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.HabitacionEstadoResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.dto.GuardarHabitacionRequest;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private static final String ESTADO_DISPONIBLE = "Disponible";
    private static final String ESTADO_LIMPIEZA = "Limpieza";

    private final HabitacionRepositoryPort habitacionRepository;
    private final ReservaRepositoryPort reservaRepository;
    private final IncidenciaMantenimientoRepositoryPort incidenciaRepository;

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

        reservaRepository.findAllByHabitacionIdAndEstados(habitacionId, List.of("ACTIVA"))
                .forEach(reserva -> {
                    reserva.finalizarEstadia();
                    reservaRepository.save(reserva);
                });

        habitacion.setEstadoActual(ESTADO_LIMPIEZA);
        habitacionRepository.updateEstadoActual(habitacionId, ESTADO_LIMPIEZA);
        return toEstadoResponse(habitacionRepository.save(habitacion));
    }

    public HabitacionEstadoResponse marcarDisponible(Long habitacionId) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada: " + habitacionId));

        if (incidenciaRepository.existsByHabitacionIdAndEstado(habitacionId, "PENDIENTE")) {
            habitacion.setEstadoActual("Mantenimiento");
            habitacionRepository.updateEstadoActual(habitacionId, "Mantenimiento");
            throw new IllegalStateException("La habitación tiene incidencias pendientes. Resuélvelas antes de marcarla disponible.");
        }

        habitacion.setEstadoActual(ESTADO_DISPONIBLE);
        habitacionRepository.updateEstadoActual(habitacionId, ESTADO_DISPONIBLE);
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
        String estadoOperativo = normalizarEstadoOperativo(habitacion.getEstadoActual());
        boolean tieneIncidenciaPendiente = !("LIMPIEZA".equals(estadoOperativo) || "MANTENIMIENTO".equals(estadoOperativo))
                && incidenciaRepository.existsByHabitacionIdAndEstado(habitacion.getId(), "PENDIENTE");
        if (tieneIncidenciaPendiente) {
            estadoOperativo = "MANTENIMIENTO";
        }
        Reserva reservaVigente = resolverReservaParaPanel(habitacion, estadoOperativo);
        String estadoPanel = estadoOperativoParaPanel(estadoOperativo, habitacion.getEstadoActual());

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
                reservaVigente != null ? reservaVigente.getHoraSalidaEstimada() : null,
                reservaVigente != null ? reservaVigente.getId() : null,
                reservaVigente != null ? reservaVigente.getEstado() : null,
                reservaVigente != null ? reservaVigente.getHuesped().getNombre() : null,
                reservaVigente != null ? reservaVigente.getHuesped().getCi() : null);
    }

    private Reserva resolverReservaParaPanel(Habitacion habitacion, String estadoOperativo) {
        if ("LIMPIEZA".equals(estadoOperativo) || "MANTENIMIENTO".equals(estadoOperativo)) {
            return null;
        }
        if ("OCUPADA".equals(estadoOperativo) || "ACTIVA".equals(estadoOperativo)) {
            return reservaRepository
                    .findAllByHabitacionIdAndEstados(habitacion.getId(), List.of("ACTIVA"))
                    .stream()
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    private String estadoOperativoParaPanel(String estadoOperativo, String estadoOriginal) {
        return switch (estadoOperativo) {
            case "DISPONIBLE" -> ESTADO_DISPONIBLE;
            case "LIMPIEZA" -> ESTADO_LIMPIEZA;
            case "MANTENIMIENTO" -> "Mantenimiento";
            case "OCUPADA", "ACTIVA" -> "Ocupada";
            default -> estadoOriginal;
        };
    }

    private String normalizarEstadoOperativo(String estado) {
        if (estado == null) return "";
        String limpio = estado.trim();
        if ("Limpieza".equalsIgnoreCase(limpio) || "En limpieza".equalsIgnoreCase(limpio)) return "LIMPIEZA";
        if ("Mantenimiento".equalsIgnoreCase(limpio)) return "MANTENIMIENTO";
        if ("Ocupada".equalsIgnoreCase(limpio)) return "OCUPADA";
        if ("Disponible".equalsIgnoreCase(limpio)) return "DISPONIBLE";
        return limpio.toUpperCase();
    }

    public List<TipoHabitacionResponse> listarTodosTipos() {
        return habitacionRepository.findAllTipos().stream()
                .map(t -> new TipoHabitacionResponse(
                        t.getId(),
                        t.getNombreTipo(),
                        t.getPrecioBase(),
                        t.getDuracionHoras(),
                        t.getDescripcion()
                ))
                .toList();
    }

    public HabitacionEstadoResponse crearHabitacion(GuardarHabitacionRequest request) {
        if (habitacionRepository.findByNumero(request.numero()).isPresent()) {
            throw new IllegalArgumentException("El número de habitación ya existe: " + request.numero());
        }
        TipoHabitacion tipo = habitacionRepository.findTipoById(request.tipoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de habitación no encontrado: " + request.tipoId()));

        Habitacion habitacion = new Habitacion();
        habitacion.setNumero(request.numero());
        habitacion.setTipo(tipo);
        habitacion.setEstadoActual(request.estadoActual());
        habitacion.setVersion(0L);

        return toEstadoResponse(habitacionRepository.save(habitacion));
    }

    public HabitacionEstadoResponse actualizarHabitacion(Long id, GuardarHabitacionRequest request) {
        Habitacion habitacion = habitacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + id));

        habitacionRepository.findByNumero(request.numero())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("El número de habitación ya está en uso: " + request.numero());
                    }
                });

        TipoHabitacion tipo = habitacionRepository.findTipoById(request.tipoId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de habitación no encontrado: " + request.tipoId()));

        habitacion.setNumero(request.numero());
        habitacion.setTipo(tipo);
        habitacion.setEstadoActual(request.estadoActual());

        return toEstadoResponse(habitacionRepository.save(habitacion));
    }

    public void eliminarHabitacion(Long id) {
        if (!habitacionRepository.findById(id).isPresent()) {
            throw new IllegalArgumentException("Habitación no encontrada: " + id);
        }
        if (reservaRepository.existsByHabitacionId(id)) {
            throw new IllegalStateException("No se puede eliminar la habitación porque tiene reservas asociadas.");
        }
        habitacionRepository.deleteById(id);
    }
}
