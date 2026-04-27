# CASO DE USO: Procesar Pago (CU-03)

**ACTORES:** Cliente (Principal), Recepcionista, Sistema Externo BNB (API)
**TIPO:** Primario y Esencial
**PROPÓSITO:** Registrar el flujo monetario asociado a una reserva para formalizar la estancia y asegurar el ingreso financiero.
**RESUMEN:** El proceso comienza cuando una reserva ha sido registrada pero aún no está pagada. El sistema ofrece opciones de pago: QR (BNB) o Efectivo. Si se elige QR, se invoca la API del BNB para generar un código dinámico y verificar la transferencia. Si se elige efectivo, el sistema registra la intención de pago y establece el compromiso de llegada del cliente. En ambos casos, se aplica una política estricta de llegada de 30 minutos.

**PRECONDICIÓN:** Debe existir una reserva previa en estado "PENDIENTE" (generada en el CU-02).

## CURSO BÁSICO:

| Actor | Respuesta del sistema |
|-------|-----------------------|
| 1. El actor solicita realizar el pago de una reserva existente (desde el modal de éxito de la reserva). | |
| | 2. El sistema recupera el monto total y muestra los métodos disponibles: **Efectivo** o **Pago QR (BNB)**. |
| 3. El actor selecciona la opción **"Pago QR (BNB)"**. | |
| | 4. El sistema envía una solicitud al API del BNB con el monto, glosa e ID de reserva. |
| | 5. El sistema recibe el objeto de respuesta y renderiza el código QR con instrucciones en pantalla. |
| 6. El Huésped escanea el QR y confirma la transacción desde su banca móvil. | |
| | 7. El sistema realiza una consulta periódica (polling) al servicio del BNB para verificar el estado. |
| | 8. El sistema confirma la recepción exitosa, actualiza la reserva a estado **"PAGADA"**, registra la fecha/hora del pago y genera el comprobante digital. |
| | 9. El sistema muestra una pantalla de éxito profesional indicando el Nro. de Comprobante, la **Hora Límite de Llegada (30 min)** y advierte que, de no presentarse, la reserva se cancelará **sin derecho a reembolso**. |

## CAMINOS ALTERNATIVOS:

**3a. El actor selecciona "Efectivo":**
1. El sistema registra la transacción bajo el método de efectivo y vincula la reserva al proceso de pago en recepción.
2. El sistema emite un comprobante de reserva pendiente.
3. El sistema muestra una notificación profesional (Aviso) indicando que el cliente tiene **30 minutos** para llegar al residencial y pagar; de lo contrario, la reserva se cancelará automáticamente y la habitación se liberará.
4. (Flujo Posterior) El Recepcionista valida el ingreso físico del dinero y confirma el pago en el sistema.

**4a. Error de comunicación con el API BNB:**
1. El sistema detecta que el servicio externo no responde.
2. El sistema informa del error mediante un mensaje amigable y sugiere intentar de nuevo o cambiar a pago en efectivo.

**7a. Transacción denegada o tiempo de espera del QR agotado:**
1. El sistema detecta que el pago no se completó en el tiempo de vida del QR (5 minutos).
2. El sistema informa al usuario, anula el QR y permite generar uno nuevo.

## POSTCONDICIÓN: 
- El estado de la reserva se actualiza en la base de datos (PAGADA o comprometida para pago en efectivo).
- Se genera un Comprobante con ID y número correlativo único.
- Se registra la hora exacta del pago y se calcula la **Ventana de Check-in** (Pago + 30 min).
- Se comunica al cliente la política de cancelación por no presentación (No-Show).
