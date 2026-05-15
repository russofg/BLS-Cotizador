/**
 * Tests for GET /api/quotes endpoint — paginated path.
 * Covers: param forwarding, cursor error → 400, invalid estado → 400,
 * backward-compat (no params → first page), in-memory search.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──────────────────────────────────────────────────────────
const { listMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
}));

const InvalidCursorErrorMock = vi.hoisted(() => {
  class InvalidCursorError extends Error {
    constructor(msg = 'Invalid cursor') { super(msg); this.name = 'InvalidCursorError'; }
  }
  return InvalidCursorError;
});

vi.mock('../../../services/CotizacionService', () => ({
  CotizacionService: { list: listMock, getById: vi.fn() },
  InvalidCursorError: InvalidCursorErrorMock,
}));

vi.mock('../../../utils/database', () => ({
  cotizacionService: { getAll: vi.fn(), create: vi.fn() },
}));

vi.mock('../../../services/ClienteService', () => ({
  ClienteService: {
    getAllForAggregates: vi.fn().mockResolvedValue([]),
    incrementQuoteCount: vi.fn(),
  },
}));

vi.mock('../../../utils/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(null),
}));

vi.mock('../../../services/AnalyticsService', () => ({
  AnalyticsService: { invalidateCache: vi.fn() },
}));

vi.mock('../../../utils/validationHelpers', () => ({
  ValidationHelper: { validateQuote: vi.fn().mockReturnValue({ isValid: true, errors: [] }) },
}));

vi.mock('../../../utils/quoteHelpers', () => ({
  QuoteHelper: {
    computeNextQuoteNumberForYear: vi.fn().mockReturnValue('2026-0001'),
    normalizeItems: vi.fn(items => items),
    calculateEventDuration: vi.fn().mockReturnValue(1),
  },
}));

vi.mock('../../../utils/dateHelpers', () => ({
  DateHelper: { safeParseDate: vi.fn(), calculateEndDate: vi.fn() },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeContext(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return {
    url: { searchParams },
    request: { headers: { get: vi.fn() }, clone: vi.fn() },
  };
}

async function getHandler() {
  const mod = await import('../quotes');
  return mod.GET;
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('GET /api/quotes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('SC-11: no params → first page (backward compat)', async () => {
    listMock.mockResolvedValue({ items: [], nextCursor: null, hasMore: false, pageSize: 25 });
    const GET = await getHandler();
    const res = await GET(makeContext() as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('nextCursor');
    expect(body).toHaveProperty('hasMore');
    expect(body.pageSize).toBe(25);
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ cursor: null, pageSize: 25 }));
  });

  it('SC-08: invalid cursor → 400', async () => {
    listMock.mockRejectedValue(new InvalidCursorErrorMock('bad token'));
    const GET = await getHandler();
    const res = await GET(makeContext({ cursor: 'not-valid!!' }) as any);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_cursor');
  });

  it('SC-10: invalid estado → 400', async () => {
    const GET = await getHandler();
    const res = await GET(makeContext({ estado: 'inexistente' }) as any);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_estado');
  });

  it('SC-05: valid estado is forwarded to list()', async () => {
    listMock.mockResolvedValue({ items: [], nextCursor: null, hasMore: false, pageSize: 25 });
    const GET = await getHandler();
    await GET(makeContext({ estado: 'aprobada' }) as any);

    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ estado: 'aprobada' }));
  });

  it('in-memory search filters items on titulo', async () => {
    const items = [
      { id: '1', titulo: 'Lanzamiento Marca X', numero: '2026-0001', lugar_evento: null },
      { id: '2', titulo: 'Evento Interno', numero: '2026-0002', lugar_evento: null },
    ];
    listMock.mockResolvedValue({ items, nextCursor: null, hasMore: false, pageSize: 25 });
    const GET = await getHandler();
    const res = await GET(makeContext({ search: 'lanzamiento' }) as any);
    const body = await res.json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe('1');
  });

  it('cursor is forwarded to list()', async () => {
    listMock.mockResolvedValue({ items: [], nextCursor: null, hasMore: false, pageSize: 25 });
    const GET = await getHandler();
    await GET(makeContext({ cursor: 'abc123', pageSize: '10' }) as any);

    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ cursor: 'abc123', pageSize: 10 }));
  });
});
