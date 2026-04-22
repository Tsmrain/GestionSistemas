package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.HuespedRepository;
import com.reservas.residencial.infrastructure.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final HuespedRepository huespedRepository;

    /**
     * Implementación del Contrato de Operación: registrarReserva
     * Sigue los principios de Larman (Expert) y Mannino
     * (Integridad/Transaccionalidad)
     */
    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        if (reserva == null || reserva.getHabitacion() == null || reserva.getHuesped() == null) {
            throw new IllegalArgumentException("La reserva, habitación y huésped son obligatorios.");
        }

        // 1. Gestionar Huésped (Baja Brecha de Representación)
        Huesped huesped;
        Huesped huespedTemporal = reserva.getHuesped();
        Optional<Huesped> optionalHuesped = huespedRepository.findByDocumentoIdentidad(huespedTemporal.getDocumentoIdentidad());
        
        if (optionalHuesped.isPresent()) {
            huesped = optionalHuesped.get();
        } else {
            huesped = huespedRepository.save(huespedTemporal);
        }
        reserva.setHuesped(huesped);

        // 2. Buscar la habitación asociada (Experto en Información)
        Long habitacionId = reserva.getHabitacion().getId();
        if (habitacionId == null) {
            throw new IllegalArgumentException("El ID de la habitación es obligatorio.");
        }
        
        Optional<Habitacion> optionalHabitacion = habitacionRepository.findById(habitacionId);
        if (!optionalHabitacion.isPresent()) {
            throw new IllegalArgumentException("Habitación no encontrada");
        }
        Habitacion habitacion = optionalHabitacion.get();

        // 3. Validar disponibilidad
        if (!"Disponible".equals(habitacion.getEstado())) {
            throw new IllegalStateException("La habitación no está disponible.");
        }

        // 4. Cambiar estado de habitación
        habitacion.setEstado("Ocupada");
        habitacionRepository.save(habitacion);

        // 5. Persistir Reserva
        reserva.setHabitacion(habitacion);
        return reservaRepository.save(reserva);
    }

    public Huesped buscarHuespedPorDocumento(String documentoIdentidad) {
        return huespedRepository.findByDocumentoIdentidad(documentoIdentidad).orElse(null);
    }
}
