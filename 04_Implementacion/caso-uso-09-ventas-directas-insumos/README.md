# Caso de Uso 09: Ventas directas de insumos

Objetivo: permitir que recepcion venda productos directamente, descuente stock y registre la venta en el historial financiero.

## Actor principal

- Recepcionista.

## Capas

- `frontend`: pantalla de ventas de insumos para seleccionar productos, cantidades y confirmar cobro.
- `backend/domain`: venta de insumos, items de inventario y recepcionista responsable.
- `backend/application`: servicio de ventas, validacion de stock y DTOs de historial.
- `backend/infrastructure`: controlador REST, repositorio de ventas e integracion con inventario.
- `database`: tablas de ventas, detalle serializado de items y stock disponible.

## Flujo principal

1. La recepcionista selecciona productos del catalogo.
2. Ingresa cantidades y revisa el total.
3. El sistema valida stock suficiente.
4. La recepcionista confirma el cobro fisico.
5. El sistema descuenta stock y registra la venta como pagada.
6. La venta queda disponible en el historial unificado.

## Reglas relacionadas

- RN-05: Responsabilidad por turno.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
