import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from './firebaseAdmin';

/** Cookie name — matches Firebase Hosting's reserved name for SSR forwarding. */
export const COOKIE_NAME = '__session';

/** Session TTL: 5 days expressed in milliseconds (Firebase Admin's createSessionCookie uses ms). */
export const SESSION_TTL_MS = 5 * 24 * 60 * 60 * 1000; // 432_000_000

/**
 * Creates a Firebase Admin session cookie from a short-lived Firebase ID token.
 * The returned cookie is valid for SESSION_TTL_MS milliseconds.
 */
export async function createSessionCookieFromIdToken(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_TTL_MS });
}

/**
 * Verifies a Firebase Admin session cookie, checking for revocation.
 * Throws if the cookie is invalid, expired, or revoked.
 */
export async function verifySessionCookieToken(cookie: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifySessionCookie(cookie, true);
}

/**
 * Serializes a Set-Cookie header value for setting the session cookie.
 * Omits the Secure flag in development (NODE_ENV === 'development') so
 * localhost works over plain HTTP.
 */
export function buildCookieHeader(value: string): string {
  const maxAgeSec = SESSION_TTL_MS / 1000;
  const isProduction = process.env.NODE_ENV !== 'development';
  const secure = isProduction ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; HttpOnly${secure}; SameSite=Lax; Max-Age=${maxAgeSec}; Path=/`;
}

/**
 * Serializes a Set-Cookie header value that immediately expires the session cookie.
 * Use this on logout to clear the cookie server-side.
 */
export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/`;
}
