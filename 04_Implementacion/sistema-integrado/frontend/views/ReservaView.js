class ReservaView {
    constructor() {
        this.resultadoContainer = document.getElementById("resultado-container");
        this.flujoContainer = document.getElementById("cliente-flujo-container");
        this.mostrarEstadoInicial();
    }

    // Muestra el formulario de reserva en la misma pantalla del cliente
    mostrarFormulario(habitacion) {
        this.flujoContainer.innerHTML =
            '<div class="resumen-card" id="panel-reserva">' +
            '<h3>Tu reserva</h3>' +
            this._habitacionResumen(habitacion) +
            '<form id="form-reserva" class="form-reserva">' +
            '<input type="hidden" name="habitacionId" value="' + habitacion.id + '">' +
            '<input type="hidden" name="cantidadBloques" value="1">' +
            '<div class="form-group">' +
            '<label for="nombre">Nombre completo</label>' +
            '<input type="text" id="nombre" name="nombre" placeholder="Juan Pérez" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="ci">CI</label>' +
            '<input type="text" id="ci" name="ci" placeholder="12345678" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="celular">Celular</label>' +
            '<input type="tel" id="celular" name="celular" placeholder="70012345" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="fechaIngreso">Fecha de ingreso</label>' +
            '<input type="date" id="fechaIngreso" name="fechaIngreso" required>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group form-group-half">' +
            '<label for="fotoAnverso">Foto CI - Anverso</label>' +
            '<div class="file-upload" id="drop-anverso">' +
            '<input type="file" id="fotoAnverso" name="fotoAnverso" accept="image/*" required>' +
            '<div class="file-upload-label" id="label-anverso">' +
            '<span class="file-icon">&#128247;</span>' +
            '<span>Seleccionar foto</span>' +
            '</div>' +
            '<img class="file-preview" id="preview-anverso" style="display:none">' +
            '</div>' +
            '</div>' +
            '<div class="form-group form-group-half">' +
            '<label for="fotoReverso">Foto CI - Reverso</label>' +
            '<div class="file-upload" id="drop-reverso">' +
            '<input type="file" id="fotoReverso" name="fotoReverso" accept="image/*" required>' +
            '<div class="file-upload-label" id="label-reverso">' +
            '<span class="file-icon">&#128247;</span>' +
            '<span>Seleccionar foto</span>' +
            '</div>' +
            '<img class="file-preview" id="preview-reverso" style="display:none">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<span class="metodo-label">Método de pago</span>' +
            '<div class="metodos-pago">' +
            '<button class="metodo-btn activo" type="button">▦ QR BNB</button>' +
            '<button class="metodo-btn" type="button">Bs Efectivo</button>' +
            '</div>' +
            '<div class="total-row">' +
            '<span class="total-label">Total a pagar</span>' +
            '<span class="total-monto">Bs ' + habitacion.precio + '</span>' +
            '</div>' +
            '<div id="form-error" class="form-error" style="display:none"></div>' +
            '<button type="submit" class="btn-confirmar" id="btn-confirmar">Confirmar reserva</button>' +
            '<div class="nota">Al confirmar, podrás generar el QR o registrar pago en efectivo según corresponda.</div>' +
            '</form>' +
            '</div>';

        // Configurar previews de fotos
        this._configurarPreview("fotoAnverso", "preview-anverso", "label-anverso");
        this._configurarPreview("fotoReverso", "preview-reverso", "label-reverso");

        // Setear fecha de hoy como mínimo (Local Time)
        const d = new Date();
        const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        document.getElementById("fechaIngreso").setAttribute("min", hoy);
        document.getElementById("fechaIngreso").value = habitacion.fechaIngreso || hoy;
        this._actualizarPasos("datos");
    }

    _configurarPreview(inputId, previewId, labelId) {
        var input = document.getElementById(inputId);
        var preview = document.getElementById(previewId);
        var label = document.getElementById(labelId);

        input.addEventListener("change", function () {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.style.display = "block";
                    label.style.display = "none";
                };
                reader.readAsDataURL(input.files[0]);
            }
        });
    }

    // Escuchar envío del formulario
    onSubmit(callback) {
        var form = document.getElementById("form-reserva");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var formData = new FormData(form);
            callback(formData);
        });
    }

    // Mostrar error en el formulario
    mostrarError(mensaje) {
        var errorDiv = document.getElementById("form-error");
        errorDiv.textContent = mensaje;
        errorDiv.style.display = "block";
    }

    // Mostrar estado de carga
    mostrarCargando() {
        var btn = document.getElementById("btn-confirmar");
        btn.disabled = true;
        btn.textContent = "Registrando reserva...";
    }

    // Restaurar botón
    restaurarBoton() {
        var btn = document.getElementById("btn-confirmar");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Confirmar Reserva";
        }
    }

    // Mostrar éxito en el mismo flujo del cliente
    mostrarExito(reserva) {
        this.flujoContainer.innerHTML =
            '<div class="flujo-panel modal-exito">' +
            '<div class="exito-icon">✅</div>' +
            '<h2>¡Reserva Registrada!</h2>' +
            '<p class="exito-aviso">Tu reserva queda pendiente hasta completar el pago.</p>' +
            '<p class="exito-detalle">Habitacion <strong>' + (reserva.habitacion ? reserva.habitacion.numero : '') + '</strong></p>' +
            '<p class="exito-detalle">Huesped: <strong>' + (reserva.huesped ? reserva.huesped.nombre : '') + '</strong></p>' +
            '<p class="exito-detalle">Monto total: <strong>Bs ' + reserva.montoTotal + '</strong></p>' +
            '<p class="exito-detalle">Estado: <strong>' + reserva.estado + '</strong></p>' +
            '<button class="btn-confirmar btn-pagar" data-reserva=\'' + JSON.stringify(reserva) + '\'>Proceder al Pago</button>' +
            '<button class="btn-volver-pago btn-cancelar-reserva" data-reserva-id="' + reserva.id + '" type="button">Cancelar reserva</button>' +
            '</div>';

        this._actualizarPasos("pagar");
    }

    limpiarFlujo() {
        this.mostrarEstadoInicial();
    }

    ocultarHabitacionReservada(habitacionId) {
        var boton = document.querySelector('.btn-reservar[data-id="' + habitacionId + '"]');
        var card = boton ? boton.closest(".hab-card") : null;
        if (card) {
            card.classList.add("habitacion-en-reserva");
        }
    }

    mostrarHabitacionesEnReserva() {
        document.querySelectorAll(".habitacion-en-reserva").forEach(function(card) {
            card.classList.remove("habitacion-en-reserva");
        });
    }

    marcarHabitacionSeleccionada(habitacionId) {
        document.querySelectorAll(".hab-card").forEach(function(card) {
            card.classList.remove("seleccionada");
            var boton = card.querySelector(".btn-reservar");
            if (boton) {
                boton.classList.remove("seleccionado");
                boton.textContent = "Seleccionar";
            }
        });

        var boton = document.querySelector('.btn-reservar[data-id="' + habitacionId + '"]');
        var card = boton ? boton.closest(".hab-card") : null;
        if (card) {
            card.classList.add("seleccionada");
            boton.classList.add("seleccionado");
            boton.textContent = "✓ Seleccionada";
        }
        this._actualizarPasos("seleccionar");
    }

    mostrarEstadoInicial() {
        this.flujoContainer.innerHTML =
            '<div class="resumen-card reserva-vacia">' +
            '<h3>Tu reserva</h3>' +
            '<p>Busca disponibilidad y selecciona una habitación para completar tus datos.</p>' +
            '</div>';
        this._actualizarPasos("buscar");
    }

    _habitacionResumen(habitacion) {
        return '<div class="resumen-hab">' +
            '<div class="resumen-num ' + habitacion.tipo.toLowerCase() + '">' + habitacion.numero + '</div>' +
            '<div class="resumen-info">' +
            '<p class="resumen-nombre">Habitación ' + habitacion.numero + ' · ' + habitacion.tipo + '</p>' +
            '<p class="resumen-detalle">' + habitacion.duracionHoras + ' horas · Bs ' + habitacion.precio + '</p>' +
            '</div>' +
            '</div>';
    }

    _actualizarPasos(actual) {
        var orden = ["buscar", "seleccionar", "datos", "pagar", "confirmado"];
        var indiceActual = orden.indexOf(actual);
        document.querySelectorAll(".step").forEach(function(step) {
            var indice = orden.indexOf(step.getAttribute("data-step"));
            var num = step.querySelector(".step-num");
            step.classList.remove("activo", "completado");
            if (indice < indiceActual) {
                step.classList.add("completado");
                if (num) num.textContent = "✓";
            } else if (indice === indiceActual) {
                step.classList.add("activo");
                if (num) num.textContent = String(indice + 1);
            } else if (num) {
                num.textContent = String(indice + 1);
            }
        });

        document.querySelectorAll(".step-line").forEach(function(line, index) {
            line.classList.toggle("completado", index < indiceActual);
        });
    }
}
