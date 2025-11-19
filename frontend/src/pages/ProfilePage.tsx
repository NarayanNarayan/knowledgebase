import * as React from 'react';
import { ProfileForm } from '../components/profile/ProfileForm';
import { useProfile } from '../hooks/useProfile';
import type { ProfileFormData } from '../types/profile.types';
// Simple toast implementation
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.error('Error:', msg),
};

export const ProfilePage: React.FC = () => {
  const [userId, setUserId] = React.useState('user123');
  const { profile, loading, saveProfile } = useProfile(userId);

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await saveProfile(data);
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>User Profile</h1>
        <p>Manage your user profile information</p>
      </div>
      <ProfileForm
        initialData={profile ? {
          userId: profile.user_id,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          preferences: profile.preferences,
          customFields: profile.custom_fields,
        } : undefined}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};
