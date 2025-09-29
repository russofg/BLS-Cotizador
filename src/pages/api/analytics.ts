import type { APIRoute } from 'astro';
import { AnalyticsService } from '../../services/AnalyticsService';

export const GET: APIRoute = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'dashboard';
    
    let analytics;
    
    switch (type) {
      case 'quotes':
        analytics = await AnalyticsService.getQuoteAnalytics();
        break;
      case 'clients':
        analytics = await AnalyticsService.getClientAnalytics();
        break;
      case 'items':
        analytics = await AnalyticsService.getItemAnalytics();
        break;
      case 'dashboard':
      default:
        analytics = await AnalyticsService.getDashboardAnalytics();
        break;
    }
    
    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
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
