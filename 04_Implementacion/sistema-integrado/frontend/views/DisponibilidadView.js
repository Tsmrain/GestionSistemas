class DisponibilidadView {
    constructor() {
        //aqui agarramos los "ganchos" del HTML que definimos con los id
        this.tipoSelect = document.getElementById("tipo-select");
        this.fechaInput = document.getElementById("fecha-input");
        this.btnBuscar = document.getElementById("btn-buscar");
        this.resultadoContainer = document.getElementById("resultado-container");
    }

    //El controlador llama a este metodo para saber cuando se hace click
    onBuscar(callback) {
        this.btnBuscar.addEventListener("click", (e) => {
            const tipo = this.tipoSelect.value;
            const fecha = this.fechaInput.value;
            callback(tipo, fecha); //le avisa al controlador
        });
    }

    //Dibuja las tarjetas en el resultado-container
    renderizarHabitaciones(habitaciones){
        this.resultadoContainer.innerHTML = "";

        var lista = document.createElement("div");
        lista.className = "hab-lista";

        habitaciones.forEach((h, index) => {
            const card = document.createElement("div");
            card.className = "hab-card card";
            card.style.animationDelay = (index * 0.05) + "s";
            const tipoClase = h.tipo.toLowerCase();

            card.innerHTML = `
            <div class="hab-left card-left">
                <div class="hab-num-box numero-box ${tipoClase}">${h.numero}</div>
                <div class="hab-info info">
                    <p class="hab-nombre hab-num">Habitación ${h.numero}</p>
                    <p class="hab-tipo">${h.tipo} · ${h.duracionHoras} horas</p>
                </div>
            </div>
            <div class="hab-right card-right">
                <div class="hab-precio precio-monto">Bs ${h.precio}</div>
                <div class="hab-horas precio-label">${h.duracionHoras} hrs</div>
                <button class="btn-seleccionar btn-reservar" data-id="${h.id}" data-numero="${h.numero}" data-tipo="${h.tipo}" data-precio="${h.precio}" data-duracion="${h.duracionHoras}">Seleccionar</button>
            </div>
            `;

            lista.appendChild(card);
        });

        this.resultadoContainer.appendChild(lista);
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
