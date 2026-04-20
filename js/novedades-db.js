/**
 * novedades-db.js
 * CRUD de Novedades usando la API REST de Supabase.
 * Reemplaza el almacenamiento en localStorage para que las
 * novedades sean visibles en todos los dispositivos/navegadores.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://micoqkitypworxporqqf.supabase.co/rest/v1/';
  const SUPABASE_KEY = 'sb_publishable_CKNU73KZt712SV4Y5MFhCw_is4mQpdR';
  // SUPABASE_URL ya puede incluir /rest/v1/ — se normaliza para evitar rutas duplicadas
  const _base = SUPABASE_URL.replace(/\/+$/, '');
  const BASE  = _base.includes('/rest/v1') ? _base + '/novedades' : _base + '/rest/v1/novedades';

  const HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const DEL_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY
  };

  /**
   * Devuelve todas las novedades ordenadas por fecha descendente.
   */
  async function getAll() {
    const res = await fetch(BASE + '?order=created_at.desc', { headers: HEADERS });
    if (!res.ok) throw new Error('Error al cargar novedades: ' + res.status);
    return res.json();
  }

  /**
   * Devuelve la novedad activa más reciente (para el popup).
   */
  async function getLatest() {
    const res = await fetch(
      BASE + '?active=eq.true&order=created_at.desc&limit=1',
      { headers: HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  }

  /**
   * Publica una nueva novedad.
   * @param {Object} p - { title, message, imageUrl }
   */
  async function add({ title, message, imageUrl }) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        title:     title,
        message:   message,
        image_url: imageUrl || null,
        active:    true
      })
    });
    if (!res.ok) throw new Error('Error al publicar novedad: ' + res.status);
    const data = await res.json();
    return data[0];
  }

  /**
   * Edita una novedad existente.
   * @param {string} id - UUID de la novedad
   * @param {Object} p  - { title, message, imageUrl }
   */
  async function update(id, { title, message, imageUrl }) {
    const res = await fetch(BASE + '?id=eq.' + id, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        title:     title,
        message:   message,
        image_url: imageUrl || null
      })
    });
    if (!res.ok) throw new Error('Error al actualizar novedad: ' + res.status);
    const data = await res.json();
    return data[0];
  }

  /**
   * Elimina una novedad.
   * @param {string} id - UUID de la novedad
   */
  async function remove(id) {
    const res = await fetch(BASE + '?id=eq.' + id, {
      method: 'DELETE',
      headers: DEL_HEADERS
    });
    if (!res.ok) throw new Error('Error al eliminar novedad: ' + res.status);
  }

  // Exportar al scope global
  window.novedadesDB = { getAll, getLatest, add, update, remove };
})();
