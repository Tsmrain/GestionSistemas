package com.residencial.GestionSistemas.service;

import com.residencial.GestionSistemas.model.Habitacion;
import com.residencial.GestionSistemas.repository.HabitacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DisponibilidadService {

    @Autowired
    private HabitacionRepository repository;

    public List<Habitacion> consultar(String tipo, LocalDate fechaIngreso) {
        // Regla de Jira: Validar que la fecha ingresada no sea menor a la actual
        if (fechaIngreso.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de ingreso no puede ser menor a la fecha actual.");
        }
        return repository.findDisponiblesPorTipo(tipo);
    }
}