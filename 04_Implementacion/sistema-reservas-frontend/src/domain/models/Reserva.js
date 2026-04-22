/**
 * Modelo de Reserva en el Frontend.
 * Sincronizado con el Modelo de Dominio de Larman.
 */
class Reserva {
    constructor(id, huesped, fechaEntrada, fechaSalida, montoTotal, habitacion) {
        this.id = id;
        this.huesped = huesped;
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
        this.montoTotal = montoTotal;
        this.habitacion = habitacion;
        this.fechaRegistro = new Date().toISOString().split('T')[0];
    }
}
