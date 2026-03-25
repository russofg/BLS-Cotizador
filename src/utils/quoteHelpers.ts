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
      const fallbackDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return `COT-001-${fallbackDate}-CLIENTE-EVENTO`;
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
   * Obtiene la descripción como un array, manejando tanto strings como arrays existentes.
   * Prioriza el formato de array de Firestore para viñetas perfectas.
   */
  static getDescriptionAsArray(descripcion: string | string[] | undefined | null): string[] {
    if (!descripcion) return [];
    
    if (Array.isArray(descripcion)) {
      return descripcion.map(d => String(d).trim()).filter(d => d.length > 0);
    }
    
    // Si es un string, NO dividimos por coma automáticamente porque puede romper frases 
    // (ej: "Operador responsable, uniformado" no debe separarse).
    // Dividimos por saltos de línea si existen, de lo contrario tratamos como un único bloque.
    const text = String(descripcion).trim();
    if (text.includes('\n')) {
      return text.split('\n').map(d => d.trim()).filter(d => d.length > 0);
    }
    
    return [text];
  }

  /**
   * Formatea un item para mostrar en la UI con soporte para viñetas
   */
  static formatItemForDisplay(item: QuoteItem): { name: string; description: string; descriptionArray: string[]; displayText: string } {
    let itemName = item.nombre || '';
    const descriptionArray = this.getDescriptionAsArray(item.descripcion);
    let itemDescription = descriptionArray.join(', ');
    
    // Si no hay nombre separado, intentar extraer de la descripción
    if (!itemName && descriptionArray.length > 0) {
      itemName = descriptionArray[0];
      // Si el nombre fue extraído del primer elemento, lo quitamos del array si hay más
      if (descriptionArray.length > 1) {
        // descriptionArray.shift(); // No mutar el original si es posible
      }
    }
    
    // Asegurar que trabajamos con strings
    itemName = String(itemName || '').trim();
    
    // Construir texto de visualización con viñetas si hay múltiples elementos
    let displayText = '';
    if (itemName) {
      displayText = `<strong>${itemName}</strong>`;
      if (descriptionArray.length > 0) {
        if (descriptionArray.length === 1 && descriptionArray[0] === itemName) {
          // No repetir si es igual
        } else {
          const listItems = descriptionArray
            .filter(d => d !== itemName)
            .map(d => `<li class="ml-4 list-disc">${d}</li>`)
            .join('');
          
          if (listItems) {
            displayText += `<ul class="mt-1 space-y-0.5">${listItems}</ul>`;
          }
        }
      }
    } else if (descriptionArray.length > 0) {
      const listItems = descriptionArray
        .map(d => `<li class="ml-4 list-disc">${d}</li>`)
        .join('');
      displayText = `<ul class="mt-1 space-y-0.5">${listItems}</ul>`;
    } else {
      displayText = 'Item sin descripción';
    }
    
    return {
      name: itemName,
      description: itemDescription,
      descriptionArray: descriptionArray,
      displayText
    };
  }

  /**
   * Enriquece una cotización con datos del cliente
   */
  static enrichQuoteWithClient(cotizacion: Quote, clientes: Client[]): Quote & { cliente_nombre: string; cliente?: Client } {
    const cliente = clientes.find(c => c.id === cotizacion.cliente_id || c.id === cotizacion.clienteId);
    
    return {
      ...cotizacion,
      cliente,
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
      descripcion: (normalized as any).descripcion || '',
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
   * Obtiene la información de estado de una cotización de forma robusta y normalizada.
   * Maneja variaciones de género (masculino/femenino) y mayúsculas/minúsculas.
   */
  static getQuoteStatusInfo(estado: string): { text: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'; bgClass: string; textClass: string } {
    const s = String(estado || 'borrador').toLowerCase().trim();
    
    // Mapeo robusto que incluye variantes comunes
    if (s.includes('borrador')) {
      return { text: 'Borrador', variant: 'secondary', bgClass: 'bg-gray-100 dark:bg-gray-700', textClass: 'text-gray-800 dark:text-gray-200' };
    }
    
    if (s.includes('enviad')) { // enviado, enviada
      return { text: 'Enviado', variant: 'info', bgClass: 'bg-blue-100 dark:bg-blue-900', textClass: 'text-blue-800 dark:text-blue-200' };
    }
    
    if (s.includes('aprob')) { // aprobado, aprobada
      return { text: 'Aprobado', variant: 'success', bgClass: 'bg-green-100 dark:bg-green-900', textClass: 'text-green-800 dark:text-green-200' };
    }
    
    if (s.includes('recha')) { // rechazado, rechazada
      return { text: 'Rechazado', variant: 'danger', bgClass: 'bg-red-100 dark:bg-red-900', textClass: 'text-red-800 dark:text-red-200' };
    }
    
    if (s.includes('pendien')) {
      return { text: 'Pendiente', variant: 'warning', bgClass: 'bg-amber-100 dark:bg-amber-900', textClass: 'text-amber-800 dark:text-amber-200' };
    }
    
    // Caso por defecto
    return { text: 'Desconocido', variant: 'primary', bgClass: 'bg-gray-100 dark:bg-gray-600', textClass: 'text-gray-800 dark:text-gray-200' };
  }
}
