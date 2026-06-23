# Implementacion del Sistema de Reservas

Esta carpeta esta organizada por casos de uso y por un sistema integrado ejecutable.

## Estructura

- `caso-uso-01-consultar-disponibilidad`: consulta de habitaciones disponibles.
- `caso-uso-02-registrar-reserva`: registro de reserva y datos del huesped.
- `caso-uso-03-procesar-pago`: pago por QR BNB o efectivo.
- `caso-uso-04-realizar-check-in`: panel de recepcion, check-in y limpieza.
- `caso-uso-05-acceso-puerta-qr`: validacion de acceso a habitacion por QR.
- `caso-uso-06-pago-consumo-extra`: compra y pago de consumos desde la habitacion.
- `caso-uso-07-gestion-inventario`: conciliacion de inventario fisico por habitacion.
- `caso-uso-08-gestion-incidencias`: registro, seguimiento y cierre de incidencias.
- `caso-uso-09-ventas-directas-insumos`: ventas directas de productos desde recepcion.
- `caso-uso-10-administracion-personal-clientes`: ABM de clientes, personal y atributos operativos.
- `caso-uso-11-caja-egresos-reportes`: caja, egresos y reportes financieros.
- `sistema-integrado`: aplicacion completa que une los once casos de uso.

Cada caso de uso contiene:

- `frontend`: vista/controlador/modelos usados por ese flujo.
- `backend/domain`: modelos de dominio usados por el flujo.
- `backend/application`: caso de uso, DTOs y puertos.
- `backend/infrastructure`: controladores web y persistencia.
- `database`: script base de datos asociado al caso de uso.

## Pantallas ejecutables

La pantalla del cliente es:

- `sistema-integrado/frontend/index.html`

En esa pantalla el cliente no necesita cuenta y puede hacer todo su flujo sin navegar a otra pantalla:

- Consulta de disponibilidad.
- Reserva.
- Pago.

La pantalla de recepcion es:

- `sistema-integrado/frontend/recepcion.html`

La recepcionista debe iniciar sesion con su usuario. Usuarios semilla:

- `recepcion1` / `123456`
- `recepcion2` / `123456`

Desde la zona de recepcion se gestiona:

- Panel de habitaciones en tiempo real.
- Busqueda de reservas.
- Check-in.
- Cambio de estado a limpieza/disponible.
- Check-out y reportes de verificacion.
- Inventario por habitacion e incidencias.
- Ventas de insumos.
- Finanzas, egresos y reportes.
- Administracion / ABM de clientes, habitaciones, camareras, recepcionistas e incidencias.

## Entorno de desarrollo

Requisito comun para Windows, macOS y Linux:

- Docker Desktop o Docker Engine con Docker Compose.

Desde la raiz del repositorio:

```bash
docker compose up -d --build
```

Tambien puede ejecutarse desde esta carpeta:

```bash
cd 04_Implementacion
docker compose up -d --build
```

URLs:

- Frontend: `http://localhost`
- Backend: `http://localhost:8081`
- PostgreSQL: `localhost:5433`

Para pruebas del backend:

```bash
cd 04_Implementacion/sistema-integrado/backend
mvn test
```

Para apagar el entorno:

```bash
docker compose down
```
