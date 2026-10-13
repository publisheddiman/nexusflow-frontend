export type FilterValue = string | number | boolean | null;

export type ListQuery = {
  filters?: Record<string, FilterValue | FilterValue[]>;
  searchFilters?: Record<string, FilterValue | FilterValue[]>;
  rangedFilters?: Array<{
    key: string;
    start: FilterValue;
    end: FilterValue;
  }>;
  page?: number;
  rows?: number;
  orderKey?: string;
  orderRule?: "asc" | "desc";
};

export function buildListParams(query: ListQuery = {}) {
  const params: Record<string, string | number> = {};

  if (query.filters) {
    params.filters = JSON.stringify(query.filters);
  }

  if (query.searchFilters) {
    params.searchFilters = JSON.stringify(query.searchFilters);
  }

  if (query.rangedFilters) {
    params.rangedFilters = JSON.stringify(query.rangedFilters);
  }

  if (query.page !== undefined) {
    params.page = query.page;
  }

  if (query.rows !== undefined) {
    params.rows = query.rows;
  }

  if (query.orderKey) {
    params.orderKey = query.orderKey;
  }

  if (query.orderRule) {
    params.orderRule = query.orderRule;
  }

  return params;
}

