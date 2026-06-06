(function () {
    function backendOrigin() {
        var host = window.location.hostname;
        var port = window.location.port;

        if (window.location.protocol === "file:") {
            return "http://localhost:8081";
        }

        if ((host === "localhost" || host === "127.0.0.1") && port && port !== "80") {
            return "http://" + host + ":8081";
        }

        return "";
    }

    window.ApiClient = {
        url: function (path) {
            return backendOrigin() + path;
        }
    };
})();
