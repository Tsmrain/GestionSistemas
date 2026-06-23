# Caso de Uso 10: Administracion de personal y clientes

Objetivo: administrar clientes, camareras, recepcionistas y atributos operativos usados por el sistema.

## Actores

- Administrador.
- Recepcionista con permisos operativos.

## Capas

- `frontend`: modulo Administracion / ABM con pestañas para clientes, habitaciones, camareras, recepcion, incidencias y reportes.
- `backend/domain`: huesped, camarera, recepcionista, tipo de habitacion y atributos configurables.
- `backend/application`: servicio de administracion, validacion de duplicados y reglas de baja logica.
- `backend/infrastructure`: controlador `/api/admin`, adaptadores y repositorios de catalogos.
- `database`: tablas de personal, clientes, tipos de habitacion y estados configurables.

## Flujo principal

1. El administrador ingresa al modulo de administracion.
2. Selecciona el catalogo que desea gestionar.
3. Crea, edita, busca o elimina registros segun corresponda.
4. El sistema valida duplicados y campos obligatorios.
5. Las bajas de personal se manejan de forma logica para conservar reportes historicos.
6. Los cambios quedan disponibles para los flujos de recepcion, check-out, inventario y reportes.

## Alcance actual

- ABM de clientes.
- ABM de camareras.
- ABM de recepcionistas.
- ABM de atributos de habitaciones: tipo, precio, duracion y estado.
- Lectura de reportes de checkout.

Este caso de uso se ejecuta junto con los demas desde `../sistema-integrado`.
