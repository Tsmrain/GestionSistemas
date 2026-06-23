# Caso de Uso 11: Caja y egresos / reportes financieros

Objetivo: registrar egresos operativos con comprobante digital y generar reportes financieros de ingresos, egresos y caja neta.

## Actores

- Administrador.
- Recepcionista.

## Capas

- `frontend`: pantalla Finanzas e Inventario con resumen de caja, filtros de periodo, formulario de egreso y reportes.
- `backend/domain`: egreso, pago, consumo extra, venta de insumos y comprobante.
- `backend/application`: servicio de finanzas, calculo de totales y registro de egresos.
- `backend/infrastructure`: controlador de finanzas, almacenamiento de comprobantes y repositorios financieros.
- `database`: tablas de pagos, consumos, ventas, egresos y comprobantes.

## Flujo principal

1. La recepcionista registra descripcion, monto, categoria, destinatario y comprobante del egreso.
2. El sistema guarda el comprobante como archivo y persiste el egreso.
3. El administrador o recepcionista selecciona un periodo de reporte.
4. El sistema suma ingresos por alojamiento, consumos y ventas directas.
5. El sistema suma egresos manuales y egresos generados por inventario o incidencias.
6. Se muestra caja neta, detalle de ingresos, egresos recientes y balance del periodo.

## Reglas relacionadas

- RN-05: Responsabilidad por turno.
- RN-09: Conciliacion de inventario y perdidas.
- RN-11: Penalizacion por danos o faltantes en check-out.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
