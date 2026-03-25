import { c as clienteService, a as cotizacionService } from '../../chunks/database_DkOv4JpX.mjs';
import '../../chunks/cache_0UIU9YOL.mjs';
import { c as checkRateLimit } from '../../chunks/rateLimit_BZOM_jHI.mjs';
import { AnalyticsService } from '../../chunks/AnalyticsService_rWPlso16.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "clients");
    if (limited) return limited;
    const includeQuoteCount = url.searchParams.get("includeQuoteCount") === "true";
    const allClientes = await clienteService.getAll();
    const clientes = allClientes.filter((cliente) => cliente.activo !== false);
    if (includeQuoteCount) {
      const allQuotes = await cotizacionService.getAll();
      const quotesByClient = /* @__PURE__ */ new Map();
      allQuotes.forEach((quote) => {
        const clientId = quote.clienteId || quote.cliente_id;
        if (clientId) {
          if (!quotesByClient.has(clientId)) {
            quotesByClient.set(clientId, []);
          }
          quotesByClient.get(clientId).push(quote);
        }
      });
      const clientesWithCounts = clientes.map((cliente) => {
        try {
          const clientQuotes = quotesByClient.get(cliente.id) || [];
          const quoteCount = clientQuotes.length;
          const latestQuote = clientQuotes.length > 0 ? clientQuotes.reduce(
            (latest, current) => new Date(current.createdAt || 0) > new Date(latest.createdAt || 0) ? current : latest
          ).createdAt : cliente.createdAt;
          return {
            ...cliente,
            cotizaciones: quoteCount,
            ultimaCotizacion: new Date(latestQuote).toISOString().split("T")[0]
          };
        } catch (error) {
          console.error("Error getting quote count for client:", cliente.id, error);
          return {
            ...cliente,
            cotizaciones: 0,
            ultimaCotizacion: new Date(cliente.createdAt).toISOString().split("T")[0]
          };
        }
      });
      return new Response(JSON.stringify(clientesWithCounts), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });
    }
    return new Response(JSON.stringify(clientes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al obtener clientes"
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
    const limited = checkRateLimit(request, "WRITE", "clients");
    if (limited) return limited;
    const clientData = await request.json();
    if (!clientData.nombre) {
      return new Response(JSON.stringify({
        error: "El nombre es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const newClient = await clienteService.create({
      nombre: clientData.nombre,
      empresa: clientData.empresa || "",
      email: clientData.email || "",
      telefono: clientData.telefono || "",
      direccion: clientData.direccion || "",
      activo: true,
      createdAt: /* @__PURE__ */ new Date()
    });
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify(newClient), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al crear cliente"
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
    const limited = checkRateLimit(request, "WRITE", "clients");
    if (limited) return limited;
    const clientData = await request.json();
    if (!clientData.id) {
      return new Response(JSON.stringify({
        error: "ID del cliente es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await clienteService.update(clientData.id, {
      nombre: clientData.nombre,
      empresa: clientData.empresa || "",
      email: clientData.email || "",
      telefono: clientData.telefono || "",
      direccion: clientData.direccion || "",
      activo: clientData.activo !== void 0 ? clientData.activo : true
    });
    const updatedClient = await clienteService.getById(clientData.id);
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify(updatedClient), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al actualizar cliente"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
const DELETE = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "WRITE", "clients");
    if (limited) return limited;
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({
        error: "ID del cliente es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const allQuotes = await cotizacionService.getAll();
    const clientQuotes = allQuotes.filter((quote) => quote.clienteId === id);
    if (clientQuotes.length > 0) {
      return new Response(JSON.stringify({
        error: "No se puede eliminar el cliente porque tiene cotizaciones asociadas",
        details: `El cliente tiene ${clientQuotes.length} cotización(es) asociada(s). Debe eliminar primero las cotizaciones: ${clientQuotes.map((q) => q.numero).join(", ")}`,
        hasQuotes: true,
        quotesCount: clientQuotes.length,
        quoteNumbers: clientQuotes.map((q) => q.numero)
      }), {
        status: 409,
        // Conflict
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await clienteService.delete(id);
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al eliminar cliente"
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
