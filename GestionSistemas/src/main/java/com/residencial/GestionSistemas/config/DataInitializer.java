package com.residencial.GestionSistemas.config;

import com.residencial.GestionSistemas.model.Habitacion;
import com.residencial.GestionSistemas.repository.HabitacionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(HabitacionRepository habitacionRepository) {
        return args -> {
            if (habitacionRepository.count() == 0) {
                Habitacion h1 = new Habitacion();
                h1.setNumero("101");
                h1.setTipo("Estándar");
                h1.setPrecio(150.0);
                h1.setEstado("Disponible");
                habitacionRepository.save(h1);

                Habitacion h2 = new Habitacion();
                h2.setNumero("102");
                h2.setTipo("Estándar");
                h2.setPrecio(150.0);
                h2.setEstado("Disponible");
                habitacionRepository.save(h2);

                Habitacion h3 = new Habitacion();
                h3.setNumero("201");
                h3.setTipo("VIP");
                h3.setPrecio(300.0);
                h3.setEstado("Disponible");
                habitacionRepository.save(h3);

                Habitacion h4 = new Habitacion();
                h4.setNumero("202");
                h4.setTipo("VIP");
                h4.setPrecio(300.0);
                h4.setEstado("Ocupada");
                habitacionRepository.save(h4);

                Habitacion h5 = new Habitacion();
                h5.setNumero("301");
                h5.setTipo("SuperVIP");
                h5.setPrecio(600.0);
                h5.setEstado("Disponible");
                habitacionRepository.save(h5);
            }
        };
    }
}
