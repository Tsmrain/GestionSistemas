class ReservaView {
    constructor() {
        this.resultadoContainer = document.getElementById("resultado-container");
        this.flujoContainer = document.getElementById("cliente-flujo-container");
        this.mostrarEstadoInicial();
    }

    // Muestra el formulario de reserva en la misma pantalla del cliente
    mostrarFormulario(habitacion, borrador) {
        borrador = borrador || {};
        var metodoPago = borrador.metodoPago || "QR_BNB";
        this.flujoContainer.innerHTML =
            '<div class="resumen-card" id="panel-reserva">' +
            '<h3>Tu reserva</h3>' +
            this._habitacionResumen(habitacion) +
            '<form id="form-reserva" class="form-reserva">' +
            '<input type="hidden" name="habitacionId" value="' + habitacion.id + '">' +
            '<input type="hidden" name="cantidadBloques" value="1">' +
            '<div class="form-group">' +
            '<label for="nombre">Nombre completo</label>' +
            '<input type="text" id="nombre" name="nombre" placeholder="Juan Pérez" value="' + this._escapeAttr(borrador.nombre) + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="ci">CI</label>' +
            '<input type="text" id="ci" name="ci" placeholder="12345678" value="' + this._escapeAttr(borrador.ci) + '" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="celular">Celular</label>' +
            '<input type="tel" id="celular" name="celular" placeholder="70012345" value="' + this._escapeAttr(borrador.celular) + '" required>' +
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
            '<input type="hidden" id="metodoPago" name="metodoPago" value="' + metodoPago + '">' +
            '<div class="metodos-pago">' +
            '<button class="metodo-btn ' + (metodoPago === "QR_BNB" ? "activo" : "") + '" type="button" data-metodo="QR_BNB">▦ QR BNB</button>' +
            '<button class="metodo-btn ' + (metodoPago === "EFECTIVO" ? "activo" : "") + '" type="button" data-metodo="EFECTIVO">Bs Efectivo</button>' +
            '</div>' +
            '<div class="total-row">' +
            '<span class="total-label">Total a pagar</span>' +
            '<span class="total-monto">Bs ' + habitacion.precio + '</span>' +
            '</div>' +
            '<div class="aviso-llegada">' +
            '<strong>Importante:</strong> una vez realizado el pago tienes 30 minutos para llegar al residencial. ' +
            'Si no llegas en ese plazo, el tiempo de la habitación empieza a correr desde la hora del pago.' +
            '</div>' +
            '<div id="form-error" class="form-error" style="display:none"></div>' +
            '<button type="submit" class="btn-confirmar" id="btn-confirmar">Confirmar reserva</button>' +
            '<div class="nota">Al confirmar, podrás generar el QR o registrar pago en efectivo según corresponda.</div>' +
            '</form>' +
            '</div>';

        // Configurar previews de fotos
        this._configurarPreview("fotoAnverso", "preview-anverso", "label-anverso");
        this._configurarPreview("fotoReverso", "preview-reverso", "label-reverso");
        this._configurarMetodoPago();
        this._restaurarArchivo("fotoAnverso", "preview-anverso", "label-anverso", borrador.fotoAnverso);
        this._restaurarArchivo("fotoReverso", "preview-reverso", "label-reverso", borrador.fotoReverso);

        // Setear fecha de hoy como mínimo (Local Time)
        const d = new Date();
        const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        document.getElementById("fechaIngreso").setAttribute("min", hoy);
        document.getElementById("fechaIngreso").value = borrador.fechaIngreso || habitacion.fechaIngreso || hoy;
        this._actualizarPasos("datos");
    }

    obtenerBorradorFormulario() {
        var form = document.getElementById("form-reserva");
        if (!form) return null;
        return {
            nombre: form.nombre.value,
            ci: form.ci.value,
            celular: form.celular.value,
            fechaIngreso: form.fechaIngreso.value,
            metodoPago: form.metodoPago.value,
            fotoAnverso: form.fotoAnverso.files[0] || null,
            fotoReverso: form.fotoReverso.files[0] || null
        };
    }

    _restaurarArchivo(inputId, previewId, labelId, archivo) {
        if (!archivo) return;
        var input = document.getElementById(inputId);
        var preview = document.getElementById(previewId);
        var label = document.getElementById(labelId);

        if (window.DataTransfer && input) {
            var dataTransfer = new DataTransfer();
            dataTransfer.items.add(archivo);
            input.files = dataTransfer.files;
        }

        if (preview && label) {
            var reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = "block";
                label.style.display = "none";
            };
            reader.readAsDataURL(archivo);
        }
    }

    _escapeAttr(valor) {
        return String(valor || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    _configurarMetodoPago() {
        var inputMetodo = document.getElementById("metodoPago");
        document.querySelectorAll(".metodo-btn").forEach(function (boton) {
            boton.addEventListener("click", function () {
                document.querySelectorAll(".metodo-btn").forEach(function (item) {
                    item.classList.remove("activo");
                });
                boton.classList.add("activo");
                inputMetodo.value = boton.getAttribute("data-metodo");
            });
        });
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
        var card = document.querySelector('.cliente-hab-card[data-id="' + habitacionId + '"]');
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
            var badge = card.querySelector(".hab-badge");
            if (badge) badge.textContent = "Disponible";
        });

        var card = document.querySelector('.cliente-hab-card[data-id="' + habitacionId + '"]');
        if (card) {
            card.classList.add("seleccionada");
            var boton = card.querySelector(".btn-reservar");
            if (boton) {
                boton.classList.add("seleccionado");
                boton.textContent = "Seleccionada";
            }
            var badge = card.querySelector(".hab-badge");
            if (badge) badge.textContent = "Seleccionada";
        }
        this._actualizarPasos("seleccionar");
    }

    mostrarEstadoInicial() {
        this.flujoContainer.innerHTML =
            '<div class="resumen-card reserva-vacia">' +
            '<h3>Tu reserva</h3>' +
            '<p>Selecciona una habitación para completar tus datos.</p>' +
            '</div>';
        this._actualizarPasos("seleccionar");
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
        var orden = ["seleccionar", "datos", "pagar", "confirmado"];
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
