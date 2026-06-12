package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.*;
import com.reservas.residencial.application.ports.out.*;
import com.reservas.residencial.domain.models.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioItemRepositoryPort itemRepository;
    private final HabitacionInventarioRepositoryPort habitacionInventarioRepository;
    private final IncidenciaMantenimientoRepositoryPort incidenciaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final EgresoRepositoryPort egresoRepository;

    @Transactional(readOnly = true)
    public List<InventarioItemResponse> listarItemsInventario() {
        return itemRepository.findAll().stream()
                .map(this::toItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HabitacionInventarioResponse> listarInventarioHabitacion(Long habitacionId) {
        return habitacionInventarioRepository.findByHabitacionId(habitacionId).stream()
                .map(this::toHabitacionInventarioResponse)
                .toList();
    }

    @Transactional
    public void conciliarInventario(Long habitacionId, Long itemId, Integer cantidadReal, String recepcionista) {
        HabitacionInventario habInv = habitacionInventarioRepository.findByHabitacionIdAndItemId(habitacionId, itemId)
                .orElseThrow(() -> new IllegalArgumentException("El item no está asociado a esta habitación."));

        Integer cantidadAnterior = habInv.getCantidadActual();
        Integer esperada = habInv.getCantidadEsperada();

        habInv.setCantidadActual(cantidadReal);
        if (cantidadReal.equals(esperada)) {
            habInv.setEstadoVerificacion("OK");
        } else if (cantidadReal < esperada) {
            habInv.setEstadoVerificacion("FALTANTE");

            // Si hay faltante, registrar pérdida en egresos
            Integer faltante = esperada - cantidadReal;
            Double costoUnitario = habInv.getItem().getPrecioCompra() != null ? habInv.getItem().getPrecioCompra() : 0.0;
            Double totalPerdido = costoUnitario * faltante;
            if (totalPerdido > 0) {
                Egreso egreso = new Egreso(
                        "Faltante: " + faltante + " " + habInv.getItem().getNombre() + " en Hab. " + habInv.getHabitacion().getNumero(),
                        totalPerdido,
                        "INVENTARIO",
                        recepcionista,
                        null
                );
                egresoRepository.save(egreso);
            }
        } else {
            habInv.setEstadoVerificacion("OK"); // Excedente
        }

        habitacionInventarioRepository.save(habInv);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponse> listarIncidencias() {
        return incidenciaRepository.findAll().stream()
                .map(this::toIncidenciaResponse)
                .toList();
    }

    @Transactional
    public IncidenciaResponse registrarIncidencia(IncidenciaRequest request) {
        Habitacion habitacion = habitacionRepository.findById(request.habitacionId())
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + request.habitacionId()));

        InventarioItem item = null;
        if (request.itemId() != null) {
            item = itemRepository.findById(request.itemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item de inventario no encontrado: " + request.itemId()));
        }

        IncidenciaMantenimiento incidencia = new IncidenciaMantenimiento(
                habitacion,
                item,
                request.descripcion(),
                request.recepcionistaReporta()
        );

        incidencia = incidenciaRepository.save(incidencia);

        // Bloquear habitación por mantenimiento
        habitacion.setEstadoActual("Mantenimiento");
        habitacionRepository.updateEstadoActual(habitacion.getId(), "Mantenimiento");
        habitacionRepository.save(habitacion);

        return toIncidenciaResponse(incidencia);
    }

    @Transactional
    public IncidenciaResponse resolverIncidencia(Long incidenciaId, Double costoReparacion, String recepcionista) {
        IncidenciaMantenimiento incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada: " + incidenciaId));

        incidencia.resolver(costoReparacion, recepcionista);
        incidencia = incidenciaRepository.save(incidencia);

        // Si hay costo, registrar egreso
        if (costoReparacion != null && costoReparacion > 0) {
            Egreso egreso = new Egreso(
                    "Reparación: " + incidencia.getDescripcion() + " en Hab. " + incidencia.getHabitacion().getNumero(),
                    costoReparacion,
                    "REPARACION_MANTENIMIENTO",
                    recepcionista,
                    null
            );
            egresoRepository.save(egreso);
        }

        // Habilitar habitación si ya no tiene incidencias pendientes
        List<IncidenciaMantenimiento> incidenciasHab = incidenciaRepository.findByHabitacionId(incidencia.getHabitacion().getId());
        boolean tienePendientes = incidenciasHab.stream()
                .anyMatch(i -> "PENDIENTE".equals(i.getEstado()));

        if (!tienePendientes) {
            Habitacion habitacion = incidencia.getHabitacion();
            habitacion.setEstadoActual("Disponible");
            habitacionRepository.updateEstadoActual(habitacion.getId(), "Disponible");
            habitacionRepository.save(habitacion);
        }

        return toIncidenciaResponse(incidencia);
    }

    @Transactional
    public InventarioItemResponse registrarItem(InventarioItemRequest request) {
        if (itemRepository.findByNombre(request.nombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un artículo con el nombre: " + request.nombre());
        }

        InventarioItem item = new InventarioItem(
                request.nombre(),
                request.tipo(),
                request.stockActual(),
                request.precioCompra(),
                request.precioVenta(),
                request.emoji()
        );

        item = itemRepository.save(item);
        return toItemResponse(item);
    }

    @Transactional
    public InventarioItemResponse actualizarItem(Long id, InventarioItemRequest request) {
        InventarioItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + id));

        if (!item.getNombre().equalsIgnoreCase(request.nombre())) {
            if (itemRepository.findByNombre(request.nombre()).isPresent()) {
                throw new IllegalArgumentException("Ya existe un artículo con el nombre: " + request.nombre());
            }
        }

        Integer stockEnUso = stockEnUso(item.getId());
        if (request.stockActual() < stockEnUso) {
            throw new IllegalArgumentException("No se puede bajar el stock a " + request.stockActual()
                    + " porque ya hay " + stockEnUso + " unidades asignadas a habitaciones.");
        }

        item.setNombre(request.nombre());
        item.setTipo(request.tipo());
        item.setStockActual(request.stockActual());
        item.setPrecioCompra(request.precioCompra());
        item.setPrecioVenta(request.precioVenta());
        item.setEmoji(request.emoji());

        item = itemRepository.save(item);
        return toItemResponse(item);
    }

    @Transactional
    public void eliminarItem(Long id) {
        if (itemRepository.findById(id).isEmpty()) {
            throw new IllegalArgumentException("Artículo no encontrado con ID: " + id);
        }
        itemRepository.deleteById(id);
    }

    @Transactional
    public void asignarItemAHabitacion(Long habitacionId, Long itemId, Integer cantidadEsperada) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada: " + habitacionId));
        InventarioItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado: " + itemId));
        if (cantidadEsperada == null || cantidadEsperada < 1) {
            throw new IllegalArgumentException("La cantidad esperada debe ser mayor a cero.");
        }

        Optional<HabitacionInventario> existingOpt = habitacionInventarioRepository.findByHabitacionIdAndItemId(habitacionId, itemId);
        Integer asignadoActual = existingOpt.map(HabitacionInventario::getCantidadEsperada).orElse(0);
        Integer stockEnUsoSinEstaHabitacion = stockEnUso(itemId) - asignadoActual;
        Integer disponible = item.getStockActual() - stockEnUsoSinEstaHabitacion;
        if (cantidadEsperada > disponible) {
            throw new IllegalArgumentException("Stock insuficiente para " + item.getNombre()
                    + ". Disponible: " + Math.max(disponible, 0) + ", solicitado: " + cantidadEsperada + ".");
        }

        if (existingOpt.isPresent()) {
            HabitacionInventario existing = existingOpt.get();
            existing.setCantidadEsperada(cantidadEsperada);
            existing.setCantidadActual(cantidadEsperada);
            existing.setEstadoVerificacion("OK");
            habitacionInventarioRepository.save(existing);
        } else {
            HabitacionInventario habInv = new HabitacionInventario(habitacion, item, cantidadEsperada, cantidadEsperada);
            habitacionInventarioRepository.save(habInv);
        }
    }

    @Transactional
    public void desasignarItemDeHabitacion(Long habitacionId, Long itemId) {
        HabitacionInventario habInv = habitacionInventarioRepository.findByHabitacionIdAndItemId(habitacionId, itemId)
                .orElseThrow(() -> new IllegalArgumentException("El artículo no está asociado a esta habitación."));
        habitacionInventarioRepository.delete(habInv);
    }

    private InventarioItemResponse toItemResponse(InventarioItem item) {
        Integer enUso = stockEnUso(item.getId());
        Integer disponible = Math.max(0, item.getStockActual() - enUso);
        return new InventarioItemResponse(
                item.getId(),
                item.getNombre(),
                item.getTipo(),
                item.getStockActual(),
                enUso,
                disponible,
                item.getPrecioCompra(),
                item.getPrecioVenta(),
                item.getEmoji()
        );
    }

    private Integer stockEnUso(Long itemId) {
        Integer total = habitacionInventarioRepository.sumCantidadEsperadaByItemId(itemId);
        return total != null ? total : 0;
    }

    private HabitacionInventarioResponse toHabitacionInventarioResponse(HabitacionInventario habInv) {
        return new HabitacionInventarioResponse(
                habInv.getId(),
                habInv.getItem().getId(),
                habInv.getItem().getNombre(),
                habInv.getItem().getTipo(),
                habInv.getCantidadEsperada(),
                habInv.getCantidadActual(),
                habInv.getEstadoVerificacion(),
                habInv.getItem().getEmoji()
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
                incidencia.getFechaReporte(),
                incidencia.getRecepcionistaReporta(),
                incidencia.getEstado(),
                incidencia.getCostoReparacion(),
                incidencia.getFechaResolucion(),
                incidencia.getRecepcionistaResuelve()
        );
    }
}
