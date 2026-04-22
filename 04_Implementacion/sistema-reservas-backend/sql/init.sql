-- TABLA DE TIPOS DE HABITACIÓN (Descriptor)
CREATE TABLE tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombreTipo VARCHAR(50) NOT NULL,
    precioBase DOUBLE PRECISION NOT NULL,
    descripcion TEXT
);

-- TABLA DE HABITACIONES
CREATE TABLE habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    tipo_id INTEGER REFERENCES tipos_habitacion(id),
    estadoActual VARCHAR(20) DEFAULT 'Disponible',
    version BIGINT DEFAULT 0
);

-- TABLA DE HUÉSPEDES
CREATE TABLE huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    celular VARCHAR(20),
    urlFotoAnverso TEXT,
    urlFotoReverso TEXT
);

-- TABLA DE RESERVAS
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    huesped_id INTEGER REFERENCES huespedes(id),
    habitacion_id INTEGER REFERENCES habitaciones(id),
    montoTotal DOUBLE PRECISION NOT NULL,
    fechaCreacion DATE DEFAULT CURRENT_DATE,
    fechaIngreso DATE NOT NULL,
    cantidadBloques INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE_PAGO'
);

-- DATOS INICIALES
INSERT INTO tipos_habitacion (nombreTipo, precioBase, descripcion) VALUES
('Sencilla', 100.0, 'Habitación con cama individual'),
('Doble', 150.0, 'Habitación con dos camas individuales'),
('VIP', 300.0, 'Suite de lujo con vista al mar');

INSERT INTO habitaciones (numero, tipo_id, estadoActual) VALUES
('101', 1, 'Disponible'),
('102', 1, 'Disponible'),
('201', 2, 'Disponible'),
('202', 2, 'Disponible'),
('301', 3, 'Disponible');
