import type { APIRoute } from 'astro';
import { clienteService, cotizacionService } from '../../utils/database';
import { cache, CacheKeys, CacheTTL } from '../../utils/cache';

export const GET: APIRoute = async ({ url }) => {
  try {
    const includeQuoteCount = url.searchParams.get('includeQuoteCount') === 'true';
    
    // Always get fresh data from the service (which has its own cache)
    // Filter to show only active clients
    const allClientes = await clienteService.getAll();
    const clientes = allClientes.filter(cliente => cliente.activo !== false);
    
    if (includeQuoteCount) {
      // Optimized: Get all quotes once instead of N+1 queries
      const allQuotes = await cotizacionService.getAll();
      
      // Create a map of client ID to quotes for O(1) lookup
      const quotesByClient = new Map<string, any[]>();
      allQuotes.forEach(quote => {
        const clientId = quote.clienteId || quote.cliente_id;
        if (clientId) {
          if (!quotesByClient.has(clientId)) {
            quotesByClient.set(clientId, []);
          }
          quotesByClient.get(clientId)!.push(quote);
        }
      });

      // Process clients with optimized quote lookup
      const clientesWithCounts = clientes.map((cliente: any) => {
        try {
          const clientQuotes = quotesByClient.get(cliente.id) || [];
          
          const quoteCount = clientQuotes.length;
          const latestQuote = clientQuotes.length > 0 
            ? clientQuotes.reduce((latest: any, current: any) => 
                new Date(current.createdAt || 0) > new Date(latest.createdAt || 0) ? current : latest
              ).createdAt
            : cliente.createdAt;
          
          return {
            ...cliente,
            cotizaciones: quoteCount,
            ultimaCotizacion: new Date(latestQuote).toISOString().split('T')[0]
          };
        } catch (error) {
          console.error('Error getting quote count for client:', cliente.id, error);
          return {
            ...cliente,
            cotizaciones: 0,
            ultimaCotizacion: new Date(cliente.createdAt).toISOString().split('T')[0]
          };
        }
      });
      
      return new Response(JSON.stringify(clientesWithCounts), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    return new Response(JSON.stringify(clientes), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al obtener clientes'
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
      createdAt: new Date()
    });
    
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
      activo: clientData.activo !== undefined ? clientData.activo : true
    });
    
    // Get updated client
    const updatedClient = await clienteService.getById(clientData.id);
    
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

    // Check if client has any quotes using Firebase
    const allQuotes = await cotizacionService.getAll();
    const clientQuotes = allQuotes.filter(quote => quote.clienteId === id);

    // If client has quotes, return error with details
    if (clientQuotes.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'No se puede eliminar el cliente porque tiene cotizaciones asociadas',
        details: `El cliente tiene ${clientQuotes.length} cotización(es) asociada(s). Debe eliminar primero las cotizaciones: ${clientQuotes.map((q: any) => q.numero).join(', ')}`,
        hasQuotes: true,
        quotesCount: clientQuotes.length,
        quoteNumbers: clientQuotes.map((q: any) => q.numero)
      }), {
        status: 409, // Conflict
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await clienteService.delete(id);
    
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