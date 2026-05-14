/**
 * quotesListState.ts
 * Pure state machine for the cotizaciones paginated list.
 * No DOM, no fetch — fully testable in isolation.
 */

export interface QuoteFilters {
  estado?: string; // 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida' | ''
}

export interface PageResult {
  items: any[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize?: number;
}

export interface QuotesListState {
  allQuotes: any[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  filters: QuoteFilters;
  search: string;
  pageSize: number;
  error: string | null;
}

/**
 * Returns an empty initial state with the provided filters and search.
 */
export function initialState(
  filters: QuoteFilters = {},
  search: string = ""
): QuotesListState {
  return {
    allQuotes: [],
    nextCursor: null,
    hasMore: false,
    isLoading: false,
    filters,
    search,
    pageSize: 25,
    error: null,
  };
}

/**
 * Call before the first-page fetch begins.
 */
export function onLoadStart(state: QuotesListState): QuotesListState {
  return { ...state, isLoading: true, error: null };
}

/**
 * Call when the first page arrives (either initial load or after a filter/search reset).
 * Replaces the accumulated list.
 */
export function onPageLoaded(
  state: QuotesListState,
  result: PageResult
): QuotesListState {
  return {
    ...state,
    allQuotes: result.items,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
    isLoading: false,
    error: null,
  };
}

/**
 * Call when a "Cargar más" page arrives.
 * APPENDS items to the accumulated list.
 */
export function onMoreLoaded(
  state: QuotesListState,
  result: PageResult
): QuotesListState {
  return {
    ...state,
    allQuotes: [...state.allQuotes, ...result.items],
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
    isLoading: false,
    error: null,
  };
}

/**
 * Call when the user changes filters or search term.
 * Resets the accumulated list and cursor so the next load fetches page 1.
 */
export function onFilterChange(
  state: QuotesListState,
  filters: QuoteFilters,
  search: string
): QuotesListState {
  return {
    ...state,
    allQuotes: [],
    nextCursor: null,
    hasMore: false,
    filters,
    search,
    error: null,
  };
}

/**
 * Call after a successful create/edit/delete mutation.
 * Same as a filter-change reset — triggers a fresh first-page load.
 */
export function onMutationSuccess(state: QuotesListState): QuotesListState {
  return {
    ...state,
    allQuotes: [],
    nextCursor: null,
    hasMore: false,
    error: null,
  };
}

/**
 * Call when a fetch fails.
 * Preserves previously loaded items and marks loading done.
 */
export function onFetchError(
  state: QuotesListState,
  message: string
): QuotesListState {
  return { ...state, isLoading: false, error: message };
}

/**
 * Returns true when a "Cargar más" fetch is allowed.
 * Prevents concurrent fetches and calling when there is nothing more to load.
 */
export function canLoadMore(state: QuotesListState): boolean {
  return state.hasMore && !state.isLoading;
}
