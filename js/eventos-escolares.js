/**
 * ================================================================
 * CONFIGURACIÓN DE EVENTOS ESCOLARES - PCB 2026
 * ================================================================
 * Este archivo contiene todos los eventos escolares.
 * Para agregar, modificar o eliminar eventos, simplemente edita
 * el array 'EVENTOS_ESCOLARES' más abajo.
 * 
 * FORMATO DE CADA EVENTO:
 * {
 *   fecha: "YYYY-MM-DD",              // Fecha en formato ISO
 *   titulo: "Título del evento",       // Título visible
 *   descripcion: "Descripción",        // Descripción (opcional)
 *   tipo: "feriado" | "receso" | "actividad" | "evaluacion" | "importante"
 * }
 * 
 * TIPOS DISPONIBLES:
 * - "feriado"      : Días festivos (🎉 morado)
 * - "receso"       : Recesos académicos (🏖️ cyan)
 * - "actividad"    : Actividades escolares (📅 azul)
 * - "evaluacion"   : Exams, pruebas (📝 naranja)
 * - "importante"   : Eventos importantes (⭐ rosa)
 * ================================================================
 */

const EVENTOS_ESCOLARES = [
  // === ABRIL 2026 ===
  { 
    fecha: "2026-04-02", 
    titulo: "Receso Académico", 
    descripcion: "Receso para personal docente y no docente", 
    tipo: "receso" 
  },
  { 
    fecha: "2026-04-03", 
    titulo: "Feriado - Viernes Santo", 
    descripcion: "No hay clases", 
    tipo: "feriado" 
  },
  { 
    fecha: "2026-04-13", 
    titulo: "Inicio de Assessment", 
    descripcion: "Período de evaluaciones académicas", 
    tipo: "evaluacion" 
  },
  
  // === MAYO 2026 ===
  { 
    fecha: "2026-05-07", 
    titulo: "Fin de Assessment", 
    descripcion: "Último día de evaluaciones", 
    tipo: "evaluacion" 
  },
  { 
    fecha: "2026-05-18", 
    titulo: "Semana de la Educación", 
    descripcion: "Celebración de la Semana de la Educación", 
    tipo: "actividad" 
  },
  { 
    fecha: "2026-05-22", 
    titulo: "Receso Académico", 
    descripcion: "Receso para personal docente y no docente", 
    tipo: "receso" 
  },
  { 
    fecha: "2026-05-25", 
    titulo: "Feriado", 
    descripcion: "Día Festivo", 
    tipo: "feriado" 
  },
  { 
    fecha: "2026-05-26", 
    titulo: "Evaluaciones Finales", 
    descripcion: "Período de evaluaciones finales", 
    tipo: "evaluacion" 
  },
  { 
    fecha: "2026-05-27", 
    titulo: "Evaluaciones Finales", 
    descripcion: "Período de evaluaciones finales", 
    tipo: "evaluacion" 
  },
  { 
    fecha: "2026-05-29", 
    titulo: "Entrega de Informe", 
    descripcion: "Entrega del informe de progreso académico en la escuela", 
    tipo: "importante" 
  },
  
  // =====================================================
  // === AGREGAR NUEVOS EVENTOS AQUÍ ABAJO ===
  // =====================================================
  // Formato:
  // { fecha: "2026-MM-DD", titulo: "Nombre", descripcion: "Descripción", tipo: "tipo" }
  //
  // Ejemplos:
  // { fecha: "2026-06-15", titulo: "Graduación 2026", descripcion: "Ceremonia de graduación", tipo: "importante" }
  // { fecha: "2026-07-04", titulo: "Día de la Independencia", descripcion: "Feriado", tipo: "feriado" }
  // =====================================================
];

// Funciones del sistema (no editar a menos que seas desarrollador)
function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  const diaSemana = diasSemana[fecha.getDay()];
  return `${diaSemana}, ${dia} de ${mes}, ${año}`;
}

function obtenerDiasRestantes(fechaStr) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaEvento = new Date(fechaStr + 'T00:00:00');
  const diffTime = fechaEvento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getTipoBadge(tipo, diasRestantes) {
  if (diasRestantes < 0) {
    return { clase: 'badge-past', texto: 'Pasado' };
  } else if (diasRestantes === 0) {
    return { clase: 'badge-today', texto: '¡HOY!' };
  } else if (diasRestantes === 1) {
    return { clase: 'badge-soon', texto: '¡Mañana!' };
  } else if (diasRestantes <= 7) {
    return { clase: 'badge-week', texto: `En ${diasRestantes} días` };
  }
  
  switch(tipo) {
    case 'feriado': return { clase: 'badge-holiday', texto: 'Feriado' };
    case 'receso': return { clase: 'badge-break', texto: 'Receso' };
    case 'evaluacion': return { clase: 'badge-exam', texto: 'Evaluación' };
    case 'importante': return { clase: 'badge-important', texto: 'Importante' };
    default: return { clase: 'badge-activity', texto: 'Actividad' };
  }
}

function getIconoTipo(tipo) {
  switch(tipo) {
    case 'feriado': return '🎉';
    case 'receso': return '🏖️';
    case 'evaluacion': return '📝';
    case 'importante': return '⭐';
    default: return '📅';
  }
}

function cargarEventosDinamicos() {
  const listaEventos = document.getElementById('event-list-dinamico');
  if (!listaEventos) return;
  
  // Filtrar SOLO eventos futuros (días restantes >= 0)
  const eventosFiltrados = EVENTOS_ESCOLARES.filter(evento => {
    const diasRestantes = obtenerDiasRestantes(evento.fecha);
    return diasRestantes >= 0; // Solo eventos futuros
  });
  
  // Ordenar por fecha (más cercanos primero)
  eventosFiltrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  
  // Limpiar lista
  listaEventos.innerHTML = '';
  
  if (eventosFiltrados.length === 0) {
    listaEventos.innerHTML = '<li style="color: #888; font-style: italic; padding: 1rem;">No hay eventos próximos programados</li>';
    return;
  }
  
  // Mostrar máximo 3 eventos más cercanos
  const eventosAMostrar = eventosFiltrados.slice(0, 3);
  
  eventosAMostrar.forEach(evento => {
    const li = document.createElement('li');
    const diasRestantes = obtenerDiasRestantes(evento.fecha);
    const badge = getTipoBadge(evento.tipo, diasRestantes);
    const icono = getIconoTipo(evento.tipo);
    
    li.innerHTML = `
      <div class="event-card-dinamico ${diasRestantes <= 1 ? 'event-urgent' : ''}">
        <div class="event-header">
          <span class="event-icon">${icono}</span>
          <span class="event-date">${formatearFecha(evento.fecha)}</span>
          <span class="event-badge ${badge.clase}">${badge.texto}</span>
        </div>
        <div class="event-content">
          <strong>${evento.titulo}</strong>
          ${evento.descripcion ? `<p>${evento.descripcion}</p>` : ''}
        </div>
      </div>
    `;
    
    listaEventos.appendChild(li);
  });
}

// Cargar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarEventosDinamicos);
