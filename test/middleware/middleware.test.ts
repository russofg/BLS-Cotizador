import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Local mock for firebaseAdmin ─────────────────────────────────────────────
// We do NOT touch test/setup.ts (which lacks getAdminAuth). Use a local
// vi.mock instead so it doesn't pollute other test files.
const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn()
}));

vi.mock('../../src/utils/firebaseAdmin', () => ({
  getAdminAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
  getAdminDb: vi.fn(),
  adminDb: {},
  adminAuth: {}
}));

// Import AFTER mocks are in place.
// authMiddlewareHandler lives in src/utils/authMiddleware.ts which has NO
// astro:middleware import — safe to import in Vitest.
import { authMiddlewareHandler } from '../../src/utils/authMiddleware';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeContext(
  path: string,
  authHeader?: string
): { request: Request; locals: App.Locals; url: URL } {
  const url = new URL(`http://localhost${path}`);
  const headers = new Headers();
  if (authHeader !== undefined) {
    headers.set('Authorization', authHeader);
  }
  return {
    request: new Request(url.toString(), { headers }),
    locals: { user: null } as App.Locals,
    url
  };
}

describe('authMiddlewareHandler', () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockResolvedValue(new Response('ok', { status: 200 }));
  });

  it('calls next() and populates locals.user for a valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'test@example.com',
      email_verified: true
    });

    const ctx = makeContext('/api/quotes', 'Bearer valid-token');
    const response = await authMiddlewareHandler(ctx, mockNext);

    expect(response.status).toBe(200);
    expect(mockNext).toHaveBeenCalledOnce();
    expect(ctx.locals.user).toEqual({
      uid: 'user-123',
      email: 'test@example.com',
      emailVerified: true
    });
  });

  it('returns 401 missing_token when Authorization header is absent', async () => {
    const ctx = makeContext('/api/clients'); // no auth header
    const response = await authMiddlewareHandler(ctx, mockNext);

    expect(response.status).toBe(401);
    expect(mockNext).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body).toEqual({ error: 'unauthorized', reason: 'missing_token' });
  });

  it('returns 401 missing_token when Authorization header is malformed', async () => {
    const ctx = makeContext('/api/clients', 'Token abc123'); // not Bearer
    const response = await authMiddlewareHandler(ctx, mockNext);

    expect(response.status).toBe(401);
    expect(mockNext).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.reason).toBe('missing_token');
  });

  it('returns 401 invalid_token when verifyIdToken throws', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

    const ctx = makeContext('/api/quotes', 'Bearer expired-token');
    const response = await authMiddlewareHandler(ctx, mockNext);

    expect(response.status).toBe(401);
    expect(mockNext).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body).toEqual({ error: 'unauthorized', reason: 'invalid_token' });
  });

  it('passes through non-API paths without touching locals.user', async () => {
    const ctx = makeContext('/dashboard'); // not /api/*
    const response = await authMiddlewareHandler(ctx, mockNext);

    expect(response.status).toBe(200);
    expect(mockNext).toHaveBeenCalledOnce();
    // locals.user must NOT be set by the middleware for non-API paths.
    expect(ctx.locals.user).toBeNull();
    // verifyIdToken must never be called.
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });
});
