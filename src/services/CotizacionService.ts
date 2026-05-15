import { adminDb } from '../utils/firebaseAdmin';
import { FieldPath } from 'firebase-admin/firestore';
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { QuoteTrackingService } from './QuoteTrackingService';
import { InvalidCursorError } from '../utils/errors';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';

export { InvalidCursorError };

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

// ─── Pagination types ─────────────────────────────────────────────────────────

export interface ListCotizacionesParams {
  cursor?: string | null;
  pageSize?: number;
  estado?: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida' | null;
}

export interface ListCotizacionesResult {
  items: Cotizacion[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}

// Internal cursor payload — opaque to callers
interface CursorPayload {
  t: string; // createdAt ISO string
  id: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CotizacionService {
  private static readonly COLLECTION_NAME = 'cotizaciones';
  private static readonly DEFAULT_PAGE_SIZE = 25;
  private static readonly MAX_PAGE_SIZE = 100;

  // ── Cursor helpers ──────────────────────────────────────────────────────

  static encodeCursor(payload: CursorPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  static decodeCursor(s: string): CursorPayload {
    try {
      const decoded = JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
      if (typeof decoded.t !== 'string' || typeof decoded.id !== 'string') {
        throw new InvalidCursorError();
      }
      return decoded as CursorPayload;
    } catch {
      throw new InvalidCursorError(`Cannot decode cursor: ${s}`);
    }
  }

  // ── list() — paginated UI listing ──────────────────────────────────────

  static async list(params: ListCotizacionesParams): Promise<ListCotizacionesResult> {
    const rawPageSize = params.pageSize ?? this.DEFAULT_PAGE_SIZE;
    const pageSize = Math.max(1, Math.min(rawPageSize, this.MAX_PAGE_SIZE));
    const cursor = params.cursor ?? null;
    const estado = params.estado ?? null;

    const cacheKey = CacheKeys.quotesList({ cursor, pageSize, estado });
    const cached = cache.get<ListCotizacionesResult>(cacheKey);
    if (cached) return cached;

    let q: FirebaseFirestore.Query = adminDb.collection(this.COLLECTION_NAME);

    if (estado) {
      q = q.where('estado', '==', estado);
    }

    q = q
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc');

    if (cursor) {
      const payload = this.decodeCursor(cursor); // throws InvalidCursorError if malformed
      const t = new Date(payload.t);
      q = q.startAfter(t, payload.id);
    }

    q = q.limit(pageSize + 1);
    const snapshot = await q.get();

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const keptDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const items = keptDocs.map(doc => this.mapDocumentToCotizacion(doc));

    let nextCursor: string | null = null;
    if (hasMore && keptDocs.length > 0) {
      const lastDoc = keptDocs[keptDocs.length - 1];
      const data = lastDoc.data() || {};
      const createdAt: Date = data.createdAt?.toDate?.() ?? new Date(data.createdAt ?? 0);
      nextCursor = this.encodeCursor({ t: createdAt.toISOString(), id: lastDoc.id });
    }

    const result: ListCotizacionesResult = { items, nextCursor, hasMore, pageSize };
    cache.set(cacheKey, result, CacheTTL.SHORT);
    return result;
  }

  // ── getAllForAggregates() — full unbounded list for aggregate consumers ─

  /**
   * Returns the full unbounded collection. Use ONLY for:
   * - AnalyticsService
   * - export, PDF, Excel
   * - ReminderAutomationService
   * Do NOT use this for UI listing.
   */
  static async getAllForAggregates(): Promise<Cotizacion[]> {
    try {
      const cacheKey = CacheKeys.quotesAggregates();
      const cached = cache.get<Cotizacion[]>(cacheKey);
      if (cached) return cached;

      const snapshot = await adminDb
        .collection(this.COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .get();

      const cotizaciones = snapshot.docs.map(doc => this.mapDocumentToCotizacion(doc));
      cache.set(cacheKey, cotizaciones, CacheTTL.MEDIUM);
      return cotizaciones;
    } catch (error) {
      console.error('Error in CotizacionService.getAllForAggregates():', error);
      throw error;
    }
  }

  /**
   * @deprecated Use getAllForAggregates() instead.
   */
  static async getAll(): Promise<Cotizacion[]> {
    return this.getAllForAggregates();
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

  static async getByClienteId(clienteId: string): Promise<Cotizacion[]> {
    try {
      const col = adminDb.collection(this.COLLECTION_NAME);
      const [snap1, snap2] = await Promise.all([
        col.where('clienteId', '==', clienteId).get(),
        col.where('cliente_id', '==', clienteId).get(),
      ]);

      const seen = new Set<string>();
      const results: Cotizacion[] = [];
      for (const doc of [...snap1.docs, ...snap2.docs]) {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          results.push(this.mapDocumentToCotizacion(doc));
        }
      }
      return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching quotes by clienteId:', error);
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
