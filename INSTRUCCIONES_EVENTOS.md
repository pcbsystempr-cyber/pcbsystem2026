# 📅 Sistema de Eventos Automático - PCB

Este sistema permite mostrar eventos escolares que se actualizan automáticamente según la fecha actual.

## 📁 Archivos relacionados

- **`js/eventos-escolares.js`** - Archivo donde están todos los eventos
- **`index.html`** - Página principal donde aparecen los eventos

## ➕ Cómo agregar un nuevo evento

1. Abre el archivo **`js/eventos-escolares.js`**
2. Busca el array `EVENTOS_ESCOLARES`
3. Agrega un nuevo evento siguiendo este formato:

```javascript
{ 
  fecha: "2026-06-15", 
  titulo: "Graduación 2026", 
  descripcion: "Ceremonia de graduación de la Clase 2026", 
  tipo: "importante" 
}
```

4. Guarda el archivo

## 📝 Formato de cada evento

Cada evento tiene 4 propiedades:

| Propiedad | Descripción | Ejemplo |
|-----------|-------------|---------|
| `fecha` | Fecha del evento en formato YYYY-MM-DD | `"2026-06-15"` |
| `titulo` | Título visible del evento | `"Graduación 2026"` |
| `descripcion` | Descripción opcional | `"Ceremonia de graduación"` |
| `tipo` | Categoría del evento | `"importante"` |

## 🏷️ Tipos de eventos disponibles

| Tipo | Color | Icono | Uso |
|------|-------|-------|-----|
| `feriado` | Morado | 🎉 | Días festivos |
| `receso` | Cyan | 🏖️ | Recesos académicos |
| `actividad` | Azul | 📅 | Actividades escolares |
| `evaluacion` | Naranja | 📝 | Exams, pruebas |
| `importante` | Rosa | ⭐ | Eventos importantes |

## 🎨 Badges automáticos

El sistema agrega badges automáticos según la proximidad del evento:

| Badge | Significado |
|-------|-------------|
| **¡HOY!** | El evento es hoy (rojo, parpadea) |
| **¡Mañana!** | El evento es mañana (naranja) |
| **En X días** | Faltan menos de 7 días (verde) |
| **Pasado** | El evento ya pasó (gris) |

## ✨ Características

- **Ordenamiento automático**: Los eventos se muestran del más cercano al más lejano
- **Filtro automático**: Solo muestra eventos futuros (cuando pasa uno, automáticamente aparece el siguiente)
- **Máximo 3 eventos**: Siempre muestra los 3 eventos más cercanos
- **Actualización automática**: Cuando un evento pasa, se elimina y aparece el siguiente
- **Responsive**: Funciona en móvil y escritorio
- **Dark Mode**: Compatible con el modo oscuro

## 📋 Ejemplo completo

```javascript
const EVENTOS_ESCOLARES = [
  // Abril 2026
  { fecha: "2026-04-02", titulo: "Receso Académico", descripcion: "Receso para personal docente", tipo: "receso" },
  { fecha: "2026-04-03", titulo: "Feriado - Viernes Santo", descripcion: "No hay clases", tipo: "feriado" },
  
  // Mayo 2026
  { fecha: "2026-05-18", titulo: "Semana de la Educación", descripcion: "Celebración especial", tipo: "actividad" },
  { fecha: "2026-05-29", titulo: "Entrega de Informe", descripcion: "Informe de progreso académico", tipo: "importante" },
  
  // 👇 AGREGAR NUEVOS EVENTOS AQUÍ
  { fecha: "2026-06-15", titulo: "Graduación", descripcion: "Ceremonia de graduación", tipo: "importante" }
];
```

## ⚠️ Notas importantes

1. **Formato de fecha**: Siempre usar `YYYY-MM-DD` (año-mes-día)
2. **Orden**: Los eventos se ordenan solos, no importa el orden en que los escribas
3. **Guardar**: Después de modificar, guarda el archivo y actualiza la página
4. **Revisar**: Verifica que los eventos aparezcan correctamente en la página
