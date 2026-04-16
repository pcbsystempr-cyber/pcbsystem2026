-- ============================================
-- SUPERBASE SQL - Servicio Técnico COMPUTEC
-- Ejecuta todo este código en el SQL Editor de Supabase
-- ============================================

-- 1. Agregar columna de código de seguimiento
ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS codigo_seguimiento TEXT;

-- 2. Agregar columna de edificio/aula
ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS edificio TEXT;

ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS numero_aula TEXT;

-- 3. Agregar columnas de fecha/hora
ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT NOW();

ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP;

ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS fecha_resolucion TIMESTAMP;

-- 4. Agregar observaciones del técnico
ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS observaciones_tecnico TEXT;

ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS solucion TEXT;

-- 5. Agregar rating del usuario
ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS rating_usuario INTEGER;

ALTER TABLE solicitudes_servicio 
ADD COLUMN IF NOT EXISTS comentario_usuario TEXT;

-- 6. Actualizar solicitudes existentes sin código (si la tabla ya tiene datos)
-- UPDATE solicitudes_servicio SET codigo_seguimiento = 'ST-' || encode(gen_random_bytes(2), 'hex') WHERE codigo_seguimiento IS NULL;

-- 7. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_solicitudes_codigo ON solicitudes_servicio(codigo_seguimiento);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_servicio(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_servicio(fecha_creacion);

-- 8. Tabla de Calificación
ALTER TABLE calificaciones_servicio 
ADD COLUMN IF NOT EXISTS codigo_seguimiento TEXT;

ALTER TABLE calificaciones_servicio 
ADD COLUMN IF NOT EXISTS fecha_servicio DATE;

ALTER TABLE calificaciones_servicio 
ADD COLUMN IF NOT EXISTS comentarios_adicionales TEXT;