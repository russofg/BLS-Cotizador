import { i as itemService } from '../../chunks/database_DkOv4JpX.mjs';
import { c as checkRateLimit } from '../../chunks/rateLimit_BZOM_jHI.mjs';
import { AnalyticsService } from '../../chunks/AnalyticsService_rWPlso16.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "items");
    if (limited) return limited;
    const search = url.searchParams.get("search") || void 0;
    const categoria = url.searchParams.get("categoria") || void 0;
    const activo = url.searchParams.get("activo");
    const filters = {};
    if (search) filters.search = search;
    if (categoria) filters.categoria = categoria;
    if (activo !== null) filters.activo = activo === "true";
    const items = await itemService.getAll(filters);
    return new Response(JSON.stringify({
      success: true,
      items
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener items"
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
    const limited = checkRateLimit(request, "WRITE", "items");
    if (limited) return limited;
    const itemData = await request.json();
    if (!itemData.nombre || !itemData.categoria_id || !itemData.precio_base) {
      return new Response(JSON.stringify({
        error: "Nombre, categoría y precio son obligatorios"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const newItem = await itemService.create({
      nombre: itemData.nombre,
      categoriaId: itemData.categoria_id,
      codigo: itemData.codigo || void 0,
      descripcion: itemData.descripcion || void 0,
      unidad: itemData.unidad || "servicio",
      precioBase: parseFloat(itemData.precio_base),
      variantes: itemData.variantes || void 0,
      activo: itemData.activo !== false
    });
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al crear item"
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
    const limited = checkRateLimit(request, "WRITE", "items");
    if (limited) return limited;
    const itemData = await request.json();
    if (!itemData.id) {
      return new Response(JSON.stringify({
        error: "ID del item es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const updatedItem = await itemService.update(itemData.id, {
      nombre: itemData.nombre,
      categoriaId: itemData.categoria_id,
      codigo: itemData.codigo || void 0,
      descripcion: itemData.descripcion || void 0,
      unidad: itemData.unidad || "servicio",
      precioBase: parseFloat(itemData.precio_base),
      variantes: itemData.variantes || void 0,
      activo: itemData.activo !== false
    });
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al actualizar item"
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
    const limited = checkRateLimit(request, "WRITE", "items");
    if (limited) return limited;
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({
        error: "ID del item es obligatorio"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    await itemService.delete(id);
    AnalyticsService.invalidateCache();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Error al eliminar item"
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
