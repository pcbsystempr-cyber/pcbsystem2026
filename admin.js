// Admin Dashboard JavaScript
(function () {
  'use strict';

  // Configuration
  const SECTIONS = {
    dashboard: {
      title: 'Dashboard General',
      folder: null,
      page: null
    },
    comedor: {
      title: 'Gestión de Comedor',
      folder: 'galeriacomedor',
      page: 'comedor.html'
    },
    promociones: {
      title: 'Gestión de Promociones',
      folder: 'galeriadepromociones',
      page: 'promociones.html'
    },
    avisos: {
      title: 'Gestión de Avisos',
      folder: 'Avisos',
      page: 'promociones.html'
    },
    bot: {
      title: 'Configuración del Bot de Avisos',
      folder: null,
      page: null
    },
    novedades: {
      title: 'Gestión de Novedades',
      folder: null,
      page: null
    },
    talleres: {
      title: 'Talleres para Padres',
      folder: null,
      page: 'talleres-padres.html'
    },
    certificaciones: {
      title: 'Certificaciones Online',
      folder: null,
      page: 'certificaciones-padres.html'
    },
    anuncios_comunidad: {
      title: 'Anuncios de la Comunidad',
      folder: null,
      page: null
    }
  };

  // Secciones planeadas para próximas etapas (placeholder "Próximamente").
  // Cada entrada define el título y subtítulo que se muestran en el topbar.
  const PROXIMAMENTE = {
    publicaciones_todas:    { title: 'Todas las publicaciones',    subtitle: 'Vista unificada de todas las publicaciones del sistema',                  icon: '📂' },
    publicaciones_crear:    { title: 'Crear publicación',          subtitle: 'Formulario inteligente único para todas las categorías',                 icon: '➕' },
    biblioteca:             { title: 'Biblioteca',                 subtitle: 'Gestión del catálogo y recursos de la biblioteca escolar',               icon: '📚' },
    reservas:               { title: 'Reservas',                   subtitle: 'Reservas de libros, salones y equipos',                                  icon: '📅' },
    alertas:                { title: 'Alertas',                    subtitle: 'Configuración de alertas urgentes y de emergencia',                      icon: '🚨' },
    popup_principal:        { title: 'Popup Principal',            subtitle: 'Configura qué se muestra en el popup del portal público',                icon: '💬' },
    notificaciones:         { title: 'Notificaciones',             subtitle: 'Envío y bandeja de notificaciones a usuarios',                           icon: '📲' },
    usuarios:               { title: 'Usuarios',                   subtitle: 'Gestión de cuentas administrativas y de personal',                       icon: '👥' },
    roles:                  { title: 'Roles y permisos',           subtitle: 'Definición de roles (Director, Maestro, Bibliotecario, etc.)',          icon: '🛡️' },
    configuracion:          { title: 'Configuración del portal',   subtitle: 'Parámetros generales del portal PCBSystem',                              icon: '⚙️' },
    idioma_tema:            { title: 'Idioma y tema visual',       subtitle: 'Preferencias de idioma y modo claro/oscuro por defecto',                 icon: '🌐' },
    exportar:               { title: 'Exportar datos',             subtitle: 'Descarga de datos en JSON, CSV o copias de seguridad',                   icon: '📤' },
    reporte_actividad:      { title: 'Actividad del sistema',      subtitle: 'Auditoría y registro de eventos administrativos',                        icon: '📊' },
    reporte_publicaciones:  { title: 'Publicaciones más vistas',   subtitle: 'Métricas de visualización por publicación',                              icon: '🔥' },
    reporte_servicios:      { title: 'Servicios más usados',       subtitle: 'Estadísticas de uso por módulo y servicio',                              icon: '🚀' },
    historial:              { title: 'Historial de cambios',       subtitle: 'Bitácora de cambios y versiones de contenido',                           icon: '📜' }
  };

  // State
  let currentSection = 'dashboard';
  let contentData = {};
  let imageToDelete = null;
  let recToEditIndex = null;
  let newsToEditId = null;
  let botItemToEdit = null;
  let galleryItemToEdit = null; // { id, folder } of gallery item being edited

  // DOM Elements
  const navButtons = document.querySelectorAll('.nav-btn');
  const sectionTitle = document.getElementById('sectionTitle');
  const btnAddImage = document.getElementById('btnAddImage');
  const btnEditMenu = document.getElementById('btnEditMenu');
  const btnExportData = document.getElementById('btnExportData');
  const uploadSection = document.getElementById('uploadSection');
  const menuEditorSection = document.getElementById('menuEditorSection');
  const uploadForm = document.getElementById('uploadForm');
  const menuForm = document.getElementById('menuForm');
  const btnCancelUpload = document.getElementById('btnCancelUpload');
  const btnCancelMenu = document.getElementById('btnCancelMenu');
  const imageFile = document.getElementById('imageFile');
  const imageUrl = document.getElementById('imageUrl');
  const filePreview = document.getElementById('filePreview');
  const urlPreview = document.getElementById('urlPreview');
  const desayunoItems = document.getElementById('desayunoItems');
  const almuerzoItems = document.getElementById('almuerzoItems');
  const galleryGrid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('emptyState');
  const deleteModal = document.getElementById('deleteModal');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const btnCancelDelete = document.getElementById('btnCancelDelete');
  const botConfigSection = document.getElementById('botConfigSection');
  const novedadesSection = document.getElementById('novedadesSection');
  const anunciosComunidadSection = document.getElementById('anunciosComunidadSection');
  const botItemsList = document.getElementById('botItemsList');
  const btnSaveBotConfig = document.getElementById('btnSaveBotConfig');

  // Edit news modal
  const editNewsModal = document.getElementById('editNewsModal');
  const editNewsTitle = document.getElementById('editNewsTitle');
  const editNewsMessage = document.getElementById('editNewsMessage');
  const editNewsImageUrl = document.getElementById('editNewsImageUrl');
  const btnSaveNewsEdit = document.getElementById('btnSaveNewsEdit');
  const btnCancelNewsEdit = document.getElementById('btnCancelNewsEdit');

  // Edit gallery item modal
  const editGalleryItemModal = document.getElementById('editGalleryItemModal');
  const editGalleryTitle = document.getElementById('editGalleryTitle');
  const editGalleryDesc = document.getElementById('editGalleryDesc');
  const editGalleryImgPreview = document.getElementById('editGalleryImgPreview');
  const editGalleryImgFile = document.getElementById('editGalleryImgFile');
  const btnSaveGalleryEdit = document.getElementById('btnSaveGalleryEdit');
  const btnCancelGalleryEdit = document.getElementById('btnCancelGalleryEdit');

  // Edit bot item modal
  const editBotItemModal = document.getElementById('editBotItemModal');
  const editBotTitle = document.getElementById('editBotTitle');
  const editBotDesc = document.getElementById('editBotDesc');
  const editBotImgPreview = document.getElementById('editBotImgPreview');
  const editBotImgFile = document.getElementById('editBotImgFile');
  const btnSaveBotItemEdit = document.getElementById('btnSaveBotItemEdit');
  const btnCancelBotItemEdit = document.getElementById('btnCancelBotItemEdit');

  // Recomendaciones del comedor
  const recomendacionesAdminSection = document.getElementById('recomendacionesAdminSection');
  const recomendacionesAdminList = document.getElementById('recomendacionesAdminList');
  const recCount = document.getElementById('recCount');
  const editRecModal = document.getElementById('editRecModal');
  const editRecNombre = document.getElementById('editRecNombre');
  const editRecTexto = document.getElementById('editRecTexto');
  const btnSaveRecEdit = document.getElementById('btnSaveRecEdit');
  const btnCancelRecEdit = document.getElementById('btnCancelRecEdit');

  // Upload method state
  let uploadMethod = 'file'; // 'file' or 'url'

  // Initialize
  function init() {
    loadContentData();
    setupEventListeners();
    // Arrancar en Dashboard General (Centro de Control unificado).
    switchSection('dashboard');
  }

  // Load content data from localStorage and JSON file
  function loadContentData() {
    // First try to load from localStorage
    const saved = localStorage.getItem('pcb_content_data');
    if (saved) {
      try {
        contentData = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Error loading content data from localStorage:', e);
      }
    }

    // If not in localStorage, try to load from JSON file
    fetch('data/content-data.json')
      .then(response => response.json())
      .then(data => {
        contentData = data;
        saveContentData(); // Save to localStorage
        renderGallery();
      })
      .catch(error => {
        console.error('Error loading content data from file:', error);
        contentData = initializeDefaultData();
        renderGallery();
      });
  }

  // Initialize default data structure
  function initializeDefaultData() {
    const data = {
      biblioteca: [],
      comedor: [],
      promociones: [],
      avisos: [],
      menu_comedor: {
        desayuno: ['Revoltillo', 'Peras Frescas', 'Melocotones', 'Leche'],
        almuerzo: ['Arroz', 'Habichuelas guisadas con calabaza', 'Carne de Cerdo', 'Zanahoria', 'Manzana', 'Coctel de fruta']
      }
    };

    // Add existing biblioteca images
    for (let i = 1; i <= 5; i++) {
      data.biblioteca.push({
        id: `biblioteca_${i}`,
        filename: `image${i}.png`,
        path: `galeriabiblioteca/image${i}.png`,
        title: `Foto de la biblioteca ${i}`,
        description: '',
        dateAdded: new Date().toISOString()
      });
    }

    // Add existing promociones image
    data.promociones.push({
      id: 'promociones_1',
      filename: 'image1.jpeg',
      path: 'galeriadepromociones/image1.jpeg',
      title: 'Inscripción Abierta 2026',
      description: '¡Únete a nuestra familia educativa!',
      dateAdded: new Date().toISOString()
    });

    // Add existing aviso
    data.avisos.push({
      id: 'avisos_1',
      filename: 'Aviso30-enero-2026.jpeg',
      path: 'Avisos/Aviso30-enero-2026.jpeg',
      title: 'Aviso Importante',
      description: 'Información actualizada - 30 de enero 2026',
      dateAdded: new Date().toISOString()
    });

    saveContentData(data);
    return data;
  }

  // Save content data to localStorage
  function saveContentData(data = contentData) {
    localStorage.setItem('pcb_content_data', JSON.stringify(data));
  }

  // Setup event listeners
  function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        switchSection(section);
      });
    });

    // Botones de acceso rápido del Dashboard General
    document.querySelectorAll('.dash-quick-btn[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => switchSection(btn.dataset.goto));
    });

    // Abrir el portal PCBLearning en una pestaña nueva
    const navOpenPcbLearning = document.getElementById('navOpenPcbLearning');
    if (navOpenPcbLearning) {
      navOpenPcbLearning.addEventListener('click', () => {
        window.open('PCBLearning.html', '_blank', 'noopener');
      });
    }

    // Add image button
    btnAddImage.addEventListener('click', showUploadForm);
    btnCancelUpload.addEventListener('click', hideUploadForm);

    // Edit menu button
    btnEditMenu.addEventListener('click', showMenuEditor);
    btnCancelMenu.addEventListener('click', hideMenuEditor);

    // Export data button
    btnExportData.addEventListener('click', exportDataToJSON);

    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchUploadTab(tab);
      });
    });

    // File input preview
    if (imageFile) {
      imageFile.addEventListener('change', handleFileSelect);
    }

    // URL input preview
    if (imageUrl) {
      imageUrl.addEventListener('input', handleUrlInput);
      imageUrl.addEventListener('blur', handleUrlBlur);
    }

    // Upload form
    uploadForm.addEventListener('submit', handleUploadSubmit);

    // Menu form
    menuForm.addEventListener('submit', handleMenuSubmit);

    // Delete modal
    btnConfirmDelete.addEventListener('click', confirmDelete);
    btnCancelDelete.addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  // Switch upload tab
  function switchUploadTab(tab) {
    uploadMethod = tab;

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    const tabFile = document.getElementById('tabFile');
    const tabUrl = document.getElementById('tabUrl');

    if (tab === 'file') {
      tabFile.style.display = 'block';
      tabUrl.style.display = 'none';
      if (imageFile) imageFile.required = true;
      if (imageUrl) imageUrl.required = false;
    } else {
      tabFile.style.display = 'none';
      tabUrl.style.display = 'block';
      if (imageFile) imageFile.required = false;
      if (imageUrl) imageUrl.required = true;
    }
  }

  // Handle URL input
  function handleUrlInput() {
    const url = imageUrl.value.trim();
    if (url && isValidImageUrl(url)) {
      showUrlPreview(url);
    } else {
      urlPreview.innerHTML = '';
    }
  }

  // Handle URL blur (when user leaves the input)
  function handleUrlBlur() {
    const url = imageUrl.value.trim();
    if (url && !isValidImageUrl(url)) {
      alert('⚠️ La URL no parece ser válida. Asegúrate de que termine en .jpg, .jpeg, .png, .gif o .webp');
    }
  }

  // Check if URL is a valid image URL
  function isValidImageUrl(url) {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  }

  // Show URL preview
  function showUrlPreview(url) {
    urlPreview.innerHTML = `
      <p style="margin-bottom: 0.5rem; color: #666;">Vista previa:</p>
      <img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<p style=color:red>❌ No se pudo cargar la imagen. Verifica la URL.</p>'">
    `;
  }

  // Switch section
  function switchSection(section) {
    // Si la sección no está registrada en SECTIONS ni en PROXIMAMENTE, ignorar.
    if (!SECTIONS[section] && !PROXIMAMENTE[section]) return;
    currentSection = section;

    // Update nav buttons
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update title & subtitle
    const meta = SECTIONS[section] || PROXIMAMENTE[section];
    sectionTitle.textContent = meta.title;
    const subtitles = {
      dashboard: 'Centro de Control Administrativo del PCBSystem',
      comedor: 'Administra las imágenes y menú del comedor escolar',
      promociones: 'Gestiona las promociones e inscripciones visibles en el sitio',
      avisos: 'Publicación y edición de avisos institucionales',
      bot: 'Selecciona qué avisos muestra el bot flotante del sitio',
      novedades: 'La novedad más reciente aparecerá en el popup del portal',
      talleres: 'Crea y edita talleres para padres — visibles en talleres-padres.html',
      certificaciones: 'Crea y edita certificaciones online — visibles en PCBLearning.html y certificaciones-padres.html',
      anuncios_comunidad: 'Aprueba, rechaza o elimina los anuncios enviados por la comunidad'
    };
    const subtitleEl = document.getElementById('sectionSubtitle');
    if (subtitleEl) subtitleEl.textContent = subtitles[section] || (PROXIMAMENTE[section] ? PROXIMAMENTE[section].subtitle : '');

    // Show/hide topbar buttons
    const gallerySections = ['comedor', 'promociones', 'avisos'];
    btnEditMenu.style.display = section === 'comedor' ? 'inline-flex' : 'none';
    btnAddImage.style.display = gallerySections.includes(section) ? 'inline-flex' : 'none';

    // Fetch extra sections
    const talleresSection = document.getElementById('talleresSection');
    const certificacionesSection = document.getElementById('certificacionesSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const proximamenteSection = document.getElementById('proximamenteSection');
    const statsRow = document.getElementById('statsRow');

    // Hide all special sections
    botConfigSection.style.display = 'none';
    recomendacionesAdminSection.style.display = 'none';
    novedadesSection.style.display = 'none';
    if (anunciosComunidadSection) anunciosComunidadSection.style.display = 'none';
    if (talleresSection) talleresSection.style.display = 'none';
    if (certificacionesSection) certificacionesSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (proximamenteSection) proximamenteSection.style.display = 'none';
    galleryGrid.style.display = 'none';
    emptyState.style.display = 'none';

    // El stats-row clásico se oculta en Dashboard (que tiene su propio resumen) y en placeholders.
    if (statsRow) statsRow.style.display = (section === 'dashboard' || PROXIMAMENTE[section]) ? 'none' : 'grid';

    if (section === 'dashboard') {
      if (dashboardSection) dashboardSection.style.display = 'block';
      renderDashboard();
    } else if (PROXIMAMENTE[section]) {
      renderProximamente(section);
      if (proximamenteSection) proximamenteSection.style.display = 'block';
    } else if (section === 'bot') {
      botConfigSection.style.display = 'block';
      renderBotConfig();
    } else if (section === 'novedades') {
      novedadesSection.style.display = 'block';
      renderNovedades();
    } else if (section === 'anuncios_comunidad') {
      if (anunciosComunidadSection) anunciosComunidadSection.style.display = 'block';
      renderAnunciosComunidad();
    } else if (section === 'talleres') {
      if (talleresSection) talleresSection.style.display = 'block';
      renderTalleres();
    } else if (section === 'certificaciones') {
      if (certificacionesSection) certificacionesSection.style.display = 'block';
      renderCertificaciones();
    } else if (section === 'comedor') {
      galleryGrid.style.display = 'grid';
      recomendacionesAdminSection.style.display = 'block';
      renderRecomendaciones();
      renderGallery();
    } else {
      galleryGrid.style.display = 'grid';
      renderGallery();
    }

    hideUploadForm();
    hideMenuEditor();
    updateStats();
  }

  // ── Renderizar placeholder "Próximamente" para módulos en construcción ──
  function renderProximamente(section) {
    const meta = PROXIMAMENTE[section];
    if (!meta) return;
    const iconEl  = document.getElementById('proxIcon');
    const titleEl = document.getElementById('proxTitle');
    const textEl  = document.getElementById('proxText');
    if (iconEl)  iconEl.textContent = meta.icon || '🚧';
    if (titleEl) titleEl.textContent = meta.title;
    if (textEl)  textEl.textContent = meta.subtitle + ' — Disponible en una próxima etapa del Centro de Control Administrativo.';
  }

  // ── Renderizar Dashboard General ──
  function renderDashboard() {
    const data = contentData || {};
    const promos    = (data.promociones || []).length;
    const avisos    = (data.avisos || []).length;
    const novedades = (data.novedades || []).length;
    const talleres  = (typeof getTalleres === 'function' ? getTalleres() : []).length;
    const certs     = (typeof getCertificaciones === 'function' ? getCertificaciones() : []).length;
    const menu      = data.menu_comedor || {};
    const menuItems = ((menu.desayuno || []).length) + ((menu.almuerzo || []).length);

    // Avisos críticos = novedades marcadas como is_critical
    const criticos  = (data.novedades || []).filter(n => n && (n.is_critical || n.isCritical)).length;
    // Solicitudes pendientes ≈ anuncios de comunidad por aprobar (badge ya implementado)
    const badgeEl   = document.getElementById('badgePendientes');
    const pendN     = badgeEl ? parseInt(badgeEl.textContent, 10) || 0 : 0;

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('dashTotalPublicaciones',    promos + avisos + novedades + talleres + certs);
    setText('dashAvisosCriticos',        criticos);
    setText('dashPromocionesActivas',    promos);
    setText('dashTalleresPublicados',    talleres);
    setText('dashCertsDisponibles',      certs);
    setText('dashMenuPublicado',         menuItems > 0 ? menuItems + ' items' : '—');
    setText('dashSolicitudesPendientes', pendN);
    setText('dashLastUpdate',            new Date().toLocaleString('es-PR'));
  }

  // Show upload form
  function showUploadForm() {
    hideMenuEditor();
    uploadSection.style.display = 'block';
    uploadForm.reset();
    filePreview.innerHTML = '';
    uploadSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Hide upload form
  function hideUploadForm() {
    uploadSection.style.display = 'none';
    uploadForm.reset();
    filePreview.innerHTML = '';
  }

  // Show menu editor
  function showMenuEditor() {
    hideUploadForm();
    menuEditorSection.style.display = 'block';

    // Load current menu data
    const menuData = contentData.menu_comedor || {
      desayuno: [],
      almuerzo: []
    };

    desayunoItems.value = menuData.desayuno.join('\n');
    almuerzoItems.value = menuData.almuerzo.join('\n');

    menuEditorSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Hide menu editor
  function hideMenuEditor() {
    menuEditorSection.style.display = 'none';
    menuForm.reset();
  }

  // Handle file select
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) {
      filePreview.innerHTML = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      imageFile.value = '';
      filePreview.innerHTML = '';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }

  // Handle upload submit
  function handleUploadSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('imageTitle').value || 'Sin título';
    const description = document.getElementById('imageDescription').value || '';

    if (uploadMethod === 'url') {
      // Handle URL upload
      const url = imageUrl.value.trim();

      if (!url) {
        alert('⚠️ Por favor ingresa una URL de imagen');
        return;
      }

      if (!isValidImageUrl(url)) {
        alert('⚠️ La URL no parece ser válida. Asegúrate de que termine en .jpg, .jpeg, .png, .gif o .webp');
        return;
      }

      // Create image object with URL
      const imageData = {
        id: `${currentSection}_${Date.now()}`,
        filename: url.split('/').pop().split('?')[0], // Extract filename from URL
        url: url, // Store the external URL
        title: title,
        description: description,
        dateAdded: new Date().toISOString(),
        isExternal: true // Flag to indicate this is an external image
      };

      // Add to content data
      if (!contentData[currentSection]) {
        contentData[currentSection] = [];
      }
      contentData[currentSection].push(imageData);
      saveContentData();

      // Show success message
      alert('✅ Imagen añadida correctamente!\n\n🌐 La imagen se cargará desde la URL externa y funcionará perfectamente en GitHub Pages.');

      // Hide form and refresh gallery
      hideUploadForm();
      renderGallery();

    } else {
      // Handle file upload
      const file = imageFile.files[0];
      if (!file) {
        alert('⚠️ Por favor selecciona una imagen');
        return;
      }

      // Create image object
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageData = {
          id: `${currentSection}_${Date.now()}`,
          filename: file.name,
          path: `${SECTIONS[currentSection].folder}/${file.name}`,
          title: title,
          description: description,
          dateAdded: new Date().toISOString(),
          base64: e.target.result, // Store base64 for preview
          isExternal: false
        };

        // Add to content data
        if (!contentData[currentSection]) {
          contentData[currentSection] = [];
        }
        contentData[currentSection].push(imageData);
        saveContentData();

        // Show success message
        alert('✅ Imagen añadida correctamente!\n\n⚠️ Nota: Para que la imagen aparezca en GitHub Pages, debes copiar el archivo manualmente a la carpeta: ' + SECTIONS[currentSection].folder + '\n\n💡 Tip: Usa la opción "🔗 URL Externa" para evitar copiar archivos manualmente.');

        // Hide form and refresh gallery
        hideUploadForm();
        renderGallery();
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle menu submit
  function handleMenuSubmit(e) {
    e.preventDefault();

    // Get items from textareas and split by lines
    const desayuno = desayunoItems.value
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const almuerzo = almuerzoItems.value
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Validate
    if (desayuno.length === 0 && almuerzo.length === 0) {
      alert('⚠️ Por favor añade al menos un item al menú');
      return;
    }

    // Save menu data
    contentData.menu_comedor = {
      desayuno: desayuno,
      almuerzo: almuerzo
    };
    saveContentData();

    // Show success message
    alert('✅ Menú actualizado correctamente!\n\nLos cambios se verán reflejados en la página del comedor.');

    // Hide form
    hideMenuEditor();
  }

  // Render gallery
  function renderGallery() {
    const items = contentData[currentSection] || [];

    if (items.length === 0) {
      galleryGrid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    galleryGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    galleryGrid.innerHTML = items.map(item => {
      // Determine image source: URL > base64 > path
      const imgSrc = item.url || item.base64 || item.path;
      const sourceLabel = item.isExternal ? '🌐 URL Externa' : '📁 Archivo Local';

      // Check if this is the menu image
      const isMenuImage = currentSection === 'comedor' &&
        contentData.menu_comedor &&
        contentData.menu_comedor.menuImage &&
        contentData.menu_comedor.menuImage.id === item.id;

      const menuButton = currentSection === 'comedor' ? `
        <button class="btn-icon menu-action ${isMenuImage ? 'active' : ''}" 
                onclick="adminApp.setMenuImage('${item.id}')" 
                title="${isMenuImage ? 'Es la imagen actual del menú' : 'Establecer como Menú del Día'}"
                style="${isMenuImage ? 'background-color: var(--primary); color: white;' : ''}">
          ${isMenuImage ? '⭐' : '🍽️'}
        </button>
      ` : '';

      return `
        <div class="gallery-item ${isMenuImage ? 'highlight-menu' : ''}" data-id="${item.id}" style="${isMenuImage ? 'border: 3px solid var(--primary); box-shadow: 0 0 15px rgba(29, 53, 87, 0.3);' : ''}">
          ${isMenuImage ? '<div style="position: absolute; top: 10px; left: 10px; background: var(--primary); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; z-index: 10;">⭐ Menú del Día</div>' : ''}
          <img src="${imgSrc}" alt="${item.title}" class="gallery-item-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22250%22%3E%3Crect fill=%22%23f5f7fa%22 width=%22300%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%23999%22%3E📷 Imagen%3C/text%3E%3C/svg%3E'">
          <div class="gallery-item-content">
            <div class="gallery-item-title">${item.title}</div>
            ${item.description ? `<div class="gallery-item-description">${item.description}</div>` : ''}
            <div class="gallery-item-meta">
              <div class="gallery-item-filename" title="${item.url || item.filename}">
                ${sourceLabel}: ${item.filename}
              </div>
              <div class="gallery-item-actions">
                ${menuButton}
                <button class="btn-icon" onclick="adminApp.editGalleryItem('${item.id}')" title="Editar"
                  style="background:#f0f4ff; color:#667eea;">
                  ✏️
                </button>
                <button class="btn-icon delete" onclick="adminApp.deleteImage('${item.id}')" title="Eliminar">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Delete image
  function deleteImage(id) {
    imageToDelete = id;
    deleteModal.classList.add('active');
  }

  // Confirm delete
  function confirmDelete() {
    if (!imageToDelete) return;

    const items = contentData[currentSection] || [];
    const index = items.findIndex(item => item.id === imageToDelete);

    if (index !== -1) {
      items.splice(index, 1);
      saveContentData();
      renderGallery();
    }

    closeDeleteModal();
  }

  // Close delete modal
  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    imageToDelete = null;
  }

  // Export data to JSON file
  function exportDataToJSON() {
    // Create a clean copy without base64 data (too large for JSON file)
    const exportData = JSON.parse(JSON.stringify(contentData));

    // Remove base64 data from images
    ['biblioteca', 'comedor', 'promociones', 'avisos'].forEach(section => {
      if (exportData[section]) {
        exportData[section] = exportData[section].map(item => {
          const { base64, ...rest } = item;
          return rest;
        });
      }
    });

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ Datos exportados correctamente!\n\n📝 Instrucciones:\n1. Guarda el archivo descargado en la carpeta "data/"\n2. Sube los cambios a GitHub\n3. Las páginas se actualizarán automáticamente');
  }

  // Render bot configuration
  function renderBotConfig() {
    const avisos = contentData.avisos || [];
    const promociones = contentData.promociones || [];
    const allItems = [...avisos, ...promociones];

    if (allItems.length === 0) {
      botItemsList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #95a5a6;">
          <p>No hay avisos ni promociones disponibles.</p>
          <p>Añade contenido en las secciones de Avisos o Promociones primero.</p>
        </div>
      `;
      return;
    }

    // Load current bot config
    const botConfig = JSON.parse(localStorage.getItem('pcb_bot_config') || '{}');
    const selectedIds = botConfig.selectedIds || [];

    botItemsList.innerHTML = allItems.map(item => `
      <div class="bot-item" style="display:flex; align-items:center; gap:0.8rem; padding:0.75rem; border:1px solid #e8ecf0; border-radius:10px; margin-bottom:0.6rem; background:#fafbfc;">
        <input
          type="checkbox"
          class="bot-item-checkbox"
          data-item-id="${item.id}"
          ${selectedIds.includes(item.id) ? 'checked' : ''}
          style="width:18px; height:18px; flex-shrink:0; cursor:pointer;"
        >
        <img src="${item.base64 || item.path}" alt="${item.title}" class="bot-item-preview"
          style="width:56px; height:56px; object-fit:cover; border-radius:8px; flex-shrink:0;"
          onerror="this.style.display='none'">
        <div class="bot-item-info" style="flex:1; min-width:0;">
          <h4 style="margin:0 0 0.2rem; color:#2c3e50; font-size:0.95rem;">${item.title || 'Sin título'}</h4>
          <p style="margin:0; color:#7f8c8d; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.description || 'Sin descripción'}</p>
        </div>
        <button onclick="adminApp.editBotItem('${item.id}')" title="Editar"
          style="background:#f0f4ff; color:#667eea; border:none; border-radius:7px; padding:0.5rem 0.75rem; cursor:pointer; font-size:1rem; flex-shrink:0; transition:background 0.2s;"
          onmouseover="this.style.background='#667eea';this.style.color='white'"
          onmouseout="this.style.background='#f0f4ff';this.style.color='#667eea'">✏️</button>
        <button onclick="adminApp.deleteBotItem('${item.id}')" title="Eliminar"
          style="background:#fff0f0; color:#e74c3c; border:none; border-radius:7px; padding:0.5rem 0.75rem; cursor:pointer; font-size:1rem; flex-shrink:0; transition:background 0.2s;"
          onmouseover="this.style.background='#e74c3c';this.style.color='white'"
          onmouseout="this.style.background='#fff0f0';this.style.color='#e74c3c'">🗑️</button>
      </div>
    `).join('');
  }

  // ── Editar ítem de galería (comedor, promociones, etc.) ─────────────────

  function editGalleryItem(id) {
    let found = null;
    let foundFolder = null;
    for (const folder of Object.keys(contentData)) {
      if (!Array.isArray(contentData[folder])) continue;
      const item = contentData[folder].find(i => i.id === id);
      if (item) { found = item; foundFolder = folder; break; }
    }
    if (!found) return;
    galleryItemToEdit = { id, folder: foundFolder };
    editGalleryTitle.value = found.title || '';
    editGalleryDesc.value = found.description || '';
    editGalleryImgFile.value = '';
    const src = found.base64 || found.url || found.path || '';
    editGalleryImgPreview.innerHTML = src
      ? `<img src="${src}" style="max-width:100%; max-height:140px; border-radius:8px; border:1px solid #e2e8f0;">`
      : `<p style="color:#95a5a6; font-size:0.9rem;">Sin imagen</p>`;
    editGalleryItemModal.classList.add('active');
  }

  function closeGalleryItemModal() {
    editGalleryItemModal.classList.remove('active');
    galleryItemToEdit = null;
    editGalleryTitle.value = '';
    editGalleryDesc.value = '';
    editGalleryImgPreview.innerHTML = '';
    editGalleryImgFile.value = '';
  }

  function saveGalleryItemEdit() {
    if (!galleryItemToEdit) return;
    const title = editGalleryTitle.value.trim();
    const desc = editGalleryDesc.value.trim();
    if (!title) { alert('⚠️ El título no puede estar vacío.'); return; }

    function applyGalleryEdit(newBase64) {
      const { id, folder } = galleryItemToEdit;
      const idx = contentData[folder].findIndex(i => i.id === id);
      if (idx !== -1) {
        contentData[folder][idx].title = title;
        contentData[folder][idx].description = desc;
        if (newBase64) contentData[folder][idx].base64 = newBase64;
      }
      saveContentData();
      closeGalleryItemModal();
      renderGallery();
      alert('✅ Imagen actualizada correctamente.');
    }

    const file = editGalleryImgFile.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => applyGalleryEdit(e.target.result);
      reader.readAsDataURL(file);
    } else {
      applyGalleryEdit(null);
    }
  }

  // ── Editar ítem del bot ──────────────────────────────────────────────────

  function editBotItem(id) {
    const avisos = contentData.avisos || [];
    const promociones = contentData.promociones || [];
    const allItems = [...avisos, ...promociones];
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    botItemToEdit = item;
    editBotTitle.value = item.title || '';
    editBotDesc.value = item.description || '';
    editBotImgFile.value = '';

    const src = item.base64 || item.path || '';
    editBotImgPreview.innerHTML = src
      ? `<img src="${src}" style="max-width:100%; max-height:140px; border-radius:8px; border:1px solid #e2e8f0;">`
      : `<p style="color:#95a5a6; font-size:0.9rem;">Sin imagen</p>`;

    editBotItemModal.classList.add('active');
  }

  function closeBotItemModal() {
    editBotItemModal.classList.remove('active');
    botItemToEdit = null;
    editBotTitle.value = '';
    editBotDesc.value = '';
    editBotImgPreview.innerHTML = '';
    editBotImgFile.value = '';
  }

  function saveBotItemEdit() {
    if (!botItemToEdit) return;
    const title = editBotTitle.value.trim();
    const desc = editBotDesc.value.trim();
    if (!title) { alert('⚠️ El título no puede estar vacío.'); return; }

    function applyEdit(newBase64) {
      // Update in avisos or promociones
      ['avisos', 'promociones'].forEach(folder => {
        if (!contentData[folder]) return;
        const idx = contentData[folder].findIndex(i => i.id === botItemToEdit.id);
        if (idx !== -1) {
          contentData[folder][idx].title = title;
          contentData[folder][idx].description = desc;
          if (newBase64) contentData[folder][idx].base64 = newBase64;
        }
      });
      localStorage.setItem('pcb_content_data', JSON.stringify(contentData));
      closeBotItemModal();
      renderBotConfig();
      alert('✅ Cambios guardados correctamente.');
    }

    const file = editBotImgFile.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => applyEdit(e.target.result);
      reader.readAsDataURL(file);
    } else {
      applyEdit(null);
    }
  }

  function deleteBotItem(id) {
    if (!confirm('¿Eliminar este aviso/promoción? Esta acción no se puede deshacer.')) return;
    ['avisos', 'promociones'].forEach(folder => {
      if (!contentData[folder]) return;
      contentData[folder] = contentData[folder].filter(i => i.id !== id);
    });
    saveContentData();
    renderBotConfig();
  }

  // Save bot configuration
  function saveBotConfig() {
    const checkboxes = document.querySelectorAll('.bot-item-checkbox');
    const selectedIds = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.dataset.itemId);

    const botConfig = {
      selectedIds: selectedIds,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('pcb_bot_config', JSON.stringify(botConfig));
    alert(`✅ Configuración guardada!\n\n${selectedIds.length} avisos/promociones seleccionados para mostrar en el bot.`);
  }

  // Set menu image
  function setMenuImage(id) {
    if (confirm('¿Quieres establecer esta imagen como el "Menú del Día"?')) {
      const items = contentData.comedor || [];
      const image = items.find(item => item.id === id);

      if (image) {
        if (!contentData.menu_comedor) contentData.menu_comedor = {};

        // Determine best source for the image
        const imgSrc = image.url || image.path || image.base64;

        contentData.menu_comedor.menuImage = {
          id: image.id,
          src: imgSrc,
          timestamp: Date.now()
        };

        saveContentData();
        renderGallery();
        alert('✅ Imagen del Menú del Día actualizada!');
      }
    }
  }

  // ── Gestión de Novedades (Supabase) ────────────────────────────────────

  async function renderNovedades() {
    const newsList = document.getElementById('newsList');
    const newsForm = document.getElementById('newsForm');
    if (!newsList || !newsForm) return;

    async function renderNews() {
      newsList.innerHTML = '<li style="color:#95a5a6; padding:10px;">⏳ Cargando novedades...</li>';
      try {
        const allNews = await window.novedadesDB.getAll();
        if (!allNews || allNews.length === 0) {
          newsList.innerHTML = '<li style="color:#95a5a6; padding:10px;">No hay noticias activas.</li>';
          return;
        }
        newsList.innerHTML = allNews.map((news, i) => `
          <li style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:${i === 0 ? '#f0f9ff' : 'transparent'};">
            <div style="display:flex; align-items:center; gap:15px;">
              ${news.image_url
                ? `<img src="${news.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">`
                : `<div style="width:50px; height:50px; background:#eee; border-radius:6px; display:flex; align-items:center; justify-content:center;">📷</div>`}
              <div>
                <strong style="color:#2c3e50;">${news.title}</strong>
                ${i === 0 ? '<span style="background:#2ecc71; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">ACTIVA</span>' : ''}
                ${news.is_critical ? '<span style="background:#e74c3c; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">🚨 CRÍTICA</span>' : ''}
                <p style="margin:0; color:#7f8c8d; font-size:0.9rem;">${news.message}</p>
                <small style="color:#95a5a6;">${new Date(news.created_at).toLocaleDateString()} ${new Date(news.created_at).toLocaleTimeString()}</small>
              </div>
            </div>
            <div style="display:flex; gap:0.4rem;">
              <button onclick="adminApp.editNews('${news.id}')"
                style="background:#f0f4ff; color:#667eea; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:1rem;"
                onmouseover="this.style.background='#667eea';this.style.color='white'"
                onmouseout="this.style.background='#f0f4ff';this.style.color='#667eea'">✏️</button>
              <button onclick="adminApp.deleteNews('${news.id}')"
                style="background:#fff0f0; color:#e74c3c; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:1rem;"
                onmouseover="this.style.background='#e74c3c';this.style.color='white'"
                onmouseout="this.style.background='#fff0f0';this.style.color='#e74c3c'">🗑️</button>
            </div>
          </li>
        `).join('');
      } catch (err) {
        newsList.innerHTML = '<li style="color:#e74c3c; padding:10px;">⚠️ Error al cargar novedades. Verifica la conexión.</li>';
        console.error('novedadesDB.getAll:', err);
      }
    }

    // Bind submit only once
    if (!newsForm._bound) {
      newsForm._bound = true;
      newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title      = document.getElementById('newsTitle').value.trim();
        const message    = document.getElementById('newsMessage').value.trim();
        const imageUrl   = document.getElementById('newsImage').value.trim();
        const isCritical = !!document.getElementById('newsIsCritical')?.checked;
        if (!title || !message) { alert('⚠️ Título y mensaje son obligatorios.'); return; }
        try {
          await window.novedadesDB.add({ title, message, imageUrl, isCritical });
          newsForm.reset();
          await renderNews();
          alert(isCritical
            ? '✅ Novedad CRÍTICA publicada. Aparecerá siempre en el popup hasta que la elimines o la edites.'
            : '✅ Novedad publicada. Aparecerá en el popup solo en la primera visita de cada usuario.');
        } catch (err) {
          alert('❌ Error al publicar: ' + err.message);
        }
      });
    }

    await renderNews();
  }

  async function editNews(id) {
    try {
      const all  = await window.novedadesDB.getAll();
      const news = all.find(n => n.id === id);
      if (!news) return;
      newsToEditId = id;
      editNewsTitle.value    = news.title     || '';
      editNewsMessage.value  = news.message   || '';
      editNewsImageUrl.value = news.image_url || '';
      const cb = document.getElementById('editNewsIsCritical');
      if (cb) cb.checked = !!news.is_critical;
      editNewsModal.classList.add('active');
    } catch (err) {
      alert('❌ Error al cargar novedad: ' + err.message);
    }
  }

  function closeNewsModal() {
    editNewsModal.classList.remove('active');
    newsToEditId = null;
    editNewsTitle.value    = '';
    editNewsMessage.value  = '';
    editNewsImageUrl.value = '';
    const cb = document.getElementById('editNewsIsCritical');
    if (cb) cb.checked = false;
  }

  async function saveNewsEdit() {
    if (!newsToEditId) return;
    const title   = editNewsTitle.value.trim();
    const message = editNewsMessage.value.trim();
    if (!title || !message) { alert('⚠️ El título y el mensaje son obligatorios.'); return; }
    try {
      await window.novedadesDB.update(newsToEditId, {
        title,
        message,
        imageUrl:   editNewsImageUrl.value.trim(),
        isCritical: !!document.getElementById('editNewsIsCritical')?.checked
      });
      closeNewsModal();
      await renderNovedades();
    } catch (err) {
      alert('❌ Error al guardar: ' + err.message);
    }
  }

  async function deleteNews(id) {
    if (!confirm('¿Seguro que deseas eliminar esta novedad?')) return;
    try {
      await window.novedadesDB.remove(id);
      await renderNovedades();
    } catch (err) {
      alert('❌ Error al eliminar: ' + err.message);
    }
  }

  // ── Recomendaciones del Comedor ─────────────────────────────────────────

  const REC_KEY = 'comedor_recomendaciones';

  function getRecomendaciones() {
    return JSON.parse(localStorage.getItem(REC_KEY) || '[]');
  }

  function saveRecomendaciones(data) {
    localStorage.setItem(REC_KEY, JSON.stringify(data));
  }

  function formatRecDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderRecomendaciones() {
    const recs = getRecomendaciones();
    recCount.textContent = recs.length;

    if (recs.length === 0) {
      recomendacionesAdminList.innerHTML = `
        <div style="text-align:center; color:#95a5a6; padding:2rem;">
          <p style="font-size:2rem;">💬</p>
          <p>No hay recomendaciones todavía.</p>
        </div>`;
      return;
    }

    recomendacionesAdminList.innerHTML = recs.map((r, i) => `
      <div style="display:flex; gap:1rem; align-items:flex-start; padding:1rem; border:1px solid #e8ecf0; border-radius:10px; margin-bottom:0.8rem; background:#fafbfc;">
        <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#667eea,#764ba2); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:1.1rem; flex-shrink:0;">
          ${r.nombre.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.3rem;">
            <strong style="color:#2c3e50;">${r.nombre}</strong>
            <span style="font-size:0.78rem; color:#95a5a6;">${formatRecDate(r.fecha)}</span>
          </div>
          <p style="margin:0; color:#555; font-size:0.93rem; line-height:1.5;">${r.texto}</p>
        </div>
        <div style="display:flex; gap:0.4rem; flex-shrink:0;">
          <button onclick="adminApp.editRecomendacion(${i})" title="Editar"
            style="background:#f0f4ff; color:#667eea; border:none; border-radius:7px; padding:0.45rem 0.7rem; cursor:pointer; font-size:0.95rem; transition:background 0.2s;"
            onmouseover="this.style.background='#667eea';this.style.color='white'"
            onmouseout="this.style.background='#f0f4ff';this.style.color='#667eea'">✏️</button>
          <button onclick="adminApp.deleteRecomendacion(${i})" title="Eliminar"
            style="background:#fff0f0; color:#e74c3c; border:none; border-radius:7px; padding:0.45rem 0.7rem; cursor:pointer; font-size:0.95rem; transition:background 0.2s;"
            onmouseover="this.style.background='#e74c3c';this.style.color='white'"
            onmouseout="this.style.background='#fff0f0';this.style.color='#e74c3c'">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  function deleteRecomendacion(index) {
    if (!confirm('¿Eliminar esta recomendación? Esta acción no se puede deshacer.')) return;
    const recs = getRecomendaciones();
    recs.splice(index, 1);
    saveRecomendaciones(recs);
    renderRecomendaciones();
  }

  function editRecomendacion(index) {
    const recs = getRecomendaciones();
    const rec = recs[index];
    if (!rec) return;
    recToEditIndex = index;
    editRecNombre.value = rec.nombre;
    editRecTexto.value = rec.texto;
    editRecModal.classList.add('active');
  }

  function saveRecEdit() {
    if (recToEditIndex === null) return;
    const nombre = editRecNombre.value.trim();
    const texto = editRecTexto.value.trim();
    if (!nombre || !texto) {
      alert('⚠️ El nombre y la recomendación no pueden estar vacíos.');
      return;
    }
    const recs = getRecomendaciones();
    recs[recToEditIndex].nombre = nombre;
    recs[recToEditIndex].texto = texto;
    saveRecomendaciones(recs);
    closeEditRecModal();
    renderRecomendaciones();
  }

  function closeEditRecModal() {
    editRecModal.classList.remove('active');
    recToEditIndex = null;
    editRecNombre.value = '';
    editRecTexto.value = '';
  }

  // ── Setup event listeners
  const originalSetupEventListeners = setupEventListeners;
  setupEventListeners = function () {
    originalSetupEventListeners();

    // Bot config save button
    if (btnSaveBotConfig) {
      btnSaveBotConfig.addEventListener('click', saveBotConfig);
    }

    // Edit news modal
    if (btnSaveNewsEdit) btnSaveNewsEdit.addEventListener('click', saveNewsEdit);
    if (btnCancelNewsEdit) btnCancelNewsEdit.addEventListener('click', closeNewsModal);
    if (editNewsModal) editNewsModal.addEventListener('click', e => { if (e.target === editNewsModal) closeNewsModal(); });

    // Edit gallery item modal
    if (btnSaveGalleryEdit) btnSaveGalleryEdit.addEventListener('click', saveGalleryItemEdit);
    if (btnCancelGalleryEdit) btnCancelGalleryEdit.addEventListener('click', closeGalleryItemModal);
    if (editGalleryItemModal) editGalleryItemModal.addEventListener('click', e => { if (e.target === editGalleryItemModal) closeGalleryItemModal(); });

    // Edit bot item modal
    if (btnSaveBotItemEdit) btnSaveBotItemEdit.addEventListener('click', saveBotItemEdit);
    if (btnCancelBotItemEdit) btnCancelBotItemEdit.addEventListener('click', closeBotItemModal);
    if (editBotItemModal) editBotItemModal.addEventListener('click', e => { if (e.target === editBotItemModal) closeBotItemModal(); });

    // Edit recommendation modal
    if (btnSaveRecEdit) {
      btnSaveRecEdit.addEventListener('click', saveRecEdit);
    }
    if (btnCancelRecEdit) {
      btnCancelRecEdit.addEventListener('click', closeEditRecModal);
    }
    if (editRecModal) {
      editRecModal.addEventListener('click', (e) => {
        if (e.target === editRecModal) closeEditRecModal();
      });
    }
  };

  // ══════════════════════════════════════════════
  //  TALLERES PARA PADRES — CRUD
  // ══════════════════════════════════════════════
  function getTalleres() {
    try { return JSON.parse(localStorage.getItem('pcb_talleres') || '[]'); } catch(e) { return []; }
  }
  function saveTalleres(list) {
    localStorage.setItem('pcb_talleres', JSON.stringify(list));
    updateStats();
  }

  function renderTalleres() {
    const list = getTalleres();
    const container = document.getElementById('talleresList');
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🎓</div><h3>No hay talleres</h3><p>Agrega el primer taller usando el formulario de arriba</p></div>';
      return;
    }
    const modalityMap = { virtual:'🖥️ Virtual', presencial:'🏫 Presencial', hibrido:'🔀 Híbrido' };
    const badgeMap = { virtual:'badge-virtual', presencial:'badge-presencial', hibrido:'badge-hibrido' };
    container.innerHTML = list.map((t, i) => `
      <div class="item-row">
        <div class="item-row-info">
          <h4>${t.nombre}</h4>
          <p>${t.instructor ? t.instructor + ' · ' : ''}${t.fecha || ''} ${t.duracion ? '· ' + t.duracion : ''}</p>
        </div>
        <span class="item-badge ${badgeMap[t.modalidad] || 'badge-virtual'}">${modalityMap[t.modalidad] || t.modalidad}</span>
        <div class="item-row-actions">
          <button class="btn btn-secondary btn-sm" onclick="adminApp.editTaller(${i})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="adminApp.deleteTaller(${i})">🗑️</button>
        </div>
      </div>`).join('');
  }

  function editTaller(index) {
    const list = getTalleres();
    const t = list[index];
    if (!t) return;
    document.getElementById('tallerEditId').value = index;
    document.getElementById('tallerNombre').value = t.nombre || '';
    document.getElementById('tallerInstructor').value = t.instructor || '';
    document.getElementById('tallerDescripcion').value = t.descripcion || '';
    document.getElementById('tallerCategoria').value = t.categoria || 'tecnologia';
    document.getElementById('tallerModalidad').value = t.modalidad || 'virtual';
    document.getElementById('tallerFecha').value = t.fecha || '';
    document.getElementById('tallerDuracion').value = t.duracion || '';
    document.getElementById('tallerCupos').value = t.cupos || '';
    document.getElementById('tallerImagen').value = t.imagen || '';
    document.getElementById('tallerEnlace').value = t.enlace || '';
    document.getElementById('tallerForm').scrollIntoView({ behavior: 'smooth' });
  }

  function deleteTaller(index) {
    if (!confirm('¿Eliminar este taller?')) return;
    const list = getTalleres();
    list.splice(index, 1);
    saveTalleres(list);
    renderTalleres();
  }

  // ══════════════════════════════════════════════
  //  CERTIFICACIONES ONLINE — CRUD
  // ══════════════════════════════════════════════
  function getCertificaciones() {
    try { return JSON.parse(localStorage.getItem('pcb_certificaciones') || '[]'); } catch(e) { return []; }
  }
  function saveCertificaciones(list) {
    localStorage.setItem('pcb_certificaciones', JSON.stringify(list));
    updateStats();
  }

  function renderCertificaciones() {
    const list = getCertificaciones();
    const container = document.getElementById('certsList');
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏆</div><h3>No hay certificaciones</h3><p>Agrega la primera certificación usando el formulario de arriba</p></div>';
      return;
    }
    const formatoMap = { enlinea:'🌐 En línea', grabado:'🎥 Grabado', hibrido:'🔀 Híbrido' };
    const badgeMap = { enlinea:'badge-enlinea', grabado:'badge-grabado', hibrido:'badge-hibrido' };
    container.innerHTML = list.map((c, i) => `
      <div class="item-row">
        <div class="item-row-info">
          <h4>${c.nombre}</h4>
          <p>${c.proveedor ? c.proveedor + ' · ' : ''}${c.duracion || ''} ${c.precio ? '· ' + c.precio : ''}</p>
        </div>
        <span class="item-badge ${badgeMap[c.formato] || 'badge-enlinea'}">${formatoMap[c.formato] || c.formato}</span>
        <div class="item-row-actions">
          <button class="btn btn-secondary btn-sm" onclick="adminApp.editCert(${i})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="adminApp.deleteCert(${i})">🗑️</button>
        </div>
      </div>`).join('');
  }

  function editCert(index) {
    const list = getCertificaciones();
    const c = list[index];
    if (!c) return;
    document.getElementById('certEditId').value = index;
    document.getElementById('certNombre').value = c.nombre || '';
    document.getElementById('certProveedor').value = c.proveedor || '';
    document.getElementById('certDescripcion').value = c.descripcion || '';
    document.getElementById('certDuracion').value = c.duracion || '';
    document.getElementById('certNivel').value = c.nivel || 'principiante';
    document.getElementById('certFormato').value = c.formato || 'enlinea';
    document.getElementById('certPrecio').value = c.precio || '';
    document.getElementById('certEnlace').value = c.enlace || '';
    document.getElementById('certImagen').value = c.imagen || '';
    document.getElementById('certForm').scrollIntoView({ behavior: 'smooth' });
  }

  function deleteCert(index) {
    if (!confirm('¿Eliminar esta certificación?')) return;
    const list = getCertificaciones();
    list.splice(index, 1);
    saveCertificaciones(list);
    renderCertificaciones();
  }

  // ══════════════════════════════════════════════
  //  STATS
  // ══════════════════════════════════════════════
  function updateStats() {
    const data = contentData || {};
    const promos = (data.promociones || []).length;
    const avisos = (data.avisos || []).length;
    const talleres = getTalleres().length;
    const certs = getCertificaciones().length;
    const sP = document.getElementById('statPromos'); if (sP) sP.textContent = promos;
    const sA = document.getElementById('statAvisos'); if (sA) sA.textContent = avisos;
    const sT = document.getElementById('statTalleres'); if (sT) sT.textContent = talleres;
    const sC = document.getElementById('statCerts'); if (sC) sC.textContent = certs;
  }

  // Export functions for global access
  window.adminApp = {
    deleteImage,
    setMenuImage,
    deleteRecomendacion,
    editRecomendacion,
    deleteNews,
    editNews,
    editBotItem,
    deleteBotItem,
    editGalleryItem,
    editTaller,
    deleteTaller,
    editCert,
    deleteCert,
    aprobarAnuncio,
    rechazarAnuncio,
    eliminarAnuncio,
    reloadAnuncios,
    editarAnuncio,
    cerrarModalEdicion,
    quitarImagenEdicion,
    guardarEdicionAnuncio
  };

  // ── Talleres form submit ──
  document.addEventListener('DOMContentLoaded', function() {
    const tallerForm = document.getElementById('tallerForm');
    if (tallerForm) {
      tallerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editId = document.getElementById('tallerEditId').value;
        const taller = {
          nombre: document.getElementById('tallerNombre').value.trim(),
          instructor: document.getElementById('tallerInstructor').value.trim(),
          descripcion: document.getElementById('tallerDescripcion').value.trim(),
          categoria: document.getElementById('tallerCategoria').value,
          modalidad: document.getElementById('tallerModalidad').value,
          fecha: document.getElementById('tallerFecha').value,
          duracion: document.getElementById('tallerDuracion').value.trim(),
          cupos: document.getElementById('tallerCupos').value,
          imagen: document.getElementById('tallerImagen').value.trim(),
          enlace: document.getElementById('tallerEnlace').value.trim(),
          id: editId !== '' ? getTalleres()[parseInt(editId)]?.id : ('t_' + Date.now())
        };
        const list = getTalleres();
        if (editId !== '') { list[parseInt(editId)] = taller; }
        else { list.push(taller); }
        saveTalleres(list);
        tallerForm.reset();
        document.getElementById('tallerEditId').value = '';
        renderTalleres();
        alert('✅ Taller guardado correctamente.');
      });
      document.getElementById('btnCancelTaller').addEventListener('click', function() {
        tallerForm.reset();
        document.getElementById('tallerEditId').value = '';
      });
    }

    // ── Certificaciones form submit ──
    const certForm = document.getElementById('certForm');
    if (certForm) {
      certForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editId = document.getElementById('certEditId').value;
        const cert = {
          nombre: document.getElementById('certNombre').value.trim(),
          proveedor: document.getElementById('certProveedor').value.trim(),
          descripcion: document.getElementById('certDescripcion').value.trim(),
          duracion: document.getElementById('certDuracion').value.trim(),
          nivel: document.getElementById('certNivel').value,
          formato: document.getElementById('certFormato').value,
          precio: document.getElementById('certPrecio').value.trim(),
          enlace: document.getElementById('certEnlace').value.trim(),
          imagen: document.getElementById('certImagen').value.trim(),
          id: editId !== '' ? getCertificaciones()[parseInt(editId)]?.id : ('c_' + Date.now())
        };
        const list = getCertificaciones();
        if (editId !== '') { list[parseInt(editId)] = cert; }
        else { list.push(cert); }
        saveCertificaciones(list);
        certForm.reset();
        document.getElementById('certEditId').value = '';
        renderCertificaciones();
        alert('✅ Certificación guardada correctamente.');
      });
      document.getElementById('btnCancelCert').addEventListener('click', function() {
        certForm.reset();
        document.getElementById('certEditId').value = '';
      });
    }

    // ── Theme Toggle ──
    const themeBtn = document.getElementById('adminThemeToggle');
    const themeLabel = document.getElementById('themeLabel');
    function applyTheme(isDark) {
      document.body.classList.toggle('admin-dark', isDark);
      localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
      if (themeLabel) themeLabel.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    }
    // Set initial label
    const isDark = localStorage.getItem('adminTheme') === 'dark';
    if (themeLabel) themeLabel.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        applyTheme(!document.body.classList.contains('admin-dark'));
      });
    }
  });

  // ══════════════════════════════════════════════
  //  ANUNCIOS COMUNIDAD (IIFE scope — accessible from switchSection & window.adminApp)
  // ══════════════════════════════════════════════

  async function renderAnunciosComunidad(filtro) {
    const lista = document.getElementById('anunciosList');
    const badge = document.getElementById('badgePendientes');
    if (!lista) return;

    const filtroSel = filtro || document.getElementById('filtroAnuncio')?.value || '';
    lista.innerHTML = '<p style="padding:1rem;color:var(--muted);">⏳ Cargando anuncios...</p>';

    try {
      let todos = await window.anunciosDB.getAll();

      // Badge de pendientes
      const pendientes = todos.filter(a => !a.aprobado && !a.rechazado).length;
      if (badge) { badge.textContent = pendientes; badge.style.display = pendientes > 0 ? 'inline' : 'none'; }

      // Filtro
      if (filtroSel === 'pendiente') {
        todos = todos.filter(a => !a.aprobado && !a.rechazado);
      } else if (filtroSel) {
        todos = todos.filter(a => a.categoria === filtroSel);
      }

      if (!todos.length) {
        lista.innerHTML = '<p style="padding:1rem;color:var(--muted);">No hay anuncios con este filtro.</p>';
        return;
      }

      const CAT_LABEL = { objetos_perdidos:'🔍 Objetos Perdidos', actividades:'🎉 Actividades', recaudaciones:'💰 Recaudaciones', avisos:'📢 Avisos', promociones:'🏷️ Promociones', aviso:'📢 Aviso' };
      const hoy = new Date().toISOString().slice(0, 10);

      lista.innerHTML = todos.map(a => {
        const caducado  = a.fecha_caducidad && a.fecha_caducidad < hoy;
        const estado    = a.rechazado ? '❌ Rechazado' : a.aprobado ? (caducado ? '⌛ Caducado' : '✅ Aprobado') : '⏳ Pendiente';
        const colorBg   = a.rechazado ? '#fff0f0' : a.aprobado ? (caducado ? '#f5f5f5' : '#f0fff4') : '#fffbea';
        const colorBdr  = a.rechazado ? '#e74c3c' : a.aprobado ? (caducado ? '#aaa' : '#27ae60') : '#f39c12';
        return `
        <div class="aac-card" style="border-left:4px solid ${colorBdr};background:${colorBg};">
          <div class="aac-row">
            <div class="aac-info">
              <div class="aac-title-row">
                <span class="aac-title">${a.titulo}</span>
                <span class="aac-cat">${CAT_LABEL[a.categoria] || a.categoria}</span>
                <span class="aac-status">${estado}</span>
              </div>
              <p class="aac-msg">${a.mensaje}</p>
              <div class="aac-meta">
                <span>👤 ${a.nombre_autor || 'Anónimo'}</span>
                ${a.contacto ? `<span>📞 ${a.contacto}</span>` : ''}
                <span>📅 ${new Date(a.created_at).toLocaleDateString()}</span>
                ${a.fecha_caducidad ? `<span>⏰ Caduca: ${a.fecha_caducidad}</span>` : ''}
              </div>
            </div>
            <div class="aac-actions">
              ${!a.aprobado && !a.rechazado ? `<button class="aac-btn aac-btn-aprobar" onclick="adminApp.aprobarAnuncio('${a.id}')">✅ Aprobar</button>` : ''}
              ${!a.rechazado ? `<button class="aac-btn aac-btn-rechazar" onclick="adminApp.rechazarAnuncio('${a.id}')">❌ Rechazar</button>` : ''}
              <button class="aac-btn aac-btn-editar" onclick="adminApp.editarAnuncio('${a.id}')" aria-label="Editar">✏️</button>
              <button class="aac-btn aac-btn-borrar" onclick="adminApp.eliminarAnuncio('${a.id}')" aria-label="Borrar">🗑️</button>
            </div>
          </div>
          ${a.imagen_url ? `<img class="aac-img" src="${a.imagen_url}" onerror="this.style.display='none'">` : ''}
        </div>`;
      }).join('');

      // Filtro select
      const sel = document.getElementById('filtroAnuncio');
      if (sel && !sel._bound) {
        sel._bound = true;
        sel.addEventListener('change', () => renderAnunciosComunidad(sel.value));
      }
    } catch (err) {
      lista.innerHTML = `<p style="color:#e74c3c;padding:1rem;">⚠️ Error al cargar: ${err.message}</p>`;
    }
  }

  async function aprobarAnuncio(id) {
    try { await window.anunciosDB.approve(id); renderAnunciosComunidad(); }
    catch(e) { alert('❌ Error: ' + e.message); }
  }
  async function rechazarAnuncio(id) {
    try { await window.anunciosDB.reject(id); renderAnunciosComunidad(); }
    catch(e) { alert('❌ Error: ' + e.message); }
  }
  async function eliminarAnuncio(id) {
    if (!confirm('¿Eliminar este anuncio permanentemente?')) return;
    try { await window.anunciosDB.remove(id); renderAnunciosComunidad(); }
    catch(e) { alert('❌ Error: ' + e.message); }
  }
  function reloadAnuncios() { renderAnunciosComunidad(); }

  // Cache del anuncio que se está editando
  let _anuncioEditando = null;

  async function editarAnuncio(id) {
    try {
      const todos = await window.anunciosDB.getAll();
      const a = todos.find(x => x.id === id);
      if (!a) return alert('No se encontró el anuncio.');
      _anuncioEditando = a;

      document.getElementById('editAnuncioId').value  = a.id;
      document.getElementById('editTitulo').value      = a.titulo || '';
      document.getElementById('editMensaje').value     = a.mensaje || '';
      document.getElementById('editCategoria').value   = a.categoria || 'aviso';
      document.getElementById('editCaducidad').value   = a.fecha_caducidad || '';
      document.getElementById('editAutor').value       = a.nombre_autor || '';
      document.getElementById('editContacto').value    = a.contacto || '';

      const prevWrap = document.getElementById('editImagenPreviewWrap');
      const prevImg  = document.getElementById('editImagenPreview');
      if (a.imagen_url) {
        prevImg.src = a.imagen_url;
        prevWrap.style.display = 'block';
      } else {
        prevWrap.style.display = 'none';
      }

      const modal = document.getElementById('modalEditarAnuncio');
      modal.style.display = 'flex';
    } catch(e) { alert('❌ Error al cargar: ' + e.message); }
  }

  function cerrarModalEdicion() {
    document.getElementById('modalEditarAnuncio').style.display = 'none';
    _anuncioEditando = null;
  }

  function quitarImagenEdicion() {
    if (_anuncioEditando) _anuncioEditando._quitarImagen = true;
    document.getElementById('editImagenPreviewWrap').style.display = 'none';
  }

  async function guardarEdicionAnuncio() {
    const id = document.getElementById('editAnuncioId').value;
    if (!id) return;
    const fields = {
      titulo:          document.getElementById('editTitulo').value.trim(),
      mensaje:         document.getElementById('editMensaje').value.trim(),
      categoria:       document.getElementById('editCategoria').value,
      fecha_caducidad: document.getElementById('editCaducidad').value || null,
      nombre_autor:    document.getElementById('editAutor').value.trim() || 'Anónimo',
      contacto:        document.getElementById('editContacto').value.trim() || null,
    };
    if (_anuncioEditando?._quitarImagen) fields.imagen_url = null;
    if (!fields.titulo || !fields.mensaje) return alert('El título y el mensaje son obligatorios.');
    try {
      await window.anunciosDB.update(id, fields);
      cerrarModalEdicion();
      renderAnunciosComunidad();
    } catch(e) { alert('❌ Error al guardar: ' + e.message); }
  }

  // Start the app
  init();
})();

