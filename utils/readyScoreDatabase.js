// Database functions for ReadyScore
import { supabase } from '../lib/supabase';
import { getTestUser } from './database';
import { calculateReadyScore } from './readyScore';
import { calculatePhysicalPerformance, calculateMentalClarity } from './readyScoreCategories';

/**
 * Calculate and save ReadyScore to database
 * @param {string} testId - UUID of the test that triggered calculation
 * @returns {object} Saved ReadyScore data
 */
export const saveReadyScore = async (testId, readyScoreData) => {
  try {
    const user = await getTestUser();
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('ready_scores')
      .insert([{
        user_id: user.id,
        score: readyScoreData.score,
        confidence: readyScoreData.confidence,
        based_on_test_id: testId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving ReadyScore:', error);
    throw error;
  }
};

/**
 * Get latest ReadyScore for user
 * @returns {object} Latest ReadyScore or null
 */
export const getLatestReadyScore = async () => {
  try {
    const user = await getTestUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('ready_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - not an error
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting latest ReadyScore:', error);
    return null;
  }
};

/**
 * Calculate current ReadyScore from latest test data
 * Does not save to database
 * @returns {object} ReadyScore data
 */
export const calculateCurrentReadyScore = async () => {
  try {
    const user = await getTestUser();
    if (!user) return null;

    // Get all tests for the user
    const { data: tests, error } = await supabase
      .from('hormone_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    if (error) throw error;

    if (!tests || tests.length === 0) {
      return null;
    }

    // Calculate ReadyScore using the algorithm
    const readyScoreData = calculateReadyScore(
      tests[0], // Latest test
      tests,     // All tests for pattern analysis
      { age: 30, gender: 'male' } // Will get from user profile later
    );

    return readyScoreData;
  } catch (error) {
    console.error('Error calculating current ReadyScore:', error);
    return null;
  }
};

/**
 * Calculate ALL ReadyScore categories (Overall, Physical, Mental)
 * @returns {array} Array of all ReadyScore cards
 */
export const calculateAllReadyScores = async () => {
  try {
    const user = await getTestUser();
    if (!user) return [];

    // Get all tests for the user
    const { data: tests, error } = await supabase
      .from('hormone_tests')
      .select('*')
      .eq('user_id', user.id)
      .order('test_date', { ascending: false });

    if (error) throw error;

    if (!tests || tests.length === 0) {
      return [];
    }

    const userProfile = { age: 30, gender: 'male' }; // Will get from user profile later
    const latestTest = tests[0];

    // Calculate all three scores
    const overallScore = calculateReadyScore(latestTest, tests, userProfile);
    const physicalScore = calculatePhysicalPerformance(latestTest, tests, userProfile);
    const mentalScore = calculateMentalClarity(latestTest, tests, userProfile);

    // Build array with proper formatting
    const scores = [];

    // 1. Overall ReadyScore
    if (overallScore && overallScore.score !== null) {
      scores.push({
        category: 'overall',
        score: overallScore.score,
        confidence: overallScore.confidence,
        title: overallScore.message,
        color: overallScore.color,
        explanation: getOverallExplanation(overallScore),
        emoji: '🎯',
      });
    }

    // 2. Physical Performance
    if (physicalScore && physicalScore.score !== null) {
      scores.push(physicalScore);
    }

    // 3. Mental Clarity
    if (mentalScore && mentalScore.score !== null) {
      scores.push(mentalScore);
    }

    return scores;
  } catch (error) {
    console.error('Error calculating all ReadyScores:', error);
    return [];
  }
};

/**
 * Get explanation for overall ReadyScore
 */
const getOverallExplanation = (readyScoreData) => {
  const { score } = readyScoreData;
  
  if (score >= 90) {
    return 'Everything is firing. Your hormones indicate optimal readiness across all areas today.';
  } else if (score >= 70) {
    return 'Strong overall readiness. Good balance across your hormone panel for productive activity.';
  } else if (score >= 50) {
    return 'Moderate readiness. Your body is functional but not at peak. Pace yourself today.';
  } else {
    return 'Recovery mode recommended. Your hormones indicate your body needs rest and restoration.';
  }
};

