/**
 * Biblioteca.js — Sistema de reservas y gestión de la biblioteca PCB
 * Persistencia: localStorage · Sin backend requerido
 */

// ===================== DATA MANAGER =====================
const LibraryManager = {
  R_KEY: 'biblioteca_reservations',
  A_KEY: 'biblioteca_activities',
  _get(k)   { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } },
  _set(k,v) { localStorage.setItem(k, JSON.stringify(v)); },

  getReservations() { return this._get(this.R_KEY); },
  getActivities()   { return this._get(this.A_KEY); },

  addReservation(data) {
    const list = this.getReservations();
    const item = { id: 'RES-' + Date.now(), ...data, status: 'pendiente', createdAt: new Date().toISOString() };
    list.push(item);
    this._set(this.R_KEY, list);
    return item;
  },
  updateReservation(id, changes) {
    const list = this.getReservations();
    const i = list.findIndex(r => r.id === id);
    if (i !== -1) { list[i] = { ...list[i], ...changes, updatedAt: new Date().toISOString() }; this._set(this.R_KEY, list); return list[i]; }
    return null;
  },
  deleteReservation(id) { this._set(this.R_KEY, this.getReservations().filter(r => r.id !== id)); },

  addActivity(data) {
    const list = this.getActivities();
    const item = { id: 'ACT-' + Date.now(), ...data, createdAt: new Date().toISOString() };
    list.push(item);
    this._set(this.A_KEY, list);
    return item;
  },
  updateActivity(id, changes) {
    const list = this.getActivities();
    const i = list.findIndex(a => a.id === id);
    if (i !== -1) { list[i] = { ...list[i], ...changes }; this._set(this.A_KEY, list); return list[i]; }
    return null;
  },
  deleteActivity(id) { this._set(this.A_KEY, this.getActivities().filter(a => a.id !== id)); },

  getEventsForDate(dateStr) {
    const res = this.getReservations(), act = this.getActivities();
    return {
      activities: act.filter(a => a.fecha === dateStr),
      approved:   res.filter(r => r.fecha === dateStr && r.status === 'aprobada'),
      pending:    res.filter(r => r.fecha === dateStr && r.status === 'pendiente')
    };
  },

  /**
   * Busca reservaciones por número de solicitud, nombre o fecha.
   * @param {'id'|'nombre'|'fecha'} type
   * @param {string} value
   * @returns {Array}
   */
  searchReservations(type, value) {
    const q    = value.trim().toLowerCase();
    const list = this.getReservations();
    if (!q) return [];
    if (type === 'id')     return list.filter(r => r.id.toLowerCase() === q);
    if (type === 'nombre') return list.filter(r => r.nombre.toLowerCase().includes(q));
    if (type === 'fecha')  return list.filter(r => r.fecha === value.trim());
    return [];
  }
};
window.LibraryManager = LibraryManager;

// ===================== CALENDAR =====================
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let calDate = new Date();

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  const y = calDate.getFullYear(), m = calDate.getMonth();
  const monthEl = document.getElementById('currentMonth');
  if (monthEl) monthEl.textContent = `${MONTHS_ES[m]} ${y}`;

  // Preservar encabezados de días
  const headers = Array.from(grid.querySelectorAll('.calendar-day-header'));
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h));

  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today       = new Date();

  // Celdas vacías al inicio
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day';
    empty.style.background = 'transparent';
    empty.style.border = 'none';
    grid.appendChild(empty);
  }

  // Celdas de días
  for (let d = 1; d <= daysInMonth; d++) {
    const ds  = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const ev  = LibraryManager.getEventsForDate(ds);
    const hasAct  = ev.activities.length > 0;
    const hasApr  = ev.approved.length  > 0;
    const hasPend = ev.pending.length   > 0;
    const hasAny  = hasAct || hasApr || hasPend;
    const hasMix  = (hasAct && (hasApr || hasPend)) || (hasApr && hasPend);
    const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();

    const el = document.createElement('div');
    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (hasAny) {
      cls += ' has-events';
      if (hasMix)      cls += ' day-mix';
      else if (hasAct) cls += ' day-act';
      else if (hasApr) cls += ' day-apr';
      else             cls += ' day-pend';
    }
    el.className = cls;

    // Número del día
    const numSpan = document.createElement('span');
    numSpan.className = 'day-num';
    numSpan.textContent = d;
    el.appendChild(numSpan);

    // Pills de evento con texto visible
    if (hasAny) {
      const pills  = document.createElement('div');
      pills.className = 'day-pills';
      const MAX   = 2;
      const total = ev.activities.length + ev.approved.length + ev.pending.length;
      let count   = 0;

      for (const a of ev.activities) {
        if (count >= MAX) break;
        const p = document.createElement('span');
        p.className = 'event-pill act';
        p.title     = `${a.titulo}  ·  ${a.horaInicio}–${a.horaFin}`;
        p.textContent = `🎯 ${a.titulo}`;
        pills.appendChild(p);
        count++;
      }
      for (const r of ev.approved) {
        if (count >= MAX) break;
        const p = document.createElement('span');
        p.className = 'event-pill apr';
        p.title     = `${r.space} · ${r.nombre}  ·  ${r.horaInicio}–${r.horaFin}`;
        p.textContent = `✅ ${r.space}`;
        pills.appendChild(p);
        count++;
      }
      for (const r of ev.pending) {
        if (count >= MAX) break;
        const p = document.createElement('span');
        p.className = 'event-pill pend';
        p.title     = `${r.space} · ${r.nombre}  ·  ${r.horaInicio}–${r.horaFin} (pendiente)`;
        p.textContent = `⏳ ${r.space}`;
        pills.appendChild(p);
        count++;
      }
      if (total > MAX) {
        const more = document.createElement('span');
        more.className = 'event-pill more';
        more.textContent = `+${total - MAX} más`;
        pills.appendChild(more);
      }

      el.appendChild(pills);
      el.addEventListener('click', () => showCalPopup(ds, ev));
    }

    grid.appendChild(el);
  }
}

// ── Popup al hacer clic en un día ──────────────────────────────────────────
function showCalPopup(ds, ev) {
  const [y, m, d] = ds.split('-');
  const label = `${parseInt(d)} de ${MONTHS_ES[parseInt(m)-1]} de ${y}`;

  // Construir secciones del popup
  let html = '';

  if (ev.activities.length) {
    html += `
      <div class="cp-section">
        <div class="cp-section-title" style="color:#92400e;background:#fef3c7;">
          🎯 Actividades de Biblioteca
        </div>`;
    ev.activities.forEach(a => {
      html += `
        <div class="cp-event-card act">
          <div class="cp-event-name">${a.titulo}</div>
          <div class="cp-event-meta">
            <span>🕐 ${a.horaInicio} – ${a.horaFin}</span>
            ${a.tipo ? `<span>📌 ${a.tipo}</span>` : ''}
          </div>
          ${a.descripcion ? `<div class="cp-event-desc">${a.descripcion}</div>` : ''}
        </div>`;
    });
    html += `</div>`;
  }

  if (ev.approved.length) {
    html += `
      <div class="cp-section">
        <div class="cp-section-title" style="color:#065f46;background:#d1fae5;">
          ✅ Reservas Aprobadas
        </div>`;
    ev.approved.forEach(r => {
      html += `
        <div class="cp-event-card apr">
          <div class="cp-event-name">${r.space}</div>
          <div class="cp-event-meta">
            <span>👤 ${r.nombre}</span>
            <span>🕐 ${r.horaInicio} – ${r.horaFin}</span>
            ${r.participantes ? `<span>👥 ${r.participantes} pers.</span>` : ''}
          </div>
          ${r.proposito ? `<div class="cp-event-desc">${r.proposito}</div>` : ''}
        </div>`;
    });
    html += `</div>`;
  }

  if (ev.pending.length) {
    html += `
      <div class="cp-section">
        <div class="cp-section-title" style="color:#475569;background:#f1f5f9;">
          ⏳ Reservas Pendientes de Aprobación
        </div>`;
    ev.pending.forEach(r => {
      html += `
        <div class="cp-event-card pend">
          <div class="cp-event-name">${r.space}</div>
          <div class="cp-event-meta">
            <span>👤 ${r.nombre}</span>
            <span>🕐 ${r.horaInicio} – ${r.horaFin}</span>
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  if (!html) {
    html = `<p style="color:#94a3b8;text-align:center;padding:1.5rem 0;">No hay eventos programados este día.</p>`;
  }

  // Crear o reutilizar el popup
  let pop = document.getElementById('calDayPopup');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'calDayPopup';
    pop.style.cssText = [
      'position:fixed;top:0;left:0;width:100%;height:100%;',
      'background:rgba(0,0,0,.55);z-index:99999;',
      'display:flex;align-items:center;justify-content:center;'
    ].join('');
    pop.innerHTML = `
      <div id="calPopupBox" style="
        background:#fff;border-radius:18px;padding:0;
        max-width:480px;width:92%;max-height:85vh;
        overflow:hidden;display:flex;flex-direction:column;
        box-shadow:0 24px 64px rgba(0,0,0,.3);">
        <div id="cpHeader" style="
          background:linear-gradient(135deg,#667eea,#764ba2);
          color:white;padding:1.25rem 1.5rem;
          display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
          <div>
            <div style="font-size:0.78rem;opacity:0.8;margin-bottom:2px;">📅 Eventos del día</div>
            <h3 id="cpTitle" style="margin:0;font-size:1.15rem;font-weight:800;"></h3>
          </div>
          <button onclick="document.getElementById('calDayPopup').style.display='none'"
            style="background:rgba(255,255,255,0.2);border:none;color:white;
            width:32px;height:32px;border-radius:50%;font-size:1.2rem;
            cursor:pointer;display:flex;align-items:center;justify-content:center;
            line-height:1;flex-shrink:0;">&times;</button>
        </div>
        <div id="cpContent" style="overflow-y:auto;padding:1.25rem;flex:1;"></div>
      </div>`;
    document.body.appendChild(pop);
    pop.addEventListener('click', e => { if (e.target === pop) pop.style.display = 'none'; });

    // Inyectar estilos del popup una sola vez
    if (!document.getElementById('cpStyles')) {
      const s = document.createElement('style');
      s.id = 'cpStyles';
      s.textContent = `
        .cp-section { margin-bottom: 1rem; }
        .cp-section:last-child { margin-bottom: 0; }
        .cp-section-title {
          font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;
          padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;
          display: inline-block; text-transform: uppercase;
        }
        .cp-event-card {
          border-radius: 10px; padding: 0.75rem 1rem;
          margin-bottom: 6px; border: 1px solid transparent;
        }
        .cp-event-card.act  { background:#fffbeb; border-color:#fde68a; }
        .cp-event-card.apr  { background:#f0fdf4; border-color:#bbf7d0; }
        .cp-event-card.pend { background:#f8fafc; border-color:#e2e8f0; }
        .cp-event-name {
          font-weight: 700; font-size: 0.97rem; color: #1e293b; margin-bottom: 4px;
        }
        .cp-event-meta {
          display: flex; flex-wrap: wrap; gap: 0.6rem;
          font-size: 0.82rem; color: #64748b;
        }
        .cp-event-desc {
          margin-top: 5px; font-size: 0.82rem; color: #94a3b8; font-style: italic;
        }
      `;
      document.head.appendChild(s);
    }
  }

  document.getElementById('cpTitle').textContent = label;
  document.getElementById('cpContent').innerHTML = html;
  pop.style.display = 'flex';
}

function previousMonth() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); }
function nextMonth()     { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); }
function goToToday()     { calDate = new Date(); renderCalendar(); }

// ===================== EMBEDDED RESERVATION FORM =====================

/**
 * goToForm(spaceName) — llamado desde las tarjetas de espacio.
 * Pre-selecciona el espacio y hace scroll suave al formulario embebido.
 */
function goToForm(spaceName) {
  // Mostrar estado formulario, ocultar éxito
  const fd = document.getElementById('embeddedFormDiv');
  const sd = document.getElementById('embeddedSuccessDiv');
  if (fd) fd.style.display = 'block';
  if (sd) sd.style.display = 'none';

  // Seleccionar espacio visualmente
  selectSpace(spaceName);

  // Scroll al formulario
  const section = document.getElementById('reserva');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Resaltar la tarjeta de espacio seleccionada arriba
  document.querySelectorAll('.space-card').forEach(c => c.classList.remove('active-space'));
  const cardMap = {
    'Sala de Lectura':       'scard-lectura',
    'Computadoras':          'scard-computadoras',
    'Proyector':             'scard-proyector',
    'Sala de Presentaciones':'scard-presentaciones'
  };
  const card = document.getElementById(cardMap[spaceName]);
  if (card) card.classList.add('active-space');
}

/**
 * selectSpace(spaceName) — resalta la tarjeta del selector dentro del formulario.
 */
function selectSpace(spaceName) {
  document.getElementById('selectedSpaceInput').value = spaceName;
  document.querySelectorAll('.spc-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.space === spaceName);
  });
  // Ocultar mensaje de error de espacio si había
  const err = document.getElementById('spaceError');
  if (err) err.style.display = 'none';
}

/**
 * resetReservationForm() — vuelve al formulario vacío desde la pantalla de éxito.
 */
function resetReservationForm() {
  const form = document.getElementById('reservationForm');
  if (form) form.reset();
  document.querySelectorAll('.spc-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.space-card').forEach(c => c.classList.remove('active-space'));
  const si = document.getElementById('selectedSpaceInput');
  if (si) si.value = '';
  document.getElementById('embeddedSuccessDiv').style.display = 'none';
  document.getElementById('embeddedFormDiv').style.display  = 'block';
  // Volver al inicio del formulario
  const section = document.getElementById('reserva');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================== DOM READY =====================
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();

  // Fecha mínima = hoy
  const di = document.getElementById('resDate');
  if (di) di.min = new Date().toISOString().split('T')[0];

  // Submit del formulario embebido
  const form = document.getElementById('reservationForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Validar que se seleccionó un espacio
      const space = document.getElementById('selectedSpaceInput').value;
      if (!space) {
        const err = document.getElementById('spaceError');
        if (err) err.style.display = 'block';
        document.querySelector('.space-selector-grid')
          .scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Guardar en localStorage vía LibraryManager
      const saved = LibraryManager.addReservation({
        space,
        nombre:       document.getElementById('resNombre').value,
        email:        document.getElementById('resEmail').value,
        telefono:     document.getElementById('resTelefono').value,
        fecha:        document.getElementById('resDate').value,
        horaInicio:   document.getElementById('resHoraInicio').value,
        horaFin:      document.getElementById('resHoraFin').value,
        proposito:    document.getElementById('resProposito').value,
        participantes:document.getElementById('resParticipantes').value
      });

      // Mostrar pantalla de éxito
      document.getElementById('embeddedFormDiv').style.display  = 'none';
      document.getElementById('reservationTicketId').textContent = saved.id;
      document.getElementById('embeddedSuccessDiv').style.display = 'block';

      // Actualizar calendario con el nuevo pendiente
      renderCalendar();
      form.reset();
    });
  }
});

// ===================== VERIFICAR ESTATUS DE SOLICITUD =====================

let currentSearchType = 'id';

/**
 * Cambia el tipo de búsqueda activo y ajusta el placeholder del input.
 */
function setSearchType(type, btn) {
  currentSearchType = type;

  // Resaltar pill activo
  document.querySelectorAll('.stype-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Ajustar placeholder y hint
  const input = document.getElementById('statusSearchInput');
  const hint  = document.getElementById('statusSearchHint');
  const cfg = {
    id:     { ph: 'Ej: RES-1234567890',      hint: 'Ingresa el número de solicitud que recibiste al enviar el formulario.',  type: 'text'  },
    nombre: { ph: 'Ej: Juan García',          hint: 'Ingresa tu nombre completo o parcial tal como lo escribiste.',           type: 'text'  },
    fecha:  { ph: 'Selecciona una fecha',      hint: 'Selecciona la fecha que indicaste en tu solicitud de reserva.',          type: 'date'  }
  };
  if (input && cfg[type]) {
    input.placeholder = cfg[type].ph;
    input.type        = cfg[type].type;
    input.value       = '';
  }
  if (hint && cfg[type]) hint.textContent = cfg[type].hint;

  // Limpiar resultado anterior
  const result = document.getElementById('statusResult');
  if (result) result.innerHTML = '';
}

/**
 * Ejecuta la búsqueda y muestra los resultados.
 */
function doStatusSearch() {
  const input   = document.getElementById('statusSearchInput');
  const result  = document.getElementById('statusResult');
  if (!input || !result) return;

  const value = input.value.trim();
  if (!value) {
    result.innerHTML = `
      <div class="status-empty">
        <span class="status-empty-icon">✏️</span>
        <strong>Campo vacío.</strong> Ingresa un valor para buscar.
      </div>`;
    return;
  }

  const found = LibraryManager.searchReservations(currentSearchType, value);

  if (!found.length) {
    result.innerHTML = `
      <div class="status-empty">
        <span class="status-empty-icon">🔍</span>
        <strong>No se encontraron solicitudes.</strong><br>
        <span style="font-size:0.85rem;">Verifica que el dato ingresado sea correcto.<br>
        Si acabas de enviar la solicitud, puede tardar unos segundos en aparecer.</span>
      </div>`;
    return;
  }

  result.innerHTML = found.map(r => buildStatusCard(r)).join('');
}

/**
 * Construye el HTML de una tarjeta de resultado.
 */
function buildStatusCard(r) {
  const statusMap = {
    pendiente: { cls: 'pend', label: '⏳ Pendiente de Aprobación' },
    aprobada:  { cls: 'apr',  label: '✅ Aprobada'                },
    denegada:  { cls: 'den',  label: '❌ Denegada'               }
  };
  const s = statusMap[r.status] || statusMap.pendiente;

  // Fecha legible
  const [fy, fm, fd] = (r.fecha || '').split('-');
  const fechaLabel = (fy && fm && fd)
    ? `${parseInt(fd)} de ${MONTHS_ES[parseInt(fm)-1]} de ${fy}`
    : r.fecha || '—';

  // Razón de denegación (solo si fue denegada)
  const denialHTML = (r.status === 'denegada')
    ? `<div class="denial-box">
         <div class="denial-box-title">💬 Razón de denegación</div>
         <div class="denial-box-text">${r.note ? r.note : 'La bibliotecaria no especificó una razón. Puedes contactarla directamente.'}</div>
       </div>`
    : '';

  // Mensaje extra para aprobadas
  const approvedNote = (r.status === 'aprobada')
    ? `<div style="margin-top:0.75rem;padding:0.7rem 1rem;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:9px;font-size:0.83rem;color:#065f46;">
         ✅ Tu reserva fue aprobada. Preséntate con tu identificación estudiantil en el espacio reservado.
       </div>`
    : '';

  return `
    <div class="status-card ${s.cls}">
      <div class="status-card-header">
        <span class="status-card-id">📋 ${r.id}</span>
        <span class="status-badge ${s.cls}">${s.label}</span>
      </div>
      <div class="status-space">${r.space || '—'}</div>
      <div class="status-details">
        <span>👤 ${r.nombre || '—'}</span>
        ${r.email    ? `<span>📧 ${r.email}</span>`    : ''}
        ${r.telefono ? `<span>📞 ${r.telefono}</span>` : ''}
        <span>📅 ${fechaLabel}</span>
        <span>🕐 ${r.horaInicio || '—'} – ${r.horaFin || '—'}</span>
        ${r.participantes ? `<span>👥 ${r.participantes} participante(s)</span>` : ''}
      </div>
      ${r.proposito ? `<div style="margin-top:0.5rem;font-size:0.83rem;color:#64748b;">📝 ${r.proposito}</div>` : ''}
      ${denialHTML}
      ${approvedNote}
    </div>`;
}
