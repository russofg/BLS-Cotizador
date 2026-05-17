import type { APIRoute } from 'astro';
import {
  createSessionCookieFromIdToken,
  buildCookieHeader,
  clearCookieHeader,
} from '../../utils/sessionCookie';

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const idToken =
    body !== null &&
    typeof body === 'object' &&
    'idToken' in body &&
    typeof (body as Record<string, unknown>).idToken === 'string'
      ? (body as Record<string, string>).idToken
      : null;

  if (!idToken) {
    return new Response(JSON.stringify({ error: 'bad_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sessionCookie = await createSessionCookieFromIdToken(idToken);
    const cookieHeader = buildCookieHeader(sessionCookie);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async () => {
  const cookieHeader = clearCookieHeader();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
  });
};
