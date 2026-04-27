# Contrato de API: CU-01 Consultar Disponibilidad

**Base URL:** `/api/v1/disponibilidad`

---

## 1. Consultar Habitaciones Disponibles
**Propósito:** Permite obtener un listado de habitaciones disponibles para una fecha específica, opcionalmente filtrando por tipo de habitación.

- **Ruta:** `/`
- **Método HTTP:** `GET`
- **Parámetros de Consulta (Query Params):**
    - `fecha` (obligatorio): Fecha de ingreso en formato `YYYY-MM-DD`.
    - `tipoNombre` (opcional): Filtro por tipo de habitación (ej: "Sencilla", "Doble").
- **Cuerpo de la Petición:** No requiere.
- **Cuerpo de la Respuesta (Response Body):**
```json
[
  {
    "habitacionId": 101,
    "numeroHabitacion": "101",
    "tipoHabitacion": {
      "id": 1,
      "nombreTipo": "Sencilla",
      "precioBase": 100.0,
      "duracionHoras": 12,
      "descripcion": "Habitación sencilla básica"
    },
    "precioBase": 100.0
  }
]
```
- **Códigos de Estado:**
    - `200 OK`: Lista recuperada exitosamente (puede estar vacía si no hay disponibilidad).
    - `400 Bad Request`: Formato de fecha incorrecto o falta de parámetro obligatorio.
