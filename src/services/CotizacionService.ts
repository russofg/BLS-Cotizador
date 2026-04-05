import { adminDb } from '../utils/firebaseAdmin';
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { QuoteTrackingService } from './QuoteTrackingService';

export interface Cotizacion {
  id: string;
  clienteId: string;
  venueId?: string | null;
  numero: string;
  fecha: Date;
  fechaEvento?: Date | null;
  fechaEventoFin?: Date | null;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  titulo: string;
  descripcion?: string | null;
  subtotal: number;
  impuestos: number;
  total: number;
  validoHasta?: Date | null;
  notas?: string | null;
  duracion_dias?: number;
  duracion_horas?: number;
  requiere_armado?: boolean;
  items?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class CotizacionService {
  private static readonly COLLECTION_NAME = 'cotizaciones';

  static async getAll(): Promise<Cotizacion[]> {
    try {
      const snapshot = await adminDb.collection(this.COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => this.mapDocumentToCotizacion(doc));
    } catch (error) {
      console.error('Error getting all quotes:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Cotizacion | null> {
    try {
      const docSnap = await adminDb.collection(this.COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) return null;
      
      return this.mapDocumentToCotizacion(docSnap);
    } catch (error) {
      console.error('Error getting quote by ID:', error);
      throw error;
    }
  }

  static async create(cotizacion: Omit<Cotizacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cotizacion> {
    try {
      const now = new Date();
      const docRef = await adminDb.collection(this.COLLECTION_NAME).add({
        ...cotizacion,
        createdAt: now,
        updatedAt: now
      });
      
      const docSnap = await docRef.get();
      const newQuote = this.mapDocumentToCotizacion(docSnap);
      
      // Invalidar cachés
      QuoteTrackingService.invalidateCache();
      
      return newQuote;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Cotizacion>): Promise<void> {
    try {
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update({
        ...updates,
        updatedAt: new Date()
      });

      // Invalidar cachés
      QuoteTrackingService.invalidateCache(id);
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await adminDb.collection(this.COLLECTION_NAME).doc(id).delete();
      
      // Invalidar cachés
      QuoteTrackingService.invalidateCache(id);
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }

  private static mapDocumentToCotizacion(doc: DocumentSnapshot | QueryDocumentSnapshot): Cotizacion {
    const data = doc.data() || {};
    return {
      id: doc.id,
      ...data,
      fecha: data.fecha?.toDate?.() || (data.fecha ? new Date(data.fecha) : new Date()),
      fechaEvento: data.fechaEvento?.toDate?.() || (data.fechaEvento ? new Date(data.fechaEvento) : null),
      fechaEventoFin: data.fechaEventoFin?.toDate?.() || (data.fechaEventoFin ? new Date(data.fechaEventoFin) : null),
      validoHasta: data.validoHasta?.toDate?.() || (data.validoHasta ? new Date(data.validoHasta) : null),
      createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
      updatedAt: data.updatedAt?.toDate?.() || (data.updatedAt ? new Date(data.updatedAt) : new Date()),
    } as Cotizacion;
  }
}
