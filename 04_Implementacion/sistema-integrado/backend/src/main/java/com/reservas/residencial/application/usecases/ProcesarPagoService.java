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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * @referencia: 03_Diseño/CU-03-Procesar-Pago/CU-03_Clases_Diseño.mmd
 * @referencia: 03_Diseño/CU-03-Procesar-Pago/CU-03_Secuencia.mmd
 *
 * Controlador de Dominio (Larman): orquesta el caso de uso CU-03.
 * Aplica Baja Brecha de Representación: cada método corresponde a
 * un paso o camino alternativo del curso básico del caso de uso.
 */
@Service
@RequiredArgsConstructor
public class ProcesarPagoService {

    private static final String ESTADO_RESERVA_PAGADA = "PAGADA";
    private static final String ESTADO_PAGO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_PAGO_COMPLETADO = "COMPLETADO";
    private static final String ESTADO_PAGO_FALLIDO = "FALLIDO";
    private static final String METODO_QR_BNB = "QR_BNB";
    private static final String METODO_EFECTIVO = "EFECTIVO";

    private final ReservaRepositoryPort reservaRepository;
    private final PagoRepositoryPort pagoRepository;
    private final ComprobanteRepositoryPort comprobanteRepository;
    private final BnbPaymentPort bnbPort;

    /**
     * Paso 1–5 (CU-03 Flujo básico y Camino 3a):
     * Recupera la reserva, selecciona el método y delega al flujo correspondiente.
     */
    @Transactional
    public PagoStatusResponse iniciarProcesoPago(IniciarPagoRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + request.reservaId()));

        validarReservaPendientePago(reserva);

        return switch (request.metodo()) {
            case METODO_QR_BNB  -> iniciarPagoQR(reserva);
            case METODO_EFECTIVO -> procesarPagoEfectivo(reserva);
            default -> throw new IllegalArgumentException("Método de pago no soportado: " + request.metodo());
        };
    }

    /**
     * Pasos 4–5 (Flujo básico): invoca BNB, crea el Pago en PENDIENTE.
     * Camino 4a: si BNB lanza excepción, se propaga para que el Controller informe al frontend.
     */
    private PagoStatusResponse iniciarPagoQR(Reserva reserva) {
        var pagoPendiente = pagoRepository.findPendingByReservaId(reserva.getId());
        if (pagoPendiente.isPresent()) {
            Pago pago = pagoPendiente.get();
            if (!pago.estaExpirado() && tieneQrValido(pago)) {
                return toResponse(reserva, ESTADO_PAGO_PENDIENTE, obtenerQrData(pago), null);
            }

            refrescarPagoQr(pago, reserva);
            pagoRepository.save(pago);
            return toResponse(reserva, ESTADO_PAGO_PENDIENTE, pago.getQrData(), null);
        }

        String qrData = generarQrReserva(reserva);

        Pago pago = new Pago(reserva, reserva.getMontoTotal(), METODO_QR_BNB, ESTADO_PAGO_PENDIENTE);
        pago.setExternalId(generarExternalId(reserva));
        pago.setQrData(qrData);
        pagoRepository.save(pago);

        return new PagoStatusResponse(reserva.getId(), ESTADO_PAGO_PENDIENTE, qrData, null, null, null);
    }

    /**
     * Paso 7 (Flujo básico): polling de verificación del estado de la transacción BNB.
     * Camino 7a: si el QR está expirado, marca el pago como FALLIDO.
     */
    @Transactional
    public PagoStatusResponse verificarEstadoPago(Long reservaId) {
        Pago pago = pagoRepository.findLatestByReservaId(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("No existe pago iniciado para la reserva: " + reservaId));

        if (!ESTADO_PAGO_PENDIENTE.equals(pago.getEstado())) {
            return toResponseConComprobanteExistente(pago);
        }

        // Camino 7a: QR expirado (5 minutos)
        if (pago.estaExpirado()) {
            cancelarPagoQrExpirado(pago);
            return toResponse(pago.getReserva(), "QR_EXPIRADO", null, null);
        }

        String estadoBnb = bnbPort.consultarEstado(pago.getExternalId());

        if (ESTADO_PAGO_COMPLETADO.equals(estadoBnb)) {
            return completarPagoQR(pago);
        }

        // Pago aún PENDIENTE
        return toResponse(pago.getReserva(), ESTADO_PAGO_PENDIENTE, obtenerQrData(pago), null);
    }

    /**
     * Endpoint de apoyo para la demo: simula que el banco notificó el pago del QR.
     */
    @Transactional
    public PagoStatusResponse confirmarPagoQRSimulado(Long reservaId) {
        Pago pago = pagoRepository.findLatestByReservaId(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("No existe pago iniciado para la reserva: " + reservaId));

        if (!ESTADO_PAGO_PENDIENTE.equals(pago.getEstado())) {
            return toResponseConComprobanteExistente(pago);
        }

        if (pago.estaExpirado()) {
            cancelarPagoQrExpirado(pago);
            return toResponse(pago.getReserva(), "QR_EXPIRADO", null, null);
        }

        return completarPagoQR(pago);
    }

    /**
     * Camino 3a (Pago en efectivo):
     * El Recepcionista confirma el pago físico. No requiere BNB.
     * Paso 8: actualiza estado, registra hora de pago y emite comprobante.
     */
    @Transactional
    public PagoStatusResponse procesarPagoEfectivo(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + reservaId));
        validarReservaPendientePago(reserva);
        return procesarPagoEfectivo(reserva);
    }

    private PagoStatusResponse procesarPagoEfectivo(Reserva reserva) {
        pagoRepository.findPendingByReservaId(reserva.getId()).ifPresent(pagoPendiente -> {
            pagoPendiente.setEstado(ESTADO_PAGO_FALLIDO);
            pagoRepository.save(pagoPendiente);
        });

        Pago pago = new Pago(reserva, reserva.getMontoTotal(), METODO_EFECTIVO, ESTADO_PAGO_COMPLETADO);
        pagoRepository.save(pago);

        reserva.confirmarPago();               // Experto en Información
        reservaRepository.save(reserva);

        Comprobante comprobante = new Comprobante(pago);
        comprobante = comprobanteRepository.save(comprobante);

        return toResponse(reserva, ESTADO_PAGO_COMPLETADO, null, comprobante);
    }

    private void validarReservaPendientePago(Reserva reserva) {
        if (ESTADO_RESERVA_PAGADA.equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva ya fue pagada: " + reserva.getId());
        }
    }

    private PagoStatusResponse completarPagoQR(Pago pago) {
        pago.setEstado(ESTADO_PAGO_COMPLETADO);
        pagoRepository.save(pago);

        Reserva reserva = pago.getReserva();
        reserva.confirmarPago();               // Experto en Información
        reservaRepository.save(reserva);

        Comprobante comprobante = new Comprobante(pago);
        comprobante = comprobanteRepository.save(comprobante);

        return toResponse(reserva, ESTADO_PAGO_COMPLETADO, null, comprobante);
    }

    private void cancelarPagoQrExpirado(Pago pago) {
        pago.setEstado(ESTADO_PAGO_FALLIDO);
        pagoRepository.save(pago);

        Reserva reserva = pago.getReserva();
        reserva.cancelar();
        reservaRepository.save(reserva);
    }

    private PagoStatusResponse toResponseConComprobanteExistente(Pago pago) {
        Comprobante comprobante = null;
        if (ESTADO_PAGO_COMPLETADO.equals(pago.getEstado()) && pago.getId() != null) {
            comprobante = comprobanteRepository.findByPagoId(pago.getId()).orElse(null);
        }
        return toResponse(pago.getReserva(), pago.getEstado(), null, comprobante);
    }

    private String obtenerQrData(Pago pago) {
        return pago.getQrData() != null ? pago.getQrData() : pago.getExternalId();
    }

    private boolean tieneQrValido(Pago pago) {
        String qrData = pago.getQrData();
        return qrData != null && qrData.length() > 100 && qrData.startsWith("iVBOR");
    }

    private String generarQrReserva(Reserva reserva) {
        return bnbPort.generarQR(
                reserva.getMontoTotal(),
                "Pago reserva " + reserva.getId(),
                reserva.getId()
        );
    }

    private String generarExternalId(Reserva reserva) {
        return "BNB-" + reserva.getId() + "-" + System.currentTimeMillis();
    }

    private void refrescarPagoQr(Pago pago, Reserva reserva) {
        LocalDateTime ahora = LocalDateTime.now();
        pago.setEstado(ESTADO_PAGO_PENDIENTE);
        pago.setExternalId(generarExternalId(reserva));
        pago.setQrData(generarQrReserva(reserva));
        pago.setFechaCreacion(ahora);
        pago.setFechaExpiracion(ahora.plusMinutes(5));
    }

    private PagoStatusResponse toResponse(Reserva reserva, String estado, String qrData, Comprobante comprobante) {
        return new PagoStatusResponse(
                reserva.getId(),
                estado,
                qrData,
                comprobante != null ? comprobante.getId() : null,
                comprobante != null ? comprobante.getNroComprobante() : null,
                reserva.getVentanaCheckIn()
        );
    }
}
