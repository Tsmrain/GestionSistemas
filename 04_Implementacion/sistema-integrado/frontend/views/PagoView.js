class PagoView {

    constructor() {
        this.flujoContainer = document.getElementById("cliente-flujo-container");
        this._pollingInterval = null;
    }

    // Publico — el Controlador lo llama para mostrar el pago en la misma pantalla
    mostrarOpcionesPago(reserva) {
        var tipoHabitacion = this.#obtenerNombreTipo(reserva);
        var duracionHoras = this.#obtenerDuracionHoras(reserva);

        this.flujoContainer.innerHTML =
            '<div class="flujo-panel" id="panel-pago">' +
            '<button class="flujo-close" id="btn-cerrar-pago" type="button">&times;</button>' +
            '<h2 class="modal-titulo">Procesar Pago</h2>' +
            '<div class="modal-habitacion-info">' +
            '<div class="numero-box">' + reserva.habitacion.numero + '</div>' +
            '<div>' +
            '<p class="hab-num">Habitacion ' + reserva.habitacion.numero + '</p>' +
            '<p class="hab-tipo">' + tipoHabitacion + ' - Bs ' + reserva.montoTotal + '</p>' +
            '<p class="hab-horario">' + duracionHoras + ' horas</p>' +
            '</div>' +
            '</div>' +
            '<p class="pago-instruccion">Confirma el pago de la reserva con QR BNB o Efectivo.</p>' +
            '<div class="pago-botones">' +
            '<button class="btn-pago-qr" id="btn-qr">Generar QR de pago</button>' +
            '<button class="btn-pago-efectivo" id="btn-efectivo">Pago en Efectivo</button>' +
            '</div>' +
            '<div id="pago-contenido"></div>' +
            '<div id="pago-error" class="form-error" style="display:none"></div>' +
            '</div>';

        this._actualizarPasos("pagar");
    }

    // Publico — cancela el flujo de pago y limpia el panel
    onCancelarPago(callback) {
        var botonCerrar = document.getElementById("btn-cerrar-pago");
        if (botonCerrar) {
            botonCerrar.addEventListener("click", callback);
        }
    }

    // Publico — escucha cuando el usuario elige QR
    onElegirQR(callback) {
        document.getElementById("btn-qr").addEventListener("click", callback);
    }

    // Publico — escucha cuando el usuario elige Efectivo
    onElegirEfectivo(callback) {
        document.getElementById("btn-efectivo").addEventListener("click", callback);
    }

    // Publico — muestra el QR en pantalla
    mostrarQR(qrData) {
        var botonesPago = document.querySelector(".pago-botones");
        var instruccion = document.querySelector(".pago-instruccion");
        var contenido = document.getElementById("pago-contenido");

        if (botonesPago) botonesPago.style.display = "none";
        if (instruccion) instruccion.textContent = "Confirma el pago de la reserva con QR BNB.";

        var qrSrc = /^https?:\/\//i.test(qrData) || String(qrData || "").startsWith("data:")
            ? qrData
            : "data:image/png;base64," + qrData;

        contenido.innerHTML =
            '<div class="qr-container">' +
            '<p class="qr-instruccion">Escanea el QR con tu banca movil:</p>' +
            '<img class="qr-imagen" src="' + qrSrc + '" alt="QR de pago BNB">' +
            '<p class="qr-espera">Esperando confirmacion del pago...</p>' +
            '<div class="qr-spinner"></div>' +
            '<button class="btn-confirmar btn-simular-pago" id="btn-simular-pago">Simular pago recibido</button>' +
            '<button class="btn-volver-pago" id="btn-volver-metodos" type="button">Volver atras</button>' +
            '</div>';
    }

    // Publico — escucha la confirmacion simulada del QR
    onSimularPago(callback) {
        document.getElementById("btn-simular-pago").addEventListener("click", callback);
    }

    // Publico — vuelve desde QR a la seleccion de metodo de pago
    onVolverMetodosPago(callback) {
        document.getElementById("btn-volver-metodos").addEventListener("click", callback);
    }

    // Publico — restaura los botones QR/Efectivo
    mostrarSeleccionMetodosPago() {
        var botonesPago = document.querySelector(".pago-botones");
        var instruccion = document.querySelector(".pago-instruccion");
        var contenido = document.getElementById("pago-contenido");
        var errorDiv = document.getElementById("pago-error");

        if (botonesPago) botonesPago.style.display = "";
        if (instruccion) instruccion.textContent = "Confirma el pago de la reserva con QR BNB o Efectivo.";
        if (contenido) contenido.innerHTML = "";
        if (errorDiv) {
            errorDiv.textContent = "";
            errorDiv.style.display = "none";
        }
    }

    // Publico — muestra comprobante final
    mostrarComprobante(pago, metodo, reserva) {
        var esEfectivo = (metodo === "EFECTIVO");
        var titulo = esEfectivo ? "¡RESERVA REGISTRADA!" : "¡PAGO CONFIRMADO!";
        var icon = esEfectivo ? "🏨" : "✅";
        var habitacionHTML = reserva ? this.#habitacionComprobanteHTML(reserva) : "";
        var accesoPuertaHTML = (!esEfectivo && reserva) ? this.#accesoPuertaHTML(reserva) : "";
        
        var avisoHTML = "";
        if (esEfectivo) {
            avisoHTML = 
                '<div class="pago-alerta">' +
                    '<span class="alerta-icon">⚠️</span>' +
                    '<div class="alerta-texto">' +
                        '<strong>AVISO:</strong> Debes pagar en recepción. Tienes 30 minutos para llegar; de lo contrario, la habitación se liberará automáticamente.' +
                    '</div>' +
                '</div>';
        } else {
            avisoHTML = 
                '<div class="pago-alerta">' +
                    '<span class="alerta-icon">🕒</span>' +
                    '<div class="alerta-texto">' +
                        '<strong>AVISO:</strong> Tienes 30 minutos para llegar al residencial. Si no te presentas, la reserva se cancelará sin derecho a reembolso.' +
                    '</div>' +
                '</div>';
        }

        this.flujoContainer.innerHTML =
            '<div class="flujo-panel modal-exito">' +
            '<div class="exito-icon">' + icon + '</div>' +
            '<h2 style="text-transform: uppercase; letter-spacing: 1px;">' + titulo + '</h2>' +
            habitacionHTML +
            
            '<div class="comprobante-grid">' +
                '<div class="grid-item">' +
                    '<span class="label">Nro. Comprobante</span>' +
                    '<span class="valor">#' + pago.nroComprobante + '</span>' +
                '</div>' +
                '<div class="grid-item">' +
                    '<span class="label">Tiempo Límite de Llegada</span>' +
                    '<span class="valor" style="color: #7F77DD;">' + pago.obtenerHoraLimiteCheckIn() + '</span>' +
                '</div>' +
            '</div>' +

            avisoHTML +

            accesoPuertaHTML +

            '<button class="btn-confirmar" id="btn-cerrar-comprobante" type="button">ACEPTAR</button>' +
            '</div>';

        document.getElementById("btn-cerrar-comprobante").addEventListener("click", () => {
            this.cerrarModal();
            if (window.disponibilidadApp) window.disponibilidadApp.cargarDisponiblesDeHoy();
        });

        document.querySelectorAll(".btn-descargar-qr").forEach(function (botonDescargarQR) {
            botonDescargarQR.addEventListener("click", async function () {
                var url = botonDescargarQR.getAttribute("data-qr-url");
                var archivo = botonDescargarQR.getAttribute("data-archivo");
                var textoOriginal = botonDescargarQR.textContent;
                botonDescargarQR.textContent = "Descargando...";
                botonDescargarQR.disabled = true;

                try {
                    var response = await fetch(url);
                    if (!response.ok) throw new Error("No se pudo descargar el QR.");

                    var blob = await response.blob();
                    var objectUrl = URL.createObjectURL(blob);
                    var link = document.createElement("a");
                    link.href = objectUrl;
                    link.download = archivo;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(objectUrl);
                    botonDescargarQR.textContent = "QR descargado";
                } catch (error) {
                    botonDescargarQR.textContent = "Abrir QR";
                    window.open(url, "_blank", "noopener");
                } finally {
                    setTimeout(function () {
                        botonDescargarQR.disabled = false;
                        botonDescargarQR.textContent = textoOriginal;
                    }, 1800);
                }
            });
        });

        this._actualizarPasos("confirmado");
    }

    mostrarReservaEfectivoPendiente(reserva) {
        var habitacionHTML = reserva ? this.#habitacionComprobanteHTML(reserva) : "";
        this.flujoContainer.innerHTML =
            '<div class="flujo-panel modal-exito">' +
            '<div class="exito-icon">🏨</div>' +
            '<h2 style="text-transform: uppercase; letter-spacing: 1px;">RESERVA PENDIENTE DE PAGO</h2>' +
            habitacionHTML +
            '<div class="comprobante-grid">' +
                '<div class="grid-item">' +
                    '<span class="label">Reserva</span>' +
                    '<span class="valor">#' + reserva.id + '</span>' +
                '</div>' +
                '<div class="grid-item">' +
                    '<span class="label">Estado</span>' +
                    '<span class="valor" style="color:#E65100;">Pendiente en recepción</span>' +
                '</div>' +
            '</div>' +
            '<div class="pago-alerta">' +
                '<span class="alerta-icon">⚠️</span>' +
                '<div class="alerta-texto">' +
                    '<strong>Importante:</strong> el acceso y el check-in se habilitan solo cuando recepción recibe el efectivo y confirma la reserva.' +
                '</div>' +
            '</div>' +
            '<button class="btn-confirmar" id="btn-cerrar-comprobante" type="button">ACEPTAR</button>' +
            '</div>';

        document.getElementById("btn-cerrar-comprobante").addEventListener("click", () => {
            this.cerrarModal();
            if (window.disponibilidadApp) window.disponibilidadApp.cargarDisponiblesDeHoy();
        });

        this._actualizarPasos("confirmado");
    }

    // Publico — muestra error
    mostrarError(mensaje) {
        var errorDiv = document.getElementById("pago-error");
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = "block";
        }
    }

    // Privado — limpia el contenido interno del modal
    #limpiarContenido() {
        var contenido = document.getElementById("pago-contenido");
        if (contenido) contenido.innerHTML = "";
    }

    // Publico — cierra el modal
    cerrarModal() {
        this.#limpiarContenido();
        this.flujoContainer.innerHTML =
            '<div class="resumen-card reserva-vacia">' +
            '<h3>Tu reserva</h3>' +
            '<p>Selecciona una habitación para completar tus datos.</p>' +
            '</div>';
        this._actualizarPasos("seleccionar");
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

    #obtenerNombreTipo(reserva) {
        if (!reserva.habitacion || !reserva.habitacion.tipo) return "Sin tipo";
        if (typeof reserva.habitacion.tipo === "string") return reserva.habitacion.tipo;
        return reserva.habitacion.tipo.nombreTipo || "Sin tipo";
    }

    #obtenerDuracionHoras(reserva) {
        if (!reserva.habitacion || !reserva.habitacion.tipo) return "";
        return reserva.habitacion.tipo.duracionHoras || "";
    }

    #habitacionComprobanteHTML(reserva) {
        var tipoHabitacion = this.#obtenerNombreTipo(reserva);
        var duracionHoras = this.#obtenerDuracionHoras(reserva);
        return '<div class="modal-habitacion-info">' +
            '<div class="numero-box">' + reserva.habitacion.numero + '</div>' +
            '<div>' +
            '<p class="hab-num">Habitacion ' + reserva.habitacion.numero + '</p>' +
            '<p class="hab-tipo">' + tipoHabitacion + ' - Bs ' + reserva.montoTotal + '</p>' +
            '<p class="hab-horario">' + duracionHoras + ' horas</p>' +
            '</div>' +
            '</div>';
    }

    #accesoPuertaHTML(reserva) {
        var habitacion = reserva.habitacion ? reserva.habitacion.numero : "";
        var codigo = reserva.id;
        var tabletUrl = "puerta.html?habitacion=" + encodeURIComponent(habitacion) + "&codigo=" + encodeURIComponent(codigo);
        var tabletUrlCompleta = new URL(tabletUrl, window.location.href).href;
        var qrUrl = window.QrCodeGenerator
            ? window.QrCodeGenerator.toDataUrl(tabletUrlCompleta)
            : "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=" + encodeURIComponent(tabletUrlCompleta);
        return '<div class="acceso-demo-card">' +
            '<div class="acceso-demo-header">' +
            '<div>' +
            '<span class="acceso-demo-label">Acceso de habitación</span>' +
            '<h3>Habitación ' + habitacion + '</h3>' +
            '</div>' +
            '<span class="acceso-demo-badge">Pago QR confirmado</span>' +
            '</div>' +
            '<div class="acceso-phone-preview">' +
            '<p class="acceso-phone-title">QR para abrir puerta</p>' +
            '<img class="qr-acceso-real" src="' + qrUrl + '" alt="QR de acceso para habitación ' + habitacion + '">' +
            '<strong>Reserva #' + codigo + '</strong>' +
            '<span>Habitación ' + habitacion + '</span>' +
            '</div>' +
            '<p class="acceso-demo-texto">Tu pago ya fue confirmado. Abre la tablet de puerta para validar el acceso y ocupar la habitación.</p>' +
            '<div class="acceso-demo-actions">' +
            '<a class="btn-acceso-demo" href="' + tabletUrl + '" target="_blank" rel="noopener">Abrir tablet puerta</a>' +
            '<button class="btn-descargar-qr" type="button" data-qr-url="' + qrUrl + '" data-archivo="qr-acceso-reserva-' + codigo + '.png">Descargar QR</button>' +
            '</div>' +
            '</div>';
    }

}
