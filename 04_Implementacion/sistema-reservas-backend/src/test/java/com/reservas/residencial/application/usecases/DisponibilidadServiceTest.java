package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTest {

    @Mock
    private HabitacionRepositoryPort habitacionRepository;

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
}
