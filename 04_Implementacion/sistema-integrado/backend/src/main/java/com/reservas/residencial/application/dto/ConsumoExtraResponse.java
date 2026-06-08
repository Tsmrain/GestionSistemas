package com.reservas.residencial.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ConsumoExtraResponse(
        Long id,
        Long reservaId,
        String estado,
        Double total,
        String qrData,
        List<ItemConsumoResponse> items,
        LocalDateTime fechaCreacion
) {
}
