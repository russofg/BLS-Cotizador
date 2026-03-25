import { a as adminDb } from './firebaseAdmin_DoQo1nZX.mjs';
import { C as CacheTTL, c as cache, i as invalidateRelatedCache } from './cache_0UIU9YOL.mjs';
import 'nodemailer';

var QuoteStatus = /* @__PURE__ */ ((QuoteStatus2) => {
  QuoteStatus2["BORRADOR"] = "borrador";
  QuoteStatus2["ENVIADA"] = "enviada";
  QuoteStatus2["REVISADA"] = "revisada";
  QuoteStatus2["APROBADA"] = "aprobada";
  QuoteStatus2["RECHAZADA"] = "rechazada";
  QuoteStatus2["VENCIDA"] = "vencida";
  QuoteStatus2["CONVERTIDA"] = "convertida";
  return QuoteStatus2;
})(QuoteStatus || {});
class QuoteTrackingService {
  static COLLECTION_NAME = "cotizaciones";
  static CACHE_TTL = CacheTTL.MEDIUM;
  /**
   * Obtiene todas las cotizaciones con información de seguimiento
   */
  static async getAllWithTracking() {
    try {
      const cacheKey = "quotes-tracking-all";
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const clientsSnapshot = await adminDb.collection("clientes").get();
      const clientsMap = /* @__PURE__ */ new Map();
      clientsSnapshot.docs.forEach((d) => {
        clientsMap.set(d.id, d.data().nombre || "Cliente sin nombre");
      });
      const quotesSnapshot = await adminDb.collection(this.COLLECTION_NAME).orderBy("createdAt", "desc").get();
      const quotes = await Promise.all(
        quotesSnapshot.docs.map((doc) => this.mapDocumentToQuoteTracking(doc, clientsMap))
      );
      cache.set(cacheKey, quotes, this.CACHE_TTL);
      return quotes;
    } catch (error) {
      console.error("Error getting quotes with tracking:", error);
      throw new Error("Error al obtener cotizaciones con seguimiento");
    }
  }
  /**
   * Obtiene una cotización específica con seguimiento
   */
  static async getByIdWithTracking(id) {
    try {
      const cacheKey = `quote-tracking-${id}`;
      const cachedData = cache.get(cacheKey);
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
      console.error("Error getting quote with tracking:", error);
      throw new Error("Error al obtener cotización con seguimiento");
    }
  }
  /**
   * Actualiza el estado de una cotización y registra el cambio
   */
  static async updateStatus(id, nuevoEstado, comentario, usuario) {
    try {
      const cotizacionActual = await this.getByIdWithTracking(id);
      if (!cotizacionActual) {
        throw new Error("Cotización no encontrada");
      }
      const estadoAnterior = cotizacionActual.estado;
      if (!this.isValidStatusTransition(estadoAnterior, nuevoEstado)) {
        throw new Error(`No se puede cambiar de ${estadoAnterior} a ${nuevoEstado}`);
      }
      const cambio = {
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        fecha: /* @__PURE__ */ new Date(),
        usuario,
        comentario,
        automatico: false
      };
      const historialActualizado = [...cotizacionActual.historialCambios, cambio];
      const updateData = {
        estado: nuevoEstado,
        updatedAt: /* @__PURE__ */ new Date()
      };
      switch (nuevoEstado) {
        case "enviada" /* ENVIADA */:
          updateData.fechaEnvio = /* @__PURE__ */ new Date();
          break;
        case "revisada" /* REVISADA */:
          updateData.fechaRevision = /* @__PURE__ */ new Date();
          break;
        case "aprobada" /* APROBADA */:
          updateData.fechaAprobacion = /* @__PURE__ */ new Date();
          break;
      }
      await adminDb.collection(this.COLLECTION_NAME).doc(id).update(updateData);
      this.invalidateCache(id);
      console.log(`Cotización ${cotizacionActual.numero} actualizada de ${estadoAnterior} a ${nuevoEstado}`);
    } catch (error) {
      console.error("Error updating quote status:", error);
      throw error;
    }
  }
  /**
   * Obtiene estadísticas de seguimiento
   */
  static async getTrackingStats() {
    try {
      const cacheKey = "tracking-stats";
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const quotes = await this.getAllWithTracking();
      const now = /* @__PURE__ */ new Date();
      const estadoCounts = /* @__PURE__ */ new Map();
      quotes.forEach((quote) => {
        estadoCounts.set(quote.estado, (estadoCounts.get(quote.estado) || 0) + 1);
      });
      const porEstado = Array.from(estadoCounts.entries()).map(([estado, count]) => ({
        estado,
        count,
        porcentaje: count / quotes.length * 100
      }));
      const cotizacionesAprobadas = estadoCounts.get("aprobada" /* APROBADA */) || 0;
      const cotizacionesEnviadas = estadoCounts.get("enviada" /* ENVIADA */) || 0;
      const conversionRate = cotizacionesEnviadas > 0 ? cotizacionesAprobadas / cotizacionesEnviadas * 100 : 0;
      const cotizacionesConAprobacion = quotes.filter(
        (q) => q.estado === "aprobada" /* APROBADA */ && q.fechaAprobacion
      );
      const tiempoPromedioAprobacion = cotizacionesConAprobacion.length > 0 ? cotizacionesConAprobacion.reduce((sum, q) => {
        const dias = Math.ceil((q.fechaAprobacion.getTime() - q.fechaCreacion.getTime()) / (1e3 * 60 * 60 * 24));
        return sum + dias;
      }, 0) / cotizacionesConAprobacion.length : 0;
      const cotizacionesVencidas = quotes.filter(
        (q) => q.fechaVencimiento < now && q.estado !== "aprobada" /* APROBADA */ && q.estado !== "rechazada" /* RECHAZADA */
      ).length;
      const proximosVencimientos = quotes.filter((q) => {
        const diasHastaVencimiento = Math.ceil((q.fechaVencimiento.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        return diasHastaVencimiento <= 7 && diasHastaVencimiento > 0 && q.estado !== "aprobada" /* APROBADA */ && q.estado !== "rechazada" /* RECHAZADA */;
      }).slice(0, 10);
      const seguimientosPendientes = quotes.filter(
        (q) => q.proximoSeguimiento && q.proximoSeguimiento <= now && q.estado !== "aprobada" /* APROBADA */ && q.estado !== "rechazada" /* RECHAZADA */
      ).slice(0, 10);
      const stats = {
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
      console.error("Error getting tracking stats:", error);
      throw new Error("Error al obtener estadísticas de seguimiento");
    }
  }
  /**
   * Elimina un recordatorio programado
   */
  static async deleteReminder(quoteId, reminderId) {
    try {
      const cotizacion = await this.getByIdWithTracking(quoteId);
      if (!cotizacion) {
        throw new Error("Cotización no encontrada");
      }
      const updateData = {
        proximoSeguimiento: null,
        proximoSeguimientoTipo: null,
        proximoSeguimientoMensaje: null,
        proximoSeguimientoUsuario: null,
        proximoSeguimientoEmail: null,
        proximoSeguimientoPush: null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await adminDb.collection(this.COLLECTION_NAME).doc(quoteId).update(updateData);
      this.invalidateCache(quoteId);
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  }
  static async scheduleReminder(quoteId, tipo, fecha, mensaje, sendEmail = false, sendPush = true, userName = "Usuario", userEmail, recipients = []) {
    try {
      console.log(`📅 Programando recordatorio para cotización ${quoteId}`);
      const cotizacion = await this.getByIdWithTracking(quoteId);
      if (!cotizacion) {
        console.error(`❌ Cotización ${quoteId} no encontrada`);
        throw new Error("Cotización no encontrada");
      }
      console.log(`✅ Cotización encontrada: ${cotizacion.numero} - ${cotizacion.clienteNombre}`);
      const recordatorio = {
        id: `reminder-${Date.now()}`,
        fecha,
        tipo,
        mensaje,
        completado: false
      };
      const updateData = {
        proximoSeguimiento: fecha,
        proximoSeguimientoTipo: tipo,
        proximoSeguimientoMensaje: mensaje,
        proximoSeguimientoUsuario: userName,
        proximoSeguimientoEmail: sendEmail,
        proximoSeguimientoPush: sendPush,
        proximoSeguimientoDestinatarios: recipients,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await adminDb.collection(this.COLLECTION_NAME).doc(quoteId).update(updateData);
      console.log("📅 Recordatorio programado para:", fecha.toLocaleString());
      console.log("📧 Email se enviará automáticamente a la hora programada");
      this.invalidateCache(quoteId);
      console.log(`🎉 Recordatorio programado exitosamente para ${cotizacion.numero}`);
      console.log(`📅 Fecha: ${fecha.toLocaleString("es-ES")}`);
      console.log(`📧 Email: ${sendEmail ? "Sí" : "No"}`);
      console.log(`🔔 Push: ${sendPush ? "Sí" : "No"}`);
    } catch (error) {
      console.error("❌ Error scheduling reminder:", error);
      throw error;
    }
  }
  /**
   * Valida si una transición de estado es válida
   */
  static isValidStatusTransition(estadoActual, nuevoEstado) {
    const transicionesValidas = {
      ["borrador" /* BORRADOR */]: ["enviada" /* ENVIADA */, "rechazada" /* RECHAZADA */],
      ["enviada" /* ENVIADA */]: ["revisada" /* REVISADA */, "rechazada" /* RECHAZADA */, "vencida" /* VENCIDA */],
      ["revisada" /* REVISADA */]: ["aprobada" /* APROBADA */, "rechazada" /* RECHAZADA */, "vencida" /* VENCIDA */],
      ["aprobada" /* APROBADA */]: ["convertida" /* CONVERTIDA */],
      ["rechazada" /* RECHAZADA */]: ["borrador" /* BORRADOR */],
      ["vencida" /* VENCIDA */]: ["borrador" /* BORRADOR */],
      ["convertida" /* CONVERTIDA */]: []
      // Estado final
    };
    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }
  /**
   * Mapea un documento de Firebase a QuoteTracking
   */
  static async mapDocumentToQuoteTracking(quoteDoc, clientsMap) {
    const data = quoteDoc.data();
    if (!data) throw new Error("Document is empty");
    let clienteNombre = "Cliente desconocido";
    try {
      if (data.clienteId || data.cliente_id) {
        const clientId = data.clienteId || data.cliente_id;
        if (clientsMap && clientsMap.has(clientId)) {
          clienteNombre = clientsMap.get(clientId);
        } else {
          const docSnap = await adminDb.collection("clientes").doc(clientId).get();
          if (docSnap.exists) {
            clienteNombre = docSnap.data().nombre || clienteNombre;
          }
        }
      }
    } catch (error) {
      console.warn("Error getting client name:", error);
    }
    const fechaCreacion = data.createdAt?.toDate?.() || new Date(data.createdAt);
    const vigenciaDias = data.vigenciaDias || 30;
    const fechaVencimiento = new Date(fechaCreacion);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + vigenciaDias);
    const ahora = /* @__PURE__ */ new Date();
    const diasVencimiento = Math.ceil((fechaVencimiento.getTime() - ahora.getTime()) / (1e3 * 60 * 60 * 24));
    return {
      id: quoteDoc.id,
      numero: data.numero || `COT-${quoteDoc.id}`,
      clienteId: data.clienteId || data.cliente_id,
      clienteNombre,
      titulo: data.titulo || data.descripcion || "Sin título",
      estado: (() => {
        const s = String(data.estado || "").toLowerCase();
        if (s.includes("borrador")) return "borrador" /* BORRADOR */;
        if (s.includes("enviad")) return "enviada" /* ENVIADA */;
        if (s.includes("aprob")) return "aprobada" /* APROBADA */;
        if (s.includes("recha")) return "rechazada" /* RECHAZADA */;
        if (s.includes("revis")) return "revisada" /* REVISADA */;
        if (s.includes("vencid")) return "vencida" /* VENCIDA */;
        if (s.includes("convert")) return "convertida" /* CONVERTIDA */;
        return data.estado || "borrador" /* BORRADOR */;
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
      recordatorios: data.recordatorios || []
    };
  }
  /**
   * Invalida el caché relacionado con una cotización
   */
  static invalidateCache(quoteId) {
    invalidateRelatedCache("quote");
    if (quoteId) {
      cache.delete(`quote-tracking-${quoteId}`);
    }
    cache.delete("quotes-tracking-all");
    cache.delete("tracking-stats");
  }
  /**
   * Obtiene el estado actual de una cotización
   */
  static getStatusDisplayName(status) {
    const statusNames = {
      ["borrador" /* BORRADOR */]: "Borrador",
      ["enviada" /* ENVIADA */]: "Enviada",
      ["revisada" /* REVISADA */]: "Revisada",
      ["aprobada" /* APROBADA */]: "Aprobada",
      ["rechazada" /* RECHAZADA */]: "Rechazada",
      ["vencida" /* VENCIDA */]: "Vencida",
      ["convertida" /* CONVERTIDA */]: "Convertida"
    };
    return statusNames[status] || status;
  }
  /**
   * Obtiene el color del estado para la UI
   */
  static getStatusColor(status) {
    const statusColors = {
      ["borrador" /* BORRADOR */]: "gray",
      ["enviada" /* ENVIADA */]: "blue",
      ["revisada" /* REVISADA */]: "yellow",
      ["aprobada" /* APROBADA */]: "green",
      ["rechazada" /* RECHAZADA */]: "red",
      ["vencida" /* VENCIDA */]: "orange",
      ["convertida" /* CONVERTIDA */]: "purple"
    };
    return statusColors[status] || "gray";
  }
}

export { QuoteTrackingService as Q, QuoteStatus as a };
