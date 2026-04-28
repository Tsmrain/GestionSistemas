package com.reservas.residencial.infrastructure.web.dto;

import com.reservas.residencial.application.dto.RegistroReservaCommand;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroReservaRequest {

    @NotBlank(message = "El nombre del huesped es obligatorio")
    private String nombre;

    private String ci;

    private String celular;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    @NotNull(message = "La cantidad de bloques es obligatoria")
    @Min(value = 1, message = "La cantidad de bloques debe ser al menos 1")
    private Integer cantidadBloques;

    @NotNull(message = "El ID de la habitacion es obligatorio")
    private Long habitacionId;

    public RegistroReservaCommand toCommand() {
        return new RegistroReservaCommand(
                nombre,
                ci,
                celular,
                fechaIngreso,
                cantidadBloques,
                habitacionId
        );
    }
}
