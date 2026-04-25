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

        return switch (request.metodo()) {
            case "QR_BNB"  -> iniciarPagoQR(reserva);
            case "EFECTIVO" -> procesarPagoEfectivo(reserva);
            default -> throw new IllegalArgumentException("Método de pago no soportado: " + request.metodo());
        };
    }

    /**
     * Pasos 4–5 (Flujo básico): invoca BNB, crea el Pago en PENDIENTE.
     * Camino 4a: si BNB lanza excepción, se propaga para que el Controller informe al frontend.
     */
    private PagoStatusResponse iniciarPagoQR(Reserva reserva) {
        String qrData = bnbPort.generarQR(
                reserva.getMontoTotal(),
                "Pago reserva " + reserva.getId(),
                reserva.getId()
        );

        Pago pago = new Pago(reserva, reserva.getMontoTotal(), "QR_BNB", "PENDIENTE");
        pago.setExternalId(qrData);
        pagoRepository.save(pago);

        return new PagoStatusResponse(reserva.getId(), "PENDIENTE", qrData, null, null, null);
    }

    /**
     * Paso 7 (Flujo básico): polling de verificación del estado de la transacción BNB.
     * Camino 7a: si el QR está expirado, marca el pago como FALLIDO.
     */
    @Transactional
    public PagoStatusResponse verificarEstadoPago(Long reservaId) {
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("No existe pago iniciado para la reserva: " + reservaId));

        if (!"PENDIENTE".equals(pago.getEstado())) {
            return toResponse(pago.getReserva(), pago.getEstado(), null, null);
        }

        // Camino 7a: QR expirado (5 minutos)
        if (pago.estaExpirado()) {
            pago.setEstado("FALLIDO");
            pagoRepository.save(pago);
            return toResponse(pago.getReserva(), "QR_EXPIRADO", null, null);
        }

        String estadoBnb = bnbPort.consultarEstado(pago.getExternalId());

        if ("COMPLETADO".equals(estadoBnb)) {
            pago.setEstado("COMPLETADO");
            pagoRepository.save(pago);

            Reserva reserva = pago.getReserva();
            reserva.confirmarPago();           // Experto en Información
            reservaRepository.save(reserva);

            Comprobante comprobante = new Comprobante(pago);
            comprobanteRepository.save(comprobante);

            return toResponse(reserva, "COMPLETADO", null, comprobante);
        }

        // Pago aún PENDIENTE
        return toResponse(pago.getReserva(), "PENDIENTE", pago.getExternalId(), null);
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
        return procesarPagoEfectivo(reserva);
    }

    private PagoStatusResponse procesarPagoEfectivo(Reserva reserva) {
        Pago pago = new Pago(reserva, reserva.getMontoTotal(), "EFECTIVO", "COMPLETADO");
        pagoRepository.save(pago);

        reserva.confirmarPago();               // Experto en Información
        reservaRepository.save(reserva);

        Comprobante comprobante = new Comprobante(pago);
        comprobanteRepository.save(comprobante);

        return toResponse(reserva, "COMPLETADO", null, comprobante);
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
