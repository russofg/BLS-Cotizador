import Swal from 'sweetalert2';

// Configuración base para SweetAlert2
// Configuración base para SweetAlert2 Premium
const defaultConfig = {
  customClass: {
    container: 'premium-swal-container',
    popup: 'rounded-[2rem] shadow-premium-lg border-0 dark:bg-gray-900 dark:text-gray-100 p-8',
    title: 'font-heading font-black text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-4',
    htmlContainer: 'text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium',
    confirmButton: 'px-8 py-4 rounded-2xl font-heading font-black text-xs uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-lg shadow-primary-500/30 border-0 outline-none',
    cancelButton: 'px-8 py-4 rounded-2xl font-heading font-black text-xs uppercase tracking-widest bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 transition-all border-0 outline-none',
    actions: 'gap-4 mt-8',
    icon: 'border-2 scale-75'
  },
  buttonsStyling: false, // Desactivar estilos por defecto para usar clases de Tailwind
  showCloseButton: true,
  reverseButtons: true,
  heightAuto: false,
  scrollbarPadding: false,
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  },
  willOpen: () => {
    document.body.removeAttribute('aria-hidden');
    const mainContent = document.querySelector('.min-h-screen.bg-gray-50');
    if (mainContent) mainContent.removeAttribute('aria-hidden');
  },
  didClose: () => {
    document.body.removeAttribute('aria-hidden');
    const mainContent = document.querySelector('.min-h-screen.bg-gray-50');
    if (mainContent) mainContent.removeAttribute('aria-hidden');
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

  // Confirmación de eliminación Premium
  confirmDelete: (itemName?: string) => {
    return Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: '¿Confirmar eliminación?',
      text: itemName ? `Se eliminará permanentemente "${itemName}".` : 'Esta acción es irreversible y no se podrá deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'px-8 py-4 rounded-2xl font-heading font-black text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-500/30 border-0 outline-none',
      }
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

  // Toast Premium (notificación pequeña)
  toast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    return Swal.fire({
      icon: type,
      title: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'rounded-2xl shadow-premium border-0 bg-white dark:bg-gray-800 p-4',
        title: 'text-sm font-heading font-extrabold text-gray-900 dark:text-white ml-2 uppercase tracking-tight',
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
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
