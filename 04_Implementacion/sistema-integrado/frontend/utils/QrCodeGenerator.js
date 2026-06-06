(function () {
    function normalizarReservaId(reservaId) {
        return String(reservaId || "").replace(/\D/g, "");
    }

    window.QrCodeGenerator = {
        toPayload: function (reservaId) {
            return normalizarReservaId(reservaId);
        },
        toDataUrl: function (texto) {
            var payload = normalizarReservaId(texto) || String(texto || "");
            return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=" + encodeURIComponent(payload);
        }
    };
})();
