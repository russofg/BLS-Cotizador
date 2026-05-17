import { getAdminAuth } from './firebaseAdmin';
import { COOKIE_NAME } from './sessionCookie';

// ── Public-route allowlists (exported for use in tests and other modules) ──────

/** Page routes that never require authentication. */
export const PUBLIC_PAGE_ROUTES = new Set<string>([
  '/login',
  '/forgot-password',
  '/register',
]);

/** URL prefixes for static assets and Astro build output — skip auth entirely. */
export const PUBLIC_PAGE_PREFIXES = ['/_astro/', '/public/', '/favicon'];

/** API route prefixes that are public (no Bearer required). */
export const PUBLIC_API_ROUTES = new Set<string>(['/api/session']);

// ── Internal helpers ───────────────────────────────────────────────────────────

function unauthorizedResponse(reason: 'missing_token' | 'invalid_token'): Response {
  return new Response(JSON.stringify({ error: 'unauthorized', reason }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Sanitizes the `next` redirect target so it is always a same-origin path.
 * Accepts only paths that start with `/` and do NOT start with `//`
 * (which would be interpreted as a protocol-relative URL by browsers).
 */
function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

/**
 * Handles `/api/*` requests: requires a valid Firebase ID-token Bearer header.
 * Public API routes (e.g. `/api/session`) are allowed through without a token.
 */
async function handleApiAuth(
  context: { request: Request; locals: App.Locals; url: URL },
  next: () => Promise<Response>,
): Promise<Response> {
  // Allow public API routes through without any Bearer check.
  if (PUBLIC_API_ROUTES.has(context.url.pathname)) {
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
      emailVerified: decoded.email_verified,
    };
  } catch {
    return unauthorizedResponse('invalid_token');
  }

  return next();
}

/**
 * Handles page (non-API) requests: reads the `__session` cookie, verifies it
 * via Firebase Admin, and populates `locals.user` on success.
 * Redirects to `/login?next=<encoded-path>` on failure or absence of cookie.
 */
async function handlePageAuth(
  context: { request: Request; locals: App.Locals; url: URL },
  next: () => Promise<Response>,
): Promise<Response> {
  const { pathname } = context.url;

  // Static-asset prefixes — skip auth entirely.
  if (PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return next();
  }

  // Allowlisted public pages — skip auth.
  if (PUBLIC_PAGE_ROUTES.has(pathname)) {
    return next();
  }

  // Read the session cookie.
  const cookieHeader = context.request.headers.get('cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const cookieValue = match ? match[1] : null;

  if (!cookieValue) {
    const next_ = sanitizeNext(pathname);
    const location = `/login?next=${encodeURIComponent(next_)}`;
    return new Response(null, { status: 302, headers: { location } });
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(cookieValue, true);
    context.locals.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
    };
  } catch {
    // Invalid, expired, or revoked cookie — redirect without a `next` param to
    // avoid leaking the protected URL after a potential session compromise.
    return new Response(null, { status: 302, headers: { location: '/login' } });
  }

  return next();
}

// ── Public entry-point ─────────────────────────────────────────────────────────

/**
 * Core auth middleware handler — no Astro runtime imports so it can be
 * unit-tested in Vitest without the `astro:middleware` virtual module.
 *
 * Dispatches by URL prefix:
 * - `/api/*`      → handleApiAuth  (Bearer token; /api/session is public)
 * - everything else → handlePageAuth (session cookie; PUBLIC_PAGE_ROUTES pass through)
 *
 * Auth runs BEFORE rate-limit (rate-limit lives inside each handler — ADR-001).
 */
export async function authMiddlewareHandler(
  context: { request: Request; locals: App.Locals; url: URL },
  next: () => Promise<Response>,
): Promise<Response> {
  if (context.url.pathname.startsWith('/api/')) {
    return handleApiAuth(context, next);
  }

  return handlePageAuth(context, next);
}
