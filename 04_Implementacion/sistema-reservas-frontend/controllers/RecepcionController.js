class RecepcionController {

    constructor() {
        this.view = new RecepcionView();
        this.reservaActual = null;
        this._intervaloActualizacion = null;

        this._cargarHabitaciones();
        this._iniciarActualizacionAutomatica();

        this.view.onClickHabitacion((id, estado, accion) => {
            this._manejarClickHabitacion(id, estado, accion);
        });

        this.view.onBuscarReserva((termino) => {
            this._buscarReservas(termino);
        });
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

// Arrancar el controlador
var recepcionApp = new RecepcionController();
