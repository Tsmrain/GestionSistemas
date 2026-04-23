package com.reservas.residencial.infrastructure.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiRootController {

    @GetMapping
    public Map<String, String> status() {
        return Map.of(
            "status", "UP",
            "message", "Sistema de Reservas API is running",
            "version", "1.0.0"
        );
    }
}
