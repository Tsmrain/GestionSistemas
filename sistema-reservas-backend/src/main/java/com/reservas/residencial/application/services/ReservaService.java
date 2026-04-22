package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;

    /**
     * Implementación del Contrato de Operación: registrarReserva
     * Sigue los principios de Larman (Expert) y Mannino (Integridad/Transaccionalidad)
     */
    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        // Validación defensiva (Null Safety)
        if (reserva == null || reserva.getHabitacion() == null || reserva.getHabitacion().getId() == null) {
            throw new IllegalArgumentException("La reserva y la habitación asociada son obligatorias.");
        }

        // 1. Buscar la habitación asociada (Experto en Información)
        Habitacion habitacion = habitacionRepository.findById(reserva.getHabitacion().getId())
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada"));

        // 2. Validar Precondición: Estado debe ser 'Disponible' (Mannino - Última línea de defensa)
        if (!"Disponible".equals(habitacion.getEstado())) {
            throw new IllegalStateException("La habitación " + habitacion.getNumero() + " no está disponible para reserva.");
        }

        // 3. Modificación de Atributo: Cambiar estado a 'Ocupada' (Postcondición Larman)
        habitacion.setEstado("Ocupada");
        habitacionRepository.save(habitacion);

        // 4. Formación de Asociación y Persistencia (Postcondición Larman)
        reserva.setHabitacion(habitacion);
        return reservaRepository.save(reserva);
    }
}
