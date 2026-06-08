# Caso de Uso 05: Acceso por QR en puerta

Objetivo: permitir que una tablet ubicada en la puerta lea el QR de acceso del cliente, valide que la reserva corresponda a esa habitacion y registre el ingreso automaticamente.

## Capas

- `frontend`: pantalla `puerta.html`, controlador de lectura/validacion QR y generador del QR de acceso.
- `backend/domain`: reserva, pago, huesped, habitacion y tipo de habitacion.
- `backend/application`: servicio de acceso por puerta, DTOs y puertos necesarios para consultar reservas, pagos y actualizar habitacion.
- `backend/infrastructure`: controlador REST `POST /api/puerta/validar` y persistencia relacionada.
- `database`: tablas y datos necesarios para habitaciones, reservas, pagos y comprobantes.

## Flujo principal

1. El cliente recibe un QR de acceso despues de confirmar y pagar la reserva.
2. La tablet abre `puerta.html?habitacion=NUMERO`.
3. La camara lee el QR o se ingresa manualmente el codigo de reserva.
4. El frontend envia `{ codigo, habitacion }` a `/api/puerta/validar`.
5. El backend valida que la reserva exista, este pagada o activa y pertenezca a esa habitacion.
6. Si la reserva esta pagada, registra el ingreso, marca la habitacion como ocupada y devuelve la bienvenida.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
