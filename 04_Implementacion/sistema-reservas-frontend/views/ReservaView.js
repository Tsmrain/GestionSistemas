class ReservaView {
    constructor() {
        this.resultadoContainer = document.getElementById("resultado-container");
        this.modal = null;
    }

    // Muestra el modal del formulario de reserva
    mostrarFormulario(habitacion) {
        // Crear el overlay del modal
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-reserva";

        overlay.innerHTML =
            '<div class="modal">' +
            '<button class="modal-close" id="btn-cerrar-modal">&times;</button>' +
            '<h2 class="modal-titulo">Registrar Reserva</h2>' +
            '<div class="modal-habitacion-info">' +
            '<div class="numero-box ' + habitacion.tipo.toLowerCase() + '">' + habitacion.numero + '</div>' +
            '<div>' +
            '<p class="hab-num">Habitacion ' + habitacion.numero + '</p>' +
            '<p class="hab-tipo">' + habitacion.tipo + ' - Bs ' + habitacion.precio + '</p>' +
            '<p class="hab-horario">' + habitacion.duracionHoras + ' horas</p>' +
            '</div>' +
            '</div>' +
            '<form id="form-reserva" class="form-reserva">' +
            '<input type="hidden" name="habitacionId" value="' + habitacion.id + '">' +
            '<input type="hidden" name="cantidadBloques" value="1">' +
            '<div class="form-group">' +
            '<label for="nombre">Nombre completo</label>' +
            '<input type="text" id="nombre" name="nombre" placeholder="Ej: Juan Perez" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="ci">Cedula de Identidad (CI)</label>' +
            '<input type="text" id="ci" name="ci" placeholder="Ej: 12345678" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="celular">Numero de Celular</label>' +
            '<input type="tel" id="celular" name="celular" placeholder="Ej: 70012345" required>' +
            '</div>' +
            '<div class="form-group">' +
            '<label for="fechaIngreso">Fecha de Ingreso</label>' +
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
            '<div id="form-error" class="form-error" style="display:none"></div>' +
            '<button type="submit" class="btn-confirmar" id="btn-confirmar">Confirmar Reserva</button>' +
            '</form>' +
            '</div>';

        document.body.appendChild(overlay);
        this.modal = overlay;

        // Configurar previews de fotos
        this._configurarPreview("fotoAnverso", "preview-anverso", "label-anverso");
        this._configurarPreview("fotoReverso", "preview-reverso", "label-reverso");

        // Cerrar modal
        document.getElementById("btn-cerrar-modal").addEventListener("click", function () {
            overlay.remove();
        });
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });

        // Setear fecha de hoy como mínimo
        var hoy = new Date().toISOString().split('T')[0];
        document.getElementById("fechaIngreso").setAttribute("min", hoy);
        document.getElementById("fechaIngreso").value = habitacion.fechaIngreso || hoy;
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
        btn.textContent = "Registrando...";
    }

    // Restaurar botón
    restaurarBoton() {
        var btn = document.getElementById("btn-confirmar");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Confirmar Reserva";
        }
    }

    // Mostrar éxito y cerrar
    mostrarExito(reserva) {
        if (this.modal) this.modal.remove();

        var exito = document.createElement("div");
        exito.className = "modal-overlay";
        exito.innerHTML =
            '<div class="modal modal-exito">' +
            '<div class="exito-icon">✅</div>' +
            '<h2>¡Reserva Registrada!</h2>' +
            '<p class="exito-detalle">Habitacion <strong>' + (reserva.habitacion ? reserva.habitacion.numero : '') + '</strong></p>' +
            '<p class="exito-detalle">Huesped: <strong>' + (reserva.huesped ? reserva.huesped.nombre : '') + '</strong></p>' +
            '<p class="exito-detalle">Monto total: <strong>Bs ' + reserva.montoTotal + '</strong></p>' +
            '<p class="exito-detalle">Estado: <strong>' + reserva.estado + '</strong></p>' +
            '<button class="btn-confirmar btn-pagar" data-reserva=\'' + JSON.stringify(reserva) + '\'>Proceder al Pago</button>' +

            '<button class="btn-confirmar" id="btn-cerrar-exito">Aceptar</button>' +
            '</div>';

        document.body.appendChild(exito);

        document.getElementById("btn-cerrar-exito").addEventListener("click", function () {
            exito.remove();
            window.location.reload();
        });
        exito.addEventListener("click", function (e) {
            if (e.target === exito) {
                exito.remove();
                window.location.reload();
            }
        });
    }
}
