-- TABLA DE TIPOS DE HABITACIÓN
CREATE TABLE tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL,
    precio_base DOUBLE PRECISION NOT NULL,
    descripcion TEXT
);

-- TABLA DE HABITACIONES
CREATE TABLE habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    tipo_id INTEGER REFERENCES tipos_habitacion(id),
    estado_actual VARCHAR(20) DEFAULT 'Disponible',
    version BIGINT DEFAULT 0
);

-- TABLA DE HUÉSPEDES
CREATE TABLE huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ci VARCHAR(20),
    celular VARCHAR(20),
    url_foto_anverso TEXT,
    url_foto_reverso TEXT
);

-- TABLA DE RESERVAS
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    huesped_id INTEGER REFERENCES huespedes(id),
    habitacion_id INTEGER REFERENCES habitaciones(id),
    monto_total DOUBLE PRECISION NOT NULL,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    fecha_ingreso DATE NOT NULL,
    cantidad_bloques INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE_PAGO'
);

-- DATOS INICIALES
INSERT INTO tipos_habitacion (nombre_tipo, precio_base, descripcion) VALUES
('Sencilla', 100.0, 'Habitación con cama individual'),
('Doble', 150.0, 'Habitación con dos camas individuales'),
('VIP', 300.0, 'Suite de lujo con vista al mar');

INSERT INTO habitaciones (numero, tipo_id, estado_actual) VALUES
('101', 1, 'Disponible'),
('102', 1, 'Disponible'),
('103', 1, 'Disponible'),
('104', 1, 'Disponible'),
('201', 2, 'Disponible'),
('202', 2, 'Disponible'),
('203', 2, 'Disponible'),
('301', 3, 'Disponible'),
('302', 3, 'Disponible');
