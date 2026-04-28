package com.reservas.residencial.infrastructure.web.dto;

import com.reservas.residencial.application.dto.ConsultarDisponibilidadQuery;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaDisponibilidadRequest {

    @NotNull(message = "La fecha es obligatoria")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fecha;

    private String tipoNombre;

    public ConsultarDisponibilidadQuery toQuery() {
        return new ConsultarDisponibilidadQuery(fecha, tipoNombre);
    }
}
