class RecepcionController {

    constructor() {
        this.view = new RecepcionView();
        this.reservaActual = null;
        this._intervaloActualizacion = null;
        this.modoRegistro = false;
        this.recepcionista = this._obtenerSesionRecepcionista();

        this._configurarLogin();
        if (this.recepcionista) {
            this._mostrarPanel();
            this._iniciarPanel();
        }
    }

    _iniciarPanel() {
        this._cargarHabitaciones();
        this._iniciarActualizacionAutomatica();

        this.view.onClickHabitacion((id, estado, accion) => {
            this._manejarClickHabitacion(id, estado, accion);
        });

        this.view.onBuscarReserva((termino) => {
            this._buscarReservas(termino);
        });

        var self = this;
        var btnNuevaHabitacion = document.getElementById("btn-nueva-habitacion");
        if (btnNuevaHabitacion) {
            btnNuevaHabitacion.addEventListener("click", function() {
                self._abrirCrearHabitacion();
            });
        }

        var btnFinanzas = document.getElementById("btn-finanzas-panel");
        if (btnFinanzas) {
            btnFinanzas.addEventListener("click", function() {
                self._alternarFinanzasPanel();
            });
        }

        var btnNuevoItem = document.getElementById("btn-nuevo-item");
        if (btnNuevoItem) {
            btnNuevoItem.addEventListener("click", function() {
                self._abrirCrearInventarioItem();
            });
        }

        var formEgreso = document.getElementById("form-registrar-egreso");
        if (formEgreso) {
            formEgreso.addEventListener("submit", function(e) {
                e.preventDefault();
                self._registrarEgreso();
            });
        }

        this.view.onAdminAccionHabitacion(function(id, accion, data) {
            if (accion === "edit") {
                self._abrirEditarHabitacion(id, data);
            } else if (accion === "delete") {
                self._confirmarEliminarHabitacion(id, data);
            }
        });
    }

    _configurarLogin() {
        var form = document.getElementById("form-login-recepcion");
        var logout = document.getElementById("btn-logout-recepcion");
        var modoRegistroBtn = document.getElementById("btn-modo-registro");
        var self = this;

        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                if (self.modoRegistro) {
                    self._registrarRecepcionista();
                } else {
                    self._loginRecepcionista();
                }
            });
        }

        if (modoRegistroBtn) {
            modoRegistroBtn.addEventListener("click", function () {
                self._alternarModoRegistro();
            });
        }

        if (logout) {
            logout.addEventListener("click", function () {
                localStorage.removeItem("recepcionista");
                window.location.reload();
            });
        }
    }

    _alternarModoRegistro() {
        this.modoRegistro = !this.modoRegistro;
        var nombre = document.getElementById("registro-nombre");
        var titulo = document.querySelector(".login-titulo");
        var subtitulo = document.querySelector(".login-subtitulo");
        var submit = document.getElementById("btn-login-submit");
        var alternar = document.getElementById("btn-modo-registro");
        var errorDiv = document.getElementById("login-error");

        if (nombre) nombre.style.display = this.modoRegistro ? "block" : "none";
        if (titulo) titulo.textContent = this.modoRegistro ? "Registrar Recepcionista" : "Acceso Recepción";
        if (subtitulo) subtitulo.textContent = this.modoRegistro ? "Crea un usuario para el turno" : "Ingresa con tu usuario de turno";
        if (submit) submit.textContent = this.modoRegistro ? "Registrar" : "Ingresar";
        if (alternar) alternar.textContent = this.modoRegistro ? "Ya tengo usuario" : "Registrar recepcionista";
        if (errorDiv) errorDiv.style.display = "none";
    }

    _obtenerSesionRecepcionista() {
        try {
            var raw = localStorage.getItem("recepcionista");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            localStorage.removeItem("recepcionista");
            return null;
        }
    }

    _mostrarPanel() {
        var login = document.getElementById("login-recepcion");
        var panel = document.getElementById("panel-recepcion");
        var nombre = document.getElementById("recepcionista-activa");

        if (login) login.style.display = "none";
        if (panel) panel.style.display = "block";
        if (nombre && this.recepcionista) {
            nombre.textContent = this.recepcionista.nombre;
        }
    }

    async _loginRecepcionista() {
        var usuarioInput = document.getElementById("login-usuario");
        var passwordInput = document.getElementById("login-password");
        var errorDiv = document.getElementById("login-error");
        var username = usuarioInput ? usuarioInput.value.trim() : "";
        var password = passwordInput ? passwordInput.value : "";

        if (errorDiv) errorDiv.style.display = "none";

        try {
            var response = await fetch(ApiClient.url("/api/auth/recepcion/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password })
            });

            if (!response.ok) {
                if (errorDiv) {
                    errorDiv.textContent = "Usuario o contrasena incorrectos.";
                    errorDiv.style.display = "block";
                }
                return;
            }

            this.recepcionista = await response.json();
            localStorage.setItem("recepcionista", JSON.stringify(this.recepcionista));
            this._mostrarPanel();
            this._iniciarPanel();
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = "No se pudo conectar con el servidor.";
                errorDiv.style.display = "block";
            }
        }
    }

    async _registrarRecepcionista() {
        var nombreInput = document.getElementById("registro-nombre");
        var usuarioInput = document.getElementById("login-usuario");
        var passwordInput = document.getElementById("login-password");
        var errorDiv = document.getElementById("login-error");
        var nombre = nombreInput ? nombreInput.value.trim() : "";
        var username = usuarioInput ? usuarioInput.value.trim() : "";
        var password = passwordInput ? passwordInput.value : "";

        if (errorDiv) errorDiv.style.display = "none";

        try {
            var response = await fetch(ApiClient.url("/api/auth/recepcion/registro"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nombre, username: username, password: password })
            });

            if (!response.ok) {
                var mensaje = await this._leerMensajeError(response);
                if (errorDiv) {
                    errorDiv.textContent = mensaje || "No se pudo registrar la recepcionista.";
                    errorDiv.style.display = "block";
                }
                return;
            }

            this.recepcionista = await response.json();
            localStorage.setItem("recepcionista", JSON.stringify(this.recepcionista));
            this._mostrarPanel();
            this._iniciarPanel();
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = "No se pudo conectar con el servidor.";
                errorDiv.style.display = "block";
            }
        }
    }

    async _leerMensajeError(response) {
        try {
            var data = await response.json();
            return data.message || data.mensaje || "Solicitud invalida.";
        } catch (error) {
            return await response.text();
        }
    }

    // Privado — carga las habitaciones del backend
    async _cargarHabitaciones() {
        try {
            var response = await fetch(ApiClient.url("/api/v1/habitaciones"));

            if (!response.ok) {
                console.error("Error al cargar habitaciones:", response.status);
                return;
            }

            var habitaciones = (await response.json()).map(function (habitacion) {
                return {
                    ...habitacion,
                    estado: RecepcionController._normalizarEstado(habitacion.estado || habitacion.estadoActual)
                };
            });
            this.habitaciones = habitaciones;
            this.view.renderizarHabitaciones(habitaciones);

        } catch (error) {
            console.error("No se pudo conectar con el servidor:", error);
        }
    }

    // Privado — actualiza el dashboard automaticamente
    _iniciarActualizacionAutomatica() {
        var self = this;
        this._intervaloActualizacion = setInterval(function () {
            self._cargarHabitaciones();
        }, 5000);

        window.addEventListener("focus", function () {
            self._cargarHabitaciones();
        });

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                self._cargarHabitaciones();
            }
        });
    }

    static _normalizarEstado(estado) {
        var estados = {
            "Disponible": "DISPONIBLE",
            "DISPONIBLE": "DISPONIBLE",
            "Pendiente de pago": "PENDIENTE_PAGO",
            "PENDIENTE_PAGO": "PENDIENTE_PAGO",
            "Pagada": "PAGADA",
            "PAGADA": "PAGADA",
            "Ocupada": "ACTIVA",
            "ACTIVA": "ACTIVA",
            "Limpieza": "LIMPIEZA",
            "En limpieza": "LIMPIEZA",
            "LIMPIEZA": "LIMPIEZA",
            "Mantenimiento": "MANTENIMIENTO",
            "MANTENIMIENTO": "MANTENIMIENTO"
        };

        return estados[estado] || "DISPONIBLE";
    }

    // Privado — maneja el click en una habitacion segun su estado
    async _manejarClickHabitacion(id, estado, accion) {
        var self = this;
        var habitacion = this.habitaciones.find(h => h.id == id);
        if (!habitacion) {
            console.error("Habitación no encontrada:", id);
            return;
        }

        // Si el usuario hace clic directamente en el botón de la tarjeta ("limpieza" o "disponible"), proceder sin abrir el modal.
        if (accion === "limpieza") {
            if (estado === "ACTIVA") {
                this._iniciarPreverificacionCheckout(id);
                return;
            }
            this._marcarHabitacionEnLimpieza(id);
            return;
        }
        if (accion === "disponible") {
            this._marcarHabitacionDisponible(id);
            return;
        }

        try {
            // Cargar datos en paralelo
            var [respInventario, respIncidencias, respReservas] = await Promise.all([
                fetch(ApiClient.url("/api/inventario/habitacion/" + id)),
                fetch(ApiClient.url("/api/inventario/incidencias")),
                fetch(ApiClient.url("/api/checkin/buscar?termino=" + id))
            ]);

            var itemsInventario = await respInventario.json();
            var incidencias = await respIncidencias.json();
            var reservas = await respReservas.json();
            var reservaActiva = reservas.find(r => r.estado === "ACTIVA" || r.estado === "PAGADA");

            this.view.mostrarModalDetalleHabitacion(
                habitacion,
                itemsInventario,
                incidencias,
                reservaActiva,
                {
                    onConciliarItem: async function(itemId, cantidadReal, modalOverlay) {
                        try {
                            var url = ApiClient.url("/api/inventario/habitacion/" + id + "/conciliar?itemId=" + itemId + "&cantidadReal=" + cantidadReal + "&recepcionista=" + encodeURIComponent(self.recepcionista.nombre));
                            var resp = await fetch(url, { method: "POST" });
                            if (resp.ok) {
                                // Recargar datos del modal
                                var updatedInvResp = await fetch(ApiClient.url("/api/inventario/habitacion/" + id));
                                var updatedInv = await updatedInvResp.json();
                                modalOverlay.remove();
                                // Re-abrir con datos frescos
                                self._manejarClickHabitacion(id, estado, accion);
                                self._cargarFinanzasYInventario();
                            } else {
                                alert("Error al conciliar inventario.");
                            }
                        } catch (e) {
                            console.error("Error conciliar:", e);
                            alert("Error al conectar con el servidor.");
                        }
                    },
                    onCambiarEstado: async function(nuevoEstado) {
                        if (nuevoEstado === "limpieza") {
                            await self._marcarHabitacionEnLimpieza(id);
                        } else if (nuevoEstado === "disponible") {
                            await self._marcarHabitacionDisponible(id);
                        }
                    },
                    onIniciarCheckout: function() {
                        self._iniciarPreverificacionCheckout(id);
                    },
                    onReportarIncidencia: function() {
                        self._abrirReportarIncidencia(id);
                    },
                    onAbrirAsignarItem: async function(modalOverlay) {
                        try {
                            var respItems = await fetch(ApiClient.url("/api/inventario/items"));
                            if (!respItems.ok) {
                                alert("No se pudo cargar el catálogo de artículos.");
                                return;
                            }
                            var catalog = await respItems.json();
                            
                            // Filtrar artículos ya asignados
                            var assignedIds = itemsInventario.map(i => i.itemId);
                            var filteredCatalog = catalog.filter(item => !assignedIds.includes(item.id));

                            if (filteredCatalog.length === 0) {
                                alert("Todos los artículos del catálogo ya están asignados a esta habitación.");
                                return;
                            }

                            self.view.mostrarModalAsignarItem(habitacion, filteredCatalog, async function(itemId, qty) {
                                try {
                                    var url = ApiClient.url("/api/inventario/habitacion/" + id + "/items?itemId=" + itemId + "&cantidadEsperada=" + qty);
                                    var resp = await fetch(url, { method: "POST" });
                                    if (resp.ok) {
                                        modalOverlay.remove();
                                        self._manejarClickHabitacion(id, estado, accion);
                                    } else {
                                        alert("Error al asignar el artículo.");
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Error al conectar con el servidor.");
                                }
                            });
                        } catch (e) {
                            console.error(e);
                            alert("Error al conectar con el servidor.");
                        }
                    },
                    onEliminarItem: async function(itemId, modalOverlay) {
                        if (confirm("¿Está seguro de desasignar este artículo de la habitación?")) {
                            try {
                                var url = ApiClient.url("/api/inventario/habitacion/" + id + "/items/" + itemId);
                                var resp = await fetch(url, { method: "DELETE" });
                                if (resp.ok) {
                                    modalOverlay.remove();
                                    self._manejarClickHabitacion(id, estado, accion);
                                } else {
                                    alert("Error al desasignar el artículo.");
                                }
                            } catch (e) {
                                console.error(e);
                                alert("Error al conectar con el servidor.");
                            }
                        }
                    }
                }
            );

        } catch (error) {
            console.error("Error al abrir ficha de habitación:", error);
            alert("Error al cargar los datos de la habitación.");
        }
    }

    async _marcarHabitacionEnLimpieza(id) {
        await this._actualizarEstadoHabitacion(id, "limpieza", "Habitacion marcada en limpieza.");
    }

    async _marcarHabitacionDisponible(id) {
        await this._actualizarEstadoHabitacion(id, "disponible", "Habitacion marcada como disponible.");
    }

    async _actualizarEstadoHabitacion(id, accion, mensajeExito) {
        try {
            var response = await fetch(ApiClient.url("/api/v1/habitaciones/" + id + "/" + accion), {
                method: "PATCH"
            });

            if (!response.ok) {
                var error = await response.text();
                alert("No se pudo actualizar la habitacion: " + error);
                return;
            }

            this._cargarHabitaciones();
            alert(mensajeExito);
        } catch (error) {
            console.error("Error al actualizar habitacion:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    async _buscarReservas(termino) {
        try {
            if (!termino) {
                alert("Ingresa CI, nombre o codigo de reserva.");
                return;
            }

            var response = await fetch(ApiClient.url("/api/checkin/buscar?termino=" + encodeURIComponent(termino)));

            if (!response.ok) {
                alert("No se encontro una reserva valida.");
                return;
            }

            var reservas = await response.json();
            this.view.renderizarResultadosBusqueda(reservas, (reserva) => {
                this._abrirReservaCheckin(reserva);
            });

        } catch (error) {
            console.error("Error al buscar reservas:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    // Privado — busca la reserva de una habitacion confirmada
    async _buscarReservaPorHabitacion(habitacionId) {
        try {
            // Pedimos al recepcionista el CI del huesped
            var ci = prompt("Ingresa el CI del huesped para buscar la reserva:");
            if (!ci) return;

            var response = await fetch(ApiClient.url("/api/checkin/buscar?ci=" + ci.trim()));

            if (!response.ok) {
                alert("No se encontro ninguna reserva para ese CI.");
                return;
            }

            var reservas = await response.json();

            if (!reservas || reservas.length === 0) {
                alert("No hay reservas confirmadas para ese CI.");
                return;
            }

            // Tomamos la primera reserva confirmada
            var reserva = reservas.find(r => r.estado === "PAGADA");

            if (!reserva) {
                alert("No hay reservas en estado Confirmada para ese CI.");
                return;
            }

            this._abrirReservaCheckin(reserva);

        } catch (error) {
            console.error("Error al buscar reserva:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    _abrirReservaCheckin(reserva) {
        this.reservaActual = reserva;
        this.view.mostrarModalCheckin(reserva);

        this.view.onRegistrarPagoEfectivo(() => {
            this._registrarPagoEfectivo(reserva.id);
        });

        this.view.onConfirmarCheckin(() => {
            this._confirmarCheckin(reserva.id);
        });

        this.view.onCancelarCheckin(() => {
            this._cancelarCheckin(reserva.id);
        });
    }

    async _registrarPagoEfectivo(reservaId) {
        try {
            var response = await fetch(ApiClient.url("/api/v1/pagos/efectivo/" + reservaId), {
                method: "POST"
            });

            if (!response.ok) {
                var error = await response.text();
                this.view.mostrarError("Error al registrar pago efectivo: " + error);
                return;
            }

            alert("Pago efectivo registrado. Ahora puedes confirmar el check-in.");
            var overlay = document.getElementById("modal-checkin");
            if (overlay) overlay.remove();
            var reservaResponse = await fetch(ApiClient.url("/api/checkin/buscar?codigo=" + reservaId));
            var reservas = await reservaResponse.json();
            if (reservas && reservas.length > 0) {
                this._abrirReservaCheckin(reservas[0]);
            }
            this._cargarHabitaciones();

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — confirma el check-in
    async _confirmarCheckin(reservaId) {
        try {
            var formData = this.view.obtenerDatosCheckin();
            if (!formData) return;
            formData.append("recepcionista", this.recepcionista.nombre);

            var response = await fetch(ApiClient.url("/api/checkin/" + reservaId), {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                var error = await response.text();
                this.view.mostrarError("Error al realizar el check-in: " + error);
                return;
            }

            var reservaActualizada = await response.json();
            this.view.mostrarExitoCheckin(reservaActualizada);
            this._cargarHabitaciones();

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // Privado — cancela por identidad incorrecta
    async _cancelarCheckin(reservaId) {
        try {
            var response = await fetch(ApiClient.url("/api/checkin/" + reservaId + "/cancelar"), {
                method: "POST"
            });

            if (!response.ok) {
                this.view.mostrarError("Error al cancelar la reserva.");
                return;
            }

            var overlay = document.getElementById("modal-checkin");
            if (overlay) overlay.remove();

            alert("Reserva cancelada. La habitacion vuelve a estar disponible.");
            this._cargarHabitaciones();

        } catch (error) {
            this.view.mostrarError("No se pudo conectar con el servidor.");
        }
    }

    async _abrirCrearHabitacion() {
        var tipos = await this._cargarTiposHabitacion();
        if (!tipos) return;

        this.view.mostrarModalHabitacion(tipos, null, async (formData) => {
            try {
                var response = await fetch(ApiClient.url("/api/v1/habitaciones"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) {
                    var error = await this._leerMensajeError(response);
                    this.view.mostrarFormError("No se pudo crear la habitación: " + error);
                    return;
                }
                this.view.cerrarModalHabitacion();
                this._cargarHabitaciones();
                this.view.mostrarMensaje("Éxito", "Habitación creada con éxito.", "exito");
            } catch (error) {
                this.view.mostrarFormError("Error al conectar con el servidor.");
            }
        });
    }

    async _abrirEditarHabitacion(id, data) {
        var tipos = await this._cargarTiposHabitacion();
        if (!tipos) return;

        var tipoEncontrado = tipos.find(t => t.nombreTipo === data.tipo);
        var habitacionData = {
            numero: data.numero,
            tipoId: tipoEncontrado ? tipoEncontrado.id : "",
            estado: data.estado
        };

        this.view.mostrarModalHabitacion(tipos, habitacionData, async (formData) => {
            try {
                var response = await fetch(ApiClient.url("/api/v1/habitaciones/" + id), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) {
                    var error = await this._leerMensajeError(response);
                    this.view.mostrarFormError("No se pudo actualizar la habitación: " + error);
                    return;
                }
                this.view.cerrarModalHabitacion();
                this._cargarHabitaciones();
                this.view.mostrarMensaje("Éxito", "Habitación actualizada con éxito.", "exito");
            } catch (error) {
                this.view.mostrarFormError("Error al conectar con el servidor.");
            }
        });
    }

    async _confirmarEliminarHabitacion(id, data) {
        this.view.mostrarConfirmacion("¿Estás seguro de que deseas eliminar la habitación " + data.numero + "?", async () => {
            try {
                var response = await fetch(ApiClient.url("/api/v1/habitaciones/" + id), {
                    method: "DELETE"
                });
                if (!response.ok) {
                    var error = await this._leerMensajeError(response);
                    this.view.mostrarMensaje("Error", "No se pudo eliminar la habitación: " + error, "error");
                    return;
                }
                this._cargarHabitaciones();
                this.view.mostrarMensaje("Éxito", "Habitación eliminada con éxito.", "exito");
            } catch (error) {
                this.view.mostrarMensaje("Error", "Error al conectar con el servidor.", "error");
            }
        });
    }

    async _cargarTiposHabitacion() {
        try {
            var response = await fetch(ApiClient.url("/api/v1/habitaciones/tipos"));
            if (!response.ok) {
                this.view.mostrarMensaje("Error", "No se pudieron cargar los tipos de habitación.", "error");
                return null;
            }
            return await response.json();
        } catch (error) {
            this.view.mostrarMensaje("Error", "Error al obtener los tipos de habitación.", "error");
            return null;
        }
    }

    _alternarFinanzasPanel() {
        var panel = document.getElementById("finanzas-inventario-panel");
        var grid = document.getElementById("habitaciones-grid");
        var search = document.querySelector(".recepcion-busqueda");
        var leyendas = document.querySelector(".leyenda-container");
        var stats = document.querySelector(".stats-container");
        var btnFinanzas = document.getElementById("btn-finanzas-panel");

        if (panel.style.display === "none") {
            panel.style.display = "block";
            grid.style.display = "none";
            if (search) search.style.display = "none";
            if (leyendas) leyendas.style.display = "none";
            if (stats) stats.style.display = "none";
            btnFinanzas.textContent = "🏨 Ver Habitaciones";
            this._cargarFinanzasYInventario();
        } else {
            panel.style.display = "none";
            grid.style.display = "grid";
            if (search) search.style.display = "flex";
            if (leyendas) leyendas.style.display = "flex";
            if (stats) stats.style.display = "grid";
            btnFinanzas.textContent = "📊 Finanzas e Inventario";
            this._cargarHabitaciones();
        }
    }

    async _cargarFinanzasYInventario() {
        try {
            var responseReporte = await fetch(ApiClient.url("/api/finanzas/reporte"));
            var reporte = await responseReporte.json();

            var responseItems = await fetch(ApiClient.url("/api/inventario/items"));
            var items = await responseItems.json();

            var responseIncidencias = await fetch(ApiClient.url("/api/inventario/incidencias"));
            var incidencias = await responseIncidencias.json();

            this.view.renderizarFinanzasYInventario(
                reporte,
                items,
                incidencias,
                (incidenciaId, costo) => {
                    this._resolverIncidencia(incidenciaId, costo);
                },
                (item) => {
                    this._abrirEditarInventarioItem(item);
                },
                (item) => {
                    this._confirmarEliminarInventarioItem(item);
                }
            );
        } catch (error) {
            console.error("Error al cargar finanzas e inventario:", error);
        }
    }

    _abrirCrearInventarioItem() {
        var self = this;
        this.view.mostrarModalInventarioItem(null, async function(payload, overlay) {
            try {
                var response = await fetch(ApiClient.url("/api/inventario/items"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    overlay.remove();
                    self._cargarFinanzasYInventario();
                } else {
                    var errorData = await response.json();
                    document.getElementById("item-form-error").textContent = errorData.message || "Error al registrar el artículo.";
                    document.getElementById("item-form-error").style.display = "block";
                }
            } catch (error) {
                console.error("Error al registrar artículo:", error);
                document.getElementById("item-form-error").textContent = "Error de red o servidor.";
                document.getElementById("item-form-error").style.display = "block";
            }
        });
    }

    _abrirEditarInventarioItem(item) {
        var self = this;
        this.view.mostrarModalInventarioItem(item, async function(payload, overlay) {
            try {
                var response = await fetch(ApiClient.url("/api/inventario/items/" + item.id), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    overlay.remove();
                    self._cargarFinanzasYInventario();
                } else {
                    var errorData = await response.json();
                    document.getElementById("item-form-error").textContent = errorData.message || "Error al actualizar el artículo.";
                    document.getElementById("item-form-error").style.display = "block";
                }
            } catch (error) {
                console.error("Error al actualizar artículo:", error);
                document.getElementById("item-form-error").textContent = "Error de red o servidor.";
                document.getElementById("item-form-error").style.display = "block";
            }
        });
    }

    async _confirmarEliminarInventarioItem(item) {
        if (confirm("¿Está seguro de eliminar el artículo '" + item.nombre + "' del catálogo? Esto eliminará automáticamente su stock en todas las habitaciones y sus incidencias activas.")) {
            try {
                var response = await fetch(ApiClient.url("/api/inventario/items/" + item.id), {
                    method: "DELETE"
                });
                if (response.ok) {
                    this._cargarFinanzasYInventario();
                } else {
                    alert("Error al eliminar el artículo.");
                }
            } catch (error) {
                console.error("Error al eliminar artículo:", error);
                alert("Error al conectar con el servidor.");
            }
        }
    }

    async _registrarEgreso() {
        var desc = document.getElementById("egreso-descripcion").value.trim();
        var monto = parseFloat(document.getElementById("egreso-monto").value) || 0.0;
        var cat = document.getElementById("egreso-categoria").value;
        var comp = document.getElementById("egreso-comprobante").value.trim();

        try {
            var response = await fetch(ApiClient.url("/api/finanzas/egresos"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    descripcion: desc,
                    monto: monto,
                    categoria: cat,
                    recepcionista: this.recepcionista.nombre,
                    urlComprobante: comp || null
                })
            });

            if (!response.ok) {
                alert("No se pudo registrar el egreso.");
                return;
            }

            alert("Egreso registrado con éxito.");
            document.getElementById("form-registrar-egreso").reset();
            this._cargarFinanzasYInventario();
        } catch (error) {
            console.error("Error al registrar egreso:", error);
        }
    }

    async _resolverIncidencia(id, costo) {
        try {
            var response = await fetch(ApiClient.url("/api/inventario/incidencias/" + id + "/resolver?costoReparacion=" + costo + "&recepcionista=" + encodeURIComponent(this.recepcionista.nombre)), {
                method: "POST"
            });
            if (!response.ok) {
                alert("No se pudo resolver la incidencia.");
                return;
            }
            alert("Incidencia resuelta. La habitación vuelve a estar disponible.");
            this._cargarFinanzasYInventario();
        } catch (error) {
            console.error("Error al resolver incidencia:", error);
        }
    }

    async _iniciarPreverificacionCheckout(habitacionId) {
        try {
            var responseReservas = await fetch(ApiClient.url("/api/checkin/buscar?termino=" + habitacionId));
            var reservas = await responseReservas.json();
            var reserva = reservas.find(r => r.estado === "ACTIVA");

            if (!reserva) {
                alert("No se encontró una reserva activa para esta habitación.");
                return;
            }

            var responseInventario = await fetch(ApiClient.url("/api/inventario/habitacion/" + habitacionId));
            var itemsInventario = await responseInventario.json();

            this.view.mostrarModalPreverificacionCheckout(reserva, itemsInventario, (camarera, detalles, observaciones) => {
                this._procesarPreverificacionCheckout(reserva, camarera, detalles, observaciones);
            });

        } catch (error) {
            console.error("Error al iniciar la pre-verificación de checkout:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    async _procesarPreverificacionCheckout(reserva, camarera, detalles, observaciones) {
        try {
            var response = await fetch(ApiClient.url("/api/checkin/verificar"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reserva.id,
                    recepcionista: this.recepcionista.nombre,
                    nombreCamarera: camarera,
                    observaciones: observaciones,
                    detalles: detalles
                })
            });

            if (!response.ok) {
                var errorText = await response.text();
                alert("Error al registrar pre-verificación: " + errorText);
                return;
            }

            var preverificacion = await response.json();

            if (preverificacion.totalCargosExtra > 0) {
                alert("Se aplicaron cargos adicionales por Bs " + preverificacion.totalCargosExtra.toFixed(2) + " debido a faltantes o daños.");
            }

            var tieneDanos = detalles.some(d => d.estadoReportado === "DAÑADO");
            if (tieneDanos) {
                alert("La habitación ha sido enviada a MANTENIMIENTO debido a los daños reportados.");
            } else {
                alert("Habitación enviada a limpieza.");
            }

            this._cargarHabitaciones();

        } catch (error) {
            console.error("Error al procesar la pre-verificación:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    async _abrirReportarIncidencia(habitacionId) {
        try {
            var response = await fetch(ApiClient.url("/api/inventario/items"));
            var items = await response.json();
            var itemsFiltrados = items.filter(i => i.tipo === "ACTIVO_FIJO" || i.tipo === "REUSABLE");

            this.view.mostrarModalReportarIncidencia(habitacionId, itemsFiltrados, async (itemId, desc) => {
                try {
                    var postResponse = await fetch(ApiClient.url("/api/inventario/incidencias"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            habitacionId: habitacionId,
                            itemId: itemId,
                            descripcion: desc,
                            recepcionistaReporta: this.recepcionista.nombre
                        })
                    });

                    if (!postResponse.ok) {
                        alert("No se pudo registrar la incidencia.");
                        return;
                    }

                    alert("Incidencia registrada. La habitación ahora está en MANTENIMIENTO.");
                    this._cargarHabitaciones();
                } catch (error) {
                    console.error("Error al guardar incidencia:", error);
                }
            });
        } catch (error) {
            console.error("Error al obtener catálogo para incidencias:", error);
        }
    }
}

// Arrancar el controlador solo cuando exista el panel en la pantalla actual
if (document.getElementById("habitaciones-grid")) {
    var recepcionApp = new RecepcionController();
}
