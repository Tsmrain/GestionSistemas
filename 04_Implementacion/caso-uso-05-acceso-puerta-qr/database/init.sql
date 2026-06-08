CREATE TABLE IF NOT EXISTS tipos_habitacion (
    id BIGSERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    precio_base DOUBLE PRECISION NOT NULL,
    duracion_horas INTEGER NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS habitaciones (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    tipo_id BIGINT NOT NULL REFERENCES tipos_habitacion(id),
    estado_actual VARCHAR(20) NOT NULL DEFAULT 'Disponible',
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS huespedes (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ci VARCHAR(20),
    fecha_nacimiento DATE,
    celular VARCHAR(20),
    url_foto_anverso TEXT,
    url_foto_reverso TEXT
);

CREATE TABLE IF NOT EXISTS recepcionistas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reservas (
    id BIGSERIAL PRIMARY KEY,
    huesped_id BIGINT NOT NULL REFERENCES huespedes(id),
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id),
    monto_total DOUBLE PRECISION NOT NULL,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_ingreso DATE NOT NULL,
    cantidad_bloques INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE_PAGO',
    fecha_pago TIMESTAMP,
    ventana_check_in TIMESTAMP,
    acompanante_id BIGINT REFERENCES huespedes(id),
    hora_ingreso TIMESTAMP,
    hora_salida_estimada TIMESTAMP,
    recepcionista VARCHAR(100)
);

INSERT INTO tipos_habitacion (nombre_tipo, precio_base, duracion_horas, descripcion)
VALUES
    ('Estandar', 150.0, 12, 'Habitacion estandar para estadias de 12 horas'),
    ('VIP', 180.0, 12, 'Habitacion VIP para estadias de 12 horas'),
    ('SUPERVIP', 250.0, 6, 'Habitacion SUPERVIP para estadias de 6 horas')
ON CONFLICT (nombre_tipo) DO UPDATE
SET precio_base = EXCLUDED.precio_base,
    duracion_horas = EXCLUDED.duracion_horas,
    descripcion = EXCLUDED.descripcion;

INSERT INTO habitaciones (numero, tipo_id, estado_actual, version)
VALUES
    ('101', 1, 'Disponible', 0),
    ('102', 1, 'Disponible', 0),
    ('103', 1, 'Disponible', 0),
    ('104', 1, 'Disponible', 0),
    ('105', 1, 'Disponible', 0),
    ('106', 1, 'Disponible', 0),
    ('107', 1, 'Disponible', 0),
    ('201', 2, 'Disponible', 0),
    ('202', 2, 'Disponible', 0),
    ('203', 2, 'Disponible', 0),
    ('204', 2, 'Disponible', 0),
    ('205', 2, 'Disponible', 0),
    ('206', 2, 'Disponible', 0),
    ('301', 3, 'Disponible', 0),
    ('302', 3, 'Disponible', 0),
    ('303', 3, 'Disponible', 0),
    ('304', 3, 'Disponible', 0),
    ('305', 3, 'Disponible', 0)
ON CONFLICT (numero) DO UPDATE
SET tipo_id = EXCLUDED.tipo_id,
    estado_actual = EXCLUDED.estado_actual,
    version = EXCLUDED.version;

-- CU-03: Tablas de pago
CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    reserva_id BIGINT NOT NULL REFERENCES reservas(id),
    monto DOUBLE PRECISION NOT NULL,
    metodo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    external_id TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_expiracion TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comprobantes (
    id BIGSERIAL PRIMARY KEY,
    pago_id BIGINT NOT NULL UNIQUE REFERENCES pagos(id),
    nro_comprobante VARCHAR(50) NOT NULL UNIQUE,
    fecha_emision TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pagos_reserva_pendiente
ON pagos(reserva_id)
WHERE estado = 'PENDIENTE';

CREATE UNIQUE INDEX IF NOT EXISTS uq_pagos_reserva_completado
ON pagos(reserva_id)
WHERE estado = 'COMPLETADO';

INSERT INTO recepcionistas (nombre, username, password, activo)
VALUES
    ('Recepcionista Turno Manana', 'recepcion1', '123456', TRUE),
    ('Recepcionista Turno Tarde', 'recepcion2', '123456', TRUE)
ON CONFLICT (username) DO UPDATE
SET nombre = EXCLUDED.nombre,
    password = EXCLUDED.password,
    activo = EXCLUDED.activo;
