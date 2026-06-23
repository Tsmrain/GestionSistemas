# Caso de Uso 07: Gestion de inventario

Objetivo: conciliar el inventario fisico de una habitacion con lo esperado por el sistema y registrar automaticamente perdidas cuando existan faltantes.

## Actores

- Recepcionista.
- Camarera como apoyo operativo.

## Capas

- `frontend`: panel de recepcion para revisar inventario de habitacion, ajustar cantidades y guardar revision.
- `backend/domain`: habitacion, item de inventario, inventario asignado a habitacion y egreso por perdida.
- `backend/application`: servicio de inventario, DTOs de revision, puertos de inventario y egresos.
- `backend/infrastructure`: controlador REST, adaptadores JPA y repositorios de inventario.
- `database`: tablas de items, inventario por habitacion y egresos generados por faltantes.

## Flujo principal

1. La camarera cuenta los objetos fisicos de la habitacion durante limpieza o check-out.
2. La recepcionista abre el inventario de la habitacion en el panel.
3. Ingresa la cantidad encontrada de cada objeto.
4. El sistema compara cantidad esperada contra cantidad actual.
5. Si todo coincide, el item queda en estado `OK`.
6. Si hay faltantes, se marca la diferencia y se registra el egreso correspondiente al costo de compra.
7. El panel actualiza el estado de inventario de la habitacion.

## Reglas relacionadas

- RN-09: Conciliacion de inventario y perdidas.
- RN-11: Penalizacion por danos o faltantes en check-out.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
