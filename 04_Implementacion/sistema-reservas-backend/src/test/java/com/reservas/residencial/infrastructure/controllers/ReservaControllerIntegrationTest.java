package com.reservas.residencial.infrastructure.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.controllers.dto.RegistroReservaRequest;
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

import java.util.Objects;

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
        h.setNumero("TEST-RESERVA");
        h.setTipo("Estandar");
        h.setEstado("Disponible");
        h.setPrecioBase(100.0);
        h = habitacionRepository.save(h);

        RegistroReservaRequest request = new RegistroReservaRequest();
        request.setHuespedNombre("Huesped Prueba");
        request.setHuespedDocumentoIdentidad("999888");
        request.setHuespedContacto("777-666");
        request.setHabitacionId(h.getId());
        request.setFechaEntrada(LocalDate.now());
        request.setFechaSalida(LocalDate.now().plusDays(1));
        request.setMontoTotal(100.0);

        String jsonContent = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/reservas")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(jsonContent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.huesped.nombre").value("Huesped Prueba"))
                .andExpect(jsonPath("$.habitacion.estado").value("Ocupada"));
    }
}
