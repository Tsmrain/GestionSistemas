# Caso de Uso 01: Consultar Disponibilidad

Objetivo: mostrar habitaciones disponibles por fecha y tipo de habitacion.

## Capas

- `frontend`: componentes de consulta y renderizado de habitaciones.
- `backend/domain`: entidades necesarias para disponibilidad.
- `backend/application`: servicio de disponibilidad, DTOs y puertos.
- `backend/infrastructure`: controlador REST y repositorios JPA.
- `database`: datos iniciales usados para habitaciones, tipos y reservas.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
