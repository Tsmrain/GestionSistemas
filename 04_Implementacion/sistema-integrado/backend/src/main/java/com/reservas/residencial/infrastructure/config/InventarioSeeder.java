package com.reservas.residencial.infrastructure.config;

import com.reservas.residencial.domain.models.Habitacion;
import com.reservas.residencial.domain.models.HabitacionInventario;
import com.reservas.residencial.domain.models.InventarioItem;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHabitacionInventarioRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaHabitacionRepository;
import com.reservas.residencial.infrastructure.persistence.jpa.JpaInventarioItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Order(10) // Para que se ejecute después del seeder de habitaciones
public class InventarioSeeder implements CommandLineRunner {

    private final JpaInventarioItemRepository itemRepository;
    private final JpaHabitacionRepository habitacionRepository;
    private final JpaHabitacionInventarioRepository habitacionInventarioRepository;

    @Override
    public void run(String... args) {
        // Seeding Catalog Items
        InventarioItem toalla = crearItemSiNoExiste("Toalla de Baño", "REUSABLE", 100, 30.0, 40.0, "🧼");
        InventarioItem sabana = crearItemSiNoExiste("Sábana Matrimonial", "REUSABLE", 100, 40.0, 50.0, "🛏️");
        InventarioItem almohada = crearItemSiNoExiste("Almohada Cómoda", "REUSABLE", 100, 20.0, 30.0, "🛌");
        InventarioItem control = crearItemSiNoExiste("Control de TV", "REUSABLE", 20, 40.0, 50.0, "📺");
        InventarioItem refresco = crearItemSiNoExiste("Refresco 500ml", "VENTA", 50, 5.0, 8.0, "🥤");
        InventarioItem chocolate = crearItemSiNoExiste("Chocolate Fino", "VENTA", 30, 7.0, 12.0, "🍫");
        InventarioItem papas = crearItemSiNoExiste("Papas Fritas", "VENTA", 40, 6.0, 10.0, "🍟");
        InventarioItem papel = crearItemSiNoExiste("Papel Higiénico", "CORTESIA", 200, 2.0, 0.0, "🧻");
        InventarioItem tele = crearItemSiNoExiste("Televisor Smart 32\"", "ACTIVO_FIJO", 20, 1000.0, 0.0, "🖥️");
        InventarioItem cama = crearItemSiNoExiste("Cama Matrimonial", "ACTIVO_FIJO", 20, 1500.0, 0.0, "🛏️");

        // Seeding Habitaciones
        List<Habitacion> habitaciones = habitacionRepository.findAll();
        for (Habitacion hab : habitaciones) {
            asociarItemSiNoExiste(hab, toalla, 2);
            asociarItemSiNoExiste(hab, sabana, 2);
            asociarItemSiNoExiste(hab, almohada, 2);
            asociarItemSiNoExiste(hab, control, 1);
            asociarItemSiNoExiste(hab, papel, 1);
            asociarItemSiNoExiste(hab, tele, 1);
            asociarItemSiNoExiste(hab, cama, 1);
        }
    }

    private InventarioItem crearItemSiNoExiste(String nombre, String tipo, Integer stock, Double compra, Double venta, String emoji) {
        return itemRepository.findByNombre(nombre)
                .orElseGet(() -> itemRepository.save(new InventarioItem(nombre, tipo, stock, compra, venta, emoji)));
    }

    private void asociarItemSiNoExiste(Habitacion hab, InventarioItem item, Integer cantidadEsperada) {
        if (habitacionInventarioRepository.findByHabitacionIdAndItemId(hab.getId(), item.getId()).isPresent()) {
            return;
        }
        HabitacionInventario habInv = new HabitacionInventario(hab, item, cantidadEsperada, cantidadEsperada);
        habitacionInventarioRepository.save(habInv);
    }
}
