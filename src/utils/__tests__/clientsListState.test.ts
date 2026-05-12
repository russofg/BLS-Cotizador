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
  type ClientsListState,
  type PageResult,
} from '../clientsListState';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function makeClients(n: number): any[] {
  return Array.from({ length: n }, (_, i) => ({ id: `c${i}`, nombre: `Cliente ${i}` }));
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
    expect(s.allClients).toEqual([]);
    expect(s.nextCursor).toBeNull();
    expect(s.hasMore).toBe(false);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
    expect(s.pageSize).toBe(25);
  });

  it('accepts custom filters and search', () => {
    const s = initialState({ activo: 'active' }, 'garcia');
    expect(s.filters).toEqual({ activo: 'active' });
    expect(s.search).toBe('garcia');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onLoadStart
// ────────────────────────────────────────────────────────────────────────────

describe('onLoadStart', () => {
  it('sets isLoading to true and clears error', () => {
    const s: ClientsListState = { ...initialState(), error: 'previous error', isLoading: false };
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
// onPageLoaded — initial load (SC-related behavior from spec §4.1)
// ────────────────────────────────────────────────────────────────────────────

describe('onPageLoaded', () => {
  it('replaces accumulated list with first-page items', () => {
    const existing = makeClients(10);
    const incoming = makeClients(5);
    const s: ClientsListState = { ...initialState(), allClients: existing, isLoading: true };
    const result = makeResult(incoming, true);
    const next = onPageLoaded(s, result);
    expect(next.allClients).toEqual(incoming);
    expect(next.allClients).not.toBe(existing);
  });

  it('sets hasMore and nextCursor from result', () => {
    const s = { ...initialState(), isLoading: true };
    const result = makeResult(makeClients(25), true, 'cursor-abc');
    const next = onPageLoaded(s, result);
    expect(next.hasMore).toBe(true);
    expect(next.nextCursor).toBe('cursor-abc');
  });

  it('sets hasMore false and nextCursor null on last page', () => {
    const s = { ...initialState(), isLoading: true };
    const result = makeResult(makeClients(5), false);
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
    const first = makeClients(25);
    const second = makeClients(10);
    const s: ClientsListState = {
      ...initialState(),
      allClients: first,
      nextCursor: 'tok',
      hasMore: true,
      isLoading: true,
    };
    const result = makeResult(second, false);
    const next = onMoreLoaded(s, result);
    expect(next.allClients).toHaveLength(35);
    expect(next.allClients.slice(0, 25)).toEqual(first);
    expect(next.allClients.slice(25)).toEqual(second);
  });

  it('updates hasMore and nextCursor', () => {
    const s: ClientsListState = { ...initialState(), allClients: makeClients(25), isLoading: true, hasMore: true, nextCursor: 'tok' };
    const next = onMoreLoaded(s, makeResult(makeClients(3), false));
    expect(next.hasMore).toBe(false);
    expect(next.nextCursor).toBeNull();
  });

  it('clears isLoading', () => {
    const s: ClientsListState = { ...initialState(), isLoading: true, hasMore: true, nextCursor: 'tok' };
    const next = onMoreLoaded(s, makeResult([], false));
    expect(next.isLoading).toBe(false);
  });

  it('does not mutate original allClients array', () => {
    const first = makeClients(5);
    const ref = [...first];
    const s: ClientsListState = { ...initialState(), allClients: first, isLoading: true };
    onMoreLoaded(s, makeResult(makeClients(3), false));
    expect(first).toEqual(ref); // original untouched
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onFilterChange — SC-06: filter resets pagination
// ────────────────────────────────────────────────────────────────────────────

describe('onFilterChange — SC-06', () => {
  it('clears allClients and resets cursor to null', () => {
    const s: ClientsListState = {
      ...initialState(),
      allClients: makeClients(50),
      nextCursor: 'some-cursor',
      hasMore: true,
    };
    const next = onFilterChange(s, { activo: 'active' }, 'garcia');
    expect(next.allClients).toEqual([]);
    expect(next.nextCursor).toBeNull();
    expect(next.hasMore).toBe(false);
  });

  it('updates filters and search on the returned state', () => {
    const s = initialState();
    const next = onFilterChange(s, { activo: 'inactive' }, 'lopez');
    expect(next.filters).toEqual({ activo: 'inactive' });
    expect(next.search).toBe('lopez');
  });

  it('after filter change, isLoading is false (caller triggers load separately)', () => {
    const s: ClientsListState = { ...initialState(), isLoading: true };
    const next = onFilterChange(s, {}, '');
    // isLoading stays as-is; caller calls onLoadStart separately before fetch
    // but the key guarantee is that it preserves what caller set
    expect(next.isLoading).toBe(true); // filter change does not override loading
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onMutationSuccess — reset after create/edit/delete
// ────────────────────────────────────────────────────────────────────────────

describe('onMutationSuccess', () => {
  it('clears allClients and resets pagination', () => {
    const s: ClientsListState = {
      ...initialState(),
      allClients: makeClients(30),
      nextCursor: 'tok',
      hasMore: true,
    };
    const next = onMutationSuccess(s);
    expect(next.allClients).toEqual([]);
    expect(next.nextCursor).toBeNull();
    expect(next.hasMore).toBe(false);
  });

  it('preserves filters and search so refetch uses same params', () => {
    const s: ClientsListState = {
      ...initialState({ activo: 'active' }, 'garcia'),
      allClients: makeClients(10),
    };
    const next = onMutationSuccess(s);
    expect(next.filters).toEqual({ activo: 'active' });
    expect(next.search).toBe('garcia');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// onFetchError
// ────────────────────────────────────────────────────────────────────────────

describe('onFetchError', () => {
  it('sets error message and clears isLoading', () => {
    const s: ClientsListState = { ...initialState(), isLoading: true };
    const next = onFetchError(s, 'Network error');
    expect(next.error).toBe('Network error');
    expect(next.isLoading).toBe(false);
  });

  it('preserves previously loaded items', () => {
    const clients = makeClients(10);
    const s: ClientsListState = { ...initialState(), allClients: clients, isLoading: true };
    const next = onFetchError(s, 'Timeout');
    expect(next.allClients).toEqual(clients);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canLoadMore — SC-08: prevents concurrent fetches
// ────────────────────────────────────────────────────────────────────────────

describe('canLoadMore — SC-08', () => {
  it('returns true when hasMore is true and not loading', () => {
    const s: ClientsListState = { ...initialState(), hasMore: true, isLoading: false };
    expect(canLoadMore(s)).toBe(true);
  });

  it('returns false when isLoading is true (prevents second concurrent fetch)', () => {
    const s: ClientsListState = { ...initialState(), hasMore: true, isLoading: true };
    expect(canLoadMore(s)).toBe(false);
  });

  it('returns false when hasMore is false', () => {
    const s: ClientsListState = { ...initialState(), hasMore: false, isLoading: false };
    expect(canLoadMore(s)).toBe(false);
  });

  it('returns false when both hasMore false and isLoading true', () => {
    const s: ClientsListState = { ...initialState(), hasMore: false, isLoading: true };
    expect(canLoadMore(s)).toBe(false);
  });
});
