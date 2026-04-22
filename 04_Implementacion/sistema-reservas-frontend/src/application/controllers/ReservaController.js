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

    async registrarReserva(formData) {
        try {
            const response = await fetch("http://localhost:8081/api/reservas", {
                method: "POST",
                // El navegador setea automáticamente Content-Type: multipart/form-data con boundary
                body: formData
            });

            if (response.ok) {
                const reserva = await response.json();
                this.view.mostrarExito(`Registro exitoso. Reserva #${reserva.id} en estado PENDIENTE_PAGO. Redirigiendo al flujo de pago...`);
                
                // Redirección automática al flujo de pago (CU-03)
                setTimeout(() => {
                    console.log("Iniciando CU-03: Pago de Reserva");
                    alert("Redirigiendo a Pasarela de Pago para completar la reserva...");
                    // Aquí iría la redirección real:
                    // window.location.href = `/pago.html?id=${reserva.id}`;
                }, 1500);

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
