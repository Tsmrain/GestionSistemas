# -*- coding: utf-8 -*-
import re

with open("RefactorV4.md", "r", encoding="utf-8") as f:
    content = f.read()

# Let's map each PlantUML block to the new Larman versions.
# We will define the 30 diagrams in order.

larman_plantuml_diagrams = [
    # CU-01: Consultar Disponibilidad
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Cliente" as Cliente <<actor>>
rectangle "Sistema Residencial" {
  usecase "CU-01: Consultar Disponibilidad" as CU01
}
Cliente --> CU01
@enduml
```""",
    """```plantuml
@startuml
class DisponibilidadView {
  +mostrarResultados(habitaciones: List)
  +mostrarMensajeError(mensaje: String)
}
class DisponibilidadController {
  -disponibilidadService: DisponibilidadService
  +consultar(fecha: Date, hora: Time, tipo: String)
}
interface DisponibilidadService <<interface>> {
  +buscarHabitacionesDisponibles(query: ConsultaQuery): List
}
class Habitacion {
  -numero: String
  -estadoActual: String
}
DisponibilidadView ..> DisponibilidadController : <<use>>
DisponibilidadController --> DisponibilidadService
DisponibilidadService ..> Habitacion : <<use>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Cliente
participant "<u>:DisponibilidadView</u>" as View
participant "<u>:DisponibilidadController</u>" as Ctrl
participant "<u>:DisponibilidadService</u>" as Serv
participant "<u>:HabitacionRepository</u>" as Repo

Cliente -> View : indicarCriterios(fecha, hora, tipo)
activate View
View -> Ctrl : consultar(fecha, hora, tipo)
activate Ctrl
Ctrl -> Serv : buscarHabitacionesDisponibles(query)
activate Serv
Serv -> Repo : findByEstado("Disponible")
activate Repo
Repo --> Serv : habitaciones
deactivate Repo
Serv --> Ctrl : habitacionesFiltradas
deactivate Serv
Ctrl --> View : mostrarResultados(habitaciones)
deactivate Ctrl
View --> Cliente : visualizar resultados
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Cliente</u>" as Cliente
object "<u>:DisponibilidadView</u>" as View
object "<u>:DisponibilidadController</u>" as Ctrl
object "<u>:DisponibilidadService</u>" as Serv
object "<u>:HabitacionRepository</u>" as Repo

Cliente --> View : 1: ingresarCriterios()
View --> Ctrl : 2: consultar(fecha, hora, tipo)
Ctrl --> Serv : 3: buscarHabitacionesDisponibles(query)
Serv --> Repo : 4: findByEstado("Disponible")
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [DisponibilidadView]
  [DisponibilidadController]
}
package "Aplicación (Backend App)" {
  [DisponibilidadService]
}
package "Dominio (Backend Domain)" {
  [Habitacion]
}
package "Infraestructura (Backend Infra)" {
  [HabitacionRepository]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```""",

    # CU-02: Registrar Reserva
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Cliente" as Cliente <<actor>>
actor "Recepcionista" as Recepcionista <<actor>>
rectangle "Sistema Residencial" {
  usecase "CU-02: Registrar Reserva" as CU02
}
Cliente --> CU02
Recepcionista --> CU02
@enduml
```""",
    """```plantuml
@startuml
class ReservaView {
  +capturarDatosHuesped()
  +mostrarConfirmacion(reservaId: Long)
}
class ReservaController {
  -reservaService: ReservaService
  +registrarReserva(request: RegistroRequest)
}
interface ReservaService <<interface>> {
  +crearReserva(command: RegistroCommand): Reserva
}
class Reserva {
  -id: Long
  -estado: String
  -fechaCreacion: Date
}
ReservaView ..> ReservaController : <<use>>
ReservaController --> ReservaService
ReservaService ..> Reserva : <<create>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Actor as "Cliente / Recepcionista"
participant "<u>:ReservaView</u>" as View
participant "<u>:ReservaController</u>" as Ctrl
participant "<u>:ReservaService</u>" as Serv
participant "<u>:ReservaRepository</u>" as Repo

Actor -> View : ingresarDatosHuesped(nombre, ci, celular, fechaNacimiento)
activate View
View -> Ctrl : registrarReserva(request)
activate Ctrl
Ctrl -> Serv : crearReserva(command)
activate Serv
create participant "<u>r:Reserva</u>" as Reserva
Serv -> Reserva : <<create>>
Serv -> Repo : save(r)
activate Repo
Repo --> Serv : r
deactivate Repo
Serv --> Ctrl : r
deactivate Serv
Ctrl --> View : mostrarConfirmacion(r.id)
deactivate Ctrl
View --> Actor : visualizar identificador
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Actor</u>" as Actor
object "<u>:ReservaView</u>" as View
object "<u>:ReservaController</u>" as Ctrl
object "<u>:ReservaService</u>" as Serv
object "<u>:ReservaRepository</u>" as Repo

Actor --> View : 1: ingresarDatos()
View --> Ctrl : 2: registrarReserva(request)
Ctrl --> Serv : 3: crearReserva(command)
Serv --> Repo : 4: save(r)
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [ReservaView]
  [ReservaController]
}
package "Aplicación (Backend App)" {
  [ReservaService]
}
package "Dominio (Backend Domain)" {
  [Reserva]
}
package "Infraestructura (Backend Infra)" {
  [ReservaRepository]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```""",

    # CU-03: Procesar Pago
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Cliente" as Cliente <<actor>>
actor "Recepcionista" as Recepcionista <<actor>>
actor "API Banco BNB" as BNB <<system>>
rectangle "Sistema Residencial" {
  usecase "CU-03: Procesar Pago" as CU03
}
Cliente --> CU03
Recepcionista --> CU03
CU03 --> BNB
@enduml
```""",
    """```plantuml
@startuml
class PagoView {
  +mostrarOpcionesPago()
  +mostrarQR(qrData: String)
  +mostrarExito(nroComprobante: String)
}
class PagoController {
  -procesarPagoService: ProcesarPagoService
  +iniciarPago(reservaId: Long, metodo: String)
  +verificarPago(reservaId: Long)
}
interface ProcesarPagoService <<interface>> {
  +iniciarProcesoPago(req: IniciarPagoRequest): PagoResponse
  +verificarEstadoPago(reservaId: Long): PagoResponse
}
class Pago {
  -id: Long
  -monto: Double
  -metodo: String
  -estado: String
}
PagoView ..> PagoController : <<use>>
PagoController --> ProcesarPagoService
ProcesarPagoService ..> Pago : <<use>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Actor as "Cliente / Recepcionista"
participant "<u>:PagoView</u>" as View
participant "<u>:PagoController</u>" as Ctrl
participant "<u>:ProcesarPagoService</u>" as Serv
participant "<u>:BnbPaymentPort</u>" as BNB <<interface>>
participant "<u>:ReservaRepository</u>" as Repo

Actor -> View : seleccionarMetodoPago("QR_BNB")
activate View
View -> Ctrl : iniciarPago(reservaId, "QR_BNB")
activate Ctrl
Ctrl -> Serv : iniciarProcesoPago(request)
activate Serv
Serv -> BNB : generarQR(monto, glosa, reservaId)
activate BNB
BNB --> Serv : qrData
deactivate BNB
Serv --> Ctrl : qrData
deactivate Serv
Ctrl --> View : renderizarQR(qrData)
deactivate Ctrl
View --> Actor : escanear y transferir

loop Polling cada 5s (hasta confirmación o expiración)
  Actor -> View : confirmarPago()
  View -> Ctrl : verificarPago(reservaId)
  activate Ctrl
  Ctrl -> Serv : verificarEstadoPago(reservaId)
  activate Serv
  Serv -> BNB : consultarEstado(qrId)
  activate BNB
  BNB --> Serv : "COMPLETADO"
  deactivate BNB
  Serv -> Repo : save(Reserva.confirmarPago())
  activate Repo
  Repo --> Serv : r
  deactivate Repo
  Serv --> Ctrl : completadoResponse
  deactivate Serv
  Ctrl --> View : mostrarExito(comprobante)
  deactivate Ctrl
  View --> Actor : visualizar pantalla de éxito
end
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Actor</u>" as Actor
object "<u>:PagoView</u>" as View
object "<u>:PagoController</u>" as Ctrl
object "<u>:ProcesarPagoService</u>" as Serv
object "<u>:BnbPaymentPort</u>" as BNB
object "<u>:ReservaRepository</u>" as Repo

Actor --> View : 1: seleccionarMetodo()
View --> Ctrl : 2: iniciarPago(reservaId, metodo)
Ctrl --> Serv : 3: iniciarProcesoPago(req)
Serv --> BNB : 4: generarQR(monto, glosa, reservaId)
Ctrl --> Serv : 5: verificarEstadoPago(reservaId)
Serv --> BNB : 6: consultarEstado(qrId)
Serv --> Repo : 7: save(r)
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [PagoView]
  [PagoController]
}
package "Aplicación (Backend App)" {
  [ProcesarPagoService]
  [BnbPaymentPort]
}
package "Dominio (Backend Domain)" {
  [Pago]
  [Reserva]
}
package "Infraestructura (Backend Infra)" {
  [BnbSandboxAdapter]
  [ReservaRepositoryAdapter]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```""",

    # CU-04: Realizar Check-in
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Recepcionista" as Recepcionista <<actor>>
actor "Camarera" as Camarera <<actor>>
rectangle "Sistema Residencial" {
  usecase "CU-04: Realizar Check-in" as CU04
}
Recepcionista --> CU04
Camarera --> CU04
@enduml
```""",
    """```plantuml
@startuml
class RecepcionView {
  +mostrarTableroHabitaciones()
  +mostrarFormularioCheckIn()
  +notificarEstado(habitacionId: Long, estado: String)
}
class RecepcionController {
  -checkInService: CheckInService
  +registrarIngreso(reservaId: Long, accesorios: List)
  +registrarSalida(reservaId: Long)
  +confirmarLimpieza(habitacionId: Long)
}
interface CheckInService <<interface>> {
  +procesarCheckIn(reservaId: Long, accesorios: List)
  +procesarCheckOut(reservaId: Long)
  +actualizarEstadoLimpieza(habitacionId: Long, camarera: String)
}
class Habitacion {
  -id: Long
  -numero: String
  -estadoActual: String
}
RecepcionView ..> RecepcionController : <<use>>
RecepcionController --> CheckInService
CheckInService ..> Habitacion : <<use>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Recepcionista
participant "<u>:RecepcionView</u>" as View
participant "<u>:RecepcionController</u>" as Ctrl
participant "<u>:CheckInService</u>" as Serv
participant "<u>:HabitacionRepository</u>" as Repo
participant "<u>:ReservaRepository</u>" as ResRepo

Recepcionista -> View : buscarReserva(codigo)
activate View
View -> Ctrl : registrarIngreso(reservaId, accesorios)
activate Ctrl
Ctrl -> Serv : procesarCheckIn(reservaId, accesorios)
activate Serv
Serv -> ResRepo : findById(reservaId)
activate ResRepo
ResRepo --> Serv : Reserva (estado=PAGADA)
deactivate ResRepo
Serv -> Repo : actualizarEstado(habitacionId, "OCUPADA")
activate Repo
Repo --> Serv : h
deactivate Repo
Serv -> ResRepo : save(Reserva.activar())
activate ResRepo
ResRepo --> Serv : r
deactivate ResRepo
Serv --> Ctrl : ingresoConfirmado
deactivate Serv
Ctrl --> View : notificarEstado(habitacionId, "OCUPADA")
deactivate Ctrl
View --> Recepcionista : entrega de accesorios
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Recepcionista</u>" as Recepcionista
object "<u>:RecepcionView</u>" as View
object "<u>:RecepcionController</u>" as Ctrl
object "<u>:CheckInService</u>" as Serv
object "<u>:HabitacionRepository</u>" as Repo
object "<u>:ReservaRepository</u>" as ResRepo

Recepcionista --> View : 1: confirmarLlegada()
View --> Ctrl : 2: registrarIngreso(reservaId, accesorios)
Ctrl --> Serv : 3: procesarCheckIn(reservaId, accesorios)
Serv --> ResRepo : 4: findById() / save()
Serv --> Repo : 5: actualizarEstado(OCUPADA)
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [RecepcionView]
  [RecepcionController]
}
package "Aplicación (Backend App)" {
  [CheckInService]
}
package "Dominio (Backend Domain)" {
  [Habitacion]
  [Reserva]
}
package "Infraestructura (Backend Infra)" {
  [HabitacionRepositoryAdapter]
  [ReservaRepositoryAdapter]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```""",

    # CU-05: Acceso por QR en Puerta
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Cliente" as Cliente <<actor>>
rectangle "Sistema Residencial" {
  usecase "CU-05: Acceso por QR en Puerta" as CU05
}
Cliente --> CU05
@enduml
```""",
    """```plantuml
@startuml
class PuertaView {
  +capturarQR()
  +mostrarAccesoAutorizado(mensaje: String)
  +mostrarAccesoDenegado(mensaje: String)
}
class PuertaController {
  -puertaService: PuertaService
  +validarAccesoQR(codigo: String, habitacionId: Long)
}
interface PuertaService <<interface>> {
  +verificarYRegistrarAcceso(codigo: String, habitacionId: Long): AccesoResponse
}
class Reserva {
  -codigoQR: String
  -estado: String
}
PuertaView ..> PuertaController : <<use>>
PuertaController --> PuertaService
PuertaService ..> Reserva : <<use>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Cliente
participant "<u>:PuertaView</u>" as View
participant "<u>:PuertaController</u>" as Ctrl
participant "<u>:PuertaService</u>" as Serv
participant "<u>:ReservaRepository</u>" as ResRepo
participant "<u>:HabitacionRepository</u>" as HabRepo

Cliente -> View : escanearQR(codigo)
activate View
View -> Ctrl : validarAccesoQR(codigo, habitacionId)
activate Ctrl
Ctrl -> Serv : verificarYRegistrarAcceso(codigo, habitacionId)
activate Serv
Serv -> ResRepo : findByCodigo(codigo)
activate ResRepo
ResRepo --> Serv : Reserva
deactivate ResRepo
Serv -> Serv : validarReservaHabitacionYEstado()
alt Acceso Válido
  Serv -> HabRepo : actualizarEstado(habitacionId, "OCUPADA")
  activate HabRepo
  HabRepo --> Serv : h
  deactivate HabRepo
  Serv -> ResRepo : save(Reserva.registrarIngreso())
  activate ResRepo
  ResRepo --> Serv : r
  deactivate ResRepo
  Serv --> Ctrl : autorizadoResponse
  Ctrl --> View : mostrarAccesoAutorizado(mensaje)
  View --> Cliente : puerta desbloqueada
else Acceso Inválido
  Serv --> Ctrl : denegadoResponse
  deactivate Serv
  Ctrl --> View : mostrarAccesoDenegado(mensaje)
  deactivate Ctrl
  View --> Cliente : puerta bloqueada
end
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Cliente</u>" as Cliente
object "<u>:PuertaView</u>" as View
object "<u>:PuertaController</u>" as Ctrl
object "<u>:PuertaService</u>" as Serv
object "<u>:ReservaRepository</u>" as ResRepo
object "<u>:HabitacionRepository</u>" as HabRepo

Cliente --> View : 1: presentarQR()
View --> Ctrl : 2: validarAccesoQR(codigo, habitacionId)
Ctrl --> Serv : 3: verificarYRegistrarAcceso(codigo, habitacionId)
Serv --> ResRepo : 4: findByCodigo() / save()
Serv --> HabRepo : 5: actualizarEstado(OCUPADA)
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [PuertaView]
  [PuertaController]
}
package "Aplicación (Backend App)" {
  [PuertaService]
}
package "Dominio (Backend Domain)" {
  [Reserva]
  [Habitacion]
}
package "Infraestructura (Backend Infra)" {
  [ReservaRepositoryAdapter]
  [HabitacionRepositoryAdapter]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```""",

    # CU-06: Pago de Consumo Extra
    """```plantuml
@startuml
left to right direction
skinparam actorStyle hollow
actor "Cliente" as Cliente <<actor>>
actor "API Banco BNB" as BNB <<system>>
rectangle "Sistema Residencial" {
  usecase "CU-06: Pago de Consumo Extra" as CU06
}
Cliente --> CU06
CU06 --> BNB
@enduml
```""",
    """```plantuml
@startuml
class TabletView {
  +mostrarMenuConsumos()
  +mostrarQRConsumo(qrData: String)
  +confirmarPagoConsumo()
}
class ConsumoController {
  -consumoService: ConsumoExtraService
  +registrarPedido(reservaId: Long, items: List)
  +verificarPagoConsumo(consumoId: Long)
}
interface ConsumoExtraService <<interface>> {
  +crearConsumoPendiente(reservaId: Long, items: List): ConsumoResponse
  +confirmarPagoConsumo(consumoId: Long): ConsumoResponse
}
class ConsumoExtra {
  -id: Long
  -itemsJson: String
  -total: Double
  -estado: String
}
TabletView ..> ConsumoController : <<use>>
ConsumoController --> ConsumoExtraService
ConsumoExtraService ..> ConsumoExtra : <<use>>
@enduml
```""",
    """```plantuml
@startuml
autonumber
actor Cliente
participant "<u>:TabletView</u>" as View
participant "<u>:ConsumoController</u>" as Ctrl
participant "<u>:ConsumoExtraService</u>" as Serv
participant "<u>:BnbPaymentPort</u>" as BNB <<interface>>
participant "<u>:ConsumoRepository</u>" as Repo

Cliente -> View : confirmarPedido(items)
activate View
View -> Ctrl : registrarPedido(reservaId, items)
activate Ctrl
Ctrl -> Serv : crearConsumoPendiente(reservaId, items)
activate Serv
Serv -> BNB : generarQR(total, "Consumos Extra", reservaId)
activate BNB
BNB --> Serv : qrData
deactivate BNB
Serv -> Repo : save(ConsumoExtra)
activate Repo
Repo --> Serv : c
deactivate Repo
Serv --> Ctrl : c
deactivate Serv
Ctrl --> View : mostrarQRConsumo(qrData)
deactivate Ctrl
View --> Cliente : pagarConsumos

Cliente -> View : confirmarPagoConsumo()
View -> Ctrl : verificarPagoConsumo(consumoId)
activate Ctrl
Ctrl -> Serv : confirmarPagoConsumo(consumoId)
activate Serv
Serv -> BNB : consultarEstado(qrId)
activate BNB
BNB --> Serv : "COMPLETADO"
deactivate BNB
Serv -> Repo : save(ConsumoExtra.pagar())
activate Repo
Repo --> Serv : c
deactivate Repo
Serv --> Ctrl : pagoConfirmado
deactivate Serv
Ctrl --> View : mostrarExito()
deactivate Ctrl
View --> Cliente : visualizar pantalla de éxito
deactivate View
@enduml
```""",
    """```plantuml
@startuml
left to right direction
object "<u>:Cliente</u>" as Cliente
object "<u>:TabletView</u>" as View
object "<u>:ConsumoController</u>" as Ctrl
object "<u>:ConsumoExtraService</u>" as Serv
object "<u>:BnbPaymentPort</u>" as BNB
object "<u>:ConsumoRepository</u>" as Repo

Cliente --> View : 1: seleccionarProductos()
View --> Ctrl : 2: registrarPedido(reservaId, items)
Ctrl --> Serv : 3: crearConsumoPendiente(reservaId, items)
Serv --> BNB : 4: generarQR(total, glosa, reservaId)
Ctrl --> Serv : 5: confirmarPagoConsumo(consumoId)
Serv --> Repo : 6: save(c)
@enduml
```""",
    """```plantuml
@startuml
package "Presentación (Frontend)" {
  [TabletView]
  [ConsumoController]
}
package "Aplicación (Backend App)" {
  [ConsumoExtraService]
  [BnbPaymentPort]
}
package "Dominio (Backend Domain)" {
  [ConsumoExtra]
  [Reserva]
}
package "Infraestructura (Backend Infra)" {
  [ConsumoRepositoryAdapter]
  [BnbSandboxAdapter]
}
"Presentación (Frontend)" ..> "Aplicación (Backend App)" : <<import>>
"Aplicación (Backend App)" ..> "Dominio (Backend Domain)" : <<use>>
"Aplicación (Backend App)" ..> "Infraestructura (Backend Infra)" : <<use>>
@enduml
```"""
]

# Rename Diagramas UML (Mermaid) to Diagramas UML (PlantUML)
new_content = content.replace("##### Diagramas UML (Mermaid)", "##### Diagramas UML (PlantUML)")

# Now extract plantuml code blocks
plantuml_pattern = re.compile(r'```plantuml\n@startuml.*?\n@enduml\n```', re.DOTALL)
matches = plantuml_pattern.findall(new_content)
print(f"Total de bloques PlantUML encontrados: {len(matches)}")

for i in range(min(30, len(matches))):
    new_content = new_content.replace(matches[i], larman_plantuml_diagrams[i])

with open("RefactorV4.md", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Conversión a PlantUML con notación Larman finalizada.")
