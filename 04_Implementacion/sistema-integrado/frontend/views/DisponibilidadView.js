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
        if (!this.btnBuscar) return;
        this.btnBuscar.addEventListener("click", (e) => {
            const tipo = this.tipoSelect.value;
            const fecha = this.fechaInput.value;
            callback(tipo, fecha); //le avisa al controlador
        });
    }

    //Dibuja las tarjetas en el resultado-container
    renderizarHabitaciones(habitaciones){
        this.resultadoContainer.innerHTML = "";

        var titulo = document.createElement("h2");
        titulo.className = "grid-titulo";
        titulo.textContent = "Habitaciones disponibles";

        var lista = document.createElement("div");
        lista.className = "cliente-habitaciones-grid";

        habitaciones.forEach((h, index) => {
            const card = document.createElement("div");
            card.className = "hab-card cliente-hab-card disponible";
            card.style.animationDelay = (index * 0.05) + "s";
            card.setAttribute("data-id", h.id);
            card.setAttribute("data-numero", h.numero);
            card.setAttribute("data-tipo", h.tipo);
            card.setAttribute("data-precio", h.precio);
            card.setAttribute("data-duracion", h.duracionHoras);

            card.innerHTML = `
            <div class="hab-numero">${h.numero}</div>
            <div class="hab-tipo">${h.tipo}</div>
            <span class="hab-badge">Disponible</span>
            <div class="hab-precio-row">
                <span class="hab-precio">Bs ${h.precio}</span>
                <span class="hab-horas">${h.duracionHoras} hrs</span>
            </div>
            <button class="btn-reservar" type="button" data-id="${h.id}" data-numero="${h.numero}" data-tipo="${h.tipo}" data-precio="${h.precio}" data-duracion="${h.duracionHoras}">Seleccionar</button>
            `;

            lista.appendChild(card);
        });

        this.resultadoContainer.appendChild(titulo);
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
