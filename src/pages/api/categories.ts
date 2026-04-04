import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../utils/rateLimit';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, 'READ', 'categories');
    if (limited) return limited;

    const { categoriaService } = await import('../../utils/database');
    const categories = await categoriaService.getAll();

    return new Response(JSON.stringify({
      success: true,
      categories
    }), {
      status: 200,
      headers: JSON_HEADERS
    });
  } catch (error) {
    console.error('Error fetching categories:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener categorías'
    }), {
      status: 500,
      headers: JSON_HEADERS
    });
  }
};
