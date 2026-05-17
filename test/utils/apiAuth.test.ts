import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks before any import resolves.
const { mockVerifyIdToken, mockGetAdminAuth } = vi.hoisted(() => {
  const mockVerifyIdToken = vi.fn();
  const mockGetAdminAuth = vi.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  }));
  return { mockVerifyIdToken, mockGetAdminAuth };
});

vi.mock('../../src/utils/firebaseAdmin', () => ({
  getAdminAuth: mockGetAdminAuth,
  adminDb: {},
}));

import { authMiddlewareHandler } from '../../src/utils/authMiddleware';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeContext(
  pathname: string,
  headers: Record<string, string> = {},
  method = 'GET'
): { request: Request; locals: App.Locals; url: URL } {
  const url = new URL(`http://localhost:4321${pathname}`);
  const request = new Request(url, { method, headers });
  const locals = { user: null } as App.Locals;
  return { request, locals, url };
}

const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('handleApiAuth (regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('/api/something with no Authorization header → 401 missing_token', async () => {
    const ctx = makeContext('/api/something');
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'unauthorized', reason: 'missing_token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('/api/something with malformed Authorization (no Bearer prefix) → 401 missing_token', async () => {
    const ctx = makeContext('/api/something', { Authorization: 'Basic abc123' });
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.reason).toBe('missing_token');
  });

  it('/api/something with invalid Bearer token → 401 invalid_token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('auth/id-token-expired'));
    const ctx = makeContext('/api/something', { Authorization: 'Bearer bad-token' });
    const res = await authMiddlewareHandler(ctx, next);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.reason).toBe('invalid_token');
    expect(next).not.toHaveBeenCalled();
  });

  it('/api/something with valid Bearer token → next() called and locals.user populated', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-abc',
      email: 'test@example.com',
      email_verified: true,
    });
    const ctx = makeContext('/api/something', { Authorization: 'Bearer valid-token' });
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    expect(ctx.locals.user).toEqual({
      uid: 'user-abc',
      email: 'test@example.com',
      emailVerified: true,
    });
  });

  it('/api/session POST with no Authorization header → passes through (public endpoint)', async () => {
    const ctx = makeContext('/api/session', {}, 'POST');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
    // Must NOT call verifyIdToken since it is a public API route
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('/api/session DELETE with no Authorization header → passes through (public endpoint)', async () => {
    const ctx = makeContext('/api/session', {}, 'DELETE');
    const res = await authMiddlewareHandler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });
});
