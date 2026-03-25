import { a as adminDb } from '../../chunks/firebaseAdmin_DoQo1nZX.mjs';
import { c as checkRateLimit } from '../../chunks/rateLimit_BZOM_jHI.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const limited = checkRateLimit(request, "READ", "users");
    if (limited) return limited;
    const snapshot = await adminDb.collection("usuarios").orderBy("nombre").get();
    const usuarios = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.activo !== false && data.notificacionesEmail !== false && data.email) {
        usuarios.push({
          id: doc.id,
          nombre: data.nombre || "",
          email: data.email || "",
          rol: data.rol || "usuario",
          departamento: data.departamento || "",
          telefono: data.telefono || ""
        });
      }
    });
    return new Response(JSON.stringify({
      success: true,
      usuarios
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error obteniendo usuarios",
      usuarios: []
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
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
