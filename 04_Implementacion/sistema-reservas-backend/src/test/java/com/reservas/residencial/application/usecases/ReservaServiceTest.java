package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.RegistroReservaCommand;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.domain.models.TipoHabitacion;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepositoryPort reservaRepository;

    @Mock
    private HabitacionRepositoryPort habitacionRepository;

    @Mock
    private HuespedRepositoryPort huespedRepository;

    @Mock
    private FileStoragePort fileStoragePort;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void deberiaCalcularElMontoTotalEnServidor() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "SUPERVIP", 250.0, 6, "Habitacion premium");
        Habitacion habitacion = new Habitacion(9L, "302", tipo, "Disponible", 0L);
        Huesped huesped = new Huesped(7L, "Ana Perez", "123", "70000000", null, null);
        Reserva reservaGuardada = new Reserva();
        reservaGuardada.setId(88L);
        reservaGuardada.setEstado("PENDIENTE_PAGO");
        reservaGuardada.setFechaIngreso(LocalDate.of(2026, 4, 24));
        reservaGuardada.setCantidadBloques(2);
        reservaGuardada.setMontoTotal(500.0);
        reservaGuardada.setHabitacion(habitacion);
        reservaGuardada.setHuesped(huesped);

        when(habitacionRepository.findById(9L)).thenReturn(Optional.of(habitacion));
        when(reservaRepository.existsActiveByHabitacionAndFecha(9L, LocalDate.of(2026, 4, 24), "CANCELADA"))
                .thenReturn(false);
        when(huespedRepository.save(any(Huesped.class))).thenReturn(huesped);
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaGuardada);

        ReservaResponse respuesta = reservaService.registrarReserva(
                new RegistroReservaCommand("Ana Perez", "123", "70000000", LocalDate.of(2026, 4, 24), 2, 9L),
                null,
                null
        );

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());

        assertThat(captor.getValue().getMontoTotal()).isEqualTo(500.0);
        assertThat(respuesta.montoTotal()).isEqualTo(500.0);
        assertThat(respuesta.habitacion().tipo().duracionHoras()).isEqualTo(6);
    }

    @Test
    void deberiaRechazarReservasDuplicadasParaLaMismaFecha() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "VIP", 180.0, 12, "Habitacion VIP");
        Habitacion habitacion = new Habitacion(5L, "201", tipo, "Disponible", 0L);

        when(habitacionRepository.findById(5L)).thenReturn(Optional.of(habitacion));
        when(reservaRepository.existsActiveByHabitacionAndFecha(5L, LocalDate.of(2026, 4, 24), "CANCELADA"))
                .thenReturn(true);

        assertThatThrownBy(() -> reservaService.registrarReserva(
                new RegistroReservaCommand("Juan", "456", "71111111", LocalDate.of(2026, 4, 24), 1, 5L),
                null,
                null
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ya esta reservada");
    }
}
