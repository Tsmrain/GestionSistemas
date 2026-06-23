# Caso de Uso 08: Gestion de incidencias

Objetivo: registrar danos o averias de mantenimiento, bloquear habitaciones afectadas y dar seguimiento hasta su resolucion.

## Actores

- Recepcionista.
- Soporte tecnico o mantenimiento como actor operativo externo al sistema.

## Capas

- `frontend`: modulo de administracion para crear, editar, resolver y consultar incidencias.
- `backend/domain`: incidencia de mantenimiento, habitacion, item afectado y egreso de reparacion.
- `backend/application`: servicio administrativo de incidencias, DTOs y reglas de cierre.
- `backend/infrastructure`: controlador de administracion, adaptadores JPA y endpoints de incidencias.
- `database`: persistencia de incidencias, seguimiento, costos de reparacion y estado de habitacion.

## Flujo principal

1. La recepcionista registra habitacion, item afectado, descripcion del dano y seguimiento inicial.
2. El sistema guarda la incidencia en estado `PENDIENTE`.
3. La habitacion pasa a `Mantenimiento` y queda bloqueada para nuevas reservas.
4. Cuando el dano se repara, la recepcionista registra el costo y marca la incidencia como resuelta.
5. El sistema registra el egreso por reparacion.
6. Si no quedan incidencias pendientes para esa habitacion, el sistema la puede liberar nuevamente.

## Reglas relacionadas

- RN-10: Bloqueo por mantenimiento.
- RN-11: Penalizacion por danos o faltantes en check-out.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
