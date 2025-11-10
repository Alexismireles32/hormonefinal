// Database functions for AI conversations
import { supabase } from '../lib/supabase';
import { getTestUser, getHormoneTests } from './database';

/**
 * Get user context for AI
 * Includes recent tests, patterns, supplements, etc.
 */
export const getUserContextForAI = async () => {
  try {
    const user = await getTestUser();
    if (!user) return null;

    // Get all tests
    const tests = await getHormoneTests();
    
    // Get recent tests (last 10)
    const recentTests = tests.slice(0, 10);
    
    // Identify patterns
    const patterns = identifyPatterns(tests);
    
    // Get unique supplements
    const supplements = getUniqueSupplements(tests);
    
    return {
      user,
      testCount: tests.length,
      recentTests,
      allTests: tests,
      patterns,
      supplements,
    };
  } catch (error) {
    console.error('Error getting user context for AI:', error);
    return null;
  }
};

/**
 * Identify patterns in user's hormone data
 */
const identifyPatterns = (tests) => {
  if (tests.length < 3) {
    return [];
  }
  
  const patterns = [];
  
  // Check cortisol trend
  const cortisolTests = tests
    .filter(t => t.cortisol !== null)
    .slice(0, 5);
    
  if (cortisolTests.length >= 3) {
    const avgRecent = cortisolTests.slice(0, 2).reduce((sum, t) => sum + t.cortisol, 0) / 2;
    const avgOlder = cortisolTests.slice(-2).reduce((sum, t) => sum + t.cortisol, 0) / 2;
    
    if (avgRecent > avgOlder * 1.15) {
      patterns.push('Cortisol trending upward recently (possible stress increase)');
    } else if (avgRecent < avgOlder * 0.85) {
      patterns.push('Cortisol trending downward (improved stress management)');
    }
  }
  
  // Check testosterone trend
  const testTests = tests
    .filter(t => t.testosterone !== null)
    .slice(0, 5);
    
  if (testTests.length >= 3) {
    const avgRecent = testTests.slice(0, 2).reduce((sum, t) => sum + t.testosterone, 0) / 2;
    const avgOlder = testTests.slice(-2).reduce((sum, t) => sum + t.testosterone, 0) / 2;
    
    if (avgRecent > avgOlder * 1.10) {
      patterns.push('Testosterone improving (positive trend)');
    } else if (avgRecent < avgOlder * 0.90) {
      patterns.push('Testosterone declining (may need attention)');
    }
  }
  
  // Check consistency
  const daysWithTests = new Set(tests.map(t => 
    new Date(t.test_date).toDateString()
  )).size;
  
  const weeksSinceFirst = (Date.now() - new Date(tests[tests.length - 1].test_date).getTime()) / (7 * 24 * 60 * 60 * 1000);
  
  if (weeksSinceFirst > 2 && daysWithTests / weeksSinceFirst >= 2.5) {
    patterns.push('Consistent testing schedule (3+ tests per week)');
  }
  
  return patterns;
};

/**
 * Get unique supplements from tests
 */
const getUniqueSupplements = (tests) => {
  const supplements = new Set();
  
  tests.forEach(test => {
    if (test.supplements_taken && Array.isArray(test.supplements_taken)) {
      test.supplements_taken.forEach(s => supplements.add(s));
    }
  });
  
  return Array.from(supplements);
};

/**
 * Save AI conversation to database
 */
export const saveConversation = async (messages) => {
  try {
    const user = await getTestUser();
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert([{
        user_id: user.id,
        messages: messages,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

/**
 * Get recent conversations
 */
export const getRecentConversations = async (limit = 5) => {
  try {
    const user = await getTestUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

