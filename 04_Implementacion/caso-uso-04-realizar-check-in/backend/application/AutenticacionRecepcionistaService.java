package com.reservas.residencial.application.usecases;

import com.reservas.residencial.application.dto.RecepcionistaResponse;
import com.reservas.residencial.application.ports.out.RecepcionistaRepositoryPort;
import com.reservas.residencial.domain.models.Recepcionista;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutenticacionRecepcionistaService {

    private final RecepcionistaRepositoryPort recepcionistaRepository;

    @Transactional(readOnly = true)
    public RecepcionistaResponse login(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Ingrese usuario y contrasena.");
        }

        Recepcionista recepcionista = recepcionistaRepository.findByUsernameActivo(username.trim())
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contrasena incorrectos."));

        if (!recepcionista.getPassword().equals(password)) {
            throw new IllegalArgumentException("Usuario o contrasena incorrectos.");
        }

        return new RecepcionistaResponse(
                recepcionista.getId(),
                recepcionista.getNombre(),
                recepcionista.getUsername()
        );
    }

    @Transactional
    public RecepcionistaResponse registrar(String nombre, String username, String password) {
        if (nombre == null || nombre.isBlank() || username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Ingrese nombre, usuario y contrasena.");
        }
        if (password.length() < 4) {
            throw new IllegalArgumentException("La contrasena debe tener al menos 4 caracteres.");
        }
        String usernameLimpio = username.trim();
        if (recepcionistaRepository.findByUsernameActivo(usernameLimpio).isPresent()) {
            throw new IllegalArgumentException("Ya existe una recepcionista con ese usuario.");
        }

        Recepcionista recepcionista = new Recepcionista();
        recepcionista.setNombre(nombre.trim());
        recepcionista.setUsername(usernameLimpio);
        recepcionista.setPassword(password);
        recepcionista.setActivo(true);

        Recepcionista guardada = recepcionistaRepository.save(recepcionista);
        return new RecepcionistaResponse(
                guardada.getId(),
                guardada.getNombre(),
                guardada.getUsername()
        );
    }
}
