package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.IniciarPagoRequest;
import com.reservas.residencial.application.dto.PagoStatusResponse;
import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import com.reservas.residencial.application.ports.out.ComprobanteRepositoryPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Comprobante;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Reserva;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias del CU-03 Procesar Pago.
 * Baja Brecha de Representación: cada método de prueba lleva el nombre
 * del paso o camino alternativo al que corresponde en el caso de uso.
 */
@ExtendWith(MockitoExtension.class)
class ProcesarPagoServiceTest {

    @Mock private ReservaRepositoryPort reservaRepository;
    @Mock private PagoRepositoryPort pagoRepository;
    @Mock private ComprobanteRepositoryPort comprobanteRepository;
    @Mock private BnbPaymentPort bnbPort;

    @InjectMocks
    private ProcesarPagoService procesarPagoService;

    // ─────────────────────────────────────────────────────────
    // Pasos 4-5 CU-03: Flujo básico — generar QR
    // ─────────────────────────────────────────────────────────
    @Test
    @DisplayName("Paso 4-5 CU-03 | Flujo básico: BNB retorna QR → estado PENDIENTE")
    void flujoBasico_GenerarPagoQR_Exito() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findPendingByReservaId(reservaId)).thenReturn(Optional.empty());
        when(bnbPort.generarQR(100.0, "Pago reserva 1", reservaId)).thenReturn("base64_simulado");

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When
        PagoStatusResponse response = procesarPagoService.iniciarProcesoPago(request);

        // Then
        assertNotNull(response);
        assertEquals("PENDIENTE", response.estado());
        assertEquals("base64_simulado", response.qrData());
        assertNull(response.comprobanteId());
        assertNull(response.ventanaCheckIn());
        verify(pagoRepository).save(any(Pago.class));
        verify(bnbPort).generarQR(anyDouble(), anyString(), anyLong());
        verifyNoInteractions(comprobanteRepository);
    }

    @Test
    @DisplayName("Paso 4-5 CU-03 | QR pendiente vigente: reutiliza el pago existente y no duplica")
    void flujoBasico_GenerarPagoQR_ReutilizaPagoPendiente() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago pagoPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoPendiente.setExternalId("qr_vigente");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findPendingByReservaId(reservaId)).thenReturn(Optional.of(pagoPendiente));

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When
        PagoStatusResponse response = procesarPagoService.iniciarProcesoPago(request);

        // Then
        assertEquals("PENDIENTE", response.estado());
        assertEquals("qr_vigente", response.qrData());
        verify(pagoRepository, never()).save(any(Pago.class));
        verifyNoInteractions(bnbPort);
        verifyNoInteractions(comprobanteRepository);
    }

    // ─────────────────────────────────────────────────────────
    // Paso 7 CU-03: Polling — BNB confirma COMPLETADO
    // ─────────────────────────────────────────────────────────
    @Test
    @DisplayName("Paso 7 CU-03 | Polling exitoso: BNB retorna COMPLETADO → se emite comprobante")
    void flujoBasico_PollingQR_PagoCompletado() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago pagoPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoPendiente.setExternalId("qr_id_123");
        pagoPendiente.setFechaCreacion(LocalDateTime.now().minusSeconds(13));

        Comprobante comprobante = new Comprobante(pagoPendiente);
        comprobante.setId(10L);
        comprobante.setNroComprobante("COMP-ABCD1234");

        when(pagoRepository.findLatestByReservaId(reservaId)).thenReturn(Optional.of(pagoPendiente));
        when(bnbPort.consultarEstado("qr_id_123")).thenReturn("COMPLETADO");
        when(comprobanteRepository.save(any(Comprobante.class))).thenReturn(comprobante);

        // When
        PagoStatusResponse response = procesarPagoService.verificarEstadoPago(reservaId);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("PAGADA", reserva.getEstado());
        assertNotNull(reserva.getFechaPago());
        assertNotNull(reserva.getVentanaCheckIn());
        verify(pagoRepository).save(pagoPendiente);
        verify(reservaRepository).save(reserva);
        verify(comprobanteRepository).save(any(Comprobante.class));
    }

    @Test
    @DisplayName("Paso 7 CU-03 | Polling pendiente: BNB retorna PENDIENTE y no emite comprobante")
    void flujoBasico_PollingQR_RecienteSiguePendiente() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago pagoPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoPendiente.setExternalId("qr_id_123");

        when(pagoRepository.findLatestByReservaId(reservaId)).thenReturn(Optional.of(pagoPendiente));
        when(bnbPort.consultarEstado("qr_id_123")).thenReturn("PENDIENTE");

        // When
        PagoStatusResponse response = procesarPagoService.verificarEstadoPago(reservaId);

        // Then
        assertEquals("PENDIENTE", response.estado());
        assertEquals("qr_id_123", response.qrData());
        assertEquals("PENDIENTE_PAGO", reserva.getEstado());
        verify(bnbPort).consultarEstado("qr_id_123");
        verifyNoInteractions(comprobanteRepository);
    }

    @Test
    @DisplayName("CU-03 Demo | Confirmacion QR simulada: emite comprobante al solicitarlo")
    void demo_ConfirmacionQRSimulada_EmiteComprobante() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago pagoPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoPendiente.setExternalId("qr_id_123");

        Comprobante comprobante = new Comprobante(pagoPendiente);
        comprobante.setId(10L);
        comprobante.setNroComprobante("COMP-ABCD1234");

        when(pagoRepository.findLatestByReservaId(reservaId)).thenReturn(Optional.of(pagoPendiente));
        when(comprobanteRepository.save(any(Comprobante.class))).thenReturn(comprobante);

        // When
        PagoStatusResponse response = procesarPagoService.confirmarPagoQRSimulado(reservaId);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("PAGADA", reserva.getEstado());
        assertEquals("COMP-ABCD1234", response.nroComprobante());
        verify(pagoRepository).save(pagoPendiente);
        verify(reservaRepository).save(reserva);
        verifyNoInteractions(bnbPort);
    }

    // ─────────────────────────────────────────────────────────
    // Camino 3a CU-03: Pago en efectivo
    // ─────────────────────────────────────────────────────────
    @Test
    @DisplayName("Camino 3a CU-03 | Pago efectivo: Recepcionista confirma → reserva PAGADA inmediatamente")
    void caminoAlternativo3a_PagoEfectivo_Exito() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Comprobante comprobante = new Comprobante(new Pago());
        comprobante.setId(5L);
        comprobante.setNroComprobante("COMP-EF123456");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findPendingByReservaId(reservaId)).thenReturn(Optional.empty());
        when(comprobanteRepository.save(any(Comprobante.class))).thenReturn(comprobante);

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "EFECTIVO");

        // When
        PagoStatusResponse response = procesarPagoService.iniciarProcesoPago(request);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("PAGADA", reserva.getEstado());
        assertNotNull(reserva.getFechaPago());
        assertNotNull(reserva.getVentanaCheckIn());
        assertNull(response.qrData());
        verify(pagoRepository).save(any(Pago.class));
        verify(reservaRepository).save(reserva);
        verifyNoInteractions(bnbPort);
    }

    @Test
    @DisplayName("Camino 3a CU-03 | Pago efectivo con QR pendiente: cancela el QR anterior y no deja pago ambiguo")
    void caminoAlternativo3a_PagoEfectivo_CancelaQrPendiente() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago qrPendiente = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        qrPendiente.setExternalId("qr_pendiente");
        Comprobante comprobante = new Comprobante(new Pago());
        comprobante.setId(5L);
        comprobante.setNroComprobante("COMP-EF123456");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findPendingByReservaId(reservaId)).thenReturn(Optional.of(qrPendiente));
        when(comprobanteRepository.save(any(Comprobante.class))).thenReturn(comprobante);

        // When
        PagoStatusResponse response = procesarPagoService.procesarPagoEfectivo(reservaId);

        // Then
        assertEquals("COMPLETADO", response.estado());
        assertEquals("FALLIDO", qrPendiente.getEstado());
        verify(pagoRepository).save(qrPendiente);
        verify(pagoRepository).save(argThat(pago -> "EFECTIVO".equals(pago.getMetodo())
                && "COMPLETADO".equals(pago.getEstado())));
        verify(reservaRepository).save(reserva);
    }

    @Test
    @DisplayName("CU-03 | Reserva ya PAGADA: no permite crear otro pago")
    void reservaPagada_NoPermiteOtroPago() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        reserva.setEstado("PAGADA");

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When & Then
        assertThrows(IllegalStateException.class, () -> procesarPagoService.iniciarProcesoPago(request));
        verifyNoInteractions(pagoRepository);
        verifyNoInteractions(bnbPort);
        verifyNoInteractions(comprobanteRepository);
    }

    // ─────────────────────────────────────────────────────────
    // Camino 4a CU-03: Error de comunicación BNB
    // ─────────────────────────────────────────────────────────
    @Test
    @DisplayName("Camino 4a CU-03 | BNB no responde → el servicio propaga la excepción")
    void caminoAlternativo4a_GenerarQR_ErrorComunicacionBnb() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findPendingByReservaId(reservaId)).thenReturn(Optional.empty());
        when(bnbPort.generarQR(anyDouble(), anyString(), anyLong()))
                .thenThrow(new RuntimeException("BNB API Down"));

        IniciarPagoRequest request = new IniciarPagoRequest(reservaId, "QR_BNB");

        // When & Then
        assertThrows(RuntimeException.class, () -> procesarPagoService.iniciarProcesoPago(request));
        verifyNoInteractions(comprobanteRepository);
        verify(pagoRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────
    // Camino 7a CU-03: QR expirado
    // ─────────────────────────────────────────────────────────
    @Test
    @DisplayName("Camino 7a CU-03 | QR expirado → estado QR_EXPIRADO, no se confirma la reserva")
    void caminoAlternativo7a_QrExpirado_EstadoFallido() {
        // Given
        Long reservaId = 1L;
        Reserva reserva = reservaConId(reservaId, 100.0);
        Pago pagoExpirado = new Pago(reserva, 100.0, "QR_BNB", "PENDIENTE");
        pagoExpirado.setExternalId("qr_viejo");
        // Forzar expiración a hace 1 segundo
        pagoExpirado.setFechaExpiracion(java.time.LocalDateTime.now().minusSeconds(1));

        when(pagoRepository.findLatestByReservaId(reservaId)).thenReturn(Optional.of(pagoExpirado));

        // When
        PagoStatusResponse response = procesarPagoService.verificarEstadoPago(reservaId);

        // Then
        assertEquals("QR_EXPIRADO", response.estado());
        assertEquals("PENDIENTE_PAGO", reserva.getEstado()); // Reserva NO debe cambiar
        verify(pagoRepository).save(pagoExpirado);
        assertEquals("FALLIDO", pagoExpirado.getEstado());
        verifyNoInteractions(bnbPort);
        verifyNoInteractions(comprobanteRepository);
    }

    // ─── Utilidad ─────────────────────────────────────────────
    private Reserva reservaConId(Long id, Double monto) {
        Reserva r = new Reserva();
        r.setId(id);
        r.setMontoTotal(monto);
        r.setEstado("PENDIENTE_PAGO");
        return r;
    }
}
