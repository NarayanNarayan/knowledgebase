import { useEffect, useCallback } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { profileService } from '../api/services/ProfileService';
import type { ProfileFormData } from '../types/profile.types';

export const useProfile = (userId?: string) => {
  const {
    profile,
    loading,
    error,
    setProfile,
    updateProfile,
    setLoading,
    setError,
    clearProfile,
  } = useProfileStore();

  const loadProfile = useCallback(async (profileUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const loadedProfile = await profileService.getProfile(profileUserId);
      setProfile(loadedProfile);
      return loadedProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setProfile, setLoading, setError]);

  const saveProfile = useCallback(async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      const savedProfile = await profileService.createOrUpdateProfile(data);
      setProfile(savedProfile);
      return savedProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setProfile, setLoading, setError]);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId, loadProfile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    saveProfile,
    updateProfile,
    clearProfile,
  };
};

