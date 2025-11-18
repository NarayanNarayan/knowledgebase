import { PostgresService } from '../storage/PostgresService.js';

/**
 * User Profile Service for managing user information
 */
export class UserProfileService {
  constructor(postgresService = null) {
    this.postgres = postgresService || new PostgresService();
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(userId, profileData) {
    return await this.postgres.upsertUserProfile(userId, profileData);
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    return await this.postgres.getUserProfile(userId);
  }

  /**
   * Update specific profile fields
   */
  async updateFields(userId, fields) {
    const currentProfile = await this.getProfile(userId);
    
    if (!currentProfile) {
      return await this.upsertProfile(userId, fields);
    }

    return await this.upsertProfile(userId, {
      ...currentProfile,
      ...fields,
    });
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId) {
    return await this.postgres.deleteUserProfile(userId);
  }

  /**
   * Get user context for AI (formatted for injection into prompts)
   */
  async getUserContextForAI(userId) {
    const profile = await this.getProfile(userId);
    
    if (!profile) {
      return null;
    }

    return {
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      preferences: profile.preferences,
      customFields: profile.custom_fields,
    };
  }

  /**
   * Format profile for system message
   */
  formatProfileForSystemMessage(profile) {
    if (!profile) {
      return '';
    }

    const parts = [];
    
    if (profile.username) parts.push(`User: ${profile.username}`);
    if (profile.email) parts.push(`Email: ${profile.email}`);
    if (profile.phone) parts.push(`Phone: ${profile.phone}`);
    if (profile.address) parts.push(`Address: ${profile.address}`);
    
    if (profile.preferences && Object.keys(profile.preferences).length > 0) {
      parts.push(`Preferences: ${JSON.stringify(profile.preferences)}`);
    }

    return parts.length > 0 
      ? `\n\n=== User Profile ===\n${parts.join('\n')}\n==================\n`
      : '';
  }
}

