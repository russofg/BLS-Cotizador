/**
 * Firestore-backed rate limiter — serverless safe.
 *
 * Uses atomic Firestore increments so counters are shared across all
 * Netlify Function instances. Falls open if Firestore is unavailable
 * (request is allowed rather than blocked on infrastructure failure).
 *
 * Collection: _rateLimit
 * Document ID: {prefix}:{ip}:{windowBucket}
 */

import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit for a key using Firestore as the shared counter store.
 * windowMs must match across all callers for the same key prefix.
 */
export async function checkRateLimitFirestore(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetIn = windowStart + windowMs - now;
  const docId = `${key}:${windowStart}`;

  try {
    const ref = adminDb.collection('_rateLimit').doc(docId);

    const count = await adminDb.runTransaction(async (txn) => {
      const snap = await txn.get(ref);
      const current: number = snap.exists ? (snap.data()!.count as number) : 0;

      if (current >= maxRequests) return current;

      txn.set(
        ref,
        {
          count: FieldValue.increment(1),
          expiresAt: windowStart + windowMs,
        },
        { merge: true },
      );

      return current + 1;
    });

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetIn,
    };
  } catch {
    // Fail open — never block legitimate traffic on infrastructure errors.
    return { allowed: true, remaining: maxRequests, resetIn };
  }
}

// ── Presets ───────────────────────────────────────────────────────────────────

export const FirestoreRateLimitPresets = {
  /** Auth operations: 10 req/min — brute-force protection */
  AUTH: { maxRequests: 10, windowMs: 60_000 },
  /** Write operations: 30 req/min */
  WRITE: { maxRequests: 30, windowMs: 60_000 },
} as const;

// ── Helper ────────────────────────────────────────────────────────────────────

function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

/**
 * Drop-in replacement for checkRateLimit() — returns a 429 Response or null.
 * Use this for sensitive endpoints (auth, write operations).
 */
export async function checkRateLimitPersistent(
  request: Request,
  preset: keyof typeof FirestoreRateLimitPresets,
  prefix: string,
): Promise<Response | null> {
  const ip = getIp(request);
  const key = `${prefix}:${ip}`;
  const config = FirestoreRateLimitPresets[preset];

  const result = await checkRateLimitFirestore(key, config.maxRequests, config.windowMs);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(result.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
        },
      },
    );
  }

  return null;
}
