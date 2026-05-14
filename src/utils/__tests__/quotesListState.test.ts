import { describe, it, expect } from 'vitest';
import {
  initialState,
  onLoadStart,
  onPageLoaded,
  onMoreLoaded,
  onFilterChange,
  onMutationSuccess,
  onFetchError,
  canLoadMore,
  type QuotesListState,
  type PageResult,
} from '../quotesListState';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function makeQuotes(n: number): any[] {
  return Array.from({ length: n }, (_, i) => ({ id: `q${i}`, titulo: `Cotizacion ${i}` }));
}

function makeResult(items: any[], hasMore: boolean, cursor: string | null = hasMore ? 'tok' : null): PageResult {
  return { items, hasMore, nextCursor: cursor, pageSize: 25 };
}

// ────────────────────────────────────────────────────────────────────────────
// initialState
// ────────────────────────────────────────────────────────────────────────────

describe('initialState', () => {
  it('returns empty accumulated list with sane defaults', () => {
    const s = initialState();
    expect(s.allQuotes).toEqual([]);
    expect(s.nextCursor).toBeNull();
    expect(s.hasMore).toBe(false);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.pageSize).toBe(25);
  });

  it('accepts custom filters and search', () => {
    const s = initialState({ estado: 'aprobada' }, 'bodega');
    expect(s.filters).toEqual({ estado: 'aprobada' });
    expect(s.search).toBe('bodega');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onLoadStart
// ────────────────────────────────────────────────────────────────────────────

describe('onLoadStart', () => {
  it('sets isLoading to true and clears error', () => {
    const s: QuotesListState = { ...initialState(), error: 'previous error', isLoading: false };
    const next = onLoadStart(s);
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('does not mutate input state', () => {
    const s = initialState();
    onLoadStart(s);
    expect(s.isLoading).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onPageLoaded — initial load / first page (REPLACE)
// ────────────────────────────────────────────────────────────────────────────

describe('onPageLoaded', () => {
  it('replaces accumulated list with first-page items', () => {
    const existing = makeQuotes(10);
    const incoming = makeQuotes(5);
    const s: QuotesListState = { ...initialState(), allQuotes: existing, isLoading: true };
    const result = makeResult(incoming, true);
    const next = onPageLoaded(s, result);
    expect(next.allQuotes).toEqual(incoming);
    expect(next.allQuotes).not.toBe(existing);
  });

  it('sets hasMore and nextCursor from result', () => {
    const s = { ...initialState(), isLoading: true };
    const result = makeResult(makeQuotes(25), true, 'cursor-abc');
    const next = onPageLoaded(s, result);
    expect(next.hasMore).toBe(true);
    expect(next.nextCursor).toBe('cursor-abc');
  });

  it('sets hasMore false and nextCursor null on last page', () => {
    const s = { ...initialState(), isLoading: true };
    const result = makeResult(makeQuotes(5), false);
    const next = onPageLoaded(s, result);
    expect(next.hasMore).toBe(false);
    expect(next.nextCursor).toBeNull();
  });

  it('clears isLoading', () => {
    const s = { ...initialState(), isLoading: true };
    const next = onPageLoaded(s, makeResult([], false));
    expect(next.isLoading).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onMoreLoaded — "Cargar más" append behavior
// ────────────────────────────────────────────────────────────────────────────

describe('onMoreLoaded', () => {
  it('appends incoming items to existing accumulated list', () => {
    const first = makeQuotes(25);
    const second = makeQuotes(10);
    const s: QuotesListState = {
      ...initialState(),
      allQuotes: first,
      nextCursor: 'tok',
      hasMore: true,
      isLoading: true,
    };
    const result = makeResult(second, false);
    const next = onMoreLoaded(s, result);
    expect(next.allQuotes).toHaveLength(35);
    expect(next.allQuotes.slice(0, 25)).toEqual(first);
    expect(next.allQuotes.slice(25)).toEqual(second);
  });

  it('updates hasMore and nextCursor correctly', () => {
    const s: QuotesListState = { ...initialState(), allQuotes: makeQuotes(25), isLoading: true, hasMore: true, nextCursor: 'tok' };
    const next = onMoreLoaded(s, makeResult(makeQuotes(3), false));
    expect(next.hasMore).toBe(false);
    expect(next.nextCursor).toBeNull();
  });

  it('clears isLoading', () => {
    const s: QuotesListState = { ...initialState(), isLoading: true, hasMore: true, nextCursor: 'tok' };
    const next = onMoreLoaded(s, makeResult([], false));
    expect(next.isLoading).toBe(false);
  });

  it('does not mutate original allQuotes array', () => {
    const first = makeQuotes(5);
    const ref = [...first];
    const s: QuotesListState = { ...initialState(), allQuotes: first, isLoading: true };
    onMoreLoaded(s, makeResult(makeQuotes(3), false));
    expect(first).toEqual(ref);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onFilterChange — SC-06: filter resets pagination
// ────────────────────────────────────────────────────────────────────────────

describe('onFilterChange — SC-06', () => {
  it('clears allQuotes and resets cursor to null', () => {
    const s: QuotesListState = {
      ...initialState(),
      allQuotes: makeQuotes(50),
      nextCursor: 'some-cursor',
      hasMore: true,
    };
    const next = onFilterChange(s, { estado: 'enviada' }, '');
    expect(next.allQuotes).toEqual([]);
    expect(next.nextCursor).toBeNull();
    expect(next.hasMore).toBe(false);
  });

  it('updates filters and search on the returned state', () => {
    const s = initialState();
    const next = onFilterChange(s, { estado: 'aprobada' }, 'bodega');
    expect(next.filters).toEqual({ estado: 'aprobada' });
    expect(next.search).toBe('bodega');
  });

  it('after filter change, isLoading preserves caller-set value', () => {
    const s: QuotesListState = { ...initialState(), isLoading: true };
    const next = onFilterChange(s, {}, '');
    expect(next.isLoading).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onMutationSuccess — reset after create/edit/delete
// ────────────────────────────────────────────────────────────────────────────

describe('onMutationSuccess', () => {
  it('clears allQuotes and resets pagination', () => {
    const s: QuotesListState = {
      ...initialState(),
      allQuotes: makeQuotes(30),
      nextCursor: 'tok',
      hasMore: true,
    };
    const next = onMutationSuccess(s);
    expect(next.allQuotes).toEqual([]);
    expect(next.nextCursor).toBeNull();
    expect(next.hasMore).toBe(false);
  });

  it('preserves filters and search so refetch uses same params', () => {
    const s: QuotesListState = {
      ...initialState({ estado: 'aprobada' }, 'bodega'),
      allQuotes: makeQuotes(10),
    };
    const next = onMutationSuccess(s);
    expect(next.filters).toEqual({ estado: 'aprobada' });
    expect(next.search).toBe('bodega');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onFetchError
// ────────────────────────────────────────────────────────────────────────────

describe('onFetchError', () => {
  it('sets error message and clears isLoading', () => {
    const s: QuotesListState = { ...initialState(), isLoading: true };
    const next = onFetchError(s, 'Network error');
    expect(next.error).toBe('Network error');
    expect(next.isLoading).toBe(false);
  });

  it('preserves previously loaded items (SC-07 error behavior)', () => {
    const quotes = makeQuotes(10);
    const s: QuotesListState = { ...initialState(), allQuotes: quotes, isLoading: true };
    const next = onFetchError(s, 'Timeout');
    expect(next.allQuotes).toEqual(quotes);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canLoadMore — SC-13: prevents concurrent fetches
// ────────────────────────────────────────────────────────────────────────────

describe('canLoadMore — SC-13', () => {
  it('returns true when hasMore is true and not loading', () => {
    const s: QuotesListState = { ...initialState(), hasMore: true, isLoading: false };
    expect(canLoadMore(s)).toBe(true);
  });

  it('returns false when isLoading is true (prevents second concurrent fetch)', () => {
    const s: QuotesListState = { ...initialState(), hasMore: true, isLoading: true };
    expect(canLoadMore(s)).toBe(false);
  });

  it('returns false when hasMore is false', () => {
    const s: QuotesListState = { ...initialState(), hasMore: false, isLoading: false };
    expect(canLoadMore(s)).toBe(false);
  });

  it('returns false when both hasMore false and isLoading true', () => {
    const s: QuotesListState = { ...initialState(), hasMore: false, isLoading: true };
    expect(canLoadMore(s)).toBe(false);
  });
});
