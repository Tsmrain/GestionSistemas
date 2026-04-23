package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import com.reservas.residencial.application.dto.HabitacionDisponibleResponse;
import com.reservas.residencial.application.dto.TipoHabitacionResponse;
import com.reservas.residencial.application.ports.out.HabitacionRepositoryPort;
import com.reservas.residencial.domain.models.Habitacion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private final HabitacionRepositoryPort habitacionRepository;

    public List<HabitacionDisponibleResponse> consultarDisponibilidad(ConsultarDisponibilidadQuery query) {
        String tipoNormalizado = normalizarTipo(query.tipoNombre());
        List<Habitacion> habitaciones = tipoNormalizado == null
                ? habitacionRepository.findDisponibles(query.fecha())
                : habitacionRepository.findDisponibles(query.fecha(), tipoNormalizado);

        return habitaciones.stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalizarTipo(String tipoNombre) {
        if (tipoNombre == null) {
            return null;
        }

        String tipoNormalizado = tipoNombre.trim();
        if (tipoNormalizado.isBlank()
                || "Todas".equalsIgnoreCase(tipoNormalizado)
                || "Todas las habitaciones".equalsIgnoreCase(tipoNormalizado)) {
            return null;
        }

        return tipoNormalizado;
    }

    private HabitacionDisponibleResponse toResponse(Habitacion habitacion) {
        return new HabitacionDisponibleResponse(
                habitacion.getId(),
                habitacion.getNumero(),
                habitacion.getEstadoActual(),
                new TipoHabitacionResponse(
                        habitacion.getTipo().getId(),
                        habitacion.getTipo().getNombreTipo(),
                        habitacion.getTipo().getPrecioBase(),
                        habitacion.getTipo().getDuracionHoras(),
                        habitacion.getTipo().getDescripcion()
                )
        );
    }
}
