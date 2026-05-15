import { getAdminAuth } from './firebaseAdmin';

function unauthorizedResponse(reason: 'missing_token' | 'invalid_token'): Response {
  return new Response(JSON.stringify({ error: 'unauthorized', reason }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Core auth middleware handler — no Astro runtime imports so it can be
 * unit-tested in Vitest without the `astro:middleware` virtual module.
 *
 * Guards every `/api/*` path:
 * 1. Non-API paths pass through immediately (locals.user stays null).
 * 2. Missing / malformed Authorization header → 401 missing_token.
 * 3. verifyIdToken throws → 401 invalid_token.
 * 4. Valid token → context.locals.user populated → next().
 *
 * Auth runs BEFORE rate-limit (rate-limit lives inside each handler — ADR-001).
 */
export async function authMiddlewareHandler(
  context: { request: Request; locals: App.Locals; url: URL },
  next: () => Promise<Response>
): Promise<Response> {
  if (!context.url.pathname.startsWith('/api/')) {
    return next();
  }

  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse('missing_token');
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    context.locals.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified
    };
  } catch {
    return unauthorizedResponse('invalid_token');
  }

  return next();
}
