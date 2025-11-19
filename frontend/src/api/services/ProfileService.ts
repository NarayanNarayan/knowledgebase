import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { UserProfile, ApiResponse } from '../../types/api.types';
import type { ProfileFormData } from '../../types/profile.types';

export class ProfileService {
  async createOrUpdateProfile(data: ProfileFormData): Promise<UserProfile> {
    const response = await apiClient.post<ApiResponse<{ profile: UserProfile }>>(
      API_ENDPOINTS.profile.createOrUpdate,
      data
    );
    if (!response.data.success || !response.data.data?.profile) {
      throw new Error(response.data.error || 'Failed to save profile');
    }
    return response.data.data.profile;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ profile: UserProfile }>>(
        API_ENDPOINTS.profile.get(userId)
      );
      if (!response.data.success || !response.data.data?.profile) {
        return null;
      }
      return response.data.data.profile;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const profileService = new ProfileService();

