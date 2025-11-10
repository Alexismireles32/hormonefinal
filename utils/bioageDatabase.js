// Database functions for BioAge calculations
import { supabase } from '../lib/supabase';
import { getTestUser, getHormoneTests } from './database';
import { calculateBioAge } from './bioageCalculation';

/**
 * Calculate and save user's BioAge
 * @param {object} userProfile - { age, gender, isPostmenopausal }
 * @returns {object} BioAge calculation result
 */
export const calculateAndSaveBioAge = async (userProfile) => {
  try {
    const user = await getTestUser();
    if (!user) throw new Error('User not found');

    // Get all tests
    const tests = await getHormoneTests();
    
    // Calculate BioAge
    const result = calculateBioAge(tests, userProfile);
    
    // If BioAge calculated, save to database
    if (result.bioAge !== null) {
      const { data, error } = await supabase
        .from('bioage_calculations')
        .insert([{
          user_id: user.id,
          chronological_age: result.chronologicalAge,
          biological_age: result.bioAge,
          confidence_level: result.confidence.level,
          confidence_percentage: result.confidence.percentage,
          breakdown: result.breakdown,
          test_count: tests.length,
        }])
        .select()
        .single();

      if (error) throw error;
    }
    
    return result;
  } catch (error) {
    console.error('Error calculating/saving BioAge:', error);
    throw error;
  }
};

/**
 * Get user's latest BioAge calculation
 */
export const getLatestBioAge = async () => {
  try {
    const user = await getTestUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('bioage_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting latest BioAge:', error);
    return null;
  }
};

/**
 * Get BioAge history (for tracking progress)
 */
export const getBioAgeHistory = async (limit = 10) => {
  try {
    const user = await getTestUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('bioage_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting BioAge history:', error);
    return [];
  }
};

