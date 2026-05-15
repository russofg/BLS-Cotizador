import { getIdToken } from './auth';

/**
 * Drop-in replacement for `fetch` that automatically attaches a Firebase
 * Bearer token to every request.
 *
 * - If `Authorization` is already set by the caller it is preserved.
 * - On a 401 response the request is retried once with a force-refreshed token.
 * - If the retry also fails (or getIdToken throws), a synthetic 401 Response is
 *   returned so callers always have a uniform error model (ADR-002).
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const buildRequest = async (forceRefresh: boolean): Promise<Response> => {
    const token = await getIdToken(forceRefresh);
    const headers = new Headers(init.headers);

    // Never overwrite an Authorization header the caller set explicitly.
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
  };

  const first = await buildRequest(false);
  if (first.status !== 401) return first;

  // One retry with a fresh token.
  try {
    const second = await buildRequest(true);
    return second;
  } catch {
    // getIdToken(true) threw (e.g. refresh token revoked) — return a
    // synthetic 401 so the caller has a single error model.
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
