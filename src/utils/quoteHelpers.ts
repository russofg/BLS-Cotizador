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
  /** Formato estándar visible en PDF/UI: AAAA-NNNN (ej. 2026-0001). */
  private static readonly STANDARD_QUOTE_NUM = /^(\d{4})-(\d+)$/;

  private static quoteCreatedToDate(cotizacion: any): Date | null {
    const v = cotizacion?.created_at ?? cotizacion?.createdAt;
    if (!v) return null;
    if (typeof v === 'object' && typeof v.toDate === 'function') {
      const d = v.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  /** Secuencia estable 0001–9999 a partir del id (cotizaciones legacy sin número estándar). */
  private static stableSeqFromId(id: string): string {
    let n = 0;
    for (let i = 0; i < id.length; i++) {
      n = (n * 33 + id.charCodeAt(i)) >>> 0;
    }
    return String((n % 9999) + 1).padStart(4, '0');
  }

  /**
   * Número de cotización para mostrar (PDF, listas, vistas): siempre AAAA-NNNN cuando no hay otro criterio.
   */
  static getDisplayQuoteNumber(cotizacion: any): string {
    try {
      if (!cotizacion || typeof cotizacion !== 'object') {
        return `${new Date().getFullYear()}-0001`;
      }

      const raw = String(cotizacion.numero ?? '').trim();
      const id = String(cotizacion.id ?? '');

      const std = raw.match(QuoteHelper.STANDARD_QUOTE_NUM);
      if (std) {
        return `${std[1]}-${std[2].padStart(4, '0')}`;
      }

      const created = QuoteHelper.quoteCreatedToDate(cotizacion);
      const yearFromCreated = created ? created.getFullYear() : new Date().getFullYear();

      // Legacy: COT-<timestamp en ms>
      const cotTs = raw.match(/^COT-(\d{13,})$/);
      if (cotTs) {
        const ts = parseInt(cotTs[1], 10);
        const d = new Date(ts);
        const y = isNaN(d.getTime()) ? yearFromCreated : d.getFullYear();
        const seq = String(ts % 10000).padStart(4, '0');
        return `${y}-${seq}`;
      }

      if (raw.includes('mvG2cFN4sBXIfjxxnYAL')) {
        return `${yearFromCreated}-${QuoteHelper.stableSeqFromId(id)}`;
      }

      // COT-001-YYYYMMDD-... (formato antiguo largo)
      const longCot = raw.match(/^COT-\d{3}-(\d{4})(\d{2})(\d{2})-/);
      if (longCot) {
        const y = parseInt(longCot[1], 10);
        return `${y}-${QuoteHelper.stableSeqFromId(id)}`;
      }

      if (raw && raw.length <= 24 && !raw.startsWith('COT-')) {
        return raw;
      }

      return `${yearFromCreated}-${QuoteHelper.stableSeqFromId(id)}`;
    } catch (error) {
      console.error('Error getDisplayQuoteNumber:', error);
      return `${new Date().getFullYear()}-0001`;
    }
  }

  /**
   * Siguiente número AAAA-NNNN para el año dado, según cotizaciones ya guardadas.
   */
  static computeNextQuoteNumberForYear(
    existing: Array<{ numero?: string }>,
    year: number
  ): string {
    let max = 0;
    const re = new RegExp(`^${year}-(\\d+)$`);
    for (const q of existing) {
      const n = String(q?.numero ?? '').trim();
      const m = n.match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return `${year}-${String(max + 1).padStart(4, '0')}`;
  }

  /**
   * Número legible para la UI (alias de getDisplayQuoteNumber; mantiene firma con cliente por compatibilidad).
   */
  static generateQuoteNumber(cotizacion: Quote, _cliente?: Client): string {
    return QuoteHelper.getDisplayQuoteNumber(cotizacion);
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
   * Quita viñeta duplicada al inicio de una línea (PDF/UI agregan "• " aparte).
   */
  private static stripLeadingBullet(line: string): string {
    return line.replace(/^[•\u2022\-*]\s*/u, '').trim();
  }

  /**
   * Parte un texto en líneas para bullets: \n primero; si hay varios "•" en una sola tira, también separa.
   * No parte por comas (evita romper frases con comas).
   */
  private static splitDescriptionPlainText(text: string): string[] {
    const t = text.trim();
    if (!t) return [];

    if (/[\r\n]/.test(t)) {
      return t
        .split(/\r?\n/)
        .map((line) => this.stripLeadingBullet(line))
        .filter((line) => line.length > 0);
    }

    const bulletPattern = /(?:•|\u2022)/g;
    const matches = t.match(bulletPattern);
    if (matches && matches.length >= 2) {
      return t
        .split(/\s*(?:•|\u2022)\s*/)
        .map((line) => this.stripLeadingBullet(line))
        .filter((line) => line.length > 0);
    }

    return [];
  }

  /**
   * Líneas para mostrar condiciones u observaciones como lista en la vista (no parte por comas).
   * Prioriza saltos de línea; si es una sola línea, separa por ". " en oraciones.
   */
  static getCondicionesLines(condiciones: string | string[] | undefined | null): string[] {
    if (condiciones === undefined || condiciones === null) return [];
    if (Array.isArray(condiciones)) {
      return condiciones.map((c) => String(c).trim()).filter((c) => c.length > 0);
    }
    const t = String(condiciones).trim();
    if (!t) return [];
    if (/[\r\n]/.test(t)) {
      return t
        .split(/\r?\n+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    }
    return t
      .split(/\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Obtiene la descripción como un array (una entrada = un bullet en PDF).
   * Acepta array Firestore, string con saltos de línea, string con varios "•", u objeto con claves numéricas.
   */
  static getDescriptionAsArray(
    descripcion: string | string[] | Record<string, unknown> | undefined | null
  ): string[] {
    if (descripcion === undefined || descripcion === null) return [];

    if (typeof descripcion === 'object' && !Array.isArray(descripcion)) {
      const keys = Object.keys(descripcion).filter((k) => /^\d+$/.test(k));
      if (keys.length > 0) {
        return keys
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => String((descripcion as Record<string, unknown>)[k] ?? '').trim())
          .filter((s) => s.length > 0)
          .flatMap((s) => {
            const parts = this.splitDescriptionPlainText(s);
            return parts.length > 0 ? parts : [s];
          });
      }
      return [];
    }

    if (Array.isArray(descripcion)) {
      const out: string[] = [];
      for (const entry of descripcion) {
        const s = String(entry ?? '').trim();
        if (!s) continue;
        const parts = this.splitDescriptionPlainText(s);
        if (parts.length > 0) {
          out.push(...parts);
        } else {
          out.push(s);
        }
      }
      return out;
    }

    const text = String(descripcion).trim();
    if (!text) return [];

    const parts = this.splitDescriptionPlainText(text);
    if (parts.length > 0) {
      return parts;
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
        descripcion: this.getDescriptionAsArray(item.descripcion as any),
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
