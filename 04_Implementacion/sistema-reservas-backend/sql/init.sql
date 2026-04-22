-- Tabla de Tipos de Habitación (Patrón de Descripción)
CREATE TABLE IF NOT EXISTS tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL,
    precio_base DOUBLE PRECISION NOT NULL,
    descripcion TEXT
);

-- Tabla de Habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    tipo_id INTEGER REFERENCES tipos_habitacion(id),
    estado VARCHAR(20) NOT NULL,
    version BIGINT DEFAULT 0
);

-- Tabla de Huéspedes
CREATE TABLE IF NOT EXISTS huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento_identidad VARCHAR(20) UNIQUE NOT NULL,
    celular VARCHAR(20),
    url_foto_anverso VARCHAR(255),
    url_foto_reverso VARCHAR(255)
);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    huesped_id INTEGER REFERENCES huespedes(id),
    habitacion_id INTEGER REFERENCES habitaciones(id),
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    monto_total DOUBLE PRECISION NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL
);

-- Inserciones iniciales
TRUNCATE TABLE reservas, habitaciones, tipos_habitacion, huespedes CASCADE;

INSERT INTO tipos_habitacion (nombre_tipo, precio_base, descripcion) VALUES
('Sencilla', 100.0, 'Habitación con cama individual'),
('Doble', 150.0, 'Habitación con dos camas individuales'),
('VIP', 300.0, 'Suite de lujo con vista al mar');

INSERT INTO habitaciones (numero, tipo_id, estado) VALUES
('101', 1, 'Disponible'),
('102', 1, 'Disponible'),
('201', 2, 'Disponible'),
('202', 2, 'Disponible'),
('301', 3, 'Disponible');
