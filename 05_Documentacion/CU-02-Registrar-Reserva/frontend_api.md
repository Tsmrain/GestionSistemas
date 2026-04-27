# Contrato de API: CU-02 Registrar Reserva

**Base URL:** `/api/v1/reservas`

---

## 1. Registrar Nueva Reserva
**Propósito:** Permite crear una nueva reserva bloqueando la habitación seleccionada y registrando los datos del huésped.

- **Ruta:** `/` (Soporta envío multipart/form-data para subir imágenes)
- **Método HTTP:** `POST`
- **Cuerpo de la Petición (Request Body):**
  Dado que se soporta la subida de fotos (Carnet de Identidad), el `Content-Type` debe ser `multipart/form-data`.
  Los campos requeridos son:
  - `registro` (tipo application/json): Un Blob o String JSON con los datos de la reserva.
  - `fotoAnverso` (tipo archivo, opcional): Imagen del anverso del carnet.
  - `fotoReverso` (tipo archivo, opcional): Imagen del reverso del carnet.

  **Ejemplo del JSON para el campo `registro`:**
```json
{
  "nombre": "Juan Perez",
  "ci": "1234567",
  "celular": "77712345",
  "fechaIngreso": "2023-10-15",
  "cantidadBloques": 1,
  "habitacionId": 101
}
```

- **Cuerpo de la Respuesta (Response Body):**
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
    "celular": "77712345"
  },
  "habitacion": {
    "id": 101,
    "numero": "101",
    "tipo": {
      "id": 1,
      "nombreTipo": "Sencilla",
      "precioBase": 100.0,
      "duracionHoras": 12,
      "descripcion": "Habitación sencilla básica"
    }
  }
}
```
- **Códigos de Estado:**
    - `200 OK`: Reserva creada correctamente.
    - `400 Bad Request`: Datos incompletos o habitación no disponible.
