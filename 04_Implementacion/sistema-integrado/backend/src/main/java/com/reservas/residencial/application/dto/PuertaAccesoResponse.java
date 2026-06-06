package com.reservas.residencial.application.dto;

public record PuertaAccesoResponse(
        boolean autorizado,
        String mensaje,
        ReservaResponse reserva
) {
}
