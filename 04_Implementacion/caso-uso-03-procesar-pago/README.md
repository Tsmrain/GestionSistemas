# Caso de Uso 03: Procesar Pago

Objetivo: procesar el pago de una reserva por QR BNB o efectivo y actualizar el estado de la reserva.

## Capas

- `frontend`: modal y controlador de pago.
- `backend/domain`: pago, comprobante, reserva y entidades asociadas.
- `backend/application`: servicio de pago, DTOs y puertos.
- `backend/infrastructure`: controlador REST, repositorios y adaptador BNB sandbox.
- `database`: tablas y datos necesarios para pagos y comprobantes.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
