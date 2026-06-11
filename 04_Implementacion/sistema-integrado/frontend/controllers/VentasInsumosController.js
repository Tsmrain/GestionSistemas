class VentasInsumosController {

    constructor() {
        this.view = new VentasInsumosView();
        this.reservas = [];
        this.productos = [];
        this.historial = [];
        this.cantidades = {};
        this.reservaSeleccionada = null;
        this.recepcionista = this._obtenerRecepcionista();
        this._configurarEventos();
        this._cargarDatos();
    }

    _configurarEventos() {
        var self = this;
        var recargar = document.getElementById("btn-recargar-ventas");
        var buscar = document.getElementById("ventas-buscar");
        var submit = document.getElementById("btn-registrar-venta");
        var nuevoInsumo = document.getElementById("btn-nuevo-insumo");

        if (recargar) {
            recargar.addEventListener("click", function () {
                self._cargarDatos();
            });
        }

        if (buscar) {
            buscar.addEventListener("input", function () {
                self._renderizarReservas();
            });
        }

        if (submit) {
            submit.addEventListener("click", function () {
                self._registrarVenta();
            });
        }

        if (nuevoInsumo) {
            nuevoInsumo.addEventListener("click", function () {
                self._abrirNuevoInsumo();
            });
        }
    }

    async _cargarDatos() {
        this.view.mostrarMensaje("Cargando habitaciones ocupadas e insumos...", "info");
        try {
            var [habitacionesResp, productosResp, historialResp] = await Promise.all([
                fetch(ApiClient.url("/api/v1/habitaciones")),
                fetch(ApiClient.url("/api/inventario/items")),
                fetch(ApiClient.url("/api/v1/ventas-insumos"))
            ]);

            if (!habitacionesResp.ok) throw new Error("No se pudieron cargar las habitaciones.");
            if (!productosResp.ok) throw new Error("No se pudieron cargar los insumos.");
            if (!historialResp.ok) throw new Error("No se pudo cargar el historial de ventas.");

            var habitaciones = await habitacionesResp.json();
            var inventarioItems = await productosResp.json();
            this.historial = await historialResp.json();
            this.productos = inventarioItems
                .filter(function (item) {
                    return item.tipo === "VENTA";
                })
                .map(function (item) {
                    return {
                        id: String(item.id),
                        nombre: item.nombre,
                        emoji: item.emoji || "📦",
                        precio: item.precioVenta || 0,
                        stock: item.stockActual || 0,
                        precioCompra: item.precioCompra || 0
                    };
                });
            this.reservas = await this._cargarHabitacionesOcupadas(habitaciones);

            this.view.mostrarMensaje("", "info");
            this._renderizarReservas();
            this._renderizarProductos();
            this.view.renderizarCarrito(this.reservaSeleccionada, this.productos, this.cantidades);
            this.view.renderizarHistorial(this.historial);
        } catch (error) {
            console.error("Error al cargar ventas:", error);
            this.view.mostrarMensaje(error.message || "No se pudo cargar la pantalla de ventas.", "error");
        }
    }

    async _cargarHabitacionesOcupadas(habitaciones) {
        var candidatas = habitaciones.filter(function (habitacion) {
            return habitacion.estadoActual === "ACTIVA"
                || habitacion.estadoActual === "Ocupada"
                || habitacion.estado === "ACTIVA";
        });

        var resultados = await Promise.all(candidatas.map(async function (habitacion) {
            if (habitacion.reservaVigenteId) {
                return {
                    id: habitacion.reservaVigenteId,
                    estado: habitacion.reservaVigenteEstado || "ACTIVA",
                    huesped: {
                        nombre: habitacion.huespedNombre || "Huésped en habitación",
                        ci: habitacion.huespedCi || ""
                    },
                    habitacion: {
                        id: habitacion.id,
                        numero: habitacion.numero,
                        tipo: habitacion.tipo
                    },
                    horaSalidaEstimada: habitacion.horaSalidaEstimada
                };
            }

            try {
                var resp = await fetch(ApiClient.url("/api/checkin/buscar?habitacionId=" + habitacion.id));
                if (!resp.ok) return VentasInsumosController._crearVentaDirecta(habitacion);
                var reservas = await resp.json();
                var reservaActiva = reservas.find(function (reserva) {
                    return reserva.estado === "ACTIVA";
                });
                return reservaActiva || VentasInsumosController._crearVentaDirecta(habitacion);
            } catch (error) {
                return VentasInsumosController._crearVentaDirecta(habitacion);
            }
        }));

        return resultados.filter(Boolean);
    }

    static _crearVentaDirecta(habitacion) {
        return {
            id: null,
            estado: "ACTIVA",
            ventaDirecta: true,
            huesped: {
                nombre: "Venta directa en habitación",
                ci: ""
            },
            habitacion: {
                id: habitacion.id,
                numero: habitacion.numero,
                tipo: habitacion.tipo
            },
            horaSalidaEstimada: habitacion.horaSalidaEstimada
        };
    }

    _renderizarReservas() {
        var termino = (document.getElementById("ventas-buscar").value || "").trim().toLowerCase();
        var filtradas = this.reservas.filter(function (reserva) {
            if (!termino) return true;
            return String(reserva.habitacion.numero).toLowerCase().includes(termino)
                || String(reserva.huesped.nombre || "").toLowerCase().includes(termino)
                || String(reserva.huesped.ci || "").toLowerCase().includes(termino);
        });

        this.view.renderizarReservas(filtradas, this.reservaSeleccionada ? this.reservaSeleccionada.id : null, (reserva) => {
            this.reservaSeleccionada = reserva;
            this._renderizarReservas();
            this.view.renderizarCarrito(this.reservaSeleccionada, this.productos, this.cantidades);
        });
    }

    _renderizarProductos() {
        this.view.renderizarProductos(
            this.productos,
            this.cantidades,
            (productoId, cantidad) => {
                this.cantidades[productoId] = cantidad;
                this.view.renderizarCarrito(this.reservaSeleccionada, this.productos, this.cantidades);
            },
            (producto) => this._abrirEditarInsumo(producto),
            (producto) => this._eliminarInsumo(producto)
        );
    }

    async _registrarVenta() {
        if (!this.reservaSeleccionada) {
            this.view.mostrarMensaje("Selecciona una habitación ocupada.", "error");
            return;
        }

        var items = Object.keys(this.cantidades)
            .filter((productoId) => this.cantidades[productoId] > 0)
            .map((productoId) => ({
                productoId: productoId,
                cantidad: this.cantidades[productoId]
            }));

        if (!items.length) {
            this.view.mostrarMensaje("Agrega al menos un insumo.", "error");
            return;
        }

        var ubicacion = document.getElementById("ventas-ubicacion").value;
        this.view.mostrarMensaje("Registrando venta...", "info");

        try {
            var response;
            if (this.reservaSeleccionada.ventaDirecta) {
                response = await fetch(ApiClient.url("/api/v1/ventas-insumos"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        habitacionId: this.reservaSeleccionada.habitacion.id,
                        numeroHabitacion: this.reservaSeleccionada.habitacion.numero,
                        cliente: this.reservaSeleccionada.huesped.nombre,
                        ubicacion: ubicacion,
                        recepcionista: this.recepcionista,
                        items: items
                    })
                });
            } else {
                response = await fetch(ApiClient.url("/api/v1/consumos/pagar"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reservaId: this.reservaSeleccionada.id,
                        items: items
                    })
                });
            }

            if (!response.ok) {
                var mensaje = await this._leerMensajeError(response);
                throw new Error(mensaje || "No se pudo registrar la venta.");
            }

            var consumo = await response.json();
            if (!this.reservaSeleccionada.ventaDirecta) {
                await fetch(ApiClient.url("/api/v1/consumos/" + consumo.id + "/confirmar"), { method: "POST" });
            }

            this.cantidades = {};
            this.view.mostrarMensaje("Venta registrada como " + (ubicacion === "HABITACION" ? "venta en habitación" : "venta en el residencial") + ". Total Bs " + consumo.total.toFixed(2) + ".", "exito");
            await this._cargarDatos();
        } catch (error) {
            console.error("Error al registrar venta:", error);
            this.view.mostrarMensaje(error.message || "No se pudo registrar la venta.", "error");
        }
    }

    async _leerMensajeError(response) {
        try {
            var data = await response.json();
            return data.message || data.mensaje || data.error || "Solicitud inválida.";
        } catch (error) {
            return await response.text();
        }
    }

    _abrirNuevoInsumo() {
        this.view.mostrarModalInsumo(null, async (payload, overlay) => {
            await this._guardarInsumo(null, payload, overlay);
        });
    }

    _abrirEditarInsumo(producto) {
        this.view.mostrarModalInsumo(producto, async (payload, overlay) => {
            await this._guardarInsumo(producto.id, payload, overlay);
        });
    }

    async _guardarInsumo(id, payload, overlay) {
        try {
            var response = await fetch(ApiClient.url("/api/inventario/items" + (id ? "/" + id : "")), {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                var mensaje = await this._leerMensajeError(response);
                this.view.mostrarMensaje("No se pudo guardar el insumo: " + mensaje, "error");
                return;
            }

            overlay.remove();
            this.view.mostrarMensaje(id ? "Insumo actualizado." : "Insumo creado.", "exito");
            await this._cargarDatos();
        } catch (error) {
            console.error("Error al guardar insumo:", error);
            this.view.mostrarMensaje("No se pudo conectar con el servidor.", "error");
        }
    }

    async _eliminarInsumo(producto) {
        if (!confirm("¿Eliminar el insumo '" + producto.nombre + "'?")) return;

        try {
            var response = await fetch(ApiClient.url("/api/inventario/items/" + producto.id), {
                method: "DELETE"
            });

            if (!response.ok) {
                var mensaje = await this._leerMensajeError(response);
                this.view.mostrarMensaje("No se pudo eliminar el insumo: " + mensaje, "error");
                return;
            }

            delete this.cantidades[producto.id];
            this.view.mostrarMensaje("Insumo eliminado.", "exito");
            await this._cargarDatos();
        } catch (error) {
            console.error("Error al eliminar insumo:", error);
            this.view.mostrarMensaje("No se pudo conectar con el servidor.", "error");
        }
    }

    _obtenerRecepcionista() {
        try {
            var raw = localStorage.getItem("recepcionista");
            var recepcionista = raw ? JSON.parse(raw) : null;
            return recepcionista && recepcionista.nombre ? recepcionista.nombre : "Recepción";
        } catch (error) {
            return "Recepción";
        }
    }
}

if (document.getElementById("ventas-productos-grid")) {
    var ventasInsumosApp = new VentasInsumosController();
}
