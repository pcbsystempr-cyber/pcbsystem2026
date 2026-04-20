-- ============================================
-- NOVEDADES TABLE - PCB System 2026
-- Ejecuta este SQL en: Supabase → SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS novedades (
  id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT                     NOT NULL,
  message     TEXT                     NOT NULL,
  image_url   TEXT,
  active      BOOLEAN                  DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permitir lectura pública (para el popup de index.html)
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de novedades"
  ON novedades FOR SELECT USING (true);

CREATE POLICY "Insertar novedades (admin)"
  ON novedades FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualizar novedades (admin)"
  ON novedades FOR UPDATE USING (true);

CREATE POLICY "Eliminar novedades (admin)"
  ON novedades FOR DELETE USING (true);
