import { D as DateHelper } from './dateHelpers_DuxKPoxD.mjs';

class QuoteHelper {
  /**
   * Genera un número de cotización mejorado basado en la fecha, cliente y evento
   */
  static generateQuoteNumber(cotizacion, cliente) {
    try {
      if (cotizacion.numero && !cotizacion.numero.includes("mvG2cFN4sBXIfjxxnYAL")) {
        return cotizacion.numero;
      }
      const fechaCreacion = cotizacion.created_at ? new Date(cotizacion.created_at) : new Date(cotizacion.createdAt || Date.now());
      const fechaFormateada = fechaCreacion.toISOString().slice(0, 10).replace(/-/g, "");
      const clienteNombre = (cliente?.nombre || "CLIENTE").replace(/\s+/g, "").substring(0, 10).toUpperCase();
      const eventoNombre = (cotizacion.titulo || "EVENTO").replace(/\s+/g, "").substring(0, 10).toUpperCase();
      const numeroSecuencial = "001";
      return `COT-${numeroSecuencial}-${fechaFormateada}-${clienteNombre}-${eventoNombre}`;
    } catch (error) {
      console.error("Error generating quote number:", error);
      const fallbackDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      return `COT-001-${fallbackDate}-CLIENTE-EVENTO`;
    }
  }
  /**
   * Normaliza los items de una cotización para asegurar que sea un array
   */
  static normalizeItems(items) {
    if (!items) return [];
    if (Array.isArray(items)) {
      return items;
    }
    if (typeof items === "object") {
      return Object.values(items);
    }
    return [];
  }
  /**
   * Normaliza los datos de una cotización para compatibilidad
   */
  static normalizeQuoteData(cotizacion) {
    const normalized = { ...cotizacion };
    normalized.items = this.normalizeItems(cotizacion.items);
    if (normalized.cliente_id && !normalized.clienteId) {
      normalized.clienteId = normalized.cliente_id;
    }
    if (normalized.clienteId && !normalized.cliente_id) {
      normalized.cliente_id = normalized.clienteId;
    }
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
  static calculateTotals(items, descuento = 0) {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(String(item.cantidad || 0)) || 0;
      const precio = parseFloat(String(item.precio_unitario || item.precioBase || 0)) || 0;
      return sum + cantidad * precio;
    }, 0);
    const descuentoMonto = subtotal * descuento / 100;
    const total = subtotal - descuentoMonto;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      // Redondear a 2 decimales
      descuentoMonto: Math.round(descuentoMonto * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
  /**
   * Calcula la duración de un evento basado en fechas
   */
  static calculateEventDuration(fechaInicio, fechaFin) {
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
      console.error("Error calculating event duration:", error);
      return 1;
    }
  }
  /**
   * Calcula la fecha de fin automáticamente si no está presente
   */
  static calculateEndDateIfMissing(cotizacion) {
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
        normalized.fechaEventoFin = fechaInicio;
        normalized.fecha_evento_fin = fechaInicio;
      }
      return normalized;
    } catch (error) {
      console.error("Error calculating end date:", error);
      return normalized;
    }
  }
  /**
   * Valida los datos básicos de una cotización
   */
  static validateQuoteData(cotizacion) {
    const errors = [];
    if (!cotizacion.cliente_id && !cotizacion.clienteId) {
      errors.push("Cliente es obligatorio");
    }
    if (!cotizacion.titulo) {
      errors.push("Título es obligatorio");
    }
    if (cotizacion.fecha_evento || cotizacion.fechaEvento) {
      const startDate = DateHelper.safeParseDate(cotizacion.fecha_evento || cotizacion.fechaEvento);
      const endDate = DateHelper.safeParseDate(cotizacion.fecha_evento_fin || cotizacion.fechaEventoFin);
      if (startDate && endDate && !DateHelper.validateDateRange(startDate, endDate)) {
        errors.push("La fecha de fin debe ser posterior o igual a la fecha de inicio");
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
  static getDescriptionAsArray(descripcion) {
    if (!descripcion) return [];
    if (Array.isArray(descripcion)) {
      return descripcion.map((d) => String(d).trim()).filter((d) => d.length > 0);
    }
    const text = String(descripcion).trim();
    if (text.includes("\n")) {
      return text.split("\n").map((d) => d.trim()).filter((d) => d.length > 0);
    }
    return [text];
  }
  /**
   * Formatea un item para mostrar en la UI con soporte para viñetas
   */
  static formatItemForDisplay(item) {
    let itemName = item.nombre || "";
    const descriptionArray = this.getDescriptionAsArray(item.descripcion);
    let itemDescription = descriptionArray.join(", ");
    if (!itemName && descriptionArray.length > 0) {
      itemName = descriptionArray[0];
      if (descriptionArray.length > 1) ;
    }
    itemName = String(itemName || "").trim();
    let displayText = "";
    if (itemName) {
      displayText = `<strong>${itemName}</strong>`;
      if (descriptionArray.length > 0) {
        if (descriptionArray.length === 1 && descriptionArray[0] === itemName) ; else {
          const listItems = descriptionArray.filter((d) => d !== itemName).map((d) => `<li class="ml-4 list-disc">${d}</li>`).join("");
          if (listItems) {
            displayText += `<ul class="mt-1 space-y-0.5">${listItems}</ul>`;
          }
        }
      }
    } else if (descriptionArray.length > 0) {
      const listItems = descriptionArray.map((d) => `<li class="ml-4 list-disc">${d}</li>`).join("");
      displayText = `<ul class="mt-1 space-y-0.5">${listItems}</ul>`;
    } else {
      displayText = "Item sin descripción";
    }
    return {
      name: itemName,
      description: itemDescription,
      descriptionArray,
      displayText
    };
  }
  /**
   * Enriquece una cotización con datos del cliente
   */
  static enrichQuoteWithClient(cotizacion, clientes) {
    const cliente = clientes.find((c) => c.id === cotizacion.cliente_id || c.id === cotizacion.clienteId);
    return {
      ...cotizacion,
      cliente,
      cliente_nombre: cliente ? `${cliente.nombre}${cliente.empresa ? ` - ${cliente.empresa}` : ""}` : "Sin cliente"
    };
  }
  /**
   * Prepara datos de cotización para exportación
   */
  static prepareQuoteForExport(cotizacion, cliente) {
    const normalized = this.normalizeQuoteData(cotizacion);
    return {
      numero: this.generateQuoteNumber(normalized, cliente),
      titulo: normalized.titulo || "Sin título",
      descripcion: normalized.descripcion || "",
      fecha_evento: DateHelper.safeFormatDate(normalized.fechaEvento || normalized.fecha_evento),
      fecha_evento_fin: DateHelper.safeFormatDate(normalized.fechaEventoFin || normalized.fecha_evento_fin),
      lugar_evento: normalized.lugar_evento || "",
      duracion_dias: normalized.duracion_dias || 1,
      requiere_armado: normalized.requiere_armado || false,
      subtotal: normalized.subtotal || 0,
      descuento: normalized.descuento || 0,
      total: normalized.total || 0,
      observaciones: normalized.observaciones || "",
      condiciones: normalized.condiciones || "",
      estado: normalized.estado || "borrador",
      items: this.normalizeItems(normalized.items).map((item) => ({
        nombre: item.nombre || "Artículo sin nombre",
        descripcion: Array.isArray(item.descripcion) ? item.descripcion : item.descripcion ? [item.descripcion] : [],
        cantidad: parseFloat(String(item.cantidad || 0)) || 1,
        precio_unitario: parseFloat(String(item.precio_unitario || item.precioBase || 0)) || 0,
        unidad: item.unidad || "servicio",
        subtotal: parseFloat(String(item.subtotal || item.total || 0)) || 0
      }))
    };
  }
  /**
   * Obtiene la información de estado de una cotización de forma robusta y normalizada.
   * Maneja variaciones de género (masculino/femenino) y mayúsculas/minúsculas.
   */
  static getQuoteStatusInfo(estado) {
    const s = String(estado || "borrador").toLowerCase().trim();
    if (s.includes("borrador")) {
      return { text: "Borrador", variant: "secondary", bgClass: "bg-gray-100 dark:bg-gray-700", textClass: "text-gray-800 dark:text-gray-200" };
    }
    if (s.includes("enviad")) {
      return { text: "Enviado", variant: "info", bgClass: "bg-blue-100 dark:bg-blue-900", textClass: "text-blue-800 dark:text-blue-200" };
    }
    if (s.includes("aprob")) {
      return { text: "Aprobado", variant: "success", bgClass: "bg-green-100 dark:bg-green-900", textClass: "text-green-800 dark:text-green-200" };
    }
    if (s.includes("recha")) {
      return { text: "Rechazado", variant: "danger", bgClass: "bg-red-100 dark:bg-red-900", textClass: "text-red-800 dark:text-red-200" };
    }
    if (s.includes("pendien")) {
      return { text: "Pendiente", variant: "warning", bgClass: "bg-amber-100 dark:bg-amber-900", textClass: "text-amber-800 dark:text-amber-200" };
    }
    return { text: "Desconocido", variant: "primary", bgClass: "bg-gray-100 dark:bg-gray-600", textClass: "text-gray-800 dark:text-gray-200" };
  }
}

export { QuoteHelper as Q };
