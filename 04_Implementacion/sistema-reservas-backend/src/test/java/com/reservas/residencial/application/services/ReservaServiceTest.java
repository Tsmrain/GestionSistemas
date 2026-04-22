package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.HuespedRepository;
import com.reservas.residencial.infrastructure.repositories.ReservaRepository;
import com.reservas.residencial.domain.models.TipoHabitacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private HabitacionRepository habitacionRepository;

    @Mock
    private HuespedRepository huespedRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ReservaService reservaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegistrarReserva_CaminoFeliz() {
        // Arrange
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, "Descripcion");
        Habitacion h = new Habitacion(1L, "101", tipo, "Disponible", 1L);
        Huesped hu = new Huesped(1L, "Santiago", "123456", "123", null, null);
        Reserva r = new Reserva();
        r.setHabitacion(h);
        r.setHuesped(hu);

        when(huespedRepository.findByDocumentoIdentidad("123456")).thenReturn(Optional.of(hu));
        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(h));
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(huespedRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Reserva resultado = reservaService.registrarReserva(r, null, null);

        // Assert
        assertNotNull(resultado);
        assertEquals("Reservada", h.getEstado());
        assertEquals("PENDIENTE_PAGO", resultado.getEstado());
        verify(habitacionRepository).save(h);
        verify(reservaRepository).save(r);
    }

    @Test
    void testRegistrarReserva_PrecondicionFallida_HabitacionOcupada() {
        // Arrange
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, "Descripcion");
        Habitacion h = new Habitacion(1L, "101", tipo, "Ocupada", 1L);
        Huesped hu = new Huesped(1L, "Santiago", "123456", "123", null, null);
        Reserva r = new Reserva();
        r.setHabitacion(h);
        r.setHuesped(hu);

        when(huespedRepository.findByDocumentoIdentidad("123456")).thenReturn(Optional.of(hu));
        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(h));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            reservaService.registrarReserva(r, null, null);
        });

        // Verificar que NO se guardó la reserva ni se alteró el estado nuevamente
        verify(reservaRepository, never()).save(any());
        verify(habitacionRepository, never()).save(any());
    }
}
