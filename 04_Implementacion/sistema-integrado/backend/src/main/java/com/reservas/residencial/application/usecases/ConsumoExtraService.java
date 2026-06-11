package com.reservas.residencial.application.usecases;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.residencial.application.dto.ConsumoExtraResponse;
import com.reservas.residencial.application.dto.CrearConsumoExtraRequest;
import com.reservas.residencial.application.dto.ItemConsumoRequest;
import com.reservas.residencial.application.dto.ItemConsumoResponse;
import com.reservas.residencial.application.dto.ProductoConsumoResponse;
import com.reservas.residencial.application.ports.out.ConsumoExtraRepositoryPort;
import com.reservas.residencial.application.ports.out.InventarioItemRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
@RequiredArgsConstructor
public class ConsumoExtraService {

    private final ReservaRepositoryPort reservaRepository;
    private final ConsumoExtraRepositoryPort consumoExtraRepository;
    private final InventarioItemRepositoryPort inventarioItemRepository;
    private final ObjectMapper objectMapper;

    public List<ProductoConsumoResponse> listarProductos() {
        return inventarioItemRepository.findAll().stream()
                .filter(item -> "VENTA".equals(item.getTipo()))
                .map(this::toProductoResponse)
                .toList();
    }

    public List<ConsumoExtraResponse> listarPorReserva(Long reservaId) {
        return consumoExtraRepository.findByReservaId(reservaId).stream()
                .map(consumo -> toResponse(consumo, leerItemsJson(consumo.getItemsJson())))
                .toList();
    }

    @Transactional
    public ConsumoExtraResponse iniciarPagoConsumo(CrearConsumoExtraRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + request.reservaId()));

        if (!"ACTIVA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva debe estar ACTIVA para pedir consumos. Estado actual: " + reserva.getEstado());
        }

        List<ItemConsumoResponse> items = construirItems(request.items());
        Double total = items.stream().mapToDouble(ItemConsumoResponse::subtotal).sum();
        String qrData = generarQrConsumo(total, reserva.getId());

        ConsumoExtra consumo = new ConsumoExtra(reserva, escribirItemsJson(items), total, qrData);
        consumo = consumoExtraRepository.save(consumo);
        return toResponse(consumo, items);
    }

    @Transactional
    public ConsumoExtraResponse confirmarPagoConsumo(Long consumoId) {
        ConsumoExtra consumo = consumoExtraRepository.findById(consumoId)
                .orElseThrow(() -> new IllegalArgumentException("Consumo no encontrado: " + consumoId));

        if (!"PAGADO".equals(consumo.getEstado())) {
            consumo.confirmarPago();
            consumo = consumoExtraRepository.save(consumo);
        }

        return toResponse(consumo, leerItemsJson(consumo.getItemsJson()));
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

    private ProductoConsumoResponse toProductoResponse(InventarioItem item) {
        return new ProductoConsumoResponse(
                String.valueOf(item.getId()),
                item.getNombre(),
                item.getEmoji(),
                item.getPrecioVenta() != null ? item.getPrecioVenta() : 0.0,
                item.getStockActual(),
                item.getPrecioCompra() != null ? item.getPrecioCompra() : 0.0
        );
    }

    private String escribirItemsJson(List<ItemConsumoResponse> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo registrar el detalle del consumo.", e);
        }
    }

    private List<ItemConsumoResponse> leerItemsJson(String itemsJson) {
        try {
            return objectMapper.readValue(itemsJson, new TypeReference<List<ItemConsumoResponse>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo leer el detalle del consumo.", e);
        }
    }

    private String generarQrConsumo(Double total, Long reservaId) {
        String payload = "CONSUMO|" + reservaId + "|BS " + total;
        return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=" +
                URLEncoder.encode(payload, StandardCharsets.UTF_8);
    }

    private ConsumoExtraResponse toResponse(ConsumoExtra consumo, List<ItemConsumoResponse> items) {
        return new ConsumoExtraResponse(
                consumo.getId(),
                consumo.getReserva().getId(),
                consumo.getEstado(),
                consumo.getTotal(),
                consumo.getQrData(),
                items,
                consumo.getFechaCreacion()
        );
    }
}
