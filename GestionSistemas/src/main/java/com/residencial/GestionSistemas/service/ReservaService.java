package com.residencial.GestionSistemas.service;

import com.residencial.GestionSistemas.model.Habitacion;
import com.residencial.GestionSistemas.model.Huesped;
import com.residencial.GestionSistemas.model.Reserva;
import com.residencial.GestionSistemas.repository.HabitacionRepository;
import com.residencial.GestionSistemas.repository.HuespedRepository;
import com.residencial.GestionSistemas.repository.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private HuespedRepository huespedRepository;

    @Autowired
    private HabitacionRepository habitacionRepository;

    public Huesped buscarOCrearHuesped(String ci, String nombreCompleto, String telefono) {
        if (ci == null || ci.trim().isEmpty()) {
            throw new IllegalArgumentException("RN-04: El CI es obligatorio para registrar la reserva.");
        }

        Optional<Huesped> huespedOpt = huespedRepository.findByCi(ci);
        if (huespedOpt.isPresent()) {
            return huespedOpt.get();
        } else {
            Huesped nuevo = new Huesped();
            nuevo.setCi(ci);
            nuevo.setNombreCompleto(nombreCompleto);
            nuevo.setTelefono(telefono);
            return huespedRepository.save(nuevo);
        }
    }

    @Transactional
    public Reserva registrarReserva(String ci, String nombreCompleto, String telefono, Long idHabitacion, Reserva reservaDatos) {
        // Buscar huésped
        Huesped huesped = buscarOCrearHuesped(ci, nombreCompleto, telefono);

        // Buscar habitación
        Habitacion habitacion = habitacionRepository.findById(idHabitacion)
                .orElseThrow(() -> new RuntimeException("La habitación no existe."));

        // Verificar disponibilidad (Prevención de concurrencia)
        if (!"Disponible".equalsIgnoreCase(habitacion.getEstado())) {
            throw new RuntimeException("La habitación ya no se encuentra disponible.");
        }

        // Actualizar estado de habitación a Reservada
        habitacion.setEstado("Reservada");
        habitacionRepository.save(habitacion);

        // Crear Reserva
        reservaDatos.setHuesped(huesped);
        reservaDatos.setHabitacion(habitacion);
        reservaDatos.setEstado("Pendiente");
        
        // Generar código único de referencia
        String codigoUnico = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        reservaDatos.setCodigo(codigoUnico);

        // Guardar reserva
        return reservaRepository.save(reservaDatos);
    }
}
