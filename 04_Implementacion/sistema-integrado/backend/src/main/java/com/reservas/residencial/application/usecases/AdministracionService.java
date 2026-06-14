package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.CamareraRequest;
import com.reservas.residencial.application.dto.CamareraResponse;
import com.reservas.residencial.application.dto.ClienteRequest;
import com.reservas.residencial.application.dto.ClienteResponse;
import com.reservas.residencial.application.dto.IncidenciaAdminRequest;
import com.reservas.residencial.application.dto.IncidenciaResponse;
import com.reservas.residencial.application.dto.RecepcionistaAdminRequest;
import com.reservas.residencial.application.dto.RecepcionistaAdminResponse;
import com.reservas.residencial.application.ports.out.CamareraRepositoryPort;
import com.reservas.residencial.application.ports.out.EgresoRepositoryPort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.application.ports.out.InventarioItemRepositoryPort;
import com.reservas.residencial.application.ports.out.RecepcionistaRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Camarera;
import com.reservas.residencial.domain.models.Egreso;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.IncidenciaMantenimiento;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.domain.models.Recepcionista;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdministracionService {

    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_REPARADO = "REPARADO";
    private static final String ESTADO_DE_BAJA = "DE_BAJA";

    private final HuespedRepositoryPort huespedRepository;
    private final ReservaRepositoryPort reservaRepository;
    private final CamareraRepositoryPort camareraRepository;
    private final RecepcionistaRepositoryPort recepcionistaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final InventarioItemRepositoryPort itemRepository;
    private final IncidenciaMantenimientoRepositoryPort incidenciaRepository;
    private final EgresoRepositoryPort egresoRepository;

    @Transactional(readOnly = true)
    public List<ClienteResponse> listarClientes(String termino) {
        List<Huesped> clientes = estaVacio(termino)
                ? huespedRepository.findAll()
                : huespedRepository.search(termino.trim());
        return clientes.stream().map(this::toClienteResponse).toList();
    }

    @Transactional
    public ClienteResponse crearCliente(ClienteRequest request) {
        Huesped cliente = new Huesped();
        aplicarCliente(cliente, request);
        return toClienteResponse(huespedRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse actualizarCliente(Long id, ClienteRequest request) {
        Huesped cliente = huespedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado: " + id));
        aplicarCliente(cliente, request);
        return toClienteResponse(huespedRepository.save(cliente));
    }

    @Transactional
    public void eliminarCliente(Long id) {
        if (huespedRepository.findById(id).isEmpty()) {
            throw new IllegalArgumentException("Cliente no encontrado: " + id);
        }
        if (reservaRepository.existsByHuespedId(id)) {
            throw new IllegalStateException("El cliente tiene historial de reservas; no se puede eliminar.");
        }
        huespedRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CamareraResponse> listarCamareras() {
        return camareraRepository.findAll().stream().map(this::toCamareraResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CamareraResponse> listarCamarerasActivas() {
        return camareraRepository.findActivas().stream().map(this::toCamareraResponse).toList();
    }

    @Transactional
    public CamareraResponse crearCamarera(CamareraRequest request) {
        String nombre = requerido(request.nombre(), "El nombre de la camarera es obligatorio.");
        camareraRepository.findByNombre(nombre).ifPresent(c -> {
            throw new IllegalArgumentException("Ya existe una camarera con ese nombre.");
        });

        Camarera camarera = new Camarera();
        camarera.setNombre(nombre);
        camarera.setCelular(limpiar(request.celular()));
        camarera.setActivo(request.activo() == null || request.activo());
        return toCamareraResponse(camareraRepository.save(camarera));
    }

    @Transactional
    public CamareraResponse actualizarCamarera(Long id, CamareraRequest request) {
        Camarera camarera = camareraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Camarera no encontrada: " + id));
        String nombre = requerido(request.nombre(), "El nombre de la camarera es obligatorio.");
        camareraRepository.findByNombre(nombre)
                .filter(existing -> !Objects.equals(existing.getId(), id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Ya existe una camarera con ese nombre.");
                });

        camarera.setNombre(nombre);
        camarera.setCelular(limpiar(request.celular()));
        camarera.setActivo(request.activo() == null || request.activo());
        return toCamareraResponse(camareraRepository.save(camarera));
    }

    @Transactional
    public void darBajaCamarera(Long id) {
        Camarera camarera = camareraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Camarera no encontrada: " + id));
        camarera.setActivo(false);
        camareraRepository.save(camarera);
    }

    @Transactional(readOnly = true)
    public List<RecepcionistaAdminResponse> listarRecepcionistas() {
        return recepcionistaRepository.findAll().stream().map(this::toRecepcionistaResponse).toList();
    }

    @Transactional
    public RecepcionistaAdminResponse crearRecepcionista(RecepcionistaAdminRequest request) {
        String nombre = requerido(request.nombre(), "El nombre de recepción es obligatorio.");
        String username = requerido(request.username(), "El usuario es obligatorio.");
        String password = requerido(request.password(), "La contraseña es obligatoria.");

        recepcionistaRepository.findByUsername(username).ifPresent(r -> {
            throw new IllegalArgumentException("Ya existe una recepcionista con ese usuario.");
        });

        Recepcionista recepcionista = new Recepcionista();
        recepcionista.setNombre(nombre);
        recepcionista.setUsername(username);
        recepcionista.setPassword(password);
        recepcionista.setActivo(request.activo() == null || request.activo());
        return toRecepcionistaResponse(recepcionistaRepository.save(recepcionista));
    }

    @Transactional
    public RecepcionistaAdminResponse actualizarRecepcionista(Long id, RecepcionistaAdminRequest request) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recepcionista no encontrada: " + id));
        String nombre = requerido(request.nombre(), "El nombre de recepción es obligatorio.");
        String username = requerido(request.username(), "El usuario es obligatorio.");

        recepcionistaRepository.findByUsername(username)
                .filter(existing -> !Objects.equals(existing.getId(), id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Ya existe una recepcionista con ese usuario.");
                });

        recepcionista.setNombre(nombre);
        recepcionista.setUsername(username);
        if (!estaVacio(request.password())) {
            recepcionista.setPassword(request.password().trim());
        }
        recepcionista.setActivo(request.activo() == null || request.activo());
        return toRecepcionistaResponse(recepcionistaRepository.save(recepcionista));
    }

    @Transactional
    public void darBajaRecepcionista(Long id) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recepcionista no encontrada: " + id));
        recepcionista.setActivo(false);
        recepcionistaRepository.save(recepcionista);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarIncidencias() {
        return incidenciaRepository.findAll().stream().map(this::toIncidenciaResponse).toList();
    }

    @Transactional
    public IncidenciaResponse crearIncidencia(IncidenciaAdminRequest request) {
        Habitacion habitacion = habitacionRepository.findById(request.habitacionId())
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + request.habitacionId()));
        InventarioItem item = buscarItemOpcional(request.itemId());
        String descripcion = requerido(request.descripcion(), "La descripción de la incidencia es obligatoria.");
        String reporta = estaVacio(request.recepcionistaReporta()) ? "Recepción" : request.recepcionistaReporta().trim();

        IncidenciaMantenimiento incidencia = new IncidenciaMantenimiento(habitacion, item, descripcion, reporta);
        incidencia.setSeguimiento(limpiar(request.seguimiento()));
        incidencia = incidenciaRepository.save(incidencia);
        sincronizarEstadoHabitacionPorIncidencias(habitacion);
        return toIncidenciaResponse(incidencia);
    }

    @Transactional
    public IncidenciaResponse actualizarIncidencia(Long id, IncidenciaAdminRequest request) {
        IncidenciaMantenimiento incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada: " + id));
        Long habitacionAnteriorId = incidencia.getHabitacion().getId();
        String estadoAnterior = incidencia.getEstado();

        if (request.habitacionId() != null && !Objects.equals(request.habitacionId(), habitacionAnteriorId)) {
            Habitacion nuevaHabitacion = habitacionRepository.findById(request.habitacionId())
                    .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + request.habitacionId()));
            incidencia.setHabitacion(nuevaHabitacion);
        }
        incidencia.setItem(buscarItemOpcional(request.itemId()));
        incidencia.setDescripcion(requerido(request.descripcion(), "La descripción de la incidencia es obligatoria."));
        incidencia.setSeguimiento(limpiar(request.seguimiento()));
        if (!estaVacio(request.recepcionistaReporta())) {
            incidencia.setRecepcionistaReporta(request.recepcionistaReporta().trim());
        }

        String estado = normalizarEstadoIncidencia(request.estado());
        if (ESTADO_REPARADO.equals(estado)) {
            incidencia.resolver(request.costoReparacion() == null ? 0.0 : request.costoReparacion(),
                    estaVacio(request.recepcionistaResuelve()) ? "Recepción" : request.recepcionistaResuelve().trim());
            if (!ESTADO_REPARADO.equals(estadoAnterior)) {
                registrarEgresoReparacionSiCorresponde(incidencia);
            }
        } else {
            incidencia.setEstado(estado);
            if (ESTADO_PENDIENTE.equals(estado)) {
                incidencia.setCostoReparacion(request.costoReparacion() == null ? 0.0 : request.costoReparacion());
                incidencia.setFechaResolucion(null);
                incidencia.setRecepcionistaResuelve(null);
            } else if (ESTADO_DE_BAJA.equals(estado)) {
                incidencia.setCostoReparacion(request.costoReparacion() == null ? 0.0 : request.costoReparacion());
                incidencia.setFechaResolucion(LocalDateTime.now());
                incidencia.setRecepcionistaResuelve(estaVacio(request.recepcionistaResuelve())
                        ? "Recepción"
                        : request.recepcionistaResuelve().trim());
            }
        }

        incidencia = incidenciaRepository.save(incidencia);
        if (!Objects.equals(habitacionAnteriorId, incidencia.getHabitacion().getId())) {
            habitacionRepository.findById(habitacionAnteriorId)
                    .ifPresent(this::sincronizarEstadoHabitacionPorIncidencias);
        }
        sincronizarEstadoHabitacionPorIncidencias(incidencia.getHabitacion());
        return toIncidenciaResponse(incidencia);
    }

    @Transactional
    public void darBajaIncidencia(Long id, String recepcionista) {
        IncidenciaMantenimiento incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada: " + id));
        incidencia.setEstado(ESTADO_DE_BAJA);
        incidencia.setFechaResolucion(LocalDateTime.now());
        incidencia.setRecepcionistaResuelve(estaVacio(recepcionista) ? "Recepción" : recepcionista.trim());
        if (estaVacio(incidencia.getSeguimiento())) {
            incidencia.setSeguimiento("Dada de baja por " + incidencia.getRecepcionistaResuelve());
        }
        incidenciaRepository.save(incidencia);
        sincronizarEstadoHabitacionPorIncidencias(incidencia.getHabitacion());
    }

    private void aplicarCliente(Huesped cliente, ClienteRequest request) {
        cliente.setNombre(requerido(request.nombre(), "El nombre del cliente es obligatorio."));
        cliente.setCi(requerido(request.ci(), "El CI del cliente es obligatorio."));
        cliente.setFechaNacimiento(request.fechaNacimiento());
        cliente.setCelular(limpiar(request.celular()));
        cliente.setUrlFotoAnverso(limpiar(request.urlFotoAnverso()));
        cliente.setUrlFotoReverso(limpiar(request.urlFotoReverso()));
    }

    private InventarioItem buscarItemOpcional(Long itemId) {
        if (itemId == null) {
            return null;
        }
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado: " + itemId));
    }

    private void sincronizarEstadoHabitacionPorIncidencias(Habitacion habitacion) {
        boolean tienePendientes = incidenciaRepository.existsByHabitacionIdAndEstado(habitacion.getId(), ESTADO_PENDIENTE);
        if (tienePendientes) {
            habitacion.setEstadoActual("Mantenimiento");
            habitacionRepository.updateEstadoActual(habitacion.getId(), "Mantenimiento");
            habitacionRepository.save(habitacion);
            return;
        }
        if ("Mantenimiento".equalsIgnoreCase(habitacion.getEstadoActual())) {
            habitacion.setEstadoActual("Disponible");
            habitacionRepository.updateEstadoActual(habitacion.getId(), "Disponible");
            habitacionRepository.save(habitacion);
        }
    }

    private void registrarEgresoReparacionSiCorresponde(IncidenciaMantenimiento incidencia) {
        Double costo = incidencia.getCostoReparacion();
        if (costo == null || costo <= 0) {
            return;
        }
        Egreso egreso = new Egreso(
                "Reparación: " + incidencia.getDescripcion() + " en Hab. " + incidencia.getHabitacion().getNumero(),
                costo,
                "REPARACION_MANTENIMIENTO",
                incidencia.getRecepcionistaResuelve(),
                null
        );
        egresoRepository.save(egreso);
    }

    private String normalizarEstadoIncidencia(String estado) {
        if (estaVacio(estado)) {
            return ESTADO_PENDIENTE;
        }
        String normalizado = estado.trim().toUpperCase(Locale.ROOT);
        if (ESTADO_PENDIENTE.equals(normalizado) || ESTADO_REPARADO.equals(normalizado) || ESTADO_DE_BAJA.equals(normalizado)) {
            return normalizado;
        }
        throw new IllegalArgumentException("Estado de incidencia no válido: " + estado);
    }

    private ClienteResponse toClienteResponse(Huesped cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getCi(),
                cliente.getFechaNacimiento(),
                cliente.getCelular(),
                cliente.getUrlFotoAnverso(),
                cliente.getUrlFotoReverso()
        );
    }

    private CamareraResponse toCamareraResponse(Camarera camarera) {
        return new CamareraResponse(camarera.getId(), camarera.getNombre(), camarera.getCelular(), camarera.getActivo());
    }

    private RecepcionistaAdminResponse toRecepcionistaResponse(Recepcionista recepcionista) {
        return new RecepcionistaAdminResponse(
                recepcionista.getId(),
                recepcionista.getNombre(),
                recepcionista.getUsername(),
                recepcionista.getActivo()
        );
    }

    private IncidenciaResponse toIncidenciaResponse(IncidenciaMantenimiento incidencia) {
        return new IncidenciaResponse(
                incidencia.getId(),
                incidencia.getHabitacion().getId(),
                incidencia.getHabitacion().getNumero(),
                incidencia.getItem() != null ? incidencia.getItem().getId() : null,
                incidencia.getItem() != null ? incidencia.getItem().getNombre() : "ESTRUCTURAL / OTRO",
                incidencia.getDescripcion(),
                incidencia.getSeguimiento(),
                incidencia.getFechaReporte(),
                incidencia.getRecepcionistaReporta(),
                incidencia.getEstado(),
                incidencia.getCostoReparacion(),
                incidencia.getFechaResolucion(),
                incidencia.getRecepcionistaResuelve()
        );
    }

    private String requerido(String value, String mensaje) {
        if (estaVacio(value)) {
            throw new IllegalArgumentException(mensaje);
        }
        return value.trim();
    }

    private String limpiar(String value) {
        return estaVacio(value) ? null : value.trim();
    }

    private boolean estaVacio(String value) {
        return value == null || value.trim().isEmpty();
    }
}
