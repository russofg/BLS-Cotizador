import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRunTransaction, mockDoc } = vi.hoisted(() => ({
  mockRunTransaction: vi.fn(),
  mockDoc: vi.fn(),
}));

vi.mock('../../src/utils/firebaseAdmin', () => ({
  adminDb: {
    doc: mockDoc,
    runTransaction: mockRunTransaction,
    collection: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({ docs: [] }),
  }
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldPath: { documentId: () => '__name__' },
}));

vi.mock('../../src/utils/cache', () => ({
  cache: { get: vi.fn(() => null), set: vi.fn() },
  CacheKeys: {
    quotesList: vi.fn(() => 'list-key'),
    quotesAggregates: vi.fn(() => 'agg-key'),
  },
  CacheTTL: { SHORT: 300000, MEDIUM: 600000 },
}));

vi.mock('../../src/services/QuoteTrackingService', () => ({
  QuoteTrackingService: { invalidateCache: vi.fn() }
}));

vi.mock('../../src/utils/errors', () => ({
  InvalidCursorError: class InvalidCursorError extends Error {}
}));

import { CotizacionService } from '../../src/services/CotizacionService';

describe('CotizacionService.assignQuoteNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments the counter atomically when the document already exists', async () => {
    const counterRef = Symbol('counterRef');
    mockDoc.mockReturnValue(counterRef);

    mockRunTransaction.mockImplementation(async (callback: any) => {
      const txn = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ last: 42 }) }),
        update: vi.fn(),
        set: vi.fn(),
      };
      const result = await callback(txn);
      expect(txn.update).toHaveBeenCalledWith(counterRef, { last: 43 });
      expect(txn.set).not.toHaveBeenCalled();
      return result;
    });

    const numero = await CotizacionService.assignQuoteNumber(2026);

    expect(mockDoc).toHaveBeenCalledWith('counters/quotes_2026');
    expect(numero).toBe('2026-0043');
  });

  it('initializes the counter from the highest existing numero when the document is missing', async () => {
    const counterRef = Symbol('counterRef');
    mockDoc.mockReturnValue(counterRef);

    vi.spyOn(CotizacionService, 'getAllForAggregates').mockResolvedValue([
      { numero: '2026-0010' } as any,
      { numero: '2026-0007' } as any,
      { numero: '2025-0099' } as any, // different year — must be ignored
    ]);

    mockRunTransaction.mockImplementation(async (callback: any) => {
      const txn = {
        get: vi.fn().mockResolvedValue({ exists: false }),
        update: vi.fn(),
        set: vi.fn(),
      };
      const result = await callback(txn);
      expect(txn.set).toHaveBeenCalledWith(counterRef, { last: 11, year: 2026 });
      expect(txn.update).not.toHaveBeenCalled();
      return result;
    });

    const numero = await CotizacionService.assignQuoteNumber(2026);

    expect(numero).toBe('2026-0011');
  });

  it('starts at 0001 when no existing quotes match the year', async () => {
    const counterRef = Symbol('counterRef');
    mockDoc.mockReturnValue(counterRef);

    vi.spyOn(CotizacionService, 'getAllForAggregates').mockResolvedValue([]);

    mockRunTransaction.mockImplementation(async (callback: any) => {
      const txn = {
        get: vi.fn().mockResolvedValue({ exists: false }),
        update: vi.fn(),
        set: vi.fn(),
      };
      return callback(txn);
    });

    const numero = await CotizacionService.assignQuoteNumber(2026);

    expect(numero).toBe('2026-0001');
  });
});
