package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.EgresoRequest;
import com.reservas.residencial.application.dto.EgresoResponse;
import com.reservas.residencial.application.dto.ReporteFinanzasResponse;
import com.reservas.residencial.application.ports.out.EgresoRepositoryPort;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.domain.models.Egreso;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.domain.models.VentaInsumo;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaPagoRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaConsumoExtraRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaVentaInsumoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanzasService {

    private final EgresoRepositoryPort egresoRepository;
    private final JpaPagoRepository jpaPagoRepository;
    private final JpaConsumoExtraRepository jpaConsumoExtraRepository;
    private final JpaVentaInsumoRepository jpaVentaInsumoRepository;
    private final FileStoragePort fileStoragePort;

    @Transactional
    public EgresoResponse registrarEgreso(EgresoRequest request) {
        return registrarEgreso(request, null);
    }

    @Transactional
    public EgresoResponse registrarEgreso(EgresoRequest request, MultipartFile comprobante) {
        String urlComprobante = request.urlComprobante();
        if (comprobante != null && !comprobante.isEmpty()) {
            urlComprobante = fileStoragePort.guardar(comprobante);
        }

        Egreso egreso = new Egreso(
                request.descripcion(),
                request.monto(),
                request.categoria(),
                request.recepcionista(),
                request.destinoDestinatario(),
                urlComprobante
        );
        egreso = egresoRepository.save(egreso);
        return toResponse(egreso);
    }

    @Transactional(readOnly = true)
    public ReporteFinanzasResponse obtenerReporteFinanzas(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime start = (fechaInicio != null) ? fechaInicio.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = (fechaFin != null) ? fechaFin.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);

        // 1. Obtener pagos de reservas completados en el rango
        List<Pago> pagos = jpaPagoRepository.findAll().stream()
                .filter(p -> "COMPLETADO".equals(p.getEstado()))
                .filter(p -> p.getReserva() != null && p.getReserva().getFechaPago() != null)
                .filter(p -> !p.getReserva().getFechaPago().isBefore(start) && !p.getReserva().getFechaPago().isAfter(end))
                .toList();

        // 2. Obtener consumos extras pagados en el rango
        List<ConsumoExtra> consumos = jpaConsumoExtraRepository.findAll().stream()
                .filter(c -> "PAGADO".equals(c.getEstado()))
                .filter(c -> c.getFechaPago() != null && !c.getFechaPago().isBefore(start) && !c.getFechaPago().isAfter(end))
                .toList();

        List<VentaInsumo> ventasInsumos = jpaVentaInsumoRepository.findAll().stream()
                .filter(v -> "PAGADO".equals(v.getEstado()))
                .filter(v -> v.getFecha() != null && !v.getFecha().isBefore(start) && !v.getFecha().isAfter(end))
                .toList();

        // 3. Obtener egresos en el rango
        List<Egreso> egresos = egresoRepository.findAll().stream()
                .filter(e -> e.getFecha() != null && !e.getFecha().isBefore(start) && !e.getFecha().isAfter(end))
                .toList();

        // Calcular totales
        Double totalIngresosReservas = pagos.stream().mapToDouble(Pago::getMonto).sum();
        Double totalIngresosConsumos = consumos.stream().mapToDouble(ConsumoExtra::getTotal).sum();
        Double totalIngresosVentasInsumos = ventasInsumos.stream().mapToDouble(VentaInsumo::getTotal).sum();
        Double totalIngresos = totalIngresosReservas + totalIngresosConsumos + totalIngresosVentasInsumos;

        Double totalEgresos = egresos.stream().mapToDouble(Egreso::getMonto).sum();
        Double saldoNeto = totalIngresos - totalEgresos;

        // Agrupar ingresos por método
        Map<String, Double> ingresosPorMetodo = new HashMap<>();
        for (Pago p : pagos) {
            String metodo = p.getMetodo() != null ? p.getMetodo() : "EFECTIVO";
            ingresosPorMetodo.put(metodo, ingresosPorMetodo.getOrDefault(metodo, 0.0) + p.getMonto());
        }
        for (ConsumoExtra c : consumos) {
            String metodo = c.getQrData() != null ? "QR_BNB" : "EFECTIVO";
            ingresosPorMetodo.put(metodo, ingresosPorMetodo.getOrDefault(metodo, 0.0) + c.getTotal());
        }
        for (VentaInsumo venta : ventasInsumos) {
            ingresosPorMetodo.put("EFECTIVO", ingresosPorMetodo.getOrDefault("EFECTIVO", 0.0) + venta.getTotal());
        }

        // Agrupar egresos por categoría
        Map<String, Double> egresosPorCategoria = egresos.stream()
                .collect(Collectors.groupingBy(Egreso::getCategoria, Collectors.summingDouble(Egreso::getMonto)));

        // Egresos recientes
        List<EgresoResponse> egresosRecientes = egresos.stream()
                .sorted((e1, e2) -> e2.getFecha().compareTo(e1.getFecha()))
                .limit(10)
                .map(this::toResponse)
                .toList();

        return new ReporteFinanzasResponse(
                totalIngresos,
                totalEgresos,
                saldoNeto,
                totalIngresosReservas,
                totalIngresosConsumos,
                totalIngresosVentasInsumos,
                egresosRecientes,
                ingresosPorMetodo,
                egresosPorCategoria
        );
    }

    private EgresoResponse toResponse(Egreso egreso) {
        return new EgresoResponse(
                egreso.getId(),
                egreso.getDescripcion(),
                egreso.getMonto(),
                egreso.getCategoria(),
                egreso.getFecha(),
                egreso.getRecepcionista(),
                egreso.getDestinoDestinatario(),
                egreso.getUrlComprobante()
        );
    }
}
