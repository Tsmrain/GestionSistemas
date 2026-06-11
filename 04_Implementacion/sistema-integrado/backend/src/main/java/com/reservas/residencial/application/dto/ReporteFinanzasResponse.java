package com.reservas.residencial.application.dto;

import java.util.List;
import java.util.Map;

public record ReporteFinanzasResponse(
        Double totalIngresos,
        Double totalEgresos,
        Double saldoNeto,
        Double ingresosAlojamiento,
        Double ingresosConsumosReserva,
        Double ingresosVentasDirectas,
        List<EgresoResponse> egresosRecientes,
        Map<String, Double> ingresosPorMetodo,
        Map<String, Double> egresosPorCategoria
) {}
