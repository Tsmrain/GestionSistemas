package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.IniciarPagoRequest;
import com.reservas.residencial.application.dto.PagoStatusResponse;
import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Reserva;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcesarPagoServiceTest {

    @Mock
    private ReservaRepositoryPort reservaRepository;

    @Mock
    private PagoRepositoryPort pagoRepository;

    @Mock
    private BnbPaymentPort bnbPort;

    @InjectMocks
    private ProcesarPagoService procesarPagoService;

    @Test
    @DisplayName("CU-03 Flujo Básico: Generar Pago QR con éxito")
    void testFlujoBasico_GenerarPagoQR_Exito() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = new Reserva();
        reserva.setId(reservaId);
        reserva.setMontoTotal(100.0);
        reserva.setEstado("PENDIENTE");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(bnbPort.generarQR(100.0, "Pago reserva 1", reservaId)).thenReturn("base64_simulado");

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When
        PagoStatusResponse response = procesarPagoService.iniciarProcesoPago(request);

        // Then
        assertNotNull(response);
        assertEquals("PENDIENTE", response.estado());
        assertEquals("base64_simulado", response.qrData());
        verify(pagoRepository, times(1)).save(any(Pago.class));
        verify(bnbPort, times(1)).generarQR(anyDouble(), anyString(), anyLong());
    }

    @Test
    @DisplayName("CU-03 Flujo Básico: Verificar Pago QR mediante Polling exitoso")
    void testFlujoBasico_VerificarPagoQR_PollingExitoso() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = new Reserva();
        reserva.setId(reservaId);
        reserva.setEstado("PENDIENTE");

        Pago pagoPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoPendiente.setExternalId("qr_id_123");

        when(pagoRepository.findByReservaId(reservaId)).thenReturn(Optional.of(pagoPendiente));
        when(bnbPort.consultarEstado("qr_id_123")).thenReturn("COMPLETADO");

        // When
        PagoStatusResponse response = procesarPagoService.verificarEstadoPago(reservaId);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("PAGADA", reserva.getEstado()); // Verifica el método confirmarPago() indirectamente
        verify(pagoRepository, times(1)).save(pagoPendiente);
        verify(reservaRepository, times(1)).save(reserva);
    }

    @Test
    @DisplayName("CU-03 Camino Alternativo 3a: Pago en Efectivo con éxito")
    void testCaminoAlternativo3a_PagoEfectivo_Exito() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = new Reserva();
        reserva.setId(reservaId);
        reserva.setMontoTotal(100.0);
        reserva.setEstado("PENDIENTE");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "EFECTIVO");

        // When
        PagoStatusResponse response = procesarPagoService.iniciarProcesoPago(request);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("PAGADA", reserva.getEstado());
        verify(pagoRepository, times(1)).save(any(Pago.class));
        verify(reservaRepository, times(1)).save(reserva);
        verifyNoInteractions(bnbPort);
    }

    @Test
    @DisplayName("CU-03 Camino Alternativo 4a: Fallo en API BNB al generar QR")
    void testCaminoAlternativo4a_GenerarQR_ErrorComunicacionBnb() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = new Reserva();
        reserva.setId(reservaId);
        reserva.setMontoTotal(100.0);

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(bnbPort.generarQR(anyDouble(), anyString(), anyLong()))
                .thenThrow(new RuntimeException("BNB API Down"));

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            procesarPagoService.iniciarProcesoPago(request);
        });
    }
}
