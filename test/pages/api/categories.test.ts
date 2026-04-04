import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetAll, mockCheckRateLimit } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockCheckRateLimit: vi.fn()
}));

vi.mock('../../../src/utils/database', () => ({
  categoriaService: {
    getAll: mockGetAll
  }
}));

vi.mock('../../../src/utils/rateLimit', () => ({
  checkRateLimit: mockCheckRateLimit
}));

import { GET } from '../../../src/pages/api/categories';

describe('/api/categories GET', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue(null);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns categories from the service boundary', async () => {
    mockGetAll.mockResolvedValue([
      { id: 'cat-1', nombre: 'Audio', orden: 1 },
      { id: 'cat-2', nombre: 'Video', orden: 2 }
    ]);

    const response = await GET({
      request: new Request('http://localhost/api/categories'),
    } as any);

    expect(mockCheckRateLimit).toHaveBeenCalled();
    expect(mockGetAll).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      success: true,
      categories: [
        { id: 'cat-1', nombre: 'Audio', orden: 1 },
        { id: 'cat-2', nombre: 'Video', orden: 2 }
      ]
    });
  });

  it('returns the rate-limit response when blocked', async () => {
    const limitedResponse = new Response(JSON.stringify({ error: 'limited' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
    mockCheckRateLimit.mockReturnValue(limitedResponse);

    const response = await GET({
      request: new Request('http://localhost/api/categories'),
    } as any);

    expect(response).toBe(limitedResponse);
    expect(mockGetAll).not.toHaveBeenCalled();
  });

  it('returns a 500 response when the service fails', async () => {
    mockGetAll.mockRejectedValue(new Error('service failed'));

    const response = await GET({
      request: new Request('http://localhost/api/categories'),
    } as any);

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: 'service failed'
    });
  });
});
