package com.reservas.residencial.infrastructure.config;

import com.reservas.residencial.domain.models.Recepcionista;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaRecepcionistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecepcionistaSeeder implements CommandLineRunner {

    private final JpaRecepcionistaRepository recepcionistaRepository;

    @Override
    public void run(String... args) {
        crearSiNoExiste("Recepcionista Turno Manana", "recepcion1", "123456");
        crearSiNoExiste("Recepcionista Turno Tarde", "recepcion2", "123456");
    }

    private void crearSiNoExiste(String nombre, String username, String password) {
        if (recepcionistaRepository.findByUsernameAndActivoTrue(username).isPresent()) {
            return;
        }
        Recepcionista recepcionista = new Recepcionista();
        recepcionista.setNombre(nombre);
        recepcionista.setUsername(username);
        recepcionista.setPassword(password);
        recepcionista.setActivo(true);
        recepcionistaRepository.save(recepcionista);
    }
}
