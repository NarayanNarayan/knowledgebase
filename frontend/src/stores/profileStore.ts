import { create } from 'zustand';
import type { UserProfile } from '../types/api.types';
import type { ProfileState } from '../types/profile.types';

interface ProfileStore extends ProfileState {
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearProfile: () => set({ profile: null }),
}));

