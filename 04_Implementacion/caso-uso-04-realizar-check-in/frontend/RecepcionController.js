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
            var response = await fetch("/api/auth/recepcion/login", {
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
            var response = await fetch("/api/auth/recepcion/registro", {
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
            var response = await fetch("/api/v1/habitaciones");

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
    _manejarClickHabitacion(id, estado, accion) {
        if (accion === "limpieza") {
            if (estado === "ACTIVA") {
                if (confirm("¿Finalizar la estadia y enviar la habitacion a limpieza?")) {
                    this._marcarHabitacionEnLimpieza(id);
                }
                return;
            }
            this._marcarHabitacionEnLimpieza(id);
            return;
        }

        if (accion === "disponible") {
            this._marcarHabitacionDisponible(id);
            return;
        }

        if (estado === "PAGADA") {
            // Solo las confirmadas/pagadas permiten check-in
            this._buscarReservaPorHabitacion(id);
        } else if (estado === "DISPONIBLE") {
            if (confirm("La habitacion esta disponible. ¿Quieres marcarla en limpieza?")) {
                this._marcarHabitacionEnLimpieza(id);
            }
        } else if (estado === "ACTIVA") {
            if (confirm("¿Finalizar la estadia y enviar la habitacion a limpieza?")) {
                this._marcarHabitacionEnLimpieza(id);
            }
        } else if (estado === "PENDIENTE_PAGO") {
            alert("Busca la reserva para registrar el pago efectivo antes del check-in.");
        } else if (estado === "LIMPIEZA" || estado === "MANTENIMIENTO") {
            if (confirm("¿Marcar esta habitacion como disponible?")) {
                this._marcarHabitacionDisponible(id);
            }
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
            var response = await fetch("/api/v1/habitaciones/" + id + "/" + accion, {
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

            var response = await fetch("/api/checkin/buscar?termino=" + encodeURIComponent(termino));

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

            var response = await fetch("/api/checkin/buscar?ci=" + ci.trim());

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
            var response = await fetch("/api/v1/pagos/efectivo/" + reservaId, {
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
            var reservaResponse = await fetch("/api/checkin/buscar?codigo=" + reservaId);
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

            var response = await fetch("/api/checkin/" + reservaId, {
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
            var response = await fetch("/api/checkin/" + reservaId + "/cancelar", {
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
}

// Arrancar el controlador solo cuando exista el panel en la pantalla actual
if (document.getElementById("habitaciones-grid")) {
    var recepcionApp = new RecepcionController();
}
