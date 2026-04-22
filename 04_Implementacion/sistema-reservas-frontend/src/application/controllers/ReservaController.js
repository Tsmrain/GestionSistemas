/**
 * Controlador para Registrar Reserva (CU-02).
 * Aplicando Low Representational Gap: RegistrarReservaController.
 * Sincronizado con el Modelo de Dominio.
 */
class ReservaController {
    constructor() {
        this.view = new ReservaView();
        
        // Manejador para buscar huésped por Documento (2a - Cliente ya registrado)
        this.view.onBuscarHuesped(async (documentoIdentidad) => {
            try {
                const response = await fetch(`http://localhost:8081/api/reservas/huesped/${documentoIdentidad}`);
                if (response.ok) {
                    const huesped = await response.json();
                    this.view.autocompletarHuesped(huesped);
                }
            } catch (error) {
                console.error("Error al buscar huésped", error);
            }
        });

        // Manejador para confirmar la reserva
        this.view.onConfirmar(async (datos) => {
            await this.registrarReserva(datos);
        });
    }

    async registrarReserva(datos) {
        try {
            const requestBody = {
                huespedNombre: datos.nombre,
                huespedDocumentoIdentidad: datos.documentoIdentidad,
                huespedContacto: datos.contacto,
                habitacionId: datos.habitacionId,
                fechaEntrada: datos.fecha,
                fechaSalida: datos.fecha, // Por simplicidad, un solo día en este demo
                montoTotal: datos.montoTotal
            };

            const response = await fetch("http://localhost:8081/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const reserva = await response.json();
                this.view.mostrarExito(`Reserva registrada con éxito. ID: ${reserva.id}`);
                // Recargar disponibilidad para reflejar que la habitación está ocupada
                if (window.disponibilidadController) {
                    window.disponibilidadController.consultarDisponibilidad();
                }
            } else {
                const errorMsg = await response.text();
                this.view.mostrarError(errorMsg);
            }
        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    abrirFormulario(habitacion, fecha) {
        this.view.mostrar(habitacion, fecha);
    }
}

// Instancia global para ser accedida desde DisponibilidadController
window.reservaController = new ReservaController();
