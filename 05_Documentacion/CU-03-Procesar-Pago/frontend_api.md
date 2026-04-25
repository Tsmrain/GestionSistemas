# Contrato de API: CU-03 Procesar Pago

> **Versión:** 2.0 — Sincronizado con rama `develop` · Arquitectura Hexagonal
>
> **Base URL:** `http://localhost:8080/api/v1/pagos`
>
> **Content-Type:** `application/json`

---

## Endpoints disponibles

| # | Método | Ruta | Actor | Paso CU-03 |
|---|--------|------|-------|-----------|
| 1 | `POST` | `/iniciar` | Cliente | Pasos 3–5 (genera QR) |
| 2 | `GET`  | `/verificar/{reservaId}` | Sistema | Paso 7 (polling) |
| 3 | `POST` | `/efectivo/{reservaId}` | Recepcionista | Camino 3a |

---

## 1. Generar QR BNB — Pasos 3–5 del flujo básico

**Propósito:** El actor selecciona "Pago QR (BNB)". El sistema invoca la API del BNB, recibe el código QR dinámico y lo retorna en Base64 para renderizar en pantalla.

- **Ruta:** `POST /api/v1/pagos/iniciar`
- **Body (Request):**
```json
{
  "reservaId": 1,
  "metodo": "QR_BNB"
}
```

- **Body (Response) — estado PENDIENTE:**
```json
{
  "reservaId": 1,
  "estado": "PENDIENTE",
  "qrData": "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAB...",
  "comprobanteId": null,
  "nroComprobante": null,
  "ventanaCheckIn": null
}
```

> **Nota para el frontend:** `qrData` es un string Base64 de una imagen PNG. Renderizar con:
> ```html
> <img src="data:image/png;base64,{qrData}" />
> ```

- **Códigos HTTP:**
    - `200 OK` — QR generado. Iniciar polling inmediatamente.
    - `400 Bad Request` — `reservaId` inválido o reserva no encontrada.
    - `500 Internal Server Error` — BNB no responde (**Camino 4a**). Sugerir al usuario cambiar a efectivo.

---

## 2. Polling de Verificación — Paso 7 del flujo básico

**Propósito:** El sistema consulta periódicamente el estado de la transacción al BNB. El frontend llama este endpoint en loop hasta obtener `COMPLETADO`, `FALLIDO` o `QR_EXPIRADO`.

- **Ruta:** `GET /api/v1/pagos/verificar/{reservaId}`
- **Path Variable:** `reservaId` — ID numérico de la reserva.
- **Body (Request):** No requiere.

- **Body (Response) — QR aún pendiente:**
```json
{
  "reservaId": 1,
  "estado": "PENDIENTE",
  "qrData": "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAB...",
  "comprobanteId": null,
  "nroComprobante": null,
  "ventanaCheckIn": null
}
```

- **Body (Response) — Pago confirmado (`COMPLETADO`):**
```json
{
  "reservaId": 1,
  "estado": "COMPLETADO",
  "qrData": null,
  "comprobanteId": 7,
  "nroComprobante": "COMP-A3F2B1C4",
  "ventanaCheckIn": "2025-04-25T19:15:00"
}
```

- **Body (Response) — QR expirado (Camino 7a):**
```json
{
  "reservaId": 1,
  "estado": "QR_EXPIRADO",
  "qrData": null,
  "comprobanteId": null,
  "nroComprobante": null,
  "ventanaCheckIn": null
}
```

- **Códigos HTTP:**
    - `200 OK` — Estado recuperado (revisar campo `estado` en el body).
    - `400 Bad Request` — No existe pago iniciado para esa reserva.

---

## 3. Confirmar Pago en Efectivo — Camino 3a

**Propósito:** El Recepcionista confirma físicamente el cobro en efectivo. No interactúa con BNB. La reserva se confirma y el comprobante se genera de forma inmediata.

- **Ruta:** `POST /api/v1/pagos/efectivo/{reservaId}`
- **Path Variable:** `reservaId` — ID numérico de la reserva.
- **Body (Request):** No requiere.

- **Body (Response):**
```json
{
  "reservaId": 1,
  "estado": "COMPLETADO",
  "qrData": null,
  "comprobanteId": 8,
  "nroComprobante": "COMP-D7E1F9A0",
  "ventanaCheckIn": "2025-04-25T19:15:00"
}
```

- **Códigos HTTP:**
    - `200 OK` — Pago registrado y comprobante emitido.
    - `400 Bad Request` — Reserva no encontrada.

---

## Guía de Polling para el desarrollador Frontend

Implementar el **Paso 7 del CU-03** con el siguiente ciclo:

```javascript
const MAX_INTENTOS = 60;        // 60 × 5s = 5 minutos
const INTERVALO_MS = 5000;

async function iniciarPolling(reservaId) {
  let intentos = 0;
  const timer = setInterval(async () => {
    intentos++;
    const res = await fetch(`/api/v1/pagos/verificar/${reservaId}`);
    const data = await res.json();

    if (data.estado === "COMPLETADO") {
      clearInterval(timer);
      mostrarComprobante(data.nroComprobante, data.ventanaCheckIn);

    } else if (data.estado === "QR_EXPIRADO" || data.estado === "FALLIDO") {
      clearInterval(timer);
      mostrarError("QR vencido. Genere uno nuevo o pague en efectivo.");

    } else if (intentos >= MAX_INTENTOS) {
      clearInterval(timer);
      mostrarError("Tiempo de espera agotado.");
    }
  }, INTERVALO_MS);
}
```

### Tabla de estados de la respuesta

| `estado` | Acción del frontend |
|----------|---------------------|
| `PENDIENTE` | Continuar mostrando el QR y seguir el loop |
| `COMPLETADO` | **Detener polling** — mostrar comprobante y `ventanaCheckIn` |
| `QR_EXPIRADO` | **Detener polling** — Camino 7a: ofrecer regenerar QR o cambiar a efectivo |
| `FALLIDO` | **Detener polling** — informar error general |

### Campo `ventanaCheckIn`
Cuando `estado = COMPLETADO`, el campo `ventanaCheckIn` contiene la **hora límite para hacer check-in** (30 minutos desde el pago). Mostrarla con un contador regresivo en pantalla para que el huésped no pierda su reserva.

**Formato:** ISO 8601 — `"2025-04-25T19:15:00"` (sin zona horaria, hora local del servidor).
