// ReadyScore Categories - Physical Performance, Mental Clarity, etc.
// Smart, realistic algorithms based on hormone science
import { HORMONE_RANGES } from '../constants/hormones';

/**
 * Calculate Physical Performance ReadyScore
 * Focuses on: Testosterone (muscle power) + Cortisol (recovery state)
 * @returns {object} { score, color, title, explanation }
 */
export const calculatePhysicalPerformance = (latestTest, allTests, user) => {
  if (!latestTest) return null;

  let score = 50; // Start neutral
  const factors = [];
  
  // === TESTOSTERONE CONTRIBUTION (70% of score) ===
  if (latestTest.testosterone !== null && latestTest.testosterone !== undefined) {
    const testScore = evaluateTestosteroneForPhysical(
      latestTest.testosterone,
      user.age,
      user.gender
    );
    score += testScore.points;
    factors.push(testScore.factor);
  } else {
    factors.push('⚠️ No testosterone data');
  }

  // === CORTISOL CONTRIBUTION (30% of score) ===
  if (latestTest.cortisol !== null && latestTest.cortisol !== undefined) {
    const cortisolScore = evaluateCortisolForPhysical(
      latestTest.cortisol,
      latestTest.time_of_day
    );
    score += cortisolScore.points;
    factors.push(cortisolScore.factor);
  } else {
    factors.push('⚠️ No cortisol data');
  }

  // === RECENT WORKOUT PATTERN (bonus/penalty) ===
  if (allTests.length >= 3) {
    const recentWorkouts = allTests
      .slice(0, 3)
      .filter(t => t.exercise_today).length;
    
    if (recentWorkouts === 0) {
      // Well-rested, bonus for fresh muscles
      score += 5;
      factors.push('💤 Well-rested muscles');
    } else if (recentWorkouts >= 2) {
      // Potential overtraining
      score -= 5;
      factors.push('⚠️ High recent training volume');
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Get presentation
  const { color, title } = getPhysicalPerformancePresentation(score);
  
  // Build smart explanation
  const explanation = buildPhysicalExplanation(latestTest, factors, score, user);

  return {
    category: 'physical',
    score,
    color,
    title,
    explanation,
    emoji: '💪',
    factors,
  };
};

/**
 * Calculate Mental Clarity ReadyScore
 * Focuses on: Cortisol (stress/focus) + Time of day + Testosterone (cognitive speed)
 * @returns {object} { score, color, title, explanation }
 */
export const calculateMentalClarity = (latestTest, allTests, user) => {
  if (!latestTest) return null;

  let score = 50; // Start neutral
  const factors = [];
  
  // === CORTISOL CONTRIBUTION (60% of score) ===
  // Mental clarity is HIGHLY sensitive to cortisol
  if (latestTest.cortisol !== null && latestTest.cortisol !== undefined) {
    const cortisolScore = evaluateCortisolForMental(
      latestTest.cortisol,
      latestTest.time_of_day,
      user.age,
      user.gender
    );
    score += cortisolScore.points;
    factors.push(cortisolScore.factor);
  } else {
    factors.push('⚠️ No cortisol data');
  }

  // === TESTOSTERONE CONTRIBUTION (25% of score) ===
  // Supports cognitive processing speed
  if (latestTest.testosterone !== null && latestTest.testosterone !== undefined) {
    const testScore = evaluateTestosteroneForMental(
      latestTest.testosterone,
      user.age,
      user.gender
    );
    score += testScore.points;
    factors.push(testScore.factor);
  }

  // === TIME OF DAY ADJUSTMENT (15% of score) ===
  const timeAdjustment = getTimeOfDayMentalAdjustment(latestTest.time_of_day);
  score += timeAdjustment.points;
  factors.push(timeAdjustment.factor);

  // === CORTISOL TREND (bonus/penalty) ===
  if (allTests.length >= 3) {
    const cortisols = allTests
      .slice(0, 3)
      .filter(t => t.cortisol !== null)
      .map(t => t.cortisol);
    
    if (cortisols.length >= 2) {
      const trend = cortisols[0] - cortisols[cortisols.length - 1];
      
      if (trend < -3 && cortisols[0] < 18) {
        // Cortisol coming down, mental clarity improving
        score += 5;
        factors.push('📈 Stress decreasing');
      } else if (trend > 3 && cortisols[0] > 18) {
        // Cortisol rising, mental clarity declining
        score -= 5;
        factors.push('📉 Stress increasing');
      }
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Get presentation
  const { color, title } = getMentalClarityPresentation(score);
  
  // Build smart explanation
  const explanation = buildMentalExplanation(latestTest, factors, score, user);

  return {
    category: 'mental',
    score,
    color,
    title,
    explanation,
    emoji: '🧠',
    factors,
  };
};

// ==================== PHYSICAL PERFORMANCE HELPERS ====================

const evaluateTestosteroneForPhysical = (testosterone, age, gender) => {
  const optimalRange = getOptimalTestosteroneRange(age, gender);
  if (!optimalRange) {
    return { points: 0, factor: '⚠️ No T reference range' };
  }

  const [min, max] = optimalRange;
  const mid = (min + max) / 2;

  if (gender === 'male') {
    // Men: Higher T = better physical performance
    if (testosterone >= max * 0.9) {
      const percentile = Math.min(100, Math.round((testosterone / max) * 100));
      return { 
        points: 35, 
        factor: `💪 T: ${testosterone.toFixed(0)} ng/dL (top ${100 - percentile}%)` 
      };
    } else if (testosterone >= mid) {
      return { 
        points: 25, 
        factor: `💪 T: ${testosterone.toFixed(0)} ng/dL (upper optimal)` 
      };
    } else if (testosterone >= min) {
      return { 
        points: 15, 
        factor: `💪 T: ${testosterone.toFixed(0)} ng/dL (lower optimal)` 
      };
    } else if (testosterone >= min * 0.7) {
      return { 
        points: -10, 
        factor: `⚠️ T: ${testosterone.toFixed(0)} ng/dL (below optimal)` 
      };
    } else {
      return { 
        points: -20, 
        factor: `🔴 T: ${testosterone.toFixed(0)} ng/dL (significantly low)` 
      };
    }
  } else {
    // Women: Optimal range matters
    if (testosterone >= min && testosterone <= max) {
      return { 
        points: 25, 
        factor: `💪 T: ${testosterone.toFixed(0)} ng/dL (optimal)` 
      };
    } else if (testosterone < min) {
      return { 
        points: -15, 
        factor: `⚠️ T: ${testosterone.toFixed(0)} ng/dL (low)` 
      };
    } else {
      return { 
        points: 10, 
        factor: `💪 T: ${testosterone.toFixed(0)} ng/dL (elevated)` 
      };
    }
  }
};

const evaluateCortisolForPhysical = (cortisol, timeOfDay) => {
  // For physical performance, we want:
  // - NOT too high (catabolic, breaking down muscle)
  // - NOT too low (no energy)
  // - Sweet spot: 10-18 ng/mL for workouts

  if (cortisol >= 10 && cortisol <= 18) {
    return { 
      points: 15, 
      factor: `⚡ Cortisol: ${cortisol.toFixed(1)} ng/mL (optimal for exercise)` 
    };
  } else if (cortisol > 18 && cortisol <= 22) {
    return { 
      points: 5, 
      factor: `⚠️ Cortisol: ${cortisol.toFixed(1)} ng/mL (slightly elevated)` 
    };
  } else if (cortisol > 22) {
    return { 
      points: -10, 
      factor: `🔴 Cortisol: ${cortisol.toFixed(1)} ng/mL (high - catabolic state)` 
    };
  } else if (cortisol < 10 && cortisol >= 7) {
    return { 
      points: 10, 
      factor: `⚡ Cortisol: ${cortisol.toFixed(1)} ng/mL (good energy)` 
    };
  } else {
    return { 
      points: 0, 
      factor: `💤 Cortisol: ${cortisol.toFixed(1)} ng/mL (low energy)` 
    };
  }
};

const getPhysicalPerformancePresentation = (score) => {
  if (score >= 85) {
    return { color: '#22c55e', title: 'Peak Strength' };
  } else if (score >= 70) {
    return { color: '#22c55e', title: 'Strong Performance' };
  } else if (score >= 55) {
    return { color: '#f59e0b', title: 'Moderate Capacity' };
  } else if (score >= 40) {
    return { color: '#f59e0b', title: 'Light Exercise Only' };
  } else {
    return { color: '#ef4444', title: 'Rest Day' };
  }
};

const buildPhysicalExplanation = (test, factors, score, user) => {
  if (score >= 85) {
    return 'Perfect conditions for strength training or intense workouts. Your hormones support peak performance.';
  } else if (score >= 70) {
    return 'Good workout capacity. Ideal for moderate-heavy training sessions.';
  } else if (score >= 55) {
    return 'Moderate energy. Best for light-moderate exercise. Avoid maximal efforts.';
  } else if (score >= 40) {
    return 'Low physical capacity. Stick to walking, stretching, or yoga today.';
  } else {
    return 'Your body needs recovery. Rest is productive. Try again tomorrow.';
  }
};

// ==================== MENTAL CLARITY HELPERS ====================

const evaluateCortisolForMental = (cortisol, timeOfDay, age, gender) => {
  // Mental clarity is VERY sensitive to cortisol
  // Too high = scattered, anxious
  // Too low = foggy, sluggish
  // Sweet spot: 12-18 ng/mL for morning/afternoon focus

  const optimalRange = getOptimalCortisolRange(age, gender, timeOfDay);
  if (!optimalRange) {
    return { points: 0, factor: '⚠️ No cortisol reference' };
  }

  const [min, max] = optimalRange;
  const mid = (min + max) / 2;

  if (cortisol >= min && cortisol <= max) {
    // In optimal range - great for focus
    const deviation = Math.abs(cortisol - mid) / (max - min);
    const points = 30 * (1 - deviation); // 20-30 points
    return { 
      points, 
      factor: `🎯 Cortisol: ${cortisol.toFixed(1)} ng/mL (optimal focus)` 
    };
  } else if (cortisol > max) {
    const percentAbove = ((cortisol - max) / max) * 100;
    if (percentAbove > 40) {
      return { 
        points: -25, 
        factor: `🔴 Cortisol: ${cortisol.toFixed(1)} ng/mL (very high - scattered thinking)` 
      };
    } else if (percentAbove > 20) {
      return { 
        points: -15, 
        factor: `⚠️ Cortisol: ${cortisol.toFixed(1)} ng/mL (elevated - reduced focus)` 
      };
    } else {
      return { 
        points: -5, 
        factor: `⚠️ Cortisol: ${cortisol.toFixed(1)} ng/mL (slightly high)` 
      };
    }
  } else {
    // Below optimal
    const percentBelow = ((min - cortisol) / min) * 100;
    if (percentBelow > 30) {
      return { 
        points: -20, 
        factor: `💤 Cortisol: ${cortisol.toFixed(1)} ng/mL (very low - brain fog)` 
      };
    } else {
      return { 
        points: -10, 
        factor: `💤 Cortisol: ${cortisol.toFixed(1)} ng/mL (low - sluggish)` 
      };
    }
  }
};

const evaluateTestosteroneForMental = (testosterone, age, gender) => {
  const optimalRange = getOptimalTestosteroneRange(age, gender);
  if (!optimalRange) {
    return { points: 0, factor: '' };
  }

  const [min, max] = optimalRange;
  const mid = (min + max) / 2;

  if (gender === 'male') {
    if (testosterone >= mid) {
      return { 
        points: 10, 
        factor: `🧠 T supports cognitive speed` 
      };
    } else if (testosterone >= min * 0.8) {
      return { 
        points: 5, 
        factor: `🧠 T adequate for cognition` 
      };
    } else {
      return { 
        points: -10, 
        factor: `⚠️ T low - may affect processing` 
      };
    }
  } else {
    // Women
    if (testosterone >= min && testosterone <= max) {
      return { 
        points: 10, 
        factor: `🧠 T optimal for cognition` 
      };
    } else {
      return { points: 0, factor: '' };
    }
  }
};

const getTimeOfDayMentalAdjustment = (timeOfDay) => {
  // Mental clarity varies by time of day naturally
  switch (timeOfDay) {
    case 'morning':
      return { 
        points: 7, 
        factor: '☀️ Morning - natural peak clarity' 
      };
    case 'afternoon':
      return { 
        points: 3, 
        factor: '☀️ Afternoon - good focus window' 
      };
    case 'evening':
      return { 
        points: -5, 
        factor: '🌆 Evening - natural decline' 
      };
    case 'night':
      return { 
        points: -10, 
        factor: '🌙 Night - low cognitive state' 
      };
    default:
      return { points: 0, factor: '' };
  }
};

const getMentalClarityPresentation = (score) => {
  if (score >= 85) {
    return { color: '#3b82f6', title: 'Peak Focus' };
  } else if (score >= 70) {
    return { color: '#22c55e', title: 'Sharp Thinking' };
  } else if (score >= 55) {
    return { color: '#f59e0b', title: 'Decent Focus' };
  } else if (score >= 40) {
    return { color: '#f59e0b', title: 'Mental Fog' };
  } else {
    return { color: '#ef4444', title: 'Brain Fatigue' };
  }
};

const buildMentalExplanation = (test, factors, score, user) => {
  if (score >= 85) {
    return 'Optimal conditions for complex thinking, decision-making, and deep work. Your best cognitive window.';
  } else if (score >= 70) {
    return 'Good mental clarity. Tackle important tasks and complex problems now.';
  } else if (score >= 55) {
    return 'Moderate focus. Best for routine tasks. Delay major decisions if possible.';
  } else if (score >= 40) {
    return 'Mental clarity reduced. Stick to simple tasks. Avoid complex decisions.';
  } else {
    return 'Significant brain fog. Rest your mind. Take breaks. Process simple items only.';
  }
};

// ==================== SHARED HELPERS ====================

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

