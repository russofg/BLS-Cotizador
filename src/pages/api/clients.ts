import type { APIRoute } from 'astro';
import { clienteService, cotizacionService } from '../../utils/database';
import { ClienteService, InvalidCursorError } from '../../services/ClienteService';
import { FieldValue } from 'firebase-admin/firestore';
// cache/CacheKeys used by ClienteService internally
import { checkRateLimit } from '../../utils/rateLimit';
import { AnalyticsService } from '../../services/AnalyticsService';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const limited = checkRateLimit(request, 'READ', 'clients');
    if (limited) return limited;

    // ── Stats shortcut ──────────────────────────────────────────────────────
    if (url.searchParams.get('stats') === 'true') {
      const stats = await ClienteService.getStats();
      return new Response(JSON.stringify(stats), { status: 200, headers: JSON_HEADERS });
    }

    // ── Parse query params ──────────────────────────────────────────────────
    const includeQuoteCount = url.searchParams.get('includeQuoteCount') === 'true';
    const cursor = url.searchParams.get('cursor') ?? null;
    const rawPageSize = url.searchParams.get('pageSize');
    const parsedPageSize = rawPageSize ? parseInt(rawPageSize, 10) : 25;
    const pageSize = isNaN(parsedPageSize) ? 25 : Math.max(1, Math.min(parsedPageSize, 100));
    const search = url.searchParams.get('search') ?? undefined;

    // Existing filter params (preserved for backward compat)
    const activoParam = url.searchParams.get('activo');
    const empresaParam = url.searchParams.get('empresa');
    const filters: Record<string, any> = {};
    if (activoParam !== null) filters.activo = activoParam === 'true';
    if (empresaParam) filters.empresa = empresaParam;

    // ── Paginated listing via list() ────────────────────────────────────────
    const listResult = await ClienteService.list({
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      search,
      cursor,
      pageSize
    });

    let items: any[] = listResult.items;

    if (includeQuoteCount) {
      items = items.map((cliente: any) => ({
        ...cliente,
        cotizaciones: cliente.quoteCount ?? 0,
      }));
    }

    return new Response(
      JSON.stringify({
        items,
        nextCursor: listResult.nextCursor,
        hasMore: listResult.hasMore,
        pageSize: listResult.pageSize
      }),
      { status: 200, headers: JSON_HEADERS }
    );
  } catch (error) {
    if (error instanceof InvalidCursorError) {
      return new Response(
        JSON.stringify({ error: 'invalid_cursor', message: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Error fetching clients:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error al obtener clientes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, 'WRITE', 'clients');
    if (limited) return limited;
    const clientData = await request.json();
    
    // Validate required fields
    if (!clientData.nombre) {
      return new Response(JSON.stringify({ 
        error: 'El nombre es obligatorio'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const newClient = await clienteService.create({
      nombre: clientData.nombre,
      empresa: clientData.empresa || '',
      email: clientData.email || '',
      telefono: clientData.telefono || '',
      direccion: clientData.direccion || '',
      activo: true,
      ...(clientData.imagenBase64 ? { imagenBase64: clientData.imagenBase64 } : {}),
      createdAt: new Date()
    });
    
    // Invalidate analytics cache
    AnalyticsService.invalidateCache();
    
    return new Response(JSON.stringify(newClient), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al crear cliente'
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
    const limited = checkRateLimit(request, 'WRITE', 'clients');
    if (limited) return limited;
    const clientData = await request.json();
    
    if (!clientData.id) {
      return new Response(JSON.stringify({ 
        error: 'ID del cliente es obligatorio'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await clienteService.update(clientData.id, {
      nombre: clientData.nombre,
      empresa: clientData.empresa || '',
      email: clientData.email || '',
      telefono: clientData.telefono || '',
      direccion: clientData.direccion || '',
      activo: clientData.activo !== undefined ? clientData.activo : true,
      ...(clientData.imagenBase64 === null
        ? { imagenBase64: FieldValue.delete() as any }  // Explicit removal
        : clientData.imagenBase64 !== undefined
          ? { imagenBase64: clientData.imagenBase64 }   // New upload
          : {})                                          // No change
    });
    
    // Get updated client
    const updatedClient = await clienteService.getById(clientData.id);
    
    // Invalidate analytics cache
    AnalyticsService.invalidateCache();
    
    return new Response(JSON.stringify(updatedClient), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al actualizar cliente'
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
    const limited = checkRateLimit(request, 'WRITE', 'clients');
    if (limited) return limited;
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'ID del cliente es obligatorio'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if client has any quotes — targeted query, not full collection scan
    const { adminDb } = await import('../../utils/firebaseAdmin');
    const quotesSnap = await adminDb
      .collection('cotizaciones')
      .where('clienteId', '==', id)
      .get();

    if (quotesSnap.size > 0) {
      const quoteNumbers = quotesSnap.docs.map((d: any) => d.data().numero).filter(Boolean);
      return new Response(JSON.stringify({
        error: 'No se puede eliminar el cliente porque tiene cotizaciones asociadas',
        details: `El cliente tiene ${quotesSnap.size} cotización(es) asociada(s). Debe eliminar primero las cotizaciones: ${quoteNumbers.join(', ')}`,
        hasQuotes: true,
        quotesCount: quotesSnap.size,
        quoteNumbers
      }), {
        status: 409, // Conflict
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await clienteService.delete(id);
    
    // Invalidate analytics cache
    AnalyticsService.invalidateCache();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al eliminar cliente'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};