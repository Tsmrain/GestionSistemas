package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.IniciarPagoRequest;
import com.reservas.residencial.application.dto.PagoStatusResponse;
import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Pago;
import com.reservas.residencial.domain.models.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProcesarPagoService {

    private final ReservaRepositoryPort reservaRepository;
    private final PagoRepositoryPort pagoRepository;
    private final BnbPaymentPort bnbPort;

    @Transactional
    public PagoStatusResponse iniciarProcesoPago(IniciarPagoRequest request) {
        Reserva reserva = reservaRepository.findById(request.reservaId())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        if (request.metodo().equals("QR_BNB")) {
            String qrData = bnbPort.generarQR(reserva.getMontoTotal(), "Pago reserva " + reserva.getId(), reserva.getId());
            
            Pago pago = new Pago(reserva, reserva.getMontoTotal(), "QR_BNB", "PENDIENTE");
            pago.setExternalId(qrData); 
            pagoRepository.save(pago);

            return new PagoStatusResponse(reserva.getId(), "PENDIENTE", qrData, null);
        } else if (request.metodo().equals("EFECTIVO")) {
            return confirmarPagoEfectivo(reserva.getId());
        }
        
        throw new IllegalArgumentException("Método de pago no soportado");
    }

    @Transactional
    public PagoStatusResponse confirmarPagoEfectivo(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));

        Pago pago = new Pago(reserva, reserva.getMontoTotal(), "EFECTIVO", "COMPLETADO");
        pagoRepository.save(pago);

        reserva.confirmarPago();
        reservaRepository.save(reserva);

        return new PagoStatusResponse(reserva.getId(), "COMPLETADO", null, 1L); // 1L placeholder para comprobante
    }

    @Transactional
    public PagoStatusResponse verificarEstadoPago(Long reservaId) {
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró un proceso de pago para esta reserva"));

        if ("PENDIENTE".equals(pago.getEstado()) && "QR_BNB".equals(pago.getMetodo())) {
            String nuevoEstado = bnbPort.consultarEstado(pago.getExternalId());
            if ("COMPLETADO".equals(nuevoEstado)) {
                pago.setEstado("COMPLETADO");
                pagoRepository.save(pago);

                Reserva reserva = pago.getReserva();
                reserva.confirmarPago();
                reservaRepository.save(reserva);

                return new PagoStatusResponse(reservaId, "COMPLETADO", null, 1L);
            }
        }

        return new PagoStatusResponse(reservaId, pago.getEstado(), pago.getExternalId(), null);
    }
}
