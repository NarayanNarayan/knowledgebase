import type { QueryOptions, QueryResponse } from './api.types';

export interface QueryState {
  currentQuery: string;
  options: QueryOptions;
  response: QueryResponse | null;
  loading: boolean;
  error: string | null;
}

