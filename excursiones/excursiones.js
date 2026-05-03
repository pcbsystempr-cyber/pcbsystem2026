/* ════════════════════════════════════════════════
   FORMULARIO DE EXCURSIÓN — PCBSystem 2026
   Lógica: tabs, tablas, validación, persistencia, PDF
   ════════════════════════════════════════════════ */

const STORAGE_KEY = 'pcb_excursion_draft_v1';
const ESCUELA_DEFAULT = {
  escuela: 'Escuela Superior Pablo Colón Berdecia',
  codigo: '20560',
  municipio: 'Barranquitas'
};
const REGLAS_DEFAULT = [
  'Mantenerse junto al grupo y al maestro asignado en todo momento.',
  'Seguir las instrucciones de los maestros, choferes y guías.',
  'No abandonar el grupo sin autorización del maestro encargado.',
  'Mantener un comportamiento adecuado dentro y fuera del autobús.',
  'No consumir alimentos o bebidas no autorizadas.',
  'Respetar las normas del lugar visitado.',
  'Usar el cinturón de seguridad durante el transporte.',
  'No traer objetos peligrosos ni sustancias prohibidas.',
  'Avisar al maestro inmediatamente ante cualquier emergencia.',
  'Cumplir con los horarios de salida y regreso establecidos.'
];
const CRITERIOS_EVAL = [
  'La actividad está alineada con los estándares y las expectativas curriculares.',
  'El plan académico contiene objetivos claros, medibles y observables.',
  'Las actividades antes, durante y después están bien definidas.',
  'Se incluye un plan para los estudiantes que no participarán.',
  'Las reglas de seguridad están claramente establecidas.',
  'Se incluye la lista completa de estudiantes participantes.',
  'Se identifica el transportista y el costo total de la actividad.',
  'Se incluyen los permisos firmados por los padres o encargados.',
  'Se incluyen los relevos de responsabilidad.',
  'La solicitud cuenta con la firma del director escolar.'
];

// Estado en memoria
const state = {
  data: {},
  estudiantes: [],
  noPart: [],
  reglas: [...REGLAS_DEFAULT],
  evalCrits: CRITERIOS_EVAL.map(c => ({ criterio: c, val: '', com: '' }))
};

// ── HELPERS ─────────────────────────────────────
function $(s, ctx=document) { return ctx.querySelector(s); }
function $$(s, ctx=document) { return Array.from(ctx.querySelectorAll(s)); }
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function toast(msg, type='') {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.className = 'exc-toast show ' + type;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

// ── TABS ────────────────────────────────────────
function initTabs() {
  $$('.exc-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}
function switchTab(name) {
  $$('.exc-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.exc-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── BINDING DE CAMPOS ───────────────────────────
function bindFields() {
  $$('[data-field]').forEach(el => {
    el.addEventListener('input', onFieldChange);
    el.addEventListener('change', onFieldChange);
  });
}
function onFieldChange(e) {
  const el = e.target;
  const k = el.dataset.field;
  if (!k) return;
  if (el.type === 'checkbox') state.data[k] = el.checked;
  else if (el.type === 'radio') { if (el.checked) state.data[k] = el.value; }
  else state.data[k] = el.value;
  recalc();
  scheduleAutoSave();
  updateProgress();
}
function readFields() {
  $$('[data-field]').forEach(el => {
    const k = el.dataset.field;
    if (!k) return;
    if (el.type === 'checkbox') state.data[k] = el.checked;
    else if (el.type === 'radio') { if (el.checked) state.data[k] = el.value; }
    else state.data[k] = el.value;
  });
}
function applyFields() {
  $$('[data-field]').forEach(el => {
    const k = el.dataset.field;
    const v = state.data[k];
    if (v === undefined || v === null) return;
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') el.checked = (el.value === v);
    else el.value = v;
  });
}

// ── CÁLCULOS AUTO ───────────────────────────────
function recalc() {
  const cg = parseFloat(state.data.cantGuaguas) || 0;
  const csg = parseFloat(state.data.costoGuagua) || 0;
  state.data.totalTransporte = (cg * csg).toFixed(2);
  const cb = parseFloat(state.data.cantBoletos) || 0;
  const csb = parseFloat(state.data.costoBoleto) || 0;
  state.data.totalBoletos = (cb * csb).toFixed(2);
  state.data.cantEstudiantes = state.estudiantes.length;
  state.data.acaImpactados = state.estudiantes.length;
  const tt = $('[data-field="totalTransporte"]'); if (tt) tt.value = state.data.totalTransporte;
  const tb = $('[data-field="totalBoletos"]');    if (tb) tb.value = state.data.totalBoletos;
  const ce = $('[data-field="cantEstudiantes"]'); if (ce) ce.value = state.data.cantEstudiantes;
  const ai = $('[data-field="acaImpactados"]');   if (ai) ai.value = state.data.acaImpactados;
  const lbl = $('#totalEstudiantesLabel'); if (lbl) lbl.textContent = state.estudiantes.length;
}

// ── PROGRESO ────────────────────────────────────
const REQUIRED = [
  'fechaSolicitud','tipoActividad','lugarActividad','horaSalida','horaRegreso',
  'fechaActividad','solicitante','puesto','acaGrados','acaMateria',
  'acaObjetivo','actAntes','actDurante','actDespues'
];
function updateProgress() {
  let done = 0;
  REQUIRED.forEach(k => { if (state.data[k] && String(state.data[k]).trim()) done++; });
  if (state.estudiantes.length > 0) done += 2;
  const total = REQUIRED.length + 2;
  const pct = Math.round((done / total) * 100);
  $('#progressFill').style.width = pct + '%';
  $('#progressPct').textContent = pct;
}

// ── TABLA: NO PARTICIPAN ────────────────────────
function renderNoPart() {
  const tb = $('#bodyNoPart'); if (!tb) return;
  tb.innerHTML = '';
  state.noPart.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" data-np="actividad" data-i="${i}" value="${escapeHtml(row.actividad)}"></td>
      <td><input type="text" data-np="lugar" data-i="${i}" value="${escapeHtml(row.lugar)}"></td>
      <td><input type="text" data-np="recurso" data-i="${i}" value="${escapeHtml(row.recurso)}"></td>
      <td><button type="button" class="exc-row-del" data-del-np="${i}">🗑️</button></td>`;
    tb.appendChild(tr);
  });
  $$('[data-np]', tb).forEach(inp => {
    inp.addEventListener('input', e => {
      const i = +e.target.dataset.i;
      state.noPart[i][e.target.dataset.np] = e.target.value;
      scheduleAutoSave();
    });
  });
  $$('[data-del-np]', tb).forEach(b => {
    b.addEventListener('click', () => {
      state.noPart.splice(+b.dataset.delNp, 1);
      renderNoPart(); scheduleAutoSave();
    });
  });
}
function addNoPart() {
  state.noPart.push({ actividad:'', lugar:'', recurso:'' });
  renderNoPart(); scheduleAutoSave();
}

// ── TABLA: ESTUDIANTES ──────────────────────────
function renderEstudiantes() {
  const tb = $('#bodyEstudiantes'); if (!tb) return;
  tb.innerHTML = '';
  state.estudiantes.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="center">${i+1}</td>
      <td><input type="text" data-est="nombre"    data-i="${i}" value="${escapeHtml(s.nombre)}"></td>
      <td><input type="text" data-est="grado"     data-i="${i}" value="${escapeHtml(s.grado)}"></td>
      <td><input type="text" data-est="grupo"     data-i="${i}" value="${escapeHtml(s.grupo)}"></td>
      <td><input type="text" data-est="encargado" data-i="${i}" value="${escapeHtml(s.encargado)}"></td>
      <td><input type="text" data-est="telefono"  data-i="${i}" value="${escapeHtml(s.telefono)}"></td>
      <td><button type="button" class="exc-row-del" data-del-est="${i}">🗑️</button></td>`;
    tb.appendChild(tr);
  });
  $$('[data-est]', tb).forEach(inp => {
    inp.addEventListener('input', e => {
      state.estudiantes[+e.target.dataset.i][e.target.dataset.est] = e.target.value;
      scheduleAutoSave();
    });
  });
  $$('[data-del-est]', tb).forEach(b => {
    b.addEventListener('click', () => {
      state.estudiantes.splice(+b.dataset.delEst, 1);
      renderEstudiantes(); recalc(); updateProgress(); scheduleAutoSave();
    });
  });
  recalc();
}
function addEstudiante() {
  state.estudiantes.push({ nombre:'', grado:'', grupo:'', encargado:'', telefono:'' });
  renderEstudiantes(); updateProgress(); scheduleAutoSave();
}
function importarEstudiantes(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let added = 0;
  lines.forEach(line => {
    const cols = line.split(/\t|,/).map(c => c.trim());
    if (!cols[0]) return;
    state.estudiantes.push({
      nombre: cols[0]||'', grado: cols[1]||'', grupo: cols[2]||'',
      encargado: cols[3]||'', telefono: cols[4]||''
    });
    added++;
  });
  renderEstudiantes(); updateProgress(); scheduleAutoSave();
  toast(`✅ ${added} estudiante(s) importados`, 'success');
}

// ── REGLAS DE SEGURIDAD ─────────────────────────
function renderReglas() {
  const wrap = $('#reglasSeguridadWrap'); if (!wrap) return;
  wrap.innerHTML = '';
  state.reglas.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'exc-regla-row';
    row.innerHTML = `
      <div class="exc-regla-num">${i+1}</div>
      <input type="text" data-regla="${i}" value="${escapeHtml(r)}">
      <button type="button" class="exc-row-del" data-del-regla="${i}">🗑️</button>`;
    wrap.appendChild(row);
  });
  // botón añadir
  const add = document.createElement('button');
  add.type = 'button'; add.className = 'exc-btn exc-btn-secondary';
  add.textContent = '➕ Añadir regla';
  add.addEventListener('click', () => { state.reglas.push(''); renderReglas(); scheduleAutoSave(); });
  wrap.appendChild(add);

  $$('[data-regla]', wrap).forEach(inp => {
    inp.addEventListener('input', e => {
      state.reglas[+e.target.dataset.regla] = e.target.value;
      scheduleAutoSave();
    });
  });
  $$('[data-del-regla]', wrap).forEach(b => {
    b.addEventListener('click', () => {
      state.reglas.splice(+b.dataset.delRegla, 1);
      renderReglas(); scheduleAutoSave();
    });
  });
}

// ── CRITERIOS DE EVALUACIÓN ─────────────────────
function renderEval() {
  const tb = $('#bodyEval'); if (!tb) return;
  tb.innerHTML = '';
  state.evalCrits.forEach((c, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.criterio)}</td>
      <td class="center"><input type="radio" name="eval${i}" value="cumple"    ${c.val==='cumple'?'checked':''}></td>
      <td class="center"><input type="radio" name="eval${i}" value="nocumple"  ${c.val==='nocumple'?'checked':''}></td>
      <td class="center"><input type="radio" name="eval${i}" value="na"        ${c.val==='na'?'checked':''}></td>
      <td><input type="text" data-evalcom="${i}" value="${escapeHtml(c.com)}"></td>`;
    tb.appendChild(tr);
  });
  $$('input[type="radio"]', tb).forEach(r => {
    r.addEventListener('change', e => {
      const i = +e.target.name.replace('eval','');
      state.evalCrits[i].val = e.target.value;
      scheduleAutoSave();
    });
  });
  $$('[data-evalcom]', tb).forEach(inp => {
    inp.addEventListener('input', e => {
      state.evalCrits[+e.target.dataset.evalcom].com = e.target.value;
      scheduleAutoSave();
    });
  });
}

// ── PERSISTENCIA ────────────────────────────────
let saveTimer = null;
function scheduleAutoSave() {
  if ($('#autosaveStatus')) $('#autosaveStatus').textContent = '✏️ Editando…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 1200);
}
function saveDraft(silent) {
  readFields();
  const payload = {
    data: state.data, estudiantes: state.estudiantes,
    noPart: state.noPart, reglas: state.reglas, evalCrits: state.evalCrits,
    savedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if ($('#autosaveStatus')) {
      const t = new Date().toLocaleTimeString();
      $('#autosaveStatus').textContent = `💾 Guardado a las ${t}`;
    }
    if (!silent) toast('💾 Borrador guardado', 'success');
  } catch (e) {
    toast('⚠️ Error al guardar borrador', 'error');
  }
}
function loadDraft(silent) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { if (!silent) toast('No hay borrador guardado', 'error'); return false; }
    const p = JSON.parse(raw);
    state.data = p.data || {};
    state.estudiantes = p.estudiantes || [];
    state.noPart = p.noPart || [];
    state.reglas = (p.reglas && p.reglas.length) ? p.reglas : [...REGLAS_DEFAULT];
    state.evalCrits = p.evalCrits || CRITERIOS_EVAL.map(c => ({ criterio: c, val:'', com:'' }));
    applyFields(); renderEstudiantes(); renderNoPart(); renderReglas(); renderEval();
    recalc(); updateProgress();
    if (!silent) toast('📂 Borrador cargado', 'success');
    return true;
  } catch (e) {
    if (!silent) toast('⚠️ Borrador corrupto', 'error');
    return false;
  }
}
function clearDraft() {
  if (!confirm('¿Borrar todos los datos del formulario? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.data = {}; state.estudiantes = []; state.noPart = [];
  state.reglas = [...REGLAS_DEFAULT];
  state.evalCrits = CRITERIOS_EVAL.map(c => ({ criterio: c, val:'', com:'' }));
  $$('[data-field]').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    else el.value = '';
  });
  // re-aplicar valores por defecto
  Object.entries(ESCUELA_DEFAULT).forEach(([k,v]) => {
    state.data[k] = v;
    const el = $(`[data-field="${k}"]`); if (el) el.value = v;
  });
  renderEstudiantes(); renderNoPart(); renderReglas(); renderEval();
  recalc(); updateProgress();
  toast('🗑️ Formulario limpiado', 'success');
}

// ── TEMA ────────────────────────────────────────
function applyTheme(mode) {
  const isDark = mode === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('pcb_excursion_theme', isDark ? 'dark' : 'light');
}
function initTheme() {
  const saved = localStorage.getItem('pcb_excursion_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  const btn = document.getElementById('btnTheme');
  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
}

// ── INIT ────────────────────────────────────────
function init() {
  initTabs(); initTheme(); bindFields();

  // valores por defecto de escuela
  Object.entries(ESCUELA_DEFAULT).forEach(([k,v]) => { state.data[k] = v; });
  applyFields();

  renderEstudiantes(); renderNoPart(); renderReglas(); renderEval();

  // intenta cargar borrador silenciosamente
  loadDraft(true);
  recalc(); updateProgress();

  // botones
  $('#btnSaveDraft')?.addEventListener('click', () => saveDraft());
  $('#btnLoadDraft')?.addEventListener('click', () => loadDraft());
  $('#btnClearDraft')?.addEventListener('click', clearDraft);
  $('#btnAddNoPart')?.addEventListener('click', addNoPart);
  $('#btnAddEstudiante')?.addEventListener('click', addEstudiante);
  $('#btnClearEstudiantes')?.addEventListener('click', () => {
    if (!confirm('¿Vaciar la lista completa de estudiantes?')) return;
    state.estudiantes = [];
    renderEstudiantes(); recalc(); updateProgress(); scheduleAutoSave();
  });
  $('#btnImportEstudiantes')?.addEventListener('click', () => {
    const box = $('#importBox');
    if (box) box.style.display = (box.style.display === 'none' ? 'block' : 'none');
  });
  $('#btnDoImport')?.addEventListener('click', () => {
    const txt = $('#importTextarea').value.trim();
    if (!txt) { toast('Pegue datos primero', 'error'); return; }
    importarEstudiantes(txt);
    $('#importTextarea').value = '';
    $('#importBox').style.display = 'none';
  });
  $('#btnCancelImport')?.addEventListener('click', () => {
    $('#importBox').style.display = 'none';
    $('#importTextarea').value = '';
  });

  $('#btnPreview')?.addEventListener('click', previewPDF);
  $('#btnPrint')?.addEventListener('click', printPDF);
  $('#btnExportPDF')?.addEventListener('click', exportPDF);
}

// ════════════════════════════════════════════════
// GENERACIÓN DE DOCUMENTO PDF (HOJAS LEGALES)
// ════════════════════════════════════════════════
function val(k) { return escapeHtml(state.data[k] ?? ''); }
function chk(k) { return state.data[k] ? '✓' : ''; }

function pageHeader(anejoLabel) {
  return `
    <div class="pdf-anejo-label">${anejoLabel || ''}</div>
    <div class="pdf-header">
      <h1>Estado Libre Asociado de Puerto Rico</h1>
      <h1>Departamento de Educación</h1>
      <p>Oficina Regional Educativa de Caguas</p>
      <h2>${val('escuela') || 'Escuela __________________'}</h2>
      <p>Código: ${val('codigo')} &nbsp;·&nbsp; Municipio: ${val('municipio')} &nbsp;·&nbsp; Tel.: ${val('telefono')}</p>
    </div>`;
}

function pageAnejo1() {
  const props = [
    ['propConceptos','Desarrollar conceptos y destrezas de la materia'],
    ['propExperiencias','Proveer experiencias educativas adicionales para enriquecer el aprendizaje'],
    ['propValores','Desarrollar valores y concienciar sobre temas sociales, culturales, éticos y ambientales'],
    ['propOtros','Otros']
  ].map(([k,t]) => `<span class="pdf-check"><span class="box">${chk(k)}</span>${t}</span>`).join(' ');
  const fondos = [
    ['fondoPresupuesto','Presupuesto escolar'],
    ['fondoPrivados','Privados'], ['fondoPadres','Padres'],
    ['fondoAuspicio','Organización o empresa auspiciadora'], ['fondoNA','N/A']
  ].map(([k,t]) => `<span class="pdf-check"><span class="box">${chk(k)}</span>${t}</span>`).join(' ');

  return `<div class="pdf-page">
    ${pageHeader('Anejo 1')}
    <div class="pdf-section-title">Solicitud de Autorización para Actividad Educativa</div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Fecha de la solicitud:</span> <span class="val">${fmtDate(state.data.fechaSolicitud)}</span></div>
      <div class="pdf-field"><span class="lbl">Tipo de actividad:</span> <span class="val">${val('tipoActividad')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Programa:</span> <span class="val">${val('programa')}</span></div>
      <div class="pdf-field"><span class="lbl">Cantidad de estudiantes:</span> <span class="val">${val('cantEstudiantes')}</span></div>
      <div class="pdf-field"><span class="lbl">Maestros:</span> <span class="val">${val('cantMaestros')}</span></div>
      <div class="pdf-field"><span class="lbl">Padres:</span> <span class="val">${val('cantPadres')}</span></div>
      <div class="pdf-field"><span class="lbl">Otros:</span> <span class="val">${val('cantOtros')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field full"><span class="lbl">Lugar de la actividad:</span> <span class="val">${val('lugarActividad')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Fecha de la actividad:</span> <span class="val">${fmtDate(state.data.fechaActividad)}</span></div>
      <div class="pdf-field"><span class="lbl">Hora de salida:</span> <span class="val">${val('horaSalida')}</span></div>
      <div class="pdf-field"><span class="lbl">Hora de regreso:</span> <span class="val">${val('horaRegreso')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field full"><span class="lbl">Lugar del almuerzo:</span> <span class="val">${val('lugarAlmuerzo')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field full"><span class="lbl">Personalidad reconocida que participará:</span> <span class="val">${val('personalidad')}</span></div>
    </div>

    <div class="pdf-section-title">Propósito de la actividad</div>
    <div>${props}</div>
    ${state.data.propOtros ? `<div style="margin-top:4px;"><span class="lbl">Especifique:</span> <span class="val">${val('propOtrosTexto')}</span></div>` : ''}

    <div class="pdf-section-title">Fondos que costearán la actividad</div>
    <div>${fondos}</div>

    <div class="pdf-section-title">Transportación</div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Cant. guaguas:</span> <span class="val">${val('cantGuaguas')}</span></div>
      <div class="pdf-field"><span class="lbl">Costo por guagua:</span> <span class="val">$${val('costoGuagua')}</span></div>
      <div class="pdf-field"><span class="lbl">Total transporte:</span> <span class="val">$${val('totalTransporte')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Transportista:</span> <span class="val">${val('transportista')}</span></div>
      <div class="pdf-field"><span class="lbl">Tel.:</span> <span class="val">${val('telTransportista')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Cant. boletos:</span> <span class="val">${val('cantBoletos')}</span></div>
      <div class="pdf-field"><span class="lbl">Costo por boleto:</span> <span class="val">$${val('costoBoleto')}</span></div>
      <div class="pdf-field"><span class="lbl">Total boletos:</span> <span class="val">$${val('totalBoletos')}</span></div>
    </div>

    <div class="pdf-signature-row">
      <div class="pdf-signature">
        <div class="line">${val('firmaDirector') ? val('solicitante') : ''}</div>
        <div><strong>${val('solicitante')}</strong> · ${val('puesto')}</div>
        <div>Persona que solicita autorización</div>
      </div>
      <div class="pdf-signature">
        <div class="line">${val('firmaDirector')}</div>
        <div><strong>${val('director')}</strong></div>
        <div>Director(a) Escolar</div>
      </div>
    </div>
  </div>`;
}

function pageAnejo2() {
  return `<div class="pdf-page">
    ${pageHeader('Anejo 2')}
    <div class="pdf-section-title">Plan Académico de la Actividad</div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Persona que solicita:</span> <span class="val">${val('acaSolicita') || val('solicitante')}</span></div>
      <div class="pdf-field"><span class="lbl">Grados:</span> <span class="val">${val('acaGrados')}</span></div>
      <div class="pdf-field"><span class="lbl">Estudiantes impactados:</span> <span class="val">${val('acaImpactados')}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field"><span class="lbl">Materia:</span> <span class="val">${val('acaMateria')}</span></div>
      <div class="pdf-field"><span class="lbl">Fecha:</span> <span class="val">${fmtDate(state.data.acaFecha)}</span></div>
    </div>
    <div class="pdf-row">
      <div class="pdf-field full"><span class="lbl">Lugar de la actividad:</span> <span class="val">${val('acaLugar') || val('lugarActividad')}</span></div>
    </div>
    <div class="pdf-block">
      <span class="lbl">Estándares e indicadores a desarrollarse:</span>
      ${escapeHtml(state.data.acaEstandares || '')}
    </div>
    <div class="pdf-block" style="min-height:120px;">
      <span class="lbl">Objetivo (conducta observable y medible):</span>
      ${escapeHtml(state.data.acaObjetivo || '')}
    </div>
  </div>`;
}

function pageAnejo3() {
  return `<div class="pdf-page">
    ${pageHeader('Anejo 3')}
    <div class="pdf-section-title">Actividades Antes y Durante la Actividad</div>
    <div class="pdf-block" style="min-height:200px;">
      <span class="lbl">Actividades ANTES de la actividad:</span>
      ${escapeHtml(state.data.actAntes || '')}
    </div>
    <div class="pdf-block" style="min-height:200px;">
      <span class="lbl">Actividades DURANTE la actividad:</span>
      ${escapeHtml(state.data.actDurante || '')}
    </div>
  </div>`;
}

function pageAnejo4() {
  const noPartRows = state.noPart.length
    ? state.noPart.map(r => `<tr><td>${escapeHtml(r.actividad)}</td><td>${escapeHtml(r.lugar)}</td><td>${escapeHtml(r.recurso)}</td></tr>`).join('')
    : '<tr><td colspan="3" style="height:40px;text-align:center;color:#666;">— Sin estudiantes alternos —</td></tr>';
  return `<div class="pdf-page">
    ${pageHeader('Anejo 4')}
    <div class="pdf-section-title">Actividades DESPUÉS de la Actividad</div>
    <div class="pdf-block" style="min-height:180px;">
      <span class="lbl">Seguimiento posterior:</span>
      ${escapeHtml(state.data.actDespues || '')}
    </div>
    <div class="pdf-section-title">Plan para Estudiantes que NO Participarán</div>
    <table class="pdf-table">
      <thead><tr><th style="width:40%;">Actividad</th><th style="width:30%;">Lugar</th><th style="width:30%;">Maestro o recurso</th></tr></thead>
      <tbody>${noPartRows}</tbody>
    </table>
  </div>`;
}

function pageAnejo5() {
  const rows = state.reglas.map((r,i) =>
    `<tr><td class="center" style="width:40px;">${i+1}</td><td>${escapeHtml(r)}</td></tr>`
  ).join('');
  return `<div class="pdf-page">
    ${pageHeader('Anejo 5')}
    <div class="pdf-section-title">Reglas de Seguridad</div>
    <p style="font-size:10pt;">Las siguientes reglas de seguridad se aplicarán durante la actividad y deberán ser conocidas y aceptadas por todos los participantes:</p>
    <table class="pdf-table">
      <thead><tr><th style="width:40px;">#</th><th>Regla</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="pdf-signature-row">
      <div class="pdf-signature">
        <div class="line">${val('firmaDirector')}</div>
        <div><strong>${val('director')}</strong></div>
        <div>Director(a) Escolar</div>
      </div>
    </div>
  </div>`;
}

function pageAnejo6() {
  if (state.estudiantes.length === 0) {
    return `<div class="pdf-page">
      ${pageHeader('Anejo 6')}
      <div class="pdf-section-title">Lista de Estudiantes Participantes</div>
      <p style="text-align:center; padding:30px; color:#666;">— No se han añadido estudiantes a la lista —</p>
    </div>`;
  }
  const PER_PAGE = 30;
  const pages = [];
  for (let p = 0; p < state.estudiantes.length; p += PER_PAGE) {
    const chunk = state.estudiantes.slice(p, p + PER_PAGE);
    const rows = chunk.map((s,i) => `
      <tr>
        <td class="center">${p+i+1}</td>
        <td>${escapeHtml(s.nombre)}</td>
        <td class="center">${escapeHtml(s.grado)}</td>
        <td class="center">${escapeHtml(s.grupo)}</td>
        <td>${escapeHtml(s.encargado)}</td>
        <td>${escapeHtml(s.telefono)}</td>
      </tr>`).join('');
    const pageNum = Math.floor(p/PER_PAGE) + 1;
    const totalPages = Math.ceil(state.estudiantes.length / PER_PAGE);
    pages.push(`<div class="pdf-page">
      ${pageHeader('Anejo 6')}
      <div class="pdf-section-title">Lista de Estudiantes Participantes (${pageNum}/${totalPages})</div>
      <table class="pdf-table">
        <thead><tr>
          <th style="width:35px;">#</th><th>Nombre del estudiante</th>
          <th style="width:55px;">Grado</th><th style="width:55px;">Grupo</th>
          <th>Encargado</th><th style="width:110px;">Teléfono</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`);
  }
  return pages.join('');
}

function pageAnejo7() {
  const rows = state.evalCrits.map((c,i) => `
    <tr>
      <td>${i+1}. ${escapeHtml(c.criterio)}</td>
      <td class="center">${c.val==='cumple'?'✓':''}</td>
      <td class="center">${c.val==='nocumple'?'✓':''}</td>
      <td class="center">${c.val==='na'?'✓':''}</td>
      <td>${escapeHtml(c.com)}</td>
    </tr>`).join('');
  const resultado = state.data.evalResultado === 'autorizada' ? 'AUTORIZADA'
                  : state.data.evalResultado === 'no_autorizada' ? 'NO AUTORIZADA' : '__________';
  return `<div class="pdf-page">
    ${pageHeader('Anejo 7')}
    <div class="pdf-section-title">Hoja de Evaluación de la Solicitud</div>
    <table class="pdf-table">
      <thead><tr>
        <th style="width:50%;">Criterio</th>
        <th style="width:55px;">Cumple</th>
        <th style="width:55px;">No cumple</th>
        <th style="width:45px;">N/A</th>
        <th>Comentarios</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="pdf-block">
      <span class="lbl">Comentarios generales:</span>
      ${escapeHtml(state.data.evalComentarios || '')}
    </div>
    <div style="font-size:11pt; margin: 12px 0 6px;"><strong>Resultado de la evaluación:</strong> ${resultado}</div>
    <div class="pdf-signature-row">
      <div class="pdf-signature">
        <div class="line">${val('evalFirma')}</div>
        <div><strong>${val('evalNombre')}</strong> · ${val('evalPuesto')}</div>
        <div>Evaluador(a) — Fecha: ${fmtDate(state.data.evalFecha)}</div>
      </div>
    </div>
  </div>`;
}

function pageAnejo8_permisos() {
  // Un permiso por estudiante (Anejo 8). Dos por página para ahorrar papel.
  if (state.estudiantes.length === 0) return '';
  const permiso = (s) => `
    <div style="border:1.2px solid #000; padding:12px 14px; margin-bottom:12px; min-height:300px;">
      <div style="text-align:center; font-weight:bold; font-size:11pt; margin-bottom:6px;">PERMISO DE SALIDA</div>
      <p style="font-size:10pt; line-height:1.5;">
        Yo, <span class="val" style="min-width:220px;">${escapeHtml(s.encargado)}</span>,
        padre/madre o encargado del/la estudiante
        <span class="val" style="min-width:220px;">${escapeHtml(s.nombre)}</span>
        del grado <span class="val" style="min-width:40px;">${escapeHtml(s.grado)}</span>,
        grupo <span class="val" style="min-width:40px;">${escapeHtml(s.grupo)}</span>,
        de la escuela <strong>${val('escuela')}</strong>,
        <strong>autorizo</strong> a mi hijo(a) a participar en la actividad educativa
        "<strong>${val('tipoActividad')}</strong>" que se llevará a cabo en
        <strong>${val('lugarActividad')}</strong> el día
        <strong>${fmtDate(state.data.fechaActividad)}</strong>,
        con hora de salida a las <strong>${val('horaSalida')}</strong>
        y regreso a las <strong>${val('horaRegreso')}</strong>.
      </p>
      <p style="font-size:10pt;">Teléfono de contacto: <span class="val" style="min-width:160px;">${escapeHtml(s.telefono)}</span></p>
      <div class="pdf-signature-row" style="margin-top:30px;">
        <div class="pdf-signature">
          <div class="line"></div>
          <div>Firma del padre, madre o encargado</div>
        </div>
        <div class="pdf-signature">
          <div class="line"></div>
          <div>Fecha</div>
        </div>
      </div>
    </div>`;
  const pages = [];
  for (let i = 0; i < state.estudiantes.length; i += 2) {
    const a = state.estudiantes[i];
    const b = state.estudiantes[i+1];
    pages.push(`<div class="pdf-page">
      ${pageHeader('Anejo 8 — Permisos individuales')}
      ${permiso(a)}
      ${b ? permiso(b) : ''}
    </div>`);
  }
  return pages.join('');
}

function pageAnejo9_relevos() {
  if (state.estudiantes.length === 0) return '';
  const relevo = (s) => `
    <div style="border:1.2px solid #000; padding:12px 14px; margin-bottom:12px; min-height:300px;">
      <div style="text-align:center; font-weight:bold; font-size:11pt; margin-bottom:6px;">RELEVO DE RESPONSABILIDAD</div>
      <p style="font-size:10pt; line-height:1.5; text-align:justify;">
        Yo, <span class="val" style="min-width:220px;">${escapeHtml(s.encargado)}</span>,
        padre/madre o encargado del/la estudiante
        <span class="val" style="min-width:220px;">${escapeHtml(s.nombre)}</span>,
        grado <span class="val" style="min-width:40px;">${escapeHtml(s.grado)}</span>,
        grupo <span class="val" style="min-width:40px;">${escapeHtml(s.grupo)}</span>,
        de la <strong>${val('escuela')}</strong>, mediante la firma de este documento
        <strong>relevo</strong> al Departamento de Educación de Puerto Rico, a la escuela,
        a su personal docente y administrativo, y al transportista contratado, de toda
        responsabilidad por accidentes, lesiones, pérdidas o daños que pudieran ocurrir
        durante la actividad "<strong>${val('tipoActividad')}</strong>", el día
        <strong>${fmtDate(state.data.fechaActividad)}</strong> en
        <strong>${val('lugarActividad')}</strong>, siempre que se hayan tomado las
        precauciones razonables y se hayan cumplido las reglas de seguridad establecidas.
      </p>
      <div class="pdf-signature-row" style="margin-top:30px;">
        <div class="pdf-signature">
          <div class="line"></div>
          <div>Firma del padre, madre o encargado</div>
        </div>
        <div class="pdf-signature">
          <div class="line"></div>
          <div>Fecha</div>
        </div>
      </div>
    </div>`;
  const pages = [];
  for (let i = 0; i < state.estudiantes.length; i += 2) {
    const a = state.estudiantes[i];
    const b = state.estudiantes[i+1];
    pages.push(`<div class="pdf-page">
      ${pageHeader('Anejo 9 — Relevos individuales')}
      ${relevo(a)}
      ${b ? relevo(b) : ''}
    </div>`);
  }
  return pages.join('');
}

function buildPDFDocument() {
  readFields();
  return `<div class="pdf-document">
    ${pageAnejo1()}
    ${pageAnejo2()}
    ${pageAnejo3()}
    ${pageAnejo4()}
    ${pageAnejo5()}
    ${pageAnejo6()}
    ${pageAnejo7()}
    ${pageAnejo8_permisos()}
    ${pageAnejo9_relevos()}
  </div>`;
}

function previewPDF() {
  const html = buildPDFDocument();
  const win = window.open('', '_blank');
  if (!win) { toast('⚠️ El navegador bloqueó la ventana emergente', 'error'); return; }
  // copia los estilos al popup
  const styles = Array.from(document.styleSheets)
    .map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join(''); } catch(e) { return ''; } })
    .join('');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Vista previa — Formulario de Excursión</title>
    <style>${styles} body{background:#e7eaf0; padding:20px;} .pdf-page{box-shadow:0 4px 20px rgba(0,0,0,.15); margin:0 auto 20px; background:#fff;}</style>
    </head><body>${html}</body></html>`);
  win.document.close();
}

function printPDF() {
  const root = $('#pdfRoot');
  root.innerHTML = buildPDFDocument();
  root.style.position = 'static';
  root.style.left = '0';
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      root.style.position = 'absolute';
      root.style.left = '-9999px';
      root.innerHTML = '';
    }, 500);
  }, 100);
}

async function exportPDF() {
  const btn = $('#btnExportPDF');
  if (typeof html2pdf === 'undefined') {
    toast('⚠️ La librería de PDF aún no carga, intente de nuevo', 'error');
    return;
  }
  if (!state.data.tipoActividad || !state.data.lugarActividad || !state.data.fechaActividad) {
    if (!confirm('Hay campos obligatorios sin completar (tipo, lugar o fecha de actividad). ¿Desea exportar de todas formas?')) return;
  }
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '⏳ Generando PDF…';
  toast('⏳ Generando PDF, por favor espere…');

  const root = $('#pdfRoot');
  root.innerHTML = buildPDFDocument();

  const filename = `Formulario-Excursion-${(state.data.fechaActividad || 'borrador')}.pdf`;
  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF: { unit: 'in', format: 'legal', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page' }
  };

  try {
    await html2pdf().set(opt).from(root.firstElementChild).save();
    toast('✅ PDF generado correctamente', 'success');
  } catch (e) {
    console.error(e);
    toast('❌ Error al generar PDF: ' + (e.message || e), 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
    root.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', init);
