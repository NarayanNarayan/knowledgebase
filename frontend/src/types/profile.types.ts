import type { UserProfile } from './api.types';

export interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface ProfileFormData {
  userId: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferences?: Record<string, any>;
  customFields?: Record<string, any>;
}

