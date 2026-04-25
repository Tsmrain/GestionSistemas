# Sistema de Reservas Residencial 🏨

Este proyecto es una plataforma de gestión de reservas para un complejo residencial, desarrollada bajo los principios arquitectónicos de **Craig Larman** (UML y Patrones). Se enfoca en una arquitectura por capas con una baja brecha de representación entre el modelo de dominio y la implementación.

## 🏗️ Arquitectura y Metodología
El sistema sigue el proceso unificado (UP) y aplica patrones **GRASP** para la asignación de responsabilidades:
- **Presentation Layer**: JavaScript Vanilla (Nginx).
- **Application Layer**: Controladores de aplicación para la lógica de Casos de Uso.
- **Domain Layer**: Modelos de dominio y servicios expertos en información.
- **Infrastructure Layer**: Persistencia con Spring Data JPA (PostgreSQL).

## 📂 Estructura del Proyecto
El repositorio está organizado según las fases del Proceso Unificado:
- `01_Modelado_Negocio`: Modelo de dominio inicial.
- `02_Requerimientos`: Casos de uso (CU-01) y SSD.
- `03_Diseño`: Diagramas de clases y secuencia.
- `04_Implementacion/`: Código fuente del Backend (Spring Boot) y Frontend.
- `docker-compose.yml`: Orquestación de contenedores.

## 🚀 Arranque "Plug And Play" (Docker)
Para levantar todo el entorno (Base de Datos + Backend + Frontend) sin configuración adicional:

```bash
docker compose up --build -d