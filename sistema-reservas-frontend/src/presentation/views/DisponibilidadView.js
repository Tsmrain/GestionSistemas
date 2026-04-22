class DisponibilidadView {
    constructor() {
        //aqui agarramos los "ganchos" del HTML que definimos con los id
        this.tipoSelect = document.getElementById("tipo-select");
        this.fechaInput = document.getElementById("fecha-input");
        this.btnBuscar = document.getElementById("btn-buscar");
        this.resultadoContainer = document.getElementById("resultado-container");
    }

    // El controlador llama a este método para saber cuando se hace click
    onBuscar(callback) {
        this.btnBuscar.addEventListener("click", (e) => {
            const tipo = this.tipoSelect.value;
            const fecha = this.fechaInput.value;
            callback(tipo, fecha); // le avisa al controlador
        });
    }

    // Dibuja las tarjetas en el resultado-container (mostrarResultados en el diagrama)
    mostrarResultados(habitaciones) {
        this.resultadoContainer.innerHTML = "";

        habitaciones.forEach(h => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
            <div class="card-left">
        <div class="numero-box ${h.tipo.toLowerCase()}">${h.numero}</div>
        <div class="info">
            <p class="hab-num">Habitacion ${h.numero}</p>
            <p class="hab-tipo">${h.tipo}</p>
        </div>
    </div>
    <div class="card-right">
        <span class="badge">Disponible</span>
        <div class="precio">
            <p class="precio-monto">Bs ${h.precioBase}</p>
            <p class="precio-label">${h.tipo.toLowerCase() === "super vip" ? "6 hrs" : "12 hrs"}</p>
        </div>
        <button class="btn-reservar" data-id="${h.id}" data-numero="${h.numero}" data-tipo="${h.tipo}" data-precio="${h.precioBase}">Reservar</button>
    </div>
            `;

            this.resultadoContainer.appendChild(card);
        });
    }

    //muestra mensaje de error
    mostrarError(mensaje){
        this.resultadoContainer.innerHTML = `
        <p class="error">${mensaje}</p>
        `;
    }

    //limpia todo antes de una nueva busqueda
    limpiar(){
        this.resultadoContainer.innerHTML = "";
    }
}