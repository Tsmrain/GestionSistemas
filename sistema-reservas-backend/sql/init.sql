CREATE TABLE IF NOT EXISTS habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    precio_base DOUBLE PRECISION NOT NULL
);

INSERT INTO habitaciones (numero, tipo, estado, precio_base) VALUES
('101', 'Estandar', 'Disponible', 150.0),
('202', 'Vip', 'Disponible', 300.0),
('303', 'Super Vip', 'Disponible', 500.0);
