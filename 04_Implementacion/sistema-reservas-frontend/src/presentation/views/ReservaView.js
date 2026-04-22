/**
 * @referencia: 03_Diseño/CU-02-Registrar-Reserva/CU-02_Clases_Diseño.mmd
 */
class ReservaView {
    constructor() {
        this.modal = document.getElementById("reserva-modal");
        this.form = document.getElementById("reserva-form");
        this.btnCerrar = document.getElementById("btn-cerrar-modal");
        this.detallesHabitacion = document.getElementById("detalles-habitacion");
        
        // Campos del formulario (Sincronizados con el DCD y Backend)
        this.nombreInput = document.getElementById("huesped-nombre");
        this.celularInput = document.getElementById("huesped-celular");
        this.bloquesInput = document.getElementById("cantidad-bloques");
        this.fotoAnversoInput = document.getElementById("foto-anverso");
        this.fotoReversoInput = document.getElementById("foto-reverso");
        
        this.setupEvents();
    }

    setupEvents() {
        this.btnCerrar.onclick = () => this.ocultar();
        window.onclick = (event) => {
            if (event.target == this.modal) this.ocultar();
        };

        // Actualizar precio total al cambiar bloques
        this.bloquesInput.onchange = () => {
            if (this.habitacionActual) {
                const total = this.habitacionActual.tipo.precioBase * this.bloquesInput.value;
                this.actualizarDetalles(total);
            }
        };
    }

    mostrar(habitacion, fecha) {
        this.habitacionActual = habitacion;
        this.fechaActual = fecha;
        this.actualizarDetalles(habitacion.tipo.precioBase);
        this.modal.style.display = "block";
    }

    actualizarDetalles(montoTotal) {
        this.detallesHabitacion.innerHTML = `
            <strong>Habitación:</strong> ${this.habitacionActual.numero} (${this.habitacionActual.tipo.nombreTipo})<br>
            <strong>Fecha de Ingreso:</strong> ${this.fechaActual}<br>
            <strong>Precio Base:</strong> Bs ${this.habitacionActual.tipo.precioBase}<br>
            <strong>Monto Total:</strong> <span style="color: #4facfe; font-weight: bold;">Bs ${montoTotal}</span>
        `;
    }

    ocultar() {
        this.modal.style.display = "none";
        this.form.reset();
    }

    // @mensaje: registrarReserva(datos)
    onRegistrar(callback) {
        this.form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData();
            
            const montoTotal = this.habitacionActual.tipo.precioBase * this.bloquesInput.value;

            // Nombres de campos exactos según requerimiento y DCD
            formData.append("nombre", this.nombreInput.value);
            formData.append("celular", this.celularInput.value);
            formData.append("fechaIngreso", this.fechaActual);
            formData.append("cantidadBloques", this.bloquesInput.value);
            formData.append("habitacionId", this.habitacionActual.id);
            formData.append("montoTotal", montoTotal);
            
            if (this.fotoAnversoInput.files[0]) {
                formData.append("fotoAnverso", this.fotoAnversoInput.files[0]);
            }
            if (this.fotoReversoInput.files[0]) {
                formData.append("fotoReverso", this.fotoReversoInput.files[0]);
            }
            
            callback(formData);
        };
    }

    mostrarExito(mensaje) {
        alert("✅ " + mensaje);
        this.ocultar();
    }

    mostrarError(mensaje) {
        alert("❌ " + mensaje);
    }
}
