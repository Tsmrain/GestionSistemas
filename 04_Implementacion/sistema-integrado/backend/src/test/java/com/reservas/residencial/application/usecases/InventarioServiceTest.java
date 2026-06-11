package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.*;
import com.reservas.residencial.application.ports.out.*;
import com.reservas.residencial.domain.models.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock
    private InventarioItemRepositoryPort itemRepository;

    @Mock
    private HabitacionInventarioRepositoryPort habitacionInventarioRepository;

    @Mock
    private IncidenciaMantenimientoRepositoryPort incidenciaRepository;

    @Mock
    private HabitacionRepositoryPort habitacionRepository;

    @Mock
    private EgresoRepositoryPort egresoRepository;

    @InjectMocks
    private InventarioService inventarioService;

    private Habitacion habitacion;
    private InventarioItem item;
    private HabitacionInventario habInv;

    @BeforeEach
    void setUp() {
        TipoHabitacion tipo = new TipoHabitacion(1L, "Estandar", 150.0, 12, "Estandar");
        habitacion = new Habitacion(1L, "101", tipo, "Disponible", 0L);
        item = new InventarioItem("Toalla de Baño", "BLANCOS", 10, 40.0, 40.0, "🧼");
        item.setId(1L);

        habInv = new HabitacionInventario(habitacion, item, 2, 2);
        habInv.setId(1L);
    }

    @Test
    void conciliarInventario_CantidadIgual_Exitoso() {
        when(habitacionInventarioRepository.findByHabitacionIdAndItemId(1L, 1L)).thenReturn(Optional.of(habInv));

        inventarioService.conciliarInventario(1L, 1L, 2, "Admin");

        assertThat(habInv.getCantidadActual()).isEqualTo(2);
        assertThat(habInv.getEstadoVerificacion()).isEqualTo("OK");
        verify(habitacionInventarioRepository).save(habInv);
        verify(egresoRepository, never()).save(any(Egreso.class));
    }

    @Test
    void conciliarInventario_CantidadMenor_CreaEgreso() {
        when(habitacionInventarioRepository.findByHabitacionIdAndItemId(1L, 1L)).thenReturn(Optional.of(habInv));

        inventarioService.conciliarInventario(1L, 1L, 1, "Admin");

        assertThat(habInv.getCantidadActual()).isEqualTo(1);
        assertThat(habInv.getEstadoVerificacion()).isEqualTo("FALTANTE");
        verify(habitacionInventarioRepository).save(habInv);
        // Costo del faltante = (2 - 1) * 40.0 = 40.0
        verify(egresoRepository).save(any(Egreso.class));
    }

    @Test
    void registrarIncidencia_Exitoso_CambiaEstadoHabitacion() {
        IncidenciaRequest request = new IncidenciaRequest(1L, 1L, "TV roto", "Recepcionista 1");
        IncidenciaMantenimiento incidencia = new IncidenciaMantenimiento(habitacion, item, "TV roto", "Recepcionista 1");
        incidencia.setId(10L);

        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(habitacion));
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(incidenciaRepository.save(any(IncidenciaMantenimiento.class))).thenReturn(incidencia);

        IncidenciaResponse response = inventarioService.registrarIncidencia(request);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(habitacion.getEstadoActual()).isEqualTo("Mantenimiento");
        verify(habitacionRepository).save(habitacion);
        verify(incidenciaRepository).save(any(IncidenciaMantenimiento.class));
    }

    @Test
    void resolverIncidencia_ConCosto_CreaEgresoYLiberaHabitacion() {
        IncidenciaMantenimiento incidencia = new IncidenciaMantenimiento(habitacion, item, "TV roto", "Recepcionista 1");
        incidencia.setId(10L);

        when(incidenciaRepository.findById(10L)).thenReturn(Optional.of(incidencia));
        when(incidenciaRepository.save(any(IncidenciaMantenimiento.class))).thenReturn(incidencia);
        when(incidenciaRepository.findByHabitacionId(1L)).thenReturn(List.of(incidencia)); // returns resolved incidence

        IncidenciaResponse response = inventarioService.resolverIncidencia(10L, 120.0, "Recepcionista 1");

        assertThat(response.estado()).isEqualTo("REPARADO");
        assertThat(response.costoReparacion()).isEqualTo(120.0);
        assertThat(habitacion.getEstadoActual()).isEqualTo("Disponible");

        verify(egresoRepository).save(any(Egreso.class));
        verify(habitacionRepository).save(habitacion);
    }

    @Test
    void registrarItem_Exitoso() {
        InventarioItemRequest request = new InventarioItemRequest("Refresco 2L", "VENTA", 50, 4.0, 8.0, "🥤");
        when(itemRepository.findByNombre("Refresco 2L")).thenReturn(Optional.empty());
        when(itemRepository.save(any(InventarioItem.class))).thenAnswer(invocation -> {
            InventarioItem i = invocation.getArgument(0);
            i.setId(100L);
            return i;
        });

        InventarioItemResponse response = inventarioService.registrarItem(request);

        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.nombre()).isEqualTo("Refresco 2L");
        verify(itemRepository).save(any(InventarioItem.class));
    }

    @Test
    void registrarItem_Duplicado_LanzaExcepcion() {
        InventarioItemRequest request = new InventarioItemRequest("Toalla de Baño", "BLANCOS", 10, 40.0, 40.0, "🧼");
        when(itemRepository.findByNombre("Toalla de Baño")).thenReturn(Optional.of(item));

        assertThatThrownBy(() -> inventarioService.registrarItem(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ya existe un artículo con el nombre");
        verify(itemRepository, never()).save(any(InventarioItem.class));
    }

    @Test
    void actualizarItem_Exitoso() {
        InventarioItemRequest request = new InventarioItemRequest("Toalla de Baño Modificada", "BLANCOS", 15, 45.0, 45.0, "🧼");
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(itemRepository.findByNombre("Toalla de Baño Modificada")).thenReturn(Optional.empty());
        when(itemRepository.save(any(InventarioItem.class))).thenReturn(item);

        InventarioItemResponse response = inventarioService.actualizarItem(1L, request);

        assertThat(response.nombre()).isEqualTo("Toalla de Baño Modificada");
        assertThat(response.stockActual()).isEqualTo(15);
        verify(itemRepository).save(item);
    }

    @Test
    void eliminarItem_Exitoso() {
        when(itemRepository.findById(1L)).thenReturn(Optional.of(item));

        inventarioService.eliminarItem(1L);

        verify(itemRepository).deleteById(1L);
    }

    @Test
    void eliminarItem_Inexistente_LanzaExcepcion() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventarioService.eliminarItem(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Artículo no encontrado con ID");
        verify(itemRepository, never()).deleteById(anyLong());
    }
}
