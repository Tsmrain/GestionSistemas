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
                '<div class="hab-numero">' + this.#escapeHtml(hab.numero) + '</div>' +
                '<div class="hab-tipo">' + this.#escapeHtml(hab.tipo.nombreTipo) + '</div>' +
                '<div class="hab-badge">' + this.#escapeHtml(this.#obtenerEtiqueta(hab.estado)) + '</div>' +
                '<div class="hab-hora">' + this.#obtenerInfo(hab) + '</div>' +
                this.#obtenerAlertasHabitacion(hab) +
                '<div class="hab-admin-buttons">' +
                    '<button class="hab-admin-btn edit" title="Editar Habitación">✏️</button>' +
                    '<button class="hab-admin-btn delete" title="Eliminar Habitación">🗑️</button>' +
                '</div>' +
                this.#obtenerAccion(hab.estado);

            this.grid.appendChild(card);
        });
    }

    renderizarCentroControl(habitaciones, incidencias) {
        var panel = document.getElementById("centro-control-recepcion");
        if (!panel) return;

        var ocupadas = habitaciones.filter(h => h.estado === "ACTIVA").length;
        var mantenimiento = habitaciones.filter(h => h.estado === "MANTENIMIENTO").length;
        var incidenciasPendientes = (incidencias || []).filter(i => i.estado === "PENDIENTE");
        var habitacionesConAlerta = incidenciasPendientes
            .map(i => i.numeroHabitacion)
            .filter((numero, index, arr) => arr.indexOf(numero) === index)
            .slice(0, 4);

        panel.innerHTML = `
            <article class="control-card">
                <span class="control-label">Operación ahora</span>
                <strong>${ocupadas} habitaciones ocupadas</strong>
                <p>Al abrir una tarjeta se ve huésped, accesorios esperados, faltantes, daños y consumos.</p>
            </article>
            <article class="control-card">
                <span class="control-label">Trazabilidad</span>
                <strong>${incidenciasPendientes.length} incidencias pendientes</strong>
                <p>${habitacionesConAlerta.length ? "Revisar Hab. " + habitacionesConAlerta.join(", ") : "Sin daños activos reportados."}</p>
            </article>
            <article class="control-card">
                <span class="control-label">Disponibilidad real</span>
                <strong>${mantenimiento} bloqueadas por mantenimiento</strong>
                <p>Una habitación dañada no vuelve a disponible hasta resolver la incidencia.</p>
            </article>
        `;
    }

    // Publico — escucha click en una habitacion
    onClickHabitacion(callback) {
        var self = this;
        this.grid.addEventListener("click", function (e) {
            var adminBtn = e.target.closest(".hab-admin-btn");
            if (adminBtn) return; // Evitar el flujo ordinario si se hizo clic en botones de edición o borrado

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
            var fotoAnverso = this._assetUrl(reserva.huesped.urlFotoAnverso || "");
            var fotoReverso = this._assetUrl(reserva.huesped.urlFotoReverso || "");
            var carnetHtml =
                '<span style="display:flex; align-items:center; gap:8px;">' +
                (fotoAnverso ? '<img src="' + fotoAnverso + '" alt="CI anverso" style="width:46px; height:32px; object-fit:cover; border-radius:6px; border:1px solid #ddd;">' : '<span style="font-size:10px; color:#999;">Sin anverso</span>') +
                (fotoReverso ? '<img src="' + fotoReverso + '" alt="CI reverso" style="width:46px; height:32px; object-fit:cover; border-radius:6px; border:1px solid #ddd;">' : '<span style="font-size:10px; color:#999;">Sin reverso</span>') +
                '</span>';
            item.innerHTML =
                '<span><strong>#' + reserva.id + '</strong> ' + reserva.huesped.nombre + '</span>' +
                '<span>Hab. ' + reserva.habitacion.numero + ' · ' + reserva.estado + '</span>' +
                carnetHtml;
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

        var fotoAnverso = this._assetUrl(reserva.huesped.urlFotoAnverso || "");
        var fotoReverso = this._assetUrl(reserva.huesped.urlFotoReverso || "");
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
        return clases[estado] || "personalizado";
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

    #obtenerAlertasHabitacion(hab) {
        if (!hab.incidenciasPendientes) return "";
        return '<div class="hab-alerta">' + hab.incidenciasPendientes + ' incidencia(s)</div>';
    }

    #obtenerAccion(estado) {
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

    onAdminAccionHabitacion(callback) {
        this.grid.addEventListener("click", function (e) {
            var btnEdit = e.target.closest(".hab-admin-btn.edit");
            var btnDelete = e.target.closest(".hab-admin-btn.delete");
            var card = e.target.closest(".hab-card");
            if (card) {
                var id = card.getAttribute("data-id");
                var numero = card.querySelector(".hab-numero").textContent;
                var tipo = card.querySelector(".hab-tipo").textContent;
                var estado = card.getAttribute("data-estado");
                
                if (btnEdit) {
                    callback(id, "edit", { numero: numero, tipo: tipo, estado: estado });
                } else if (btnDelete) {
                    callback(id, "delete", { numero: numero, tipo: tipo, estado: estado });
                }
            }
        });
    }

    mostrarModalHabitacion(tipos, habitacionData, callback) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-habitacion";
        
        var esEdicion = !!habitacionData;
        var titulo = esEdicion ? "Editar Habitación" : "Nueva Habitación";
        var numeroVal = esEdicion ? habitacionData.numero : "";
        var tipoIdVal = esEdicion ? habitacionData.tipoId : "";
        var estadoVal = this.#estadoHabitacionLegible(esEdicion ? habitacionData.estado : "Disponible");
        var estadosCatalogo = this.#obtenerCatalogoEstadosHabitacion();
        if (estadoVal && !estadosCatalogo.includes(estadoVal)) {
            estadosCatalogo.push(estadoVal);
        }
        var opcionesEstados = estadosCatalogo
            .map(estado => `<option value="${this.#escapeHtml(estado)}" ${estado === estadoVal ? "selected" : ""}>${this.#escapeHtml(estado)}</option>`)
            .join("");

        var opcionesTipos = tipos.map(t => 
            `<option value="${t.id}" ${tipoIdVal == t.id ? "selected" : ""}>${t.nombreTipo} (Bs ${t.precioBase})</option>`
        ).join("");

        overlay.innerHTML = `
            <div class="modal">
                <h2 class="modal-titulo">${titulo}</h2>
                <form id="form-habitacion" style="display: flex; flex-direction: column; gap: 14px; text-align: left; margin-top: 15px;">
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="hab-form-numero" style="font-size: 12px; font-weight: 600; color: #555;">Número de Habitación</label>
                        <input id="hab-form-numero" type="text" value="${numeroVal}" placeholder="Ej. 108" required style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="hab-form-tipo" style="font-size: 12px; font-weight: 600; color: #555;">Tipo de Habitación</label>
                        <select id="hab-form-tipo" required style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <option value="">Seleccione un tipo...</option>
                            ${opcionesTipos}
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="hab-form-estado" style="font-size: 12px; font-weight: 600; color: #555;">Estado Actual</label>
                        <select id="hab-form-estado" required style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            ${opcionesEstados}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end;">
                        <button type="button" id="btn-cancelar-hab-form" style="background: #e0e0e0; color: #333; height: 40px;">Cancelar</button>
                        <button type="submit" style="background: #7F77DD; color: #fff; height: 40px;">Guardar</button>
                    </div>
                    <div id="hab-form-error" class="form-error" style="display:none; color: #c0392b; font-size: 12px; margin-top: 5px;"></div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        var form = document.getElementById("form-habitacion");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            var num = document.getElementById("hab-form-numero").value.trim();
            var tipoId = document.getElementById("hab-form-tipo").value;
            var estado = document.getElementById("hab-form-estado").value;
            callback({ numero: num, tipoId: parseInt(tipoId), estadoActual: estado });
        });

        document.getElementById("btn-cancelar-hab-form").addEventListener("click", function() {
            overlay.remove();
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    mostrarFormError(mensaje) {
        var err = document.getElementById("hab-form-error");
        if (err) {
            err.textContent = mensaje;
            err.style.display = "block";
        }
    }

    cerrarModalHabitacion() {
        var modal = document.getElementById("modal-habitacion");
        if (modal) modal.remove();
    }

    mostrarConfirmacion(mensaje, onConfirmar) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-confirmacion";

        overlay.innerHTML = `
            <div class="modal modal-confirm" style="text-align: center; max-width: 400px; padding: 24px;">
                <h2 class="modal-titulo" style="font-size: 18px; font-weight: 600; color: #1a1a1a;">Confirmar eliminación</h2>
                <p style="margin: 15px 0 20px; color: #555; font-size: 14px; line-height: 1.5;">${mensaje}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button type="button" id="btn-cancelar-confirm" style="background: #e2e8f0; color: #475569; height: 38px; padding: 0 16px; font-weight: 500; font-size: 12px; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s;">Cancelar</button>
                    <button type="button" id="btn-aceptar-confirm" style="background: #ef4444; color: #fff; height: 38px; padding: 0 16px; font-weight: 500; font-size: 12px; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s;">Eliminar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-confirm").addEventListener("click", function () {
            overlay.remove();
        });

        document.getElementById("btn-aceptar-confirm").addEventListener("click", function () {
            overlay.remove();
            onConfirmar();
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    mostrarMensaje(titulo, mensaje, tipo = "exito") {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-mensaje";
        
        var icon = tipo === "exito" ? "✅" : "⚠️";
        var btnBg = tipo === "exito" ? "#7F77DD" : "#ef4444";

        overlay.innerHTML = `
            <div class="modal" style="text-align: center; max-width: 360px; padding: 24px;">
                <div style="font-size: 36px; margin-bottom: 10px;">${icon}</div>
                <h2 class="modal-titulo" style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${titulo}</h2>
                <p style="margin: 12px 0 20px; color: #555; font-size: 13px; line-height: 1.4;">${mensaje}</p>
                <button type="button" id="btn-cerrar-mensaje" style="background: ${btnBg}; color: #fff; height: 38px; width: 100%; font-weight: 500; font-size: 12px; border: none; border-radius: 8px; cursor: pointer;">Aceptar</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cerrar-mensaje").addEventListener("click", function () {
            overlay.remove();
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // Renderiza el listado de egresos, el catálogo de inventario y la lista de incidencias
    renderizarFinanzasYInventario(reporte, items, incidencias, periodo, onResolverIncidencia, onEditarItem, onEliminarItem) {
        document.getElementById("finanzas-ingresos").textContent = "Bs " + (reporte.totalIngresos || 0).toFixed(2);
        document.getElementById("finanzas-egresos").textContent = "Bs " + (reporte.totalEgresos || 0).toFixed(2);
        document.getElementById("finanzas-balance").textContent = "Bs " + (reporte.saldoNeto || 0).toFixed(2);
        var periodoLabel = document.getElementById("finanzas-periodo-label");
        var ingresosLabel = document.getElementById("finanzas-ingresos-label");
        var egresosLabel = document.getElementById("finanzas-egresos-label");
        var balanceLabel = document.getElementById("finanzas-balance-label");
        var etiquetaCorta = periodo && periodo.etiquetaCorta ? periodo.etiquetaCorta : "Periodo";
        if (periodoLabel) {
            periodoLabel.textContent = (periodo && periodo.etiqueta ? periodo.etiqueta : "Resumen financiero")
                + " · " + (periodo ? periodo.fechaInicio + " a " + periodo.fechaFin : "");
        }
        if (ingresosLabel) ingresosLabel.textContent = "Ingresos de " + etiquetaCorta;
        if (egresosLabel) egresosLabel.textContent = "Egresos de " + etiquetaCorta;
        if (balanceLabel) balanceLabel.textContent = "Caja Neta de " + etiquetaCorta;
        var detalleIngresos = document.getElementById("finanzas-ingresos-detalle");
        if (detalleIngresos) {
            detalleIngresos.textContent = "Alojamiento Bs " + (reporte.ingresosAlojamiento || 0).toFixed(2)
                + " · Consumos Bs " + (reporte.ingresosConsumosReserva || 0).toFixed(2)
                + " · Ventas Bs " + (reporte.ingresosVentasDirectas || 0).toFixed(2);
        }

        var egresosLista = document.getElementById("egresos-lista");
        egresosLista.innerHTML = "";
        if (!reporte.egresosRecientes || reporte.egresosRecientes.length === 0) {
            egresosLista.innerHTML = '<div style="color: #888; text-align: center; padding: 15px;">No hay egresos registrados.</div>';
        } else {
            reporte.egresosRecientes.forEach(e => {
                var itemDiv = document.createElement("div");
                itemDiv.style.cssText = "padding: 8px 10px; background: #fafafa; border-radius: 6px; border-left: 3px solid #ef4444; display: flex; justify-content: space-between; align-items: center;";
                var fechaStr = new Date(e.fecha).toLocaleDateString("es-BO") + " " + new Date(e.fecha).toLocaleTimeString("es-BO", {hour: "2-digit", minute:"2-digit"});
                
                var compUrl = this._assetUrl(e.urlComprobante || "");
                var compHtml = compUrl ? ` <a href="${compUrl}" target="_blank" style="text-decoration:none;">📄</a>` : "";
                var destinoHtml = e.destinoDestinatario ? ` · Destino: ${e.destinoDestinatario}` : "";

                itemDiv.innerHTML = `
                    <div>
                        <strong>Bs ${e.monto.toFixed(2)}</strong> - <span style="color:#555;">${e.descripcion}</span>
                        <div style="font-size: 10px; color:#aaa; margin-top:2px;">Categoría: ${e.categoria}${destinoHtml} · Por: ${e.recepcionista} · ${fechaStr}${compHtml}</div>
                    </div>
                `;
                egresosLista.appendChild(itemDiv);
            });
        }

        var tablaInv = document.getElementById("inventario-items-tabla");
        tablaInv.innerHTML = "";
        items.forEach(item => {
            var row = document.createElement("tr");
            row.style.cssText = "border-bottom: 1px solid #eee; height: 40px;";
            row.innerHTML = `
                <td style="padding: 8px; font-size: 18px;">${item.emoji || "📦"}</td>
                <td style="padding: 8px;"><strong>${item.nombre}</strong></td>
                <td style="padding: 8px; font-size: 11px; color:#666;">${item.tipo}</td>
                <td style="padding: 8px; text-align: right; font-weight:600;">${item.stockActual}</td>
                <td style="padding: 8px; text-align: right; color:#555;">${item.stockEnUso || 0}</td>
                <td style="padding: 8px; text-align: right; font-weight:700; color:${(item.stockDisponible || 0) <= 0 ? "#c0392b" : "#2E7D32"};">${item.stockDisponible || 0}</td>
                <td style="padding: 8px; text-align: right; color:#555;">Bs ${(item.precioCompra || 0).toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color:#555;">Bs ${(item.precioVenta || 0).toFixed(2)}</td>
                <td style="padding: 8px; text-align: center;">
                    <button class="btn-editar-item" style="background:none; border:none; cursor:pointer; font-size:14px; margin-right:6px;" title="Editar">📝</button>
                    <button class="btn-eliminar-item" style="background:none; border:none; cursor:pointer; font-size:14px;" title="Eliminar">🗑️</button>
                </td>
            `;

            row.querySelector(".btn-editar-item").addEventListener("click", () => onEditarItem(item));
            row.querySelector(".btn-eliminar-item").addEventListener("click", () => onEliminarItem(item));

            tablaInv.appendChild(row);
        });

        var tablaInc = document.getElementById("mantenimiento-incidencias-tabla");
        tablaInc.innerHTML = "";
        var activas = incidencias.filter(i => "PENDIENTE" === i.estado);
        if (activas.length === 0) {
            tablaInc.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#888;">No hay incidencias activas en mantenimiento.</td></tr>`;
        } else {
            var self = this;
            activas.forEach(inc => {
                var row = document.createElement("tr");
                row.style.cssText = "border-bottom: 1px solid #eee; height: 45px;";
                var fechaStr = new Date(inc.fechaReporte).toLocaleDateString("es-BO") + " " + new Date(inc.fechaReporte).toLocaleTimeString("es-BO", {hour: "2-digit", minute:"2-digit"});
                
                row.innerHTML = `
                    <td style="padding: 8px; font-weight:600;">Habitación ${inc.numeroHabitacion}</td>
                    <td style="padding: 8px; color:#555;"><strong>${inc.nombreItem}</strong>: ${inc.descripcion}</td>
                    <td style="padding: 8px; color:#666;">${inc.recepcionistaReporta}</td>
                    <td style="padding: 8px; color:#888; font-size: 11px;">${fechaStr}</td>
                    <td style="padding: 8px;"><span style="padding:3px 8px; border-radius:12px; background:#FFE0B2; color:#E65100; font-size:11px; font-weight:600;">PENDIENTE</span></td>
                    <td style="padding: 8px; text-align: center;">
                        <button class="btn-resolver-incidencia" data-id="${inc.id}" style="background:#4CAF50; color:#fff; border:none; padding: 5px 10px; border-radius:6px; cursor:pointer; font-weight:600; font-family:'Montserrat', sans-serif; font-size:11px;">🔧 Resolver</button>
                    </td>
                `;
                
                row.querySelector(".btn-resolver-incidencia").addEventListener("click", function() {
                    self.mostrarModalResolverIncidencia(inc, onResolverIncidencia);
                });
                
                tablaInc.appendChild(row);
            });
        }
    }

    mostrarModalResolverIncidencia(incidencia, onResolverIncidencia) {
        var existente = document.getElementById("modal-resolver-incidencia");
        if (existente) existente.remove();

        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-resolver-incidencia";
        overlay.innerHTML = `
            <div class="modal" style="max-width:520px;">
                <h2 class="modal-titulo">Cerrar incidencia de mantenimiento</h2>
                <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:14px; margin:12px 0 16px;">
                    <div style="font-size:13px; color:#666; margin-bottom:6px;">Habitación</div>
                    <strong style="font-size:18px;">${this.#escapeHtml("Hab. " + incidencia.numeroHabitacion)}</strong>
                    <div style="margin-top:12px; font-size:13px; color:#666;">Daño reportado</div>
                    <div style="line-height:1.45;"><strong>${this.#escapeHtml(incidencia.nombreItem || "Estructural / otro")}</strong>: ${this.#escapeHtml(incidencia.descripcion || "")}</div>
                    <div style="margin-top:10px; font-size:12px; color:#777;">Reportado por ${this.#escapeHtml(incidencia.recepcionistaReporta || "-")}</div>
                </div>
                <label style="display:block; font-weight:700; color:#555; margin-bottom:8px;">Costo de reparación o reposición (Bs)</label>
                <input id="resolver-incidencia-costo" type="number" min="0" step="0.01" value="0" style="width:100%; height:48px; border:1px solid #ddd; border-radius:10px; padding:0 14px; font-size:16px; font-family:'Montserrat',sans-serif;">
                <p style="font-size:12px; color:#777; margin:10px 0 18px;">Si escribes un monto mayor a 0, se registrará como egreso de reparación. Si no tuvo costo, deja 0.</p>
                <div class="modal-actions">
                    <button type="button" id="resolver-incidencia-cancelar" class="btn-cancelar">Cancelar</button>
                    <button type="button" id="resolver-incidencia-confirmar" class="btn-confirmar">Cerrar incidencia</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector("#resolver-incidencia-cancelar").addEventListener("click", function () {
            overlay.remove();
        });

        overlay.querySelector("#resolver-incidencia-confirmar").addEventListener("click", function () {
            var input = overlay.querySelector("#resolver-incidencia-costo");
            var costo = parseFloat(input.value);
            if (Number.isNaN(costo) || costo < 0) {
                input.focus();
                input.style.borderColor = "#ef4444";
                return;
            }
            overlay.remove();
            onResolverIncidencia(incidencia.id, costo);
        });
    }

    mostrarEstadoPanelFinanzas(mensaje, tipo) {
        var status = document.getElementById("finanzas-panel-status");
        if (!status) return;

        if (!mensaje) {
            status.style.display = "none";
            status.textContent = "";
            status.className = "panel-status";
            return;
        }

        status.textContent = mensaje;
        status.className = "panel-status " + (tipo || "info");
        status.style.display = "block";
    }

    _assetUrl(url) {
        if (!url) return "";
        if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
        if (window.ApiClient && url.startsWith("/")) return ApiClient.url(url);
        return url;
    }

    #escapeHtml(value) {
        return String(value === null || value === undefined ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    #obtenerCatalogoEstadosHabitacion() {
        var estadosPorDefecto = [
            "Disponible",
            "Limpieza",
            "Mantenimiento",
            "Ocupada",
            "Pruebas",
            "Habitación para cumpleañero",
            "Reservada para evento"
        ];
        try {
            var raw = localStorage.getItem("catalogoEstadosHabitacion");
            var guardados = raw ? JSON.parse(raw) : null;
            if (Array.isArray(guardados) && guardados.length) {
                return guardados
                    .filter(estado => typeof estado === "string" && estado.trim())
                    .map(estado => estado.trim());
            }
        } catch (error) {
            localStorage.removeItem("catalogoEstadosHabitacion");
        }
        return estadosPorDefecto;
    }

    #estadoHabitacionLegible(estado) {
        if (!estado) return "Disponible";
        var normalizado = String(estado).trim().toUpperCase();
        if (normalizado === "DISPONIBLE") return "Disponible";
        if (normalizado === "LIMPIEZA" || normalizado === "EN LIMPIEZA") return "Limpieza";
        if (normalizado === "MANTENIMIENTO") return "Mantenimiento";
        if (normalizado === "OCUPADA" || normalizado === "ACTIVA") return "Ocupada";
        return String(estado).trim();
    }

    mostrarModalPreverificacionCheckout(reserva, itemsInventario, camareras, onVerificado) {
        if (typeof camareras === "function") {
            onVerificado = camareras;
            camareras = [];
        }
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-preverificacion-checkout";

        var listRows = itemsInventario.map(item => `
            <div class="preverif-row" data-item-id="${item.itemId}" style="display:grid; grid-template-columns: minmax(170px,1.4fr) minmax(170px,1fr) 92px minmax(150px,.8fr); gap:12px; align-items:center; border-bottom:1px solid #ececec; padding: 12px 0;">
                <div style="min-width:0;">
                    <div style="font-size:13px; font-weight:700; color:#222; line-height:1.25;">${item.emoji || "📦"} ${this.#escapeHtml(item.nombreItem)}</div>
                    <div style="font-size:11px; color:#888; margin-top:3px;">Esperado: ${item.cantidadEsperada || 1}</div>
                </div>
                <select class="preverif-estado" aria-label="Estado encontrado" style="height:38px; border:1px solid #ccc; border-radius:8px; font-size:12px; padding:0 10px; font-family:'Montserrat',sans-serif; background:#fff;">
                    <option value="OK">Conforme / está bien</option>
                    <option value="FALTANTE">Falta en habitación</option>
                    <option value="DAÑADO">Dañado o roto</option>
                </select>
                <input class="preverif-cantidad" aria-label="Cantidad encontrada" type="number" value="${item.cantidadEsperada || 1}" min="0" max="${item.cantidadEsperada || 999}" style="height:38px; border:1px solid #ccc; border-radius:8px; font-size:12px; padding:0 8px; font-family:'Montserrat',sans-serif;">
                <label style="font-size:12px; display:flex; align-items:center; gap:8px; color:#444; line-height:1.25;">
                    <input class="preverif-cobrar" type="checkbox" checked>
                    Cobrar si falta/está dañado
                </label>
            </div>
        `).join("");
        var camarerasOptions = (camareras || []).map(camarera => `
            <option value="${camarera.nombre}">${camarera.nombre}</option>
        `).join("");
        var camareraField = camarerasOptions ? `
            <select id="preverif-camarera" required style="width: 100%; height:38px; padding:0 12px; border:1px solid #e0e0e0; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px; background:#fff;">
                <option value="">Seleccione camarera...</option>
                ${camarerasOptions}
            </select>
        ` : `
            <input id="preverif-camarera" type="text" placeholder="Ej: Camarera Juana" required style="width: 100%; height:38px; padding:0 12px; border:1px solid #e0e0e0; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px;">
        `;

        overlay.innerHTML = `
            <div class="modal" style="max-width: 720px; width:100%; padding:28px;">
                <h2 class="modal-titulo" style="margin-bottom:6px;">📋 Revisión antes del check-out · Habitación ${reserva.habitacion.numero}</h2>
                <p style="font-size:13px; color:#666; margin: 0 0 16px; line-height:1.45;">Registra lo que reporta la camarera antes de liberar la habitación. Si hay faltantes o daños, se genera la incidencia y el posible cobro.</p>
                
                <div style="margin-bottom:15px; display:flex; flex-direction:column; gap:5px; text-align:left;">
                    <label for="preverif-camarera" style="font-size:12px; font-weight:700; color:#555;">Camarera que reporta la revisión</label>
                    ${camareraField}
                </div>

                <div style="display:grid; grid-template-columns:minmax(170px,1.4fr) minmax(170px,1fr) 92px minmax(150px,.8fr); gap:12px; align-items:center; text-align:left; padding:10px 12px; border:1px solid #e5e7eb; border-bottom:0; border-radius:10px 10px 0 0; background:#f8fafc; color:#555; font-size:11px; font-weight:800; text-transform:uppercase;">
                    <span>Objeto revisado</span>
                    <span>Estado encontrado</span>
                    <span>Cantidad</span>
                    <span>Cobro</span>
                </div>
                <div style="max-height:260px; overflow-y:auto; margin-bottom:15px; text-align:left; border:1px solid #e5e7eb; padding:0 12px; border-radius:0 0 10px 10px; background:#fff;">
                    ${listRows}
                </div>

                <div style="margin-bottom:15px; display:flex; flex-direction:column; gap:5px; text-align:left;">
                    <label for="preverif-obs" style="font-size:12px; font-weight:700; color:#555;">Observaciones de recepción</label>
                    <textarea id="preverif-obs" placeholder="Ej: huésped acepta cobro, se revisó con camarera, queda pendiente mantenimiento..." style="width: 100%; height:72px; padding:10px 12px; border:1px solid #e0e0e0; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px; resize:none;"></textarea>
                </div>

                <div style="display:flex; gap:10px; justify-content:flex-end;">
                    <button type="button" id="btn-cancelar-preverif" style="background:#e0e0e0; color:#333; height:40px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">Cancelar</button>
                    <button type="button" id="btn-guardar-preverif" style="background:#7F77DD; color:#fff; height:40px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">Confirmar revisión y continuar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-preverif").addEventListener("click", function() {
            overlay.remove();
        });

        document.getElementById("btn-guardar-preverif").addEventListener("click", function() {
            var camarera = document.getElementById("preverif-camarera").value.trim();
            if (!camarera) {
                alert("Ingrese el nombre de la camarera que reporta por Walkie-talkie.");
                return;
            }

            var detalles = [];
            var rows = overlay.querySelectorAll(".preverif-row");
            rows.forEach(r => {
                var itemId = parseInt(r.getAttribute("data-item-id"));
                var estado = r.querySelector(".preverif-estado").value;
                var cant = parseInt(r.querySelector(".preverif-cantidad").value) || 1;
                var cobrar = r.querySelector(".preverif-cobrar").checked;

                detalles.push({
                    itemId: itemId,
                    estadoReportado: estado,
                    cantidad: cant,
                    cobrado: cobrar
                });
            });

            var obs = document.getElementById("preverif-obs").value.trim();

            overlay.remove();
            onVerificado(camarera, detalles, obs);
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    mostrarModalReportarIncidencia(habitacionId, items, onReportado) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-reportar-incidencia";

        var itemOptions = items.map(item => `
            <option value="${item.id}">${item.emoji || "📦"} ${item.nombre} (${item.tipo})</option>
        `).join("");

        overlay.innerHTML = `
            <div class="modal" style="max-width: 400px; width:100%;">
                <h2 class="modal-titulo">⚠️ Reportar Incidencia de Mantenimiento</h2>
                <form id="form-incidencia" style="display:flex; flex-direction:column; gap:12px; text-align:left; margin-top:15px;">
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <label for="inc-form-item" style="font-size:12px; font-weight:600; color:#555;">Elemento Afectado</label>
                        <select id="inc-form-item" style="width:100%; height:40px; padding:0 12px; border:1px solid #e0e0e0; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                            <option value="">Estructural / Otro (Ninguno de la lista)</option>
                            ${itemOptions}
                        </select>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <label for="inc-form-desc" style="font-size:12px; font-weight:600; color:#555;">Descripción del Daño</label>
                        <textarea id="inc-form-desc" placeholder="Ej: Pantalla rota, pata de cama floja" required style="width: 100%; height:80px; padding:8px 12px; border:1px solid #e0e0e0; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px; resize:none;"></textarea>
                    </div>
                    <div style="display:flex; gap:10px; margin-top:10px; justify-content:flex-end;">
                        <button type="button" id="btn-cancelar-inc-form" style="background:#e0e0e0; color:#333; height:40px; padding:0 15px; font-weight:600; font-size:12px; border:none; border-radius:8px;">Cancelar</button>
                        <button type="submit" style="background:#7F77DD; color:#fff; height:40px; padding:0 15px; font-weight:600; font-size:12px; border:none; border-radius:8px;">Guardar Reporte</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        var form = document.getElementById("form-incidencia");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            var itemIdVal = document.getElementById("inc-form-item").value;
            var itemId = itemIdVal ? parseInt(itemIdVal) : null;
            var desc = document.getElementById("inc-form-desc").value.trim();
            overlay.remove();
            onReportado(itemId, desc);
        });

        document.getElementById("btn-cancelar-inc-form").addEventListener("click", function() {
            overlay.remove();
        });

        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    mostrarModalInventarioItem(item, onSubmit) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-inventario-item";

        var esEdicion = !!item;
        var titulo = esEdicion ? "Editar Artículo de Catálogo" : "Nuevo Artículo de Catálogo";
        var nombre = esEdicion ? item.nombre : "";
        var tipo = esEdicion ? item.tipo : "VENTA";
        var stockActual = esEdicion ? item.stockActual : 0;
        var precioCompra = esEdicion ? item.precioCompra : 0;
        var precioVenta = esEdicion ? item.precioVenta : 0;
        var emoji = esEdicion ? item.emoji : "📦";

        overlay.innerHTML = `
            <div class="modal" style="max-width: 450px; width: 100%;">
                <h2 class="modal-titulo">${titulo}</h2>
                <form id="form-inventario-item" style="display: flex; flex-direction: column; gap: 14px; text-align: left; margin-top: 15px;">
                    <div style="display: flex; gap: 10px;">
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label for="item-form-nombre" style="font-size: 12px; font-weight: 600; color: #555;">Nombre del Artículo</label>
                            <input id="item-form-nombre" type="text" value="${nombre}" placeholder="Ej. Coca Cola 350ml" required style="height: 38px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px; width: 80px;">
                            <label for="item-form-emoji" style="font-size: 12px; font-weight: 600; color: #555;">Emoji</label>
                            <input id="item-form-emoji" type="text" value="${emoji}" placeholder="🥤" required style="height: 38px; text-align: center; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 18px;">
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="item-form-tipo" style="font-size: 12px; font-weight: 600; color: #555;">Tipo de Artículo</label>
                        <select id="item-form-tipo" required style="height: 38px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                            <option value="VENTA" ${tipo === "VENTA" ? "selected" : ""}>VENTA (Insumo para vender)</option>
                            <option value="CORTESIA" ${tipo === "CORTESIA" ? "selected" : ""}>CORTESIA (Insumo gratuito)</option>
                            <option value="REUSABLE" ${tipo === "REUSABLE" ? "selected" : ""}>REUSABLE (Toallas, Sábanas, Almohadas)</option>
                            <option value="ACTIVO_FIJO" ${tipo === "ACTIVO_FIJO" ? "selected" : ""}>ACTIVO FIJO (TV, Cama, Aire Acondicionado)</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label for="item-form-stock" style="font-size: 12px; font-weight: 600; color: #555;">Stock Inicial Almacén</label>
                            <input id="item-form-stock" type="number" min="0" value="${stockActual}" required style="height: 38px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label for="item-form-compra" style="font-size: 12px; font-weight: 600; color: #555;">Precio Compra (Bs)</label>
                            <input id="item-form-compra" type="number" min="0" step="0.01" value="${precioCompra}" required style="height: 38px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label for="item-form-venta" style="font-size: 12px; font-weight: 600; color: #555;">Precio Venta / Multa (Bs)</label>
                            <input id="item-form-venta" type="number" min="0" step="0.01" value="${precioVenta}" required style="height: 38px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end;">
                        <button type="button" id="btn-cancelar-item-form" style="background: #e0e0e0; color: #333; height: 38px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family:'Montserrat',sans-serif; font-size:12px; padding: 0 15px;">Cancelar</button>
                        <button type="submit" style="background: #7F77DD; color: #fff; height: 38px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family:'Montserrat',sans-serif; font-size:12px; padding: 0 15px;">Guardar</button>
                    </div>
                    <div id="item-form-error" class="form-error" style="display:none; color: #c0392b; font-size: 12px; margin-top: 5px;"></div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-item-form").addEventListener("click", function() {
            overlay.remove();
        });

        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) overlay.remove();
        });

        var form = document.getElementById("form-inventario-item");
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            var payload = {
                nombre: document.getElementById("item-form-nombre").value.trim(),
                tipo: document.getElementById("item-form-tipo").value,
                stockActual: parseInt(document.getElementById("item-form-stock").value) || 0,
                precioCompra: parseFloat(document.getElementById("item-form-compra").value) || 0.0,
                precioVenta: parseFloat(document.getElementById("item-form-venta").value) || 0.0,
                emoji: document.getElementById("item-form-emoji").value.trim()
            };
            onSubmit(payload, overlay);
        });
    }

    mostrarModalDetalleHabitacion(habitacion, itemsInventario, incidencias, reservaActiva, consumos, callbacks) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-detalle-habitacion";

        var estadoFormateado = (habitacion.estado || "Disponible").toUpperCase();
        var badgeColor = "background:#E8F5E9; color:#2E7D32;"; // Disponible
        if (estadoFormateado === "ACTIVA" || estadoFormateado === "OCUPADA") {
            badgeColor = "background:#E8EAF6; color:#1A237E;";
        } else if (estadoFormateado === "LIMPIEZA") {
            badgeColor = "background:#E3F2FD; color:#0D47A1;";
        } else if (estadoFormateado === "MANTENIMIENTO") {
            badgeColor = "background:#FFEBEE; color:#C62828;";
        } else if (estadoFormateado === "PENDIENTE_PAGO" || estadoFormateado === "PAGADA") {
            badgeColor = "background:#FFF3E0; color:#E65100;";
        }

        var reservaHtml = "";
        if (reservaActiva) {
            var horaIngreso = reservaActiva.horaIngreso
                ? new Date(reservaActiva.horaIngreso).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
                : "--:--";
            var horaSalida = reservaActiva.horaSalidaEstimada
                ? new Date(reservaActiva.horaSalidaEstimada).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
                : "--:--";

            reservaHtml = `
                <div style="background: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size:12px; text-align:left;">
                    <h3 style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#555;">🛎️ Reserva Activa #${reservaActiva.id}</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                        <div><strong>Huésped:</strong> ${reservaActiva.huesped.nombre}</div>
                        <div><strong>CI:</strong> ${reservaActiva.huesped.ci || "S/CI"}</div>
                        <div><strong>Ingreso:</strong> ${reservaActiva.fechaIngreso} ${horaIngreso}</div>
                        <div><strong>Salida Estimada:</strong> ${horaSalida}</div>
                        <div><strong>Horas Contratadas:</strong> ${reservaActiva.cantidadBloques * 12}h</div>
                    </div>
                </div>
            `;
        } else {
            reservaHtml = `
                <div style="background: #fafafa; border: 1px dashed #ddd; border-radius: 8px; padding: 12px; margin-bottom: 15px; text-align:center; font-size:12px; color:#888;">
                    No hay reserva activa actualmente en esta habitación.
                </div>
            `;
        }

        var incidenciasHab = incidencias.filter(i => i.habitacionId === habitacion.id && i.estado === "PENDIENTE");
        var incidenciasHtml = "";
        if (incidenciasHab.length > 0) {
            var itemsList = incidenciasHab.map(inc => {
                var fechaStr = new Date(inc.fechaReporte).toLocaleDateString("es-BO") + " " + new Date(inc.fechaReporte).toLocaleTimeString("es-BO", {hour: "2-digit", minute:"2-digit"});
                return `<li style="margin-bottom:6px; color:#c0392b;"><strong>${inc.nombreItem}</strong>: ${inc.descripcion} <br><span style="font-size:10px; color:#999;">Reportado por ${inc.recepcionistaReporta} el ${fechaStr}</span></li>`;
            }).join("");
            incidenciasHtml = `
                <div style="background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 8px; padding: 12px; margin-bottom: 15px; font-size:12px; text-align:left;">
                    <h3 style="margin:0 0 6px 0; font-size:13px; font-weight:600; color:#C53030;">⚠️ Incidencias de Mantenimiento Activas</h3>
                    <ul style="margin:0; padding-left:16px;">${itemsList}</ul>
                </div>
            `;
        }

        var consumosHtml = "";
        if (reservaActiva) {
            var totalConsumos = (consumos || []).reduce(function (sum, consumo) {
                return sum + (consumo.total || 0);
            }, 0);

            var consumoRows = "";
            if (!consumos || consumos.length === 0) {
                consumoRows = `<div style="color:#888; font-size:12px; padding:8px 0;">Sin consumos registrados para esta estadía.</div>`;
            } else {
                consumoRows = consumos.map(function (consumo) {
                    var fecha = consumo.fechaCreacion
                        ? new Date(consumo.fechaCreacion).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
                        : "";
                    var detalle = (consumo.items || []).map(function (item) {
                        return item.emoji + " " + item.nombre + " x" + item.cantidad;
                    }).join(", ");
                    var estadoStyle = consumo.estado === "PAGADO"
                        ? "background:#E8F5E9; color:#2E7D32;"
                        : "background:#FFF3E0; color:#E65100;";
                    return `
                        <div style="display:flex; justify-content:space-between; gap:10px; padding:8px 0; border-top:1px solid #f0f0f0;">
                            <div>
                                <strong style="font-size:12px;">${detalle}</strong>
                                <div style="font-size:10px; color:#888;">${fecha}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:12px; font-weight:700;">Bs ${(consumo.total || 0).toFixed(2)}</div>
                                <span style="padding:2px 7px; border-radius:10px; font-size:10px; font-weight:600; ${estadoStyle}">${consumo.estado}</span>
                            </div>
                        </div>
                    `;
                }).join("");
            }

            consumosHtml = `
                <div style="background:#fff; border:1px solid #e8e8e8; border-radius:8px; padding:12px; margin-bottom:15px; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:6px;">
                        <h3 style="font-size:14px; font-weight:600; color:#1a1a1a; margin:0;">🧾 Consumos de la Estadía</h3>
                        <strong style="font-size:12px;">Total Bs ${totalConsumos.toFixed(2)}</strong>
                    </div>
                    ${consumoRows}
                </div>
            `;
        }

        var inventarioRows = "";
        if (itemsInventario.length === 0) {
            inventarioRows = `<tr><td colspan="6" style="text-align:center; padding:15px; color:#888;">No hay ítems asignados a esta habitación.</td></tr>`;
        } else {
            inventarioRows = itemsInventario.map(item => {
                var badgeStyle = "background:#E8F5E9; color:#2E7D32;"; // OK
                if (item.estadoVerificacion === "FALTANTE") {
                    badgeStyle = "background:#FFEBEE; color:#C62828;";
                } else if (item.estadoVerificacion === "DAÑADO") {
                    badgeStyle = "background:#FFF3E0; color:#EF6C00;";
                }

                return `
                    <tr style="border-bottom: 1px solid #f0f0f0; height: 38px;">
                        <td style="padding: 6px; font-size: 16px;">${item.emoji || "📦"}</td>
                        <td style="padding: 6px;"><strong>${item.nombreItem}</strong><br><span style="font-size:10px; color:#999;">${item.tipoItem}</span></td>
                        <td style="padding: 6px; text-align: center; font-weight:600;">${item.cantidadEsperada}</td>
                        <td style="padding: 6px; text-align: center;">
                            <input type="number" min="0" value="${item.cantidadActual}" class="hab-item-actual-input" data-item-id="${item.itemId}" style="width: 45px; height: 26px; text-align: center; border: 1px solid #ccc; border-radius: 6px; font-family:'Montserrat',sans-serif; font-size:12px;">
                        </td>
                        <td style="padding: 6px; text-align: center;">
                            <span style="padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; ${badgeStyle}">${item.estadoVerificacion}</span>
                        </td>
                        <td style="padding: 6px; text-align: center;">
                            <button class="btn-conciliar-inline" data-item-id="${item.itemId}" title="Guarda la cantidad encontrada y marca faltante o dañado si no coincide" style="background:#1565C0; color:#fff; border:none; padding:7px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; line-height:1.15;">Guardar<br>revisión</button>
                            <button class="btn-eliminar-hab-item" data-item-id="${item.itemId}" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; margin-left:4px;" title="Desasignar">🗑️</button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        var actionButtonsHtml = "";
        var estadoLower = estadoFormateado.toLowerCase();
        if (estadoLower === "disponible") {
            actionButtonsHtml += `
                <button type="button" id="btn-ingreso-puerta" style="background:#2E7D32; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">💵 Ingreso en Puerta</button>
                <button type="button" id="btn-estado-mantenimiento" style="background:#E65100; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">🔧 Reportar Incidencia</button>
            `;
        } else if (estadoLower === "activa" || estadoLower === "ocupada" || estadoLower === "pagada") {
            actionButtonsHtml += `
                <button type="button" id="btn-registrar-consumo" style="background:#1565C0; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">🧾 Registrar Consumo</button>
                <button type="button" id="btn-iniciar-checkout" style="background:#7F77DD; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">🛎️ Iniciar Check-out</button>
                <button type="button" id="btn-estado-mantenimiento" style="background:#E65100; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">🔧 Reportar Incidencia</button>
            `;
        } else if (estadoLower === "limpieza") {
            actionButtonsHtml += `
                <button type="button" id="btn-estado-disponible" style="background:#2E7D32; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">✅ Marcar Disponible</button>
                <button type="button" id="btn-estado-mantenimiento" style="background:#E65100; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">🔧 Reportar Incidencia</button>
            `;
        } else if (estadoLower === "mantenimiento") {
            actionButtonsHtml += `
                <button type="button" id="btn-estado-disponible" style="background:#2E7D32; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">✅ Marcar Disponible</button>
            `;
        }

        overlay.innerHTML = `
            <div class="modal modal-detalle-habitacion" style="max-width: 760px; width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
                    <h2 class="modal-titulo" style="margin:0;">🔑 Habitación ${habitacion.numero} (${habitacion.tipo.nombreTipo})</h2>
                    <span style="padding: 4px 10px; border-radius:12px; font-size:11px; font-weight:600; ${badgeColor}">${estadoFormateado}</span>
                </div>

                ${reservaHtml}
                ${consumosHtml}
                ${incidenciasHtml}

                <div style="margin-bottom:15px; text-align:left;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <div>
                            <h3 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0;">📦 Inventario en Habitación</h3>
                            <p style="font-size:11px; color:#666; margin:4px 0 0;">Actualiza “Actual” con lo encontrado por recepción/camarera y presiona “Guardar revisión”.</p>
                        </div>
                        <button type="button" id="btn-abrir-asignar-item" style="background:#7F77DD; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif;">➕ Asignar Artículo</button>
                    </div>
                    <div style="max-height:200px; overflow-y:auto; border: 1px solid #e8e8e8; border-radius:8px; background:#fff;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid #eee; height: 30px; color: #555; background:#f9f9f9;">
                                    <th style="padding: 6px;">Emoji</th>
                                    <th style="padding: 6px;">Artículo</th>
                                    <th style="padding: 6px; text-align: center;">Esperado</th>
                                    <th style="padding: 6px; text-align: center;">Actual</th>
                                    <th style="padding: 6px; text-align: center;">Estado</th>
                                    <th style="padding: 6px; text-align: center;">Acción</th>
                                </tr>
                            </thead>
                            <tbody style="color: #333;">
                                ${inventarioRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; gap:10px; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                    <div style="display:flex; gap:8px;">
                        ${actionButtonsHtml}
                    </div>
                    <button type="button" id="btn-cerrar-detalle-hab" style="background:#e0e0e0; color:#333; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">Cerrar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cerrar-detalle-hab").addEventListener("click", () => overlay.remove());
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) overlay.remove();
        });

        overlay.querySelectorAll(".btn-conciliar-inline").forEach(btn => {
            btn.addEventListener("click", function() {
                var itemId = parseInt(this.getAttribute("data-item-id"));
                var input = overlay.querySelector(`.hab-item-actual-input[data-item-id="${itemId}"]`);
                var qty = parseInt(input.value);
                if (isNaN(qty) || qty < 0) {
                    alert("Ingrese una cantidad válida.");
                    return;
                }
                callbacks.onConciliarItem(itemId, qty, overlay);
            });
        });

        var btnAbrirAsignar = document.getElementById("btn-abrir-asignar-item");
        if (btnAbrirAsignar) {
            btnAbrirAsignar.addEventListener("click", function() {
                callbacks.onAbrirAsignarItem(overlay);
            });
        }

        var btnIngresoPuerta = document.getElementById("btn-ingreso-puerta");
        if (btnIngresoPuerta) {
            btnIngresoPuerta.addEventListener("click", () => {
                overlay.remove();
                callbacks.onRegistrarIngresoPuerta();
            });
        }

        overlay.querySelectorAll(".btn-eliminar-hab-item").forEach(btn => {
            btn.addEventListener("click", function() {
                var itemId = parseInt(this.getAttribute("data-item-id"));
                callbacks.onEliminarItem(itemId, overlay);
            });
        });

        var btnDisponible = document.getElementById("btn-estado-disponible");
        if (btnDisponible) {
            btnDisponible.addEventListener("click", () => {
                overlay.remove();
                callbacks.onCambiarEstado("disponible");
            });
        }

        var btnCheckout = document.getElementById("btn-iniciar-checkout");
        if (btnCheckout) {
            btnCheckout.addEventListener("click", () => {
                overlay.remove();
                callbacks.onIniciarCheckout();
            });
        }

        var btnConsumo = document.getElementById("btn-registrar-consumo");
        if (btnConsumo) {
            btnConsumo.addEventListener("click", () => {
                callbacks.onRegistrarConsumo(overlay);
            });
        }

        var btnMantenimiento = document.getElementById("btn-estado-mantenimiento");
        if (btnMantenimiento) {
            btnMantenimiento.addEventListener("click", () => {
                overlay.remove();
                callbacks.onReportarIncidencia();
            });
        }
    }

    mostrarModalIngresoPuerta(habitacion, onSubmit) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-ingreso-puerta";
        overlay.innerHTML = `
            <div class="modal" style="max-width: 460px; width:100%;">
                <h2 class="modal-titulo">💵 Ingreso en Puerta · Habitación ${habitacion.numero}</h2>
                <p style="font-size:12px; color:#666; margin:5px 0 14px;">Recepción confirma el efectivo y la habitación queda ocupada.</p>
                <form id="form-ingreso-puerta" style="display:flex; flex-direction:column; gap:12px; text-align:left;">
                    <input id="puerta-nombre" type="text" placeholder="Nombre del huésped" required style="height:40px; padding:0 12px; border:1px solid #ddd; border-radius:8px; font-family:'Montserrat',sans-serif;">
                    <input id="puerta-ci" type="text" placeholder="CI" required style="height:40px; padding:0 12px; border:1px solid #ddd; border-radius:8px; font-family:'Montserrat',sans-serif;">
                    <input id="puerta-celular" type="tel" placeholder="Celular (opcional)" style="height:40px; padding:0 12px; border:1px solid #ddd; border-radius:8px; font-family:'Montserrat',sans-serif;">
                    <label style="font-size:12px; font-weight:600; color:#555;">Foto CI anverso<input id="puerta-foto-anverso" type="file" accept="image/*" required style="width:100%; margin-top:5px;"></label>
                    <label style="font-size:12px; font-weight:600; color:#555;">Foto CI reverso<input id="puerta-foto-reverso" type="file" accept="image/*" required style="width:100%; margin-top:5px;"></label>
                    <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:6px;">
                        <button type="button" id="btn-cancelar-ingreso-puerta" style="background:#e0e0e0; color:#333; height:40px; border:none; border-radius:8px; cursor:pointer; font-weight:600; padding:0 15px;">Cancelar</button>
                        <button type="submit" style="background:#2E7D32; color:#fff; height:40px; border:none; border-radius:8px; cursor:pointer; font-weight:600; padding:0 15px;">Confirmar efectivo e ingresar</button>
                    </div>
                    <div id="ingreso-puerta-error" class="form-error" style="display:none;"></div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-ingreso-puerta").addEventListener("click", function () {
            overlay.remove();
        });
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) overlay.remove();
        });

        document.getElementById("form-ingreso-puerta").addEventListener("submit", function (e) {
            e.preventDefault();
            onSubmit({
                nombre: document.getElementById("puerta-nombre").value.trim(),
                ci: document.getElementById("puerta-ci").value.trim(),
                celular: document.getElementById("puerta-celular").value.trim(),
                fotoAnverso: document.getElementById("puerta-foto-anverso").files[0],
                fotoReverso: document.getElementById("puerta-foto-reverso").files[0]
            }, overlay);
        });
    }

    mostrarModalAsignarItem(habitacion, catalogoItems, onSubmit) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-asignar-item";
        overlay.style.zIndex = "1100";

        var itemOptions = catalogoItems.map(item => `
            <option value="${item.id}" data-disponible="${item.stockDisponible || 0}">${item.emoji || "📦"} ${item.nombre} (${item.tipo}) · disponible ${item.stockDisponible || 0}</option>
        `).join("");

        overlay.innerHTML = `
            <div class="modal" style="max-width: 400px; width: 100%;">
                <h2 class="modal-titulo">➕ Asignar Artículo a Habitación ${habitacion.numero}</h2>
                <form id="form-asignar-item" style="display: flex; flex-direction: column; gap: 14px; text-align: left; margin-top: 15px;">
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="asignar-form-item" style="font-size: 12px; font-weight: 600; color: #555;">Artículo de Catálogo</label>
                        <select id="asignar-form-item" required style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                            <option value="">Seleccione un artículo...</option>
                            ${itemOptions}
                        </select>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label for="asignar-form-cantidad" style="font-size: 12px; font-weight: 600; color: #555;">Cantidad Esperada</label>
                        <input id="asignar-form-cantidad" type="number" min="1" value="1" required style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-family:'Montserrat',sans-serif; font-size:13px;">
                        <small id="asignar-stock-ayuda" style="font-size:11px; color:#666;">Selecciona un artículo para ver stock disponible.</small>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end;">
                        <button type="button" id="btn-cancelar-asignar" style="background: #e0e0e0; color: #333; height: 40px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family:'Montserrat',sans-serif; font-size:12px; padding: 0 15px;">Cancelar</button>
                        <button type="submit" style="background: #7F77DD; color: #fff; height: 40px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family:'Montserrat',sans-serif; font-size:12px; padding: 0 15px;">Asignar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-asignar").addEventListener("click", function() {
            overlay.remove();
        });

        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) overlay.remove();
        });

        var form = document.getElementById("form-asignar-item");
        var selectItem = document.getElementById("asignar-form-item");
        var cantidadInput = document.getElementById("asignar-form-cantidad");
        var ayuda = document.getElementById("asignar-stock-ayuda");

        function actualizarDisponible() {
            var option = selectItem.options[selectItem.selectedIndex];
            var disponible = option ? parseInt(option.getAttribute("data-disponible")) || 0 : 0;
            cantidadInput.max = disponible > 0 ? String(disponible) : "1";
            ayuda.textContent = selectItem.value ? "Disponible para asignar: " + disponible : "Selecciona un artículo para ver stock disponible.";
        }

        selectItem.addEventListener("change", actualizarDisponible);
        actualizarDisponible();

        form.addEventListener("submit", function(e) {
            e.preventDefault();
            var itemId = parseInt(selectItem.value);
            var cantidad = parseInt(cantidadInput.value);
            var option = selectItem.options[selectItem.selectedIndex];
            var disponible = option ? parseInt(option.getAttribute("data-disponible")) || 0 : 0;
            if (!itemId || cantidad < 1 || cantidad > disponible) {
                alert("La cantidad debe estar entre 1 y el stock disponible (" + disponible + ").");
                return;
            }
            overlay.remove();
            onSubmit(itemId, cantidad);
        });
    }

    mostrarModalRegistrarConsumo(reserva, productos, onSubmit) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-registrar-consumo";
        overlay.style.zIndex = "1100";

        var rows = productos.map(function (producto) {
            return `
                <div class="consumo-row" data-producto-id="${producto.id}" data-precio="${producto.precio}" style="display:grid; grid-template-columns: 1fr 82px 84px; gap:10px; align-items:center; padding:9px 0; border-bottom:1px solid #f0f0f0;">
                    <div>
                        <strong style="font-size:13px;">${producto.emoji} ${producto.nombre}</strong>
                        <div style="font-size:10px; color:#888;">Bs ${producto.precio.toFixed(2)} · Stock ${producto.stock}</div>
                    </div>
                    <input class="consumo-cantidad" type="number" min="0" max="${producto.stock}" value="0" style="height:32px; border:1px solid #ddd; border-radius:6px; padding:0 8px; font-family:'Montserrat',sans-serif;">
                    <span class="consumo-subtotal" style="font-size:12px; font-weight:600; text-align:right;">Bs 0.00</span>
                </div>
            `;
        }).join("");

        var tituloConsumo = reserva.ventaDirecta
            ? "🧾 Venta directa · Habitación " + reserva.habitacion.numero
            : "🧾 Registrar consumo · Habitación " + reserva.habitacion.numero;
        var detalleConsumo = reserva.ventaDirecta
            ? "Se registrará como venta directa de insumos en habitación porque no hay reserva enlazada."
            : "Queda asociado a la reserva #" + reserva.id + " y al huésped " + reserva.huesped.nombre + ".";

        overlay.innerHTML = `
            <div class="modal" style="max-width: 520px; width:100%;">
                <h2 class="modal-titulo">${tituloConsumo}</h2>
                <p style="font-size:12px; color:#666; margin:5px 0 12px;">${detalleConsumo}</p>
                <div style="max-height:320px; overflow-y:auto; text-align:left; border:1px solid #eee; border-radius:8px; padding:0 12px; background:#fff;">
                    ${rows}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid #eee; padding-top:12px;">
                    <strong id="consumo-total">Total Bs 0.00</strong>
                    <div style="display:flex; gap:10px;">
                        <button type="button" id="btn-cancelar-consumo" style="background:#e0e0e0; color:#333; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">Cancelar</button>
                        <button type="button" id="btn-guardar-consumo" style="background:#1565C0; color:#fff; height:38px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-family:'Montserrat',sans-serif; font-size:12px; padding:0 15px;">Registrar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function actualizarTotal() {
            var total = 0;
            overlay.querySelectorAll(".consumo-row").forEach(function (row) {
                var precio = parseFloat(row.getAttribute("data-precio")) || 0;
                var cantidad = parseInt(row.querySelector(".consumo-cantidad").value) || 0;
                var subtotal = precio * cantidad;
                total += subtotal;
                row.querySelector(".consumo-subtotal").textContent = "Bs " + subtotal.toFixed(2);
            });
            document.getElementById("consumo-total").textContent = "Total Bs " + total.toFixed(2);
        }

        overlay.querySelectorAll(".consumo-cantidad").forEach(function (input) {
            input.addEventListener("input", actualizarTotal);
        });

        document.getElementById("btn-cancelar-consumo").addEventListener("click", function() {
            overlay.remove();
        });

        document.getElementById("btn-guardar-consumo").addEventListener("click", function() {
            var items = [];
            overlay.querySelectorAll(".consumo-row").forEach(function (row) {
                var cantidad = parseInt(row.querySelector(".consumo-cantidad").value) || 0;
                if (cantidad > 0) {
                    items.push({
                        productoId: row.getAttribute("data-producto-id"),
                        cantidad: cantidad
                    });
                }
            });

            if (items.length === 0) {
                alert("Selecciona al menos un producto consumido.");
                return;
            }

            onSubmit(items, overlay);
        });

        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }
}
