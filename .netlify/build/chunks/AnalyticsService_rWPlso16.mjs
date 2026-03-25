import { a as adminDb } from './firebaseAdmin_DoQo1nZX.mjs';
import { C as CacheTTL, a as CacheKeys, c as cache, i as invalidateRelatedCache } from './cache_0UIU9YOL.mjs';

class AnalyticsService {
  static CACHE_TTL = CacheTTL.SHORT;
  // 5 minutos para analytics
  /**
   * Obtiene todas las estadísticas del dashboard
   */
  static async getDashboardAnalytics() {
    try {
      const cacheKey = CacheKeys.analytics("dashboard");
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const [quotesSnapshot, clientsSnapshot, itemsSnapshot] = await Promise.all([
        adminDb.collection("cotizaciones").orderBy("createdAt", "desc").get(),
        adminDb.collection("clientes").orderBy("createdAt", "desc").get(),
        adminDb.collection("items").orderBy("nombre", "asc").get()
      ]);
      const quotes = quotesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
      const clients = clientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
      const items = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      const [quotesAnalytics, clientsAnalytics, itemsAnalytics] = await Promise.all([
        this.getQuoteAnalytics(quotes),
        this.getClientAnalytics(clients, quotes),
        this.getItemAnalytics(items, quotes)
      ]);
      const analytics = {
        quotes: quotesAnalytics,
        clients: clientsAnalytics,
        items: itemsAnalytics,
        recentQuotes: quotes.slice(0, 5).map((quote) => {
          const q = quote;
          const client = clients.find((c2) => c2.id === (q.clienteId || q.cliente_id));
          const c = client;
          return {
            ...q,
            cliente: client ? {
              nombre: c.nombre,
              empresa: c.empresa
            } : null
          };
        }),
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error("Error getting dashboard analytics:", error);
      throw new Error("Error al obtener estadísticas del dashboard");
    }
  }
  /**
   * Obtiene estadísticas de cotizaciones
   */
  static async getQuoteAnalytics(prefetchedQuotes) {
    try {
      const cacheKey = CacheKeys.analytics("quotes");
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      let quotes;
      if (prefetchedQuotes) {
        quotes = prefetchedQuotes;
      } else {
        const quotesSnapshot = await adminDb.collection("cotizaciones").orderBy("createdAt", "desc").get();
        quotes = quotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        }));
      }
      const now = /* @__PURE__ */ new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      const totalQuotes = quotes.length;
      const quotesThisMonth = quotes.filter((q) => q.createdAt >= thisMonth).length;
      const quotesLastMonth = quotes.filter(
        (q) => q.createdAt >= lastMonth && q.createdAt < thisMonth
      ).length;
      const quotesThisYear = quotes.filter((q) => q.createdAt >= thisYear).length;
      const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0);
      const averageQuoteValue = totalQuotes > 0 ? totalQuoteValue / totalQuotes : 0;
      const quotesByMonth = this.calculateQuotesByMonth(quotes);
      const quotesByStatus = this.calculateQuotesByStatus(quotes);
      const analytics = {
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
      console.error("Error getting quote analytics:", error);
      throw new Error("Error al obtener estadísticas de cotizaciones");
    }
  }
  /**
   * Obtiene estadísticas de clientes
   */
  static async getClientAnalytics(prefetchedClients, prefetchedQuotes) {
    try {
      const cacheKey = CacheKeys.analytics("clients");
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      let clients;
      if (prefetchedClients) {
        clients = prefetchedClients;
      } else {
        const clientsSnapshot = await adminDb.collection("clientes").orderBy("createdAt", "desc").get();
        clients = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        }));
      }
      let quotes;
      if (prefetchedQuotes) {
        quotes = prefetchedQuotes;
      } else {
        const quotesSnapshot = await adminDb.collection("cotizaciones").get();
        quotes = quotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        }));
      }
      const now = /* @__PURE__ */ new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const totalClients = clients.length;
      const activeClients = clients.filter((c) => c.activo !== false).length;
      const newClientsThisMonth = clients.filter((c) => c.createdAt >= thisMonth).length;
      const newClientsLastMonth = clients.filter(
        (c) => c.createdAt >= lastMonth && c.createdAt < thisMonth
      ).length;
      const clientQuoteMap = /* @__PURE__ */ new Map();
      quotes.forEach((quote) => {
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
      const topClientsByQuotes = Array.from(clientQuoteMap.entries()).map(([clientId, stats]) => {
        const client = clients.find((c) => c.id === clientId);
        return {
          clientId,
          clientName: client?.nombre || "Cliente desconocido",
          quoteCount: stats.count,
          totalValue: stats.totalValue
        };
      }).sort((a, b) => b.quoteCount - a.quoteCount).slice(0, 10);
      const clientsByMonth = this.calculateClientsByMonth(clients);
      const analytics = {
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
      console.error("Error getting client analytics:", error);
      throw new Error("Error al obtener estadísticas de clientes");
    }
  }
  /**
   * Obtiene estadísticas de items/productos
   */
  static async getItemAnalytics(prefetchedItems, prefetchedQuotes) {
    try {
      const cacheKey = CacheKeys.analytics("items");
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      let items;
      if (prefetchedItems) {
        items = prefetchedItems;
      } else {
        const itemsSnapshot = await adminDb.collection("items").orderBy("nombre", "asc").get();
        items = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      let quotes;
      if (prefetchedQuotes) {
        quotes = prefetchedQuotes;
      } else {
        const quotesSnapshot = await adminDb.collection("cotizaciones").get();
        quotes = quotesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      const totalItems = items.length;
      const activeItems = items.filter((i) => i.activo !== false).length;
      const itemQuoteMap = /* @__PURE__ */ new Map();
      quotes.forEach((quote) => {
        if (quote.items && Array.isArray(quote.items)) {
          quote.items.forEach((item) => {
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
      const topItemsByQuotes = Array.from(itemQuoteMap.entries()).map(([itemId, stats]) => {
        const item = items.find((i) => i.id === itemId);
        return {
          itemId,
          itemName: item?.nombre || "Item desconocido",
          quoteCount: stats.count,
          totalValue: stats.totalValue
        };
      }).sort((a, b) => b.quoteCount - a.quoteCount).slice(0, 10);
      const itemsByCategory = this.calculateItemsByCategory(items);
      const analytics = {
        totalItems,
        activeItems,
        topItemsByQuotes,
        itemsByCategory
      };
      cache.set(cacheKey, analytics, this.CACHE_TTL);
      return analytics;
    } catch (error) {
      console.error("Error getting item analytics:", error);
      throw new Error("Error al obtener estadísticas de items");
    }
  }
  /**
   * Calcula cotizaciones por mes
   */
  static calculateQuotesByMonth(quotes) {
    const monthMap = /* @__PURE__ */ new Map();
    quotes.forEach((quote) => {
      const date = new Date(quote.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = monthMap.get(monthKey) || { count: 0, value: 0 };
      monthMap.set(monthKey, {
        count: current.count + 1,
        value: current.value + (quote.total || 0)
      });
    });
    return Array.from(monthMap.entries()).map(([month, stats]) => ({ month, ...stats })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }
  /**
   * Calcula cotizaciones por estado
   */
  static calculateQuotesByStatus(quotes) {
    const statusMap = /* @__PURE__ */ new Map();
    quotes.forEach((quote) => {
      const status = quote.estado || "Borrador";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
  }
  /**
   * Calcula clientes por mes
   */
  static calculateClientsByMonth(clients) {
    const monthMap = /* @__PURE__ */ new Map();
    clients.forEach((client) => {
      const date = new Date(client.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  }
  /**
   * Calcula items por categoría
   */
  static calculateItemsByCategory(items) {
    const categoryMap = /* @__PURE__ */ new Map();
    items.forEach((item) => {
      const category = item.categoria || "Sin categoría";
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  }
  /**
   * Invalida el caché de analytics
   */
  static invalidateCache() {
    invalidateRelatedCache("analytics");
  }
}

export { AnalyticsService };
