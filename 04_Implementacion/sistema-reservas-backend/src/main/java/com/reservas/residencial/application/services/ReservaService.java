package com.reservas.residencial.application.services;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
import com.reservas.residencial.infrastructure.controllers.dto.RegistroReservaRequest;
import com.reservas.residencial.infrastructure.repositories.HabitacionRepository;
import com.reservas.residencial.infrastructure.repositories.HuespedRepository;
import com.reservas.residencial.infrastructure.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * @referencia: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final HuespedRepository huespedRepository;
    private final FileStorageService fileStorageService;

    // @mensaje: 2: registrarReserva(dto, files) | @patron: Controlador
    @Transactional
    public Reserva registrarReserva(RegistroReservaRequest dto, MultipartFile fotoAnverso, MultipartFile fotoReverso) {
        // 1. Validar disponibilidad (Uso de método privado según DCD)
        // @mensaje: 2.1: validarDisponibilidad(habitacionId) | @patron: Experto
        Habitacion habitacion = validarDisponibilidad(dto.getHabitacionId());

        // 2. Gestionar Huésped
        // @patron: Fabricación Pura (Manejo de archivos)
        Huesped huesped = new Huesped();
        huesped.setNombre(dto.getNombre());
        huesped.setCi(dto.getCi());
        huesped.setCelular(dto.getCelular());
        
        if (fotoAnverso != null && !fotoAnverso.isEmpty()) {
            huesped.setUrlFotoAnverso(fileStorageService.guardar(fotoAnverso));
        }
        if (fotoReverso != null && !fotoReverso.isEmpty()) {
            huesped.setUrlFotoReverso(fileStorageService.guardar(fotoReverso));
        }
        
        huesped = huespedRepository.save(huesped);

        // 3. Bloquear habitación
        // @mensaje: 2.2: bloquear() | @patron: Experto en Información
        habitacion.bloquear();
        habitacionRepository.save(habitacion);

        // 4. Crear Reserva
        // @patron: Creador (Larman)
        Reserva reserva = new Reserva();
        reserva.setHuesped(huesped);
        reserva.setHabitacion(habitacion);
        reserva.setFechaIngreso(dto.getFechaIngreso());
        reserva.setCantidadBloques(dto.getCantidadBloques());
        reserva.setMontoTotal(dto.getMontoTotal());
        reserva.setEstado("PENDIENTE_PAGO");
        
        return reservaRepository.save(reserva);
    }

    private Habitacion validarDisponibilidad(Long habitacionId) {
        Habitacion habitacion = habitacionRepository.findById(habitacionId)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada"));
        
        if (!"Disponible".equals(habitacion.getEstadoActual())) {
            throw new IllegalStateException("La habitación no está disponible.");
        }
        return habitacion;
    }
}
