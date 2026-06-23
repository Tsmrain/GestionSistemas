package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.HabitacionEstadoResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.dto.GuardarHabitacionRequest;
import com.reservas.residencial.application.dto.TipoHabitacionRequest;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public List<HabitacionEstadoResponse> listarTodasConEstado() {
        return habitacionRepository.findAll()
                .stream()
                .map(this::toEstadoResponse)
                .toList();
    }

    @Transactional
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

    @Transactional
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
        String estadoPanel = estadoPanelConReserva(estadoOperativo, habitacion.getEstadoActual(), reservaVigente);

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
        return reservaRepository
                .findAllByHabitacionIdAndEstados(habitacion.getId(), List.of("ACTIVA", "PAGADA", "PENDIENTE_PAGO"))
                .stream()
                .filter(this::esReservaActualParaPanel)
                .findFirst()
                .orElse(null);
    }

    private String estadoPanelConReserva(String estadoOperativo, String estadoOriginal, Reserva reservaVigente) {
        if (reservaVigente != null) {
            if ("ACTIVA".equals(reservaVigente.getEstado())) {
                return "Ocupada";
            }
            return reservaVigente.getEstado();
        }
        return estadoOperativoParaPanel(estadoOperativo, estadoOriginal);
    }

    private boolean esReservaActualParaPanel(Reserva reserva) {
        return reserva.getFechaIngreso() == null || !reserva.getFechaIngreso().isAfter(LocalDate.now());
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

    @Transactional(readOnly = true)
    public List<TipoHabitacionResponse> listarTodosTipos() {
        return habitacionRepository.findAllTipos().stream()
                .map(this::toTipoResponse)
                .toList();
    }

    @Transactional
    public TipoHabitacionResponse crearTipoHabitacion(TipoHabitacionRequest request) {
        String nombre = requerido(request.nombreTipo(), "El nombre del tipo de habitación es obligatorio.");
        habitacionRepository.findTipoByNombre(nombre)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("El tipo de habitación ya existe: " + nombre);
                });

        TipoHabitacion tipo = new TipoHabitacion();
        aplicarTipoHabitacion(tipo, request);
        return toTipoResponse(habitacionRepository.saveTipo(tipo));
    }

    @Transactional
    public TipoHabitacionResponse actualizarTipoHabitacion(Long id, TipoHabitacionRequest request) {
        TipoHabitacion tipo = habitacionRepository.findTipoById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de habitación no encontrado: " + id));
        String nombre = requerido(request.nombreTipo(), "El nombre del tipo de habitación es obligatorio.");
        habitacionRepository.findTipoByNombre(nombre)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new IllegalArgumentException("El tipo de habitación ya existe: " + nombre);
                    }
                });

        aplicarTipoHabitacion(tipo, request);
        return toTipoResponse(habitacionRepository.saveTipo(tipo));
    }

    @Transactional
    public void eliminarTipoHabitacion(Long id) {
        if (habitacionRepository.findTipoById(id).isEmpty()) {
            throw new IllegalArgumentException("Tipo de habitación no encontrado: " + id);
        }
        if (habitacionRepository.existsByTipoId(id)) {
            throw new IllegalStateException("No se puede eliminar el tipo porque tiene habitaciones asociadas.");
        }
        habitacionRepository.deleteTipoById(id);
    }

    @Transactional
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

    @Transactional
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

    @Transactional
    public void eliminarHabitacion(Long id) {
        if (!habitacionRepository.findById(id).isPresent()) {
            throw new IllegalArgumentException("Habitación no encontrada: " + id);
        }
        if (reservaRepository.existsByHabitacionId(id)) {
            throw new IllegalStateException("No se puede eliminar la habitación porque tiene reservas asociadas.");
        }
        habitacionRepository.deleteById(id);
    }

    private void aplicarTipoHabitacion(TipoHabitacion tipo, TipoHabitacionRequest request) {
        tipo.setNombreTipo(requerido(request.nombreTipo(), "El nombre del tipo de habitación es obligatorio."));
        tipo.setPrecioBase(request.precioBase());
        tipo.setDuracionHoras(request.duracionHoras());
        tipo.setDescripcion(limpiar(request.descripcion()));
    }

    private TipoHabitacionResponse toTipoResponse(TipoHabitacion tipo) {
        return new TipoHabitacionResponse(
                tipo.getId(),
                tipo.getNombreTipo(),
                tipo.getPrecioBase(),
                tipo.getDuracionHoras(),
                tipo.getDescripcion()
        );
    }

    private String requerido(String value, String mensaje) {
        if (value == null || value.trim().isBlank()) {
            throw new IllegalArgumentException(mensaje);
        }
        return value.trim();
    }

    private String limpiar(String value) {
        return value == null ? null : value.trim();
    }
}
