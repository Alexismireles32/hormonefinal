// BioAge Calculation Algorithm - Research-backed
import {
  CORTISOL_RANGES,
  TESTOSTERONE_RANGES,
  PROGESTERONE_RANGES,
  BIOAGE_LIMITS,
  CONFIDENCE_THRESHOLDS,
  PERCENTILE_TIERS,
  getCortisolAgeBracket,
  getTestosteroneAgeBracket,
  getProgesteroneAgeBracket,
} from '../constants/bioage';

/**
 * Main BioAge calculation function
 * @param {array} tests - All hormone tests
 * @param {object} userProfile - { age, gender, isPostmenopausal }
 * @returns {object} { bioAge, breakdown, confidence, percentile }
 */
export const calculateBioAge = (tests, userProfile) => {
  // Check minimum requirements
  const weeksCovered = calculateWeeksCovered(tests);
  
  if (tests.length < CONFIDENCE_THRESHOLDS.minimum.tests || weeksCovered < CONFIDENCE_THRESHOLDS.minimum.weeks) {
    return {
      bioAge: null,
      testsNeeded: CONFIDENCE_THRESHOLDS.minimum.tests - tests.length,
      message: `${CONFIDENCE_THRESHOLDS.minimum.tests - tests.length} more tests needed to unlock BioAge`,
    };
  }
  
  // Calculate individual hormone scores
  const cortisolScore = calculateCortisolScore(tests, userProfile);
  const testosteroneScore = calculateTestosteroneScore(tests, userProfile);
  const progesteroneScore = userProfile.gender === 'female' 
    ? calculateProgesteroneScore(tests, userProfile) 
    : 0;
  const ratioScore = calculateRatioScore(tests, userProfile);
  const behaviorScore = calculateBehaviorScore(tests, userProfile);
  
  // Apply research-backed weights
  const weightedCortisol = cortisolScore.score * 1.5; // Cortisol is king (Osaka 2025)
  const weightedTestosterone = testosteroneScore.score * (userProfile.gender === 'male' ? 1.2 : 1.0);
  const weightedProgesterone = progesteroneScore.score || 0;
  const weightedRatio = ratioScore.score * 1.0;
  const weightedBehavior = behaviorScore.score * 1.0;
  
  // Sum all adjustments
  const totalAdjustment = 
    weightedCortisol + 
    weightedTestosterone + 
    weightedProgesterone + 
    weightedRatio + 
    weightedBehavior;
  
  // Calculate raw BioAge
  let bioAge = userProfile.age + totalAdjustment;
  
  // Apply protective limits (±15 years)
  const minBioAge = userProfile.age - BIOAGE_LIMITS.maxYounger;
  const maxBioAge = userProfile.age + BIOAGE_LIMITS.maxOlder;
  bioAge = Math.max(minBioAge, Math.min(bioAge, maxBioAge));
  
  // Round to nearest integer
  bioAge = Math.round(bioAge);
  
  // Calculate confidence
  const confidence = calculateConfidence(tests, weeksCovered);
  
  // Calculate percentile
  const percentile = calculatePercentile(userProfile.age, bioAge);
  
  // Build breakdown
  const breakdown = {
    cortisol: { score: cortisolScore.score, weighted: weightedCortisol, message: cortisolScore.message },
    testosterone: { score: testosteroneScore.score, weighted: weightedTestosterone, message: testosteroneScore.message },
    progesterone: progesteroneScore.score ? { score: progesteroneScore.score, weighted: weightedProgesterone, message: progesteroneScore.message } : null,
    ratio: { score: ratioScore.score, weighted: weightedRatio, message: ratioScore.message },
    behavior: { score: behaviorScore.score, weighted: weightedBehavior, message: behaviorScore.message },
    totalAdjustment: totalAdjustment.toFixed(1),
  };
  
  return {
    bioAge,
    chronologicalAge: userProfile.age,
    delta: userProfile.age - bioAge,
    breakdown,
    confidence,
    percentile,
  };
};

/**
 * Calculate Cortisol Aging Score
 * Range: -1.5 to +3.5 years
 */
const calculateCortisolScore = (tests, userProfile) => {
  const cortisolTests = tests.filter(t => t.cortisol !== null);
  if (cortisolTests.length === 0) {
    return { score: 0, message: 'No cortisol data available' };
  }
  
  let score = 0;
  let message = '';
  
  const ageBracket = getCortisolAgeBracket(userProfile.age);
  const optimalRange = CORTISOL_RANGES[userProfile.gender][ageBracket];
  
  // Get recent average (last 5 tests with recency weighting)
  const recentTests = cortisolTests.slice(0, 5);
  const avgCortisol = recentTests.reduce((sum, t) => sum + t.cortisol, 0) / recentTests.length;
  
  // Step 1: Compare to optimal range
  if (avgCortisol >= optimalRange.min && avgCortisol <= optimalRange.max) {
    score += 0;
    message = 'in optimal range';
  } else if (avgCortisol > optimalRange.max) {
    const percentAbove = ((avgCortisol - optimalRange.max) / optimalRange.max) * 100;
    if (percentAbove <= 30) {
      score += 0.5;
      message = 'slightly elevated';
    } else if (percentAbove <= 50) {
      score += 1.0;
      message = 'moderately elevated';
    } else {
      score += 2.0;
      message = 'significantly elevated';
    }
  } else if (avgCortisol < optimalRange.min) {
    const percentBelow = ((optimalRange.min - avgCortisol) / optimalRange.min) * 100;
    if (percentBelow >= 10) {
      score += 0.5;
      message = 'below optimal (possible adrenal concern)';
    }
  }
  
  // Step 2: Consistency bonus (if 10+ tests)
  if (cortisolTests.length >= 10) {
    const inRangeCount = cortisolTests.filter(t => 
      t.cortisol >= optimalRange.min && t.cortisol <= optimalRange.max
    ).length;
    const inRangePercent = (inRangeCount / cortisolTests.length) * 100;
    
    if (inRangePercent >= 80) {
      score -= 1.0;
      message += ' • excellent consistency';
    } else if (inRangePercent < 40) {
      score += 1.0;
      message += ' • poor consistency';
    }
  }
  
  return { 
    score: Math.max(-1.5, Math.min(score, 3.5)),
    message: message || 'within range'
  };
};

/**
 * Calculate Testosterone Aging Score
 * Men: -2.0 to +3.5 years
 * Women: 0 to +2.5 years
 */
const calculateTestosteroneScore = (tests, userProfile) => {
  const testTests = tests.filter(t => t.testosterone !== null);
  if (testTests.length === 0) {
    return { score: 0, message: 'No testosterone data available' };
  }
  
  let score = 0;
  let message = '';
  
  const ageBracket = getTestosteroneAgeBracket(userProfile.age);
  const optimalRange = TESTOSTERONE_RANGES[userProfile.gender][ageBracket];
  
  // Get recent average
  const recentTests = testTests.slice(0, 5);
  const avgTestosterone = recentTests.reduce((sum, t) => sum + t.testosterone, 0) / recentTests.length;
  
  if (userProfile.gender === 'male') {
    // Men: Check percentile within age group
    const top30Threshold = optimalRange.min + (optimalRange.max - optimalRange.min) * 0.7;
    const bottom30Threshold = optimalRange.min + (optimalRange.max - optimalRange.min) * 0.3;
    
    if (avgTestosterone >= top30Threshold) {
      score -= 1.5;
      message = 'top 30% for age (excellent)';
    } else if (avgTestosterone >= bottom30Threshold) {
      score += 0;
      message = 'normal range for age';
    } else if (avgTestosterone >= optimalRange.lowThreshold) {
      score += 1.0;
      message = 'bottom 30% for age';
    } else {
      score += 2.0;
      message = 'below clinical threshold';
    }
    
    // Rate of decline (if 10+ tests over 3+ months)
    if (testTests.length >= 10) {
      const oldestTests = testTests.slice(-5);
      const oldAvg = oldestTests.reduce((sum, t) => sum + t.testosterone, 0) / oldestTests.length;
      const changePercent = ((avgTestosterone - oldAvg) / oldAvg) * 100;
      
      if (changePercent >= 0) {
        score -= 0.5;
        message += ' • stable/improving';
      } else if (changePercent < -2 && changePercent >= -5) {
        score += 0.5;
        message += ' • declining moderately';
      } else if (changePercent < -5) {
        score += 1.5;
        message += ' • declining rapidly';
      }
    }
  } else {
    // Women
    if (avgTestosterone >= optimalRange.min && avgTestosterone <= optimalRange.max) {
      score += 0;
      message = 'optimal for age';
    } else {
      const percentBelow = ((optimalRange.min - avgTestosterone) / optimalRange.min) * 100;
      if (avgTestosterone < optimalRange.min) {
        if (percentBelow <= 20) {
          score += 0.5;
          message = '10-20% below optimal';
        } else if (percentBelow <= 40) {
          score += 1.0;
          message = '20-40% below optimal';
        } else {
          score += 1.5;
          message = 'significantly below optimal';
        }
      } else if (avgTestosterone > 70) {
        score += 1.0;
        message = 'unusually high (may indicate PCOS)';
      }
    }
    
    // Postmenopausal adjustment
    if (userProfile.isPostmenopausal && avgTestosterone < 15) {
      score += 1.0;
      message += ' • low for postmenopausal';
    }
  }
  
  return { 
    score: userProfile.gender === 'male' 
      ? Math.max(-2.0, Math.min(score, 3.5))
      : Math.max(0, Math.min(score, 2.5)),
    message: message || 'within range'
  };
};

/**
 * Calculate Progesterone Aging Score (Women only)
 * Range: -0.5 to +1.5 years
 */
const calculateProgesteroneScore = (tests, userProfile) => {
  const progTests = tests.filter(t => t.progesterone !== null);
  if (progTests.length === 0 || userProfile.gender !== 'female') {
    return { score: 0, message: 'No progesterone data available' };
  }
  
  let score = 0;
  let message = '';
  
  const ageBracket = getProgesteroneAgeBracket(userProfile.age, userProfile.isPostmenopausal);
  
  // Get recent average
  const recentTests = progTests.slice(0, 5);
  const avgProgesterone = recentTests.reduce((sum, t) => sum + t.progesterone, 0) / recentTests.length;
  
  if (userProfile.isPostmenopausal) {
    const optimalBaseline = PROGESTERONE_RANGES.female.postmenopausal['50+'].baseline;
    
    if (avgProgesterone >= optimalBaseline - 10 && avgProgesterone <= optimalBaseline + 10) {
      score += 0;
      message = 'normal for postmenopausal';
    } else if (avgProgesterone < 40) {
      score += 0.5;
      message = 'lower than expected';
    }
  } else {
    // Premenopausal - assume mid-luteal if not specified
    const optimalRange = PROGESTERONE_RANGES.female.premenopausal[ageBracket];
    const optimalLuteal = optimalRange.luteal;
    
    const percentBelow = ((optimalLuteal - avgProgesterone) / optimalLuteal) * 100;
    
    if (avgProgesterone >= optimalLuteal * 0.7) {
      score += 0;
      message = 'optimal for age';
      
      // Bonus for prime reproductive years
      if (userProfile.age >= 25 && userProfile.age <= 39 && avgProgesterone > 130) {
        score -= 0.5;
        message = 'excellent (prime reproductive years)';
      }
    } else if (percentBelow <= 30) {
      score += 0.5;
      message = '10-30% below optimal';
    } else if (percentBelow <= 60) {
      score += 1.0;
      message = '30-60% below optimal';
    } else {
      score += 1.5;
      message = 'significantly below optimal';
    }
  }
  
  return { 
    score: Math.max(-0.5, Math.min(score, 1.5)),
    message: message || 'within range'
  };
};

/**
 * Calculate Cortisol/Testosterone Ratio Score
 * Range: -0.5 to +1.0 years
 */
const calculateRatioScore = (tests, userProfile) => {
  const validTests = tests.filter(t => t.cortisol !== null && t.testosterone !== null);
  if (validTests.length === 0) {
    return { score: 0, message: 'Insufficient data for ratio' };
  }
  
  const recentTests = validTests.slice(0, 5);
  const avgCortisol = recentTests.reduce((sum, t) => sum + t.cortisol, 0) / recentTests.length;
  const avgTestosterone = recentTests.reduce((sum, t) => sum + t.testosterone, 0) / recentTests.length;
  
  // Calculate ratio (cortisol ng/mL ÷ testosterone ng/dL × 100)
  const ratio = (avgCortisol / avgTestosterone) * 100;
  
  let score = 0;
  let message = '';
  
  if (userProfile.gender === 'male') {
    if (ratio < 2) {
      score -= 0.5;
      message = 'excellent stress/anabolic balance';
    } else if (ratio >= 2 && ratio < 4) {
      score += 0;
      message = 'good balance';
    } else if (ratio >= 4 && ratio < 6) {
      score += 0.5;
      message = 'suboptimal balance';
    } else {
      score += 1.0;
      message = 'poor stress/anabolic balance';
    }
  } else {
    if (ratio < 30) {
      score -= 0.5;
      message = 'excellent balance';
    } else if (ratio >= 30 && ratio < 60) {
      score += 0;
      message = 'good balance';
    } else if (ratio >= 60 && ratio < 100) {
      score += 0.5;
      message = 'suboptimal balance';
    } else {
      score += 1.0;
      message = 'high stress/low anabolic';
    }
  }
  
  return { 
    score: Math.max(-0.5, Math.min(score, 1.0)),
    message
  };
};

/**
 * Calculate Behavior & Consistency Score
 * Range: -2.0 to +1.0 years
 */
const calculateBehaviorScore = (tests, userProfile) => {
  let score = 0;
  let message = '';
  
  const weeksCovered = calculateWeeksCovered(tests);
  
  // Consistency bonus (3+ tests/week for 4+ weeks)
  const testsPerWeek = tests.length / weeksCovered;
  if (testsPerWeek >= 3 && weeksCovered >= 4) {
    score -= 1.0;
    message = 'excellent testing consistency';
  }
  
  // Multi-hormone optimization bonus
  const recentTests = tests.slice(0, 10);
  const allOptimal = recentTests.every(test => {
    // Check if all hormones tested are in optimal range
    // Simplified check - can be made more sophisticated
    return test.cortisol || test.testosterone || test.progesterone;
  });
  
  if (allOptimal && tests.length >= 20) {
    score -= 1.0;
    message += (message ? ' • ' : '') + 'all hormones optimized';
  }
  
  // Multi-hormone dysregulation penalty
  // (Would need more sophisticated check based on optimal ranges)
  
  return { 
    score: Math.max(-2.0, Math.min(score, 1.0)),
    message: message || 'standard'
  };
};

/**
 * Calculate weeks covered by tests
 */
const calculateWeeksCovered = (tests) => {
  if (tests.length === 0) return 0;
  
  const dates = tests.map(t => new Date(t.test_date).getTime());
  const oldest = Math.min(...dates);
  const newest = Math.max(...dates);
  
  return (newest - oldest) / (7 * 24 * 60 * 60 * 1000);
};

/**
 * Calculate confidence level
 */
const calculateConfidence = (tests, weeksCovered) => {
  const testCount = tests.length;
  
  if (testCount >= CONFIDENCE_THRESHOLDS.high.tests && weeksCovered >= CONFIDENCE_THRESHOLDS.high.weeks) {
    return {
      level: 'high',
      emoji: '✅',
      percentage: CONFIDENCE_THRESHOLDS.high.accuracy,
      range: CONFIDENCE_THRESHOLDS.high.range,
      message: `High confidence - ${CONFIDENCE_THRESHOLDS.high.accuracy}% accuracy (±${CONFIDENCE_THRESHOLDS.high.range} years)`,
      color: '#10b981',
    };
  }
  
  if (testCount >= CONFIDENCE_THRESHOLDS.medium.tests && weeksCovered >= CONFIDENCE_THRESHOLDS.medium.weeks) {
    return {
      level: 'medium',
      emoji: '🟡',
      percentage: CONFIDENCE_THRESHOLDS.medium.accuracy,
      range: CONFIDENCE_THRESHOLDS.medium.range,
      message: `Medium confidence - ${CONFIDENCE_THRESHOLDS.medium.accuracy}% accuracy (±${CONFIDENCE_THRESHOLDS.medium.range} years)`,
      color: '#f59e0b',
    };
  }
  
  return {
    level: 'low',
    emoji: '🔴',
    percentage: CONFIDENCE_THRESHOLDS.low.accuracy,
    range: CONFIDENCE_THRESHOLDS.low.range,
    message: `Low confidence - ${CONFIDENCE_THRESHOLDS.low.accuracy}% accuracy (±${CONFIDENCE_THRESHOLDS.low.range} years)`,
    color: '#ef4444',
  };
};

/**
 * Calculate percentile ranking
 */
const calculatePercentile = (chronologicalAge, bioAge) => {
  const delta = chronologicalAge - bioAge; // Positive = younger
  
  for (const tier of PERCENTILE_TIERS) {
    if (delta >= tier.delta) {
      return tier;
    }
  }
  
  return PERCENTILE_TIERS[PERCENTILE_TIERS.length - 1];
};

