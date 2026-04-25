package com.reservas.residencial.infrastructure.external.adapters;

import com.reservas.residencial.application.ports.out.BnbPaymentPort;
import org.springframework.stereotype.Component;

@Component
public class BnbSandboxAdapter implements BnbPaymentPort {

    @Override
    public String generarQR(Double monto, String glosa, Long reservaId) {
        // Simulación de retorno de QR en Base64 estático
        return "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAcklEQVRYhe3XMQ0AIAwAwY6D2T9KDPBSYV9vQNPvXIAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBALvP6GZ7h/D0AAAAABJRU5ErkJggg==";
    }

    @Override
    public String consultarEstado(String externalId) {
        // Simulación de polling que siempre retorna COMPLETADO
        return "COMPLETADO";
    }
}
