package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class DisponibilidadServiceTest {

    @Mock
    private HabitacionRepository habitacionRepository;

    @InjectMocks
    private DisponibilidadService disponibilidadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testObtenerHabitacionesDisponibles() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 100.0, "Desc");
        Habitacion h1 = new Habitacion(1L, "101", tipo, "Disponible", 1L);
        Habitacion h2 = new Habitacion(2L, "102", tipo, "Disponible", 1L);
        
        when(habitacionRepository.findByTipo_NombreTipoAndEstado("Estandar", "Disponible"))
                .thenReturn(Arrays.asList(h1, h2));

        List<Habitacion> resultado = disponibilidadService.obtenerHabitacionesDisponibles("Estandar", "2023-12-01");

        assertEquals(2, resultado.size());
        assertEquals("101", resultado.get(0).getNumero());
    }
}
