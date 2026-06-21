# CAPÍTULO 1: INTRODUCCIÓN

## Índice de Contenidos

1. [Requisitos del Proyecto / Explicación del Sistema Actual](#1-requisitos-del-proyecto--explicacion-del-sistema-actual)
2. [Objetivo General](#2-objetivo-general)
3. [Objetivo Específico](#3-objetivo-especifico)
4. [Organigrama y Funciones](#4-organigrama-y-funciones)
    * [Dirección General](#direccion-general)
    * [Operaciones](#operaciones)
    * [Finanzas](#finanzas)
5. [Procesos y su Clasificación](#5-procesos-y-su-clasificacion)
6. [Entradas](#6-entradas)
7. [Salidas](#7-salidas)
8. [Relaciones entre Procesos](#8-relaciones-entre-procesos)
9. [Retroalimentación](#9-retroalimentacion)
10. [Ambiente](#10-ambiente)
11. [Tipo de Sistema](#11-tipo-de-sistema)
12. [UML](#12-uml)
    * [CU-01: Consultar Disponibilidad](#cu-01-consultar-disponibilidad)
    * [CU-02: Registrar Reserva](#cu-02-registrar-reserva)
    * [CU-03: Procesar Pago](#cu-03-procesar-pago)
    * [CU-04: Realizar Check-in](#cu-04-realizar-check-in)
    * [CU-05: Acceso por QR en Puerta](#cu-05-acceso-por-qr-en-puerta)
    * [CU-06: Pago de Consumo Extra](#cu-06-pago-de-consumo-extra)
* [Modelo de Dominio del Sistema](#modelo-de-dominio-del-sistema)
* [Caso de Uso del Sistema](#caso-de-uso-del-sistema)
* [Diagrama de Actividad del Sistema](#diagrama-de-actividad-del-sistema)
* [Diagrama de Paquetes del Sistema](#diagrama-de-paquetes-del-sistema)
* [Diagrama de Actividad: Caso de uso principal – Realizar Reserva](#diagrama-de-actividad-caso-de-uso-principal--realizar-reserva)
* [Actividad de Objeto: Muestra el ciclo de vida de una habitación](#actividad-de-objeto-muestra-el-ciclo-de-vida-de-una-habitacion)
* [Anexos](#anexos)

---

## 1. Requisitos del Proyecto / Explicación del Sistema Actual

El sistema actual de servicios de alojamiento temporal en Santa Cruz opera de manera tradicional, con diferentes niveles de digitalización según la categoría del establecimiento.

### Métodos de Contacto
Para contactar al establecimiento **PREMIUM**, existen varios métodos:
* **Personalmente:** Acudiendo de forma física al establecimiento.
* **Redes Sociales:** A través de plataformas como Facebook, Instagram, TikTok, entre otras.

Las personas pueden acceder a cualquier red social para encontrar el número de contacto y la ubicación. Una vez establecido el contacto, se envía un mensaje y el personal de atención envía los precios con las características de cada tipo de habitación:
* **Estandar [150 Bs. / 12 hrs.]:** Aire acondicionado (A/C) y cama de 2 plazas.
* **VIP [180 Bs. / 12 hrs.]:** Aire acondicionado (A/C), cama de 3 plazas y comida incluida.
* **SUPERVIP [250 Bs. / 6 hrs.]:** Cama de 3 plazas, jacuzzi, servicio de habitación, consumos incluidos, acceso a Internet y aire acondicionado (A/C).

### Proceso de Reserva y Registro
Una vez seleccionado el tipo de habitación, se procede a registrar los datos del cliente:
* **Con reserva:** La información se rellena de forma secuencial al momento de realizar la reserva previa.
* **Sin reserva (Llegada directa):** Si el cliente decide no reservar y llega directamente al establecimiento, los datos son registrados manualmente en recepción en ese instante.

### Proceso de Ingreso (Check-In)
Una vez realizado el pago, el cliente se presenta en recepción e indica si cuenta con una reserva y el nombre del titular. En caso de no tener reserva:
1. Solicita una habitación disponible.
2. Realiza el pago correspondiente (ya sea mediante transferencia QR o en efectivo).
3. Tras confirmar el pago, el recepcionista hace entrega de los accesorios de acceso a la habitación, tales como la tarjeta de acceso y los controles remotos de la televisión, TV por cable y aire acondicionado.

> [!NOTE]
> En el caso de reservas de tipo **SUPERVIP** (Suites), el recepcionista informa a los clientes sobre la *"hora loca"*, que consiste en una conservadora ubicada en el exterior de la habitación. Los clientes pueden seleccionar libremente y según su preferencia los diferentes tipos de tragos y bebidas de cortesía que se encuentren en ella.

### Proceso de Salida (Check-Out) y Limpieza
Al momento de la salida, los clientes deben llevar consigo la tarjeta de acceso y los controles remotos (TV, cable y A/C), cerrar la puerta y entregarlos en recepción.
* **Procedimiento de Limpieza:** Minutos después de la salida del cliente, el personal de limpieza ingresa a la habitación utilizando una tarjeta magnética especial asignada para este fin.
* **Notificación de Finalización:** Al concluir las tareas de limpieza e higiene, el personal notifica al encargado a través de su radio transmisor (*walkie-talkie*).
* **Actualización del Estado:** El encargado actualiza el cuaderno de registro físico, anotando detalladamente el estado actual de la habitación y cualquier observación relevante sobre limpieza o mantenimiento.

### Incidentes y Seguridad
En caso de presentarse algún conflicto o inconveniente con un huésped, el encargado se comunica de inmediato con el personal de seguridad para resolver la situación de forma rápida, eficiente y segura, garantizando el bienestar general en el establecimiento.

### Reportes e Informes Financieros
Al concluir cada turno laboral de 8 horas, los recepcionistas están obligados a presentar un informe detallado con los gastos y cobros totales. El personal se distribuye en tres turnos rotativos:
* Turno Madrugada
* Turno Tarde
* Turno Noche

### Políticas de Reserva y Uso del Servicio
* **Cargos por tiempo extra:** En caso de que el cliente exceda el tiempo límite de su estadía, se le cobrará una tarifa adicional por el tiempo extra utilizado. Cabe destacar que el tiempo de ocupación transcurre independientemente de si el cliente permanece físicamente en la habitación o se encuentra fuera del establecimiento.
* **Políticas de devolución:** La única causal de devolución de dinero es si la habitación asignada se encuentra en malas condiciones y no existe otra habitación de categoría equivalente o superior disponible para su reemplazo.
* **Políticas de cancelación:** Bajo ninguna circunstancia se aceptan cancelaciones de reservas.

### Plantillas de Informes Financieros

#### Reporte por Turno
| Turno | Fecha | Responsable | Total Habitación | Total Accesorios | Total Consumos | Total |
|---|---|---|---|---|---|---|
| | | | | | | |

#### Libro Diario
| Responsable | Fecha | Nro. Habitación | Consumos | Accesorios | Total |
|---|---|---|---|---|---|
| | | | | | |

---

## 2. Objetivo General
Diseñar un sistema de información que facilite y optimice la gestión de reservas de moteles.

---

## 3. Objetivo Específico
Los siguientes objetivos específicos se establecieron con base en los requisitos levantados, encuestas y entrevistas realizadas:
* **Levantamiento de Requerimientos:** Recopilar información detallada sobre los procesos actuales relacionados con la gestión de reservas de alojamiento en Santa Cruz. Esto incluye identificar las necesidades clave tanto de los clientes como del personal operativo mediante entrevistas y encuestas, estableciendo una base sólida para el desarrollo del software.
* **Análisis del Sistema:** Modelar el comportamiento y la estructura del sistema utilizando Lenguaje de Modelado Unificado (UML) para visualizar las interacciones. Se definirán con precisión los procesos, las entradas, las salidas, los bucles de retroalimentación y las oportunidades de mejora operativa.
* **Diseño del Sistema:** Desarrollar una plataforma integrada para la gestión integral de moteles (administración de habitaciones, reservas, procesamiento de pagos y reportes de estado). Las interfaces diseñadas permitirán a los establecimientos controlar los accesos, administrar habitaciones y generar informes financieros de manera automatizada.

---

## 4. Organigrama y Funciones

El personal de la organización está estructurado jerárquicamente en tres áreas principales: Dirección General, Operaciones y Finanzas.

### Dirección General

#### Director General
* Toma de decisiones estratégicas de la empresa.
* Supervisión general de todas las operaciones del establecimiento.
* Establecimiento de políticas internas y manuales de procedimientos.
* Coordinación directa con los administradores de operaciones y finanzas.

### Operaciones

#### Administrador de Operaciones
* Supervisión de todas las actividades operativas del día a día.
* Planificación y coordinación de horarios y turnos de personal.
* Asegurar el cumplimiento de los estándares de calidad definidos.
* Resolución de problemas y eventualidades operativas diarias.

#### Soporte (Supervisor 24/7)
* Supervisión continua de las actividades de soporte en todo momento.
* Gestión y resolución de incidencias técnicas y operativas.
* Brindar asistencia inmediata a los empleados ante problemas en el turno.

#### Control de Calidad (Empleado Nuevo)
* Inspección minuciosa y verificación de la calidad de los servicios prestados.
* Garantizar el cumplimiento estricto de los estándares de higiene, limpieza y mantenimiento.
* Reportar desviaciones operativas y proponer acciones de mejora continua.

#### Recepción (Turno Mañana / Turno Noche)
* Gestión de los procesos de registro de entrada (*Check-in*) y salida (*Check-out*).
* Atención al cliente y administración de reservas en el sistema.
* Control, cobro y facturación de servicios y consumos.

#### Seguridad (Turno Mañana / Turno Noche)
* Vigilancia activa y protección física de toda la infraestructura.
* Monitoreo del sistema de cámaras y control estricto de accesos.
* Intervención ante emergencias y mediación en la resolución de conflictos.

#### Camarera (Empleado de Limpieza)
* Limpieza profunda, desinfección y preparación de habitaciones y áreas comunes.
* Mantenimiento riguroso de los estándares de higiene exigidos.
* Reportar inmediatamente desperfectos o necesidades de mantenimiento en las habitaciones.

#### Mantenimiento (Empleado Nuevo)
* Ejecución de reparaciones generales y mantenimiento preventivo de la infraestructura.
* Inspección periódica de los equipos e instalaciones clave (aire acondicionado, jacuzzi, etc.).
* Coordinación interdisciplinar para la resolución ágil de fallas técnicas.

### Finanzas

#### Administrador de Finanzas
* Supervisión general de las actividades y la salud financiera de la organización.
* Elaboración y control de presupuestos y contabilidad general.
* Coordinación y validación de las cuentas de cobros y pagos.

#### Contabilidad (Inventario)
* Registro, control y auditoría de inventarios de insumos, accesorios y consumos.
* Supervisión del nivel de existencias y generación de pedidos de reabastecimiento.
* Elaboración de informes de costos y valor de los inventarios.

#### Pagos (Caja/Pago)
* Gestión de la caja general y procesamiento de transacciones financieras diarias.
* Registro sistemático de ingresos, egresos y control de efectivo.
* Elaboración de reportes periódicos de flujo de caja.

---

## 5. Procesos y su Clasificación

Los procesos del sistema se clasifican bajo el enfoque de teoría general de sistemas en procesos de caja negra (procesamiento externo y de interfaz) y procesos de caja blanca (lógica interna y flujo detallado).

### Caja Negra (Black Box)
* **P_AdminRealizaReserva:** Recibe la información del cliente junto con el tipo de habitación deseada, procesa el requerimiento y genera la confirmación de reserva correspondiente.
* **P_ClienteContactaEstablecimiento:** Captura las solicitudes de los clientes recibidas a través de los diferentes canales de comunicación (redes sociales o de manera presencial) y proporciona la información detallada sobre los servicios disponibles.
* **P_AdminGestionarTiempoExtra:** Monitorea de forma continua el tiempo de estadía de los huéspedes y determina si aplican cobros adicionales por horas de uso excedidas.
* **P_ProcesarPago:** Gestiona las transacciones financieras por los medios autorizados (código QR o dinero en efectivo) y emite el comprobante de pago digital o físico.
* **P_VerificarSalida:** Confirma la devolución de los accesorios entregados al inicio de la estadía (tarjetas, controles remotos) y procede a liberar la habitación en el sistema.

### Caja Blanca (White Box)
* **P_GestionarHabitaciones:** Actualiza y controla en tiempo real los estados de ocupación, disponibilidad y mantenimiento de las habitaciones.
* **P_EntregarAccesorios:** Controla la distribución física y el retorno de las tarjetas de acceso y los dispositivos de control electrónico.
* **P_GestionarLimpieza:** Coordina la asignación de tareas del personal de limpieza y actualiza la disponibilidad de las habitaciones una vez higienizadas.
* **P_RegistrarEstado:** Mantiene un registro histórico y actualizado de las condiciones físicas de las habitaciones y de cualquier observación reportada.
* **P_GenerarInformeTurno:** Consolida de manera periódica toda la información operativa y financiera capturada durante cada turno de trabajo de 8 horas.
* **P_GestionarConsumos:** Administra los consumos de servicios adicionales y la selección de bebidas provenientes de la conservadora exterior ("hora loca").
* **P_ControlarSeguridad:** Supervisa permanentemente los accesos al establecimiento y maneja de forma proactiva cualquier situación de conflicto o incidente reportado.

---

## 6. Entradas

El flujo de información hacia el sistema se organiza en entradas secuenciales (estructuradas e indispensables para el proceso básico) y entradas aleatorias (asíncronas o sujetas a incidentes).

### Entradas Secuenciales
* **E_InformacionCliente:** Datos de identificación (nombre, cédula de identidad) y contacto del huésped.
* **E_TipoHabitacion:** Selección de la categoría de habitación y sus características requeridas por el cliente.
* **E_RegistroAccesorios:** Registro y control de la entrega de tarjetas magnéticas y controles remotos de dispositivos.
* **E_InformeTurno:** Consolidación de actividades, ingresos y egresos registrados por periodo laboral.

### Entradas Aleatorias
* **E_SolicitudLimpieza:** Requerimiento asíncrono de servicio de limpieza de habitación tras la salida del cliente o por demanda.
* **E_RegistroConsumos:** Reportes de solicitudes de productos adicionales de consumo y bebidas de la conservadora.
* **E_IncidenteSeguridad:** Notificación y reporte de situaciones de conflicto o imprevistos de seguridad en las instalaciones.
* **E_TiempoExtra:** Registro automático o manual de la extensión del tiempo de estadía acordado.

---

## 7. Salidas

Los resultados y productos de información generados por el sistema comprenden:
* **S_ConfirmacionReserva:** Estado y detalles de la reserva realizada.
* **S_ComprobantePago:** Registro de transacción y monto cobrado.
* **S_EstadoHabitacion:** Condición actual y disponibilidad de la habitación.
* **S_ReporteTurno:** Resumen operativo y financiero consolidado.
* **S_ControlAccesorios:** Estado y registro de devolución de dispositivos y tarjetas.
* **S_InformeLimpieza:** Reporte de condiciones del cuarto y observaciones de limpieza.

---

## 8. Relaciones entre Procesos

Las interacciones entre los componentes del sistema se catalogan según su naturaleza de acoplamiento.

### Relaciones Simbióticas
Estas relaciones son indispensables para el funcionamiento y la supervivencia mutua de ambos procesos:
* **P_GestionarLimpieza $\rightarrow$ P_ActualizarEstado**
  * *Interdependencia:* La limpieza requiere la actualización inmediata del estado en el registro; el estado depende de la confirmación final de la limpieza.
* **P_ControlarAccesos $\rightarrow$ P_GestionarLimpieza**
  * *Interdependencia:* El personal de limpieza requiere acceso con una tarjeta especial de servicio; el control de accesos valida su autorización correspondiente.
* **P_VerificarInventario $\rightarrow$ P_RegistrarEstado**
  * *Interdependencia:* La verificación final de inventario condiciona el estado registrado; el inventario a su vez requiere actualizarse conforme al estado reportado.

### Relaciones Sinérgicas
Estas relaciones no son críticas para la supervivencia individual de los procesos, pero su integración genera un valor y desempeño superior para el sistema global:
* **P_GestionarLimpieza $\rightarrow$ P_GenerarReportes**
  * *Efecto Sinérgico:* La limpieza provee datos reales para la generación de reportes; a su vez, la analítica de los reportes ayuda a optimizar las rutas y horarios de limpieza.
* **P_ComunicarWalkie $\rightarrow$ P_GestionarLimpieza**
  * *Efecto Sinérgico:* La comunicación por radio mejora la eficiencia de la limpieza al reducir tiempos de espera; la limpieza brinda actualización instantánea de su estado mediante la comunicación radial.
* **P_GestionarLimpieza $\rightarrow$ P_GestionarMantenimiento**
  * *Efecto Sinérgico:* Durante las labores de limpieza se detectan de manera temprana fallas en la infraestructura, facilitando la intervención oportuna de mantenimiento.

---

## 9. Retroalimentación

La retroalimentación regula el comportamiento del sistema para garantizar la estabilidad y mejora continua.

### Retroalimentación Simbiótica
* **P_RealizarReserva $\rightarrow$ P_GestionarHabitaciones:** Envía información actualizada de disponibilidad para evitar sobreventas.
* **P_ProcesarPago $\rightarrow$ P_GenerarInformeTurno:** Control financiero inmediato y verificación diaria en caja.
* **P_EntregarAccesorios $\rightarrow$ P_VerificarSalida:** Control de inventario físico y garantía de devolución de accesorios al check-out.

### Retroalimentación Sinérgica
* **P_GestionarLimpieza $\rightarrow$ P_RegistrarEstado:** Mejora los controles de calidad evaluando el estado final de las habitaciones de forma sistemática.
* **P_GestionarConsumos $\rightarrow$ P_GenerarInformeTurno:** Optimización en la reposición de existencias en base a consumos reales.
* **P_ControlarSeguridad $\rightarrow$ P_GestionarHabitaciones:** Incremento de la fiabilidad y la calidad percibida en la asignación segura del espacio.

---

## 10. Ambiente

El sistema opera en un entorno hotelero 24/7 y está sujeto a factores internos y externos.

### Ambiente Interno
* Red local integrada que vincula recepción, limpieza y administración.
* Sistema de control electrónico de accesos mediante tarjetas magnéticas.
* Infraestructura de comunicación interna (walkie-talkies).
* Sistema de monitoreo de tiempos de estadía y estados de habitaciones.

### Ambiente Externo
* Interfaz y comunicación con pasarelas de pago y banca digital (QR/efectivo).
* Conexión con canales digitales y redes sociales para la captación y promoción.
* Normativas de hospedaje y reglamentaciones municipales vigentes.
* Fluctuaciones y picos en la demanda según la temporada.

### Limitaciones del Sistema
* Capacidad física instalada (número finito de habitaciones).
* Disponibilidad de personal distribuido en turnos de 8 horas.
* Tiempos físicos de respuesta para labores de mantenimiento complejo.
* Requisitos y leyes de seguridad, protección de datos y privacidad de los huéspedes.

---

## 11. Tipo de Sistema

El sistema es principalmente un **TPS (Transaction Processing System - Sistema de Procesamiento de Transacciones)** con elementos integrados de **MIS (Management Information System - Sistema de Información para la Administración)**.

* **Justificación:** El sistema requiere un procesamiento transaccional de alta robustez para dar soporte a las operaciones diarias del establecimiento (check-in, check-out, asignación de accesorios, cobros y cambios de estado de habitaciones). A su vez, se complementa con un componente de tipo MIS que consolida los reportes financieros por turno y el estado del inventario para la toma de decisiones administrativas y estratégicas por parte de la Dirección General.

---

## 12. UML

A continuación se detalla la priorización y descripción de los casos de uso identificados e implementados en el proyecto:

| Código | Caso de Uso | Actor(es) | Prioridad | Descripción |
|---|---|---|---|---|
| **CU-01** | **Consultar Disponibilidad** | Cliente (Huésped) | Alta | Permite verificar la disponibilidad de habitaciones según la fecha, el horario y la categoría seleccionada de forma autónoma. |
| **CU-02** | **Registrar Reserva** | Cliente (Huésped) / Recepcionista | Alta | Captura la información del cliente y registra la reserva en estado "PENDIENTE_PAGO" vinculando la habitación seleccionada. |
| **CU-03** | **Procesar Pago** | Cliente (Huésped) / Recepcionista / API Externa (BNB) | Alta | Procesa la transacción financiera mediante código QR dinámico integrado con el BNB o en efectivo, actualizando el estado de la reserva a "PAGADA". |
| **CU-04** | **Realizar Check-in** | Recepcionista / Personal de Limpieza | Alta | Administra el ingreso físico del cliente, la entrega de accesorios, el estado de las habitaciones en tiempo real y la posterior liberación tras limpieza. |
| **CU-05** | **Acceso por QR en Puerta** | Cliente (Huésped) / Sistema (Tablet en Puerta) | Alta | Valida de manera autónoma el código QR del huésped en la puerta de la habitación asignada, registrando el ingreso y marcándola como ocupada. |
| **CU-06** | **Pago de Consumo Extra** | Cliente (Huésped) | Media | Habilita al huésped a consumir productos y servicios adicionales dentro de la habitación, procesando el cobro mediante QR integrado. |

---

### CASOS DE USO DETALLADOS

---

### CU-01: Consultar Disponibilidad

#### Actores
* **Primario:** Cliente (Huésped)

#### Tipo
* Primario / Esencial

#### Propósito
Permitir al huésped conocer la disponibilidad y tarifas de las habitaciones para una fecha y horario específicos sin revelar detalles de la interfaz.

#### Resumen
El cliente ingresa la fecha, hora de ingreso y la categoría de habitación requerida. El sistema busca habitaciones libres que coincidan con los criterios y presenta las opciones disponibles con sus tarifas calculadas.

#### Precondición
* El sistema debe contar con el catálogo de tipos de habitación y sus tarifas vigentes parametrizadas.

#### Curso Básico de Acción

| Actor (Cliente) | Respuestas del Sistema |
|---|---|
| **1.** El cliente inicia la consulta indicando la fecha, la hora de ingreso estimada, la duración de la estadía y la categoría de habitación deseada. | **2.** El sistema busca habitaciones disponibles que cumplan con la categoría y el rango de tiempo especificado. |
| **3.** El cliente solicita ver el detalle de las opciones encontradas. | **4.** El sistema presenta las habitaciones disponibles indicando sus características particulares (capacidad, servicios incluidos) y el precio total correspondiente. |

#### Caminos Alternativos
* **Paso 2a (Sin habitaciones disponibles):** Si no existen habitaciones disponibles para el criterio ingresado, el sistema informa la falta de vacancia para ese período y sugiere opciones en horarios, fechas u otras categorías alternativas. El cliente puede modificar los criterios de búsqueda o finalizar la consulta.

#### Postcondición
* Se muestran las opciones de habitaciones disponibles y sus precios calculados, sin alterar el estado de reserva o asignación de las habitaciones.

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Cliente((Cliente / Huésped))
    subgraph Sistema Residencial
        CU01(CU-01: Consultar Disponibilidad)
    end
    Cliente --> CU01
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class DisponibilidadView {
        +mostrarResultados(habitaciones)
        +mostrarMensajeError(mensaje)
    }
    class DisponibilidadController {
        -disponibilidadService
        +consultar(fecha, hora, tipo)
    }
    class DisponibilidadService {
        <<interface>>
        +buscarHabitacionesDisponibles(query)
    }
    class Habitacion {
        -numero: String
        -estadoActual: String
    }
    DisponibilidadView ..> DisponibilidadController : eventos
    DisponibilidadController --> DisponibilidadService
    DisponibilidadService ..> Habitacion
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Cliente
    participant View as DisponibilidadView
    participant Ctrl as DisponibilidadController
    participant Serv as DisponibilidadService
    participant Repo as HabitacionRepository

    Cliente->>View: Ingresa fecha, hora y tipo
    View->>Ctrl: consultar(fecha, hora, tipo)
    Ctrl->>Serv: buscarHabitacionesDisponibles(query)
    Serv->>Repo: findByEstado("Disponible")
    Repo-->>Serv: lista de habitaciones
    Serv-->>Ctrl: lista filtrada
    Ctrl-->>View: renderizar resultados
    View-->>Cliente: muestra habitaciones disponibles
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Cliente((Cliente)) -- "1: ingresarCriterios()" --> View[DisponibilidadView]
    View -- "2: consultar()" --> Ctrl[DisponibilidadController]
    Ctrl -- "3: buscarHabitacionesDisponibles()" --> Serv[DisponibilidadService]
    Serv -- "4: findByEstado()" --> Repo[(HabitacionRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        DisponibilidadView
        DisponibilidadController
    end
    subgraph Application [Aplicación - Backend App]
        DisponibilidadService
    end
    subgraph Domain [Dominio - Backend Domain]
        Habitacion
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        HabitacionRepository
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

### CU-02: Registrar Reserva

#### Actores
* **Primario:** Cliente (Huésped)
* **Alternativo:** Recepcionista (en representación del cliente)

#### Tipo
* Primario / Esencial

#### Propósito
Registrar formalmente el compromiso de reserva de una habitación específica para un huésped y asociarle un identificador único.

#### Resumen
El cliente (o el recepcionista) selecciona una habitación disponible en un horario definido y proporciona la información de identificación personal del huésped. El sistema registra la reserva en estado "PENDIENTE_PAGO" y asocia temporalmente el recurso de la habitación.

#### Precondición
* Se debe haber verificado la disponibilidad de la habitación en el período solicitado (CU-01).

#### Curso Básico de Acción

| Actor (Cliente / Recepcionista) | Respuestas del Sistema |
|---|---|
| **1.** Solicita reservar la habitación seleccionada introduciendo los datos personales del huésped (nombre, cédula de identidad, celular y fecha de nacimiento) y la información de la estadía. | **2.** El sistema verifica que la habitación elegida continúe libre para el período seleccionado y valida los datos de registro ingresados. |
| **3.** Confirma los datos de la reserva para su procesamiento. | **4.** El sistema registra la reserva en estado "PENDIENTE_PAGO", asocia temporalmente la habitación y genera un identificador único de reserva. |

#### Caminos Alternativos
* **Paso 2a (Habitación ocupada en el proceso):** Si la habitación fue reservada por otro usuario durante el proceso, el sistema notifica el conflicto de disponibilidad, ofrece recursos alternativos equivalentes y permite reiniciar la selección.
* **Paso 2b (Huésped ya registrado en la base de datos):** Si la cédula de identidad ya existe en el sistema, el sistema reconoce el registro previo, precarga los datos históricos correspondientes y asocia la nueva reserva a la cuenta del huésped.

#### Postcondición
* La reserva queda registrada en estado "PENDIENTE_PAGO", y la habitación queda bloqueada temporalmente para el período correspondiente a la espera de la confirmación del pago.

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Cliente((Cliente))
    Recepcionista((Recepcionista))
    subgraph Sistema Residencial
        CU02(CU-02: Registrar Reserva)
    end
    Cliente --> CU02
    Recepcionista --> CU02
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class ReservaView {
        +capturarDatosHuesped()
        +mostrarConfirmacion(reservaId)
    }
    class ReservaController {
        -reservaService
        +registrarReserva(request)
    }
    class ReservaService {
        <<interface>>
        +crearReserva(command)
    }
    class Reserva {
        -id: Long
        -estado: String
        -fechaCreacion: Date
    }
    ReservaView ..> ReservaController : eventos
    ReservaController --> ReservaService
    ReservaService ..> Reserva
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Actor as Cliente / Recepcionista
    participant View as ReservaView
    participant Ctrl as ReservaController
    participant Serv as ReservaService
    participant Repo as ReservaRepository

    Actor->>View: Ingresa datos personales e info de estadía
    View->>Ctrl: registrarReserva(request)
    Ctrl->>Serv: crearReserva(command)
    Serv->>Repo: save(Reserva)
    Repo-->>Serv: Reserva guardada (estado=PENDIENTE_PAGO)
    Serv-->>Ctrl: ReservaResponse
    Ctrl-->>View: renderizarConfirmacion(reservaId)
    View-->>Actor: muestra identificador de reserva
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Actor((Cliente / Recepcionista)) -- "1: ingresarDatos()" --> View[ReservaView]
    View -- "2: registrarReserva()" --> Ctrl[ReservaController]
    Ctrl -- "3: crearReserva()" --> Serv[ReservaService]
    Serv -- "4: save()" --> Repo[(ReservaRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        ReservaView
        ReservaController
    end
    subgraph Application [Aplicación - Backend App]
        ReservaService
    end
    subgraph Domain [Dominio - Backend Domain]
        Reserva
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        ReservaRepository
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

### CU-03: Procesar Pago

#### Actores
* **Primario:** Cliente (Huésped)
* **Secundario:** Recepcionista, API Externa de la Entidad Bancaria (BNB)

#### Tipo
* Primario / Esencial

#### Propósito
Formalizar la reserva mediante la validación, confirmación y registro del cobro financiero correspondiente.

#### Resumen
Con base en una reserva pendiente, el sistema presenta los métodos de pago autorizados (QR bancario o efectivo). Si se selecciona QR, interactúa con la API bancaria externa para generar el código dinámico y confirmar la transacción. Si se selecciona efectivo, registra la intención de pago para validación en recepción.

#### Precondición
* Debe existir una reserva registrada en estado "PENDIENTE_PAGO" (CU-02).

#### Curso Básico de Acción

| Actor (Cliente / Recepcionista) | Respuestas del Sistema |
|---|---|
| **1.** El cliente solicita realizar el pago de su reserva pendiente seleccionando la opción de pago por QR bancario. | **2.** El sistema calcula el monto exacto, solicita la generación de un código QR dinámico a la API del BNB y presenta las instrucciones de pago. |
| **3.** El cliente realiza la transferencia bancaria escaneando el código QR. | **4.** El sistema valida la recepción del pago consultando el estado de la transacción con la API bancaria del BNB. |
| **5.** El cliente solicita la confirmación de la operación. | **6.** El sistema cambia el estado de la reserva a "PAGADA", genera un comprobante de pago con número correlativo único, calcula la hora límite de llegada (ventana de check-in de 30 minutos) y emite la confirmación. |

#### Caminos Alternativos
* **Paso 1a (Pago en Efectivo):** Si el cliente selecciona la opción de pago en efectivo, el sistema registra la transacción bajo este método, vincula la reserva al proceso de cobro físico en recepción y emite la confirmación pendiente de validación presencial, calculando la ventana de arribo de 30 minutos.
* **Paso 4a (Falla del servicio bancario externo):** Si el sistema detecta que la API de la entidad bancaria externa no responde, notifica la falla de conexión al cliente y ofrece opciones alternativas como el pago presencial en recepción.
* **Paso 4b (Código QR expirado):** Si transcurren más de 5 minutos sin verificar el pago, el sistema anula el código QR generado, notifica al cliente y permite generar un nuevo código de pago.

#### Postcondición
* La reserva cambia a estado "PAGADA" (o comprometida para pago presencial en recepción) y se emite un comprobante digital único con la hora del pago y la ventana de check-in calculada.

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Cliente((Cliente))
    Recepcionista((Recepcionista))
    BNB((API Banco BNB))
    subgraph Sistema Residencial
        CU03(CU-03: Procesar Pago)
    end
    Cliente --> CU03
    Recepcionista --> CU03
    CU03 --> BNB
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class PagoView {
        +mostrarOpcionesPago()
        +mostrarQR(qrData)
        +mostrarExito(nroComprobante)
    }
    class PagoController {
        -procesarPagoService
        +iniciarPago(reservaId, metodo)
        +verificarPago(reservaId)
    }
    class ProcesarPagoService {
        <<interface>>
        +iniciarProcesoPago(request)
        +verificarEstadoPago(reservaId)
    }
    class Pago {
        -id: Long
        -monto: Double
        -metodo: String
        -estado: String
    }
    PagoView ..> PagoController : eventos
    PagoController --> ProcesarPagoService
    ProcesarPagoService ..> Pago
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Actor as Cliente / Recepcionista
    participant View as PagoView
    participant Ctrl as PagoController
    participant Serv as ProcesarPagoService
    participant BNB as BnbPaymentPort
    participant Repo as ReservaRepository

    Actor->>View: Elige Pago QR (BNB)
    View->>Ctrl: iniciarPago(reservaId, "QR_BNB")
    Ctrl->>Serv: iniciarProcesoPago(request)
    Serv->>BNB: generarQR(monto, glosa, reservaId)
    BNB-->>Serv: qrData
    Serv-->>Ctrl: qrData
    Ctrl-->>View: renderizar QR
    Actor->>View: Confirma pago desde app banco
    loop Polling verificar pago
        Ctrl->>Serv: verificarEstadoPago(reservaId)
        Serv->>BNB: consultarEstado(qrId)
        BNB-->>Serv: COMPLETADO
        Serv->>Repo: save(Reserva -> PAGADA)
        Serv-->>Ctrl: COMPLETADO + NroComprobante
        Ctrl-->>View: mostrar pantalla de éxito
    end
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Actor((Cliente / Recepcionista)) -- "1: seleccionarMetodo()" --> View[PagoView]
    View -- "2: iniciarPago()" --> Ctrl[PagoController]
    Ctrl -- "3: iniciarProcesoPago()" --> Serv[ProcesarPagoService]
    Serv -- "4: generarQR()" --> BNB[BnbPaymentPort]
    Actor -- "5: pagarDesdeApp()" --> View
    Ctrl -- "6: verificarEstadoPago()" --> Serv
    Serv -- "7: consultarEstado()" --> BNB
    Serv -- "8: save(PAGADA)" --> Repo[(ReservaRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        PagoView
        PagoController
    end
    subgraph Application [Aplicación - Backend App]
        ProcesarPagoService
        BnbPaymentPort
    end
    subgraph Domain [Dominio - Backend Domain]
        Pago
        Reserva
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        BnbSandboxAdapter
        ReservaRepositoryAdapter
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

### CU-04: Realizar Check-in

#### Actores
* **Primario:** Recepcionista
* **Secundario:** Personal de Limpieza

#### Tipo
* Primario / Esencial

#### Propósito
Registrar el ingreso físico del huésped, entregar los accesorios de la habitación y controlar el ciclo de vida del estado de la habitación (limpieza, mantenimiento y disponibilidad).

#### Resumen
El recepcionista verifica la reserva activa o procesa una llegada directa, realiza el cobro si corresponde y registra la asignación de los accesorios. Al finalizar el tiempo de estadía, se verifica la devolución de accesorios, se asigna la habitación al personal de limpieza y se libera tras el reporte final del personal.

#### Precondición
* La habitación seleccionada debe estar en un estado coherente con el paso del ciclo de vida (Disponible para ingreso, Ocupada para salida).

#### Curso Básico de Acción

| Actor (Recepcionista / Personal de Limpieza) | Respuestas del Sistema |
|---|---|
| **1.** El recepcionista busca la reserva activa del cliente (por nombre o identificador). | **2.** El sistema valida la reserva pagada dentro del tiempo límite de la ventana de ingreso y muestra los datos asociados. |
| **3.** El recepcionista registra la entrega física de la tarjeta de acceso y los controles de los dispositivos al cliente. | **4.** El sistema registra la asignación de los accesorios, cambia el estado de la reserva a "ACTIVA" y actualiza la habitación a estado "OCUPADA". |
| **5.** El recepcionista inicia el check-out tras la entrega de los accesorios por parte del cliente al finalizar el tiempo de estadía. | **6.** El sistema verifica la devolución conforme a los accesorios registrados y actualiza la habitación a estado "EN LIMPIEZA". |
| **7.** El personal de limpieza reporta la finalización de los trabajos de desinfección e higiene de la habitación. | **8.** El sistema actualiza el registro de estado de la habitación a "DISPONIBLE", quedando libre para una nueva reserva. |

#### Caminos Alternativos
* **Paso 1a (Llegada directa sin reserva):** El recepcionista busca habitaciones disponibles de forma manual. El sistema muestra las opciones libres y permite registrar los datos del cliente. El recepcionista procesa el pago correspondiente (QR o efectivo) y continúa con la entrega de accesorios.
* **Paso 2a (Pago en efectivo pendiente):** Si la reserva tiene pago pendiente en recepción, el recepcionista recibe y procesa el pago físico. El sistema valida el pago, actualiza la reserva a estado "PAGADA" y continúa con el flujo de check-in.
* **Paso 5a (Exceso de tiempo de estadía):** Si el cliente excede el tiempo límite de ocupación establecido, el sistema calcula automáticamente el recargo adicional por concepto de tiempo extra. El recepcionista cobra la diferencia correspondiente y registra el pago del tiempo extra antes de procesar la salida.

#### Postcondición
* El ingreso y salida física quedan documentados, el estado de la habitación pasa por el flujo Ocupada $\rightarrow$ En Limpieza $\rightarrow$ Disponible, y el retorno de los accesorios queda validado.

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Recepcionista((Recepcionista))
    Camarera((Camarera))
    subgraph Sistema Residencial
        CU04(CU-04: Realizar Check-in)
    end
    Recepcionista --> CU04
    Camarera --> CU04
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class RecepcionView {
        +mostrarTableroHabitaciones()
        +mostrarFormularioCheckIn()
        +notificarEstado(habitacionId, estado)
    }
    class RecepcionController {
        -checkInService
        +registrarIngreso(reservaId, accesorios)
        +registrarSalida(reservaId)
        +confirmarLimpieza(habitacionId)
    }
    class CheckInService {
        <<interface>>
        +procesarCheckIn(reservaId)
        +procesarCheckOut(reservaId)
        +actualizarEstadoLimpieza(habitacionId)
    }
    class Habitacion {
        -numero: String
        -estadoActual: String
    }
    RecepcionView ..> RecepcionController : eventos
    RecepcionController --> CheckInService
    CheckInService ..> Habitacion
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Recepcionista
    participant View as RecepcionView
    participant Ctrl as RecepcionController
    participant Serv as CheckInService
    participant Repo as HabitacionRepository
    participant ResRepo as ReservaRepository

    Recepcionista->>View: Busca reserva e ingresa entrega de accesorios
    View->>Ctrl: registrarIngreso(reservaId, accesorios)
    Ctrl->>Serv: procesarCheckIn(reservaId)
    Serv->>ResRepo: findById(reservaId)
    ResRepo-->>Serv: Reserva (estado=PAGADA)
    Serv->>Repo: actualizarEstado(habitacionId, "OCUPADA")
    Serv->>ResRepo: save(Reserva -> estado=ACTIVA)
    Serv-->>Ctrl: Ingreso confirmado
    Ctrl-->>View: actualizar tablero a OCUPADA
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Recepcionista((Recepcionista)) -- "1: confirmarLlegada()" --> View[RecepcionView]
    View -- "2: registrarIngreso()" --> Ctrl[RecepcionController]
    Ctrl -- "3: procesarCheckIn()" --> Serv[CheckInService]
    Serv -- "4: findById() / save(ACTIVA)" --> ResRepo[(ReservaRepository)]
    Serv -- "5: actualizarEstado(OCUPADA)" --> Repo[(HabitacionRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        RecepcionView
        RecepcionController
    end
    subgraph Application [Aplicación - Backend App]
        CheckInService
    end
    subgraph Domain [Dominio - Backend Domain]
        Habitacion
        Reserva
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        HabitacionRepositoryAdapter
        ReservaRepositoryAdapter
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

### CU-05: Acceso por QR en Puerta

#### Actores
* **Primario:** Cliente (Huésped)
* **Secundario:** Sistema de Control de Acceso

#### Tipo
* Primario / Esencial (Caja Negra)

#### Propósito
Permitir la apertura física autónoma de la habitación asignada al cliente mediante la validación electrónica de su comprobante de pago.

#### Resumen
El cliente presenta su código QR de acceso al sensor de la puerta asignada. El sistema valida el código, verifica que corresponda a esa habitación y esté en período de validez, desbloquea físicamente la puerta de la habitación y registra el ingreso del huésped.

#### Precondición
* El cliente debe poseer un código QR de acceso generado en una reserva pagada o activa (CU-03 / CU-04).

#### Curso Básico de Acción

| Actor (Cliente) | Respuestas del Sistema |
|---|---|
| **1.** El cliente presenta el código QR de acceso al lector electrónico de la puerta de la habitación. | **2.** El sistema captura la información codificada y la contrasta con el registro de reservas activas y pagadas. |
| **3.** El cliente solicita el ingreso físico a la habitación. | **4.** El sistema valida que la reserva esté pagada o activa, corresponda a la habitación física solicitada y se encuentre en la ventana de tiempo de ingreso autorizada. |
| **5.** El cliente empuja la puerta. | **6.** El sistema activa la apertura de la cerradura electrónica, registra la fecha y hora exacta del primer ingreso y actualiza el estado de la habitación a "OCUPADA". |

#### Caminos Alternativos
* **Paso 4a (Código QR inválido o incorrecto):** Si el código QR es inválido o no corresponde a la habitación en la que se está intentando el acceso, el sistema rechaza la solicitud de apertura y emite una alerta de error.
* **Paso 4b (Expiración de la ventana de check-in):** Si la ventana de check-in de 30 minutos ha expirado sin registrar pago o llegada válida, el sistema deniega el acceso, emite un aviso de cancelación por incomparecencia (No-Show) y mantiene la puerta cerrada.

#### Postcondición
* Se registra el ingreso del huésped en el sistema, se desbloquea físicamente la puerta de la habitación y esta pasa a estado "OCUPADA".

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Cliente((Cliente))
    subgraph Sistema Residencial
        CU05(CU-05: Acceso por QR en Puerta)
    end
    Cliente --> CU05
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class PuertaView {
        +capturarQR()
        +mostrarAccesoAutorizado(mensaje)
        +mostrarAccesoDenegado(mensaje)
    }
    class PuertaController {
        -puertaService
        +validarAccesoQR(codigo, habitacionId)
    }
    class PuertaService {
        <<interface>>
        +verificarYRegistrarAcceso(codigo, habitacionId)
    }
    class Reserva {
        -codigoQR: String
        -estado: String
    }
    PuertaView ..> PuertaController : eventos
    PuertaController --> PuertaService
    PuertaService ..> Reserva
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Cliente
    participant View as PuertaView (Tablet)
    participant Ctrl as PuertaController
    participant Serv as PuertaService
    participant ResRepo as ReservaRepository
    participant HabRepo as HabitacionRepository

    Cliente->>View: Escanea QR en lector de puerta
    View->>Ctrl: validarAccesoQR(codigo, habitacionId)
    Ctrl->>Serv: verificarYRegistrarAcceso(codigo, habitacionId)
    Serv->>ResRepo: findByCodigo(codigo)
    ResRepo-->>Serv: Reserva
    Serv->>Serv: Validar estado (PAGADA o ACTIVA) y habitación
    alt Acceso Válido
        Serv->>HabRepo: actualizarEstado(habitacionId, "OCUPADA")
        Serv->>ResRepo: save(Reserva -> horaIngreso=NOW)
        Serv-->>Ctrl: Acceso Autorizado
        Ctrl-->>View: Desbloquear puerta y mostrar bienvenida
    else Acceso Inválido
        Serv-->>Ctrl: Acceso Denegado
        Ctrl-->>View: Mostrar error de acceso y mantener bloqueado
    end
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Cliente((Cliente)) -- "1: presentarQR()" --> View[PuertaView]
    View -- "2: validarAccesoQR()" --> Ctrl[PuertaController]
    Ctrl -- "3: verificarYRegistrarAcceso()" --> Serv[PuertaService]
    Serv -- "4: findByCodigo() / save()" --> ResRepo[(ReservaRepository)]
    Serv -- "5: actualizarEstado(OCUPADA)" --> HabRepo[(HabitacionRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        PuertaView
        PuertaController
    end
    subgraph Application [Aplicación - Backend App]
        PuertaService
    end
    subgraph Domain [Dominio - Backend Domain]
        Reserva
        Habitacion
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        ReservaRepositoryAdapter
        HabitacionRepositoryAdapter
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

### CU-06: Pago de Consumo Extra

#### Actores
* **Primario:** Cliente (Huésped)
* **Secundario:** API Externa de la Entidad Bancaria (BNB)

#### Tipo
* Secundario / Esencial

#### Propósito
Gestionar y cobrar los productos y servicios adicionales consumidos por el huésped de forma directa y automatizada desde la habitación.

#### Resumen
Durante la estadía, el huésped selecciona productos adicionales disponibles en su habitación. El sistema registra el pedido en estado pendiente, genera un código QR por el total de los artículos seleccionados y, tras la confirmación de la transferencia bancaria externa, marca los consumos como pagados.

#### Precondición
* Debe haber un check-in registrado y la estadía del huésped debe estar en estado activo (CU-04 / CU-05).

#### Curso Básico de Acción

| Actor (Cliente) | Respuestas del Sistema |
|---|---|
| **1.** El cliente inicia la solicitud de consumo extra seleccionando productos del catálogo provisto en la habitación. | **2.** El sistema registra de manera temporal la lista de productos y calcula el monto total del pedido. |
| **3.** El cliente confirma la solicitud de consumos. | **4.** El sistema solicita a la API del BNB la generación de un código QR por el monto total calculado. |
| **5.** El cliente realiza el pago bancario correspondiente escaneando el código QR. | **6.** El sistema valida el pago con la API bancaria del BNB, cambia el estado del consumo a "PAGADO", registra la transacción y genera el comprobante digital de consumo. |

#### Caminos Alternativos
* **Paso 5a (Cancelación del pedido):** Si el cliente decide cancelar la solicitud de consumos antes de realizar el pago, el cliente anula la operación. El sistema limpia la lista temporal de productos y retorna la sesión al estado de espera.
* **Paso 6a (Falla en el Pago / Expiración de QR):** Si la transacción del QR es rechazada o el tiempo de validez del código expira sin concretar el pago, el sistema notifica la falla de la transacción, anula el código QR y permite volver a generar el pedido.

#### Postcondición
* Los consumos adicionales quedan registrados como pagados en la base de datos, asociados a la reserva de la habitación.

##### Diagramas UML (Mermaid)

###### 1. Diagrama de Caso de Uso
```mermaid
flowchart LR
    Cliente((Cliente))
    BNB((API Banco BNB))
    subgraph Sistema Residencial
        CU06(CU-06: Pago de Consumo Extra)
    end
    Cliente --> CU06
    CU06 --> BNB
```

###### 2. Diagrama de Clases de Interfaz
```mermaid
classDiagram
    class TabletView {
        +mostrarMenuConsumos()
        +mostrarQRConsumo(qrData)
        +confirmarPagoConsumo()
    }
    class ConsumoController {
        -consumoService
        +registrarPedido(reservaId, items)
        +verificarPagoConsumo(consumoId)
    }
    class ConsumoExtraService {
        <<interface>>
        +crearConsumoPendiente(reservaId, items)
        +confirmarPagoConsumo(consumoId)
    }
    class ConsumoExtra {
        -id: Long
        -itemsJson: String
        -total: Double
        -estado: String
    }
    TabletView ..> ConsumoController : eventos
    ConsumoController --> ConsumoExtraService
    ConsumoExtraService ..> ConsumoExtra
```

###### 3. Diagrama de Secuencia
```mermaid
sequenceDiagram
    actor Cliente
    participant View as TabletView
    participant Ctrl as ConsumoController
    participant Serv as ConsumoExtraService
    participant BNB as BnbPaymentPort
    participant Repo as ConsumoRepository

    Cliente->>View: Selecciona productos de la tableta y presiona pagar
    View->>Ctrl: registrarPedido(reservaId, items)
    Ctrl->>Serv: crearConsumoPendiente(reservaId, items)
    Serv->>BNB: generarQR(total, "Consumos Extra", reservaId)
    BNB-->>Serv: qrData
    Serv->>Repo: save(ConsumoExtra -> estado=PENDIENTE)
    Serv-->>Ctrl: qrData
    Ctrl-->>View: renderizar QR de consumo
    Cliente->>View: Escanea QR y paga
    View->>Ctrl: verificarPagoConsumo(consumoId)
    Ctrl->>Serv: confirmarPagoConsumo(consumoId)
    Serv->>BNB: consultarEstado(qrId)
    BNB-->>Serv: COMPLETADO
    Serv->>Repo: save(ConsumoExtra -> estado=PAGADO)
    Serv-->>Ctrl: Pago confirmado
    Ctrl-->>View: mostrar pantalla de éxito
```

###### 4. Diagrama de Colaboración
```mermaid
flowchart LR
    Cliente((Cliente)) -- "1: seleccionarProductos()" --> View[TabletView]
    View -- "2: registrarPedido()" --> Ctrl[ConsumoController]
    Ctrl -- "3: crearConsumoPendiente()" --> Serv[ConsumoExtraService]
    Serv -- "4: generarQR()" --> BNB[BnbPaymentPort]
    Ctrl -- "5: confirmarPagoConsumo()" --> Serv
    Serv -- "6: save(PAGADO)" --> Repo[(ConsumoRepository)]
```

###### 5. Diagrama de Paquetes
```mermaid
flowchart TD
    subgraph Frontend [Presentación - Frontend]
        TabletView
        ConsumoController
    end
    subgraph Application [Aplicación - Backend App]
        ConsumoExtraService
        BnbPaymentPort
    end
    subgraph Domain [Dominio - Backend Domain]
        ConsumoExtra
        Reserva
    end
    subgraph Infrastructure [Infraestructura - Backend Infra]
        ConsumoRepositoryAdapter
        BnbSandboxAdapter
    end
    Frontend ..> Application
    Application ..> Domain
    Application ..> Infrastructure
```

---

#### Figura 1: Diagrama de Caso de Uso 1

*(Insertar Diagrama de Caso de Uso aquí)*

#### Figura 5: Pantalla de Caso de Uso

*(Insertar Pantalla de Caso de Uso aquí)*

---

## Modelo de Dominio del Sistema

El siguiente diagrama de clases representa el modelo de dominio del Residencial, el cual correlaciona directamente con la estructura de entidades relacionales e implementación en Java:

```mermaid
classDiagram
    class Reserva {
        id: Long
        montoTotal: Double
        fechaCreacion: Date
        fechaIngreso: Date
        cantidadBloques: Integer
        estado: String
        fechaPago: Timestamp
        ventanaCheckIn: Timestamp
        horaIngreso: Timestamp
        horaSalidaEstimada: Timestamp
        recepcionista: String
    }

    class Huesped {
        id: Long
        nombre: String
        ci: String
        celular: String
        urlFotoAnverso: String
        urlFotoReverso: String
        fechaNacimiento: Date
    }

    class Habitacion {
        id: Long
        numero: String
        estadoActual: String
        version: Long
    }

    class TipoHabitacion {
        id: Long
        nombreTipo: String
        precioBase: Double
        duracionHoras: Integer
        descripcion: String
    }

    class Pago {
        id: Long
        monto: Double
        metodo: String
        estado: String
        externalId: String
        fechaCreacion: Timestamp
        fechaExpiracion: Timestamp
    }

    class Comprobante {
        id: Long
        nroComprobante: String
        fechaEmision: Timestamp
    }

    class Recepcionista {
        id: Long
        nombre: String
        username: String
        activo: Boolean
    }

    class Camarera {
        id: Long
        nombre: String
        celular: String
        activo: Boolean
    }

    class InventarioItem {
        id: Long
        nombre: String
        tipo: String
        stockActual: Integer
        precioCompra: Double
        precioVenta: Double
        emoji: String
    }

    class HabitacionInventario {
        id: Long
        cantidadEsperada: Integer
        cantidadActual: Integer
        estadoVerificacion: String
    }

    class IncidenciaMantenimiento {
        id: Long
        descripcion: String
        seguimiento: String
        fechaReporte: Timestamp
        recepcionistaReporta: String
        estado: String
        costoReparacion: Double
        fechaResolucion: Timestamp
        recepcionistaResuelve: String
    }

    class ConsumoExtra {
        id: Long
        itemsJson: String
        total: Double
        estado: String
        qrData: String
        fechaCreacion: Timestamp
        fechaPago: Timestamp
    }

    class Egreso {
        id: Long
        descripcion: String
        monto: Double
        categoria: String
        fecha: Timestamp
        recepcionista: String
        destinoDestinatario: String
        urlComprobante: String
    }

    Huesped "1" -- "*" Reserva : Realiza
    Huesped "0..1" -- "*" Reserva : Acompaña en
    Habitacion "1" -- "*" Reserva : Asignada a
    Reserva "1" -- "*" Pago : Registra
    TipoHabitacion "1" -- "*" Habitacion : Categoriza
    Pago "1" -- "1" Comprobante : Respalda
    Habitacion "1" -- "*" HabitacionInventario : Posee
    InventarioItem "1" -- "*" HabitacionInventario : Incluido en
    Habitacion "1" -- "*" IncidenciaMantenimiento : Sufre
    InventarioItem "0..1" -- "*" IncidenciaMantenimiento : Afectado por
    Reserva "1" -- "*" ConsumoExtra : Genera
```

---

## Caso de Uso del Sistema

A continuación se esquematiza el mapa de casos de uso y la interacción de los actores en el sistema integrado:

```mermaid
flowchart LR
    Cliente((Cliente / Huésped))
    Recepcionista((Recepcionista))
    Camarera((Camarera))
    API_Banco((API Banco BNB))

    subgraph Sistema Residencial
        CU01(CU-01: Consultar Disponibilidad)
        CU02(CU-02: Registrar Reserva)
        CU03(CU-03: Procesar Pago)
        CU04(CU-04: Realizar Check-in)
        CU05(CU-05: Acceso por QR en Puerta)
        CU06(CU-06: Pago de Consumo Extra)
    end

    Cliente --> CU01
    Cliente --> CU02
    Cliente --> CU03
    Cliente --> CU05
    Cliente --> CU06

    Recepcionista --> CU02
    Recepcionista --> CU03
    Recepcionista --> CU04

    Camarera --> CU04

    CU03 --> API_Banco
    CU06 --> API_Banco
```

---

## Diagrama de Actividad del Sistema

Describe el flujo general de control que rige la interacción del negocio desde la consulta del cliente hasta la liberación de la habitación:

```mermaid
flowchart TD
    A[Inicio de Consulta] --> B[Verificar disponibilidad]
    B --> C{¿Disponible?}
    C -- No --> D[Sugerir cambio de fecha/hora]
    D --> B
    C -- Sí --> E[Registrar datos de reserva]
    E --> F[Crear reserva en PENDIENTE_PAGO]
    F --> G{Elegir método de pago}
    G -- QR BNB --> H[Generar QR dinámico]
    H --> I[Esperar confirmación de pago]
    I --> J{¿Pago exitoso?}
    J -- No/Expirado --> K[Liberar reserva y habitación]
    K --> End([Fin])
    J -- Sí --> L[Actualizar reserva a PAGADA]
    G -- Efectivo --> M[Registrar reserva en efectivo]
    L --> N[Establecer ventana check-in 30 min]
    M --> N
    N --> O[Llegada física del cliente]
    O --> P[Check-in: Recepcionista valida y entrega controles/tarjeta]
    P --> Q[Habitación pasa a estado OCUPADA]
    Q --> R[Huésped consume productos extra y paga vía QR]
    R --> S[Check-out: Recepcionista valida accesorios]
    S --> T[Habitación pasa a estado EN LIMPIEZA]
    T --> U[Camarera desinfecta e higieniza la habitación]
    U --> V[Notificación de limpieza concluida]
    V --> W[Habitación pasa a estado DISPONIBLE]
    W --> End
```

---

## Diagrama de Paquetes del Sistema

El sistema implementa una arquitectura limpia y desacoplada estructurada en las siguientes capas de paquetes lógicos:

```mermaid
flowchart TD
    subgraph Frontend [Capa de Presentación - HTML5 / JS Vanilla]
        UI[Vistas: index.html / recepcion.html / puerta.html]
        Ctrl[Controladores JS: DisponibilidadController / RecepcionController]
    end

    subgraph Backend_Application [Capa de Aplicación - Java Spring Boot]
        UC[Casos de Uso: CheckInService / ProcesarPagoService / ReservaService]
        DTO[Data Transfer Objects - DTOs]
        Ports[Puertos: Repositories / Payment Gateway API Interfaces]
    end

    subgraph Backend_Domain [Capa de Dominio]
        Entidades[Entidades: Reserva / Habitacion / Huesped / Pago]
    end

    subgraph Backend_Infrastructure [Capa de Infraestructura]
        REST[Controladores REST: REST APIs]
        Adapters[Adaptadores de Persistencia: Spring Data JPA Repositories]
        ExtAPIs[Clientes Externos: BNB Payment Gateway Connector]
    end

    subgraph Database [Persistencia - PostgreSQL]
        DB[(Tablas: habitaciones / reservas / pagos / comprobantes)]
    end

    Frontend --> Backend_Application
    Backend_Application --> Backend_Domain
    Backend_Infrastructure --> Backend_Application
    Backend_Infrastructure --> Backend_Domain
    Backend_Infrastructure --> Database
```

---

## Diagrama de Actividad: Caso de uso principal – Realizar Reserva

Flujo secuencial detallado del caso de uso principal (integración de CU-01, CU-02 y CU-03):

```mermaid
flowchart TD
    Start([Inicio]) --> EntraPortal[Cliente: Ingresa al portal de reservas]
    EntraPortal --> IngresaFechas[Cliente: Indica fecha, hora y tipo de habitación]
    IngresaFechas --> BuscarHab[Sistema: Busca habitaciones disponibles]
    BuscarHab --> HayLibres{¿Hay disponibles?}
    HayLibres -- No --> Sugerir[Sistema: Muestra alerta y sugiere otra fecha/categoría]
    Sugerir --> IngresaFechas
    HayLibres -- Sí --> Selecciona[Cliente: Selecciona habitación e introduce datos personales]
    Selecciona --> ValidaDatos{¿Datos válidos y habitación libre?}
    ValidaDatos -- No --> AlertaDatos[Sistema: Informa error o duplicidad de datos]
    AlertaDatos --> Selecciona
    ValidaDatos -- Sí --> ReservaPendiente[Sistema: Registra huésped y crea reserva PENDIENTE_PAGO]
    ReservaPendiente --> MetodoPago{¿Método de pago?}
    MetodoPago -- QR BNB --> GenerarQR[Sistema: Llama a API de BNB y genera QR de pago]
    GenerarQR --> ClientePaga[Cliente: Realiza transferencia desde banca móvil]
    ClientePaga --> Polling[Sistema: Verifica estado del pago vía Polling]
    Polling --> EstadoPago{¿Pago recibido a tiempo?}
    EstadoPago -- No --> AnulaReserva[Sistema: Cancela la reserva y libera la habitación]
    AnulaReserva --> FinError([Fin con Error])
    EstadoPago -- Sí --> ReservaPagada[Sistema: Marca reserva como PAGADA y emite comprobante]
    MetodoPago -- Efectivo --> ReservaEfectivo[Sistema: Registra reserva con compromiso de pago en recepción]
    ReservaPagada --> Exito[Sistema: Muestra pantalla de éxito y advierte ventana de llegada de 30 minutos]
    ReservaEfectivo --> Exito
    Exito --> FinSuccess([Fin Exitoso])
```

---

## Actividad de Objeto: Muestra el ciclo de vida de una habitación

El estado de una habitación está condicionado por los eventos operativos ejecutados en los casos de uso:

```mermaid
stateDiagram-v2
    [*] --> Disponible : Inicialización

    Disponible --> Ocupada : Check-in de Huésped (CU-04 / CU-05)
    Ocupada --> EnLimpieza : Check-out y Devolución de Accesorios (CU-04)
    EnLimpieza --> Disponible : Notificación de Limpieza Concluida (CU-04)

    Disponible --> Mantenimiento : Reporte de Daños o Desviación de Calidad (CU-04)
    Mantenimiento --> Disponible : Resolución y Cierre de Incidencia (CU-04)
```

---

## Anexos

* **Anexo A:** Plantilla de base de datos completa (`04_Implementacion/sistema-integrado/backend/sql/init.sql`).
* **Anexo B:** Configuración del entorno de despliegue mediante contenedores Docker (`docker-compose.yml`).
* **Anexo C:** Suite de pruebas automatizadas de lógica de negocio en backend (`sistema-integrado/backend/src/test/java`).
