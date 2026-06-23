package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.HabitacionEstadoResponse;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.IncidenciaMantenimientoRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.domain.models.TipoHabitacion;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTest {

    @Mock
    private HabitacionRepositoryPort habitacionRepository;

    @Mock
    private ReservaRepositoryPort reservaRepository;

    @Mock
    private IncidenciaMantenimientoRepositoryPort incidenciaRepository;

    @InjectMocks
    private DisponibilidadService disponibilidadService;

    @Test
    void deberiaIgnorarElFiltroCuandoSeSolicitanTodasLasHabitaciones() {
        LocalDate fecha = LocalDate.of(2026, 4, 23);
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, 12, "Habitacion estandar");
        Habitacion habitacion = new Habitacion(1L, "101", tipo, "Disponible", 0L);

        when(habitacionRepository.findDisponibles(fecha)).thenReturn(List.of(habitacion));

        List<HabitacionDisponibleResponse> respuesta = disponibilidadService.consultarDisponibilidad(
                new ConsultarDisponibilidadQuery(fecha, "Todas las habitaciones")
        );

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).tipo().duracionHoras()).isEqualTo(12);
        assertThat(respuesta.get(0).tipo().nombreTipo()).isEqualTo("Estandar");
        verify(habitacionRepository).findDisponibles(fecha);
    }

    @Test
    void listarTodasConEstado_RespetaLimpiezaAunqueExistaReservaVisible() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, 12, "Habitacion estandar");
        Habitacion habitacion = new Habitacion(1L, "107", tipo, "Limpieza", 0L);

        when(habitacionRepository.findAll()).thenReturn(List.of(habitacion));

        List<HabitacionEstadoResponse> respuesta = disponibilidadService.listarTodasConEstado();

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).estadoActual()).isEqualTo("Limpieza");
        verify(reservaRepository, never()).findAllByHabitacionIdAndEstados(any(), any());
    }

    @Test
    void listarTodasConEstado_SiHabitacionEstaOcupadaMantieneEstadoOperativoYReservaActivaAparte() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "VIP", 180.0, 12, "Habitacion vip");
        Habitacion habitacion = new Habitacion(1L, "203", tipo, "Ocupada", 0L);
        Reserva activa = new Reserva();
        activa.setId(47L);
        activa.setEstado("ACTIVA");
        activa.setHabitacion(habitacion);
        Huesped huesped = new Huesped();
        huesped.setNombre("Huesped activo");
        huesped.setCi("123");
        activa.setHuesped(huesped);

        when(habitacionRepository.findAll()).thenReturn(List.of(habitacion));
        when(reservaRepository.findAllByHabitacionIdAndEstados(1L, List.of("ACTIVA"))).thenReturn(List.of(activa));

        List<HabitacionEstadoResponse> respuesta = disponibilidadService.listarTodasConEstado();

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).estadoActual()).isEqualTo("Ocupada");
        assertThat(respuesta.get(0).reservaVigenteEstado()).isEqualTo("ACTIVA");
        verify(reservaRepository).findAllByHabitacionIdAndEstados(1L, List.of("ACTIVA"));
        verify(reservaRepository, never()).findVisibleByHabitacionId(1L);
    }

    @Test
    void listarTodasConEstado_ReservaPendienteHaceVisibleLaHabitacionComoPendientePago() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "VIP", 180.0, 12, "Habitacion vip");
        Habitacion habitacion = new Habitacion(1L, "104", tipo, "Disponible", 0L);
        Reserva pendiente = new Reserva();
        pendiente.setId(54L);
        pendiente.setEstado("PENDIENTE_PAGO");
        pendiente.setFechaIngreso(LocalDate.now());
        pendiente.setHabitacion(habitacion);
        Huesped huesped = new Huesped();
        huesped.setNombre("kylian");
        huesped.setCi("12345678");
        pendiente.setHuesped(huesped);

        when(habitacionRepository.findAll()).thenReturn(List.of(habitacion));
        when(reservaRepository.findAllByHabitacionIdAndEstados(1L, List.of("ACTIVA", "PAGADA", "PENDIENTE_PAGO")))
                .thenReturn(List.of(pendiente));

        List<HabitacionEstadoResponse> respuesta = disponibilidadService.listarTodasConEstado();

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).estadoActual()).isEqualTo("PENDIENTE_PAGO");
        assertThat(respuesta.get(0).reservaVigenteId()).isEqualTo(54L);
        assertThat(respuesta.get(0).reservaVigenteEstado()).isEqualTo("PENDIENTE_PAGO");
        assertThat(respuesta.get(0).huespedNombre()).isEqualTo("kylian");
    }

    @Test
    void listarTodasConEstado_IncidenciaPendienteBloqueaReservaConfirmada() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "VIP", 180.0, 12, "Habitacion vip");
        Habitacion habitacion = new Habitacion(1L, "202", tipo, "Disponible", 0L);

        when(habitacionRepository.findAll()).thenReturn(List.of(habitacion));
        when(incidenciaRepository.existsByHabitacionIdAndEstado(1L, "PENDIENTE")).thenReturn(true);

        List<HabitacionEstadoResponse> respuesta = disponibilidadService.listarTodasConEstado();

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).estadoActual()).isEqualTo("Mantenimiento");
        assertThat(respuesta.get(0).reservaVigenteId()).isNull();
        verify(reservaRepository, never()).findAllByHabitacionIdAndEstados(any(), any());
    }
}
