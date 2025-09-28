import type { APIRoute } from 'astro';
import { itemService } from '../../utils/database';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get('search') || undefined;
    const categoria = url.searchParams.get('categoria') || undefined;
    const activo = url.searchParams.get('activo');
    
    const filters: any = {};
    if (search) filters.search = search;
    if (categoria) filters.categoria = categoria;
    if (activo !== null) filters.activo = activo === 'true';
    
    const items = await itemService.getAll(filters);
    
    return new Response(JSON.stringify({
      success: true,
      items: items
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener items'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const itemData = await request.json();
    
    // Validate required fields
    if (!itemData.nombre || !itemData.categoria_id || !itemData.precio_base) {
      return new Response(JSON.stringify({ 
        error: 'Nombre, categoría y precio son obligatorios'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const newItem = await itemService.create({
      nombre: itemData.nombre,
      categoriaId: itemData.categoria_id,
      codigo: itemData.codigo || undefined,
      descripcion: itemData.descripcion || undefined,
      unidad: itemData.unidad || 'servicio',
      precioBase: parseFloat(itemData.precio_base),
      variantes: itemData.variantes || undefined,
      activo: itemData.activo !== false
    });
    
    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al crear item'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const itemData = await request.json();
    
    if (!itemData.id) {
      return new Response(JSON.stringify({ 
        error: 'ID del item es obligatorio'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const updatedItem = await itemService.update(itemData.id, {
      nombre: itemData.nombre,
      categoriaId: itemData.categoria_id,
      codigo: itemData.codigo || undefined,
      descripcion: itemData.descripcion || undefined,
      unidad: itemData.unidad || 'servicio',
      precioBase: parseFloat(itemData.precio_base),
      variantes: itemData.variantes || undefined,
      activo: itemData.activo !== false
    });
    
    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al actualizar item'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'ID del item es obligatorio'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await itemService.delete(id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al eliminar item'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
