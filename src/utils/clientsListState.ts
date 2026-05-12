/**
 * clientsListState.ts
 * Pure state machine for the clientes paginated list.
 * No DOM, no fetch — fully testable in isolation.
 */

export interface ClienteFilters {
  activo?: boolean | string; // "active" | "inactive" | ""
  empresa?: string;
}

export interface PageResult {
  items: any[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize?: number;
}

export interface ClientsListState {
  allClients: any[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  filters: ClienteFilters;
  search: string;
  pageSize: number;
  error: string | null;
}

/**
 * Returns an empty initial state with the provided filters and search.
 */
export function initialState(
  filters: ClienteFilters = {},
  search: string = ""
): ClientsListState {
  return {
    allClients: [],
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
export function onLoadStart(state: ClientsListState): ClientsListState {
  return { ...state, isLoading: true, error: null };
}

/**
 * Call when the first page arrives (either initial load or after a filter/search reset).
 * Replaces the accumulated list.
 */
export function onPageLoaded(
  state: ClientsListState,
  result: PageResult
): ClientsListState {
  return {
    ...state,
    allClients: result.items,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
    isLoading: false,
    error: null,
  };
}

/**
 * Call when a "Cargar más" page arrives.
 * APPENDS items to the accumulated list.
 * If isLoading is false (guard check), returns state unchanged.
 */
export function onMoreLoaded(
  state: ClientsListState,
  result: PageResult
): ClientsListState {
  return {
    ...state,
    allClients: [...state.allClients, ...result.items],
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
  state: ClientsListState,
  filters: ClienteFilters,
  search: string
): ClientsListState {
  return {
    ...state,
    allClients: [],
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
export function onMutationSuccess(state: ClientsListState): ClientsListState {
  return {
    ...state,
    allClients: [],
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
  state: ClientsListState,
  message: string
): ClientsListState {
  return { ...state, isLoading: false, error: message };
}

/**
 * Returns true when a "Cargar más" fetch is allowed.
 * Prevents concurrent fetches and calling when there is nothing more to load.
 */
export function canLoadMore(state: ClientsListState): boolean {
  return state.hasMore && !state.isLoading;
}
