import { create } from 'zustand';
import type { QueryOptions, QueryResponse } from '../types/api.types';
import type { QueryState } from '../types/query.types';

interface QueryStore extends QueryState {
  setCurrentQuery: (query: string) => void;
  setOptions: (options: Partial<QueryOptions>) => void;
  resetOptions: () => void;
  setResponse: (response: QueryResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultOptions: QueryOptions = {
  model: 'gemini-pro',
  useRAG: true,
  useGraph: false,
  useHybrid: true,
  useIterative: false,
  maxIterations: 3,
  confidenceThreshold: 0.8,
  graphDepth: 1,
  ragLimit: 5,
  ragThreshold: 0.7,
  processData: false,
};

export const useQueryStore = create<QueryStore>((set) => ({
  currentQuery: '',
  options: defaultOptions,
  response: null,
  loading: false,
  error: null,
  setCurrentQuery: (query) => set({ currentQuery: query }),
  setOptions: (options) =>
    set((state) => ({ options: { ...state.options, ...options } })),
  resetOptions: () => set({ options: defaultOptions }),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentQuery: '',
      options: defaultOptions,
      response: null,
      error: null,
    }),
}));

