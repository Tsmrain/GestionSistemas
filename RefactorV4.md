CAPÍTULO 1: INTRODUCCIÓN ......................................................................................2
1. REQUISITOS DEL PROYECTO / EXPLICACIÓN DEL SISTEMA ACTUAL......................... 3
2. OBJETIVO GENERAL .............................................................................................. 5
3. OBJETIVO ESPECIFICO .......................................................................................... 5
4. ORGANIGRAMA Y FUNCIONES...............................................................................6
5. PROCESOS Y SU CLASIFICACIÓN...........................................................................9
6. ENTRADAS............................................................................................................9
7. SALIDAS ............................................................................................................. 10
8. RELACIONES ENTRE PROCESOS.......................................................................... 10
9. RETROALIMENTACIÓN......................................................................................... 11
10. AMBIENTE......................................................................................................... 11
11. TIPO DE SISTEMA............................................................................................... 12
12. UML.................................................................................................................. 12
CASO DE USO: Promocionar Servicios .................................................................. 13
CASO DE USO: Contactar Establecimiento............................................................ 19
CASO DE USO: Solicitar Servicio ........................................................................... 26
CASO DE USO: Gestionar Reserva......................................................................... 31
CASO DE USO: Gestionar Tipos de Habitación ....................................................... 31
CASO DE USO: Gestionar Habitaciones................................................................. 31
CASO DE USO: Procesar Check-In/Out.................................................................. 31
ACTORES: ........................................................................................................ 31
TIPO:................................................................................................................ 31
PROPÓSITO:..................................................................................................... 31
RESUMEN: ....................................................................................................... 31
PRECONDICIÓN:.............................................................................................. 31
CURSO BÁSICO:............................................................................................... 31
Check-Out: ...................................................................................................... 31

CAMINOS ALTERNATIVOS: ................................................................................ 31
POSTCONDICIÓN:............................................................................................ 31
CASO DE USO: Gestionar Pagos ........................................................................... 31
CASO DE USO: Controlar Accesos ........................................................................ 31
CASO DE USO: Gestionar Limpieza ....................................................................... 31
CASO DE USO: Generar Informes.......................................................................... 31
CASO DE USO: Gestionar Consumos .................................................................... 31
CASO DE USO: Monitorear Seguridad.................................................................... 31
MODELO DE DOMINIO DEL SISTEMA........................................................................ 31
CASO DE USO DEL SISTEMA .................................................................................... 31
DIAGRAMA DE ACTIVIDAD DEL SISTEMA................................................................... 31
DIAGRAMA DE PAQUETES DEL SISTEMA................................................................... 31
DIAGRAMA DE ACTIVIDAD: Caso de uso principal – Realizar Reserva.......................... 31
Actividad de Objeto: Muestra el ciclo de vida de una habitación ................................. 31
ANEXOS .................................................................................                                 31

CAPÍTULO 1: INTRODUCCIÓN

1. REQUISITOS DEL PROYECTO / EXPLICACIÓN DEL
SISTEMA ACTUAL
El sistema actual de servicios de alojamiento temporal en Santa Cruz opera de manera
tradicional, con diferentes niveles de digitalización según la categoría del establecimiento.
Para contactar al establecimiento PREMIUM, existen varios métodos como:
● Personalmente
● Redes Sociales (Facebook, Instagram, TikTok, etc.)
Las personas pueden acceder a cualquier red social para encontrar el número de contacto
y la ubicación. Una vez que tengas el contacto, envías un mensaje y el empleado/a te
enviará los precios con las características de cada habitación:
● Normal [150bs/12hrs]: A/C, cama de 2 plazas
● VIP [180bs/12hrs]: A/C, cama de 3 plazas, comida
● Super VIP [240bs/12hrs]: Cama de 3 plazas, jacuzzi, servicio de habitación,
consumos, Internet, A/C
Una vez seleccionado el tipo de habitación, se procede a tomar los datos del cliente.

La información se rellena secuencialmente al hacer la reserva.
Si decides no reservar y llegas directamente al establecimiento, los datos se toman
manualmente en ese momento.
Una vez realizado el pago, llegas a la recepción e indicas si tienes una reserva y a nombre
de quién. Si no tienes reserva, procedes a pedir una habitación y pagas, ya sea por
transacción QR o en efectivo. Una vez completado el pago, el recepcionista entrega a los
clientes sus respectivos accesorios para ingresar a la habitación, como la tarjeta de
acceso y los controles para la TV, el Telecable y el aire acondicionado.
En el caso de tener una reserva tipo suites, el recepcionista informa a los clientes sobre la
"hora loca", que consiste en una conservadora ubicada afuera, donde pueden elegir las
bebidas que deseen. La conservadora contiene diferentes tipos de tragos para que los
clientes puedan seleccionar según su preferencia.
A la hora de salida, los clientes deben llevar consigo la tarjeta de acceso y los controles de
la TV, TV cable y aire acondicionado, y cerrar la puerta. Minutos después de que los
clientes hayan salido, el personal de limpieza ingresa a la habitación para realizar su

trabajo. Para ingresar ellos maneja una tarjeta especial para poder ingresar a las
habitaciones.
Una vez terminada la limpieza de la habitación, el personal avisa al encargado a través de
su "walkie-talkie".
El encargado actualiza su cuaderno donde lleva un registro detallado del estado de las
habitaciones, incluyendo cualquier observación relevante sobre la limpieza o el
mantenimiento.
En caso de que surja algún conflicto o inconveniente con un cliente, el encargado
contacta inmediatamente al personal de seguridad para resolver la situación de manera
rápida y eficiente, garantizando la seguridad y el bienestar de todos los huéspedes.
Al finalizar cada turno de 8 horas, los recepcionistas deben presentar un informe con los
gastos totales. Existen tres turnos: madrugada, tarde y noche.
En caso de que el cliente se pase de la hora, se le cobrará por el tiempo extra utilizado.
El tiempo corre independientemente de si el cliente está o no en el establecimiento.
La única manera de obtener una devolución es si la habitación está en malas condiciones
y no hay otras habitaciones disponibles para reemplazarla.
No se aceptan cancelaciones de reservas.

REPORTE POR TURNO

Turno Fecha Responsable Total habitación Total accesorios Total consumos Total

Libro Diario

Responsable Fecha Na Habitación Consumos Accesorios Total

2. OBJETIVO GENERAL
Diseñar un sistema de información el cual facilite la gestión de reservas de moteles

3. OBJETIVO ESPECIFICO
Los siguientes objetivos fueron tomados basados en los requisitos, encuestas y
entrevistas
El levantamiento de requerimientos se enfocará en recopilar información sobre los
procesos actuales relacionados con la gestión de reservas en Santa Cruz. Esto incluye
identificar las necesidades de los clientes, personal. Se utilizarán entrevistas y encuestas
para comprender mejor los problemas actuales y establecer una base sólida para el
desarrollo del sistema.
El análisis consistirá en modelar (UML) para visualizar la interacción del sistema. Se
identificarán los procesos, entradas, salidas, retroalimentación y los puntos de mejora.
El diseño desarrollaremos una plataforma que integre la gestión de moteles
(habitaciones, reservas, pagos, reportes de habitaciones) Las interfaces permitirán a los
moteles gestionar habitaciones, controlar accesos y generar reportes financieros.

4. ORGANIGRAMA Y FUNCIONES

Dirección General
Director General:
● Toma de decisiones estratégicas.
● Supervisión general de todas las operaciones.
● Establecimiento de políticas y procedimientos.
● Coordinación con los administradores de operaciones y finanzas.
Operaciones
Admin Operaciones:
● Supervisión de todas las actividades operativas.
● Coordinación de horarios y turnos.
● Asegurar que los estándares de calidad se mantengan.
● Resolución de problemas operativos diarios.
Soporte (Supervisor 24/7):
● Supervisión de las actividades de soporte en todo momento.
● Gestión de incidencias y soporte técnico.
● Asistencia a los empleados en caso de problemas operativos.

Empleado Nuevo (Control de Calidad):
● Inspección y verificación de la calidad de los servicios.
● Asegurarse de que se cumplan los estándares de limpieza y mantenimiento.
● Reporte de cualquier desviación y sugerencias de mejora.
Recepción (Turno Mañana y Turno Noche):
● Check-in y check-out de clientes.
● Gestión de reservas y atención al cliente.
● Manejo de pagos y facturación.
Seguridad (Turno Mañana y Turno Noche):
● Vigilancia y protección de las instalaciones.
● Control de acceso y monitoreo de cámaras de seguridad.
● Respuesta a emergencias y resolución de conflictos.
Empleado Nuevo (Limpieza):
● Limpieza de habitaciones y áreas comunes.
● Mantenimiento de los estándares de higiene.
● Reporte de cualquier problema o necesidad de mantenimiento.
Empleado Nuevo (Mantenimiento):
● Realización de reparaciones y mantenimiento general.
● Inspección regular de instalaciones y equipos.
● Coordinación con otros departamentos para resolver problemas técnicos.
Finanzas
Admin Finanzas:
● Supervisión de todas las actividades financieras.
● Gestión de presupuestos y contabilidad.
● Coordinación de pagos y cobranzas.
Contabilidad (Inventario):

● Registro y control de inventarios.
● Auditoría de existencias y pedidos de reabastecimiento.
● Preparación de informes financieros relacionados con inventarios.
Pagos (Caja/Pago):
● Gestión de caja y manejo de transacciones diarias.
● Registro de ingresos y egresos.
● Preparación de reportes de flujo de caja.
