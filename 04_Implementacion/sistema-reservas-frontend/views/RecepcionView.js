class RecepcionView {

    constructor() {
        this.grid = document.getElementById("habitaciones-grid");
        this.buscarInput = document.getElementById("buscar-reserva");
        this.buscarBtn = document.getElementById("btn-buscar-reserva");
        this.resultados = document.getElementById("resultados-reserva");
    }

    // Publico — renderiza todas las habitaciones en el grid
    renderizarHabitaciones(habitaciones) {
        this.grid.innerHTML = "";
        this.#actualizarContadores(habitaciones);

        habitaciones.forEach(hab => {
            var card = document.createElement("div");
            card.className = "hab-card " + this.#obtenerClase(hab.estado);
            card.setAttribute("data-id", hab.id);
            card.setAttribute("data-estado", hab.estado);

            card.innerHTML =
                '<div class="hab-numero">' + hab.numero + '</div>' +
                '<div class="hab-tipo">' + hab.tipo.nombreTipo + '</div>' +
                '<div class="hab-badge">' + this.#obtenerEtiqueta(hab.estado) + '</div>' +
                '<div class="hab-hora">' + this.#obtenerInfo(hab) + '</div>' +
                this.#obtenerAccion(hab.estado);

            this.grid.appendChild(card);
        });
    }

    // Publico — escucha click en una habitacion
    onClickHabitacion(callback) {
        var self = this;
        this.grid.addEventListener("click", function (e) {
            var botonAccion = e.target.closest(".hab-accion");
            var card = e.target.closest(".hab-card");
            if (card) {
                var id = card.getAttribute("data-id");
                var estado = card.getAttribute("data-estado");
                var accion = botonAccion ? botonAccion.getAttribute("data-accion") : null;
                callback(id, estado, accion);
            }
        });
    }

    onBuscarReserva(callback) {
        var self = this;
        if (!this.buscarBtn || !this.buscarInput) return;

        this.buscarBtn.addEventListener("click", function () {
            callback(self.buscarInput.value.trim());
        });

        this.buscarInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") callback(self.buscarInput.value.trim());
        });
    }

    renderizarResultadosBusqueda(reservas, callback) {
        if (!this.resultados) return;
        this.resultados.innerHTML = "";

        if (!reservas || reservas.length === 0) {
            this.resultados.innerHTML = '<div class="resultado-vacio">No se encontro una reserva valida. Intenta con codigo, CI o nombre.</div>';
            return;
        }

        reservas.forEach(function (reserva) {
            var item = document.createElement("button");
            item.type = "button";
            item.className = "resultado-reserva";
            item.innerHTML =
                '<span><strong>#' + reserva.id + '</strong> ' + reserva.huesped.nombre + '</span>' +
                '<span>Hab. ' + reserva.habitacion.numero + ' · ' + reserva.estado + '</span>';
            item.addEventListener("click", function () {
                callback(reserva);
            });
            this.resultados.appendChild(item);
        }, this);
    }

    // Publico — muestra el modal de check-in con los datos de la reserva
    mostrarModalCheckin(reserva) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-checkin";

        var fotoAnverso = reserva.huesped.urlFotoAnverso || "";
        var fotoReverso = reserva.huesped.urlFotoReverso || "";
        var horaIngreso = reserva.horaIngreso
            ? new Date(reserva.horaIngreso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
            : "--:--";
        var horaSalida = reserva.horaSalidaEstimada
            ? new Date(reserva.horaSalidaEstimada).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
            : "--:--";

        overlay.innerHTML =
            '<div class="modal">' +
            '<h2 class="modal-titulo">Realizar Check-in</h2>' +
            '<div class="checkin-fotos">' +
            (fotoAnverso ? '<img class="checkin-foto" src="' + fotoAnverso + '" alt="Carnet anverso">' : '<div class="checkin-foto-placeholder">Sin foto anverso</div>') +
            (fotoReverso ? '<img class="checkin-foto" src="' + fotoReverso + '" alt="Carnet reverso">' : '<div class="checkin-foto-placeholder">Sin foto reverso</div>') +
            '</div>' +
            '<div class="checkin-resumen">' +
            '<div class="checkin-resumen-fila"><span>Codigo</span><span>#' + reserva.id + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Estado</span><span>' + reserva.estado + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Metodo de pago</span><span>' + (reserva.metodoPago || "Pendiente") + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Habitacion</span><span>' + reserva.habitacion.numero + ' - ' + reserva.habitacion.tipo.nombreTipo + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Huesped</span><span>' + reserva.huesped.nombre + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>CI</span><span>' + reserva.huesped.ci + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Celular</span><span>' + reserva.huesped.celular + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Fecha ingreso</span><span>' + reserva.fechaIngreso + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Hora ingreso</span><span>' + horaIngreso + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Hora salida estimada</span><span>' + horaSalida + '</span></div>' +
            '<div class="checkin-resumen-fila"><span>Monto pagado</span><span>Bs ' + reserva.montoTotal + '</span></div>' +
            '</div>' +
            '<label class="acompanante-toggle"><input type="checkbox" id="tiene-acompanante"> Registrar acompanante</label>' +
            '<div id="acompanante-form" class="acompanante-form" style="display:none">' +
            '<input id="acompanante-nombre" type="text" placeholder="Nombre del acompanante">' +
            '<input id="acompanante-ci" type="text" placeholder="CI del acompanante">' +
            '<input id="acompanante-fecha-nacimiento" type="date" aria-label="Fecha de nacimiento del acompanante">' +
            '<input id="acompanante-celular" type="tel" placeholder="Celular del acompanante (opcional)">' +
            '</div>' +
            '<div class="checkin-botones">' +
            (reserva.estado === "PENDIENTE_PAGO" ? '<button class="btn-pago-efectivo" id="btn-pago-efectivo-checkin">Registrar pago efectivo</button>' : '') +
            '<button class="btn-checkin" id="btn-confirmar-checkin" ' + (reserva.estado === "PENDIENTE_PAGO" ? "disabled" : "") + '>Confirmar Check-in</button>' +
            '<button class="btn-cancelar-checkin" id="btn-cancelar-checkin">Identidad no coincide</button>' +
            '</div>' +
            '<div id="checkin-error" class="form-error" style="display:none"></div>' +
            '</div>';

        document.body.appendChild(overlay);

        var toggle = document.getElementById("tiene-acompanante");
        var form = document.getElementById("acompanante-form");
        if (toggle && form) {
            toggle.addEventListener("change", function () {
                form.style.display = toggle.checked ? "grid" : "none";
            });
        }

        // Cerrar al click fuera
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // Publico — escucha confirmacion del check-in
    onConfirmarCheckin(callback) {
        var btn = document.getElementById("btn-confirmar-checkin");
        if (btn) btn.addEventListener("click", callback);
    }

    // Publico — escucha cancelacion por identidad
    onCancelarCheckin(callback) {
        var btn = document.getElementById("btn-cancelar-checkin");
        if (btn) btn.addEventListener("click", callback);
    }

    onRegistrarPagoEfectivo(callback) {
        var btn = document.getElementById("btn-pago-efectivo-checkin");
        if (btn) btn.addEventListener("click", callback);
    }

    obtenerDatosCheckin() {
        var formData = new FormData();
        var tieneAcompanante = document.getElementById("tiene-acompanante");

        if (tieneAcompanante && tieneAcompanante.checked) {
            var nombre = document.getElementById("acompanante-nombre").value.trim();
            var ci = document.getElementById("acompanante-ci").value.trim();
            var fechaNacimiento = document.getElementById("acompanante-fecha-nacimiento").value;
            var celular = document.getElementById("acompanante-celular").value.trim();

            if (!nombre || !ci || !fechaNacimiento) {
                this.mostrarError("Ingresa nombre, CI y fecha de nacimiento del acompanante.");
                return null;
            }

            formData.append("acompananteNombre", nombre);
            formData.append("acompananteCi", ci);
            formData.append("acompananteFechaNacimiento", fechaNacimiento);
            if (celular) formData.append("acompananteCelular", celular);
        }

        formData.append("recepcionista", "Recepcionista 1");
        return formData;
    }

    // Publico — muestra exito del check-in
    mostrarExitoCheckin(reserva) {
        var overlay = document.getElementById("modal-checkin");
        if (overlay) overlay.remove();

        var exito = document.createElement("div");
        exito.className = "modal-overlay";
        var horaSalida = reserva.horaSalidaEstimada
            ? new Date(reserva.horaSalidaEstimada).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
            : "--:--";

        exito.innerHTML =
            '<div class="modal modal-exito">' +
            '<div class="exito-icon">✅</div>' +
            '<h2>Check-in Realizado</h2>' +
            '<p class="exito-detalle">Habitacion: <strong>' + reserva.habitacion.numero + '</strong></p>' +
            '<p class="exito-detalle">Huesped: <strong>' + reserva.huesped.nombre + '</strong></p>' +
            (reserva.acompanante ? '<p class="exito-detalle">Acompanante: <strong>' + reserva.acompanante.nombre + '</strong></p>' : '') +
            '<p class="exito-detalle">Hora de ingreso: <strong>' + (reserva.horaIngreso ? new Date(reserva.horaIngreso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }) : "--:--") + '</strong></p>' +
            '<p class="exito-detalle">Hora de salida: <strong>' + horaSalida + '</strong></p>' +
            '<button class="btn-confirmar" id="btn-cerrar-exito-checkin">Aceptar</button>' +
            '</div>';

        document.body.appendChild(exito);

        document.getElementById("btn-cerrar-exito-checkin").addEventListener("click", function () {
            exito.remove();
            window.location.reload();
        });
    }

    // Publico — muestra error
    mostrarError(mensaje) {
        var errorDiv = document.getElementById("checkin-error");
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = "block";
        }
    }

    // Privado — obtiene la clase CSS segun el estado
    #obtenerClase(estado) {
        var clases = {
            "DISPONIBLE": "disponible",
            "PENDIENTE_PAGO": "pendiente",
            "PAGADA": "confirmada",
            "ACTIVA": "ocupada",
            "LIMPIEZA": "limpieza",
            "MANTENIMIENTO": "limpieza"
        };
        return clases[estado] || "disponible";
    }

    // Privado — obtiene la etiqueta segun el estado
    #obtenerEtiqueta(estado) {
        var etiquetas = {
            "DISPONIBLE": "Disponible",
            "PENDIENTE_PAGO": "Pend. Pago",
            "PAGADA": "Confirmada",
            "ACTIVA": "Ocupada",
            "LIMPIEZA": "En Limpieza",
            "MANTENIMIENTO": "Mantenimiento"
        };
        return etiquetas[estado] || estado;
    }

    // Privado — obtiene info extra segun el estado
    #obtenerInfo(hab) {
        if (hab.estado === "ACTIVA" && hab.horaSalidaEstimada) {
            return "Sale: " + new Date(hab.horaSalidaEstimada).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
        }
        if (hab.estado === "PAGADA" && hab.reservaActual) {
            return "Check-in pendiente";
        }
        return "";
    }

    #obtenerAccion(estado) {
        if (estado === "DISPONIBLE" || estado === "ACTIVA") {
            return '<button class="hab-accion" data-accion="limpieza" type="button">Limpieza</button>';
        }
        if (estado === "LIMPIEZA" || estado === "MANTENIMIENTO") {
            return '<button class="hab-accion" data-accion="disponible" type="button">Disponible</button>';
        }
        return "";
    }

    // Privado — actualiza los contadores
    #actualizarContadores(habitaciones) {
        var contadores = { disponible: 0, pendiente: 0, confirmada: 0, ocupada: 0, limpieza: 0 };

        habitaciones.forEach(hab => {
            if (hab.estado === "DISPONIBLE") contadores.disponible++;
            else if (hab.estado === "PENDIENTE_PAGO") contadores.pendiente++;
            else if (hab.estado === "PAGADA") contadores.confirmada++;
            else if (hab.estado === "ACTIVA") contadores.ocupada++;
            else if (hab.estado === "LIMPIEZA" || hab.estado === "MANTENIMIENTO") contadores.limpieza++;
        });

        document.getElementById("count-disponible").textContent = contadores.disponible;
        document.getElementById("count-pendiente").textContent = contadores.pendiente;
        document.getElementById("count-confirmada").textContent = contadores.confirmada;
        document.getElementById("count-ocupada").textContent = contadores.ocupada;
        document.getElementById("count-limpieza").textContent = contadores.limpieza;
    }
}
