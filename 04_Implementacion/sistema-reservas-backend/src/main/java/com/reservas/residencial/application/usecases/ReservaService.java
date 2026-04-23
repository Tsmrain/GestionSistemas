package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.HabitacionResumenResponse;
import com.reservas.residencial.application.dto.RegistroReservaCommand;
import com.reservas.residencial.application.dto.ReservaResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.dto.HuespedResumenResponse;
import com.reservas.residencial.application.ports.out.FileStoragePort;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.application.ports.out.HuespedRepositoryPort;
import com.reservas.residencial.application.ports.out.ReservaRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.Huesped;
import com.reservas.residencial.domain.models.Reserva;
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

    private static final String ESTADO_CANCELADA = "CANCELADA";
    private static final String ESTADO_PENDIENTE_PAGO = "PENDIENTE_PAGO";

    private final ReservaRepositoryPort reservaRepository;
    private final HabitacionRepositoryPort habitacionRepository;
    private final HuespedRepositoryPort huespedRepository;
    private final FileStoragePort fileStoragePort;

    @Transactional
    public ReservaResponse registrarReserva(RegistroReservaCommand command,
                                            MultipartFile fotoAnverso,
                                            MultipartFile fotoReverso) {
        Habitacion habitacion = habitacionRepository.findById(command.habitacionId())
                .orElseThrow(() -> new IllegalArgumentException("Habitacion no encontrada"));

        if (!habitacion.estaDisponible()) {
            throw new IllegalStateException("La habitacion no esta disponible para reservas.");
        }

        if (reservaRepository.existsActiveByHabitacionAndFecha(command.habitacionId(),
                command.fechaIngreso(), ESTADO_CANCELADA)) {
            throw new IllegalStateException("La habitacion ya esta reservada para la fecha seleccionada.");
        }

        Huesped huesped = new Huesped();
        huesped.setNombre(command.nombre());
        huesped.setCi(command.ci());
        huesped.setCelular(command.celular());

        if (fotoAnverso != null && !fotoAnverso.isEmpty()) {
            huesped.setUrlFotoAnverso(fileStoragePort.guardar(fotoAnverso));
        }
        if (fotoReverso != null && !fotoReverso.isEmpty()) {
            huesped.setUrlFotoReverso(fileStoragePort.guardar(fotoReverso));
        }

        Huesped huespedGuardado = huespedRepository.save(huesped);

        Reserva reserva = new Reserva();
        reserva.setHuesped(huespedGuardado);
        reserva.setHabitacion(habitacion);
        reserva.setFechaIngreso(command.fechaIngreso());
        reserva.setCantidadBloques(command.cantidadBloques());
        reserva.setMontoTotal(habitacion.getPrecioBase() * command.cantidadBloques());
        reserva.setEstado(ESTADO_PENDIENTE_PAGO);

        return toResponse(reservaRepository.save(reserva));
    }

    private ReservaResponse toResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getEstado(),
                reserva.getFechaIngreso(),
                reserva.getCantidadBloques(),
                reserva.getMontoTotal(),
                new HuespedResumenResponse(
                        reserva.getHuesped().getId(),
                        reserva.getHuesped().getNombre(),
                        reserva.getHuesped().getCi(),
                        reserva.getHuesped().getCelular()
                ),
                new HabitacionResumenResponse(
                        reserva.getHabitacion().getId(),
                        reserva.getHabitacion().getNumero(),
                        new TipoHabitacionResponse(
                                reserva.getHabitacion().getTipo().getId(),
                                reserva.getHabitacion().getTipo().getNombreTipo(),
                                reserva.getHabitacion().getTipo().getPrecioBase(),
                                reserva.getHabitacion().getTipo().getDuracionHoras(),
                                reserva.getHabitacion().getTipo().getDescripcion()
                        )
                )
        );
    }
}
