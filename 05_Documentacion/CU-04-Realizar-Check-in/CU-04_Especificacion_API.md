# Especificación de API Backend - CU-04: Realizar Check-in

Este documento detalla los endpoints disponibles para el frontend para completar el proceso de Check-in de un huésped.

## Información General
- **Base URL**: `http://localhost:8081/api/checkin`
- **Protocolo**: HTTP/1.1
- **CORS**: Habilitado para todos los orígenes en entorno local.

---

## 1. Buscar Reserva por CI
Busca las reservas activas o pendientes asociadas al carnet de identidad del huésped principal.

- **Método**: `GET`
- **Path**: `/buscar`
- **Query Parameters**:
    - `ci` (string, obligatorio): Carnet de identidad del huésped principal.
- **Respuesta Exitosa (200 OK)**:
    - Retorna un arreglo de objetos `ReservaResponse`.
    
### Ejemplo de Respuesta:
```json
[
  {
    "id": 5,
    "estado": "PAGADA",
    "fechaIngreso": "2026-04-26",
    "cantidadBloques": 1,
    "montoTotal": 150.0,
    "huesped": {
      "id": 10,
      "nombre": "Juan Perez",
      "ci": "1234567",
      "celular": "77788899"
    },
    "habitacion": {
      "id": 1,
      "numero": "101",
      "tipo": {
        "id": 1,
        "nombreTipo": "Estandar",
        "precioBase": 150.0,
        "duracionHoras": 12,
        "descripcion": "Habitacion estandar para estadias de 12 horas"
      }
    },
    "acompanante": null,
    "horaIngreso": null,
    "horaSalidaEstimada": null
  }
]
```

---

## 2. Confirmar Check-in
Registra la llegada física, vincula al acompañante (si lo hay) y activa la estadía.

- **Método**: `POST`
- **Path**: `/{reservaId}`
- **Content-Type**: `multipart/form-data`
- **Parámetros del Formulario (FormData)**:
    - `acompananteNombre` (string, opcional): Nombre completo del acompañante.
    - `acompananteCi` (string, opcional): CI del acompañante.
    - `fotoAnverso` (file, opcional): Imagen del anverso del carnet del acompañante.
    - `fotoReverso` (file, opcional): Imagen del reverso del carnet del acompañante.
    - `recepcionista` (string, opcional): Nombre del recepcionista que atiende. (Por defecto: "Recepcionista 1").

> [!IMPORTANT]
> Para registrar un acompañante, tanto `acompananteNombre` como `acompananteCi` deben ser proporcionados.

- **Respuesta Exitosa (200 OK)**:
    - Retorna el objeto `ReservaResponse` actualizado con estado `ACTIVA` y las horas de ingreso/salida calculadas.

---

## 3. Cancelar por Inconsistencia de Identidad
Si el recepcionista detecta que el cliente no corresponde a los documentos, se cancela el proceso.

- **Método**: `POST`
- **Path**: `/{reservaId}/cancelar`
- **Respuesta Exitosa (204 No Content)**:
    - La reserva pasa a estado `CANCELADA` y la habitación vuelve a estar `Disponible`.

---

## Estructura del Objeto ReservaResponse
Este objeto es el que recibirás en la mayoría de las respuestas de `/api/reservas` y `/api/checkin`.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | Long | Identificador único de la reserva. |
| `estado` | String | `PENDIENTE_PAGO`, `PAGADA`, `ACTIVA`, `CANCELADA`. |
| `fechaIngreso` | Date | Fecha programada de ingreso (YYYY-MM-DD). |
| `cantidadBloques` | Integer | Cantidad de bloques de tiempo contratados. |
| `montoTotal` | Double | Monto total a pagar/pagado. |
| `huesped` | Object | Datos básicos del titular de la reserva. |
| `habitacion` | Object | Datos de la habitación y su tipo. |
| `acompanante` | Object/null | Datos del acompañante (si se registró en el check-in). |
| `horaIngreso` | DateTime | Hora exacta de entrada física (Check-in). |
| `horaSalidaEstimada` | DateTime | Hora calculada de salida según el tipo de habitación. |

---

## Notas para el Frontend
1. **Validación de Pago**: El backend lanzará un error (400/500) si intentas hacer check-in en una reserva que aún no está en estado `PAGADA`. Asegúrate de completar el pago (CU-03) antes de llamar al POST de check-in.
2. **Llegada Tardía**: El backend calcula automáticamente si la hora de salida debe basarse en la hora de ingreso real o en la ventana de reserva (30 min después del pago) si el cliente llegó tarde (RN-07.B).
