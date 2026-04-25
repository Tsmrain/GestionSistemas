# Contrato de API: CU-02 Registrar Reserva

> **Versión:** 2.0 — Sincronizado con rama `develop`
>
> **Base URL:** `http://localhost:8080/api/v1/reservas`
>
> **Content-Type:** `multipart/form-data`

---

## 1. Registrar Nueva Reserva
**Propósito:** Permite crear una nueva reserva bloqueando la habitación seleccionada y registrando los datos del huésped.

- **Ruta:** `/`
- **Método HTTP:** `POST`

### Cuerpo de la Petición (Request Body)
Dado que se soporta la subida de fotos (Carnet de Identidad), el `Content-Type` debe ser obligatoriamente `multipart/form-data`. No es un JSON plano.

El frontend debe enviar un objeto `FormData` con los siguientes campos:

**Campos de texto (URL-encoded equivalentes):**
- `nombre` (Texto, obligatorio): Nombre completo del huésped.
- `ci` (Texto, opcional): Carnet de Identidad.
- `celular` (Texto, opcional): Teléfono de contacto.
- `fechaIngreso` (Texto ISO `YYYY-MM-DD`, obligatorio): Fecha para la cual se reserva.
- `cantidadBloques` (Entero, obligatorio): Cantidad de bloques/horas reservadas. Mínimo 1.
- `habitacionId` (Entero, obligatorio): ID de la habitación seleccionada en CU-01.

**Campos de archivo (Archivos binarios):**
- `fotoAnverso` (Archivo de imagen, opcional): Foto del frente del carnet.
- `fotoReverso` (Archivo de imagen, opcional): Foto del dorso del carnet.

**Ejemplo en JavaScript (Frontend):**
```javascript
const formData = new FormData();
formData.append("nombre", "Juan Perez");
formData.append("ci", "1234567");
formData.append("celular", "77712345");
formData.append("fechaIngreso", "2023-10-15");
formData.append("cantidadBloques", "1");
formData.append("habitacionId", "101");

// Si hay imágenes desde un input de tipo file:
if (fileAnverso) formData.append("fotoAnverso", fileAnverso);
if (fileReverso) formData.append("fotoReverso", fileReverso);

fetch("/api/v1/reservas", {
  method: "POST",
  body: formData // Fetch setea el header multipart automáticamente
});
```

### Cuerpo de la Respuesta (Response Body) - 200 OK
```json
{
  "id": 1,
  "estado": "PENDIENTE_PAGO",
  "fechaIngreso": "2023-10-15",
  "cantidadBloques": 1,
  "montoTotal": 100.0,
  "huesped": {
    "id": 1,
    "nombre": "Juan Perez",
    "ci": "1234567",
    "celular": "77712345",
    "urlFotoAnverso": "/storage/foto_1.png",
    "urlFotoReverso": null
  },
  "habitacion": {
    "id": 101,
    "numero": "101",
    "estadoActual": "Disponible"
  }
}
```

## Formato de Errores (GlobalExceptionHandler)

El backend intercepta todas las fallas lógicas o de validación y retorna el estándar JSON.

- **Respuesta de Error - 409 Conflict (Ejemplo: habitación ya reservada):**
```json
{
  "status": 409,
  "mensaje": "La habitacion ya esta reservada para la fecha seleccionada.",
  "timestamp": "2025-04-25T19:25:00"
}
```

- **Respuesta de Error - 400 Bad Request (Faltan campos):**
```json
{
  "status": 400,
  "mensaje": "nombre: El nombre del huesped es obligatorio, cantidadBloques: La cantidad de bloques es obligatoria",
  "timestamp": "2025-04-25T19:25:00"
}
```

- **Códigos HTTP de Error Esperados:**
    - `400 Bad Request`: Faltan campos obligatorios en el FormData.
    - `409 Conflict`: Reglas de negocio (Habitación ocupada o no disponible).
    - `500 Internal Server Error`: Fallo guardando la foto u otro problema.
