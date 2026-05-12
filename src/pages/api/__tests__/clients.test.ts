/**
 * Tests for GET /api/clients endpoint logic.
 * Covers: param parsing, cursor forwarding, error on bad cursor,
 * backward-compat first-page response (no params), quote count scoping.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (must come before vi.mock) ───────────────────────────────
const { listMock, getAllForAggregatesMock, cotizacionGetAllMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  getAllForAggregatesMock: vi.fn(),
  cotizacionGetAllMock: vi.fn(),
}));

// ── Module mocks ──────────────────────────────────────────────────────────

vi.mock('../../../services/ClienteService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/ClienteService')>();
  return {
    ...actual,
    ClienteService: {
      list: listMock,
      getAllForAggregates: getAllForAggregatesMock,
    },
  };
});

vi.mock('../../../utils/database', () => ({
  clienteService: {
    getAllForAggregates: getAllForAggregatesMock,
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: listMock,
  },
  cotizacionService: {
    getAll: cotizacionGetAllMock,
  },
}));

vi.mock('../../../utils/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
}));

vi.mock('../../../services/AnalyticsService', () => ({
  AnalyticsService: { invalidateCache: vi.fn() },
}));

vi.mock('../../../utils/cache', () => ({
  cache: {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({ keys: [] }),
  },
  CacheKeys: {
    clientsList: vi.fn().mockReturnValue('mock-list-key'),
    clientsAggregates: vi.fn().mockReturnValue('mock-agg-key'),
    clientById: vi.fn().mockReturnValue('mock-client-key'),
    clients: vi.fn().mockReturnValue('mock-clients-key'),
    generateKey: vi.fn().mockReturnValue('mock-gen-key'),
  },
  CacheTTL: { SHORT: 60000, MEDIUM: 300000, LONG: 900000 },
  invalidateRelatedCache: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { delete: vi.fn().mockReturnValue(null) },
  FieldPath: { documentId: () => '__name__' },
}));

vi.mock('../../../utils/firebaseAdmin', () => ({
  adminDb: {
    collection: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ docs: [] }),
      add: vi.fn(),
      doc: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
        update: vi.fn(),
        delete: vi.fn(),
      }),
    }),
  },
}));

// ── Helper: build a fake Astro APIContext ──────────────────────────────────

function makeContext(searchParams: Record<string, string> = {}) {
  const urlObj = new URL('http://localhost/api/clients');
  Object.entries(searchParams).forEach(([k, v]) => urlObj.searchParams.set(k, v));
  return {
    url: urlObj,
    request: new Request(urlObj.toString()),
  };
}

async function getHandler() {
  const { GET } = await import('../clients');
  return GET;
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('GET /api/clients', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    listMock.mockResolvedValue({
      items: [],
      nextCursor: null,
      hasMore: false,
      pageSize: 25,
    });
    cotizacionGetAllMock.mockResolvedValue([]);
  });

  it('SC-10: no params → returns valid paginated shape with items/nextCursor/hasMore', async () => {
    listMock.mockResolvedValue({
      items: [{ id: '1', nombre: 'Ana', activo: true, email: 'a@b.com', createdAt: new Date() }],
      nextCursor: null,
      hasMore: false,
      pageSize: 25,
    });

    const GET = await getHandler();
    const ctx = makeContext();
    const response = await GET(ctx as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('nextCursor');
    expect(body).toHaveProperty('hasMore');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('cursor param is forwarded to ClienteService.list()', async () => {
    listMock.mockResolvedValue({ items: [], nextCursor: null, hasMore: false, pageSize: 25 });

    const GET = await getHandler();
    const ctx = makeContext({ cursor: 'abc123' });
    await GET(ctx as any);

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 'abc123' })
    );
  });

  it('SC-07: invalid cursor → HTTP 400 with error=invalid_cursor', async () => {
    const { InvalidCursorError } = await import('../../../services/ClienteService');
    listMock.mockRejectedValue(new InvalidCursorError('bad cursor'));

    const GET = await getHandler();
    const ctx = makeContext({ cursor: 'bad!!cursor' });
    const response = await GET(ctx as any);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('invalid_cursor');
  });

  it('includeQuoteCount=true computes counts only for page items, not all clients', async () => {
    const pageItems = [
      { id: 'c1', nombre: 'Cliente 1', activo: true, email: 'c1@test.com', createdAt: new Date() },
      { id: 'c2', nombre: 'Cliente 2', activo: true, email: 'c2@test.com', createdAt: new Date() },
    ];
    listMock.mockResolvedValue({ items: pageItems, nextCursor: null, hasMore: false, pageSize: 25 });

    cotizacionGetAllMock.mockResolvedValue([
      { clienteId: 'c1', numero: 'Q-001', createdAt: new Date() },
      { clienteId: 'c1', numero: 'Q-002', createdAt: new Date() },
    ]);

    const GET = await getHandler();
    const ctx = makeContext({ includeQuoteCount: 'true' });
    const response = await GET(ctx as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(2);

    const c1 = body.items.find((i: any) => i.id === 'c1');
    const c2 = body.items.find((i: any) => i.id === 'c2');
    expect(c1.cotizaciones).toBe(2);
    expect(c2.cotizaciones).toBe(0);

    // getAllForAggregates should NOT have been called for the listing path
    expect(getAllForAggregatesMock).not.toHaveBeenCalled();
  });

  it('pageSize param is forwarded to ClienteService.list()', async () => {
    listMock.mockResolvedValue({ items: [], nextCursor: null, hasMore: false, pageSize: 10 });

    const GET = await getHandler();
    const ctx = makeContext({ pageSize: '10' });
    await GET(ctx as any);

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 10 })
    );
  });
});
