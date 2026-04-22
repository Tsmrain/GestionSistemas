-- Tabla de Habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    precio_base DOUBLE PRECISION NOT NULL,
    version BIGINT DEFAULT 0
);

-- Tabla de Huéspedes (CU-02)
-- Sincronizado con Modelo de Dominio: documento_identidad, contacto
CREATE TABLE IF NOT EXISTS huespedes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento_identidad VARCHAR(20) UNIQUE NOT NULL,
    contacto VARCHAR(255)
);

-- Inserciones iniciales
TRUNCATE TABLE habitaciones CASCADE;
INSERT INTO habitaciones (numero, tipo, estado, precio_base) VALUES
('101', 'Estandar', 'Disponible', 150.0),
('202', 'Vip', 'Disponible', 300.0),
('303', 'Super Vip', 'Disponible', 500.0);
