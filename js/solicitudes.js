/**
 * Solicitudes.js - Maneja la interacción del formulario de solicitud de documentos
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('documentRequestForm');
    const formContainer = document.getElementById('requestFormContainer');
    const successMessage = document.getElementById('successMessage');
    const ticketIdDisplay = document.getElementById('ticketIdDisplay');

    // --- Vista previa de licencia ---
    const licenciaInput = document.getElementById('licenciaFoto');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const licenciaPreview = document.getElementById('licenciaPreview');

    if (licenciaInput) {
        licenciaInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                fileNameDisplay.textContent = '✅ ' + file.name;
                const reader = new FileReader();
                reader.onload = function (e) {
                    licenciaPreview.src = e.target.result;
                    licenciaPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = '';
                licenciaPreview.style.display = 'none';
                licenciaPreview.src = '';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        // 1. Recopilar datos del formulario
        const formData = new FormData(form);
        const requestData = {
            type: formData.get('type'),
            studentName: formData.get('studentName'),
            studentId: formData.get('studentId'),
            grade: formData.get('grade'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            details: formData.get('details')
        };

        // 2. Validaciones básicas (adicionales a HTML5)
        if (!validateForm(requestData)) {
            return;
        }

        // 3. Enviar al Service Manager
        try {
            const btnSubmit = form.querySelector('.btn-submit');
            const originalText = btnSubmit.innerText;

            // Simular carga
            btnSubmit.disabled = true;
            btnSubmit.innerText = 'Procesando...';

            setTimeout(() => {
                // Crear la solicitud
                const newTicket = window.serviceManager.createDocumentRequest(requestData);

                // 4. Mostrar confirmación
                showSuccess(newTicket);
            }, 1000); // Pequeño delay para UX

        } catch (error) {
            console.error('Error al procesar solicitud:', error);
            alert('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
        }
    }

    function validateForm(data) {
        // Validación de SIE (Debe ser numérico)
        if (!/^\d+$/.test(data.studentId)) {
            alert('El número de estudiante debe contener solo números.');
            return false;
        }

        // Validación de foto de licencia
        const licenciaInput = document.getElementById('licenciaFoto');
        if (!licenciaInput || !licenciaInput.files || licenciaInput.files.length === 0) {
            alert('⚠️ Debe adjuntar una foto de su licencia o identificación oficial para continuar.');
            licenciaInput && licenciaInput.focus();
            return false;
        }

        const file = licenciaInput.files[0];
        const maxSize = 5 * 1024 * 1024; // 5 MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            alert('⚠️ El archivo debe ser una imagen en formato JPG, PNG o WEBP.');
            return false;
        }

        if (file.size > maxSize) {
            alert('⚠️ El archivo supera el tamaño máximo permitido de 5 MB.');
            return false;
        }

        return true;
    }

    function showSuccess(ticket) {
        // Ocultar formulario y mostrar mensaje de éxito
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';

        // Mostrar ID del ticket
        ticketIdDisplay.textContent = ticket.id;

        // Opcional: Simular envío de notificación visual
        // alert(`📧 Se ha enviado un correo de confirmación a: ${ticket.email}`);
    }
});
