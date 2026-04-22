/**
 * Vista que representa el Formulario de Reserva (CU-02).
 * Aplicando Low Representational Gap: FormularioReserva.
 * Sincronizado con el Modelo de Dominio.
 */
class ReservaView {
    constructor() {
        this.modal = document.getElementById("reserva-modal");
        this.form = document.getElementById("reserva-form");
        this.btnCerrar = document.getElementById("btn-cerrar-modal");
        this.detallesHabitacion = document.getElementById("detalles-habitacion");
        
        // Campos del formulario (IDs sincronizados)
        this.nombreInput = document.getElementById("huesped-nombre");
        this.documentoInput = document.getElementById("documento-identidad");
        this.contactoInput = document.getElementById("contacto");
        
        this.setupEvents();
    }

    setupEvents() {
        this.btnCerrar.onclick = () => this.ocultar();
        window.onclick = (event) => {
            if (event.target == this.modal) this.ocultar();
        };
    }

    mostrar(habitacion, fecha) {
        this.habitacionActual = habitacion;
        this.fechaActual = fecha;
        this.detallesHabitacion.innerHTML = `
            <strong>Habitación:</strong> ${habitacion.numero} (${habitacion.tipo})<br>
            <strong>Fecha:</strong> ${fecha}<br>
            <strong>Precio:</strong> Bs ${habitacion.precioBase}
        `;
        this.modal.style.display = "block";
    }

    ocultar() {
        this.modal.style.display = "none";
        this.form.reset();
    }

    onConfirmar(callback) {
        this.form.onsubmit = (e) => {
            e.preventDefault();
            const datos = {
                nombre: this.nombreInput.value,
                documentoIdentidad: this.documentoInput.value,
                contacto: this.contactoInput.value,
                habitacionId: this.habitacionActual.id,
                fecha: this.fechaActual,
                montoTotal: this.habitacionActual.precioBase
            };
            callback(datos);
        };
    }

    onBuscarHuesped(callback) {
        this.documentoInput.onblur = () => {
            if (this.documentoInput.value) {
                callback(this.documentoInput.value);
            }
        };
    }

    autocompletarHuesped(huesped) {
        if (huesped) {
            this.nombreInput.value = huesped.nombre;
            this.contactoInput.value = huesped.contacto;
        }
    }

    mostrarExito(mensaje) {
        alert("✅ " + mensaje);
        this.ocultar();
    }

    mostrarError(mensaje) {
        alert("❌ " + mensaje);
    }
}
