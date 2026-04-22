package com.reservas.residencial.infrastructure.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.TipoHabitacion;
import com.reservas.residencial.infrastructure.controllers.dto.RegistroReservaRequest;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.TipoHabitacionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.mock.web.MockMultipartFile;
import java.util.Objects;

@SpringBootTest
@AutoConfigureMockMvc
class ReservaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private TipoHabitacionRepository tipoHabitacionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegistrarReserva_Integration() throws Exception {
        // Asegurar que existe un tipo y una habitación disponible
        TipoHabitacion tipo = new TipoHabitacion();
        tipo.setNombreTipo("Estandar");
        tipo.setPrecioBase(100.0);
        tipo = tipoHabitacionRepository.save(tipo);

        Habitacion h = new Habitacion();
        h.setNumero("TEST-RESERVA");
        h.setTipo(tipo);
        h.setEstado("Disponible");
        h = habitacionRepository.save(h);

        MockMultipartFile fotoAnv = new MockMultipartFile("fotoAnverso", "anv.jpg", "image/jpeg", "test".getBytes());
        MockMultipartFile fotoRev = new MockMultipartFile("fotoReverso", "rev.jpg", "image/jpeg", "test".getBytes());

        mockMvc.perform(multipart("/api/reservas")
                .file(fotoAnv)
                .file(fotoRev)
                .param("huespedNombre", "Huesped Prueba")
                .param("huespedDocumentoIdentidad", "999888")
                .param("huespedCelular", "777-666")
                .param("habitacionId", h.getId().toString())
                .param("fechaEntrada", LocalDate.now().toString())
                .param("fechaSalida", LocalDate.now().plusDays(1).toString())
                .param("montoTotal", "100.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.huesped.nombre").value("Huesped Prueba"))
                .andExpect(jsonPath("$.habitacion.estado").value("Reservada"))
                .andExpect(jsonPath("$.estado").value("PENDIENTE_PAGO"));
    }
}
