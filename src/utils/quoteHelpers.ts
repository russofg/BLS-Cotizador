/**
 * Utilidades centralizadas para el manejo de cotizaciones
 * Incluye generación de números, normalización de datos y cálculos
 */

import { DateHelper } from './dateHelpers';

export interface QuoteItem {
  id?: string;
  item_id?: string | null;
  nombre?: string;
  descripcion?: string | string[];
  cantidad?: number;
  precio_unitario?: number;
  precioBase?: number;
  precio_original?: number;
  unidad?: string;
  subtotal?: number;
  total?: number;
  observaciones?: string;
}

export interface Quote {
  id?: string;
  numero?: string;
  cliente_id?: string;
  clienteId?: string;
  titulo?: string;
  fecha_evento?: any;
  fechaEvento?: any;
  fecha_evento_fin?: any;
  fechaEventoFin?: any;
  duracion_dias?: number;
  duracion_horas?: number;
  requiere_armado?: boolean;
  estado?: string;
  subtotal?: number;
  descuento?: number;
  total?: number;
  items?: QuoteItem[] | { [key: string]: QuoteItem };
  observaciones?: string;
  condiciones?: string;
  lugar_evento?: string;
  created_at?: any;
  createdAt?: any;
}

export interface Client {
  id: string;
  nombre: string;
  empresa?: string;
}

export class QuoteHelper {
  /**
   * Genera un número de cotización mejorado basado en la fecha, cliente y evento
   */
  static generateQuoteNumber(cotizacion: Quote, cliente?: Client): string {
    try {
      // Si ya tiene un número válido, usarlo
      if (cotizacion.numero && !cotizacion.numero.includes('mvG2cFN4sBXIfjxxnYAL')) {
        return cotizacion.numero;
      }

      // Generar número basado en fecha de creación
      const fechaCreacion = cotizacion.created_at ? new Date(cotizacion.created_at) : new Date(cotizacion.createdAt || Date.now());
      const fechaFormateada = fechaCreacion.toISOString().slice(0, 10).replace(/-/g, "");
      
      // Obtener nombre del cliente
      const clienteNombre = (cliente?.nombre || "CLIENTE")
        .replace(/\s+/g, "")
        .substring(0, 10)
        .toUpperCase();
      
      // Obtener nombre del evento
      const eventoNombre = (cotizacion.titulo || "EVENTO")
        .replace(/\s+/g, "")
        .substring(0, 10)
        .toUpperCase();
      
      // Número secuencial (por ahora fijo, se puede mejorar con contador)
      const numeroSecuencial = "001";
      
      return `COT-${numeroSecuencial}-${fechaFormateada}-${clienteNombre}-${eventoNombre}`;
    } catch (error) {
      console.error('Error generating quote number:', error);
      return `COT-001-${DateHelper.getCurrentDateString().replace(/-/g, "")}-CLIENTE-EVENTO`;
    }
  }

  /**
   * Normaliza los items de una cotización para asegurar que sea un array
   */
  static normalizeItems(items: any): QuoteItem[] {
    if (!items) return [];
    
    if (Array.isArray(items)) {
      return items;
    }
    
    if (typeof items === 'object') {
      return Object.values(items);
    }
    
    return [];
  }

  /**
   * Normaliza los datos de una cotización para compatibilidad
   */
  static normalizeQuoteData(cotizacion: any): Quote {
    const normalized = { ...cotizacion };
    
    // Normalizar items
    normalized.items = this.normalizeItems(cotizacion.items);
    
    // Asegurar compatibilidad de campos de cliente
    if (normalized.cliente_id && !normalized.clienteId) {
      normalized.clienteId = normalized.cliente_id;
    }
    if (normalized.clienteId && !normalized.cliente_id) {
      normalized.cliente_id = normalized.clienteId;
    }
    
    // Asegurar compatibilidad de campos de fecha
    if (normalized.fecha_evento && !normalized.fechaEvento) {
      normalized.fechaEvento = normalized.fecha_evento;
    }
    if (normalized.fechaEvento && !normalized.fecha_evento) {
      normalized.fecha_evento = normalized.fechaEvento;
    }
    
    if (normalized.fecha_evento_fin && !normalized.fechaEventoFin) {
      normalized.fechaEventoFin = normalized.fecha_evento_fin;
    }
    if (normalized.fechaEventoFin && !normalized.fecha_evento_fin) {
      normalized.fecha_evento_fin = normalized.fechaEventoFin;
    }
    
    // Asegurar compatibilidad de campos de creación
    if (normalized.created_at && !normalized.createdAt) {
      normalized.createdAt = normalized.created_at;
    }
    if (normalized.createdAt && !normalized.created_at) {
      normalized.created_at = normalized.createdAt;
    }
    
    return normalized;
  }

  /**
   * Calcula los totales de una cotización
   */
  static calculateTotals(items: QuoteItem[], descuento: number = 0): { subtotal: number; descuentoMonto: number; total: number } {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(String(item.cantidad || 0)) || 0;
      const precio = parseFloat(String(item.precio_unitario || item.precioBase || 0)) || 0;
      return sum + (cantidad * precio);
    }, 0);
    
    const descuentoMonto = (subtotal * descuento) / 100;
    const total = subtotal - descuentoMonto;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100, // Redondear a 2 decimales
      descuentoMonto: Math.round(descuentoMonto * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Calcula la duración de un evento basado en fechas
   */
  static calculateEventDuration(fechaInicio: any, fechaFin?: any): number {
    try {
      const startDate = DateHelper.safeParseDate(fechaInicio);
      if (!startDate) return 1;
      
      if (fechaFin) {
        const endDate = DateHelper.safeParseDate(fechaFin);
        if (endDate) {
          return DateHelper.calculateDurationInDays(startDate, endDate);
        }
      }
      
      return 1;
    } catch (error) {
      console.error('Error calculating event duration:', error);
      return 1;
    }
  }

  /**
   * Calcula la fecha de fin automáticamente si no está presente
   */
  static calculateEndDateIfMissing(cotizacion: Quote): Quote {
    const normalized = { ...cotizacion };
    
    try {
      const fechaInicio = normalized.fechaEvento || normalized.fecha_evento;
      const fechaFin = normalized.fechaEventoFin || normalized.fecha_evento_fin;
      const duracionDias = normalized.duracion_dias || 1;
      
      if (fechaInicio && !fechaFin && duracionDias > 1) {
        const startDate = DateHelper.safeParseDate(fechaInicio);
        if (startDate) {
          const endDate = DateHelper.calculateEndDate(startDate, duracionDias);
          normalized.fechaEventoFin = endDate;
          normalized.fecha_evento_fin = DateHelper.safeFormatDateForInput(endDate);
        }
      } else if (fechaInicio && !fechaFin) {
        // Si solo hay fecha de inicio, usar la misma fecha para fin
        normalized.fechaEventoFin = fechaInicio;
        normalized.fecha_evento_fin = fechaInicio;
      }
      
      return normalized;
    } catch (error) {
      console.error('Error calculating end date:', error);
      return normalized;
    }
  }

  /**
   * Valida los datos básicos de una cotización
   */
  static validateQuoteData(cotizacion: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!cotizacion.cliente_id && !cotizacion.clienteId) {
      errors.push('Cliente es obligatorio');
    }
    
    if (!cotizacion.titulo) {
      errors.push('Título es obligatorio');
    }
    
    if (cotizacion.fecha_evento || cotizacion.fechaEvento) {
      const startDate = DateHelper.safeParseDate(cotizacion.fecha_evento || cotizacion.fechaEvento);
      const endDate = DateHelper.safeParseDate(cotizacion.fecha_evento_fin || cotizacion.fechaEventoFin);
      
      if (startDate && endDate && !DateHelper.validateDateRange(startDate, endDate)) {
        errors.push('La fecha de fin debe ser posterior o igual a la fecha de inicio');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatea un item para mostrar en la UI
   */
  static formatItemForDisplay(item: QuoteItem): { name: string; description: string; displayText: string } {
    let itemName = item.nombre || '';
    let itemDescription = '';
    
    // Manejar descripción que puede ser array o string
    if (Array.isArray(item.descripcion)) {
      itemDescription = item.descripcion.join(', ');
    } else if (item.descripcion) {
      itemDescription = item.descripcion;
    }
    
    // Si no hay nombre separado, intentar extraer de la descripción
    if (!itemName && itemDescription) {
      itemName = itemDescription.split('.')[0] || itemDescription.substring(0, 50) + '...';
    }
    
    // Asegurar que trabajamos con strings
    itemName = String(itemName || '').trim();
    itemDescription = String(itemDescription || '').trim();
    
    // Construir texto de visualización
    let displayText = '';
    if (itemName) {
      displayText = `<strong>${itemName}</strong>`;
      if (itemDescription && itemDescription !== itemName) {
        displayText += `<br><span class="text-gray-600">${itemDescription}</span>`;
      }
    } else if (itemDescription) {
      displayText = itemDescription;
    } else {
      displayText = 'Item sin descripción';
    }
    
    return {
      name: itemName,
      description: itemDescription,
      displayText
    };
  }

  /**
   * Enriquece una cotización con datos del cliente
   */
  static enrichQuoteWithClient(cotizacion: Quote, clientes: Client[]): Quote & { cliente_nombre: string } {
    const cliente = clientes.find(c => c.id === cotizacion.cliente_id || c.id === cotizacion.clienteId);
    
    return {
      ...cotizacion,
      cliente_nombre: cliente 
        ? `${cliente.nombre}${cliente.empresa ? ` - ${cliente.empresa}` : ""}`
        : "Sin cliente"
    };
  }

  /**
   * Prepara datos de cotización para exportación
   */
  static prepareQuoteForExport(cotizacion: Quote, cliente?: Client): any {
    const normalized = this.normalizeQuoteData(cotizacion);
    
    return {
      numero: this.generateQuoteNumber(normalized, cliente),
      titulo: normalized.titulo || 'Sin título',
      descripcion: normalized.descripcion || '',
      fecha_evento: DateHelper.safeFormatDate(normalized.fechaEvento || normalized.fecha_evento),
      fecha_evento_fin: DateHelper.safeFormatDate(normalized.fechaEventoFin || normalized.fecha_evento_fin),
      lugar_evento: normalized.lugar_evento || '',
      duracion_dias: normalized.duracion_dias || 1,
      requiere_armado: normalized.requiere_armado || false,
      subtotal: normalized.subtotal || 0,
      descuento: normalized.descuento || 0,
      total: normalized.total || 0,
      observaciones: normalized.observaciones || '',
      condiciones: normalized.condiciones || '',
      estado: normalized.estado || 'borrador',
      items: this.normalizeItems(normalized.items).map(item => ({
        nombre: item.nombre || 'Artículo sin nombre',
        descripcion: Array.isArray(item.descripcion) ? item.descripcion : (item.descripcion ? [item.descripcion] : []),
        cantidad: parseFloat(String(item.cantidad || 0)) || 1,
        precio_unitario: parseFloat(String(item.precio_unitario || item.precioBase || 0)) || 0,
        unidad: item.unidad || 'servicio',
        subtotal: parseFloat(String(item.subtotal || item.total || 0)) || 0
      }))
    };
  }

  /**
   * Obtiene el estado de una cotización con formato legible
   */
  static getQuoteStatusDisplay(estado: string): { text: string; class: string } {
    const statusMap: Record<string, { text: string; class: string }> = {
      'borrador': { text: 'Borrador', class: 'bg-gray-100 text-gray-800' },
      'enviado': { text: 'Enviado', class: 'bg-blue-100 text-blue-800' },
      'aprobado': { text: 'Aprobado', class: 'bg-green-100 text-green-800' },
      'rechazado': { text: 'Rechazado', class: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[estado] || { text: 'Desconocido', class: 'bg-gray-100 text-gray-800' };
  }
}
