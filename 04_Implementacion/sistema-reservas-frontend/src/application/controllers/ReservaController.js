/**
 * @referencia: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
class ReservaController {
    constructor() {
        this.view = new ReservaView();
        
        // Manejador para confirmar la reserva
        this.view.onRegistrar(async (datos) => {
            await this.registrarReserva(datos);
        });
    }

    // @mensaje: 2: registrarReserva(formData) | @patron: Controlador
    async registrarReserva(formData) {
        try {
            const response = await fetch("http://localhost:8081/api/reservas", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const reserva = await response.json();
                this.view.mostrarExito(`Registro exitoso. Reserva #${reserva.id} en estado PENDIENTE_PAGO.`);
                
                setTimeout(() => {
                    alert("Redirigiendo a Pasarela de Pago (CU-03) para completar la reserva...");
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

window.reservaController = new ReservaController();
