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

        contenido.innerHTML =
            '<div class="qr-container">' +
            '<p class="qr-instruccion">Escanea el QR con tu banca movil:</p>' +
            '<img class="qr-imagen" src="data:image/png;base64,' + qrData + '" alt="QR de pago BNB">' +
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
        var qrAccesoHTML = reserva ? this.#qrAccesoHTML(reserva, !esEfectivo) : "";
        
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

            qrAccesoHTML +

            '<button class="btn-confirmar" id="btn-cerrar-comprobante" type="button">ACEPTAR</button>' +
            '</div>';

        document.getElementById("btn-cerrar-comprobante").addEventListener("click", () => {
            this.cerrarModal();
            if (window.disponibilidadApp) window.disponibilidadApp.cargarDisponiblesDeHoy();
        });

        var botonDescargarQR = document.querySelector(".btn-descargar-qr");
        if (botonDescargarQR) {
            botonDescargarQR.addEventListener("click", async function () {
                var url = botonDescargarQR.getAttribute("data-qr-url");
                var archivo = botonDescargarQR.getAttribute("data-archivo");
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
                        botonDescargarQR.textContent = "Descargar QR";
                    }, 1800);
                }
            });
        }

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

    #qrAccesoHTML(reserva, habilitado) {
        var habitacion = reserva.habitacion ? reserva.habitacion.numero : "";
        var codigo = reserva.id;
        var payload = window.QrCodeGenerator ? window.QrCodeGenerator.toPayload(codigo) : "RESERVA:" + codigo;
        var qrDataUrl = window.QrCodeGenerator ? window.QrCodeGenerator.toDataUrl(payload, 8) : "";
        var puertaUrl = 'puerta.html?habitacion=' + encodeURIComponent(habitacion) + '&codigo=' + encodeURIComponent(codigo);
        var estadoTexto = habilitado
            ? "Presenta este QR en la tablet de la puerta."
            : "El QR abre la puerta cuando la reserva este pagada.";

        return '<div class="acceso-demo-card">' +
            '<div class="acceso-demo-header">' +
            '<div>' +
            '<span class="acceso-demo-label">QR de acceso</span>' +
            '<h3>Habitacion ' + habitacion + '</h3>' +
            '</div>' +
            '<span class="acceso-demo-badge">Opcion 4</span>' +
            '</div>' +
            '<div class="acceso-phone-preview">' +
            '<p class="acceso-phone-title">Tu QR de acceso</p>' +
            '<img class="qr-acceso-real" src="' + qrDataUrl + '" alt="QR de acceso para la reserva ' + codigo + '">' +
            '<strong>Reserva #' + codigo + '</strong>' +
            '<span>Habitacion ' + habitacion + '</span>' +
            '</div>' +
            '<p class="acceso-demo-texto">' + estadoTexto + '</p>' +
            '<div class="acceso-demo-actions">' +
            '<a class="btn-acceso-demo" href="' + puertaUrl + '" target="_blank" rel="noopener">Abrir tablet puerta</a>' +
            '<button class="btn-descargar-qr" type="button" data-qr-url="' + qrDataUrl + '" data-archivo="qr-acceso-reserva-' + codigo + '.png">Descargar QR</button>' +
            '</div>' +
            '</div>';
    }
}
