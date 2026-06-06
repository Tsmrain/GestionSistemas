(function () {
    var params = new URLSearchParams(window.location.search);
    var habitacionEsperada = params.get("habitacion") || "201";
    var codigoDemo = params.get("codigo") || "";
    var procesando = false;
    var streamCamara = null;
    var detectorInterval = null;

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

    iniciarCamara();

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
    }

    function mostrarError(mensaje) {
        mostrarEstado("error");
        document.getElementById("tablet-error").textContent = mensaje;
        procesando = false;
    }

    function mostrarEstado(estado) {
        document.getElementById("tablet-scan-state").style.display = estado === "scan" ? "block" : "none";
        document.getElementById("tablet-success-state").style.display = estado === "success" ? "block" : "none";
        document.getElementById("tablet-error-state").style.display = estado === "error" ? "block" : "none";
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
