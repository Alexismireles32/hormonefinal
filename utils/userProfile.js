// User Profile Management
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PROFILE_KEY = '@hormoiq_user_profile';

/**
 * Default user profile structure
 */
const DEFAULT_PROFILE = {
  name: null,
  age: null,
  gender: null, // 'male' or 'female'
  isPostmenopausal: false,
  setupComplete: false,
};

/**
 * Save user profile
 */
export const saveUserProfile = async (profile) => {
  try {
    const profileData = {
      ...profile,
      setupComplete: true,
      lastUpdated: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
    return profileData;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    const profileData = await AsyncStorage.getItem(USER_PROFILE_KEY);
    
    if (!profileData) {
      return DEFAULT_PROFILE;
    }
    
    return JSON.parse(profileData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return DEFAULT_PROFILE;
  }
};

/**
 * Check if user profile is complete
 */
export const isProfileComplete = async () => {
  const profile = await getUserProfile();
  return profile.setupComplete && profile.age && profile.gender;
};

/**
 * Update specific profile field
 */
export const updateProfileField = async (field, value) => {
  try {
    const profile = await getUserProfile();
    profile[field] = value;
    profile.lastUpdated = new Date().toISOString();
    
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (error) {
    console.error('Error updating profile field:', error);
    throw error;
  }
};

/**
 * Clear user profile (for testing)
 */
export const clearUserProfile = async () => {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing user profile:', error);
    throw error;
  }
};

