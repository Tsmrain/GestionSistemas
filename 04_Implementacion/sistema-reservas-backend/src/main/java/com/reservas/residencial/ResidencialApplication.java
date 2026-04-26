package com.reservas.residencial;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class ResidencialApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResidencialApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // Establecer la zona horaria por defecto para Bolivia (UTC-4)
        TimeZone.setDefault(TimeZone.getTimeZone("America/La_Paz"));
    }
}
