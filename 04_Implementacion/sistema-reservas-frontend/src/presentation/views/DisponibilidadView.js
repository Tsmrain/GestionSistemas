/**
 * @referencia: 03_Diseño/CU-01-Consultar-Disponibilidad/CU-01_Clases_Diseño.mmd
 */
class DisponibilidadView {
    constructor() {
        this.selectTipo = document.getElementById("tipo-select");
        this.inputFecha = document.getElementById("fecha-input");
        this.btnBuscar = document.getElementById("btn-buscar");
        this.container = document.getElementById("resultado-container");
    }

    onBuscar(callback) {
        this.btnBuscar.onclick = () => {
            const tipo = this.selectTipo.value;
            const fecha = this.inputFecha.value;
            callback(tipo, fecha);
        };
    }

    mostrarResultados(habitaciones) {
        this.container.innerHTML = "";
        habitaciones.forEach(h => {
            const card = document.createElement("div");
            card.className = "habitacion-card";
            card.innerHTML = `
                <h3>Habitación ${h.numero}</h3>
                <p>Tipo: ${h.tipo.nombreTipo}</p>
                <p>Estado: ${h.estadoActual}</p>
                <p class="precio">Bs ${h.tipo.precioBase}</p>
                <button class="btn-reservar" data-id="${h.id}">Reservar Ahora</button>
            `;
            this.container.appendChild(card);
        });
    }

    limpiar() {
        this.container.innerHTML = "<p>Buscando...</p>";
    }

    mostrarError(msj) {
        this.container.innerHTML = `<p class="error">${msj}</p>`;
    }
}