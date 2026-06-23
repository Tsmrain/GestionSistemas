class RecepcionController {

    constructor() {
        this.view = new RecepcionView();
        this.reservaActual = null;
        this._intervaloActualizacion = null;
        this.modoRegistro = false;
        this.recepcionista = this._obtenerSesionRecepcionista();
        this.periodoFinanzas = "hoy";
        this._panelIniciado = false;
        this.estadosOperativosForzados = {};
        this.adminModulo = "clientes";
        this.adminDatos = {};
        this.adminBusquedaClientes = "";

        this._configurarProteccionSesion();
        this._configurarLogin();
        if (this.recepcionista) {
            this._mostrarPanel();
            this._iniciarPanel();
        } else {
            this._mostrarLogin();
        }
    }

    _iniciarPanel() {
        if (this._panelIniciado) {
            this._cargarHabitaciones();
            return;
        }
        this._panelIniciado = true;
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

        var btnAdmin = document.getElementById("btn-admin-panel");
        if (btnAdmin) {
            btnAdmin.addEventListener("click", function() {
                self._alternarAdminPanel();
            });
        }

        var tabsAdmin = document.getElementById("admin-tabs");
        if (tabsAdmin) {
            tabsAdmin.addEventListener("click", function(event) {
                var boton = event.target.closest("button[data-admin-modulo]");
                if (!boton) return;
                self.adminModulo = boton.dataset.adminModulo;
                tabsAdmin.querySelectorAll("button").forEach(function(btn) {
                    btn.classList.toggle("activo", btn === boton);
                });
                self._cargarAdministracion();
            });
        }

        var adminContent = document.getElementById("admin-content");
        if (adminContent) {
            adminContent.addEventListener("submit", function(event) {
                self._manejarSubmitAdmin(event);
            });
            adminContent.addEventListener("click", function(event) {
                self._manejarClickAdmin(event);
            });
        }

        var periodosFinanzas = document.getElementById("finanzas-periodos");
        if (periodosFinanzas) {
            periodosFinanzas.addEventListener("click", function(event) {
                var boton = event.target.closest("button[data-periodo]");
                if (!boton) return;
                self.periodoFinanzas = boton.dataset.periodo;
                periodosFinanzas.querySelectorAll("button").forEach(function(btn) {
                    btn.classList.toggle("activo", btn === boton);
                });
                self._cargarFinanzasYInventario();
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
                self._cerrarSesion();
            });
        }
    }

    _configurarProteccionSesion() {
        var self = this;
        window.addEventListener("pageshow", function () {
            var sesion = self._obtenerSesionRecepcionista();
            if (!sesion) {
                self.recepcionista = null;
                self._mostrarLogin();
                return;
            }

            if (!self.recepcionista) {
                self.recepcionista = sesion;
                self._mostrarPanel();
                self._iniciarPanel();
            }
        });
    }

    _cerrarSesion() {
        localStorage.removeItem("recepcionista");
        this.recepcionista = null;
        if (this._intervaloActualizacion) {
            clearInterval(this._intervaloActualizacion);
            this._intervaloActualizacion = null;
        }
        this._mostrarLogin();
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

    _mostrarLogin() {
        var login = document.getElementById("login-recepcion");
        var panel = document.getElementById("panel-recepcion");
        var nombre = document.getElementById("recepcionista-activa");

        if (panel) panel.style.display = "none";
        if (login) login.style.display = "flex";
        if (nombre) nombre.textContent = "";
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
            if (data.message || data.mensaje) {
                return data.message || data.mensaje;
            }
            if (response.status === 404) {
                return "Endpoint no encontrado: " + (data.path || response.url || "ruta desconocida") + ". Reinicia/reconstruye el backend para cargar los cambios nuevos.";
            }
            if (data.error) {
                return data.error + (data.path ? " (" + data.path + ")" : "");
            }
            return "Solicitud invalida. Estado HTTP: " + response.status + ".";
        } catch (error) {
            var texto = await response.text();
            return texto || "Solicitud invalida. Estado HTTP: " + response.status + ".";
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
                    estado: RecepcionController._normalizarEstadoTarjeta(habitacion.estado || habitacion.estadoActual)
                };
            });

            var incidencias = [];
            try {
                var respIncidencias = await fetch(ApiClient.url("/api/inventario/incidencias"));
                if (respIncidencias.ok) {
                    incidencias = await respIncidencias.json();
                }
            } catch (error) {
                console.warn("No se pudieron cargar alertas de inventario:", error);
            }

            habitaciones = habitaciones.map(function (habitacion) {
                var pendientes = incidencias.filter(function (inc) {
                    return inc.habitacionId === habitacion.id && inc.estado === "PENDIENTE";
                });
                var estadoFinal = habitacion.estado;
                if (pendientes.length > 0 && estadoFinal !== "LIMPIEZA" && estadoFinal !== "MANTENIMIENTO" && estadoFinal !== "ACTIVA") {
                    estadoFinal = "MANTENIMIENTO";
                }
                return {
                    ...habitacion,
                    estado: this._aplicarEstadoOperativoForzado(habitacion.id, estadoFinal),
                    incidenciasPendientes: pendientes.length
                };
            }, this);

            this.habitaciones = habitaciones;
            this.incidencias = incidencias;
            this.view.renderizarHabitaciones(habitaciones);
            this.view.renderizarCentroControl(habitaciones, incidencias);

        } catch (error) {
            console.error("No se pudo conectar con el servidor:", error);
        }
    }

    _actualizarHabitacionLocal(habitacionId, cambios) {
        if (!this.habitaciones || !habitacionId) return;

        var estadoActualizado = RecepcionController._normalizarEstadoTarjeta(cambios.estado || cambios.estadoActual);
        this.habitaciones = this.habitaciones.map(function (habitacion) {
            if (String(habitacion.id) !== String(habitacionId)) {
                return habitacion;
            }

            return {
                ...habitacion,
                ...cambios,
                estado: estadoActualizado,
                horaSalidaEstimada: null,
                reservaVigenteId: null,
                reservaVigenteEstado: null,
                huespedNombre: null,
                huespedCi: null
            };
        });

        this.view.renderizarHabitaciones(this.habitaciones);
        this.view.renderizarCentroControl(this.habitaciones, this.incidencias || []);
    }

    _forzarEstadoOperativo(habitacionId, estado) {
        if (!habitacionId) return;
        this.estadosOperativosForzados[String(habitacionId)] = RecepcionController._normalizarEstadoTarjeta(estado);
    }

    _limpiarEstadoOperativoForzado(habitacionId) {
        if (!habitacionId) return;
        delete this.estadosOperativosForzados[String(habitacionId)];
    }

    _aplicarEstadoOperativoForzado(habitacionId, estadoBackend) {
        var forzado = this.estadosOperativosForzados[String(habitacionId)];
        return forzado || estadoBackend;
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
        if (estado === null || estado === undefined) return "DISPONIBLE";
        var estadoOriginal = String(estado).trim();
        var estadoKey = estadoOriginal.toUpperCase();
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

        return estados[estadoOriginal] || estados[estadoKey] || estadoOriginal || "DISPONIBLE";
    }

    static _normalizarEstadoTarjeta(estado) {
        return RecepcionController._normalizarEstado(estado);
    }

    // Privado — maneja el click en una habitacion segun su estado
    async _manejarClickHabitacion(id, estado, accion) {
        var self = this;
        var habitacion = this.habitaciones.find(h => h.id == id);
        if (!habitacion) {
            console.error("Habitación no encontrada:", id);
            return;
        }

        var estadoNormalizado = RecepcionController._normalizarEstado(estado);
        if (!accion && (estadoNormalizado === "PAGADA" || estadoNormalizado === "PENDIENTE_PAGO")) {
            await this._abrirCheckinDesdeHabitacion(id, estadoNormalizado);
            return;
        }

        // Si el usuario hace clic directamente en el botón de la tarjeta ("limpieza" o "disponible"), proceder sin abrir el modal.
        if (accion === "limpieza") {
            if (estado === "ACTIVA") {
                if (!habitacion.reservaVigenteId) {
                    await this._marcarHabitacionEnLimpieza(id);
                    return;
                }
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
                fetch(ApiClient.url("/api/checkin/buscar?habitacionId=" + id))
            ]);

            var itemsInventario = await respInventario.json();
            var incidencias = await respIncidencias.json();
            var reservas = await respReservas.json();
            var reservaActiva = reservas.find(r => r.estado === "ACTIVA" || r.estado === "PAGADA");

            if (!reservaActiva && habitacion.reservaVigenteId) {
                reservaActiva = this._construirReservaDesdeHabitacion(habitacion);
            }

            var consumos = [];

            if (reservaActiva) {
                try {
                    var respConsumos = await fetch(ApiClient.url("/api/v1/consumos/reserva/" + reservaActiva.id));
                    if (respConsumos.ok) {
                        consumos = await respConsumos.json();
                    }
                } catch (error) {
                    console.warn("No se pudo cargar el historial de consumos:", error);
                }
            }

            this.view.mostrarModalDetalleHabitacion(
                habitacion,
                itemsInventario,
                incidencias,
                reservaActiva,
                consumos,
                {
                    onConciliarItem: async function(itemId, cantidadReal, modalOverlay) {
                        try {
                            var url = ApiClient.url("/api/inventario/habitacion/" + id + "/conciliar?itemId=" + itemId + "&cantidadReal=" + cantidadReal + "&recepcionista=" + encodeURIComponent(self.recepcionista.nombre));
                            var resp = await fetch(url, { method: "POST" });
                            if (resp.ok) {
                                modalOverlay.remove();
                                alert("Revisión de inventario guardada.");
                                self._manejarClickHabitacion(id, estado, accion);
                                self._cargarFinanzasYInventario();
                            } else {
                                var errorTexto = await resp.text();
                                alert("No se pudo guardar la revisión: " + errorTexto);
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
                    onRegistrarIngresoPuerta: function() {
                        self._abrirIngresoPuerta(habitacion);
                    },
                    onRegistrarConsumo: async function(modalOverlay) {
                        var reservaParaConsumo = await self._resolverReservaParaConsumo(habitacion, reservaActiva);
                        if (!reservaParaConsumo) return;

                        if (reservaParaConsumo.estado !== "ACTIVA") {
                            alert("Para vender insumos la reserva debe estar ACTIVA. Estado actual: " + reservaParaConsumo.estado + ". Si el huésped ya está dentro, confirma el check-in primero.");
                            return;
                        }

                        self._abrirRegistrarConsumo(reservaParaConsumo, modalOverlay, function() {
                            self._manejarClickHabitacion(id, estado, accion);
                            self._cargarFinanzasYInventario();
                        });
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
                            var filteredCatalog = catalog.filter(item => !assignedIds.includes(item.id) && (item.stockDisponible || 0) > 0);

                            if (filteredCatalog.length === 0) {
                                alert("No hay artículos disponibles para asignar. Revisa el stock libre del catálogo.");
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
                                        var error = await self._leerMensajeError(resp);
                                        alert("Error al asignar el artículo: " + error);
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

    async _abrirCheckinDesdeHabitacion(habitacionId, estado) {
        try {
            var response = await fetch(ApiClient.url("/api/checkin/buscar?habitacionId=" + habitacionId));
            if (!response.ok) {
                alert("No se pudo encontrar la reserva de esta habitación.");
                return;
            }

            var reservas = await response.json();
            var reserva = reservas.find(function (r) {
                return r.estado === estado;
            }) || reservas.find(function (r) {
                return r.estado === "PAGADA" || r.estado === "PENDIENTE_PAGO";
            });

            if (!reserva) {
                alert("No se encontró una reserva pendiente o confirmada para esta habitación.");
                return;
            }

            this._abrirReservaCheckin(reserva);
        } catch (error) {
            console.error("Error al abrir check-in desde habitación:", error);
            alert("Error al conectar con el servidor.");
        }
    }

    _construirReservaDesdeHabitacion(habitacion) {
        return {
            id: habitacion.reservaVigenteId,
            estado: habitacion.reservaVigenteEstado || habitacion.estado,
            fechaIngreso: null,
            cantidadBloques: 1,
            montoTotal: 0,
            huesped: {
                nombre: habitacion.huespedNombre || "Huésped en habitación",
                ci: habitacion.huespedCi || ""
            },
            habitacion: {
                id: habitacion.id,
                numero: habitacion.numero,
                tipo: habitacion.tipo
            },
            horaIngreso: null,
            horaSalidaEstimada: habitacion.horaSalidaEstimada
        };
    }

    async _resolverReservaParaConsumo(habitacion, reservaActual) {
        if (reservaActual) return reservaActual;

        if (habitacion.reservaVigenteId) {
            var porId = await this._buscarReservaPorCodigoSimple(habitacion.reservaVigenteId);
            if (porId) return porId;
            return this._construirReservaDesdeHabitacion(habitacion);
        }

        return {
            id: null,
            estado: "ACTIVA",
            ventaDirecta: true,
            fechaIngreso: null,
            cantidadBloques: 1,
            montoTotal: 0,
            huesped: {
                nombre: "Venta directa en habitación",
                ci: ""
            },
            habitacion: {
                id: habitacion.id,
                numero: habitacion.numero,
                tipo: habitacion.tipo
            },
            horaIngreso: null,
            horaSalidaEstimada: habitacion.horaSalidaEstimada
        };
    }

    async _buscarReservaPorCodigoSimple(codigo) {
        try {
            var response = await fetch(ApiClient.url("/api/checkin/buscar?codigo=" + encodeURIComponent(codigo)));
            if (!response.ok) return null;
            var reservas = await response.json();
            return reservas.find(function (reserva) {
                return reserva.estado === "ACTIVA" || reserva.estado === "PAGADA";
            }) || null;
        } catch (error) {
            console.error("Error al buscar reserva por código:", error);
            return null;
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

            var habitacionActualizada = await response.json();
            if (accion === "limpieza") {
                this._forzarEstadoOperativo(id, "LIMPIEZA");
                habitacionActualizada = {
                    ...habitacionActualizada,
                    estado: "LIMPIEZA",
                    estadoActual: "Limpieza"
                };
            } else if (accion === "disponible") {
                this._limpiarEstadoOperativoForzado(id);
                habitacionActualizada = {
                    ...habitacionActualizada,
                    estado: "DISPONIBLE",
                    estadoActual: "Disponible"
                };
            }
            this._actualizarHabitacionLocal(id, habitacionActualizada);
            await this._cargarHabitaciones();
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

    async _abrirIngresoPuerta(habitacion) {
        this.view.mostrarModalIngresoPuerta(habitacion, async (datos, overlay) => {
            var errorDiv = document.getElementById("ingreso-puerta-error");
            if (errorDiv) errorDiv.style.display = "none";

            try {
                var reservaForm = new FormData();
                reservaForm.append("nombre", datos.nombre);
                reservaForm.append("ci", datos.ci);
                if (datos.celular) reservaForm.append("celular", datos.celular);
                reservaForm.append("fechaIngreso", this._formatearFechaLocal(new Date()));
                reservaForm.append("cantidadBloques", "1");
                reservaForm.append("habitacionId", String(habitacion.id));
                reservaForm.append("fotoAnverso", datos.fotoAnverso);
                reservaForm.append("fotoReverso", datos.fotoReverso);

                var reservaResponse = await fetch(ApiClient.url("/api/v1/reservas"), {
                    method: "POST",
                    body: reservaForm
                });
                if (!reservaResponse.ok) {
                    throw new Error(await this._leerMensajeError(reservaResponse));
                }

                var reserva = await reservaResponse.json();
                var pagoResponse = await fetch(ApiClient.url("/api/v1/pagos/efectivo/" + reserva.id), {
                    method: "POST"
                });
                if (!pagoResponse.ok) {
                    throw new Error(await this._leerMensajeError(pagoResponse));
                }

                var checkinForm = new FormData();
                checkinForm.append("recepcionista", this.recepcionista.nombre);
                var checkinResponse = await fetch(ApiClient.url("/api/checkin/" + reserva.id), {
                    method: "POST",
                    body: checkinForm
                });
                if (!checkinResponse.ok) {
                    throw new Error(await this._leerMensajeError(checkinResponse));
                }

                overlay.remove();
                alert("Ingreso registrado. Habitación ocupada.");
                this._cargarHabitaciones();
            } catch (error) {
                if (errorDiv) {
                    errorDiv.textContent = error.message || "No se pudo registrar el ingreso.";
                    errorDiv.style.display = "block";
                } else {
                    alert(error.message || "No se pudo registrar el ingreso.");
                }
            }
        });
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
        var adminPanel = document.getElementById("administracion-panel");
        var btnFinanzas = document.getElementById("btn-finanzas-panel");
        var btnAdmin = document.getElementById("btn-admin-panel");

        if (!panel) return;

        if (panel.style.display === "none" || panel.style.display === "") {
            if (adminPanel) adminPanel.style.display = "none";
            if (btnAdmin) btnAdmin.textContent = "⚙️ Administración";
            panel.style.display = "block";
            this._ocultarTableroRecepcion();
            if (btnFinanzas) btnFinanzas.textContent = "🏨 Ver Habitaciones";
            this._cargarFinanzasYInventario();
        } else {
            this._mostrarTableroRecepcion();
        }
    }

    _alternarAdminPanel() {
        var panel = document.getElementById("administracion-panel");
        var finanzasPanel = document.getElementById("finanzas-inventario-panel");
        var btnAdmin = document.getElementById("btn-admin-panel");
        var btnFinanzas = document.getElementById("btn-finanzas-panel");

        if (!panel) return;

        if (panel.style.display === "none" || panel.style.display === "") {
            if (finanzasPanel) finanzasPanel.style.display = "none";
            if (btnFinanzas) btnFinanzas.textContent = "📊 Finanzas e Inventario";
            panel.style.display = "block";
            this._ocultarTableroRecepcion();
            if (btnAdmin) btnAdmin.textContent = "🏨 Ver Habitaciones";
            this._cargarAdministracion();
        } else {
            this._mostrarTableroRecepcion();
        }
    }

    _ocultarTableroRecepcion() {
        var grid = document.getElementById("habitaciones-grid");
        var search = document.querySelector(".recepcion-busqueda");
        var resultados = document.getElementById("resultados-reserva");
        var leyendas = document.querySelector(".leyenda-container");
        var stats = document.querySelector(".stats-container");
        var centroControl = document.getElementById("centro-control-recepcion");

        if (grid) grid.style.display = "none";
        if (search) search.style.display = "none";
        if (resultados) resultados.style.display = "none";
        if (leyendas) leyendas.style.display = "none";
        if (stats) stats.style.display = "none";
        if (centroControl) centroControl.style.display = "none";
    }

    _mostrarTableroRecepcion() {
        var finanzasPanel = document.getElementById("finanzas-inventario-panel");
        var adminPanel = document.getElementById("administracion-panel");
        var grid = document.getElementById("habitaciones-grid");
        var search = document.querySelector(".recepcion-busqueda");
        var resultados = document.getElementById("resultados-reserva");
        var leyendas = document.querySelector(".leyenda-container");
        var stats = document.querySelector(".stats-container");
        var centroControl = document.getElementById("centro-control-recepcion");
        var btnFinanzas = document.getElementById("btn-finanzas-panel");
        var btnAdmin = document.getElementById("btn-admin-panel");

        if (finanzasPanel) finanzasPanel.style.display = "none";
        if (adminPanel) adminPanel.style.display = "none";
        if (grid) grid.style.display = "grid";
        if (search) search.style.display = "flex";
        if (resultados) resultados.style.display = "block";
        if (leyendas) leyendas.style.display = "flex";
        if (stats) stats.style.display = "grid";
        if (centroControl) centroControl.style.display = "grid";
        if (btnFinanzas) btnFinanzas.textContent = "📊 Finanzas e Inventario";
        if (btnAdmin) btnAdmin.textContent = "⚙️ Administración";
        this._cargarHabitaciones();
    }

    async _cargarFinanzasYInventario() {
        this.view.mostrarEstadoPanelFinanzas("Cargando caja, catálogo e incidencias...", "info");
        try {
            var periodo = this._obtenerRangoFinanzas();
            var responseReporte = await fetch(ApiClient.url("/api/finanzas/reporte?fechaInicio=" + periodo.fechaInicio + "&fechaFin=" + periodo.fechaFin));
            if (!responseReporte.ok) throw new Error("No se pudo cargar el reporte financiero.");
            var reporte = await responseReporte.json();

            var responseItems = await fetch(ApiClient.url("/api/inventario/items"));
            if (!responseItems.ok) throw new Error("No se pudo cargar el catálogo de inventario.");
            var items = await responseItems.json();

            var responseIncidencias = await fetch(ApiClient.url("/api/inventario/incidencias"));
            if (!responseIncidencias.ok) throw new Error("No se pudieron cargar las incidencias.");
            var incidencias = await responseIncidencias.json();

            this.view.mostrarEstadoPanelFinanzas("", "info");
            this.view.renderizarFinanzasYInventario(
                reporte,
                items,
                incidencias,
                periodo,
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
            this.view.mostrarEstadoPanelFinanzas(error.message || "No se pudo cargar Finanzas e Inventario. Revisa que el backend esté activo.", "error");
        }
    }

    _obtenerRangoFinanzas() {
        var hoy = new Date();
        var inicio = new Date(hoy);
        var etiqueta = "Resumen de hoy";
        var etiquetaCorta = "Hoy";

        if (this.periodoFinanzas === "semana") {
            inicio.setDate(hoy.getDate() - 6);
            etiqueta = "Resumen de los últimos 7 días";
            etiquetaCorta = "Semana";
        } else if (this.periodoFinanzas === "mes") {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            etiqueta = "Resumen del mes actual";
            etiquetaCorta = "Mes";
        }

        return {
            fechaInicio: this._formatearFechaLocal(inicio),
            fechaFin: this._formatearFechaLocal(hoy),
            etiqueta: etiqueta,
            etiquetaCorta: etiquetaCorta
        };
    }

    _formatearFechaLocal(fecha) {
        var year = fecha.getFullYear();
        var month = String(fecha.getMonth() + 1).padStart(2, "0");
        var day = String(fecha.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    async _abrirRegistrarConsumo(reserva, modalOverlay, onRegistrado) {
        try {
            var response = await fetch(ApiClient.url("/api/v1/consumos/productos"));
            if (!response.ok) {
                alert("No se pudo cargar el catálogo de consumos.");
                return;
            }

            var productos = await response.json();
            this.view.mostrarModalRegistrarConsumo(reserva, productos, async (items, overlayConsumo) => {
                try {
                    var crearResponse;
                    if (reserva.ventaDirecta) {
                        crearResponse = await fetch(ApiClient.url("/api/v1/ventas-insumos"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                habitacionId: reserva.habitacion.id,
                                numeroHabitacion: reserva.habitacion.numero,
                                cliente: reserva.huesped.nombre,
                                ubicacion: "HABITACION",
                                recepcionista: this.recepcionista.nombre,
                                items: items
                            })
                        });
                    } else {
                        crearResponse = await fetch(ApiClient.url("/api/v1/consumos/pagar"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                reservaId: reserva.id,
                                items: items
                            })
                        });
                    }

                    if (!crearResponse.ok) {
                        var error = await this._leerMensajeError(crearResponse);
                        alert("No se pudo registrar el consumo: " + error);
                        return;
                    }

                    var consumo = await crearResponse.json();
                    var confirmar = reserva.ventaDirecta || confirm("Consumo registrado por Bs " + consumo.total.toFixed(2) + ". ¿Marcarlo como pagado ahora?");
                    if (!reserva.ventaDirecta && confirmar) {
                        await fetch(ApiClient.url("/api/v1/consumos/" + consumo.id + "/confirmar"), { method: "POST" });
                    }

                    overlayConsumo.remove();
                    if (modalOverlay) modalOverlay.remove();
                    onRegistrado();
                } catch (error) {
                    console.error("Error al registrar consumo:", error);
                    alert("Error al conectar con el servidor.");
                }
            });
        } catch (error) {
            console.error("Error al abrir consumos:", error);
            alert("Error al conectar con el servidor.");
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
        var destinatarioInput = document.getElementById("egreso-destinatario");
        var destinoDestinatario = destinatarioInput ? destinatarioInput.value.trim() : "";
        var cat = document.getElementById("egreso-categoria").value;
        var compInput = document.getElementById("egreso-comprobante");
        var comp = compInput && compInput.files && compInput.files.length > 0 ? compInput.files[0] : null;

        try {
            var formData = new FormData();
            formData.append("descripcion", desc);
            formData.append("monto", String(monto));
            formData.append("categoria", cat);
            formData.append("recepcionista", this.recepcionista.nombre);
            if (destinoDestinatario) formData.append("destinoDestinatario", destinoDestinatario);
            if (comp) formData.append("comprobante", comp);

            var response = await fetch(ApiClient.url("/api/finanzas/egresos"), {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                var error = await this._leerMensajeError(response);
                alert("No se pudo registrar el egreso: " + error);
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
            this.view.mostrarEstadoPanelFinanzas("Cerrando incidencia de mantenimiento...", "info");

            var params = new URLSearchParams({
                costoReparacion: String(costo || 0),
                recepcionista: this.recepcionista.nombre
            });
            var response = await fetch(ApiClient.url("/api/inventario/incidencias/" + id + "/resolver?" + params.toString()), {
                method: "POST"
            });
            if (!response.ok) {
                var mensaje = await this._leerMensajeError(response);
                this.view.mostrarEstadoPanelFinanzas("No se pudo cerrar la incidencia: " + mensaje, "error");
                return;
            }
            await this._cargarFinanzasYInventario();
            await this._cargarHabitaciones();
            this.view.mostrarEstadoPanelFinanzas("Incidencia cerrada. Si no quedan incidencias pendientes, la habitación vuelve a disponible.", "success");
        } catch (error) {
            console.error("Error al resolver incidencia:", error);
            this.view.mostrarEstadoPanelFinanzas("No se pudo conectar con el backend para cerrar la incidencia.", "error");
        }
    }

    async _cargarAdministracion() {
        this._mostrarEstadoAdmin("Cargando administración...", "info");
        try {
            if (this.adminModulo === "clientes") {
                var urlClientes = "/api/admin/clientes";
                if (this.adminBusquedaClientes) {
                    urlClientes += "?termino=" + encodeURIComponent(this.adminBusquedaClientes);
                }
                var clientes = await this._fetchJsonAdmin(urlClientes);
                this.adminDatos.clientes = clientes;
                this._renderAdminClientes(clientes);
            } else if (this.adminModulo === "camareras") {
                var camareras = await this._fetchJsonAdmin("/api/admin/camareras");
                this.adminDatos.camareras = camareras;
                this._renderAdminCamareras(camareras);
            } else if (this.adminModulo === "recepcionistas") {
                var recepcionistas = await this._fetchJsonAdmin("/api/admin/recepcionistas");
                this.adminDatos.recepcionistas = recepcionistas;
                this._renderAdminRecepcionistas(recepcionistas);
            } else if (this.adminModulo === "habitaciones") {
                var datosHabitaciones = await Promise.all([
                    this._fetchJsonAdmin("/api/v1/habitaciones"),
                    this._fetchJsonAdmin("/api/v1/habitaciones/tipos")
                ]);
                this.adminDatos.habitaciones = datosHabitaciones[0];
                this.adminDatos.tiposHabitacion = datosHabitaciones[1];
                this._renderAdminHabitaciones(datosHabitaciones[0], datosHabitaciones[1]);
            } else if (this.adminModulo === "incidencias") {
                var datos = await Promise.all([
                    this._fetchJsonAdmin("/api/admin/incidencias"),
                    this._fetchJsonAdmin("/api/v1/habitaciones"),
                    this._fetchJsonAdmin("/api/inventario/items")
                ]);
                this.adminDatos.incidencias = datos[0];
                this.adminDatos.habitaciones = datos[1];
                this.adminDatos.items = datos[2];
                this._renderAdminIncidencias(datos[0], datos[1], datos[2]);
            } else if (this.adminModulo === "reportes-checkout") {
                var reportes = await this._fetchJsonAdmin("/api/admin/reportes-checkout");
                this.adminDatos.reportesCheckout = reportes;
                this._renderAdminReportesCheckout(reportes);
            }
            this._mostrarEstadoAdmin("", "info");
        } catch (error) {
            console.error("Error al cargar administración:", error);
            this._mostrarEstadoAdmin(error.message || "No se pudo cargar administración.", "error");
        }
    }

    async _fetchJsonAdmin(path) {
        var response = await fetch(ApiClient.url(path));
        if (!response.ok) {
            throw new Error(await this._leerMensajeError(response));
        }
        return await response.json();
    }

    async _enviarAdmin(path, method, payload) {
        var options = { method: method };
        if (payload !== undefined) {
            options.headers = { "Content-Type": "application/json" };
            options.body = JSON.stringify(payload);
        }
        var response = await fetch(ApiClient.url(path), options);
        if (!response.ok) {
            throw new Error(await this._leerMensajeError(response));
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    }

    _manejarSubmitAdmin(event) {
        var form = event.target.closest("form[data-admin-form]");
        if (!form) return;
        event.preventDefault();

        if (form.dataset.adminForm === "cliente") {
            this._guardarAdminCliente(form);
        } else if (form.dataset.adminForm === "camarera") {
            this._guardarAdminCamarera(form);
        } else if (form.dataset.adminForm === "recepcionista") {
            this._guardarAdminRecepcionista(form);
        } else if (form.dataset.adminForm === "habitacion") {
            this._guardarAdminHabitacion(form);
        } else if (form.dataset.adminForm === "tipo-habitacion") {
            this._guardarAdminTipoHabitacion(form);
        } else if (form.dataset.adminForm === "estado-habitacion") {
            this._guardarAdminEstadoHabitacion(form);
        } else if (form.dataset.adminForm === "incidencia") {
            this._guardarAdminIncidencia(form);
        }
    }

    _manejarClickAdmin(event) {
        var boton = event.target.closest("[data-admin-action]");
        if (!boton) return;
        event.preventDefault();
        var action = boton.dataset.adminAction;
        var id = boton.dataset.adminId;

        if (action === "buscar-clientes") {
            var inputBusqueda = document.getElementById("admin-buscar-cliente");
            this.adminBusquedaClientes = inputBusqueda ? inputBusqueda.value.trim() : "";
            this._cargarAdministracion();
        } else if (action === "limpiar-busqueda-clientes") {
            this.adminBusquedaClientes = "";
            this._cargarAdministracion();
        } else if (action === "editar-cliente") {
            this._editarAdminCliente(id);
        } else if (action === "eliminar-cliente") {
            this._eliminarAdminCliente(id);
        } else if (action === "nuevo-cliente") {
            this._limpiarFormAdminCliente();
        } else if (action === "editar-camarera") {
            this._editarAdminCamarera(id);
        } else if (action === "baja-camarera") {
            this._darBajaAdminCamarera(id);
        } else if (action === "nueva-camarera") {
            this._limpiarFormAdminCamarera();
        } else if (action === "editar-recepcionista") {
            this._editarAdminRecepcionista(id);
        } else if (action === "baja-recepcionista") {
            this._darBajaAdminRecepcionista(id);
        } else if (action === "nuevo-recepcionista") {
            this._limpiarFormAdminRecepcionista();
        } else if (action === "editar-habitacion-completa") {
            this._editarAdminHabitacionCompleta(id);
        } else if (action === "editar-habitacion-admin") {
            this._editarAdminHabitacion(id);
        } else if (action === "limpiar-atributos-habitacion") {
            this._limpiarFormAdminHabitacion();
        } else if (action === "editar-estado-habitacion-global") {
            this._editarEstadoHabitacionGlobal(decodeURIComponent(boton.dataset.adminEstado || ""));
        } else if (action === "eliminar-estado-habitacion-global") {
            this._eliminarEstadoHabitacionGlobal(decodeURIComponent(boton.dataset.adminEstado || ""));
        } else if (action === "nuevo-estado-habitacion") {
            this._limpiarFormAdminEstadoHabitacion();
        } else if (action === "editar-tipo-habitacion") {
            this._editarAdminTipoHabitacion(id);
        } else if (action === "eliminar-tipo-habitacion") {
            this._eliminarAdminTipoHabitacion(id);
        } else if (action === "nuevo-tipo-habitacion") {
            this._limpiarFormAdminTipoHabitacion();
        } else if (action === "editar-incidencia") {
            this._editarAdminIncidencia(id);
        } else if (action === "baja-incidencia") {
            this._darBajaAdminIncidencia(id);
        } else if (action === "nueva-incidencia") {
            this._limpiarFormAdminIncidencia();
        }
    }

    _renderAdminClientes(clientes) {
        var rows = clientes.map((cliente) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${this._escapeHtml(cliente.nombre)}</td>
                <td style="padding:10px;">${this._escapeHtml(cliente.ci)}</td>
                <td style="padding:10px;">${this._escapeHtml(cliente.celular || "-")}</td>
                <td style="padding:10px;">${this._escapeHtml(cliente.fechaNacimiento || "-")}</td>
                <td style="padding:10px; text-align:center;">
                    <button type="button" data-admin-action="editar-cliente" data-admin-id="${cliente.id}" style="${this._adminBtnStyle("blue")}">Editar</button>
                    <button type="button" data-admin-action="eliminar-cliente" data-admin-id="${cliente.id}" style="${this._adminBtnStyle("red")}">Eliminar</button>
                </td>
            </tr>
        `).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Clientes", "Alta, baja y modificación de clientes registrados.")}
            <div style="${this._adminCardStyle()}">
                <div style="display:flex; gap:10px; margin-bottom:14px;">
                    <input id="admin-buscar-cliente" type="text" value="${this._escapeHtml(this.adminBusquedaClientes)}" placeholder="Buscar por nombre o CI" style="${this._adminInputStyle()}">
                    <button type="button" data-admin-action="buscar-clientes" style="${this._adminBtnStyle("purple")}">Buscar</button>
                    <button type="button" data-admin-action="limpiar-busqueda-clientes" style="${this._adminBtnStyle("gray")}">Limpiar</button>
                </div>
                <form id="admin-form-cliente" data-admin-form="cliente" style="${this._adminFormGridStyle()}">
                    <input id="admin-cliente-id" type="hidden">
                    <input id="admin-cliente-anverso-actual" type="hidden">
                    <input id="admin-cliente-reverso-actual" type="hidden">
                    <input id="admin-cliente-nombre" type="text" placeholder="Nombre completo" required style="${this._adminInputStyle()}">
                    <input id="admin-cliente-ci" type="text" placeholder="CI" required style="${this._adminInputStyle()}">
                    <input id="admin-cliente-celular" type="text" placeholder="Celular" style="${this._adminInputStyle()}">
                    <input id="admin-cliente-fecha" type="date" style="${this._adminInputStyle()}">
                    <label style="font-size:12px; color:#555; display:flex; flex-direction:column; gap:4px;">Foto CI anverso
                        <input id="admin-cliente-anverso" type="file" accept="image/*" style="${this._adminInputStyle()} padding:8px 10px;">
                    </label>
                    <label style="font-size:12px; color:#555; display:flex; flex-direction:column; gap:4px;">Foto CI reverso
                        <input id="admin-cliente-reverso" type="file" accept="image/*" style="${this._adminInputStyle()} padding:8px 10px;">
                    </label>
                    <div style="display:flex; gap:10px;">
                        <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                        <button type="button" data-admin-action="nuevo-cliente" style="${this._adminBtnStyle("gray")}">Nuevo</button>
                    </div>
                </form>
            </div>
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Nombre</th>
                    <th style="padding:10px; text-align:left;">CI</th>
                    <th style="padding:10px; text-align:left;">Celular</th>
                    <th style="padding:10px; text-align:left;">Nacimiento</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, rows || this._adminEmptyRow(5, "Sin clientes registrados."))}
        `);
    }

    _renderAdminCamareras(camareras) {
        var rows = camareras.map((camarera) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${this._escapeHtml(camarera.nombre)}</td>
                <td style="padding:10px;">${this._escapeHtml(camarera.celular || "-")}</td>
                <td style="padding:10px;">${camarera.activo ? "Activa" : "Inactiva"}</td>
                <td style="padding:10px; text-align:center;">
                    <button type="button" data-admin-action="editar-camarera" data-admin-id="${camarera.id}" style="${this._adminBtnStyle("blue")}">Editar</button>
                    <button type="button" data-admin-action="baja-camarera" data-admin-id="${camarera.id}" style="${this._adminBtnStyle("red")}">Dar baja</button>
                </td>
            </tr>
        `).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Camareras", "ABM del personal que reporta habitaciones por walkie-talkie.")}
            <div style="${this._adminCardStyle()}">
                <form id="admin-form-camarera" data-admin-form="camarera" style="${this._adminFormGridStyle()}">
                    <input id="admin-camarera-id" type="hidden">
                    <input id="admin-camarera-nombre" type="text" placeholder="Nombre de camarera" required style="${this._adminInputStyle()}">
                    <input id="admin-camarera-celular" type="text" placeholder="Celular" style="${this._adminInputStyle()}">
                    <select id="admin-camarera-activo" style="${this._adminInputStyle()}">
                        <option value="true">Activa</option>
                        <option value="false">Inactiva</option>
                    </select>
                    <div style="display:flex; gap:10px;">
                        <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                        <button type="button" data-admin-action="nueva-camarera" style="${this._adminBtnStyle("gray")}">Nueva</button>
                    </div>
                </form>
            </div>
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Nombre</th>
                    <th style="padding:10px; text-align:left;">Celular</th>
                    <th style="padding:10px; text-align:left;">Estado</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, rows || this._adminEmptyRow(4, "Sin camareras registradas."))}
        `);
    }

    _renderAdminRecepcionistas(recepcionistas) {
        var rows = recepcionistas.map((recepcionista) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${this._escapeHtml(recepcionista.nombre)}</td>
                <td style="padding:10px;">${this._escapeHtml(recepcionista.username)}</td>
                <td style="padding:10px;">${recepcionista.activo ? "Activo" : "Inactivo"}</td>
                <td style="padding:10px; text-align:center;">
                    <button type="button" data-admin-action="editar-recepcionista" data-admin-id="${recepcionista.id}" style="${this._adminBtnStyle("blue")}">Editar</button>
                    <button type="button" data-admin-action="baja-recepcionista" data-admin-id="${recepcionista.id}" style="${this._adminBtnStyle("red")}">Dar baja</button>
                </td>
            </tr>
        `).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Recepción", "Usuarios que pueden iniciar sesión en el panel de recepción.")}
            <div style="${this._adminCardStyle()}">
                <form id="admin-form-recepcionista" data-admin-form="recepcionista" style="${this._adminFormGridStyle()}">
                    <input id="admin-recepcionista-id" type="hidden">
                    <input id="admin-recepcionista-nombre" type="text" placeholder="Nombre completo" required style="${this._adminInputStyle()}">
                    <input id="admin-recepcionista-username" type="text" placeholder="Usuario" required style="${this._adminInputStyle()}">
                    <input id="admin-recepcionista-password" type="password" placeholder="Contraseña (vacío mantiene actual)" style="${this._adminInputStyle()}">
                    <select id="admin-recepcionista-activo" style="${this._adminInputStyle()}">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                    <div style="display:flex; gap:10px;">
                        <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                        <button type="button" data-admin-action="nuevo-recepcionista" style="${this._adminBtnStyle("gray")}">Nuevo</button>
                    </div>
                </form>
            </div>
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Nombre</th>
                    <th style="padding:10px; text-align:left;">Usuario</th>
                    <th style="padding:10px; text-align:left;">Estado</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, rows || this._adminEmptyRow(4, "Sin usuarios de recepción registrados."))}
        `);
    }

    _renderAdminHabitaciones(habitaciones, tipos) {
        tipos = tipos || [];
        var tipoOptions = tipos.map((tipo) => `
            <option value="${tipo.id}">${this._escapeHtml(tipo.nombreTipo)} · Bs ${(tipo.precioBase || 0).toFixed(2)} · ${tipo.duracionHoras || 0}h</option>
        `).join("");
        var habitacionOptions = (habitaciones || []).map((habitacion) => `
            <option value="${habitacion.id}" data-numero="${this._escapeHtml(habitacion.numero)}">Hab. ${this._escapeHtml(habitacion.numero)}</option>
        `).join("");
        var estadosHabitacion = this._estadosHabitacionDisponibles(habitaciones);
        var estadoOptions = estadosHabitacion.map((estado) => `
            <option value="${this._escapeHtml(estado)}">${this._escapeHtml(estado)}</option>
        `).join("");
        var estadoRows = estadosHabitacion.map((estado) => {
            var habitacionesConEstado = (habitaciones || []).filter((habitacion) => {
                return this._estadoHabitacionParaRequest(habitacion.estado || habitacion.estadoActual) === estado;
            });
            return `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px; font-weight:700;">${this._escapeHtml(estado)}</td>
                    <td style="padding:10px;">${habitacionesConEstado.length}</td>
                    <td style="padding:10px;">${this._escapeHtml(habitacionesConEstado.map((habitacion) => habitacion.numero).join(", ") || "-")}</td>
                    <td style="padding:10px; text-align:center;">
                        <button type="button" data-admin-action="editar-estado-habitacion-global" data-admin-estado="${encodeURIComponent(estado)}" style="${this._adminBtnStyle("blue")}">Editar</button>
                        <button type="button" data-admin-action="eliminar-estado-habitacion-global" data-admin-estado="${encodeURIComponent(estado)}" style="${this._adminBtnStyle("red")}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join("");
        var habitacionRows = (habitaciones || []).map((habitacion) => {
            var tipo = habitacion.tipo || {};
            var tipoId = tipo.id || "";
            var estado = this._estadoHabitacionParaRequest(habitacion.estado || habitacion.estadoActual || "-");
            var editarTipoBtn = tipoId ? `
                <button type="button" data-admin-action="editar-tipo-habitacion" data-admin-id="${tipoId}" title="Editar nombre, precio y duración de esta tarifa" style="${this._adminMiniBtnStyle("blue")}">Editar tarifa</button>
            ` : "";
            return `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:10px; font-weight:700;">${this._escapeHtml(habitacion.numero)}</td>
                    <td style="padding:10px;">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <span>${this._escapeHtml(tipo.nombreTipo || "-")}</span>
                            ${editarTipoBtn}
                        </div>
                    </td>
                    <td style="padding:10px;">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <span>Bs ${((tipo.precioBase || 0)).toFixed(2)}</span>
                            ${editarTipoBtn}
                        </div>
                    </td>
                    <td style="padding:10px;">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <span>${tipo.duracionHoras || "-"}h</span>
                            ${editarTipoBtn}
                        </div>
                    </td>
                    <td style="padding:10px;">
                        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <span>${this._escapeHtml(estado)}</span>
                            <button type="button" data-admin-action="editar-habitacion-admin" data-admin-id="${habitacion.id}" title="Editar estado operativo" style="${this._adminMiniBtnStyle("blue")}">Editar estado</button>
                        </div>
                    </td>
                    <td style="padding:10px; text-align:center;">
                        <button type="button" data-admin-action="editar-habitacion-completa" data-admin-id="${habitacion.id}" style="${this._adminBtnStyle("blue")}">Editar todo</button>
                    </td>
                </tr>
            `;
        }).join("");
        var tipoRows = tipos.map((tipo) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; font-weight:700;">${this._escapeHtml(tipo.nombreTipo)}</td>
                <td style="padding:10px;">Bs ${((tipo.precioBase || 0)).toFixed(2)}</td>
                <td style="padding:10px;">${tipo.duracionHoras || 0}h</td>
                <td style="padding:10px;">${this._escapeHtml(tipo.descripcion || "-")}</td>
                <td style="padding:10px; text-align:center;">
                    <button type="button" data-admin-action="editar-tipo-habitacion" data-admin-id="${tipo.id}" style="${this._adminBtnStyle("blue")}">Editar</button>
                    <button type="button" data-admin-action="eliminar-tipo-habitacion" data-admin-id="${tipo.id}" style="${this._adminBtnStyle("red")}">Eliminar</button>
                </td>
            </tr>
        `).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Habitaciones", "Catálogo de atributos independientes y asignación a habitaciones existentes.")}
            <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:16px; align-items:start;">
                <div style="${this._adminCardStyle()}">
                    <h4 style="margin:0 0 10px; font-size:14px; color:#333;">Asignar atributos a habitación</h4>
                    <form id="admin-form-habitacion" data-admin-form="habitacion" style="${this._adminFormGridStyle()}">
                        <select id="admin-habitacion-id" required style="${this._adminInputStyle()}">
                            <option value="">Seleccione habitación existente...</option>
                            ${habitacionOptions}
                        </select>
                        <select id="admin-habitacion-tipo" required style="${this._adminInputStyle()}">
                            <option value="">Seleccione tipo...</option>
                            ${tipoOptions}
                        </select>
                        <select id="admin-habitacion-estado" required style="${this._adminInputStyle()}">
                            <option value="">Seleccione estado...</option>
                            ${estadoOptions}
                        </select>
                        <div style="display:flex; gap:10px;">
                            <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                            <button type="button" data-admin-action="limpiar-atributos-habitacion" style="${this._adminBtnStyle("gray")}">Limpiar</button>
                        </div>
                    </form>
                </div>
                <div style="${this._adminCardStyle()}">
                    <h4 style="margin:0 0 10px; font-size:14px; color:#333;">Tipo / tarifa independiente</h4>
                    <form id="admin-form-tipo-habitacion" data-admin-form="tipo-habitacion" style="${this._adminFormGridStyle()}">
                        <input id="admin-tipo-habitacion-id" type="hidden">
                        <input id="admin-tipo-habitacion-nombre" type="text" placeholder="Nombre tipo" required style="${this._adminInputStyle()}">
                        <input id="admin-tipo-habitacion-precio" type="number" min="0" step="0.01" placeholder="Precio Bs" required style="${this._adminInputStyle()}">
                        <input id="admin-tipo-habitacion-horas" type="number" min="1" step="1" placeholder="Horas" required style="${this._adminInputStyle()}">
                        <input id="admin-tipo-habitacion-descripcion" type="text" placeholder="Descripción" style="${this._adminInputStyle()}">
                        <div style="display:flex; gap:10px;">
                            <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                            <button type="button" data-admin-action="nuevo-tipo-habitacion" style="${this._adminBtnStyle("gray")}">Nuevo</button>
                        </div>
                    </form>
                </div>
                <div style="${this._adminCardStyle()}">
                    <h4 style="margin:0 0 10px; font-size:14px; color:#333;">Estado independiente</h4>
                    <form id="admin-form-estado-habitacion" data-admin-form="estado-habitacion" style="${this._adminFormGridStyle()}">
                        <input id="admin-estado-habitacion-original" type="hidden">
                        <input id="admin-estado-habitacion-nombre" type="text" placeholder="Nombre estado, ej: Pruebas" required style="${this._adminInputStyle()}">
                        <div style="display:flex; gap:10px;">
                            <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                            <button type="button" data-admin-action="nuevo-estado-habitacion" style="${this._adminBtnStyle("gray")}">Nuevo</button>
                        </div>
                    </form>
                </div>
            </div>
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Estado existente</th>
                    <th style="padding:10px; text-align:left;">Habitaciones</th>
                    <th style="padding:10px; text-align:left;">Números</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, estadoRows || this._adminEmptyRow(4, "Sin estados registrados."))}
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Número</th>
                    <th style="padding:10px; text-align:left;">Tipo</th>
                    <th style="padding:10px; text-align:left;">Precio</th>
                    <th style="padding:10px; text-align:left;">Duración</th>
                    <th style="padding:10px; text-align:left;">Estado</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, habitacionRows || this._adminEmptyRow(6, "Sin habitaciones registradas."))}
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Tipo</th>
                    <th style="padding:10px; text-align:left;">Precio</th>
                    <th style="padding:10px; text-align:left;">Duración</th>
                    <th style="padding:10px; text-align:left;">Descripción</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, tipoRows || this._adminEmptyRow(5, "Sin tipos de habitación registrados."))}
        `);
    }

    _renderAdminIncidencias(incidencias, habitaciones, items) {
        var habitacionOptions = habitaciones.map((habitacion) => {
            var tipoNombre = habitacion.tipo && habitacion.tipo.nombreTipo ? habitacion.tipo.nombreTipo : (habitacion.tipoNombre || "");
            return `<option value="${habitacion.id}">Hab. ${this._escapeHtml(habitacion.numero)} - ${this._escapeHtml(tipoNombre)}</option>`;
        }).join("");
        var itemOptions = items
            .filter((item) => item.tipo === "ACTIVO_FIJO" || item.tipo === "REUSABLE")
            .map((item) => `<option value="${item.id}">${this._escapeHtml((item.emoji || "📦") + " " + item.nombre + " (" + item.tipo + ")")}</option>`)
            .join("");
        var rows = incidencias.map((incidencia) => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">Hab. ${this._escapeHtml(incidencia.numeroHabitacion)}</td>
                <td style="padding:10px;">${this._escapeHtml(incidencia.nombreItem || "Estructural")}</td>
                <td style="padding:10px;">${this._escapeHtml(incidencia.descripcion)}</td>
                <td style="padding:10px;">${this._escapeHtml(incidencia.seguimiento || "-")}</td>
                <td style="padding:10px;">${this._escapeHtml(incidencia.recepcionistaReporta || "-")}</td>
                <td style="padding:10px;">${this._badgeIncidencia(incidencia.estado)}</td>
                <td style="padding:10px;">${this._escapeHtml(this._formatearFechaHoraAdmin(incidencia.fechaReporte))}</td>
                <td style="padding:10px; text-align:center;">
                    <button type="button" data-admin-action="editar-incidencia" data-admin-id="${incidencia.id}" style="${this._adminBtnStyle("blue")}">Editar</button>
                    <button type="button" data-admin-action="baja-incidencia" data-admin-id="${incidencia.id}" style="${this._adminBtnStyle("red")}">Dar baja</button>
                </td>
            </tr>
        `).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Incidencias", "Recepción puede crear y cerrar incidencias de mantenimiento.")}
            <div style="${this._adminCardStyle()}">
                <form id="admin-form-incidencia" data-admin-form="incidencia" style="${this._adminFormGridStyle()}">
                    <input id="admin-incidencia-id" type="hidden">
                    <select id="admin-incidencia-habitacion" required style="${this._adminInputStyle()}">
                        <option value="">Seleccione habitación...</option>
                        ${habitacionOptions}
                    </select>
                    <select id="admin-incidencia-item" style="${this._adminInputStyle()}">
                        <option value="">Estructural / Otro</option>
                        ${itemOptions}
                    </select>
                    <input id="admin-incidencia-descripcion" type="text" placeholder="Descripción del daño" required style="${this._adminInputStyle()}">
                    <textarea id="admin-incidencia-seguimiento" placeholder="Seguimiento / acciones realizadas" style="${this._adminInputStyle()} height:70px; padding:10px; resize:vertical;"></textarea>
                    <select id="admin-incidencia-estado" style="${this._adminInputStyle()}">
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="REPARADO">Reparado</option>
                        <option value="DE_BAJA">De baja</option>
                    </select>
                    <input id="admin-incidencia-costo" type="number" step="0.01" min="0" placeholder="Costo reparación Bs" style="${this._adminInputStyle()}">
                    <div style="display:flex; gap:10px;">
                        <button type="submit" style="${this._adminBtnStyle("purple")}">Guardar</button>
                        <button type="button" data-admin-action="nueva-incidencia" style="${this._adminBtnStyle("gray")}">Nueva</button>
                    </div>
                </form>
            </div>
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Habitación</th>
                    <th style="padding:10px; text-align:left;">Objeto</th>
                    <th style="padding:10px; text-align:left;">Descripción</th>
                    <th style="padding:10px; text-align:left;">Seguimiento</th>
                    <th style="padding:10px; text-align:left;">Reporta</th>
                    <th style="padding:10px; text-align:left;">Estado</th>
                    <th style="padding:10px; text-align:left;">Fecha</th>
                    <th style="padding:10px; text-align:center;">Acciones</th>
                </tr>
            `, rows || this._adminEmptyRow(8, "Sin incidencias registradas."))}
        `);
    }

    _renderAdminReportesCheckout(reportes) {
        var rows = (reportes || []).map((reporte) => {
            var detalles = (reporte.detalles || []).map((detalle) => `
                <tr style="border-bottom:1px solid #f1f1f1;">
                    <td style="padding:8px;">${this._escapeHtml(detalle.nombreItem || "-")}</td>
                    <td style="padding:8px;">${this._escapeHtml(this._estadoReporteCheckout(detalle.estadoReportado))}</td>
                    <td style="padding:8px;">${detalle.cantidad || 0}</td>
                    <td style="padding:8px;">${detalle.cobrado ? "Sí" : "No"}</td>
                    <td style="padding:8px;">Bs ${((detalle.cargoAplicado || 0)).toFixed(2)}</td>
                </tr>
            `).join("");

            return `
                <tr style="border-bottom:1px solid #eee; vertical-align:top;">
                    <td style="padding:10px; font-weight:700;">#${reporte.id}</td>
                    <td style="padding:10px;">Hab. ${this._escapeHtml(reporte.numeroHabitacion || reporte.habitacionId || "-")}</td>
                    <td style="padding:10px;">Reserva #${this._escapeHtml(reporte.reservaId || "-")}</td>
                    <td style="padding:10px;">${this._escapeHtml(this._formatearFechaHoraAdmin(reporte.fechaVerificacion))}</td>
                    <td style="padding:10px;">${this._escapeHtml(reporte.nombreCamarera || "-")}</td>
                    <td style="padding:10px;">${this._escapeHtml(reporte.recepcionista || "-")}</td>
                    <td style="padding:10px;">${reporte.conforme ? this._badgeTexto("Conforme", "#dcfce7", "#166534") : this._badgeTexto("Con observaciones", "#fff1f2", "#b42318")}</td>
                    <td style="padding:10px;">Bs ${((reporte.totalCargosExtra || 0)).toFixed(2)}</td>
                </tr>
                <tr style="border-bottom:2px solid #e5e7eb;">
                    <td colspan="8" style="padding:0 10px 14px 10px;">
                        <div style="background:#fafafa; border:1px solid #eee; border-radius:10px; padding:12px;">
                            <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:8px;">
                                <strong style="font-size:13px;">Lectura del reporte</strong>
                                <span style="font-size:12px; color:#666;">La recepcionista revisa este detalle antes de cerrar/derivar incidencias.</span>
                            </div>
                            <p style="margin:0 0 10px; color:#555; font-size:12px;"><strong>Observaciones:</strong> ${this._escapeHtml(reporte.observaciones || "Sin observaciones")}</p>
                            <div style="overflow-x:auto;">
                                <table style="width:100%; border-collapse:collapse; font-size:12px; background:#fff;">
                                    <thead>
                                        <tr style="background:#f5f5f5; color:#555;">
                                            <th style="padding:8px; text-align:left;">Objeto</th>
                                            <th style="padding:8px; text-align:left;">Estado reportado</th>
                                            <th style="padding:8px; text-align:left;">Cantidad</th>
                                            <th style="padding:8px; text-align:left;">Cobrar</th>
                                            <th style="padding:8px; text-align:left;">Cargo</th>
                                        </tr>
                                    </thead>
                                    <tbody>${detalles || this._adminEmptyRow(5, "Sin detalle de objetos.")}</tbody>
                                </table>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        this._setAdminContent(`
            ${this._adminSectionTitle("Reportes checkout", "Historial que recepción debe leer después de cada revisión de salida.")}
            ${this._adminTable(`
                <tr style="border-bottom:2px solid #eee; color:#555;">
                    <th style="padding:10px; text-align:left;">Reporte</th>
                    <th style="padding:10px; text-align:left;">Habitación</th>
                    <th style="padding:10px; text-align:left;">Reserva</th>
                    <th style="padding:10px; text-align:left;">Fecha</th>
                    <th style="padding:10px; text-align:left;">Camarera</th>
                    <th style="padding:10px; text-align:left;">Recepción</th>
                    <th style="padding:10px; text-align:left;">Resultado</th>
                    <th style="padding:10px; text-align:left;">Cargos</th>
                </tr>
            `, rows || this._adminEmptyRow(8, "Sin reportes de check-out registrados."))}
        `);
    }

    async _guardarAdminCliente(form) {
        try {
            var id = document.getElementById("admin-cliente-id").value;
            var anversoInput = document.getElementById("admin-cliente-anverso");
            var reversoInput = document.getElementById("admin-cliente-reverso");
            var anversoActual = document.getElementById("admin-cliente-anverso-actual").value;
            var reversoActual = document.getElementById("admin-cliente-reverso-actual").value;
            var anversoNuevo = anversoInput && anversoInput.files.length ? await this._leerArchivoComoDataUrl(anversoInput.files[0]) : anversoActual;
            var reversoNuevo = reversoInput && reversoInput.files.length ? await this._leerArchivoComoDataUrl(reversoInput.files[0]) : reversoActual;
            var payload = {
                nombre: document.getElementById("admin-cliente-nombre").value.trim(),
                ci: document.getElementById("admin-cliente-ci").value.trim(),
                celular: document.getElementById("admin-cliente-celular").value.trim(),
                fechaNacimiento: document.getElementById("admin-cliente-fecha").value || null,
                urlFotoAnverso: anversoNuevo,
                urlFotoReverso: reversoNuevo
            };
            await this._enviarAdmin(id ? "/api/admin/clientes/" + id : "/api/admin/clientes", id ? "PUT" : "POST", payload);
            this._mostrarEstadoAdmin("Cliente guardado correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar el cliente.", "error");
        }
    }

    async _guardarAdminCamarera(form) {
        try {
            var id = document.getElementById("admin-camarera-id").value;
            var payload = {
                nombre: document.getElementById("admin-camarera-nombre").value.trim(),
                celular: document.getElementById("admin-camarera-celular").value.trim(),
                activo: document.getElementById("admin-camarera-activo").value === "true"
            };
            await this._enviarAdmin(id ? "/api/admin/camareras/" + id : "/api/admin/camareras", id ? "PUT" : "POST", payload);
            this._mostrarEstadoAdmin("Camarera guardada correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar la camarera.", "error");
        }
    }

    async _guardarAdminRecepcionista(form) {
        try {
            var id = document.getElementById("admin-recepcionista-id").value;
            var payload = {
                nombre: document.getElementById("admin-recepcionista-nombre").value.trim(),
                username: document.getElementById("admin-recepcionista-username").value.trim(),
                password: document.getElementById("admin-recepcionista-password").value,
                activo: document.getElementById("admin-recepcionista-activo").value === "true"
            };
            await this._enviarAdmin(id ? "/api/admin/recepcionistas/" + id : "/api/admin/recepcionistas", id ? "PUT" : "POST", payload);
            this._mostrarEstadoAdmin("Usuario de recepción guardado correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar recepción.", "error");
        }
    }

    async _guardarAdminHabitacion(form) {
        try {
            var id = document.getElementById("admin-habitacion-id").value;
            var tipoId = document.getElementById("admin-habitacion-tipo").value;
            if (!id) {
                this._mostrarEstadoAdmin("Selecciona una habitación existente para editar sus atributos.", "error");
                return;
            }
            var habitacion = this._buscarAdmin("habitaciones", id);
            if (!habitacion) {
                this._mostrarEstadoAdmin("No se encontró la habitación seleccionada. Recarga el módulo e intenta otra vez.", "error");
                return;
            }
            var payload = {
                numero: habitacion.numero,
                tipoId: tipoId ? parseInt(tipoId, 10) : null,
                estadoActual: document.getElementById("admin-habitacion-estado").value.trim()
            };
            await this._enviarAdmin("/api/v1/habitaciones/" + id, "PUT", payload);
            this._mostrarEstadoAdmin("Atributos de habitación guardados correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar la habitación.", "error");
        }
    }

    async _guardarAdminTipoHabitacion(form) {
        try {
            var id = document.getElementById("admin-tipo-habitacion-id").value;
            var payload = {
                nombreTipo: document.getElementById("admin-tipo-habitacion-nombre").value.trim(),
                precioBase: parseFloat(document.getElementById("admin-tipo-habitacion-precio").value) || 0,
                duracionHoras: parseInt(document.getElementById("admin-tipo-habitacion-horas").value, 10) || 0,
                descripcion: document.getElementById("admin-tipo-habitacion-descripcion").value.trim()
            };
            await this._enviarAdmin(id ? "/api/v1/habitaciones/tipos/" + id : "/api/v1/habitaciones/tipos", id ? "PUT" : "POST", payload);
            this._mostrarEstadoAdmin("Tipo de habitación guardado correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar el tipo de habitación.", "error");
        }
    }

    async _guardarAdminEstadoHabitacion(form) {
        try {
            var original = document.getElementById("admin-estado-habitacion-original").value.trim();
            var nombre = document.getElementById("admin-estado-habitacion-nombre").value.trim();
            if (!nombre) {
                this._mostrarEstadoAdmin("El nombre del estado es obligatorio.", "error");
                return;
            }

            if (!original) {
                this._agregarEstadoAlCatalogo(nombre);
                this._mostrarEstadoAdmin("Estado creado correctamente. Ya puede asignarse a una habitación.", "success");
                form.reset();
                this._cargarAdministracion();
                return;
            }

            if (original === nombre) {
                this._mostrarEstadoAdmin("Estado guardado correctamente.", "success");
                form.reset();
                this._cargarAdministracion();
                return;
            }

            var habitaciones = this._habitacionesPorEstadoAdmin(original);
            if (!confirm("¿Renombrar el estado '" + original + "' a '" + nombre + "' en " + habitaciones.length + " habitación(es)?")) return;

            this._renombrarEstadoEnCatalogo(original, nombre);
            await this._actualizarEstadoHabitacionesAdmin(habitaciones, nombre, "Estado renombrado correctamente.");
            form.reset();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar el estado.", "error");
        }
    }

    async _guardarAdminIncidencia(form) {
        try {
            var id = document.getElementById("admin-incidencia-id").value;
            var itemId = document.getElementById("admin-incidencia-item").value;
            var payload = {
                habitacionId: parseInt(document.getElementById("admin-incidencia-habitacion").value, 10),
                itemId: itemId ? parseInt(itemId, 10) : null,
                descripcion: document.getElementById("admin-incidencia-descripcion").value.trim(),
                seguimiento: document.getElementById("admin-incidencia-seguimiento").value.trim(),
                recepcionistaReporta: this.recepcionista && this.recepcionista.nombre ? this.recepcionista.nombre : "Recepción",
                estado: document.getElementById("admin-incidencia-estado").value,
                costoReparacion: parseFloat(document.getElementById("admin-incidencia-costo").value) || 0,
                recepcionistaResuelve: this.recepcionista && this.recepcionista.nombre ? this.recepcionista.nombre : "Recepción"
            };
            await this._enviarAdmin(id ? "/api/admin/incidencias/" + id : "/api/admin/incidencias", id ? "PUT" : "POST", payload);
            this._mostrarEstadoAdmin("Incidencia guardada correctamente.", "success");
            form.reset();
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo guardar la incidencia.", "error");
        }
    }

    _editarAdminCliente(id) {
        var cliente = this._buscarAdmin("clientes", id);
        if (!cliente) {
            this._mostrarEstadoAdmin("No se encontró el cliente seleccionado. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        document.getElementById("admin-cliente-id").value = cliente.id;
        document.getElementById("admin-cliente-nombre").value = cliente.nombre || "";
        document.getElementById("admin-cliente-ci").value = cliente.ci || "";
        document.getElementById("admin-cliente-celular").value = cliente.celular || "";
        document.getElementById("admin-cliente-fecha").value = cliente.fechaNacimiento || "";
        document.getElementById("admin-cliente-anverso-actual").value = cliente.urlFotoAnverso || "";
        document.getElementById("admin-cliente-reverso-actual").value = cliente.urlFotoReverso || "";
        this._marcarModoAdmin("admin-form-cliente", "Editando cliente: " + (cliente.nombre || cliente.ci || cliente.id));
    }

    _editarAdminCamarera(id) {
        var camarera = this._buscarAdmin("camareras", id);
        if (!camarera) {
            this._mostrarEstadoAdmin("No se encontró la camarera seleccionada. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        document.getElementById("admin-camarera-id").value = camarera.id;
        document.getElementById("admin-camarera-nombre").value = camarera.nombre || "";
        document.getElementById("admin-camarera-celular").value = camarera.celular || "";
        document.getElementById("admin-camarera-activo").value = String(camarera.activo !== false);
        this._marcarModoAdmin("admin-form-camarera", "Editando camarera: " + (camarera.nombre || camarera.id));
    }

    _editarAdminRecepcionista(id) {
        var recepcionista = this._buscarAdmin("recepcionistas", id);
        if (!recepcionista) {
            this._mostrarEstadoAdmin("No se encontró el usuario de recepción seleccionado. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        document.getElementById("admin-recepcionista-id").value = recepcionista.id;
        document.getElementById("admin-recepcionista-nombre").value = recepcionista.nombre || "";
        document.getElementById("admin-recepcionista-username").value = recepcionista.username || "";
        document.getElementById("admin-recepcionista-password").value = "";
        document.getElementById("admin-recepcionista-activo").value = String(recepcionista.activo !== false);
        this._marcarModoAdmin("admin-form-recepcionista", "Editando recepción: " + (recepcionista.nombre || recepcionista.username || recepcionista.id));
    }

    _editarAdminHabitacion(id) {
        var habitacion = this._buscarAdmin("habitaciones", id);
        if (!habitacion) {
            this._mostrarEstadoAdmin("No se encontró la habitación seleccionada. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        this._cargarFormAdminHabitacion(habitacion);
        this._marcarModoAdmin("admin-form-habitacion", "Editando atributos de Hab. " + (habitacion.numero || habitacion.id));
    }

    _editarAdminHabitacionCompleta(id) {
        var habitacion = this._buscarAdmin("habitaciones", id);
        if (!habitacion) {
            this._mostrarEstadoAdmin("No se encontró la habitación seleccionada. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        this._cargarFormAdminHabitacion(habitacion);
        if (habitacion.tipo && habitacion.tipo.id) {
            this._cargarFormAdminTipoHabitacion(habitacion.tipo);
        }
        this._mostrarEstadoAdmin(
            "Editando Hab. " + (habitacion.numero || habitacion.id) + ": puedes cambiar estado, tipo asignado, nombre de tarifa, precio y duración.",
            "info"
        );
        var form = document.getElementById("admin-form-habitacion");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    _cargarFormAdminHabitacion(habitacion) {
        document.getElementById("admin-habitacion-id").value = habitacion.id;
        document.getElementById("admin-habitacion-tipo").value = habitacion.tipo && habitacion.tipo.id ? habitacion.tipo.id : "";
        document.getElementById("admin-habitacion-estado").value = this._estadoHabitacionParaRequest(habitacion.estado || habitacion.estadoActual);
    }

    _editarEstadoHabitacionGlobal(estadoActual) {
        if (!estadoActual) return;
        document.getElementById("admin-estado-habitacion-original").value = estadoActual;
        document.getElementById("admin-estado-habitacion-nombre").value = estadoActual;
        this._marcarModoAdmin("admin-form-estado-habitacion", "Editando estado: " + estadoActual);
    }

    async _eliminarEstadoHabitacionGlobal(estadoActual) {
        if (!estadoActual) return;
        if (estadoActual === "Disponible") {
            this._mostrarEstadoAdmin("No se puede eliminar Disponible porque es el estado base al liberar habitaciones.", "error");
            return;
        }
        var habitaciones = this._habitacionesPorEstadoAdmin(estadoActual);
        if (!confirm("¿Eliminar el estado '" + estadoActual + "'? Las " + habitaciones.length + " habitación(es) pasarán a Disponible.")) return;

        this._eliminarEstadoDelCatalogo(estadoActual);
        await this._actualizarEstadoHabitacionesAdmin(habitaciones, "Disponible", "Estado eliminado. Habitaciones cambiadas a Disponible.");
    }

    _habitacionesPorEstadoAdmin(estado) {
        return (this.adminDatos.habitaciones || []).filter((habitacion) => {
            return this._estadoHabitacionParaRequest(habitacion.estado || habitacion.estadoActual) === estado;
        });
    }

    async _actualizarEstadoHabitacionesAdmin(habitaciones, nuevoEstado, mensajeExito) {
        try {
            await Promise.all(habitaciones.map((habitacion) => {
                var tipoId = habitacion.tipo && habitacion.tipo.id ? habitacion.tipo.id : null;
                return this._enviarAdmin("/api/v1/habitaciones/" + habitacion.id, "PUT", {
                    numero: habitacion.numero,
                    tipoId: tipoId,
                    estadoActual: nuevoEstado
                });
            }));
            this._mostrarEstadoAdmin(mensajeExito, "success");
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo actualizar el estado.", "error");
        }
    }

    _obtenerCatalogoEstadosHabitacion() {
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
                return guardados.filter((estado) => typeof estado === "string" && estado.trim()).map((estado) => estado.trim());
            }
        } catch (error) {
            localStorage.removeItem("catalogoEstadosHabitacion");
        }
        return estadosPorDefecto;
    }

    _guardarCatalogoEstadosHabitacion(estados) {
        var limpios = [];
        (estados || []).forEach((estado) => {
            var limpio = String(estado || "").trim();
            if (limpio && !limpios.includes(limpio)) {
                limpios.push(limpio);
            }
        });
        localStorage.setItem("catalogoEstadosHabitacion", JSON.stringify(limpios));
    }

    _agregarEstadoAlCatalogo(estadoNuevo) {
        var catalogo = this._obtenerCatalogoEstadosHabitacion();
        var limpio = String(estadoNuevo || "").trim();
        if (limpio && !catalogo.includes(limpio)) {
            catalogo.push(limpio);
        }
        this._guardarCatalogoEstadosHabitacion(catalogo);
    }

    _renombrarEstadoEnCatalogo(estadoActual, nuevoEstado) {
        var existe = false;
        var catalogo = this._obtenerCatalogoEstadosHabitacion().map((estado) => {
            if (estado === estadoActual) {
                existe = true;
                return nuevoEstado;
            }
            return estado;
        });
        if (!existe) catalogo.push(nuevoEstado);
        this._guardarCatalogoEstadosHabitacion(catalogo);
    }

    _eliminarEstadoDelCatalogo(estadoActual) {
        var catalogo = this._obtenerCatalogoEstadosHabitacion().filter((estado) => estado !== estadoActual);
        this._guardarCatalogoEstadosHabitacion(catalogo);
    }

    _editarAdminTipoHabitacion(id) {
        var tipo = this._buscarAdmin("tiposHabitacion", id);
        if (!tipo) {
            this._mostrarEstadoAdmin("No se encontró el tipo seleccionado. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        this._cargarFormAdminTipoHabitacion(tipo);
        this._marcarModoAdmin("admin-form-tipo-habitacion", "Editando tipo/tarifa: " + (tipo.nombreTipo || tipo.id));
    }

    _cargarFormAdminTipoHabitacion(tipo) {
        document.getElementById("admin-tipo-habitacion-id").value = tipo.id;
        document.getElementById("admin-tipo-habitacion-nombre").value = tipo.nombreTipo || "";
        document.getElementById("admin-tipo-habitacion-precio").value = tipo.precioBase || "";
        document.getElementById("admin-tipo-habitacion-horas").value = tipo.duracionHoras || "";
        document.getElementById("admin-tipo-habitacion-descripcion").value = tipo.descripcion || "";
    }

    _editarAdminIncidencia(id) {
        var incidencia = this._buscarAdmin("incidencias", id);
        if (!incidencia) {
            this._mostrarEstadoAdmin("No se encontró la incidencia seleccionada. Recarga el módulo e intenta otra vez.", "error");
            return;
        }
        document.getElementById("admin-incidencia-id").value = incidencia.id;
        document.getElementById("admin-incidencia-habitacion").value = incidencia.habitacionId || "";
        document.getElementById("admin-incidencia-item").value = incidencia.itemId || "";
        document.getElementById("admin-incidencia-descripcion").value = incidencia.descripcion || "";
        document.getElementById("admin-incidencia-seguimiento").value = incidencia.seguimiento || "";
        document.getElementById("admin-incidencia-estado").value = incidencia.estado || "PENDIENTE";
        document.getElementById("admin-incidencia-costo").value = incidencia.costoReparacion || "";
        this._marcarModoAdmin("admin-form-incidencia", "Editando incidencia #" + incidencia.id);
    }

    async _eliminarAdminCliente(id) {
        if (!confirm("¿Eliminar este cliente? Si tiene historial de reservas, el sistema no lo permitirá.")) return;
        try {
            await this._enviarAdmin("/api/admin/clientes/" + id, "DELETE");
            this._mostrarEstadoAdmin("Cliente eliminado.", "success");
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo eliminar el cliente.", "error");
        }
    }

    async _darBajaAdminCamarera(id) {
        if (!confirm("¿Dar de baja esta camarera?")) return;
        try {
            await this._enviarAdmin("/api/admin/camareras/" + id, "DELETE");
            this._mostrarEstadoAdmin("Camarera dada de baja.", "success");
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo dar de baja la camarera.", "error");
        }
    }

    async _darBajaAdminRecepcionista(id) {
        if (!confirm("¿Dar de baja este usuario de recepción?")) return;
        try {
            await this._enviarAdmin("/api/admin/recepcionistas/" + id, "DELETE");
            this._mostrarEstadoAdmin("Recepción dada de baja.", "success");
            this._cargarAdministracion();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo dar de baja recepción.", "error");
        }
    }

    async _eliminarAdminTipoHabitacion(id) {
        if (!confirm("¿Eliminar este tipo de habitación? Si está en uso, el sistema no lo permitirá.")) return;
        try {
            await this._enviarAdmin("/api/v1/habitaciones/tipos/" + id, "DELETE");
            this._mostrarEstadoAdmin("Tipo de habitación eliminado.", "success");
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo eliminar el tipo de habitación.", "error");
        }
    }

    async _darBajaAdminIncidencia(id) {
        if (!confirm("¿Dar de baja esta incidencia?")) return;
        try {
            var recepcionista = this.recepcionista && this.recepcionista.nombre ? this.recepcionista.nombre : "Recepción";
            await this._enviarAdmin("/api/admin/incidencias/" + id + "?recepcionista=" + encodeURIComponent(recepcionista), "DELETE");
            this._mostrarEstadoAdmin("Incidencia dada de baja.", "success");
            this._cargarAdministracion();
            this._cargarHabitaciones();
        } catch (error) {
            this._mostrarEstadoAdmin(error.message || "No se pudo dar de baja la incidencia.", "error");
        }
    }

    _limpiarFormAdminCliente() {
        var form = document.getElementById("admin-form-cliente");
        if (form) form.reset();
        var id = document.getElementById("admin-cliente-id");
        if (id) id.value = "";
        var anversoActual = document.getElementById("admin-cliente-anverso-actual");
        var reversoActual = document.getElementById("admin-cliente-reverso-actual");
        if (anversoActual) anversoActual.value = "";
        if (reversoActual) reversoActual.value = "";
        this._marcarModoAdmin("admin-form-cliente", "Nuevo cliente");
    }

    _limpiarFormAdminCamarera() {
        var form = document.getElementById("admin-form-camarera");
        if (form) form.reset();
        var id = document.getElementById("admin-camarera-id");
        if (id) id.value = "";
        this._marcarModoAdmin("admin-form-camarera", "Nueva camarera");
    }

    _limpiarFormAdminRecepcionista() {
        var form = document.getElementById("admin-form-recepcionista");
        if (form) form.reset();
        var id = document.getElementById("admin-recepcionista-id");
        if (id) id.value = "";
        this._marcarModoAdmin("admin-form-recepcionista", "Nuevo usuario de recepción");
    }

    _limpiarFormAdminHabitacion() {
        var form = document.getElementById("admin-form-habitacion");
        if (form) form.reset();
        this._marcarModoAdmin("admin-form-habitacion", "Editor de atributos limpio");
    }

    _limpiarFormAdminTipoHabitacion() {
        var form = document.getElementById("admin-form-tipo-habitacion");
        if (form) form.reset();
        var id = document.getElementById("admin-tipo-habitacion-id");
        if (id) id.value = "";
        this._marcarModoAdmin("admin-form-tipo-habitacion", "Nuevo tipo de habitación");
    }

    _limpiarFormAdminEstadoHabitacion() {
        var form = document.getElementById("admin-form-estado-habitacion");
        if (form) form.reset();
        var original = document.getElementById("admin-estado-habitacion-original");
        if (original) original.value = "";
        this._marcarModoAdmin("admin-form-estado-habitacion", "Nuevo estado de habitación");
    }

    _limpiarFormAdminIncidencia() {
        var form = document.getElementById("admin-form-incidencia");
        if (form) form.reset();
        var id = document.getElementById("admin-incidencia-id");
        if (id) id.value = "";
        this._marcarModoAdmin("admin-form-incidencia", "Nueva incidencia");
    }

    _buscarAdmin(tipo, id) {
        var lista = this.adminDatos[tipo] || [];
        return lista.find(function(item) {
            return String(item.id) === String(id);
        });
    }

    _setAdminContent(html) {
        var content = document.getElementById("admin-content");
        if (!content) return;
        content.innerHTML = html;
        this._vincularBotonesAdmin(content);
    }

    _vincularBotonesAdmin(content) {
        var self = this;
        content.querySelectorAll("[data-admin-action]").forEach(function(boton) {
            boton.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                self._manejarClickAdmin(event);
            });
        });
    }

    _marcarModoAdmin(formId, mensaje) {
        var form = document.getElementById(formId);
        if (!form) return;
        form.dataset.modo = mensaje;
        this._mostrarEstadoAdmin(mensaje + ". Completa los datos y presiona Guardar.", "info");
        form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    _mostrarEstadoAdmin(mensaje, tipo) {
        var status = document.getElementById("admin-status");
        if (!status) return;
        if (!mensaje) {
            status.style.display = "none";
            status.textContent = "";
            return;
        }
        var colores = {
            info: { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
            success: { bg: "#ecfdf3", color: "#16833a", border: "#b7ebc6" },
            error: { bg: "#fff1f2", color: "#b42318", border: "#fecdd3" }
        };
        var color = colores[tipo] || colores.info;
        status.textContent = mensaje;
        status.style.display = "block";
        status.style.background = color.bg;
        status.style.color = color.color;
        status.style.border = "1px solid " + color.border;
        status.style.padding = "10px 12px";
        status.style.borderRadius = "8px";
        status.style.marginBottom = "14px";
        status.style.fontSize = "13px";
    }

    _adminSectionTitle(titulo, subtitulo) {
        return `
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
                <div>
                    <h3 style="font-size:16px; margin:0; color:#222;">${this._escapeHtml(titulo)}</h3>
                    <p style="font-size:12px; margin:3px 0 0; color:#777;">${this._escapeHtml(subtitulo)}</p>
                </div>
            </div>
        `;
    }

    _adminTable(head, body) {
        return `
            <div style="${this._adminCardStyle()} overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                    <thead>${head}</thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
        `;
    }

    _adminEmptyRow(cols, texto) {
        return `<tr><td colspan="${cols}" style="padding:18px; color:#888; text-align:center;">${this._escapeHtml(texto)}</td></tr>`;
    }

    _adminCardStyle() {
        return "background:#fff; padding:16px; border-radius:12px; border:1px solid #e8e8e8; box-shadow:0 2px 6px rgba(0,0,0,0.02); margin-bottom:16px;";
    }

    _adminFormGridStyle() {
        return "display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; align-items:center;";
    }

    _adminInputStyle() {
        return "width:100%; height:38px; padding:0 10px; border:1px solid #ddd; border-radius:8px; font-family:'Montserrat',sans-serif; font-size:13px; background:#fff;";
    }

    _adminBtnStyle(tipo) {
        var colores = {
            purple: "#7F77DD",
            blue: "#1565c0",
            red: "#ef3b3b",
            gray: "#e0e0e0"
        };
        var color = colores[tipo] || colores.gray;
        var textColor = tipo === "gray" ? "#333" : "#fff";
        return "height:34px; padding:0 12px; border:none; border-radius:8px; background:" + color + "; color:" + textColor + "; font-family:'Montserrat',sans-serif; font-weight:600; font-size:12px; cursor:pointer; margin:2px;";
    }

    _adminMiniBtnStyle(tipo) {
        var colores = {
            blue: { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
            gray: { bg: "#f5f5f5", color: "#555", border: "#e0e0e0" }
        };
        var color = colores[tipo] || colores.gray;
        return "height:24px; padding:0 8px; border:1px solid " + color.border + "; border-radius:999px; background:" + color.bg + "; color:" + color.color + "; font-family:'Montserrat',sans-serif; font-weight:700; font-size:10px; cursor:pointer; white-space:nowrap;";
    }

    _badgeIncidencia(estado) {
        var estados = {
            PENDIENTE: { texto: "Pendiente", bg: "#fff7ed", color: "#c2410c" },
            REPARADO: { texto: "Reparado", bg: "#dcfce7", color: "#166534" },
            DE_BAJA: { texto: "De baja", bg: "#f3f4f6", color: "#4b5563" }
        };
        var data = estados[estado] || estados.PENDIENTE;
        return `<span style="display:inline-block; padding:4px 10px; border-radius:999px; background:${data.bg}; color:${data.color}; font-weight:600;">${data.texto}</span>`;
    }

    _badgeTexto(texto, bg, color) {
        return `<span style="display:inline-block; padding:4px 10px; border-radius:999px; background:${bg}; color:${color}; font-weight:600;">${this._escapeHtml(texto)}</span>`;
    }

    _estadoReporteCheckout(estado) {
        var estados = {
            OK: "Conforme / está bien",
            FALTANTE: "Falta en habitación",
            "DAÑADO": "Dañado o roto"
        };
        return estados[estado] || estado || "-";
    }

    _estadoHabitacionParaRequest(estado) {
        if (!estado) return "Disponible";
        var normalizado = String(estado).trim().toUpperCase();
        if (normalizado === "DISPONIBLE") return "Disponible";
        if (normalizado === "LIMPIEZA" || normalizado === "EN LIMPIEZA") return "Limpieza";
        if (normalizado === "MANTENIMIENTO") return "Mantenimiento";
        if (normalizado === "OCUPADA" || normalizado === "ACTIVA") return "Ocupada";
        return String(estado).trim();
    }

    _estadosHabitacionDisponibles(habitaciones) {
        var estados = this._obtenerCatalogoEstadosHabitacion();
        (habitaciones || []).forEach((habitacion) => {
            var estado = this._estadoHabitacionParaRequest(habitacion.estado || habitacion.estadoActual);
            if (estado && !estados.includes(estado)) {
                estados.push(estado);
            }
        });
        return estados;
    }

    _formatearFechaHoraAdmin(value) {
        if (!value) return "-";
        var fecha = new Date(value);
        if (Number.isNaN(fecha.getTime())) return value;
        return fecha.toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" });
    }

    _leerArchivoComoDataUrl(file) {
        return new Promise(function(resolve, reject) {
            if (!file) {
                resolve("");
                return;
            }
            var reader = new FileReader();
            reader.onload = function() {
                resolve(reader.result);
            };
            reader.onerror = function() {
                reject(new Error("No se pudo leer la imagen seleccionada."));
            };
            reader.readAsDataURL(file);
        });
    }

    _escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async _iniciarPreverificacionCheckout(habitacionId) {
        try {
            var responseReservas = await fetch(ApiClient.url("/api/checkin/buscar?habitacionId=" + habitacionId));
            var reservas = await responseReservas.json();
            var reserva = reservas.find(r => r.estado === "ACTIVA");

            if (!reserva) {
                alert("No se encontró una reserva activa para esta habitación.");
                return;
            }

            var datosCheckout = await Promise.all([
                fetch(ApiClient.url("/api/inventario/habitacion/" + habitacionId)),
                fetch(ApiClient.url("/api/admin/camareras/activas"))
            ]);
            var itemsInventario = datosCheckout[0].ok ? await datosCheckout[0].json() : [];
            var camareras = datosCheckout[1].ok ? await datosCheckout[1].json() : [];

            this.view.mostrarModalPreverificacionCheckout(reserva, itemsInventario, camareras, (camarera, detalles, observaciones) => {
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

            var tieneDanos = detalles.some(d => d.estadoReportado === "DAÑADO");
            var habitacionId = preverificacion.habitacionId || (reserva.habitacion ? reserva.habitacion.id : null);
            var estadoFinal = tieneDanos ? "MANTENIMIENTO" : "LIMPIEZA";
            this._forzarEstadoOperativo(habitacionId, estadoFinal);
            this._actualizarHabitacionLocal(habitacionId, {
                estado: estadoFinal,
                estadoActual: tieneDanos ? "Mantenimiento" : "Limpieza"
            });
            await this._cargarHabitaciones();

            if (preverificacion.totalCargosExtra > 0) {
                alert("Se aplicaron cargos adicionales por Bs " + preverificacion.totalCargosExtra.toFixed(2) + " debido a faltantes o daños.");
            }

            if (tieneDanos) {
                alert("La habitación ha sido enviada a MANTENIMIENTO debido a los daños reportados.");
            } else {
                alert("Habitación enviada a limpieza.");
            }

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
