import { pdfService, type CotizacionPDFData } from './pdf';
import { excelService } from './excel';
import { notifications } from './notifications';
import { COMPANY_INFO, DEFAULT_QUOTE_TEXTS } from '../config/company';
import { QuoteHelper } from './quoteHelpers';

export type ExportFormat = 'pdf' | 'excel' | 'both';

export interface ExportData extends CotizacionPDFData {}

export const exportService = {
  /**
   * Export cotization in the specified format(s)
   */
  async exportCotizacion(data: ExportData, format: ExportFormat = 'pdf'): Promise<void> {
    try {
      notifications.loading('Generando archivo...', 'Preparando la exportación');

      switch (format) {
        case 'pdf':
          await this.exportToPDF(data);
          break;
        case 'excel':
          await this.exportToExcel(data);
          break;
        case 'both':
          await this.exportToBoth(data);
          break;
        default:
          throw new Error('Formato de exportación no válido');
      }

      // Close any loading notifications
      setTimeout(() => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.remove();
        }
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      notifications.error(
        'Error de exportación',
        error instanceof Error ? error.message : 'No se pudo exportar el archivo'
      );
    }
  },

  /**
   * Export to PDF format
   */
  async exportToPDF(data: ExportData): Promise<void> {
    try {
      await pdfService.downloadCotizacionPDF(data);
      notifications.success(
        '¡PDF generado!',
        'La cotización se ha descargado exitosamente'
      );
    } catch (error) {
      throw new Error('Error generando PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  },

  /**
   * Export to Excel format
   */
  async exportToExcel(data: ExportData): Promise<void> {
    try {
      await excelService.downloadCotizacionExcel(data);
      notifications.success(
        '¡Excel generado!',
        'La cotización se ha descargado exitosamente'
      );
    } catch (error) {
      throw new Error('Error generando Excel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  },

  /**
   * Export to both PDF and Excel formats
   */
  async exportToBoth(data: ExportData): Promise<void> {
    try {
      // Generate both files
      await Promise.all([
        pdfService.downloadCotizacionPDF(data),
        excelService.downloadCotizacionExcel(data)
      ]);

      notifications.success(
        '¡Archivos generados!',
        'Se han descargado tanto el PDF como el Excel'
      );
    } catch (error) {
      throw new Error('Error generando archivos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  },

  /**
   * Preview PDF in new window
   */
  async previewPDF(data: ExportData): Promise<void> {
    try {
      notifications.loading('Generando vista previa...', 'Preparando el PDF');
      await pdfService.previewCotizacionPDF(data);
      
      // Close loading notification
      setTimeout(() => {
        const swalContainer = document.querySelector('.swal2-container');
        if (swalContainer) {
          swalContainer.remove();
        }
      }, 500);
    } catch (error) {
      console.error('Preview error:', error);
      notifications.error(
        'Error de vista previa',
        'No se pudo generar la vista previa del PDF'
      );
    }
  },

  /**
   * Helper to safely format dates
   */
  formatDate(date: any): string {
    if (!date) return '';
    try {
      const d = (date && typeof date === 'object' && date.toDate) ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return '';
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '';
    }
  },

  /**
   * Validate export data before processing
   */
  validateExportData(data: Partial<ExportData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.cotizacion) {
      errors.push('Información de cotización requerida');
    } else {
      if (!data.cotizacion.numero) errors.push('Número de cotización requerido');
      if (!data.cotizacion.titulo) errors.push('Título de cotización requerido');
      if (typeof data.cotizacion.total !== 'number') errors.push('Total de cotización requerido');
    }

    if (!data.cliente) {
      errors.push('Información de cliente requerida');
    } else {
      if (!data.cliente.nombre) errors.push('Nombre de cliente requerido');
    }

    if (!data.empresa) {
      errors.push('Información de empresa requerida');
    } else {
      if (!data.empresa.nombre) errors.push('Nombre de empresa requerido');
      if (!data.empresa.direccion) errors.push('Dirección de empresa requerida');
      if (!data.empresa.telefono) errors.push('Teléfono de empresa requerido');
      if (!data.empresa.email) errors.push('Email de empresa requerido');
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Al menos un item es requerido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Get export format options for UI
   */
  getFormatOptions(): Array<{ value: ExportFormat; label: string; description: string }> {
    return [
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Documento profesional listo para imprimir'
      },
      {
        value: 'excel',
        label: 'Excel',
        description: 'Hoja de cálculo editable con múltiples pestañas'
      },
      {
        value: 'both',
        label: 'PDF + Excel',
        description: 'Ambos formatos para máxima flexibilidad'
      }
    ];
  },

  /**
   * Prepare export data from raw cotizacion data
   */
  prepareExportData(
    cotizacion: any,
    cliente: any,
    items: any[],
    empresa: any,
    venue?: any
  ): ExportData {
    return {
      cotizacion: {
        id: cotizacion.id,
        numero: QuoteHelper.getDisplayQuoteNumber(cotizacion),
        titulo: cotizacion.titulo || 'Sin título',
        descripcion: cotizacion.descripcion || '',
        fechaEvento: this.formatDate(cotizacion.fechaEvento || cotizacion.fecha_evento),
        fechaEventoFin: this.formatDate(cotizacion.fechaEventoFin || cotizacion.fecha_evento_fin),
        lugarEvento: cotizacion.lugarEvento || cotizacion.lugar_evento || '',
        duracionHoras: cotizacion.duracionHoras || cotizacion.duracion_horas || 24,
        duracionDias: cotizacion.duracionDias || cotizacion.duracion_dias || 1,
        requiereArmado: !!(cotizacion.requiereArmado || cotizacion.requiere_armado),
        subtotal: parseFloat(cotizacion.subtotal) || 0,
        descuento: parseFloat(cotizacion.descuento) || 0,
        total: parseFloat(cotizacion.total) || 0,
        observaciones: cotizacion.observaciones || DEFAULT_QUOTE_TEXTS.observaciones,
        condiciones: cotizacion.condiciones || DEFAULT_QUOTE_TEXTS.condiciones,
        vigenciaDias: cotizacion.vigenciaDias || cotizacion.vigencia_dias || 30,
        createdAt: this.formatDate(cotizacion.createdAt || cotizacion.created_at || new Date()),
        estado: cotizacion.estado || 'borrador'
      },
      cliente: {
        nombre: cliente?.nombre || 'Cliente sin nombre',
        empresa: cliente?.empresa || '',
        email: cliente?.email || '',
        telefono: cliente?.telefono || '',
        direccion: cliente?.direccion || ''
      },
      items: (items || []).map(item => ({
        nombre: item.nombre || item.name || 'Item sin nombre',
        descripcion: QuoteHelper.getDescriptionAsArray(item.descripcion),
        cantidad: item.cantidad || item.quantity || 1,
        precioUnitario: item.precioUnitario || item.precio_unitario || item.precio || 0,
        descuento: item.descuento || 0,
        subtotal: item.subtotal || item.total || ((item.cantidad || item.quantity || 1) * (item.precioUnitario || item.precio_unitario || item.precio || 0)),
        unidad: item.unidad || item.unit || 'und',
        observaciones: item.observaciones || item.notes || ''
      })),
      empresa: {
        nombre: empresa.nombre || 'Empresa',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        website: empresa.website || ''
      },
      venue: venue ? {
        nombre: venue.nombre,
        direccion: venue.direccion,
        capacidad: venue.capacidad
      } : undefined
    };
  }
};
