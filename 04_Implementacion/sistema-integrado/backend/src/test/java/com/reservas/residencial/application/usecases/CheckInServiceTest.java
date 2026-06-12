package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ItemPreverificacion;
import com.reservas.residencial.application.dto.PreverificacionRequest;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.ports.out.ConsumoExtraRepositoryPort;
import com.reservas.residencial.application.ports.out.EgresoRepositoryPort;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionInventarioRepositoryPort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.application.ports.out.InventarioItemRepositoryPort;
import com.reservas.residencial.application.ports.out.PagoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.application.ports.out.VerificacionCheckoutRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.HabitacionInventario;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.domain.models.VerificacionCheckout;
import com.reservas.residencial.domain.models.VerificacionDetalle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

    @Mock
    private InventarioItemRepositoryPort itemRepository;

    @Mock
    private HabitacionInventarioRepositoryPort habitacionInventarioRepository;

    @Mock
    private VerificacionCheckoutRepositoryPort verificacionCheckoutRepository;

    @Mock
    private ConsumoExtraRepositoryPort consumoExtraRepository;

    @Mock
    private EgresoRepositoryPort egresoRepository;

    @Mock
    private IncidenciaMantenimientoRepositoryPort incidenciaRepository;

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

    @Test
    void preverificarCheckout_FinalizaTodasLasActivasDeLaHabitacionYEnviaALimpieza() {
        reserva.setEstado("ACTIVA");
        Reserva otraActiva = new Reserva();
        otraActiva.setId(11L);
        otraActiva.setEstado("ACTIVA");
        otraActiva.setHabitacion(habitacion);
        otraActiva.setHuesped(huesped);
        Reserva pagadaColgada = new Reserva();
        pagadaColgada.setId(12L);
        pagadaColgada.setEstado("PAGADA");
        pagadaColgada.setFechaIngreso(LocalDate.now());
        pagadaColgada.setHabitacion(habitacion);
        pagadaColgada.setHuesped(huesped);

        InventarioItem item = new InventarioItem("Toalla", "REUSABLE", 10, 20.0, 30.0, "🧴");
        item.setId(5L);
        HabitacionInventario habitacionInventario = new HabitacionInventario(habitacion, item, 1, 1);
        VerificacionCheckout verificacion = new VerificacionCheckout(reserva, habitacion, "Recepcionista 1", "Juana", true, "");
        verificacion.setId(20L);

        when(reservaRepository.findById(10L)).thenReturn(Optional.of(reserva));
        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(habitacion));
        when(verificacionCheckoutRepository.save(any(VerificacionCheckout.class))).thenReturn(verificacion);
        when(itemRepository.findById(5L)).thenReturn(Optional.of(item));
        when(habitacionInventarioRepository.findByHabitacionIdAndItemId(1L, 5L)).thenReturn(Optional.of(habitacionInventario));
        when(habitacionInventarioRepository.save(any(HabitacionInventario.class))).thenAnswer(i -> i.getArguments()[0]);
        when(verificacionCheckoutRepository.saveDetalle(any(VerificacionDetalle.class))).thenAnswer(i -> {
            VerificacionDetalle detalle = i.getArgument(0);
            detalle.setId(30L);
            return detalle;
        });
        when(reservaRepository.findAllByHabitacionIdAndEstados(1L, List.of("ACTIVA", "PAGADA", "PENDIENTE_PAGO")))
                .thenReturn(List.of(reserva, otraActiva, pagadaColgada));

        checkInService.preverificarCheckout(new PreverificacionRequest(
                10L,
                "Recepcionista 1",
                "Juana",
                "",
                List.of(new ItemPreverificacion(5L, "OK", 0, true))
        ));

        assertThat(reserva.getEstado()).isEqualTo("FINALIZADA");
        assertThat(otraActiva.getEstado()).isEqualTo("FINALIZADA");
        assertThat(pagadaColgada.getEstado()).isEqualTo("CANCELADA");
        assertThat(habitacion.getEstadoActual()).isEqualTo("Limpieza");
        verify(reservaRepository).save(reserva);
        verify(reservaRepository).save(otraActiva);
        verify(reservaRepository).save(pagadaColgada);
        verify(habitacionRepository).save(habitacion);
    }
}
