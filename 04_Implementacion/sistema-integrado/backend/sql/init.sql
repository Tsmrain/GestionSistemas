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

CREATE TABLE IF NOT EXISTS consumos_extra (
    id BIGSERIAL PRIMARY KEY,
    reserva_id BIGINT NOT NULL REFERENCES reservas(id),
    items_json TEXT NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    qr_data TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_pago TIMESTAMP
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

-- Módulo de Finanzas e Inventario de Habitaciones

CREATE TABLE IF NOT EXISTS inventario_items (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL, -- 'VENTA', 'CORTESIA', 'REUSABLE', 'ACTIVO_FIJO'
    stock_actual INTEGER NOT NULL DEFAULT 0,
    precio_compra DOUBLE PRECISION,
    precio_venta DOUBLE PRECISION,
    emoji VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS habitacion_inventario (
    id BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
    cantidad_esperada INTEGER NOT NULL DEFAULT 0,
    cantidad_actual INTEGER NOT NULL DEFAULT 0,
    estado_verificacion VARCHAR(20) NOT NULL DEFAULT 'OK',
    UNIQUE (habitacion_id, item_id)
);

CREATE TABLE IF NOT EXISTS egresos (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    recepcionista VARCHAR(100) NOT NULL,
    url_comprobante TEXT
);

CREATE TABLE IF NOT EXISTS incidencias_mantenimiento (
    id BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES inventario_items(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_reporte TIMESTAMP NOT NULL DEFAULT NOW(),
    recepcionista_reporta VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    costo_reparacion DOUBLE PRECISION DEFAULT 0.0,
    fecha_resolucion TIMESTAMP,
    recepcionista_resuelve VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS verificaciones_checkout (
    id BIGSERIAL PRIMARY KEY,
    reserva_id BIGINT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    fecha_verificacion TIMESTAMP NOT NULL DEFAULT NOW(),
    recepcionista VARCHAR(100) NOT NULL,
    nombre_camarera VARCHAR(100),
    conforme BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones TEXT
);

CREATE TABLE IF NOT EXISTS verificacion_detalles (
    id BIGSERIAL PRIMARY KEY,
    verificacion_id BIGINT NOT NULL REFERENCES verificaciones_checkout(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
    estado_reportado VARCHAR(20) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    cargo_aplicado DOUBLE PRECISION DEFAULT 0.0,
    cobrado BOOLEAN NOT NULL DEFAULT TRUE
);

