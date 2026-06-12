package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.EgresoRequest;
import com.reservas.residencial.application.dto.EgresoResponse;
import com.reservas.residencial.application.dto.ReporteFinanzasResponse;
import com.reservas.residencial.application.ports.out.EgresoRepositoryPort;
import com.reservas.residencial.domain.models.ConsumoExtra;
import com.reservas.residencial.domain.models.Egreso;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaPagoRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaConsumoExtraRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaVentaInsumoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanzasServiceTest {

    @Mock
    private EgresoRepositoryPort egresoRepository;

    @Mock
    private JpaPagoRepository jpaPagoRepository;

    @Mock
    private JpaConsumoExtraRepository jpaConsumoExtraRepository;

    @Mock
    private JpaVentaInsumoRepository jpaVentaInsumoRepository;

    @InjectMocks
    private FinanzasService finanzasService;

    private Egreso egreso;

    @BeforeEach
    void setUp() {
        egreso = new Egreso("Lavado de sabanas", 60.0, "LAVANDERIA", "Admin", null);
        egreso.setId(1L);
    }

    @Test
    void registrarEgreso_Exitoso() {
        EgresoRequest request = new EgresoRequest("Lavado de sabanas", 60.0, "LAVANDERIA", "Admin", null);
        when(egresoRepository.save(any(Egreso.class))).thenReturn(egreso);

        EgresoResponse result = finanzasService.registrarEgreso(request);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.descripcion()).isEqualTo("Lavado de sabanas");
        assertThat(result.monto()).isEqualTo(60.0);
        assertThat(result.categoria()).isEqualTo("LAVANDERIA");
        assertThat(result.recepcionista()).isEqualTo("Admin");
        verify(egresoRepository).save(any(Egreso.class));
    }

    @Test
    void obtenerReporteFinanzas_CalculaCorrectamente() {
        LocalDate start = LocalDate.now().minusDays(1);
        LocalDate end = LocalDate.now();

        Reserva r = new Reserva();
        r.setId(1L);
        r.confirmarPago();

        Pago pago = new Pago(r, 150.0, "EFECTIVO", "COMPLETADO");
        pago.setFechaCreacion(LocalDateTime.now());

        ConsumoExtra consumo = new ConsumoExtra(r, "[]", 40.0, null);
        consumo.confirmarPago(); // Puts it to PAGADO and sets fechaPago to now

        Egreso egresoGasto = new Egreso("Reparacion TV", 100.0, "REPARACION_MANTENIMIENTO", "Admin", null);
        egresoGasto.setFecha(LocalDateTime.now());

        when(jpaPagoRepository.findAll()).thenReturn(List.of(pago));
        when(jpaConsumoExtraRepository.findAll()).thenReturn(List.of(consumo));
        when(jpaVentaInsumoRepository.findAll()).thenReturn(Collections.emptyList());
        when(egresoRepository.findAll()).thenReturn(List.of(egresoGasto));

        ReporteFinanzasResponse report = finanzasService.obtenerReporteFinanzas(start, end);

        assertThat(report.totalIngresos()).isEqualTo(190.0);
        assertThat(report.totalEgresos()).isEqualTo(100.0);
        assertThat(report.saldoNeto()).isEqualTo(90.0);
        assertThat(report.ingresosPorMetodo().get("EFECTIVO")).isEqualTo(190.0);
        assertThat(report.egresosPorCategoria().get("REPARACION_MANTENIMIENTO")).isEqualTo(100.0);
        assertThat(report.egresosRecientes()).hasSize(1);
    }
}
