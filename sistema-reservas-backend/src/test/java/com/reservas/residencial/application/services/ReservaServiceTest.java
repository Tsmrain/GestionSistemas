package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private HabitacionRepository habitacionRepository;

    @InjectMocks
    private ReservaService reservaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCrearReserva_CaminoFeliz() {
        // Arrange
        Habitacion h = new Habitacion(1L, "101", "Estandar", "Disponible", 150.0, 1L);
        Reserva r = new Reserva();
        r.setHabitacion(h);
        r.setClienteNombre("Santiago");

        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(h));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Reserva resultado = reservaService.crearReserva(r);

        // Assert
        assertNotNull(resultado);
        assertEquals("Ocupada", h.getEstado());
        verify(habitacionRepository).save(h);
        verify(reservaRepository).save(r);
    }

    @Test
    void testCrearReserva_PrecondicionFallida_HabitacionOcupada() {
        // Arrange
        Habitacion h = new Habitacion(1L, "101", "Estandar", "Ocupada", 150.0, 1L);
        Reserva r = new Reserva();
        r.setHabitacion(h);

        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(h));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            reservaService.crearReserva(r);
        });

        // Verificar que NO se guardó la reserva ni se alteró el estado nuevamente
        verify(reservaRepository, never()).save(any(Reserva.class));
        // El estado se mantiene como estaba (Ocupada), no hubo cambios que guardar
        verify(habitacionRepository, never()).save(any(Habitacion.class));
    }
}
