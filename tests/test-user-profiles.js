/**
 * User Profile Management Tests
 * Can be run independently: node tests/test-user-profiles.js
 */

import { APIClient } from '../src/utils/APIClient.js';
import { logTest, logSection, resetTestStats, printTestSummary } from './test-utils.js';
import { testUsers } from './test-data.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const client = new APIClient(API_BASE_URL);

export async function testUserProfiles() {
  logSection('2. User Profile Management Tests');

  // Create admin user profile
  try {
    const adminProfile = await client.updateUserProfile(testUsers.admin.userId, {
      username: testUsers.admin.username,
      email: testUsers.admin.email,
      phone: testUsers.admin.phone,
      address: testUsers.admin.address,
      preferences: testUsers.admin.preferences,
      customFields: testUsers.admin.customFields,
    });
    logTest('Create Admin Profile', 'pass', `User: ${adminProfile.profile?.user_id}`);
  } catch (error) {
    logTest('Create Admin Profile', 'fail', error.message);
  }

  // Create regular user profile
  try {
    const userProfile = await client.updateUserProfile(testUsers.user.userId, {
      username: testUsers.user.username,
      email: testUsers.user.email,
      phone: testUsers.user.phone,
      address: testUsers.user.address,
      preferences: testUsers.user.preferences,
      customFields: testUsers.user.customFields,
    });
    logTest('Create User Profile', 'pass', `User: ${userProfile.profile?.user_id}`);
  } catch (error) {
    logTest('Create User Profile', 'fail', error.message);
  }

  // Get admin profile
  try {
    const profile = await client.getUserProfile(testUsers.admin.userId);
    if (profile.profile && profile.profile.user_id === testUsers.admin.userId) {
      logTest('Get Admin Profile', 'pass', `Retrieved: ${profile.profile.username}`);
    } else {
      logTest('Get Admin Profile', 'fail', 'Profile data mismatch');
    }
  } catch (error) {
    logTest('Get Admin Profile', 'fail', error.message);
  }

  // Update profile
  try {
    const updated = await client.updateUserProfile(testUsers.admin.userId, {
      preferences: { theme: 'dark', role: 'admin', updated: true },
    });
    logTest('Update Profile', 'pass', 'Profile updated');
  } catch (error) {
    logTest('Update Profile', 'fail', error.message);
  }

  // Get non-existent profile
  try {
    await client.getUserProfile('non-existent-user-12345');
    logTest('Get Non-existent Profile', 'fail', 'Should return 404');
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('404')) {
      logTest('Get Non-existent Profile', 'pass', 'Correctly returns error');
    } else {
      logTest('Get Non-existent Profile', 'fail', error.message);
    }
  }
}

// Run independently if called directly
if (process.argv[1]?.includes('test-user-profiles.js')) {
  const startTime = Date.now();
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          USER PROFILE MANAGEMENT TESTS                               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${API_BASE_URL}\n`);
  
  resetTestStats();
  await testUserProfiles();
  printTestSummary(startTime);
}

