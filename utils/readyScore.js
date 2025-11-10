// ReadyScore Algorithm - Commercial Grade Implementation
// Calculates 0-100 daily readiness score based on latest hormone data
import { HORMONE_RANGES } from '../constants/hormones';
import { getCurrentTimeOfDay } from './time';

/**
 * Calculate ReadyScore from latest test and user history
 * @param {object} latestTest - Most recent hormone test
 * @param {array} allTests - All user tests for pattern analysis
 * @param {object} user - User profile (age, gender)
 * @returns {object} { score, confidence, breakdown, message, color }
 */
export const calculateReadyScore = (latestTest, allTests = [], user = { age: 30, gender: 'male' }) => {
  if (!latestTest) {
    return null;
  }

  // Check if test is too old (>24 hours)
  const testAge = Date.now() - new Date(latestTest.test_date).getTime();
  const maxTestAge = 24 * 60 * 60 * 1000;
  
  if (testAge > maxTestAge) {
    return {
      score: null,
      confidence: 0,
      message: 'Test today for your ReadyScore',
      color: 'gray',
      stale: true,
    };
  }

  let score = 50; // Start at neutral
  const breakdown = {
    cortisol: 0,
    testosterone: 0,
    progesterone: 0,
    trend: 0,
  };

  // === CORTISOL CONTRIBUTION (40% weight) ===
  if (latestTest.cortisol !== null && latestTest.cortisol !== undefined) {
    const cortisolScore = evaluateCortisol(
      latestTest.cortisol,
      user.age,
      user.gender,
      latestTest.time_of_day
    );
    breakdown.cortisol = cortisolScore;
    score += cortisolScore * 0.4;
  }

  // === TESTOSTERONE CONTRIBUTION (30% weight) ===
  if (latestTest.testosterone !== null && latestTest.testosterone !== undefined) {
    const testScore = evaluateTestosterone(
      latestTest.testosterone,
      user.age,
      user.gender
    );
    breakdown.testosterone = testScore;
    score += testScore * 0.3;
  }

  // === PROGESTERONE CONTRIBUTION (15% weight for females) ===
  if (user.gender === 'female' && latestTest.progesterone !== null && latestTest.progesterone !== undefined) {
    const progScore = evaluateProgesterone(
      latestTest.progesterone,
      user.age
    );
    breakdown.progesterone = progScore;
    score += progScore * 0.15;
  }

  // === TREND MODIFIER (recent pattern analysis) ===
  if (allTests.length >= 3) {
    const trend = calculateHormoneTrend(allTests.slice(0, 3));
    breakdown.trend = trend;
    score += trend;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Calculate confidence (0% at 1 test, 100% at 10 tests)
  const confidence = Math.min(100, Math.round((allTests.length / 10) * 100));

  // Get color and message
  const { color, message } = getScorePresentation(score);

  return {
    score,
    confidence,
    breakdown,
    message,
    color,
    timestamp: Date.now(),
    testCount: allTests.length,
  };
};

/**
 * Evaluate cortisol contribution to ReadyScore
 * Returns -20 to +20
 */
const evaluateCortisol = (cortisol, age, gender, timeOfDay) => {
  const optimalRange = getOptimalCortisolRange(age, gender, timeOfDay);
  if (!optimalRange) return 0;

  const [min, max] = optimalRange;
  const mid = (min + max) / 2;

  if (cortisol >= min && cortisol <= max) {
    // In optimal range - positive score
    const deviation = Math.abs(cortisol - mid) / (max - min);
    return 20 * (1 - deviation); // 15-20 for perfect center, 10-15 for edges
  } else if (cortisol < min) {
    // Too low (rare but concerning)
    const percentBelow = ((min - cortisol) / min) * 100;
    if (percentBelow > 30) return -15;
    return -5;
  } else {
    // Too high (stress/elevated)
    const percentAbove = ((cortisol - max) / max) * 100;
    if (percentAbove > 50) return -20; // Very high
    if (percentAbove > 30) return -15; // High
    if (percentAbove > 10) return -10; // Moderately elevated
    return -5; // Slightly elevated
  }
};

/**
 * Evaluate testosterone contribution to ReadyScore
 * Returns -15 to +15
 */
const evaluateTestosterone = (testosterone, age, gender) => {
  const optimalRange = getOptimalTestosteroneRange(age, gender);
  if (!optimalRange) return 0;

  const [min, max] = optimalRange;
  const mid = (min + max) / 2;

  if (gender === 'male') {
    if (testosterone >= max * 0.9) {
      return 15; // Top tier
    } else if (testosterone >= mid) {
      return 10; // Upper optimal
    } else if (testosterone >= min) {
      return 5; // Lower optimal
    } else if (testosterone >= min * 0.7) {
      return -5; // Below optimal
    } else {
      return -15; // Significantly low
    }
  } else {
    // Female
    if (testosterone >= min && testosterone <= max) {
      return 10; // In optimal range
    } else if (testosterone > max) {
      return -5; // Too high (possible PCOS)
    } else {
      return -10; // Too low
    }
  }
};

/**
 * Evaluate progesterone contribution to ReadyScore
 * Returns -10 to +10
 */
const evaluateProgesterone = (progesterone, age) => {
  // Simplified for now - will enhance with cycle tracking later
  if (progesterone >= 80 && progesterone <= 150) {
    return 10; // Good range
  } else if (progesterone >= 50 && progesterone < 80) {
    return 5; // Acceptable
  } else if (progesterone > 150) {
    return 0; // Elevated but not necessarily bad
  } else {
    return -5; // Low
  }
};

/**
 * Calculate trend from recent tests
 * Returns -5 to +5
 */
const calculateHormoneTrend = (recentTests) => {
  if (recentTests.length < 3) return 0;

  // Check if hormones are improving, stable, or declining
  let improvements = 0;
  let declines = 0;

  // Analyze cortisol trend (lower is better if elevated)
  const cortisols = recentTests
    .filter(t => t.cortisol !== null)
    .map(t => t.cortisol);
  
  if (cortisols.length >= 2) {
    const recentCortisol = cortisols[0];
    const olderCortisol = cortisols[cortisols.length - 1];
    
    // If cortisol was elevated and is now lower, that's good
    if (olderCortisol > 20 && recentCortisol < olderCortisol) {
      improvements++;
    } else if (recentCortisol > 20 && recentCortisol > olderCortisol) {
      declines++;
    }
  }

  // Analyze testosterone trend (higher is generally better)
  const testosterones = recentTests
    .filter(t => t.testosterone !== null)
    .map(t => t.testosterone);
  
  if (testosterones.length >= 2) {
    const recentTest = testosterones[0];
    const olderTest = testosterones[testosterones.length - 1];
    const change = ((recentTest - olderTest) / olderTest) * 100;
    
    if (change > 5) improvements++;
    else if (change < -5) declines++;
  }

  if (improvements > declines) return 5;
  else if (declines > improvements) return -5;
  return 0; // Stable
};

/**
 * Get optimal cortisol range based on age, gender, and time of day
 */
const getOptimalCortisolRange = (age, gender, timeOfDay) => {
  const ranges = HORMONE_RANGES.cortisol.optimal[gender];
  if (!ranges) return null;

  let ageGroup;
  if (age < 31) ageGroup = '20-30';
  else if (age < 41) ageGroup = '31-40';
  else if (age < 51) ageGroup = '41-50';
  else if (age < 61) ageGroup = '51-60';
  else if (age < 71) ageGroup = '61-70';
  else ageGroup = '71+';

  return ranges[ageGroup] || ranges['20-30'];
};

/**
 * Get optimal testosterone range based on age and gender
 */
const getOptimalTestosteroneRange = (age, gender) => {
  const ranges = HORMONE_RANGES.testosterone.optimal[gender];
  if (!ranges) return null;

  let ageGroup;
  if (age < 36) ageGroup = '18-35';
  else if (age < 46) ageGroup = '36-45';
  else if (age < 56) ageGroup = '46-55';
  else if (age < 66) ageGroup = '56-65';
  else ageGroup = '66+';

  return ranges[ageGroup] || ranges['18-35'];
};

/**
 * Get color and message based on score
 */
const getScorePresentation = (score) => {
  if (score >= 90) {
    return {
      color: '#3b82f6', // Blue
      message: 'Peak Performance',
    };
  } else if (score >= 70) {
    return {
      color: '#22c55e', // Green
      message: 'Strong Day',
    };
  } else if (score >= 50) {
    return {
      color: '#f59e0b', // Orange
      message: 'Steady Pace',
    };
  } else {
    return {
      color: '#ef4444', // Red
      message: 'Recovery Mode',
    };
  }
};

/**
 * Get detailed advice based on ReadyScore
 */
export const getReadyScoreAdvice = (readyScoreData) => {
  if (!readyScoreData || readyScoreData.score === null) {
    return 'Log a hormone test to see your ReadyScore.';
  }

  const { score, breakdown } = readyScoreData;

  if (score >= 90) {
    return 'Everything is firing. Attack your goals today.';
  } else if (score >= 70) {
    return 'You\'re in the zone. Tackle important tasks now.';
  } else if (score >= 50) {
    return 'Good for routine work. Save heroics for tomorrow.';
  } else {
    // Provide specific advice based on what's off
    if (breakdown.cortisol < -10) {
      return 'Your cortisol is elevated. Prioritize rest and stress management.';
    } else if (breakdown.testosterone < -10) {
      return 'Energy may be lower today. Focus on essentials only.';
    } else {
      return 'Your body needs recovery. Light workload recommended.';
    }
  }
};

