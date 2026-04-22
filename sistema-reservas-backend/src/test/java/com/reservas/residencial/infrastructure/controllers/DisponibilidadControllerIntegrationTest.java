package com.reservas.residencial.infrastructure.controllers;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DisponibilidadControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Test
    @SuppressWarnings("null")
    void testConsultarDisponibilidad_Integration() throws Exception {
        Habitacion h = new Habitacion();
        h.setNumero("INT-101");
        h.setTipo("Estandar");
        h.setEstado("Disponible");
        h.setPrecioBase(100.0);
        habitacionRepository.save(h);

        mockMvc.perform(get("/api/habitaciones/disponibles")
                .param("tipo", "Estandar")
                .param("fecha", "2023-12-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numero").exists());
    }
}
