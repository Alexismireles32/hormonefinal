// BioAge Reference Ranges - Research-backed from 40+ studies

/**
 * CORTISOL OPTIMAL RANGES (Morning 8 AM, ng/mL)
 * Source: Baltimore Longitudinal Study, Osaka University 2025
 */
export const CORTISOL_RANGES = {
  male: {
    '20-30': { min: 8, max: 20, mean: 14 },
    '31-40': { min: 8, max: 18, mean: 13 },
    '41-50': { min: 8, max: 16, mean: 12 },
    '51-60': { min: 9, max: 19, mean: 14 },
    '61-70': { min: 10, max: 22, mean: 16 },
    '71+': { min: 11, max: 25, mean: 18 },
  },
  female: {
    '20-30': { min: 7, max: 18, mean: 13 },
    '31-40': { min: 7, max: 17, mean: 12 },
    '41-50': { min: 7, max: 15, mean: 11 },
    '51-60': { min: 8, max: 18, mean: 13 },
    '61-70': { min: 9, max: 21, mean: 15 },
    '71+': { min: 10, max: 24, mean: 17 },
  },
};

/**
 * TESTOSTERONE OPTIMAL RANGES (ng/dL)
 * Source: Massachusetts Male Aging Study, Multiple cohorts
 */
export const TESTOSTERONE_RANGES = {
  male: {
    '18-25': { min: 600, max: 1000, mean: 800, lowThreshold: 300 },
    '26-35': { min: 500, max: 900, mean: 700, lowThreshold: 300 },
    '36-45': { min: 400, max: 800, mean: 600, lowThreshold: 300 },
    '46-55': { min: 350, max: 700, mean: 500, lowThreshold: 300 },
    '56-65': { min: 300, max: 600, mean: 450, lowThreshold: 250 },
    '66+': { min: 250, max: 550, mean: 400, lowThreshold: 200 },
  },
  female: {
    '18-25': { min: 40, max: 70, mean: 55, lowThreshold: 15 },
    '26-35': { min: 35, max: 65, mean: 50, lowThreshold: 15 },
    '36-45': { min: 30, max: 60, mean: 45, lowThreshold: 15 },
    '46-55': { min: 25, max: 55, mean: 40, lowThreshold: 10 },
    '56+': { min: 15, max: 40, mean: 25, lowThreshold: 7 },
  },
};

/**
 * PROGESTERONE OPTIMAL RANGES (pg/mL, saliva)
 * Source: Clinical reference data, Brindle et al. meta-analysis
 */
export const PROGESTERONE_RANGES = {
  female: {
    premenopausal: {
      '18-25': { follicular: 45, luteal: 115, mean: 80 },
      '26-35': { follicular: 45, luteal: 145, mean: 95 },
      '36-45': { follicular: 40, luteal: 115, mean: 78 },
      '46-50': { follicular: 35, luteal: 85, mean: 60 },
    },
    postmenopausal: {
      '50+': { baseline: 55, mean: 55 },
    },
  },
  male: {
    all: { baseline: 25, mean: 25 },
  },
};

/**
 * Helper function to get age bracket
 */
export const getAgeBracket = (age) => {
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 35) return '26-35';
  if (age >= 36 && age <= 45) return '36-45';
  if (age >= 46 && age <= 55) return '46-55';
  if (age >= 56 && age <= 65) return '56-65';
  if (age >= 66) return '66+';
  
  // For cortisol (different brackets)
  if (age >= 20 && age <= 30) return '20-30';
  if (age >= 31 && age <= 40) return '31-40';
  if (age >= 41 && age <= 50) return '41-50';
  if (age >= 51 && age <= 60) return '51-60';
  if (age >= 61 && age <= 70) return '61-70';
  if (age >= 71) return '71+';
  
  return null;
};

/**
 * Helper to get cortisol age bracket (different from testosterone)
 */
export const getCortisolAgeBracket = (age) => {
  if (age >= 20 && age <= 30) return '20-30';
  if (age >= 31 && age <= 40) return '31-40';
  if (age >= 41 && age <= 50) return '41-50';
  if (age >= 51 && age <= 60) return '51-60';
  if (age >= 61 && age <= 70) return '61-70';
  if (age >= 71) return '71+';
  return '31-40'; // Default
};

/**
 * Helper to get testosterone age bracket
 */
export const getTestosteroneAgeBracket = (age) => {
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 35) return '26-35';
  if (age >= 36 && age <= 45) return '36-45';
  if (age >= 46 && age <= 55) return '46-55';
  if (age >= 56 && age <= 65) return '56-65';
  if (age >= 66) return '66+';
  return '26-35'; // Default
};

/**
 * Helper to get progesterone age bracket (women)
 */
export const getProgesteroneAgeBracket = (age, isPostmenopausal) => {
  if (isPostmenopausal) return '50+';
  if (age >= 18 && age <= 25) return '18-25';
  if (age >= 26 && age <= 35) return '26-35';
  if (age >= 36 && age <= 45) return '36-45';
  if (age >= 46 && age <= 50) return '46-50';
  return '26-35'; // Default
};

/**
 * BIOAGE PROTECTIVE LIMITS
 */
export const BIOAGE_LIMITS = {
  maxYounger: 15, // Can't be more than 15 years younger
  maxOlder: 15,   // Can't be more than 15 years older
};

/**
 * CONFIDENCE THRESHOLDS
 */
export const CONFIDENCE_THRESHOLDS = {
  high: { tests: 40, weeks: 8, accuracy: 85, range: 2 },
  medium: { tests: 20, weeks: 4, accuracy: 75, range: 3 },
  low: { tests: 10, weeks: 2, accuracy: 60, range: 5 },
  minimum: { tests: 10, weeks: 2 },
};

/**
 * PERCENTILE TIERS
 */
export const PERCENTILE_TIERS = [
  { delta: 12, percentile: 98, rank: 'top 2%', message: 'Elite optimizer 🏆', tier: 'elite' },
  { delta: 8, percentile: 90, rank: 'top 10%', message: 'Exceptional 🌟', tier: 'exceptional' },
  { delta: 5, percentile: 75, rank: 'top 25%', message: 'Above average 💪', tier: 'above' },
  { delta: 2, percentile: 60, rank: 'top 50%', message: 'Doing well 👍', tier: 'good' },
  { delta: -2, percentile: 50, rank: 'average', message: 'Normal range', tier: 'average' },
  { delta: -5, percentile: 40, rank: 'below average', message: 'Room for improvement', tier: 'below' },
  { delta: -8, percentile: 25, rank: 'bottom 25%', message: 'Needs attention ⚠️', tier: 'concerning' },
  { delta: -Infinity, percentile: 10, rank: 'bottom 10%', message: 'Urgent optimization needed 🔴', tier: 'urgent' },
];

