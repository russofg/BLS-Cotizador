import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks before any import resolves.
const { mockCreateSessionCookie, mockVerifySessionCookie, mockGetAdminAuth } = vi.hoisted(() => {
  const mockCreateSessionCookie = vi.fn();
  const mockVerifySessionCookie = vi.fn();
  const mockGetAdminAuth = vi.fn(() => ({
    createSessionCookie: mockCreateSessionCookie,
    verifySessionCookie: mockVerifySessionCookie,
  }));
  return { mockCreateSessionCookie, mockVerifySessionCookie, mockGetAdminAuth };
});

// Override the global setup.ts mock for firebaseAdmin with one that includes getAdminAuth.
vi.mock('../../src/utils/firebaseAdmin', () => ({
  getAdminAuth: mockGetAdminAuth,
  adminDb: {},
}));

import {
  COOKIE_NAME,
  SESSION_TTL_MS,
  createSessionCookieFromIdToken,
  verifySessionCookieToken,
  buildCookieHeader,
  clearCookieHeader,
} from '../../src/utils/sessionCookie';

describe('sessionCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Constants ──────────────────────────────────────────────────────────────

  it('exports COOKIE_NAME as "__session"', () => {
    expect(COOKIE_NAME).toBe('__session');
  });

  it('exports SESSION_TTL_MS as 5 days in milliseconds', () => {
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    expect(SESSION_TTL_MS).toBe(fiveDaysMs);
  });

  // ── createSessionCookieFromIdToken ─────────────────────────────────────────

  describe('createSessionCookieFromIdToken()', () => {
    it('calls getAdminAuth().createSessionCookie with the idToken and expiresIn=SESSION_TTL_MS', async () => {
      mockCreateSessionCookie.mockResolvedValue('session-jwt-value');

      const result = await createSessionCookieFromIdToken('test-id-token');

      expect(mockGetAdminAuth).toHaveBeenCalledOnce();
      expect(mockCreateSessionCookie).toHaveBeenCalledWith('test-id-token', {
        expiresIn: SESSION_TTL_MS,
      });
      expect(result).toBe('session-jwt-value');
    });

    it('propagates errors thrown by createSessionCookie', async () => {
      mockCreateSessionCookie.mockRejectedValue(new Error('invalid_id_token'));

      await expect(createSessionCookieFromIdToken('bad-token')).rejects.toThrow(
        'invalid_id_token',
      );
    });
  });

  // ── verifySessionCookieToken ───────────────────────────────────────────────

  describe('verifySessionCookieToken()', () => {
    it('calls getAdminAuth().verifySessionCookie with checkRevoked=true', async () => {
      const decodedToken = { uid: 'user-123', email: 'test@test.com' };
      mockVerifySessionCookie.mockResolvedValue(decodedToken);

      const result = await verifySessionCookieToken('valid-cookie');

      expect(mockGetAdminAuth).toHaveBeenCalledOnce();
      expect(mockVerifySessionCookie).toHaveBeenCalledWith('valid-cookie', true);
      expect(result).toEqual(decodedToken);
    });

    it('propagates errors thrown by verifySessionCookie', async () => {
      mockVerifySessionCookie.mockRejectedValue(new Error('session_cookie_revoked'));

      await expect(verifySessionCookieToken('revoked-cookie')).rejects.toThrow(
        'session_cookie_revoked',
      );
    });
  });

  // ── buildCookieHeader ──────────────────────────────────────────────────────

  describe('buildCookieHeader()', () => {
    it('returns a header string with the cookie name and value', () => {
      const header = buildCookieHeader('my-jwt');
      expect(header).toContain(`${COOKIE_NAME}=my-jwt`);
    });

    it('includes HttpOnly flag', () => {
      expect(buildCookieHeader('val')).toContain('HttpOnly');
    });

    it('includes SameSite=Lax in development and SameSite=Strict in production', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      expect(buildCookieHeader('val')).toContain('SameSite=Lax');
      process.env.NODE_ENV = 'production';
      expect(buildCookieHeader('val')).toContain('SameSite=Strict');
      process.env.NODE_ENV = original;
    });

    it('includes Max-Age equal to SESSION_TTL_MS / 1000', () => {
      const expectedMaxAge = SESSION_TTL_MS / 1000;
      expect(buildCookieHeader('val')).toContain(`Max-Age=${expectedMaxAge}`);
    });

    it('includes Path=/', () => {
      expect(buildCookieHeader('val')).toContain('Path=/');
    });

    it('includes Secure flag when NODE_ENV is not "development"', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        expect(buildCookieHeader('val')).toContain('Secure');
      } finally {
        process.env.NODE_ENV = original;
      }
    });

    it('omits Secure flag when NODE_ENV is "development"', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      try {
        expect(buildCookieHeader('val')).not.toContain('Secure');
      } finally {
        process.env.NODE_ENV = original;
      }
    });
  });

  // ── clearCookieHeader ──────────────────────────────────────────────────────

  describe('clearCookieHeader()', () => {
    it('returns a header string with the cookie name set to empty', () => {
      const header = clearCookieHeader();
      expect(header).toContain(`${COOKIE_NAME}=`);
    });

    it('sets Max-Age=0 to expire the cookie immediately', () => {
      expect(clearCookieHeader()).toContain('Max-Age=0');
    });

    it('includes Path=/', () => {
      expect(clearCookieHeader()).toContain('Path=/');
    });
  });
});
