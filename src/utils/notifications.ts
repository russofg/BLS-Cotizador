import Swal from 'sweetalert2';

// Configuración base para SweetAlert2
const defaultConfig = {
  confirmButtonColor: '#3b82f6', // primary-500
  cancelButtonColor: '#ef4444',   // red-500
  showCloseButton: true,
  reverseButtons: true,
  // Evitar que SweetAlert2 interfiera con aria-hidden
  heightAuto: false,
  scrollbarPadding: false,
  // Configurar para que no modifique aria-hidden del DOM
  willOpen: () => {
    // Remover aria-hidden que SweetAlert2 puede haber añadido
    document.body.removeAttribute('aria-hidden');
    const mainContent = document.querySelector('.min-h-screen.bg-gray-50');
    if (mainContent) {
      mainContent.removeAttribute('aria-hidden');
    }
  },
  didClose: () => {
    // Asegurar que se limpie aria-hidden después de cerrar
    document.body.removeAttribute('aria-hidden');
    const mainContent = document.querySelector('.min-h-screen.bg-gray-50');
    if (mainContent) {
      mainContent.removeAttribute('aria-hidden');
    }
  }
};

// Tipos de notificaciones
export const notifications = {
  // Notificación de éxito
  success: (title: string, message?: string) => {
    // Para los toasts, no usamos defaultConfig para evitar warnings
    if (message) {
      // Notificación normal
      return Swal.fire({
        ...defaultConfig,
        icon: 'success',
        title,
        text: message,
        confirmButtonText: 'Entendido'
      });
    } else {
      // Toast (notificación pequeña)
      return Swal.fire({
        icon: 'success',
        title,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
          // Asegurar que no se modifique aria-hidden
          document.body.removeAttribute('aria-hidden');
        }
      });
    }
  },

  // Notificación de error
  error: (title: string, message?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    });
  },

  // Notificación de advertencia
  warning: (title: string, message?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    });
  },

  // Notificación informativa
  info: (title: string, message?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    });
  },

  // Confirmación con botones Sí/No
  confirm: (title: string, message?: string, confirmText = 'Sí, continuar', cancelText = 'Cancelar') => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
  },

  // Confirmación de eliminación
  confirmDelete: (itemName?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: '¿Estás seguro?',
      text: itemName ? `Se eliminará "${itemName}" permanentemente.` : 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444' // Rojo para eliminación
    });
  },

  // Loading/procesando
  loading: (title: string, message?: string) => {
    return Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Toast simple (notificación pequeña)
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    return Swal.fire({
      icon: type,
      title: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
        // Asegurar que no se modifique aria-hidden
        document.body.removeAttribute('aria-hidden');
      }
    });
  },

  // Notificación de formulario con input
  input: (title: string, inputPlaceholder = '', inputType: 'text' | 'email' | 'password' | 'textarea' = 'text') => {
    return Swal.fire({
      ...defaultConfig,
      title,
      input: inputType,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Este campo es requerido';
        }
      }
    });
  }
};

// Función para cerrar cualquier notificación activa
export const closeNotification = () => {
  Swal.close();
};

// Exportar Swal para uso directo si es necesario
export { Swal };
