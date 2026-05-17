import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist mocks before any import resolves.
const { mockCreateSessionCookieFromIdToken, mockClearCookieHeader, mockBuildCookieHeader } =
  vi.hoisted(() => ({
    mockCreateSessionCookieFromIdToken: vi.fn(),
    mockClearCookieHeader: vi.fn(),
    mockBuildCookieHeader: vi.fn(),
  }));

vi.mock('../../../src/utils/sessionCookie', () => ({
  createSessionCookieFromIdToken: mockCreateSessionCookieFromIdToken,
  clearCookieHeader: mockClearCookieHeader,
  buildCookieHeader: mockBuildCookieHeader,
}));

import { POST, DELETE } from '../../../src/pages/api/session';

describe('/api/session', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ── POST ───────────────────────────────────────────────────────────────────

  describe('POST — create session cookie', () => {
    it('returns 200 and Set-Cookie header when idToken is valid', async () => {
      mockCreateSessionCookieFromIdToken.mockResolvedValue('session-jwt-abc');
      mockBuildCookieHeader.mockReturnValue(
        '__session=session-jwt-abc; HttpOnly; Secure; SameSite=Lax; Max-Age=432000; Path=/',
      );

      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'valid-firebase-id-token' }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(200);
      expect(mockCreateSessionCookieFromIdToken).toHaveBeenCalledWith(
        'valid-firebase-id-token',
      );
      expect(mockBuildCookieHeader).toHaveBeenCalledWith('session-jwt-abc');

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('__session=session-jwt-abc');
    });

    it('returns 400 when body is missing idToken field', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrongField: 'value' }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
      expect(mockCreateSessionCookieFromIdToken).not.toHaveBeenCalled();

      const body = await response.json();
      expect(body).toEqual({ error: 'bad_request' });
    });

    it('returns 400 when body is empty', async () => {
      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({ error: 'bad_request' });
    });

    it('returns 401 when Firebase Admin rejects the token', async () => {
      mockCreateSessionCookieFromIdToken.mockRejectedValue(
        new Error('invalid_id_token'),
      );

      const request = new Request('http://localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'bad-or-expired-token' }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body).toEqual({ error: 'invalid_token' });
    });
  });

  // ── DELETE ─────────────────────────────────────────────────────────────────

  describe('DELETE — clear session cookie', () => {
    it('returns 200 and Set-Cookie with Max-Age=0', async () => {
      mockClearCookieHeader.mockReturnValue('__session=; Max-Age=0; Path=/');

      const response = await DELETE({} as any);

      expect(response.status).toBe(200);
      expect(mockClearCookieHeader).toHaveBeenCalledOnce();

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('Max-Age=0');
    });
  });
});
