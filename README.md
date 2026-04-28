# GestionSistemas

Repositorio de trabajo en la rama `develop` para el sistema de reservas del residencial. El proyecto queda organizado para que backend, frontend, base de datos y documentación estén alineados con una arquitectura por capas y se puedan levantar con Docker sin configuración adicional.

## Estructura

- `01_Modelado_Negocio`: modelo de dominio.
- `02_Requerimientos`: casos de uso y SSD.
- `03_Diseño`: diagramas de clases y secuencia.
- `04_Implementacion`: implementación separada por casos de uso y sistema integrado.
- `04_Implementacion/sistema-integrado/backend`: API Spring Boot.
- `04_Implementacion/sistema-integrado/frontend`: frontend estático servido con Nginx.
- `docker-compose.yml`: arranque integrado del entorno.

## Requisitos

- Docker y Docker Compose Plugin instalados.
- Git.
- Opcional para desarrollo local sin Docker:
  - Java 17
  - Maven 3.9+

## Arranque Plug And Play

Desde la raíz del repositorio:

```bash
docker compose down -v
docker compose up --build
```

Servicios esperados:

- Frontend: `http://localhost`
- Backend: `http://localhost:8081/api`
- PostgreSQL: `localhost:5433`

Credenciales de base de datos:

- Base: `sistema_reservas`
- Usuario: `admin`
- Password: `adminpassword`

## Flujo recomendado de uso

1. Abrir `http://localhost`.
2. Elegir fecha y tipo de habitación.
3. Buscar disponibilidad.
4. Registrar la reserva desde una tarjeta.
5. Completar el pago desde el mismo flujo del cliente, sin cambiar de pantalla.
6. Para recepcion, abrir `http://localhost/recepcion.html` e iniciar sesion con usuario de turno.

Tipos de habitación semilla:

- `Estandar`: `Bs 150`, duración `12 horas`
- `VIP`: `Bs 180`, duración `12 horas`
- `SUPERVIP`: `Bs 250`, duración `6 horas`

## Pruebas

Pruebas backend:

```bash
cd 04_Implementacion/sistema-integrado/backend
mvn test
```

Empaquetado backend:

```bash
cd 04_Implementacion/sistema-integrado/backend
mvn clean package
```

## Notas para el equipo

- La rama de trabajo es `develop`.
- El archivo `init.sql` ya deja la base alineada con las entidades y con los tipos de habitación definidos.
- `docker compose down -v` es importante cuando se cambia el esquema o los datos semilla, para recrear el volumen de PostgreSQL desde cero.

## Git

Flujo sugerido:

```bash
git checkout develop
git pull origin develop
docker compose up --build
```
