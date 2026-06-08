package com.reservas.residencial.application.usecases;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.residencial.application.dto.ConsumoExtraResponse;
import com.reservas.residencial.application.dto.CrearConsumoExtraRequest;
import com.reservas.residencial.application.dto.ItemConsumoRequest;
import com.reservas.residencial.application.dto.ItemConsumoResponse;
import com.reservas.residencial.application.dto.ProductoConsumoResponse;
import com.reservas.residencial.application.ports.out.ConsumoExtraRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsumoExtraService {

    private final ReservaRepositoryPort reservaRepository;
    private final ConsumoExtraRepositoryPort consumoExtraRepository;
    private final ObjectMapper objectMapper;

    public List<ProductoConsumoResponse> listarProductos() {
        return cargarProductos();
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
        Map<String, ProductoConsumoResponse> productos = cargarProductos().stream()
                .collect(Collectors.toMap(ProductoConsumoResponse::id, Function.identity()));

        return requestItems.stream().map(item -> {
            ProductoConsumoResponse producto = productos.get(item.productoId());
            if (producto == null) {
                throw new IllegalArgumentException("Producto no encontrado: " + item.productoId());
            }
            if (item.cantidad() > producto.stock()) {
                throw new IllegalStateException("Stock insuficiente para " + producto.nombre() + ".");
            }
            Double subtotal = producto.precio() * item.cantidad();
            return new ItemConsumoResponse(
                    producto.id(),
                    producto.nombre(),
                    producto.emoji(),
                    item.cantidad(),
                    producto.precio(),
                    subtotal
            );
        }).toList();
    }

    private List<ProductoConsumoResponse> cargarProductos() {
        try (InputStream input = new ClassPathResource("consumos-productos.json").getInputStream()) {
            return objectMapper.readValue(input, new TypeReference<List<ProductoConsumoResponse>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo cargar el catalogo de consumos.", e);
        }
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
