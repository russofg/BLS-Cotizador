import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks before any import resolves.
const { mockVerifySessionCookie, mockGetAdminAuth } = vi.hoisted(() => {
  const mockVerifySessionCookie = vi.fn();
  const mockGetAdminAuth = vi.fn(() => ({
    verifySessionCookie: mockVerifySessionCookie,
  }));
  return { mockVerifySessionCookie, mockGetAdminAuth };
});

vi.mock('../../src/utils/firebaseAdmin', () => ({
  getAdminAuth: mockGetAdminAuth,
  adminDb: {},
}));

import { authMiddlewareHandler } from '../../src/utils/authMiddleware';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeContext(
  pathname: string,
  cookieValue?: string,
  method = 'GET'
): { request: Request; locals: App.Locals; url: URL } {
  const url = new URL(`http://localhost:4321${pathname}`);
  const headers: Record<string, string> = {};
  if (cookieValue !== undefined) {
    headers['cookie'] = `__session=${cookieValue}`;
  }
  const request = new Request(url, { method, headers });
  const locals = { user: null } as App.Locals;
  return { request, locals, url };
}

const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('handlePageAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Protected page, no cookie ──────────────────────────────────────────────

  it('/dashboard with no cookie → 302 redirect to /login?next=%2Fdashboard', async () => {
    const ctx = makeContext('/dashboard');
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location).toBe('/login?next=%2Fdashboard');
    expect(next).not.toHaveBeenCalled();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  // ── Protected page, invalid cookie ────────────────────────────────────────

  it('/dashboard with invalid cookie → 302 redirect to /login', async () => {
    mockVerifySessionCookie.mockRejectedValue(new Error('session_cookie_revoked'));
    const ctx = makeContext('/dashboard', 'bad-cookie-value');
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location).toBe('/login');
    expect(next).not.toHaveBeenCalled();
  });

  // ── Protected page, valid cookie ───────────────────────────────────────────

  it('/dashboard with valid cookie → next() called and locals.user populated', async () => {
    mockVerifySessionCookie.mockResolvedValue({
      uid: 'user-xyz',
      email: 'user@example.com',
      email_verified: true,
    });
    const ctx = makeContext('/dashboard', 'valid-session-jwt');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(ctx.locals.user).toEqual({
      uid: 'user-xyz',
      email: 'user@example.com',
      emailVerified: true,
    });
    expect(mockVerifySessionCookie).toHaveBeenCalledWith('valid-session-jwt', true);
  });

  // ── Public page routes (allowlist) ─────────────────────────────────────────

  it('/login → next() without checking cookie', async () => {
    const ctx = makeContext('/login');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  it('/forgot-password → next() without checking cookie', async () => {
    const ctx = makeContext('/forgot-password');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  it('/register → next() without checking cookie (public page)', async () => {
    const ctx = makeContext('/register');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  // ── Asset prefixes ─────────────────────────────────────────────────────────

  it('/_astro/foo.js → next() without checking cookie', async () => {
    const ctx = makeContext('/_astro/foo.js');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  it('/favicon.ico → next() without checking cookie', async () => {
    const ctx = makeContext('/favicon.ico');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  it('/public/image.png → next() without checking cookie', async () => {
    const ctx = makeContext('/public/image.png');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifySessionCookie).not.toHaveBeenCalled();
  });

  // ── next param sanitization ────────────────────────────────────────────────

  it('redirect encodes the pathname correctly when next is /cotizaciones', async () => {
    const ctx = makeContext('/cotizaciones');
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/login?next=%2Fcotizaciones');
  });

  it('redirect does not use an open-redirect when pathname is // (sanitized to /dashboard)', async () => {
    // This would be impossible via URL constructor in practice, but the sanitize
    // function must be tested in isolation — here we test the middleware still
    // redirects to /login with a safe fallback when the url itself is used.
    // Since URL constructor normalizes // → /, the redirect will use /dashboard fallback.
    const ctx = makeContext('/protected-page');
    // Simulate a ?next=//evil.com in the url (attacker-controlled)
    ctx.url = new URL('http://localhost:4321/protected-page?next=//evil.com');
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(302);
    // The location must NOT contain //evil.com
    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('//evil.com');
  });
});
