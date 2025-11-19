import { create } from 'zustand';
import type { HealthStatus, ModelInfo } from '../types/api.types';

interface AppState {
  health: HealthStatus | null;
  models: ModelInfo[];
  apiKeys: Record<string, boolean>;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
  setHealth: (health: HealthStatus) => void;
  setModels: (models: ModelInfo[], apiKeys: Record<string, boolean>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  health: null,
  models: [],
  apiKeys: {},
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  loading: false,
  error: null,
  setHealth: (health) => set({ health }),
  setModels: (models, apiKeys) => set({ models, apiKeys }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

