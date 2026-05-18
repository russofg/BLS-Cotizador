import type { APIRoute } from 'astro';
import { adminDb } from '../../utils/firebaseAdmin';
import { checkRateLimit } from '../../utils/rateLimit';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const limited = checkRateLimit(request, 'READ', 'users');
    if (limited) return limited;

    // Determine if caller is admin — one targeted read, not a full collection scan.
    let callerIsAdmin = false;
    if (locals.user?.uid) {
      const callerSnap = await adminDb.collection('usuarios').doc(locals.user.uid).get();
      callerIsAdmin = callerSnap.exists && callerSnap.data()?.rol === 'admin';
    }

    const snapshot = await adminDb.collection('usuarios').orderBy('nombre').get();

    const usuarios: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.activo !== false && data.notificacionesEmail !== false && data.email) {
        const base = {
          id: doc.id,
          nombre: data.nombre || '',
          email: data.email || '',
          rol: data.rol || 'usuario',
          departamento: data.departamento || '',
        };
        // telefono is PII — only expose to admins
        usuarios.push(callerIsAdmin ? { ...base, telefono: data.telefono || '' } : base);
      }
    });

    return new Response(JSON.stringify({ success: true, usuarios }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error obteniendo usuarios', usuarios: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
