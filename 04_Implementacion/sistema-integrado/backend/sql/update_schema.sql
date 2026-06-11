-- 1. Catálogo General de Inventario y Activos
CREATE TABLE IF NOT EXISTS inventario_items (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL, -- 'VENTA', 'CORTESIA', 'REUSABLE', 'ACTIVO_FIJO'
    stock_actual INTEGER NOT NULL DEFAULT 0,
    precio_compra DOUBLE PRECISION,
    precio_venta DOUBLE PRECISION,
    emoji VARCHAR(10)
);

-- 2. Inventario de Habitación
CREATE TABLE IF NOT EXISTS habitacion_inventario (
    id BIGSERIAL PRIMARY KEY,
    habitacion_id BIGINT NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
    cantidad_esperada INTEGER NOT NULL DEFAULT 0,
    cantidad_actual INTEGER NOT NULL DEFAULT 0,
    estado_verificacion VARCHAR(20) NOT NULL DEFAULT 'OK',
    UNIQUE (habitacion_id, item_id)
);

-- 3. Registro de Egresos
CREATE TABLE IF NOT EXISTS egresos (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    recepcionista VARCHAR(100) NOT NULL,
    url_comprobante TEXT
);

-- 4. Registro de Incidencias de Mantenimiento
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

-- 5. Registro de Pre-verificación de Check-out
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

-- 6. Detalles de Pre-verificación
CREATE TABLE IF NOT EXISTS verificacion_detalles (
    id BIGSERIAL PRIMARY KEY,
    verificacion_id BIGINT NOT NULL REFERENCES verificaciones_checkout(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
    estado_reportado VARCHAR(20) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    cargo_aplicado DOUBLE PRECISION DEFAULT 0.0,
    cobrado BOOLEAN NOT NULL DEFAULT TRUE
);
