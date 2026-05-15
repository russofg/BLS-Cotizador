import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks so they are available before any import resolves.
const { mockGetIdToken } = vi.hoisted(() => ({
  mockGetIdToken: vi.fn()
}));

vi.mock('../../src/utils/auth', () => ({
  getIdToken: mockGetIdToken
}));

// apiFetch uses global fetch — stub it.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { apiFetch } from '../../src/utils/apiFetch';

// Helper to build a minimal Response-like object.
function makeResponse(status: number, body: unknown = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('apiFetch()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attaches Authorization header when user is authenticated', async () => {
    mockGetIdToken.mockResolvedValue('my-token');
    mockFetch.mockResolvedValue(makeResponse(200, { ok: true }));

    const response = await apiFetch('/api/quotes');

    expect(response.status).toBe(200);
    // Verify fetch was called with the Authorization header set.
    const [_input, init] = mockFetch.mock.calls[0] as [unknown, RequestInit & { headers: Headers }];
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer my-token');
  });

  it('sends request without Authorization when no user session exists', async () => {
    // getIdToken returns null for both the initial call and the forceRefresh retry.
    mockGetIdToken.mockResolvedValue(null);
    // Server returns 401 on both attempts (no user means no valid token either way).
    mockFetch
      .mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }))
      .mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }));

    const response = await apiFetch('/api/clients');

    expect(response.status).toBe(401);
    // Neither attempt should have an Authorization header (no token to attach).
    const [_input1, init1] = mockFetch.mock.calls[0] as [unknown, RequestInit & { headers: Headers }];
    expect((init1.headers as Headers).has('Authorization')).toBe(false);
    // Per spec: retry once on 401 regardless of whether a token was available.
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries with a fresh token on first 401 and returns success', async () => {
    mockGetIdToken
      .mockResolvedValueOnce('stale-token')   // first call
      .mockResolvedValueOnce('fresh-token');   // retry call (forceRefresh=true)

    mockFetch
      .mockResolvedValueOnce(makeResponse(401))    // first attempt fails
      .mockResolvedValueOnce(makeResponse(200, { ok: true })); // retry succeeds

    const response = await apiFetch('/api/quotes');

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const [, firstInit] = mockFetch.mock.calls[0] as [unknown, RequestInit & { headers: Headers }];
    const [, secondInit] = mockFetch.mock.calls[1] as [unknown, RequestInit & { headers: Headers }];

    expect((firstInit.headers as Headers).get('Authorization')).toBe('Bearer stale-token');
    expect((secondInit.headers as Headers).get('Authorization')).toBe('Bearer fresh-token');
  });

  it('returns the 401 Response when retry also returns 401', async () => {
    mockGetIdToken
      .mockResolvedValueOnce('stale-token')
      .mockResolvedValueOnce('still-stale');

    mockFetch
      .mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }))
      .mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }));

    const response = await apiFetch('/api/quotes');

    expect(response.status).toBe(401);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('returns synthetic 401 when getIdToken(true) throws during retry', async () => {
    mockGetIdToken
      .mockResolvedValueOnce('stale-token')
      .mockRejectedValueOnce(new Error('refresh token revoked'));

    mockFetch.mockResolvedValueOnce(makeResponse(401, { error: 'unauthorized' }));

    const response = await apiFetch('/api/quotes');

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: 'unauthorized' });
    // fetch was only called once (the retry buildRequest threw before calling fetch)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
