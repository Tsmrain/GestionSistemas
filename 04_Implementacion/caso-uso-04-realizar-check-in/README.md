# Caso de Uso 04: Realizar Check-in

Objetivo: permitir que una recepcionista autenticada valide una reserva, registre acompañante si existe, confirme check-in y administre estados de habitaciones.

## Capas

- `frontend`: panel de recepcion, busqueda de reservas y modal de check-in.
- `backend/domain`: reserva, huesped, habitacion y tipo de habitacion.
- `backend/application`: servicio de check-in, DTOs y puertos.
- `backend/infrastructure`: controlador REST y persistencia.
- `database`: tablas y datos necesarios para reservas, huespedes y habitaciones.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
