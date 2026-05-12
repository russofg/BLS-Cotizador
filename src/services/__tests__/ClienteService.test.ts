import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Firestore mock factory ──────────────────────────────────────────────────
// Chainable query: collection().orderBy().orderBy().where().startAfter().limit().get()

const getMock = vi.fn();
const limitMock = vi.fn();
const startAfterMock = vi.fn();
const whereMock = vi.fn();
const orderByMock = vi.fn();
const collectionMock = vi.fn();
const addMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();
const docGetMock = vi.fn();
const docMock = vi.fn();

const chainable = () => ({
  orderBy: orderByMock,
  where: whereMock,
  startAfter: startAfterMock,
  limit: limitMock,
  get: getMock,
});

function resetChain() {
  orderByMock.mockReturnValue(chainable());
  whereMock.mockReturnValue(chainable());
  startAfterMock.mockReturnValue(chainable());
  limitMock.mockReturnValue(chainable());
  collectionMock.mockReturnValue({
    ...chainable(),
    add: addMock,
    doc: docMock,
  });
  docMock.mockReturnValue({
    get: docGetMock,
    update: updateDocMock,
    delete: deleteDocMock,
  });
}

vi.mock('../../utils/firebaseAdmin', () => ({
  adminDb: {
    get collection() { return collectionMock; },
    get doc() { return docMock; },
    get add() { return addMock; },
  },
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldPath: {
    documentId: () => '__name__',
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

function makeCliente(index: number) {
  const nombre = `Cliente ${String(index).padStart(3, '0')}`;
  return makeFirestoreDoc(`id-${index}`, {
    nombre,
    nombreLower: nombre.toLowerCase(),
    email: `cliente${index}@test.com`,
    activo: true,
    createdAt: { toDate: () => new Date('2024-01-01') },
    updatedAt: { toDate: () => new Date('2024-01-01') },
  });
}

// Dynamic import AFTER mocks are hoisted
async function loadService() {
  const module = await import('../ClienteService');
  return {
    ClienteService: module.ClienteService,
    InvalidCursorError: module.InvalidCursorError,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ClienteService.list()', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('SC-01: first page with 60 docs returns 25 items, hasMore=true, non-null cursor', async () => {
    const { ClienteService } = await loadService();

    const docs = Array.from({ length: 26 }, (_, i) => makeCliente(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await ClienteService.list({ pageSize: 25 });

    expect(result.items).toHaveLength(25);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).not.toBeNull();
    expect(typeof result.nextCursor).toBe('string');
  });

  it('SC-02: last page — 5 remaining docs, hasMore=false, null cursor', async () => {
    const { ClienteService } = await loadService();

    const docs = Array.from({ length: 5 }, (_, i) => makeCliente(i + 25));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const cursor = ClienteService.encodeCursor({ n: 'cliente 024', id: 'id-24' });
    const result = await ClienteService.list({ pageSize: 25, cursor });

    expect(result.items).toHaveLength(5);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('SC-03: empty collection returns empty items, hasMore=false, null cursor', async () => {
    const { ClienteService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    const result = await ClienteService.list({});

    expect(result.items).toHaveLength(0);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('SC-04: exact boundary — 25 docs with pageSize=25, hasMore=false', async () => {
    const { ClienteService } = await loadService();

    const docs = Array.from({ length: 25 }, (_, i) => makeCliente(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await ClienteService.list({ pageSize: 25 });

    expect(result.items).toHaveLength(25);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('SC-05: search forwards where clauses for nombreLower prefix', async () => {
    const { ClienteService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await ClienteService.list({ search: 'garc' });

    const whereCalls = whereMock.mock.calls;
    const geCall = whereCalls.find((c: any[]) => c[0] === 'nombreLower' && c[1] === '>=');
    const ltCall = whereCalls.find((c: any[]) => c[0] === 'nombreLower' && c[1] === '<');

    expect(geCall).toBeDefined();
    expect(ltCall).toBeDefined();
    expect(geCall?.[2]).toBe('garc');
    expect(ltCall?.[2]).toBe('garc' + '￿');
  });

  it('SC-07: invalid cursor throws InvalidCursorError', async () => {
    const { ClienteService, InvalidCursorError } = await loadService();

    await expect(
      ClienteService.list({ cursor: 'not-valid-base64url!!' })
    ).rejects.toThrow(InvalidCursorError);
  });

  it('SC-11: pageSize=500 is clamped to 100 — limit called with 101 (+1 probe)', async () => {
    const { ClienteService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await ClienteService.list({ pageSize: 500 });

    expect(limitMock).toHaveBeenCalledWith(101);
  });

  it('cursor roundtrip: encode then decode produces same payload', async () => {
    const { ClienteService } = await loadService();

    const payload = { n: 'garcía juan', id: 'abc123' };
    const encoded = ClienteService.encodeCursor(payload);
    const decoded = ClienteService.decodeCursor(encoded);

    expect(decoded).toEqual(payload);
  });
});

describe('ClienteService.getAllForAggregates()', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('returns full collection without calling limit()', async () => {
    const { ClienteService } = await loadService();

    const docs = Array.from({ length: 60 }, (_, i) => makeCliente(i));
    getMock.mockResolvedValue(makeSnapshot(docs));

    const result = await ClienteService.getAllForAggregates();

    expect(result).toHaveLength(60);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it('applies activo filter when provided', async () => {
    const { ClienteService } = await loadService();

    getMock.mockResolvedValue(makeSnapshot([]));

    await ClienteService.getAllForAggregates({ activo: true });

    const whereCalls = whereMock.mock.calls;
    const activoCall = whereCalls.find(
      (c: any[]) => c[0] === 'activo' && c[1] === '==' && c[2] === true
    );
    expect(activoCall).toBeDefined();
  });
});

describe('ClienteService — nombreLower write path', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetChain();
  });

  it('create() writes nombreLower as trim().toLowerCase() of nombre', async () => {
    const { ClienteService } = await loadService();

    // getByEmail call returns empty (no dupe)
    getMock.mockResolvedValue(makeSnapshot([]));

    const newDocGet = vi.fn().mockResolvedValue(
      makeFirestoreDoc('new-id', {
        nombre: 'García Juan',
        nombreLower: 'garcía juan',
        email: 'garcia@test.com',
        activo: true,
        createdAt: { toDate: () => new Date() },
      })
    );
    const newDocRef = { id: 'new-id', get: newDocGet };
    addMock.mockResolvedValue(newDocRef);

    await ClienteService.create({
      nombre: 'García Juan',
      email: 'garcia@test.com',
    });

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ nombreLower: 'garcía juan' })
    );
  });

  it('update() writes nombreLower when nombre is provided', async () => {
    const { ClienteService } = await loadService();

    const existingDoc = makeFirestoreDoc('existing-id', {
      nombre: 'Old Name',
      nombreLower: 'old name',
      email: 'old@test.com',
      activo: true,
      createdAt: { toDate: () => new Date() },
    });

    // getById → doc().get()
    docGetMock.mockResolvedValue(existingDoc);
    updateDocMock.mockResolvedValue(undefined);

    await ClienteService.update('existing-id', { nombre: 'Lopez Ana' });

    expect(updateDocMock).toHaveBeenCalledWith(
      expect.objectContaining({ nombreLower: 'lopez ana' })
    );
  });

  it('update() does NOT write nombreLower when nombre is absent', async () => {
    const { ClienteService } = await loadService();

    const existingDoc = makeFirestoreDoc('existing-id', {
      nombre: 'Existing Name',
      nombreLower: 'existing name',
      email: 'existing@test.com',
      activo: true,
      createdAt: { toDate: () => new Date() },
    });

    docGetMock.mockResolvedValue(existingDoc);
    updateDocMock.mockResolvedValue(undefined);

    // Use an update that changes only activo — no nombre, no email, no telefono validation issues
    await ClienteService.update('existing-id', { activo: false });

    const updateCall = updateDocMock.mock.calls[0][0];
    expect(updateCall).not.toHaveProperty('nombreLower');
  });
});
