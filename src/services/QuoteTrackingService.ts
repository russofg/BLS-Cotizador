import { adminDb } from '../utils/firebaseAdmin';
import type { QueryDocumentSnapshot, DocumentSnapshot } from 'firebase-admin/firestore';
import { cache, CacheTTL, invalidateRelatedCache } from '../utils/cache';
import { EmailNotificationService, type ReminderEmailData } from './EmailNotificationService';

// Estados de cotización
export enum QuoteStatus {
  BORRADOR = 'borrador',
  ENVIADA = 'enviada',
  REVISADA = 'revisada',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  VENCIDA = 'vencida',
  CONVERTIDA = 'convertida'
}

// Interfaz para seguimiento de cotizaciones
export interface QuoteTracking {
  id: string;
  numero: string;
  clienteId: string;
  clienteNombre: string;
  titulo: string;
  estado: QuoteStatus;
  estadoAnterior?: QuoteStatus;
  fechaCreacion: Date;
  fechaEnvio?: Date;
  fechaRevision?: Date;
  fechaAprobacion?: Date;
  fechaVencimiento: Date;
  diasVencimiento: number;
  total: number;
  observaciones?: string;
  historialCambios: QuoteStatusChange[];
  proximoSeguimiento?: Date;
  proximoSeguimientoTipo?: string;
  proximoSeguimientoMensaje?: string;
  proximoSeguimientoUsuario?: string;
  proximoSeguimientoEmail?: boolean;
  proximoSeguimientoPush?: boolean;
  proximoSeguimientoDestinatarios?: string[];
  recordatorios: QuoteReminder[];
}

// Interfaz para cambios de estado
export interface QuoteStatusChange {
  estadoAnterior: QuoteStatus;
  estadoNuevo: QuoteStatus;
  fecha: Date;
  usuario?: string;
  comentario?: string;
  automatico?: boolean;
}

// Interfaz para recordatorios
export interface QuoteReminder {
  id: string;
  fecha: Date;
  tipo: 'seguimiento' | 'vencimiento' | 'revision';
  mensaje: string;
  completado: boolean;
  fechaCompletado?: Date;
}

// Interfaz para estadísticas de seguimiento
export interface TrackingStats {
  totalCotizaciones: number;
  porEstado: Array<{ estado: QuoteStatus; count: number; porcentaje: number }>;
  conversionRate: number;
  tiempoPromedioAprobacion: number; // en días
  cotizacionesVencidas: number;
  proximosVencimientos: QuoteTracking[];
  seguimientosPendientes: QuoteTracking[];
}

export class QuoteTrackingService {
  private static readonly COLLECTION_NAME = 'cotizaciones';
  private static readonly CACHE_TTL = CacheTTL.MEDIUM;

  private static normalizeReminderRecipients(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const uniqueRecipients = new Set<string>();

    for (const recipient of value) {
      if (typeof recipient !== 'string') {
        continue;
      }

      const normalized = recipient.trim().toLowerCase();
      if (!normalized) {
        continue;
      }

      uniqueRecipients.add(normalized);
    }

    return [...uniqueRecipients];
  }

  /**
   * Obtiene todas las cotizaciones con información de seguimiento
   */
  static async getAllWithTracking(): Promise<QuoteTracking[]> {
    try {
      const cacheKey = 'quotes-tracking-all';
      const cachedData = cache.get<QuoteTracking[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Fetch all clients first to avoid N+1 queries
      const clientsSnapshot = await adminDb.collection('clientes').get();
      const clientsMap = new Map<string, string>();
      clientsSnapshot.docs.forEach(d => {
        clientsMap.set(d.id, d.data().nombre || 'Cliente sin nombre');
      });

      const quotesSnapshot = await adminDb.collection(this.COLLECTION_NAME).orderBy('createdAt', 'desc').get();
      
      const quotes = await Promise.all(
        quotesSnapshot.docs.map(doc => this.mapDocumentToQuoteTracking(doc, clientsMap))
      );

      cache.set(cacheKey, quotes, this.CACHE_TTL);
      return quotes;
    } catch (error) {
      console.error('Error getting quotes with tracking:', error);
      throw new Error('Error al obtener cotizaciones con seguimiento');
    }
  }

  /**
   * Obtiene una cotización específica con seguimiento
   */
  static async getByIdWithTracking(id: string): Promise<QuoteTracking | null> {
    try {
      const cacheKey = `quote-tracking-${id}`;
      const cachedData = cache.get<QuoteTracking>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const docSnap = await adminDb.collection(this.COLLECTION_NAME).doc(id).get();
      
      if (!docSnap.exists) {
        return null;
      }

      const quote = await this.mapDocumentToQuoteTracking(docSnap);
      cache.set(cacheKey, quote, this.CACHE_TTL);
      return quote;
    } catch (error) {
      console.error('Error getting quote with tracking:', error);
      throw new Error('Error al obtener cotización con seguimiento');
    }
  }

  /**
   * Actualiza el estado de una cotización y registra el cambio
   */
  static async updateStatus(
    id: string, 
    nuevoEstado: QuoteStatus, 
    comentario?: string,
    usuario?: string
  ): Promise<void> {
    try {
      // Obtener cotización actual
      const cotizacionActual = await this.getByIdWithTracking(id);
      if (!cotizacionActual) {
        throw new Error('Cotización no encontrada');
      }

      const estadoAnterior = cotizacionActual.estado;
      
      // Validar transición de estado
      if (!this.isValidStatusTransition(estadoAnterior, nuevoEstado)) {
        throw new Error(`No se puede cambiar de ${estadoAnterior} a ${nuevoEstado}`);
      }

      // Crear registro de cambio
      const cambio: QuoteStatusChange = {
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        fecha: new Date(),
        usuario,
        comentario,
        automatico: false
      };

      // Actualizar historial de cambios
      const historialActualizado = [...cotizacionActual.historialCambios, cambio];

      // Preparar datos de actualización
      const updateData: any = {
        estado: nuevoEstado,
        updatedAt: new Date()
      };

      // Agregar fechas específicas según el estado
      switch (nuevoEstado) {
        case QuoteStatus.ENVIADA:
          updateData.fechaEnvio = new Date();
          break;
        case QuoteStatus.REVISADA:
          updateData.fechaRevision = new Date();
          break;
        case QuoteStatus.APROBADA:
          updateData.fechaAprobacion = new Date();
          break;
      }

      // Actualizar en Firebase
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update(updateData);

      // Invalidar caché
      this.invalidateCache(id);

      console.log(`Cotización ${cotizacionActual.numero} actualizada de ${estadoAnterior} a ${nuevoEstado}`);
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de seguimiento
   */
  static async getTrackingStats(): Promise<TrackingStats> {
    try {
      const cacheKey = 'tracking-stats';
      const cachedData = cache.get<TrackingStats>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const quotes = await this.getAllWithTracking();
      const now = new Date();

      // Calcular estadísticas por estado
      const estadoCounts = new Map<QuoteStatus, number>();
      quotes.forEach(quote => {
        estadoCounts.set(quote.estado, (estadoCounts.get(quote.estado) || 0) + 1);
      });

      const porEstado = Array.from(estadoCounts.entries()).map(([estado, count]) => ({
        estado,
        count,
        porcentaje: (count / quotes.length) * 100
      }));

      // Calcular tasa de conversión
      const cotizacionesAprobadas = estadoCounts.get(QuoteStatus.APROBADA) || 0;
      const cotizacionesEnviadas = estadoCounts.get(QuoteStatus.ENVIADA) || 0;
      const conversionRate = cotizacionesEnviadas > 0 ? (cotizacionesAprobadas / cotizacionesEnviadas) * 100 : 0;

      // Calcular tiempo promedio de aprobación
      const cotizacionesConAprobacion = quotes.filter(q => 
        q.estado === QuoteStatus.APROBADA && q.fechaAprobacion
      );
      const tiempoPromedioAprobacion = cotizacionesConAprobacion.length > 0 
        ? cotizacionesConAprobacion.reduce((sum, q) => {
            const dias = Math.ceil((q.fechaAprobacion!.getTime() - q.fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
            return sum + dias;
          }, 0) / cotizacionesConAprobacion.length
        : 0;

      // Cotizaciones vencidas
      const cotizacionesVencidas = quotes.filter(q => 
        q.fechaVencimiento < now && q.estado !== QuoteStatus.APROBADA && q.estado !== QuoteStatus.RECHAZADA
      ).length;

      // Próximos vencimientos (próximos 7 días)
      const proximosVencimientos = quotes.filter(q => {
        const diasHastaVencimiento = Math.ceil((q.fechaVencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diasHastaVencimiento <= 7 && diasHastaVencimiento > 0 && 
               q.estado !== QuoteStatus.APROBADA && q.estado !== QuoteStatus.RECHAZADA;
      }).slice(0, 10);

      // Seguimientos pendientes
      const seguimientosPendientes = quotes.filter(q => 
        q.proximoSeguimiento && q.proximoSeguimiento <= now &&
        q.estado !== QuoteStatus.APROBADA && q.estado !== QuoteStatus.RECHAZADA
      ).slice(0, 10);

      const stats: TrackingStats = {
        totalCotizaciones: quotes.length,
        porEstado,
        conversionRate,
        tiempoPromedioAprobacion,
        cotizacionesVencidas,
        proximosVencimientos,
        seguimientosPendientes
      };

      cache.set(cacheKey, stats, this.CACHE_TTL);
      return stats;
    } catch (error) {
      console.error('Error getting tracking stats:', error);
      throw new Error('Error al obtener estadísticas de seguimiento');
    }
  }

  /**
   * Elimina un recordatorio programado
   */
  static async deleteReminder(quoteId: string, reminderId: string): Promise<void> {
    try {
      const cotizacion = await this.getByIdWithTracking(quoteId);
      if (!cotizacion) {
        throw new Error('Cotización no encontrada');
      }

      // Limpiar toda la información del recordatorio
      const updateData: any = {
        proximoSeguimiento: null,
        proximoSeguimientoTipo: null,
        proximoSeguimientoMensaje: null,
        proximoSeguimientoUsuario: null,
        proximoSeguimientoEmail: null,
        proximoSeguimientoPush: null,
        proximoSeguimientoDestinatarios: null,
        updatedAt: new Date()
      };

      await adminDb.collection(this.COLLECTION_NAME).doc(quoteId).update(updateData);

      this.invalidateCache(quoteId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
  static async scheduleReminder(
    quoteId: string, 
    tipo: 'seguimiento' | 'vencimiento' | 'revision',
    fecha: Date,
    mensaje: string,
    sendEmail: boolean = false,
    sendPush: boolean = true,
    userName: string = 'Usuario',
    userEmail?: string,
    recipients: string[] = []
  ): Promise<void> {
    try {
      console.log(`📅 Programando recordatorio para cotización ${quoteId}`);
      
      const cotizacion = await this.getByIdWithTracking(quoteId);
      if (!cotizacion) {
        console.error(`❌ Cotización ${quoteId} no encontrada`);
        throw new Error('Cotización no encontrada');
      }
      
      console.log(`✅ Cotización encontrada: ${cotizacion.numero} - ${cotizacion.clienteNombre}`);

      const recordatorio: QuoteReminder = {
        id: `reminder-${Date.now()}`,
        fecha,
        tipo,
        mensaje,
        completado: false
      };

      // Actualizar proximoSeguimiento y agregar información del recordatorio
      const updateData: any = {
        proximoSeguimiento: fecha,
        proximoSeguimientoTipo: tipo,
        proximoSeguimientoMensaje: mensaje,
        proximoSeguimientoUsuario: userName,
        proximoSeguimientoEmail: sendEmail,
        proximoSeguimientoPush: sendPush,
        proximoSeguimientoDestinatarios: this.normalizeReminderRecipients(recipients),
        updatedAt: new Date()
      };

      await adminDb.collection(this.COLLECTION_NAME).doc(quoteId).update(updateData);

      // NO enviar email inmediatamente - se enviará cuando llegue la hora programada
      console.log('📅 Recordatorio programado para:', fecha.toLocaleString());
      console.log('📧 Email se enviará automáticamente a la hora programada');

      this.invalidateCache(quoteId);
      
      console.log(`🎉 Recordatorio programado exitosamente para ${cotizacion.numero}`);
      console.log(`📅 Fecha: ${fecha.toLocaleString('es-ES')}`);
      console.log(`📧 Email: ${sendEmail ? 'Sí' : 'No'}`);
      console.log(`🔔 Push: ${sendPush ? 'Sí' : 'No'}`);
      
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
      throw error;
    }
  }

  /**
   * Valida si una transición de estado es válida
   */
  private static isValidStatusTransition(estadoActual: QuoteStatus, nuevoEstado: QuoteStatus): boolean {
    const transicionesValidas: Record<QuoteStatus, QuoteStatus[]> = {
      [QuoteStatus.BORRADOR]: [QuoteStatus.ENVIADA, QuoteStatus.RECHAZADA],
      [QuoteStatus.ENVIADA]: [QuoteStatus.REVISADA, QuoteStatus.RECHAZADA, QuoteStatus.VENCIDA],
      [QuoteStatus.REVISADA]: [QuoteStatus.APROBADA, QuoteStatus.RECHAZADA, QuoteStatus.VENCIDA],
      [QuoteStatus.APROBADA]: [QuoteStatus.CONVERTIDA],
      [QuoteStatus.RECHAZADA]: [QuoteStatus.BORRADOR],
      [QuoteStatus.VENCIDA]: [QuoteStatus.BORRADOR],
      [QuoteStatus.CONVERTIDA]: [] // Estado final
    };

    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }

  /**
   * Mapea un documento de Firebase a QuoteTracking
   */
  private static async mapDocumentToQuoteTracking(quoteDoc: DocumentSnapshot, clientsMap?: Map<string, string>): Promise<QuoteTracking> {
    const data = quoteDoc.data();
    if (!data) throw new Error('Document is empty');
    
    // Obtener información del cliente
    let clienteNombre = 'Cliente desconocido';
    try {
      if (data.clienteId || data.cliente_id) {
        const clientId = data.clienteId || data.cliente_id;
        
        // Usar mapa pre-cargado si existe (evita N+1 queries)
        if (clientsMap && clientsMap.has(clientId)) {
          clienteNombre = clientsMap.get(clientId)!;
        } else {
          // Fallback a consulta individual
          const docSnap = await adminDb.collection('clientes').doc(clientId).get();
          if (docSnap.exists) {
            clienteNombre = docSnap.data()!.nombre || clienteNombre;
          }
        }
      }
    } catch (error) {
      console.warn('Error getting client name:', error);
    }

    // Calcular fecha de vencimiento
    const fechaCreacion = data.createdAt?.toDate?.() || new Date(data.createdAt);
    const vigenciaDias = data.vigenciaDias || 30;
    const fechaVencimiento = new Date(fechaCreacion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);

    // Calcular días hasta vencimiento
    const ahora = new Date();
    const diasVencimiento = Math.ceil((fechaVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: quoteDoc.id,
      numero: data.numero || `COT-${quoteDoc.id}`,
      clienteId: data.clienteId || data.cliente_id,
      clienteNombre,
      titulo: data.titulo || data.descripcion || 'Sin título',
      estado: (() => {
        const s = String(data.estado || '').toLowerCase();
        if (s.includes('borrador')) return QuoteStatus.BORRADOR;
        if (s.includes('enviad')) return QuoteStatus.ENVIADA;
        if (s.includes('aprob')) return QuoteStatus.APROBADA;
        if (s.includes('recha')) return QuoteStatus.RECHAZADA;
        if (s.includes('revis')) return QuoteStatus.REVISADA;
        if (s.includes('vencid')) return QuoteStatus.VENCIDA;
        if (s.includes('convert')) return QuoteStatus.CONVERTIDA;
        return (data.estado as QuoteStatus) || QuoteStatus.BORRADOR;
      })(),
      fechaCreacion,
      fechaEnvio: data.fechaEnvio?.toDate?.() || data.fechaEnvio,
      fechaRevision: data.fechaRevision?.toDate?.() || data.fechaRevision,
      fechaAprobacion: data.fechaAprobacion?.toDate?.() || data.fechaAprobacion,
      fechaVencimiento,
      diasVencimiento,
      total: data.total || data.subtotal || 0,
      observaciones: data.observaciones,
      historialCambios: data.historialCambios || [],
      proximoSeguimiento: data.proximoSeguimiento?.toDate?.() || data.proximoSeguimiento,
      proximoSeguimientoTipo: data.proximoSeguimientoTipo,
      proximoSeguimientoMensaje: data.proximoSeguimientoMensaje,
      proximoSeguimientoUsuario: data.proximoSeguimientoUsuario,
      proximoSeguimientoEmail: data.proximoSeguimientoEmail,
      proximoSeguimientoPush: data.proximoSeguimientoPush,
      proximoSeguimientoDestinatarios: this.normalizeReminderRecipients(data.proximoSeguimientoDestinatarios),
      recordatorios: data.recordatorios || []
    };
  }

  /**
   * Invalida el caché relacionado con una cotización
   */
  private static invalidateCache(quoteId?: string): void {
    invalidateRelatedCache('quote');
    if (quoteId) {
      cache.delete(`quote-tracking-${quoteId}`);
    }
    cache.delete('quotes-tracking-all');
    cache.delete('tracking-stats');
  }

  /**
   * Obtiene el estado actual de una cotización
   */
  static getStatusDisplayName(status: QuoteStatus): string {
    const statusNames: Record<QuoteStatus, string> = {
      [QuoteStatus.BORRADOR]: 'Borrador',
      [QuoteStatus.ENVIADA]: 'Enviada',
      [QuoteStatus.REVISADA]: 'Revisada',
      [QuoteStatus.APROBADA]: 'Aprobada',
      [QuoteStatus.RECHAZADA]: 'Rechazada',
      [QuoteStatus.VENCIDA]: 'Vencida',
      [QuoteStatus.CONVERTIDA]: 'Convertida'
    };
    return statusNames[status] || status;
  }

  /**
   * Obtiene el color del estado para la UI
   */
  static getStatusColor(status: QuoteStatus): string {
    const statusColors: Record<QuoteStatus, string> = {
      [QuoteStatus.BORRADOR]: 'gray',
      [QuoteStatus.ENVIADA]: 'blue',
      [QuoteStatus.REVISADA]: 'yellow',
      [QuoteStatus.APROBADA]: 'green',
      [QuoteStatus.RECHAZADA]: 'red',
      [QuoteStatus.VENCIDA]: 'orange',
      [QuoteStatus.CONVERTIDA]: 'purple'
    };
    return statusColors[status] || 'gray';
  }
}
