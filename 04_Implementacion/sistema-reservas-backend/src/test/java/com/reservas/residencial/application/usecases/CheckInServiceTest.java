package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.domain.models.TipoHabitacion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

    @Mock
    private ReservaRepositoryPort reservaRepository;

    @Mock
    private HabitacionRepositoryPort habitacionRepository;

    @Mock
    private HuespedRepositoryPort huespedRepository;

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private PagoRepositoryPort pagoRepository;

    @InjectMocks
    private CheckInService checkInService;

    private Reserva reserva;
    private Habitacion habitacion;
    private Huesped huesped;

    @BeforeEach
    void setUp() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, 12, "Estandar");
        habitacion = new Habitacion(1L, "101", tipo, "Disponible", 0L);
        huesped = new Huesped(1L, "Juan Perez", "1234567", null, "77788899", null, null);
        
        reserva = new Reserva();
        reserva.setId(10L);
        reserva.setHuesped(huesped);
        reserva.setHabitacion(habitacion);
        reserva.setCantidadBloques(1);
        reserva.setEstado("PAGADA");
    }

    @Test
    void realizarCheckIn_ExitosoSinAcompanante() {
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservaResponse result = checkInService.realizarCheckIn(10L, null, null, null, null, null, null, "Recepcionista 1");

        assertThat(result.estado()).isEqualTo("ACTIVA");
        assertThat(result.habitacion().numero()).isEqualTo("101");
        assertThat(result.horaIngreso()).isNotNull();
        assertThat(habitacion.getEstadoActual()).isEqualTo("Ocupada");
        
        verify(habitacionRepository).save(habitacion);
        verify(reservaRepository).save(reserva);
    }

    @Test
    void realizarCheckIn_ExitosoConAcompanante() {
        Huesped acompanante = new Huesped(2L, "Maria Lopez", "7654321", LocalDate.of(1998, 5, 14), "70000000", null, null);
        
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(huespedRepository.save(any(Huesped.class))).thenReturn(acompanante);
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservaResponse result = checkInService.realizarCheckIn(
                10L,
                "Maria Lopez",
                "7654321",
                LocalDate.of(1998, 5, 14),
                "70000000",
                null,
                null,
                "Recepcionista 1"
        );

        assertThat(result.estado()).isEqualTo("ACTIVA");
        assertThat(result.acompanante()).isNotNull();
        assertThat(result.acompanante().nombre()).isEqualTo("Maria Lopez");
        assertThat(result.acompanante().fechaNacimiento()).isEqualTo(LocalDate.of(1998, 5, 14));
        assertThat(result.acompanante().celular()).isEqualTo("70000000");
        
        verify(huespedRepository).save(any(Huesped.class));
    }

    @Test
    void realizarCheckIn_FallaSiNoEstaPagada() {
        reserva.setEstado("PENDIENTE_PAGO");
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));

        assertThatThrownBy(() -> checkInService.realizarCheckIn(10L, null, null, null, null, null, null, "Recepcionista 1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("debe estar PAGADA");
    }

    @Test
    void cancelarPorInconsistenciaIdentidad_LiberaHabitacion() {
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));

        checkInService.cancelarPorInconsistenciaIdentidad(10L);

        assertThat(reserva.getEstado()).isEqualTo("CANCELADA");
        assertThat(habitacion.getEstadoActual()).isEqualTo("Disponible");
        
        verify(habitacionRepository).save(habitacion);
        verify(reservaRepository).save(reserva);
    }

    @Test
    void realizarCheckIn_CalculaSalidaLlegadaTardiaQR() {
        // Simular reserva pagada hace 1 hora (llegada tardía)
        reserva.setEstado("PAGADA");
        reserva.setFechaPago(LocalDateTime.now().minusHours(1));
        reserva.setVentanaCheckIn(reserva.getFechaPago().plusMinutes(30));
        
        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservaResponse result = checkInService.realizarCheckIn(10L, null, null, null, null, null, null, "Recepcionista 1");

        // La hora de salida estimada debe ser ventanaCheckIn + 12 horas
        LocalDateTime salidaEsperada = reserva.getVentanaCheckIn().plusHours(12);
        assertThat(result.horaSalidaEstimada()).isEqualToIgnoringSeconds(salidaEsperada);
    }
}
