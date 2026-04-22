/**
 * anuncios-db.js
 * CRUD de Anuncios de Comunidad usando la API REST de Supabase.
 * Cualquier visitante puede enviar — el admin aprueba desde el dashboard.
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://micoqkitypworxporqqf.supabase.co/rest/v1/';
  const SUPABASE_KEY = 'sb_publishable_CKNU73KZt712SV4Y5MFhCw_is4mQpdR';
  const _base = SUPABASE_URL.replace(/\/+$/, '');
  const BASE   = _base.includes('/rest/v1') ? _base + '/anuncios_comunidad' : _base + '/rest/v1/anuncios_comunidad';

  const H = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  const HD = { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY };

  /** Todos los anuncios (admin) */
  async function getAll() {
    const r = await fetch(BASE + '?order=created_at.desc', { headers: H });
    if (!r.ok) throw new Error('getAll: ' + r.status);
    return r.json();
  }

  /** Pendientes de aprobación */
  async function getPending() {
    const r = await fetch(BASE + '?aprobado=eq.false&rechazado=eq.false&order=created_at.desc', { headers: H });
    if (!r.ok) throw new Error('getPending: ' + r.status);
    return r.json();
  }

  /**
   * Activos y no caducados (popup público).
   * Filtra en cliente porque Supabase REST no soporta comparar date con NOW() vía query string.
   */
  async function getActive() {
    const r = await fetch(BASE + '?aprobado=eq.true&rechazado=eq.false&order=created_at.desc', { headers: H });
    if (!r.ok) return [];
    const data = await r.json();
    const today = new Date().toISOString().slice(0, 10);
    return data.filter(a => !a.fecha_caducidad || a.fecha_caducidad >= today);
  }

  /**
   * Enviar nuevo anuncio (público — queda pendiente).
   * @param {Object} p - { titulo, mensaje, categoria, imagenUrl, nombreAutor, contacto, fechaCaducidad }
   */
  async function add({ titulo, mensaje, categoria, imagenUrl, nombreAutor, contacto, fechaCaducidad }) {
    const r = await fetch(BASE, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        titulo,
        mensaje,
        categoria:       categoria || 'aviso',
        imagen_url:      imagenUrl || null,
        nombre_autor:    nombreAutor || 'Anónimo',
        contacto:        contacto   || null,
        fecha_caducidad: fechaCaducidad || null,
        aprobado:        false,
        rechazado:       false
      })
    });
    if (!r.ok) throw new Error('add: ' + r.status);
    const d = await r.json();
    return d[0];
  }

  /** Aprobar anuncio */
  async function approve(id) {
    const r = await fetch(BASE + '?id=eq.' + id, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({ aprobado: true, rechazado: false })
    });
    if (!r.ok) throw new Error('approve: ' + r.status);
  }

  /** Rechazar anuncio */
  async function reject(id) {
    const r = await fetch(BASE + '?id=eq.' + id, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({ aprobado: false, rechazado: true })
    });
    if (!r.ok) throw new Error('reject: ' + r.status);
  }

  /** Eliminar anuncio */
  async function remove(id) {
    const r = await fetch(BASE + '?id=eq.' + id, { method: 'DELETE', headers: HD });
    if (!r.ok) throw new Error('remove: ' + r.status);
  }

  /** Editar campos de un anuncio */
  async function update(id, fields) {
    const r = await fetch(BASE + '?id=eq.' + id, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify(fields)
    });
    if (!r.ok) throw new Error('update: ' + r.status);
  }

  window.anunciosDB = { getAll, getPending, getActive, add, approve, reject, remove, update };
})();
