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
        this.celularInput = document.getElementById("huesped-celular");
        this.fotoAnversoInput = document.getElementById("foto-anverso");
        this.fotoReversoInput = document.getElementById("foto-reverso");
        
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
            <strong>Habitación:</strong> ${habitacion.numero} (${habitacion.tipo.nombreTipo})<br>
            <strong>Fecha:</strong> ${fecha}<br>
            <strong>Precio:</strong> Bs ${habitacion.tipo.precioBase}
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
            const formData = new FormData();
            formData.append("huespedNombre", this.nombreInput.value);
            formData.append("huespedDocumentoIdentidad", this.documentoInput.value);
            formData.append("huespedCelular", this.celularInput.value);
            formData.append("habitacionId", this.habitacionActual.id);
            formData.append("fechaEntrada", this.fechaActual);
            formData.append("fechaSalida", this.fechaActual); // Simplificado para este demo
            formData.append("montoTotal", this.habitacionActual.tipo.precioBase);
            
            if (this.fotoAnversoInput.files[0]) {
                formData.append("fotoAnverso", this.fotoAnversoInput.files[0]);
            }
            if (this.fotoReversoInput.files[0]) {
                formData.append("fotoReverso", this.fotoReversoInput.files[0]);
            }
            
            callback(formData);
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
            this.celularInput.value = huesped.celular;
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
