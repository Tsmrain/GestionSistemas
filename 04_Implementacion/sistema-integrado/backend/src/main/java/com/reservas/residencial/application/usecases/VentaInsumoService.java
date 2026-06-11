package com.reservas.residencial.application.usecases;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.reservas.residencial.application.dto.*;
import com.reservas.residencial.application.ports.out.InventarioItemRepositoryPort;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.domain.models.VentaInsumo;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaConsumoExtraRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaVentaInsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class VentaInsumoService {

    private final JpaVentaInsumoRepository ventaRepository;
    private final JpaConsumoExtraRepository consumoRepository;
    private final InventarioItemRepositoryPort inventarioItemRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public VentaInsumoResponse registrarVenta(CrearVentaInsumoRequest request) {
        List<ItemConsumoResponse> items = construirItems(request.items());
        Double total = items.stream().mapToDouble(ItemConsumoResponse::subtotal).sum();

        VentaInsumo venta = new VentaInsumo(
                request.habitacionId(),
                request.numeroHabitacion(),
                request.cliente(),
                request.ubicacion(),
                escribirItemsJson(items),
                total,
                request.recepcionista()
        );

        venta = ventaRepository.save(venta);
        return toResponse(venta, items);
    }

    @Transactional(readOnly = true)
    public List<HistorialVentaInsumoResponse> listarHistorial() {
        Stream<HistorialVentaInsumoResponse> ventasDirectas = ventaRepository.findAll().stream()
                .map(venta -> new HistorialVentaInsumoResponse(
                        venta.getId(),
                        "VENTA_DIRECTA",
                        null,
                        venta.getHabitacionId(),
                        venta.getNumeroHabitacion(),
                        venta.getCliente(),
                        venta.getUbicacion(),
                        venta.getTotal(),
                        venta.getEstado(),
                        venta.getRecepcionista(),
                        leerItemsJson(venta.getItemsJson()),
                        venta.getFecha()
                ));

        Stream<HistorialVentaInsumoResponse> consumosReserva = consumoRepository.findAll().stream()
                .filter(consumo -> "PAGADO".equals(consumo.getEstado()))
                .map(consumo -> new HistorialVentaInsumoResponse(
                        consumo.getId(),
                        "CONSUMO_RESERVA",
                        consumo.getReserva() != null ? consumo.getReserva().getId() : null,
                        consumo.getReserva() != null && consumo.getReserva().getHabitacion() != null
                                ? consumo.getReserva().getHabitacion().getId()
                                : null,
                        consumo.getReserva() != null && consumo.getReserva().getHabitacion() != null
                                ? consumo.getReserva().getHabitacion().getNumero()
                                : "S/H",
                        consumo.getReserva() != null && consumo.getReserva().getHuesped() != null
                                ? consumo.getReserva().getHuesped().getNombre()
                                : "Huésped",
                        "HABITACION",
                        consumo.getTotal(),
                        consumo.getEstado(),
                        "Recepción",
                        leerItemsJson(consumo.getItemsJson()),
                        consumo.getFechaPago() != null ? consumo.getFechaPago() : consumo.getFechaCreacion()
                ));

        return Stream.concat(ventasDirectas, consumosReserva)
                .sorted(Comparator.comparing(HistorialVentaInsumoResponse::fecha, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(25)
                .toList();
    }

    private List<ItemConsumoResponse> construirItems(List<ItemConsumoRequest> requestItems) {
        return requestItems.stream().map(item -> {
            InventarioItem producto = obtenerProductoVenta(item.productoId());
            if (item.cantidad() > producto.getStockActual()) {
                throw new IllegalStateException("Stock insuficiente para " + producto.getNombre() + ".");
            }
            Double precio = producto.getPrecioVenta() != null ? producto.getPrecioVenta() : 0.0;
            Double subtotal = precio * item.cantidad();
            producto.setStockActual(producto.getStockActual() - item.cantidad());
            inventarioItemRepository.save(producto);
            return new ItemConsumoResponse(
                    String.valueOf(producto.getId()),
                    producto.getNombre(),
                    producto.getEmoji(),
                    item.cantidad(),
                    precio,
                    subtotal
            );
        }).toList();
    }

    private InventarioItem obtenerProductoVenta(String productoId) {
        Long id;
        try {
            id = Long.valueOf(productoId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Producto no encontrado: " + productoId);
        }

        InventarioItem producto = inventarioItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + productoId));

        if (!"VENTA".equals(producto.getTipo())) {
            throw new IllegalArgumentException("El artículo no es vendible: " + producto.getNombre());
        }
        return producto;
    }

    private String escribirItemsJson(List<ItemConsumoResponse> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo registrar el detalle de la venta.", e);
        }
    }

    private List<ItemConsumoResponse> leerItemsJson(String itemsJson) {
        try {
            return objectMapper.readValue(itemsJson, new TypeReference<List<ItemConsumoResponse>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private VentaInsumoResponse toResponse(VentaInsumo venta, List<ItemConsumoResponse> items) {
        return new VentaInsumoResponse(
                venta.getId(),
                venta.getHabitacionId(),
                venta.getNumeroHabitacion(),
                venta.getCliente(),
                venta.getUbicacion(),
                venta.getTotal(),
                venta.getEstado(),
                venta.getRecepcionista(),
                items,
                venta.getFecha()
        );
    }
}
