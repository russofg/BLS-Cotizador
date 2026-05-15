import type { APIRoute } from "astro";
import { cotizacionService } from "../../utils/database";
import { ClienteService } from "../../services/ClienteService";
import { CotizacionService, InvalidCursorError } from "../../services/CotizacionService";
import { DateHelper } from "../../utils/dateHelpers";
import { QuoteHelper } from "../../utils/quoteHelpers";
import { ValidationHelper } from "../../utils/validationHelpers";
import { checkRateLimit } from "../../utils/rateLimit";
import { AnalyticsService } from "../../services/AnalyticsService";

const VALID_ESTADOS = new Set(['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida']);

/**
 * Cotizador-Online API
 *
 * Features implemented:
 * - Multi-day events with start and end dates
 * - Auto-calculation of duration based on start/end dates
 * - Support for setup day flag (requiere_armado)
 * - Item price customization with original price preservation
 * - Fixed timezone issues for date handling
 * - Centralized validation and date handling
 */

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "quotes");
    if (limited) return limited;
    // Check if a specific quote ID is requested
    const quoteId = url.searchParams.get("id");

    if (quoteId) {
      // Get specific quote by ID
      const cotizacion = await CotizacionService.getById(quoteId);

      if (!cotizacion) {
        return new Response(
          JSON.stringify({
            error: "Cotización no encontrada",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      // Also get client data
      const { clienteService } = await import("../../utils/database");
      const clientes = await clienteService.getAllForAggregates();
      const cliente = clientes.find(
        (c: any) =>
          c.id === (cotizacion as any).cliente_id ||
          c.id === cotizacion.clienteId,
      );

      // Return quote with client data and items
      return new Response(
        JSON.stringify({
          cotizacion,
          cliente: cliente || null,
          items: cotizacion.items || [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      // Paginated listing
      const cursor = url.searchParams.get("cursor") ?? null;
      const rawPageSize = url.searchParams.get("pageSize");
      const parsedPageSize = rawPageSize ? parseInt(rawPageSize, 10) : 25;
      const pageSize = isNaN(parsedPageSize) ? 25 : Math.max(1, Math.min(parsedPageSize, 100));
      const search = url.searchParams.get("search") ?? null;
      const estadoParam = url.searchParams.get("estado") ?? null;

      // Validate estado
      if (estadoParam !== null && !VALID_ESTADOS.has(estadoParam)) {
        return new Response(
          JSON.stringify({ error: "invalid_estado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const estado = estadoParam as 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida' | null;

      let listResult;
      let warning: string | undefined;
      try {
        listResult = await CotizacionService.list({ cursor, pageSize, estado });
      } catch (err) {
        if (err instanceof InvalidCursorError) {
          return new Response(
            JSON.stringify({ error: "invalid_cursor", message: (err as Error).message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        throw err;
      }

      let items = listResult.items as any[];

      // In-memory search over { numero, titulo, lugar_evento, clienteNombre }
      // clientes loaded from cache (getAllForAggregates TTL 60s) — no extra Firestore read on repeat searches
      if (search) {
        const term = search.toLowerCase();
        const clientes = await ClienteService.getAllForAggregates();
        const clienteMap = new Map(clientes.map(c => [c.id, c]));
        items = items.filter(q => {
          const cliente = clienteMap.get(q.clienteId ?? (q as any).cliente_id);
          const clienteNombre = cliente ? `${cliente.nombre} ${cliente.empresa ?? ''}`.toLowerCase() : '';
          return (
            (q.numero && String(q.numero).toLowerCase().includes(term)) ||
            (q.titulo && String(q.titulo).toLowerCase().includes(term)) ||
            (q.lugar_evento && String(q.lugar_evento).toLowerCase().includes(term)) ||
            clienteNombre.includes(term)
          );
        });
      }

      const responseBody: Record<string, unknown> = {
        items,
        nextCursor: listResult.nextCursor,
        hasMore: listResult.hasMore,
        pageSize: listResult.pageSize,
      };
      if (warning) responseBody.warning = warning;

      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener cotizaciones",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    const quoteData = await request.json();

    // Validate quote data using centralized validation
    const validation = ValidationHelper.validateQuote(quoteData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: validation.errors.join(", "),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get setup day flag
    const requiresSetup =
      quoteData.requiere_armado === true || quoteData.requiere_armado === "on";

    // Calculate duration in days using centralized helper
    let duracionDias = parseInt(quoteData.duracion_dias) || 1;

    // If both start and end dates are provided but no duration, calculate it
    if (
      quoteData.fecha_evento &&
      quoteData.fecha_evento_fin &&
      !quoteData.duracion_dias
    ) {
      duracionDias = QuoteHelper.calculateEventDuration(
        quoteData.fecha_evento,
        quoteData.fecha_evento_fin,
      );
    }

    // Calculate end date if not provided using centralized helper
    let fechaEventoFin = null;
    try {
      if (quoteData.fecha_evento_fin) {
        fechaEventoFin = DateHelper.safeParseDate(quoteData.fecha_evento_fin);
      }

      // If we don't have a valid end date but we have start date and duration > 1, calculate end date
      if (!fechaEventoFin && quoteData.fecha_evento && duracionDias > 1) {
        const startDate = DateHelper.safeParseDate(quoteData.fecha_evento);
        if (startDate) {
          fechaEventoFin = DateHelper.calculateEndDate(startDate, duracionDias);
        }
      }

      // If we still don't have end date but have start date, use start date
      if (!fechaEventoFin && quoteData.fecha_evento) {
        fechaEventoFin = DateHelper.safeParseDate(quoteData.fecha_evento);
      }
    } catch (e) {
      console.error("Error processing event dates:", e);
    }

    const year = new Date().getFullYear();
    const numeroAsignado = await CotizacionService.assignQuoteNumber(year);

    // Create the new quote with all necessary fields
    const newQuote = await cotizacionService.create({
      cliente_id: quoteData.cliente_id, // For compatibility
      clienteId: quoteData.cliente_id, // Standard field
      venueId: quoteData.venue_id || null,
      numero: numeroAsignado,
      fecha: new Date(),
      fechaEvento: quoteData.fecha_evento
        ? DateHelper.safeParseDate(quoteData.fecha_evento)
        : null,
      fechaEventoFin: fechaEventoFin,
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
      validoHasta: new Date(
        Date.now() +
          (parseInt(quoteData.vigencia_dias) || 30) * 24 * 60 * 60 * 1000,
      ),
      observaciones: quoteData.observaciones || null,
      notas: quoteData.observaciones || null,
      condiciones: quoteData.condiciones || null,
      items: quoteData.items || [],
      created_at: new Date(), // For compatibility
      createdAt: new Date(), // Standard field
    } as any);

    // Increment denormalized quoteCount on client
    if (quoteData.cliente_id) {
      ClienteService.incrementQuoteCount(quoteData.cliente_id, 1);
    }

    // Invalidate analytics cache
    AnalyticsService.invalidateCache();

    return new Response(JSON.stringify(newQuote), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating quote:", error);
    return new Response(
      JSON.stringify({
        error:
          "Error al crear cotización",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    const quoteData = await request.json();

    if (!quoteData.id) {
      return new Response(
        JSON.stringify({
          error: "ID de la cotización es obligatorio",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Preparar datos para actualización (usando estructura flexible para compatibilidad)
    const updateData: any = {
      titulo: quoteData.titulo,
      descripcion: quoteData.descripcion || null,
      estado: quoteData.estado || "borrador",
      subtotal: parseFloat(quoteData.subtotal) || 0,
      total: parseFloat(quoteData.total) || 0,
      items: quoteData.items || [],
    };

    // Agregar campos condicionales
    if (quoteData.cliente_id) {
      updateData.clienteId = quoteData.cliente_id;
      updateData.cliente_id = quoteData.cliente_id; // Mantener ambos para compatibilidad
    }

    // Enhanced date handling for multi-day events
    let startDate = null;
    let endDate = null;

    // Process start date using centralized helper
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

    // Process end date using centralized helper
    try {
      if (quoteData.fecha_evento_fin) {
        endDate = DateHelper.safeParseDate(quoteData.fecha_evento_fin);
        if (endDate) {
          updateData.fechaEventoFin = endDate;
          updateData.fecha_evento_fin = quoteData.fecha_evento_fin;
        } else {
          console.warn(
            "Invalid end date received:",
            quoteData.fecha_evento_fin,
          );
          endDate = null;
        }
      }
    } catch (e) {
      console.error("Error processing end date:", e);
    }

    // Duration in days - now primary duration measure
    let duracionDias = 1;
    if (quoteData.duracion_dias !== undefined) {
      duracionDias = parseInt(quoteData.duracion_dias) || 1;
      updateData.duracion_dias = duracionDias;

      // Note: We no longer set duracion_horas to undefined
      // Instead, we just don't include it in the update to avoid Firebase errors
    }

    // Cross-validate and fix dates/duration for consistency
    try {
      // If we have both dates, validate and potentially update duration using centralized helper
      if (startDate && endDate) {
        const calculatedDays = DateHelper.calculateDurationInDays(
          startDate,
          endDate,
        );

        // If calculated days don't match provided duration, update duration
        if (calculatedDays !== duracionDias) {
          updateData.duracion_dias = calculatedDays;
        }
      }
      // If we only have start date and duration, calculate end date using centralized helper
      else if (startDate && !endDate && duracionDias > 1) {
        const end = DateHelper.calculateEndDate(startDate, duracionDias);

        updateData.fechaEventoFin = end;
        updateData.fecha_evento_fin = DateHelper.safeFormatDateForInput(end);
      }
      // If we only have end date and duration, calculate start date using centralized helper
      else if (!startDate && endDate && duracionDias > 1) {
        const start = new Date(endDate);
        start.setDate(endDate.getDate() - (duracionDias - 1)); // Resta días (inclusive)

        updateData.fechaEvento = start;
        updateData.fecha_evento = DateHelper.safeFormatDateForInput(start);
      }
      // If only start date exists, set end date equal to start date
      else if (startDate && !endDate) {
        updateData.fechaEventoFin = new Date(startDate);
        updateData.fecha_evento_fin = quoteData.fecha_evento;
      }
      // If only end date exists, set start date equal to end date
      else if (!startDate && endDate) {
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

    if (quoteData.descuento !== undefined) {
      updateData.descuento = parseFloat(quoteData.descuento) || 0;
    }

    if (quoteData.vigencia_dias) {
      updateData.vigencia_dias = parseInt(quoteData.vigencia_dias);
    }

    // Setup day flag
    if (quoteData.requiere_armado !== undefined) {
      updateData.requiere_armado = quoteData.requiere_armado;
    }

    // Event location
    if (quoteData.lugar_evento) {
      updateData.lugar_evento = quoteData.lugar_evento;
    }

    // Calcular totales si hay items
    if (
      quoteData.items &&
      Array.isArray(quoteData.items) &&
      quoteData.items.length > 0
    ) {
      // Preserve original item information when updating
      quoteData.items = quoteData.items.map((item: any) => {
        return {
          ...item,
          precio_original: item.precio_original || item.precio_unitario || 0,
          item_id: item.item_id || null,
        };
      });

      const subtotal = quoteData.items.reduce((sum: number, item: any) => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const precio = parseFloat(item.precio_unitario) || 0;
        return sum + cantidad * precio;
      }, 0);

      const descuento = parseFloat(quoteData.descuento) || 0;
      const descuentoMonto = (subtotal * descuento) / 100;
      const total = subtotal - descuentoMonto;

      updateData.subtotal = subtotal;
      updateData.total = total;

    }

    // Ajustar quoteCount si el cliente cambió
    if (quoteData.cliente_id) {
      const currentQuote = await cotizacionService.getById(quoteData.id);
      const oldClienteId = currentQuote?.clienteId ?? (currentQuote as any)?.cliente_id;
      if (oldClienteId && oldClienteId !== quoteData.cliente_id) {
        ClienteService.incrementQuoteCount(oldClienteId, -1);
        ClienteService.incrementQuoteCount(quoteData.cliente_id, 1);
      }
    }

    // Actualizar la cotización
    await cotizacionService.update(quoteData.id, updateData);

    // Obtener la cotización actualizada
    const updatedQuote = await cotizacionService.getById(quoteData.id);

    // Invalidate analytics cache
    AnalyticsService.invalidateCache();

    if (!updatedQuote) {
      throw new Error("No se pudo obtener la cotización actualizada");
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: updatedQuote.id,
        message: "Cotización actualizada exitosamente",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ Error updating quote:", error);
    return new Response(
      JSON.stringify({
        error: "Error al actualizar cotización",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "quotes");
    if (limited) return limited;
    let id = null;

    // Try to get ID from URL parameter first (for GET-style DELETE)
    const urlId = url.searchParams.get("id");
    if (urlId) {
      id = urlId;
    } else {
      // If no URL parameter, try to get from request body
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {
        // If can't parse JSON, maybe it's empty body
        console.warn("Could not parse DELETE request body:", e);
      }
    }

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "ID de la cotización es obligatorio",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const quoteToDelete = await CotizacionService.getById(id);
    await cotizacionService.delete(id);

    // Decrement denormalized quoteCount on client
    const deletedClienteId = quoteToDelete?.clienteId ?? (quoteToDelete as any)?.cliente_id;
    if (deletedClienteId) {
      ClienteService.incrementQuoteCount(deletedClienteId, -1);
    }

    // Invalidate analytics cache
    AnalyticsService.invalidateCache();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return new Response(
      JSON.stringify({
        error: "Error al eliminar cotización",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
