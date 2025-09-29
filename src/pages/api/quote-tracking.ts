import type { APIRoute } from 'astro';
import { QuoteTrackingService, QuoteStatus } from '../../services/QuoteTrackingService';

export const GET: APIRoute = async ({ url }) => {
  try {
    const action = url.searchParams.get('action') || 'list';
    const quoteId = url.searchParams.get('quoteId');
    
    let result;
    
    switch (action) {
      case 'stats':
        result = await QuoteTrackingService.getTrackingStats();
        break;
        
      case 'quote':
        if (!quoteId) {
          return new Response(JSON.stringify({ 
            error: 'ID de cotización es requerido'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        result = await QuoteTrackingService.getByIdWithTracking(quoteId);
        break;
        
      case 'list':
      default:
        result = await QuoteTrackingService.getAllWithTracking();
        break;
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in quote tracking API:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al obtener datos de seguimiento'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, quoteId, status, comentario, usuario, tipo, fecha, mensaje } = body;
    
    switch (action) {
      case 'update-status':
        if (!quoteId || !status) {
          return new Response(JSON.stringify({ 
            error: 'ID de cotización y estado son requeridos'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        
        await QuoteTrackingService.updateStatus(quoteId, status, comentario, usuario);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Estado actualizado correctamente' 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
      case 'delete-reminder':
        if (!quoteId) {
          return new Response(JSON.stringify({ 
            error: 'ID de cotización es requerido'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        
        await QuoteTrackingService.deleteReminder(quoteId, 'current');
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Recordatorio eliminado correctamente' 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
      case 'schedule-reminder':
        if (!quoteId || !tipo || !fecha || !mensaje) {
          return new Response(JSON.stringify({ 
            error: 'ID de cotización, tipo, fecha y mensaje son requeridos'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        
        const { sendEmail = false, sendPush = true, userName = 'Usuario', userEmail, recipients = [] } = body;
        
        await QuoteTrackingService.scheduleReminder(
          quoteId, 
          tipo, 
          new Date(fecha), 
          mensaje,
          sendEmail,
          sendPush,
          userName,
          userEmail,
          recipients
        );
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Recordatorio programado correctamente' 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
      default:
        return new Response(JSON.stringify({ 
          error: 'Acción no válida'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
    }
  } catch (error) {
    console.error('Error in quote tracking POST API:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al procesar solicitud'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
};
