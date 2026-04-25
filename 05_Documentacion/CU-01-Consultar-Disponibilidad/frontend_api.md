# Contrato de API: CU-01 Consultar Disponibilidad

> **Versión:** 2.0 — Sincronizado con rama `develop`
>
> **Base URL:** `http://localhost:8080/api/v1/habitaciones`
>
> **Content-Type:** `application/json`

---

## 1. Consultar Habitaciones Disponibles
**Propósito:** Permite obtener un listado de habitaciones disponibles para una fecha específica, opcionalmente filtrando por tipo de habitación.

- **Ruta:** `/disponibles`
- **Método HTTP:** `GET`
- **Parámetros de Consulta (Query Params):**
    - `fechaIngreso` (obligatorio): Fecha de ingreso en formato `YYYY-MM-DD`.
    - `cantidadBloques` (obligatorio): Número de horas/bloques a reservar (entero).
    - `tipoHabitacionId` (opcional): Filtro por ID de tipo de habitación.

- **Cuerpo de la Petición:** No requiere.

- **Cuerpo de la Respuesta (Response Body) - 200 OK:**
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

## Formato de Errores (GlobalExceptionHandler)

Si ocurre una validación fallida (ej: falta de parámetros o error de base de datos), el sistema siempre retornará JSON estructurado.

- **Cuerpo de la Respuesta (Response Body) - 400 Bad Request:**
```json
{
  "status": 400,
  "mensaje": "fechaIngreso: La fecha de ingreso es obligatoria",
  "timestamp": "2025-04-25T19:25:00"
}
```

- **Códigos HTTP de Error Esperados:**
    - `400 Bad Request`: Faltan parámetros obligatorios (`@Valid`).
    - `503 Service Unavailable`: Problema grave en el servidor.
