import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Firestore mock factory ──────────────────────────────────────────────────
// Chainable query: collection().where().orderBy().orderBy().startAfter().limit().get()

const getMock = vi.fn();
const limitMock = vi.fn();
const startAfterMock = vi.fn();
const whereMock = vi.fn();
const orderByMock = vi.fn();
const collectionMock = vi.fn();

const chainable = () => ({
  where: whereMock,
  orderBy: orderByMock,
  startAfter: startAfterMock,
  limit: limitMock,
  get: getMock,
});

function resetChain() {
  whereMock.mockReturnValue(chainable());
  orderByMock.mockReturnValue(chainable());
  startAfterMock.mockReturnValue(chainable());
  limitMock.mockReturnValue(chainable());
  collectionMock.mockReturnValue(chainable());
}

vi.mock('../../utils/firebaseAdmin', () => ({
  adminDb: {
    get collection() { return collectionMock; },
  },
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldPath: {
    documentId: () => '__name__',
  },
  FieldValue: {
    increment: (n: number) => n,
    delete: () => ({ _methodName: 'FieldValue.delete' }),
  },
}));

vi.mock('../QuoteTrackingService', () => ({
  QuoteTrackingService: {
    invalidateCache: vi.fn(),
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeFirestoreDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    exists: true,
    data: () => ({ ...data }),
  };
}

function makeSnapshot(docs: ReturnType<typeof makeFirestoreDoc>[]) {
  return { docs, empty: docs.length === 0, size: docs.length };
}

function makeDate(isoString: string) {
  const d = new Date(isoString);
  return { toDate: () => d };
}

function makeCotizacion(index: number, overrides?: Record<string, unknown>) {
  const createdAt = new Date(`2024-${String(index % 12 + 1).padStart(2, '0')}-01`);
  return makeFirestoreDoc(`cot-${index}`, {
    numero: `COT-${String(index).padStart(4, '0')}`,
    titulo: `Cotizacion ${index}`,
    clienteId: `cliente-${index}`,
    estado: 'borrador',
    subtotal: 1000,
    impuestos: 0,
    total: 1000,
    fecha: makeDate(createdAt.toISOString()),
    createdAt: makeDate(createdAt.toISOString()),
    updatedAt: makeDate(createdAt.toISOString()),
    ...overrides,
  });
}

// Dynamic import AFTER mocks are hoisted
async function loadService() {
  const module = await import('../CotizacionService');
  return {
    CotizacionService: module.CotizacionService,
    InvalidCursorError: module.InvalidCursorError,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CotizacionService.list()', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('SC-01: first page with 60 docs returns 25 items, hasMore=true, non-null cursor', async () => {
    const { CotizacionService } = await loadService();

    // 26 docs returned → limit(26) probe detects hasMore
    const docs = Array.from({ length: 26 }, (_, i) => makeCotizacion(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await CotizacionService.list({ pageSize: 25 });

    expect(result.items).toHaveLength(25);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).not.toBeNull();
    expect(typeof result.nextCursor).toBe('string');
    expect(result.pageSize).toBe(25);
  });

  it('SC-02: last page — 5 remaining docs, hasMore=false, null cursor', async () => {
    const { CotizacionService } = await loadService();

    const docs = Array.from({ length: 5 }, (_, i) => makeCotizacion(i + 25));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const cursor = CotizacionService.encodeCursor({
      t: new Date('2024-06-01').toISOString(),
      id: 'cot-24',
    });
    const result = await CotizacionService.list({ pageSize: 25, cursor });

    expect(result.items).toHaveLength(5);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('SC-03: empty collection returns empty items, hasMore=false, null cursor', async () => {
    const { CotizacionService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    const result = await CotizacionService.list({});

    expect(result.items).toHaveLength(0);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('SC-07 (service): invalid cursor throws InvalidCursorError', async () => {
    const { CotizacionService, InvalidCursorError } = await loadService();

    // decodeCursor throws — but list() catches it and resets to first page
    // To test decodeCursor directly:
    expect(() => CotizacionService.decodeCursor('not-valid!!!')).toThrow(InvalidCursorError);
  });

  it('SC-11: pageSize=500 is clamped to 100 — limit called with 101 (+1 probe)', async () => {
    const { CotizacionService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await CotizacionService.list({ pageSize: 500 });

    expect(limitMock).toHaveBeenCalledWith(101);
  });

  it('cursor roundtrip: encode then decode produces same payload', async () => {
    const { CotizacionService } = await loadService();

    const payload = { t: new Date('2024-03-15T10:00:00.000Z').toISOString(), id: 'cot-abc' };
    const encoded = CotizacionService.encodeCursor(payload);
    const decoded = CotizacionService.decodeCursor(encoded);

    expect(decoded).toEqual(payload);
  });

  it('estado filter: applies where clause before orderBy', async () => {
    const { CotizacionService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await CotizacionService.list({ estado: 'aprobada' });

    // where should have been called with estado filter
    const whereCalls = whereMock.mock.calls;
    const estadoCall = whereCalls.find(
      (c: any[]) => c[0] === 'estado' && c[1] === '==' && c[2] === 'aprobada'
    );
    expect(estadoCall).toBeDefined();
  });

  it('no estado filter: where() is NOT called for estado', async () => {
    const { CotizacionService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await CotizacionService.list({});

    const whereCalls = whereMock.mock.calls;
    const estadoCall = whereCalls.find(
      (c: any[]) => c[0] === 'estado'
    );
    expect(estadoCall).toBeUndefined();
  });

  it('SC-04: exact boundary — 25 docs with pageSize=25, hasMore=false', async () => {
    const { CotizacionService } = await loadService();

    // 25 docs returned — limit(26) fetches 25+1 probe but only 25 exist
    const docs = Array.from({ length: 25 }, (_, i) => makeCotizacion(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await CotizacionService.list({ pageSize: 25 });

    expect(result.items).toHaveLength(25);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});

describe('CotizacionService.getAllForAggregates()', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('SC-16: returns full collection without calling limit()', async () => {
    const { CotizacionService } = await loadService();

    const docs = Array.from({ length: 60 }, (_, i) => makeCotizacion(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await CotizacionService.getAllForAggregates();

    expect(result).toHaveLength(60);
    expect(limitMock).not.toHaveBeenCalled();
  });
});

describe('CotizacionService.getAll() deprecated alias', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('delegates to getAllForAggregates() and returns same results', async () => {
    const { CotizacionService } = await loadService();

    const docs = Array.from({ length: 3 }, (_, i) => makeCotizacion(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await CotizacionService.getAll();
    expect(result).toHaveLength(3);
  });
});
