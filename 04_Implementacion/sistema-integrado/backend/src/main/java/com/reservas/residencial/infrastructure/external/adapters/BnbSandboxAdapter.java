package com.reservas.residencial.infrastructure.external.adapters;

import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class BnbSandboxAdapter implements BnbPaymentPort {

    @Override
    public String generarQR(Double monto, String glosa, Long reservaId) {
        String payload = "BNB|" + reservaId + "|BS " + monto + "|" + glosa;
        return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data="
                + URLEncoder.encode(payload, StandardCharsets.UTF_8);
    }

    @Override
    public String consultarEstado(String externalId) {
        // En sandbox no hay banco real; la confirmacion se dispara desde la demo.
        return "PENDIENTE";
    }

}
