// Database helper functions for interacting with Supabase
import { supabase } from '../lib/supabase';

/**
 * Get or create a test user (for development - no auth yet)
 * In Phase 4, this will be replaced with proper authentication
 */
export const getTestUser = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@hormoiq.com')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting test user:', error);
    return null;
  }
};

/**
 * Save a hormone test to the database
 * @param {object} testData - Test data to save
 * @returns {object} Saved test data or null
 */
export const saveHormoneTest = async (testData) => {
  try {
    const user = await getTestUser();
    if (!user) {
      throw new Error('User not found');
    }
    
    const { data, error } = await supabase
      .from('hormone_tests')
      .insert([{
        user_id: user.id,
        ...testData,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving hormone test:', error);
    throw error;
  }
};

/**
 * Get all hormone tests for a user
 * @param {number} limit - Optional limit on number of tests
 * @returns {array} Array of test objects
 */
export const getHormoneTests = async (limit = null) => {
  try {
    const user = await getTestUser();
    if (!user) return [];
    
    let query = supabase
      .from('hormone_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting hormone tests:', error);
    return [];
  }
};

/**
 * Get test count for user
 * @returns {number} Number of tests
 */
export const getTestCount = async () => {
  try {
    const user = await getTestUser();
    if (!user) return 0;
    
    const { count, error } = await supabase
      .from('hormone_tests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting test count:', error);
    return 0;
  }
};

/**
 * Delete a hormone test
 * @param {string} testId - UUID of test to delete
 * @returns {boolean} Success status
 */
export const deleteHormoneTest = async (testId) => {
  try {
    const { error } = await supabase
      .from('hormone_tests')
      .delete()
      .eq('id', testId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting hormone test:', error);
    return false;
  }
};

