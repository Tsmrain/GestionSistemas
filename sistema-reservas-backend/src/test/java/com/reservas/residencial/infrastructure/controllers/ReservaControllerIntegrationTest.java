package com.reservas.residencial.infrastructure.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.controllers.dto.ReservaRequestDTO;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReservaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegistrarReserva_Integration() throws Exception {
        // Asegurar que existe una habitación disponible
        Habitacion h = new Habitacion();
        h.setNumero("TEST-1");
        h.setTipo("Estandar");
        h.setEstado("Disponible");
        h.setPrecioBase(100.0);
        h = habitacionRepository.save(h);

        ReservaRequestDTO request = new ReservaRequestDTO();
        request.setClienteNombre("Prueba Integracion");
        request.setHabitacionId(h.getId());
        request.setFechaInicio(LocalDate.now());
        request.setFechaFin(LocalDate.now().plusDays(1));
        request.setMontoTotal(100.0);

        mockMvc.perform(post("/api/reservas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clienteNombre").value("Prueba Integracion"))
                .andExpect(jsonPath("$.habitacion.estado").value("Ocupada"));
    }
}
