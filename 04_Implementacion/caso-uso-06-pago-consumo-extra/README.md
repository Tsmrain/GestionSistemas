# Caso de Uso 06: Pago de consumo extra

Objetivo: permitir que el huesped, despues de acceder a la habitacion, seleccione productos de consumo extra, genere un QR de pago por el total y confirme el pago en la demo.

## Capas

- `frontend`: pantalla de tablet con menu de productos, carrito y pago QR de consumos.
- `backend/domain`: consumo extra, reserva y entidades asociadas.
- `backend/application`: servicio de consumo extra, DTOs y puertos.
- `backend/infrastructure`: controlador REST, repositorio de consumos y persistencia.
- `resources`: catalogo fijo de productos en `consumos-productos.json`.
- `database`: tablas necesarias para reservas, pagos y consumos extra.

## Flujo principal

1. El cliente abre la puerta con QR y la reserva queda activa.
2. La tablet muestra el menu de productos disponibles.
3. El cliente selecciona cantidades y revisa el carrito.
4. Presiona `Pagar consumos`.
5. El backend valida que la reserva este activa, calcula el total y registra el consumo en estado `PENDIENTE`.
6. La tablet muestra un QR de pago por el total.
7. En la demo, el boton `Pago confirmado — continuar` marca el consumo como `PAGADO`.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
