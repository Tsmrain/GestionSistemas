# Caso de Uso 02: Registrar Reserva

Objetivo: registrar una reserva con datos del huesped, habitacion, fecha y fotos del carnet del titular.

## Capas

- `frontend`: formulario/modal de reserva.
- `backend/domain`: reserva, huesped, habitacion y tipo de habitacion.
- `backend/application`: servicio de reserva, DTOs y puertos.
- `backend/infrastructure`: controlador REST, persistencia y almacenamiento de archivos.
- `database`: datos iniciales relacionados con habitaciones y reservas.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
