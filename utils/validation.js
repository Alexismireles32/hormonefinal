// Validation utilities for hormone values
import { HORMONE_RANGES } from '../constants/hormones';

/**
 * Validate if a hormone value is within acceptable range
 * @param {string} hormone - 'cortisol', 'testosterone', or 'progesterone'
 * @param {number} value - The hormone value to validate
 * @returns {object} { isValid: boolean, error: string | null }
 */
export const validateHormoneValue = (hormone, value) => {
  const range = HORMONE_RANGES[hormone];
  
  if (!range) {
    return { isValid: false, error: 'Invalid hormone type' };
  }
  
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Value is required' };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Must be a valid number' };
  }
  
  if (numValue < range.min || numValue > range.max) {
    return { 
      isValid: false, 
      error: `Must be between ${range.min} and ${range.max} ${range.unit}` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Check if a hormone value is in optimal range for user's age/gender
 * @param {string} hormone - Hormone type
 * @param {number} value - Hormone value
 * @param {number} age - User's age
 * @param {string} gender - 'male' or 'female'
 * @returns {boolean}
 */
export const isInOptimalRange = (hormone, value, age, gender) => {
  const range = HORMONE_RANGES[hormone];
  if (!range || !range.optimal) return false;
  
  // Get age bracket
  let ageGroup;
  if (age < 31) ageGroup = '20-30';
  else if (age < 41) ageGroup = '31-40';
  else if (age < 51) ageGroup = '41-50';
  else if (age < 61) ageGroup = '51-60';
  else if (age < 71) ageGroup = '61-70';
  else ageGroup = '71+';
  
  // For testosterone and cortisol
  if (hormone === 'cortisol' || hormone === 'testosterone') {
    const genderRanges = range.optimal[gender];
    if (!genderRanges) return false;
    
    // Adjust age group if needed
    if (hormone === 'testosterone') {
      if (age < 36) ageGroup = '18-35';
      else if (age < 46) ageGroup = '36-45';
      else if (age < 56) ageGroup = '46-55';
      else if (age < 66) ageGroup = '56-65';
      else ageGroup = '66+';
    }
    
    const [min, max] = genderRanges[ageGroup] || genderRanges['20-30'];
    return value >= min && value <= max;
  }
  
  return false;
};

/**
 * Format hormone value with proper decimals
 * @param {number} value - Value to format
 * @param {string} hormone - Hormone type
 * @returns {string}
 */
export const formatHormoneValue = (value, hormone) => {
  const range = HORMONE_RANGES[hormone];
  if (!range) return value.toString();
  
  return parseFloat(value).toFixed(range.decimals);
};

