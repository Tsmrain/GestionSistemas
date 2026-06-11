package com.reservas.residencial.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GuardarHabitacionRequest(
    @NotBlank(message = "El número de habitación no puede estar vacío")
    String numero,
    
    @NotNull(message = "El tipo de habitación es requerido")
    Long tipoId,
    
    @NotBlank(message = "El estado actual es requerido")
    String estadoActual
) {}
