import { db } from '../utils/firebase';
import { collection, query, getDocs, orderBy, where, limit } from 'firebase/firestore';
import { cache, CacheKeys, CacheTTL, invalidateRelatedCache } from '../utils/cache';

export interface QuoteAnalytics {
  totalQuotes: number;
  quotesThisMonth: number;
  quotesLastMonth: number;
  quotesThisYear: number;
  averageQuoteValue: number;
  totalQuoteValue: number;
  quotesByMonth: Array<{ month: string; count: number; value: number }>;
  quotesByStatus: Array<{ status: string; count: number }>;
}

export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  newClientsLastMonth: number;
  clientsWithQuotes: number;
  topClientsByQuotes: Array<{ clientId: string; clientName: string; quoteCount: number; totalValue: number }>;
  clientsByMonth: Array<{ month: string; count: number }>;
}

export interface ItemAnalytics {
  totalItems: number;
  activeItems: number;
  topItemsByQuotes: Array<{ itemId: string; itemName: string; quoteCount: number; totalValue: number }>;
  itemsByCategory: Array<{ category: string; count: number }>;
}

export interface DashboardAnalytics {
  quotes: QuoteAnalytics;
  clients: ClientAnalytics;
  items: ItemAnalytics;
  lastUpdated: string;
}

export class AnalyticsService {
  private static readonly CACHE_TTL = CacheTTL.SHORT; // 5 minutos para analytics

  /**
   * Obtiene todas las estadísticas del dashboard
   */
  static async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const cacheKey = CacheKeys.analytics('dashboard');
      const cachedData = cache.get<DashboardAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const [quotes, clients, items] = await Promise.all([
        this.getQuoteAnalytics(),
        this.getClientAnalytics(),
        this.getItemAnalytics()
      ]);

      const analytics: DashboardAnalytics = {
        quotes,
        clients,
        items,
        lastUpdated: new Date().toISOString()
      };

      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw new Error('Error al obtener estadísticas del dashboard');
    }
  }

  /**
   * Obtiene estadísticas de cotizaciones
   */
  static async getQuoteAnalytics(): Promise<QuoteAnalytics> {
    try {
      const cacheKey = CacheKeys.analytics('quotes');
      const cachedData = cache.get<QuoteAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener todas las cotizaciones
      const quotesQuery = query(collection(db, 'cotizaciones'), orderBy('createdAt', 'desc'));
      const quotesSnapshot = await getDocs(quotesQuery);
      const quotes = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);

      // Calcular estadísticas básicas
      const totalQuotes = quotes.length;
      const quotesThisMonth = quotes.filter(q => q.createdAt >= thisMonth).length;
      const quotesLastMonth = quotes.filter(q => 
        q.createdAt >= lastMonth && q.createdAt < thisMonth
      ).length;
      const quotesThisYear = quotes.filter(q => q.createdAt >= thisYear).length;

      // Calcular valores
      const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
      const averageQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0;

      // Cotizaciones por mes (últimos 12 meses)
      const quotesByMonth = this.calculateQuotesByMonth(quotes);

      // Cotizaciones por estado
      const quotesByStatus = this.calculateQuotesByStatus(quotes);

      const analytics: QuoteAnalytics = {
        totalQuotes,
        quotesThisMonth,
        quotesLastMonth,
        quotesThisYear,
        averageQuoteValue,
        totalQuoteValue,
        quotesByMonth,
        quotesByStatus
      };

      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error('Error getting quote analytics:', error);
      throw new Error('Error al obtener estadísticas de cotizaciones');
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  static async getClientAnalytics(): Promise<ClientAnalytics> {
    try {
      const cacheKey = CacheKeys.analytics('clients');
      const cachedData = cache.get<ClientAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener todos los clientes
      const clientsQuery = query(collection(db, 'clientes'), orderBy('createdAt', 'desc'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clients = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      // Obtener todas las cotizaciones para calcular estadísticas de clientes
      const quotesQuery = query(collection(db, 'cotizaciones'));
      const quotesSnapshot = await getDocs(quotesQuery);
      const quotes = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Calcular estadísticas básicas
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.activo !== false).length;
      const newClientsThisMonth = clients.filter(c => c.createdAt >= thisMonth).length;
      const newClientsLastMonth = clients.filter(c => 
        c.createdAt >= lastMonth && c.createdAt < thisMonth
      ).length;

      // Clientes con cotizaciones
      const clientQuoteMap = new Map<string, { count: number; totalValue: number }>();
      quotes.forEach(quote => {
        const clientId = quote.clienteId || quote.cliente_id;
        if (clientId) {
          const current = clientQuoteMap.get(clientId) || { count: 0, totalValue: 0 };
          clientQuoteMap.set(clientId, {
            count: current.count + 1,
            totalValue: current.totalValue + (quote.total || 0)
          });
        }
      });

      const clientsWithQuotes = clientQuoteMap.size;

      // Top clientes por cotizaciones
      const topClientsByQuotes = Array.from(clientQuoteMap.entries())
        .map(([clientId, stats]) => {
          const client = clients.find(c => c.id === clientId);
          return {
            clientId,
            clientName: client?.nombre || 'Cliente desconocido',
            quoteCount: stats.count,
            totalValue: stats.totalValue
          };
        })
        .sort((a, b) => b.quoteCount - a.quoteCount)
        .slice(0, 10);

      // Clientes por mes (últimos 12 meses)
      const clientsByMonth = this.calculateClientsByMonth(clients);

      const analytics: ClientAnalytics = {
        totalClients,
        activeClients,
        newClientsThisMonth,
        newClientsLastMonth,
        clientsWithQuotes,
        topClientsByQuotes,
        clientsByMonth
      };

      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error('Error getting client analytics:', error);
      throw new Error('Error al obtener estadísticas de clientes');
    }
  }

  /**
   * Obtiene estadísticas de items/productos
   */
  static async getItemAnalytics(): Promise<ItemAnalytics> {
    try {
      const cacheKey = CacheKeys.analytics('items');
      const cachedData = cache.get<ItemAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Obtener todos los items
      const itemsQuery = query(collection(db, 'items'), orderBy('nombre', 'asc'));
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Obtener todas las cotizaciones para calcular estadísticas de items
      const quotesQuery = query(collection(db, 'cotizaciones'));
      const quotesSnapshot = await getDocs(quotesQuery);
      const quotes = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calcular estadísticas básicas
      const totalItems = items.length;
      const activeItems = items.filter(i => i.activo !== false).length;

      // Items más cotizados
      const itemQuoteMap = new Map<string, { count: number; totalValue: number }>();
      quotes.forEach(quote => {
        if (quote.items && Array.isArray(quote.items)) {
          quote.items.forEach((item: any) => {
            const itemId = item.id || item.itemId;
            if (itemId) {
              const current = itemQuoteMap.get(itemId) || { count: 0, totalValue: 0 };
              itemQuoteMap.set(itemId, {
                count: current.count + 1,
                totalValue: current.totalValue + (item.precio || 0) * (item.cantidad || 1)
              });
            }
          });
        }
      });

      const topItemsByQuotes = Array.from(itemQuoteMap.entries())
        .map(([itemId, stats]) => {
          const item = items.find(i => i.id === itemId);
          return {
            itemId,
            itemName: item?.nombre || 'Item desconocido',
            quoteCount: stats.count,
            totalValue: stats.totalValue
          };
        })
        .sort((a, b) => b.quoteCount - a.quoteCount)
        .slice(0, 10);

      // Items por categoría
      const itemsByCategory = this.calculateItemsByCategory(items);

      const analytics: ItemAnalytics = {
        totalItems,
        activeItems,
        topItemsByQuotes,
        itemsByCategory
      };

      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error('Error getting item analytics:', error);
      throw new Error('Error al obtener estadísticas de items');
    }
  }

  /**
   * Calcula cotizaciones por mes
   */
  private static calculateQuotesByMonth(quotes: any[]): Array<{ month: string; count: number; value: number }> {
    const monthMap = new Map<string, { count: number; value: number }>();
    
    quotes.forEach(quote => {
      const date = new Date(quote.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(monthKey) || { count: 0, value: 0 };
      monthMap.set(monthKey, {
        count: current.count + 1,
        value: current.value + (quote.total || 0)
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Últimos 12 meses
  }

  /**
   * Calcula cotizaciones por estado
   */
  private static calculateQuotesByStatus(quotes: any[]): Array<{ status: string; count: number }> {
    const statusMap = new Map<string, number>();
    
    quotes.forEach(quote => {
      const status = quote.estado || 'Borrador';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    return Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calcula clientes por mes
   */
  private static calculateClientsByMonth(clients: any[]): Array<{ month: string; count: number }> {
    const monthMap = new Map<string, number>();
    
    clients.forEach(client => {
      const date = new Date(client.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    return Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Últimos 12 meses
  }

  /**
   * Calcula items por categoría
   */
  private static calculateItemsByCategory(items: any[]): Array<{ category: string; count: number }> {
    const categoryMap = new Map<string, number>();
    
    items.forEach(item => {
      const category = item.categoria || 'Sin categoría';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Invalida el caché de analytics
   */
  static invalidateCache(): void {
    invalidateRelatedCache('analytics');
  }
}
