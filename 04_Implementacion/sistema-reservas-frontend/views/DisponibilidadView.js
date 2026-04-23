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
        lista.className = "lista";

        habitaciones.forEach(h => {
            const card = document.createElement("div");
            card.className = "card";
            const tipoClase = h.tipo.toLowerCase();

            card.innerHTML = `
            <div class="card-left">
        <div class="numero-box ${tipoClase}">${h.numero}</div>
        <div class="info">
            <p class="hab-num">Habitacion ${h.numero}</p>
            <p class="hab-tipo">${h.tipo}</p>
            <p class="hab-horario">${h.duracionHoras} horas</p>
        </div>
    </div>
    <div class="card-right">
        <span class="badge">Disponible</span>
        <div class="precio">
            <p class="precio-monto">Bs ${h.precio}</p>
            <p class="precio-label">${h.duracionHoras} hrs</p>
        </div>
        <button class="btn-reservar" data-id="${h.id}" data-numero="${h.numero}" data-tipo="${h.tipo}" data-precio="${h.precio}" data-duracion="${h.duracionHoras}">Reservar</button>
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
