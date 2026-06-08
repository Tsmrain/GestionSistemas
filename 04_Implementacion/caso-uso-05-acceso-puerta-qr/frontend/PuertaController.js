(function () {
    var params = new URLSearchParams(window.location.search);
    var habitacionEsperada = params.get("habitacion") || "201";
    var codigoDemo = params.get("codigo") || "";
    var procesando = false;
    var streamCamara = null;
    var detectorInterval = null;
    var reservaActual = null;
    var productos = [];
    var carrito = {};
    var consumoActual = null;

    var habitacionTitulo = document.getElementById("tablet-habitacion");
    var status = document.getElementById("tablet-status");
    var inputCodigo = document.getElementById("codigo-puerta");
    var btnDemo = document.getElementById("btn-demo-scan");
    var video = document.getElementById("tablet-video");

    habitacionTitulo.textContent = "Habitacion " + habitacionEsperada;
    inputCodigo.value = codigoDemo;

    if (codigoDemo) {
        btnDemo.style.display = "block";
    }

    document.getElementById("form-codigo-puerta").addEventListener("submit", function (event) {
        event.preventDefault();
        validarCodigo(inputCodigo.value);
    });

    btnDemo.addEventListener("click", function () {
        validarCodigo(codigoDemo);
    });

    document.getElementById("btn-reintentar-puerta").addEventListener("click", function () {
        mostrarEstado("scan");
        status.textContent = "Esperando QR completo dentro del recuadro...";
        procesando = false;
    });

    document.getElementById("btn-pagar-consumos").addEventListener("click", iniciarPagoConsumos);
    document.getElementById("btn-confirmar-consumo").addEventListener("click", confirmarPagoConsumo);
    document.getElementById("btn-volver-consumos").addEventListener("click", function () {
        mostrarEstado("success");
    });

    if (codigoDemo) {
        status.textContent = "Validando QR de acceso...";
        setTimeout(function () {
            validarCodigo(codigoDemo);
        }, 250);
    } else {
        iniciarCamara();
    }

    async function iniciarCamara() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            status.textContent = "Camara no disponible. Usa el codigo de reserva.";
            return;
        }

        try {
            streamCamara = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            });
            video.srcObject = streamCamara;

            if ("BarcodeDetector" in window) {
                var formatos = await window.BarcodeDetector.getSupportedFormats();
                if (formatos.indexOf("qr_code") !== -1) {
                    status.textContent = "Camara lista. Aleja el celular hasta ver el QR completo.";
                    escucharQRConCamara(new window.BarcodeDetector({ formats: ["qr_code"] }));
                } else {
                    status.textContent = "Este navegador no lee QR por camara. Ingresa el codigo y presiona Validar.";
                }
            } else {
                status.textContent = "Este navegador no soporta lectura QR. Ingresa el codigo y presiona Validar.";
            }
        } catch (error) {
            status.textContent = "Activa la camara o ingresa el codigo manualmente.";
        }
    }

    function escucharQRConCamara(detector) {
        detectorInterval = setInterval(async function () {
            if (procesando || video.readyState < 2) return;

            try {
                var codigos = await detector.detect(video);
                if (codigos && codigos.length > 0) {
                    var codigo = extraerCodigo(codigos[0].rawValue);
                    if (codigo) validarCodigo(codigo);
                    else status.textContent = "QR detectado, pero no contiene un codigo de reserva.";
                }
            } catch (error) {
                clearInterval(detectorInterval);
                status.textContent = "No se pudo leer con camara. Ingresa el codigo manualmente.";
            }
        }, 900);
    }

    function extraerCodigo(valor) {
        valor = String(valor || "").trim();
        if (!valor) return "";

        var urlMatch = valor.match(/[?&]codigo=(\d+)/);
        if (urlMatch) return urlMatch[1];

        var reservaMatch = valor.match(/(?:reserva|RESERVA|BNB)\D+(\d+)/);
        if (reservaMatch) return reservaMatch[1];

        if (/^\d+$/.test(valor)) return valor;
        return "";
    }

    async function validarCodigo(codigo) {
        codigo = extraerCodigo(codigo) || String(codigo || "").trim();
        if (!codigo || procesando) return;

        procesando = true;
        status.textContent = "Validando reserva...";

        try {
            var response = await fetch(ApiClient.url("/api/puerta/validar"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigo: codigo,
                    habitacion: habitacionEsperada
                })
            });

            if (!response.ok) {
                throw new Error(await obtenerMensajeError(response));
            }

            var data = await response.json();
            mostrarBienvenida(data.reserva);
        } catch (error) {
            mostrarError(error.message || "No se pudo validar la reserva.");
        }
    }

    async function obtenerMensajeError(response) {
        try {
            var data = await response.json();
            return data.message || data.mensaje || "No se pudo validar la reserva.";
        } catch (error) {
            return "No se pudo validar la reserva.";
        }
    }

    function mostrarBienvenida(reserva) {
        detenerCamara();
        mostrarEstado("success");

        var huesped = reserva.huesped && reserva.huesped.nombre ? reserva.huesped.nombre : "Huesped";
        var numero = reserva.habitacion && reserva.habitacion.numero ? reserva.habitacion.numero : habitacionEsperada;
        var tipo = reserva.habitacion && reserva.habitacion.tipo ? reserva.habitacion.tipo.nombreTipo : "";
        var salida = reserva.horaSalidaEstimada
            ? new Date(reserva.horaSalidaEstimada).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
            : "--:--";

        document.getElementById("tablet-huesped").textContent = huesped;
        document.getElementById("tablet-detalle").innerHTML = "Habitacion " + numero + (tipo ? " · " + tipo : "") + "<br>Salida estimada: " + salida;
        document.getElementById("consumos-resumen-habitacion").textContent = "Habitacion " + numero + (tipo ? " · " + tipo : "");
        reservaActual = reserva;
        cargarProductosConsumo();
    }

    async function cargarProductosConsumo() {
        try {
            var response = await fetch(ApiClient.url("/api/v1/consumos/productos"));
            if (!response.ok) throw new Error("No se pudo cargar el menu de consumos.");
            productos = await response.json();
            renderProductos();
            renderCarrito();
        } catch (error) {
            document.getElementById("productos-consumo-grid").innerHTML =
                '<div class="consumos-error">' + (error.message || "No se pudo cargar el menu.") + '</div>';
        }
    }

    function renderProductos() {
        var grid = document.getElementById("productos-consumo-grid");
        grid.innerHTML = productos.map(function (producto) {
            var cantidad = carrito[producto.id] || 0;
            var activo = cantidad > 0 ? " seleccionado" : "";
            return '<article class="producto-consumo-card' + activo + '">' +
                '<div class="producto-emoji">' + producto.emoji + '</div>' +
                '<h3>' + producto.nombre + '</h3>' +
                '<strong>Bs ' + formatoMonto(producto.precio) + '</strong>' +
                '<span>Stock: ' + producto.stock + '</span>' +
                '<div class="producto-actions">' +
                '<button type="button" data-action="restar" data-id="' + producto.id + '" ' + (cantidad <= 0 ? "disabled" : "") + '>-</button>' +
                '<b>' + cantidad + '</b>' +
                '<button type="button" data-action="sumar" data-id="' + producto.id + '" ' + (cantidad >= producto.stock ? "disabled" : "") + '>+</button>' +
                '</div>' +
                '</article>';
        }).join("");

        grid.querySelectorAll("button").forEach(function (boton) {
            boton.addEventListener("click", function () {
                cambiarCantidad(boton.getAttribute("data-id"), boton.getAttribute("data-action"));
            });
        });
    }

    function cambiarCantidad(productoId, accion) {
        var producto = productos.find(function (item) { return item.id === productoId; });
        if (!producto) return;
        var cantidad = carrito[productoId] || 0;

        if (accion === "sumar" && cantidad < producto.stock) {
            carrito[productoId] = cantidad + 1;
        }
        if (accion === "restar" && cantidad > 0) {
            carrito[productoId] = cantidad - 1;
            if (carrito[productoId] === 0) delete carrito[productoId];
        }

        renderProductos();
        renderCarrito();
    }

    function obtenerItemsCarrito() {
        return Object.keys(carrito).map(function (productoId) {
            var producto = productos.find(function (item) { return item.id === productoId; });
            var cantidad = carrito[productoId];
            return {
                producto: producto,
                cantidad: cantidad,
                subtotal: producto.precio * cantidad
            };
        });
    }

    function renderCarrito() {
        var items = obtenerItemsCarrito();
        var contenedor = document.getElementById("carrito-items");
        var total = items.reduce(function (sum, item) { return sum + item.subtotal; }, 0);

        document.getElementById("carrito-cantidad").textContent = items.length === 1 ? "1 item" : items.length + " items";
        document.getElementById("carrito-total").textContent = "Bs " + formatoMonto(total);
        document.getElementById("btn-pagar-consumos").disabled = items.length === 0;
        document.getElementById("btn-pagar-consumos").textContent = items.length ? "Pagar consumos — Bs " + formatoMonto(total) : "Pagar consumos";

        if (items.length === 0) {
            contenedor.innerHTML = '<p class="carrito-vacio">Selecciona productos para pedir.</p>';
            return;
        }

        contenedor.innerHTML = items.map(function (item) {
            return '<div class="carrito-item">' +
                '<span>' + item.producto.emoji + ' ' + item.producto.nombre + ' x' + item.cantidad + '</span>' +
                '<strong>Bs ' + formatoMonto(item.subtotal) + '</strong>' +
                '</div>';
        }).join("");
    }

    async function iniciarPagoConsumos() {
        if (!reservaActual) return;
        var items = obtenerItemsCarrito();
        if (items.length === 0) return;

        try {
            var response = await fetch(ApiClient.url("/api/v1/consumos/pagar"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservaId: reservaActual.id,
                    items: items.map(function (item) {
                        return {
                            productoId: item.producto.id,
                            cantidad: item.cantidad
                        };
                    })
                })
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));
            consumoActual = await response.json();
            mostrarPagoConsumo(consumoActual);
        } catch (error) {
            alert(error.message || "No se pudo iniciar el pago de consumos.");
        }
    }

    function mostrarPagoConsumo(consumo) {
        var habitacion = reservaActual.habitacion && reservaActual.habitacion.numero ? reservaActual.habitacion.numero : habitacionEsperada;
        var huesped = reservaActual.huesped && reservaActual.huesped.nombre ? reservaActual.huesped.nombre : "Huesped";

        document.getElementById("payment-subtitle").textContent = "Habitacion " + habitacion + " · " + huesped;
        document.getElementById("payment-qr-img").src = consumo.qrData;
        document.getElementById("payment-help").textContent = "Abrí tu app de banco, escaneá el QR y confirmá el pago de Bs " + formatoMonto(consumo.total) + ".";
        document.getElementById("payment-summary").innerHTML =
            consumo.items.map(function (item) {
                return '<div class="payment-row"><span>' + item.emoji + ' ' + item.nombre + ' x' + item.cantidad + '</span><strong>Bs ' + formatoMonto(item.subtotal) + '</strong></div>';
            }).join("") +
            '<div class="payment-total"><strong>Total a pagar</strong><strong>Bs ' + formatoMonto(consumo.total) + '</strong></div>';

        mostrarEstado("payment");
    }

    async function confirmarPagoConsumo() {
        if (!consumoActual) return;

        try {
            var response = await fetch(ApiClient.url("/api/v1/consumos/" + consumoActual.id + "/confirmar"), {
                method: "POST"
            });
            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            consumoActual = await response.json();
            carrito = {};
            renderProductos();
            renderCarrito();
            alert("Pago de consumo confirmado. Gracias.");
            mostrarEstado("success");
        } catch (error) {
            alert(error.message || "No se pudo confirmar el pago.");
        }
    }

    function mostrarError(mensaje) {
        mostrarEstado("error");
        document.getElementById("tablet-error").textContent = mensaje;
        procesando = false;
    }

    function mostrarEstado(estado) {
        document.getElementById("tablet-scan-state").style.display = estado === "scan" ? "block" : "none";
        document.getElementById("tablet-success-state").style.display = estado === "success" ? "block" : "none";
        document.getElementById("tablet-payment-state").style.display = estado === "payment" ? "block" : "none";
        document.getElementById("tablet-error-state").style.display = estado === "error" ? "block" : "none";
    }

    function formatoMonto(valor) {
        return Number(valor || 0).toLocaleString("es-BO", { maximumFractionDigits: 0 });
    }

    function detenerCamara() {
        if (detectorInterval) clearInterval(detectorInterval);
        if (streamCamara) {
            streamCamara.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    }
})();
