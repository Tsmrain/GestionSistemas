package com.reservas.residencial.infrastructure.controllers.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroReservaRequest {
    @NotBlank(message = "El nombre del huésped es obligatorio")
    private String nombre;

    private String celular;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    private LocalDate fechaIngreso;

    @NotNull(message = "La cantidad de bloques es obligatoria")
    private Integer cantidadBloques;

    @NotNull(message = "El ID de la habitación es obligatorio")
    private Long habitacionId;

    @NotNull(message = "El monto total es obligatorio")
    private Double montoTotal;
}
