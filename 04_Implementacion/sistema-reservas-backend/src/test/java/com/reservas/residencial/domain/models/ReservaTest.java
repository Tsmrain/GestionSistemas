package com.reservas.residencial.domain.models;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ReservaTest {

    @Test
    @DisplayName("GIVEN una reserva PENDIENTE WHEN se confirma el pago THEN el estado cambia a PAGADA")
    void testConfirmarPago_DebeCambiarEstadoAPagada() {
        // Arrange
        Reserva reserva = new Reserva();
        reserva.setEstado("PENDIENTE");

        // Act
        reserva.confirmarPago();

        // Assert
        assertEquals("PAGADA", reserva.getEstado(), "El estado de la reserva debe ser PAGADA tras confirmar el pago");
    }
}
