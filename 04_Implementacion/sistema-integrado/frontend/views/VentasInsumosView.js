class VentasInsumosView {

    constructor() {
        this.listaReservas = document.getElementById("ventas-reservas-lista");
        this.productosGrid = document.getElementById("ventas-productos-grid");
        this.carrito = document.getElementById("ventas-carrito");
        this.total = document.getElementById("ventas-total");
        this.reservaSeleccionada = document.getElementById("ventas-reserva-seleccionada");
        this.mensaje = document.getElementById("ventas-mensaje");
        this.submit = document.getElementById("btn-registrar-venta");
        this.historialLista = document.getElementById("ventas-historial-lista");
        this.historialResumen = document.getElementById("ventas-historial-resumen");
    }

    renderizarReservas(reservas, seleccionadaId, onSelect) {
        this.listaReservas.innerHTML = "";

        if (!reservas.length) {
            this.listaReservas.innerHTML = '<div class="ventas-vacio">No hay habitaciones ocupadas para vender insumos.</div>';
            return;
        }

        reservas.forEach(function (reserva) {
            var item = document.createElement("button");
            item.type = "button";
            var seleccionada = reserva.ventaDirecta
                ? seleccionadaId === "directa-" + reserva.habitacion.id
                : reserva.id === seleccionadaId;
            var detalle = reserva.ventaDirecta
                ? "Venta directa · Habitación ocupada"
                : "CI " + (reserva.huesped.ci || "S/CI") + " · Reserva #" + reserva.id;
            item.className = "venta-reserva-card" + (seleccionada ? " activa" : "");
            item.innerHTML = `
                <strong>Hab. ${reserva.habitacion.numero}</strong>
                <span>${reserva.huesped.nombre}</span>
                <small>${detalle}</small>
            `;
            item.addEventListener("click", function () {
                onSelect(reserva);
            });
            this.listaReservas.appendChild(item);
        }, this);
    }

    renderizarProductos(productos, cantidades, onCambiarCantidad, onEditar, onEliminar) {
        this.productosGrid.innerHTML = "";

        productos.forEach(function (producto) {
            var cantidad = cantidades[producto.id] || 0;
            var card = document.createElement("article");
            card.className = "venta-producto-card";
            card.innerHTML = `
                <div class="venta-producto-emoji">${producto.emoji || "📦"}</div>
                <div>
                    <strong>${producto.nombre}</strong>
                    <span>Bs ${producto.precio.toFixed(2)} · Stock ${producto.stock}</span>
                </div>
                <div class="venta-producto-actions">
                    <button type="button" class="venta-editar" title="Editar insumo">Editar</button>
                    <button type="button" class="venta-eliminar" title="Eliminar insumo">Eliminar</button>
                </div>
                <div class="venta-stepper">
                    <button type="button" class="venta-restar" aria-label="Restar">−</button>
                    <input type="number" min="0" max="${producto.stock}" value="${cantidad}">
                    <button type="button" class="venta-sumar" aria-label="Sumar">+</button>
                </div>
            `;

            var input = card.querySelector("input");
            card.querySelector(".venta-restar").addEventListener("click", function () {
                var nuevaCantidad = Math.max(0, (parseInt(input.value) || 0) - 1);
                input.value = nuevaCantidad;
                onCambiarCantidad(producto.id, nuevaCantidad);
            });
            card.querySelector(".venta-sumar").addEventListener("click", function () {
                var nuevaCantidad = Math.min(producto.stock, (parseInt(input.value) || 0) + 1);
                input.value = nuevaCantidad;
                onCambiarCantidad(producto.id, nuevaCantidad);
            });
            input.addEventListener("input", function () {
                var nuevaCantidad = Math.min(producto.stock, Math.max(0, parseInt(input.value) || 0));
                input.value = nuevaCantidad;
                onCambiarCantidad(producto.id, nuevaCantidad);
            });
            card.querySelector(".venta-editar").addEventListener("click", function () {
                onEditar(producto);
            });
            card.querySelector(".venta-eliminar").addEventListener("click", function () {
                onEliminar(producto);
            });

            this.productosGrid.appendChild(card);
        }, this);
    }

    renderizarCarrito(reserva, productos, cantidades) {
        var seleccionados = productos.filter(function (producto) {
            return (cantidades[producto.id] || 0) > 0;
        });
        var total = seleccionados.reduce(function (sum, producto) {
            return sum + producto.precio * cantidades[producto.id];
        }, 0);

        this.reservaSeleccionada.innerHTML = reserva
            ? `<strong>Hab. ${reserva.habitacion.numero}</strong><span>${reserva.ventaDirecta ? "Venta directa a habitación ocupada" : reserva.huesped.nombre + " · Reserva #" + reserva.id}</span>`
            : "Selecciona una habitación ocupada.";

        this.carrito.innerHTML = seleccionados.length
            ? seleccionados.map(function (producto) {
                var cantidad = cantidades[producto.id];
                return `<div class="ventas-carrito-item"><span>${producto.emoji || "📦"} ${producto.nombre} x${cantidad}</span><strong>Bs ${(producto.precio * cantidad).toFixed(2)}</strong></div>`;
            }).join("")
            : '<div class="ventas-vacio">Agrega insumos para registrar la venta.</div>';

        this.total.textContent = "Bs " + total.toFixed(2);
        this.submit.disabled = !reserva || total <= 0;
    }

    mostrarMensaje(texto, tipo) {
        if (!texto) {
            this.mensaje.style.display = "none";
            this.mensaje.textContent = "";
            return;
        }
        this.mensaje.textContent = texto;
        this.mensaje.className = "ventas-mensaje " + (tipo || "info");
        this.mensaje.style.display = "block";
    }

    renderizarHistorial(historial) {
        if (!this.historialLista) return;

        this.historialResumen.textContent = (historial || []).length + " movimientos";
        if (!historial || historial.length === 0) {
            this.historialLista.innerHTML = '<div class="ventas-vacio">Todavía no hay ventas registradas.</div>';
            return;
        }

        this.historialLista.innerHTML = historial.map(function (venta) {
            var fecha = venta.fecha ? new Date(venta.fecha) : null;
            var fechaTexto = fecha
                ? fecha.toLocaleDateString("es-BO") + " " + fecha.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
                : "Sin fecha";
            var items = (venta.items || []).map(function (item) {
                return (item.emoji || "📦") + " " + item.nombre + " x" + item.cantidad;
            }).join(" · ");
            var origen = venta.origen === "CONSUMO_RESERVA"
                ? "Cargado a reserva #" + venta.reservaId
                : "Venta directa";
            return `
                <article class="venta-historial-card">
                    <div>
                        <strong>Hab. ${venta.numeroHabitacion || "S/H"} · ${venta.cliente || "Cliente"}</strong>
                        <span>${origen} · ${venta.ubicacion || "HABITACION"} · ${fechaTexto}</span>
                        <small>${items || "Sin detalle de productos"}</small>
                    </div>
                    <b>Bs ${(venta.total || 0).toFixed(2)}</b>
                </article>
            `;
        }).join("");
    }

    mostrarModalInsumo(producto, onSubmit) {
        var overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.id = "modal-venta-insumo";

        var esEdicion = !!producto;
        var nombre = esEdicion ? producto.nombre : "";
        var stock = esEdicion ? producto.stock : 0;
        var precio = esEdicion ? producto.precio : 0;
        var compra = esEdicion ? (producto.precioCompra || 0) : 0;
        var emoji = esEdicion ? (producto.emoji || "📦") : "📦";

        overlay.innerHTML = `
            <div class="modal" style="max-width: 440px; width:100%;">
                <h2 class="modal-titulo">${esEdicion ? "Editar insumo" : "Nuevo insumo"}</h2>
                <form id="form-venta-insumo" class="venta-insumo-form">
                    <label>Nombre<input id="insumo-nombre" type="text" value="${nombre}" required></label>
                    <label>Emoji<input id="insumo-emoji" type="text" value="${emoji}" required></label>
                    <label>Stock<input id="insumo-stock" type="number" min="0" value="${stock}" required></label>
                    <label>Precio compra<input id="insumo-compra" type="number" min="0" step="0.01" value="${compra}" required></label>
                    <label>Precio venta<input id="insumo-venta" type="number" min="0" step="0.01" value="${precio}" required></label>
                    <div class="venta-insumo-actions">
                        <button type="button" id="btn-cancelar-insumo" class="btn-secundario">Cancelar</button>
                        <button type="submit" class="btn-agregar">Guardar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("btn-cancelar-insumo").addEventListener("click", function () {
            overlay.remove();
        });
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) overlay.remove();
        });

        document.getElementById("form-venta-insumo").addEventListener("submit", function (event) {
            event.preventDefault();
            onSubmit({
                nombre: document.getElementById("insumo-nombre").value.trim(),
                tipo: "VENTA",
                stockActual: parseInt(document.getElementById("insumo-stock").value) || 0,
                precioCompra: parseFloat(document.getElementById("insumo-compra").value) || 0,
                precioVenta: parseFloat(document.getElementById("insumo-venta").value) || 0,
                emoji: document.getElementById("insumo-emoji").value.trim()
            }, overlay);
        });
    }
}
