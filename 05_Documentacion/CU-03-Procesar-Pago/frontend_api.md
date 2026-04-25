# Contrato de API: CU-03 Procesar Pago

**Base URL:** `/api/v1/pagos`

---

## 1. Generar QR (Inicio de Pago Digital)
**Propósito:** Solicitar la generación de un código QR dinámico para el pago de una reserva. El sistema se integra con el API Sandbox del BNB.

- **Ruta:** `/iniciar`
- **Método HTTP:** `POST`
- **Cuerpo de la Petición (Request Body):**
```json
{
  "reservaId": 1,
  "metodo": "QR_BNB"
}
```
- **Cuerpo de la Respuesta (Response Body):**
```json
{
  "reservaId": 1,
  "estado": "PENDIENTE",
  "qrData": "base64_string_del_codigo_qr...",
  "comprobanteId": null
}
```
- **Códigos de Estado:**
    - `200 OK`: QR generado exitosamente.
    - `400 Bad Request`: Reserva no encontrada o método inválido.

---

## 2. Pago en Efectivo (Confirmación Manual)
**Propósito:** Registrar que el cliente ha pagado en efectivo en recepción. Este flujo confirma la reserva de manera inmediata.

- **Ruta:** `/iniciar`
- **Método HTTP:** `POST`
- **Cuerpo de la Petición (Request Body):**
```json
{
  "reservaId": 1,
  "metodo": "EFECTIVO"
}
```
- **Cuerpo de la Respuesta (Response Body):**
```json
{
  "reservaId": 1,
  "estado": "COMPLETADO",
  "qrData": null,
  "comprobanteId": 1
}
```
- **Códigos de Estado:**
    - `200 OK`: Pago registrado y reserva confirmada.
    - `400 Bad Request`: Error en los datos de la reserva.

---

## 3. Polling de Verificación (Estado del Pago QR)
**Propósito:** Consultar el estado actual de una transacción de pago QR para verificar si el cliente ya realizó la transferencia desde su app bancaria.

- **Ruta:** `/verificar/{reservaId}`
- **Método HTTP:** `GET`
- **Parámetros de Ruta:**
    - `reservaId`: ID numérico de la reserva que se está pagando.
- **Cuerpo de la Petición:** No requiere.
- **Cuerpo de la Respuesta (Response Body):**
```json
{
  "reservaId": 1,
  "estado": "COMPLETADO",
  "qrData": null,
  "comprobanteId": 1
}
```
- **Códigos de Estado:**
    - `200 OK`: Estado recuperado correctamente.

---

# Notas para el Desarrollador Frontend (Polling)

Para implementar el **Paso 7 del Caso de Uso (Polling)**, siga estas recomendaciones:

1.  **Frecuencia:** Inicie un ciclo de peticiones al endpoint de verificación cada **5 segundos**.
2.  **Condición de Parada:**
    *   Si `estado` es **"COMPLETADO"**: Detenga el polling, muestre el mensaje de éxito y permita la descarga del comprobante digital (usando el `comprobanteId`).
    *   Si `estado` es **"FALLIDO"** o **"RECHAZADO"**: Detenga el polling e informe al usuario para que intente regenerar el QR o cambie a pago en efectivo.
3.  **Timeout:** Se recomienda detener el polling después de **5 minutos** (300 segundos) e informar al usuario que el tiempo de espera ha expirado.
