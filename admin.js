// Admin Dashboard JavaScript
(function () {
  'use strict';

  // Configuration
  const SECTIONS = {
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
    }
  };

  // State
  let currentSection = 'comedor';
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
    renderGallery();
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
    currentSection = section;

    // Update nav buttons
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Update title
    sectionTitle.textContent = SECTIONS[section].title;

    // Show/hide buttons based on section
    if (section === 'comedor') {
      btnEditMenu.style.display = 'inline-block';
      btnAddImage.style.display = 'inline-block';
    } else if (section === 'bot' || section === 'novedades') {
      btnEditMenu.style.display = 'none';
      btnAddImage.style.display = 'none';
    } else {
      btnEditMenu.style.display = 'none';
      btnAddImage.style.display = 'inline-block';
    }

    // Show/hide sections
    if (section === 'bot') {
      galleryGrid.style.display = 'none';
      emptyState.style.display = 'none';
      botConfigSection.style.display = 'block';
      recomendacionesAdminSection.style.display = 'none';
      novedadesSection.style.display = 'none';
      renderBotConfig();
    } else if (section === 'novedades') {
      galleryGrid.style.display = 'none';
      emptyState.style.display = 'none';
      botConfigSection.style.display = 'none';
      recomendacionesAdminSection.style.display = 'none';
      novedadesSection.style.display = 'block';
      renderNovedades();
    } else if (section === 'comedor') {
      galleryGrid.style.display = 'grid';
      botConfigSection.style.display = 'none';
      recomendacionesAdminSection.style.display = 'block';
      novedadesSection.style.display = 'none';
      renderRecomendaciones();
    } else {
      galleryGrid.style.display = 'grid';
      botConfigSection.style.display = 'none';
      recomendacionesAdminSection.style.display = 'none';
      novedadesSection.style.display = 'none';
    }

    // Hide forms and render gallery
    hideUploadForm();
    hideMenuEditor();
    if (section !== 'bot') {
      renderGallery();
    }
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

  // ── Gestión de Novedades ────────────────────────────────────────────────

  function renderNovedades() {
    const newsList = document.getElementById('newsList');
    const newsForm = document.getElementById('newsForm');
    if (!newsList || !newsForm) return;

    function renderNews() {
      if (!window.serviceManager) {
        newsList.innerHTML = '<li style="color:#e74c3c; padding:10px;">⚠️ Error: services-manager no disponible.</li>';
        return;
      }
      const allNews = window.serviceManager.getAllNews();
      if (allNews.length === 0) {
        newsList.innerHTML = '<li style="color:#95a5a6; padding:10px;">No hay noticias activas.</li>';
        return;
      }
      const sorted = [...allNews].sort((a, b) => new Date(b.date) - new Date(a.date));
      newsList.innerHTML = sorted.map((news, i) => `
        <li style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:${i === 0 ? '#f0f9ff' : 'transparent'};">
          <div style="display:flex; align-items:center; gap:15px;">
            ${news.imageUrl
              ? `<img src="${news.imageUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">`
              : `<div style="width:50px; height:50px; background:#eee; border-radius:6px; display:flex; align-items:center; justify-content:center;">📷</div>`}
            <div>
              <strong style="color:#2c3e50;">${news.title}</strong>
              ${i === 0 ? '<span style="background:#2ecc71; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">ACTIVA</span>' : ''}
              <p style="margin:0; color:#7f8c8d; font-size:0.9rem;">${news.message}</p>
              <small style="color:#95a5a6;">${new Date(news.date).toLocaleDateString()} ${new Date(news.date).toLocaleTimeString()}</small>
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
    }

    // Bind submit only once
    if (!newsForm._bound) {
      newsForm._bound = true;
      newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!window.serviceManager) return;
        const title = document.getElementById('newsTitle').value;
        const message = document.getElementById('newsMessage').value;
        const imageUrl = document.getElementById('newsImage').value;
        window.serviceManager.addNews({ title, message, imageUrl });
        newsForm.reset();
        renderNews();
        alert('✅ Noticia publicada. Aparecerá en el popup de la página principal.');
      });
    }

    renderNews();
  }

  function editNews(id) {
    if (!window.serviceManager) return;
    const all = window.serviceManager.getAllNews();
    const news = all.find(n => n.id === id);
    if (!news) return;
    newsToEditId = id;
    editNewsTitle.value = news.title || '';
    editNewsMessage.value = news.message || '';
    editNewsImageUrl.value = news.imageUrl || '';
    editNewsModal.classList.add('active');
  }

  function closeNewsModal() {
    editNewsModal.classList.remove('active');
    newsToEditId = null;
    editNewsTitle.value = '';
    editNewsMessage.value = '';
    editNewsImageUrl.value = '';
  }

  function saveNewsEdit() {
    if (!newsToEditId || !window.serviceManager) return;
    const title = editNewsTitle.value.trim();
    const message = editNewsMessage.value.trim();
    if (!title || !message) { alert('⚠️ El título y el mensaje son obligatorios.'); return; }
    window.serviceManager.updateNews(newsToEditId, {
      title,
      message,
      imageUrl: editNewsImageUrl.value.trim()
    });
    closeNewsModal();
    renderNovedades();
  }

  function deleteNews(id) {
    if (!window.serviceManager) return;
    if (confirm('¿Seguro que deseas eliminar esta noticia?')) {
      window.serviceManager.deleteNews(id);
      renderNovedades();
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
    editGalleryItem
  };

  // Start the app
  init();
})();

