import { a as cotizacionService, V as ValidationHelper } from '../../chunks/database_DkOv4JpX.mjs';
import { D as DateHelper } from '../../chunks/dateHelpers_DuxKPoxD.mjs';
import { Q as QuoteHelper } from '../../chunks/quoteHelpers_BMbd_S8Y.mjs';
import { c as checkRateLimit } from '../../chunks/rateLimit_BZOM_jHI.mjs';
import { AnalyticsService } from '../../chunks/AnalyticsService_rWPlso16.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "quotes");
    if (limited) return limited;
    const quoteId = url.searchParams.get("id");
    if (quoteId) {
      const cotizaciones = await cotizacionService.getAll();
      const cotizacion = cotizaciones.find((c) => c.id === quoteId);
      if (!cotizacion) {
        return new Response(JSON.stringify({
          error: "Cotización no encontrada"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      const { clienteService } = await import('../../chunks/database_DkOv4JpX.mjs').then(n => n.d);
      const clientes = await clienteService.getAll();
      const cliente = clientes.find(
        (c) => c.id === cotizacion.cliente_id || c.id === cotizacion.clienteId
      );
      return new Response(JSON.stringify({
        cotizacion,
        cliente: cliente || null,
        items: cotizacion.items || []
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      const cotizaciones = await cotizacionService.getAll();
      return new Response(JSON.stringify(cotizaciones), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al obtener cotizaciones"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    const quoteData = await request.json();
    const validation = ValidationHelper.validateQuote(quoteData);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        error: validation.errors.join(", ")
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const requiresSetup = quoteData.requiere_armado === true || quoteData.requiere_armado === "on";
    let duracionDias = parseInt(quoteData.duracion_dias) || 1;
    if (quoteData.fecha_evento && quoteData.fecha_evento_fin && !quoteData.duracion_dias) {
      duracionDias = QuoteHelper.calculateEventDuration(quoteData.fecha_evento, quoteData.fecha_evento_fin);
    }
    let fechaEventoFin = null;
    try {
      if (quoteData.fecha_evento_fin) {
        fechaEventoFin = DateHelper.safeParseDate(quoteData.fecha_evento_fin);
      }
      if (!fechaEventoFin && quoteData.fecha_evento && duracionDias > 1) {
        const startDate = DateHelper.safeParseDate(quoteData.fecha_evento);
        if (startDate) {
          fechaEventoFin = DateHelper.calculateEndDate(startDate, duracionDias);
        }
      }
      if (!fechaEventoFin && quoteData.fecha_evento) {
        fechaEventoFin = DateHelper.safeParseDate(quoteData.fecha_evento);
      }
    } catch (e) {
      console.error("Error processing event dates:", e);
    }
    const newQuote = await cotizacionService.create({
      cliente_id: quoteData.cliente_id,
      // For compatibility
      clienteId: quoteData.cliente_id,
      // Standard field
      venueId: quoteData.venue_id || null,
      numero: quoteData.numero || `COT-${Date.now()}`,
      fecha: /* @__PURE__ */ new Date(),
      fechaEvento: quoteData.fecha_evento ? DateHelper.safeParseDate(quoteData.fecha_evento) : null,
      fechaEventoFin,
      // Store duration in days
      duracion_dias: duracionDias,
      // Store setup day flag
      requiere_armado: requiresSetup,
      estado: quoteData.estado || "borrador",
      titulo: quoteData.titulo,
      descripcion: quoteData.descripcion || null,
      lugar_evento: quoteData.lugar_evento || null,
      subtotal: parseFloat(quoteData.subtotal) || 0,
      impuestos: 0,
      descuento: parseFloat(quoteData.descuento) || 0,
      total: parseFloat(quoteData.total) || 0,
      validoHasta: new Date(Date.now() + (parseInt(quoteData.vigencia_dias) || 30) * 24 * 60 * 60 * 1e3),
      observaciones: quoteData.observaciones || null,
      notas: quoteData.observaciones || null,
      condiciones: quoteData.condiciones || null,
      items: quoteData.items || [],
      created_at: /* @__PURE__ */ new Date(),
      // For compatibility
      createdAt: /* @__PURE__ */ new Date()
      // Standard field
    });
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify(newQuote), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error creating quote:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al crear cotización"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const PUT = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    const quoteData = await request.json();
    console.log("📥 Datos recibidos para actualización:", quoteData);
    if (!quoteData.id) {
      return new Response(JSON.stringify({
        error: "ID de la cotización es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const updateData = {
      titulo: quoteData.titulo,
      descripcion: quoteData.descripcion || null,
      estado: quoteData.estado || "borrador",
      subtotal: parseFloat(quoteData.subtotal) || 0,
      total: parseFloat(quoteData.total) || 0,
      items: quoteData.items || []
    };
    if (quoteData.cliente_id) {
      updateData.clienteId = quoteData.cliente_id;
      updateData.cliente_id = quoteData.cliente_id;
    }
    let startDate = null;
    let endDate = null;
    try {
      if (quoteData.fecha_evento) {
        startDate = DateHelper.safeParseDate(quoteData.fecha_evento);
        if (startDate) {
          updateData.fechaEvento = startDate;
          updateData.fecha_evento = quoteData.fecha_evento;
        } else {
          console.warn("Invalid start date received:", quoteData.fecha_evento);
          startDate = null;
        }
      }
    } catch (e) {
      console.error("Error processing start date:", e);
    }
    try {
      if (quoteData.fecha_evento_fin) {
        endDate = DateHelper.safeParseDate(quoteData.fecha_evento_fin);
        if (endDate) {
          updateData.fechaEventoFin = endDate;
          updateData.fecha_evento_fin = quoteData.fecha_evento_fin;
        } else {
          console.warn("Invalid end date received:", quoteData.fecha_evento_fin);
          endDate = null;
        }
      }
    } catch (e) {
      console.error("Error processing end date:", e);
    }
    let duracionDias = 1;
    if (quoteData.duracion_dias !== void 0) {
      duracionDias = parseInt(quoteData.duracion_dias) || 1;
      updateData.duracion_dias = duracionDias;
    }
    try {
      if (startDate && endDate) {
        const calculatedDays = DateHelper.calculateDurationInDays(startDate, endDate);
        if (calculatedDays !== duracionDias) {
          console.log(`Updating duration from ${duracionDias} to ${calculatedDays} based on dates`);
          updateData.duracion_dias = calculatedDays;
        }
      } else if (startDate && !endDate && duracionDias > 1) {
        const end = DateHelper.calculateEndDate(startDate, duracionDias);
        updateData.fechaEventoFin = end;
        updateData.fecha_evento_fin = DateHelper.safeFormatDateForInput(end);
        console.log(`Set end date to ${DateHelper.safeFormatDateForInput(end)} based on duration ${duracionDias}`);
      } else if (!startDate && endDate && duracionDias > 1) {
        const start = new Date(endDate);
        start.setDate(endDate.getDate() - (duracionDias - 1));
        updateData.fechaEvento = start;
        updateData.fecha_evento = DateHelper.safeFormatDateForInput(start);
        console.log(`Set start date to ${DateHelper.safeFormatDateForInput(start)} based on duration ${duracionDias}`);
      } else if (startDate && !endDate) {
        updateData.fechaEventoFin = new Date(startDate);
        updateData.fecha_evento_fin = quoteData.fecha_evento;
      } else if (!startDate && endDate) {
        updateData.fechaEvento = new Date(endDate);
        updateData.fecha_evento = quoteData.fecha_evento_fin;
      }
    } catch (e) {
      console.error("Error during date cross-validation:", e);
    }
    if (quoteData.observaciones) {
      updateData.notas = quoteData.observaciones;
      updateData.observaciones = quoteData.observaciones;
    }
    if (quoteData.condiciones) {
      updateData.condiciones = quoteData.condiciones;
    }
    if (quoteData.descuento !== void 0) {
      updateData.descuento = parseFloat(quoteData.descuento) || 0;
    }
    if (quoteData.vigencia_dias) {
      updateData.vigencia_dias = parseInt(quoteData.vigencia_dias);
    }
    if (quoteData.requiere_armado !== void 0) {
      updateData.requiere_armado = quoteData.requiere_armado;
    }
    if (quoteData.lugar_evento) {
      updateData.lugar_evento = quoteData.lugar_evento;
    }
    if (quoteData.items && Array.isArray(quoteData.items) && quoteData.items.length > 0) {
      quoteData.items = quoteData.items.map((item) => {
        return {
          ...item,
          precio_original: item.precio_original || item.precio_unitario || 0,
          item_id: item.item_id || null
        };
      });
      const subtotal = quoteData.items.reduce((sum, item) => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const precio = parseFloat(item.precio_unitario) || 0;
        return sum + cantidad * precio;
      }, 0);
      const descuento = parseFloat(quoteData.descuento) || 0;
      const descuentoMonto = subtotal * descuento / 100;
      const total = subtotal - descuentoMonto;
      updateData.subtotal = subtotal;
      updateData.total = total;
      console.log("💰 Totales calculados:", { subtotal, descuento, total });
    }
    console.log("📤 Datos preparados para Firebase:", updateData);
    await cotizacionService.update(quoteData.id, updateData);
    console.log("✅ Cotización actualizada en Firebase");
    const updatedQuote = await cotizacionService.getById(quoteData.id);
    console.log("📄 Cotización obtenida después de actualización:", updatedQuote);
    AnalyticsService.invalidateCache();
    if (!updatedQuote) {
      throw new Error("No se pudo obtener la cotización actualizada");
    }
    return new Response(JSON.stringify({
      success: true,
      id: updatedQuote.id,
      message: "Cotización actualizada exitosamente"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Error updating quote:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al actualizar cotización"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const DELETE = async ({ request, url }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    let id = null;
    const urlId = url.searchParams.get("id");
    if (urlId) {
      id = urlId;
    } else {
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {
        console.warn("Could not parse DELETE request body:", e);
      }
    }
    if (!id) {
      return new Response(JSON.stringify({
        error: "ID de la cotización es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    console.log("🗑️ Eliminando cotización con ID:", id);
    await cotizacionService.delete(id);
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al eliminar cotización"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
