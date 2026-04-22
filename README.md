# Sistema de Reservas Residencial 🏨

Este proyecto es una plataforma de gestión de reservas para un complejo residencial, desarrollada bajo los principios arquitectónicos de **Craig Larman** (UML y Patrones). Se enfoca en una arquitectura por capas con una baja brecha de representación entre el modelo de dominio y la implementación.

## 🏗️ Arquitectura y Metodología
El sistema sigue el proceso unificado (UP) y aplica patrones **GRASP** para la asignación de responsabilidades:
- **Presentation Layer**: HTML5/CSS3 y JavaScript Vanilla (sin módulos para máxima compatibilidad).
- **Application Layer**: Controladores de aplicación que gestionan la lógica de los Casos de Uso.
- **Domain Layer**: Modelos de dominio y servicios expertos en información.
- **Infrastructure Layer**: Persistencia con Spring Data JPA y controladores REST.

## 🚀 Tecnologías
- **Backend**: Java 17, Spring Boot 3, Maven.
- **Frontend**: JavaScript Vanilla, CSS Moderno.
- **Base de Datos**: PostgreSQL 15.
- **Contenedores**: Docker & Docker Compose.

## 🛠️ Instalación y Despliegue
Para levantar todo el entorno (Base de Datos + Backend + Frontend), asegúrate de tener Docker instalado y ejecuta:

```bash
docker compose up --build -d
```

### Puertos de Acceso:
- **Frontend**: [http://localhost](http://localhost) (Puerto 80)
- **Backend API**: [http://localhost:8081/api](http://localhost:8081/api)
- **Base de Datos**: Puerto `5433` (mapeado para evitar conflictos con instancias locales).

## 📋 Casos de Uso Implementados
- **CU-01: Consultar Disponibilidad**: Permite buscar habitaciones por tipo y fecha. Implementado con validación de reglas de negocio y renderizado dinámico.

## 📂 Estructura del Proyecto
```text
.
├── artefactos/                # Documentación UP (UML, SSD, Contratos)
├── sistema-reservas-backend/  # Código fuente Spring Boot
├── sistema-reservas-frontend/ # Código fuente Frontend
└── docker-compose.yml         # Orquestación de contenedores
```

## 👥 Equipo
- **Arquitecto de Software & Backend**: Santiago
- **Frontend Developer**: [Tsmrain](https://github.com/Tsmrain)

---
*Este proyecto es parte de un proceso de desarrollo ágil y profesional.*
