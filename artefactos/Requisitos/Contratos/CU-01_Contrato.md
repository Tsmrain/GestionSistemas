# Contrato de Operación: consultarDisponibilidad

**Operación:** consultarDisponibilidad(tipo: String, fecha: Date)
**Referencias:** Caso de Uso CU-01 (Consultar Disponibilidad de Habitaciones)
**Precondiciones:**
- Existen habitaciones registradas en el sistema.
- El sistema está disponible para recibir consultas.

**Postcondiciones:**
- Se ha filtrado el inventario de habitaciones por el `tipo` especificado (si se proporcionó).
- Se ha verificado el estado de las habitaciones para la `fecha` indicada.
- Se ha devuelto una colección de objetos `Habitacion` cuyo estado es 'Disponible'.
- Los objetos devueltos contienen el `numero`, `tipo` y `precioBase` vigente.

---
*Nota: Este contrato define el compromiso del sistema para cumplir con la lógica de negocio del CU-01 según la metodología de Craig Larman.*
