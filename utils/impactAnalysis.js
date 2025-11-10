// Impact Analysis - Statistical analysis of what works for YOU
// Shows which supplements/habits actually affect your hormones

import { getSupplementCost } from '../constants/supplements';

/**
 * Analyze impact of a supplement/habit on a specific hormone
 * @param {array} allTests - All user tests
 * @param {string} supplementName - Name of supplement/habit
 * @param {string} hormone - 'cortisol', 'testosterone', or 'progesterone'
 * @returns {object} Analysis results with statistics
 */
export const analyzeSupplementImpact = (allTests, supplementName, hormone) => {
  // Filter tests with and without the supplement
  const testsWithSupplement = allTests.filter(test => 
    test.supplements_taken && 
    test.supplements_taken.some(s => 
      s.toLowerCase() === supplementName.toLowerCase()
    ) &&
    test[hormone] !== null &&
    test[hormone] !== undefined
  );

  const testsWithoutSupplement = allTests.filter(test => 
    (!test.supplements_taken || 
     !test.supplements_taken.some(s => 
       s.toLowerCase() === supplementName.toLowerCase()
     )) &&
    test[hormone] !== null &&
    test[hormone] !== undefined
  );

  // Need minimum 3 tests in each group for valid analysis
  if (testsWithSupplement.length < 3 || testsWithoutSupplement.length < 3) {
    return {
      insufficient_data: true,
      with_count: testsWithSupplement.length,
      without_count: testsWithoutSupplement.length,
      needed: Math.max(0, 3 - Math.min(testsWithSupplement.length, testsWithoutSupplement.length)),
    };
  }

  // Calculate averages
  const avgWith = calculateMean(testsWithSupplement.map(t => t[hormone]));
  const avgWithout = calculateMean(testsWithoutSupplement.map(t => t[hormone]));

  // Calculate percent change
  const percentChange = ((avgWith - avgWithout) / avgWithout) * 100;
  const absoluteChange = avgWith - avgWithout;

  // Calculate standard deviations
  const stdWith = calculateStdDev(testsWithSupplement.map(t => t[hormone]), avgWith);
  const stdWithout = calculateStdDev(testsWithoutSupplement.map(t => t[hormone]), avgWithout);

  // Perform t-test for statistical significance
  const tTestResult = performTTest(
    testsWithSupplement.map(t => t[hormone]),
    testsWithoutSupplement.map(t => t[hormone])
  );

  // Determine if significant (p < 0.10 for 90% confidence)
  const isSignificant = tTestResult.pValue < 0.10;

  // Get cost and calculate ROI
  const monthlyCost = getSupplementCost(supplementName);
  const annualCost = monthlyCost * 12;

  // Generate verdict and recommendation
  const verdict = generateVerdict(
    percentChange,
    isSignificant,
    hormone,
    monthlyCost
  );

  return {
    supplement: supplementName,
    hormone,
    avgWithout: parseFloat(avgWithout.toFixed(2)),
    avgWith: parseFloat(avgWith.toFixed(2)),
    percentChange: parseFloat(percentChange.toFixed(1)),
    absoluteChange: parseFloat(absoluteChange.toFixed(2)),
    stdWith: parseFloat(stdWith.toFixed(2)),
    stdWithout: parseFloat(stdWithout.toFixed(2)),
    sampleSizeWith: testsWithSupplement.length,
    sampleSizeWithout: testsWithoutSupplement.length,
    tStatistic: parseFloat(tTestResult.tStatistic.toFixed(3)),
    pValue: parseFloat(tTestResult.pValue.toFixed(3)),
    isSignificant,
    confidenceLevel: isSignificant ? (tTestResult.pValue < 0.05 ? 95 : 90) : null,
    monthlyCost,
    annualCost,
    verdict,
    insufficient_data: false,
  };
};

/**
 * Analyze all supplements/habits for a user
 * @param {array} allTests - All user tests
 * @param {array} hormones - Hormones to analyze ['cortisol', 'testosterone', 'progesterone']
 * @returns {array} Array of impact analyses
 */
export const analyzeAllSupplements = (allTests, hormones = ['cortisol', 'testosterone', 'progesterone']) => {
  // Get unique supplements from all tests
  const allSupplements = new Set();
  allTests.forEach(test => {
    if (test.supplements_taken && Array.isArray(test.supplements_taken)) {
      test.supplements_taken.forEach(s => allSupplements.add(s));
    }
  });

  const results = [];

  // Analyze each supplement for each hormone
  allSupplements.forEach(supplement => {
    hormones.forEach(hormone => {
      const analysis = analyzeSupplementImpact(allTests, supplement, hormone);
      
      // Only include if we have enough data and the supplement affects this hormone
      if (!analysis.insufficient_data && analysis.isSignificant) {
        results.push(analysis);
      }
    });
  });

  // Sort by absolute percent change (most impactful first)
  return results.sort((a, b) => 
    Math.abs(b.percentChange) - Math.abs(a.percentChange)
  );
};

/**
 * Get recommendations for user based on impact analysis
 * @param {array} analyses - Array of impact analyses
 * @returns {object} Recommendations and savings
 */
export const getImpactRecommendations = (analyses) => {
  const keep = [];
  const stop = [];
  let potentialSavings = 0;

  analyses.forEach(analysis => {
    if (analysis.verdict.action === 'keep') {
      keep.push(analysis);
    } else if (analysis.verdict.action === 'stop') {
      stop.push(analysis);
      potentialSavings += analysis.annualCost;
    }
  });

  return {
    keep,
    stop,
    potentialSavings,
    totalAnalyzed: analyses.length,
  };
};

// ==================== HELPER FUNCTIONS ====================

const calculateMean = (values) => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateStdDev = (values, mean) => {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Perform independent samples t-test
 * @returns {object} { tStatistic, pValue }
 */
const performTTest = (sample1, sample2) => {
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  const mean1 = calculateMean(sample1);
  const mean2 = calculateMean(sample2);
  
  const std1 = calculateStdDev(sample1, mean1);
  const std2 = calculateStdDev(sample2, mean2);
  
  // Pooled standard deviation
  const pooledStd = Math.sqrt(
    ((n1 - 1) * Math.pow(std1, 2) + (n2 - 1) * Math.pow(std2, 2)) / 
    (n1 + n2 - 2)
  );
  
  // Standard error
  const standardError = pooledStd * Math.sqrt(1/n1 + 1/n2);
  
  // t-statistic
  const tStatistic = (mean1 - mean2) / standardError;
  
  // Degrees of freedom
  const df = n1 + n2 - 2;
  
  // Approximate p-value (two-tailed)
  // Using simplified approximation - good enough for our purposes
  const pValue = calculatePValue(Math.abs(tStatistic), df);
  
  return {
    tStatistic,
    pValue,
    degreesOfFreedom: df,
  };
};

/**
 * Approximate p-value from t-statistic
 * Simplified approximation for mobile app
 */
const calculatePValue = (t, df) => {
  // Very rough approximation using normal distribution
  // For more accuracy, would use t-distribution lookup table
  
  if (t > 3) return 0.01;
  if (t > 2.5) return 0.02;
  if (t > 2) return 0.05;
  if (t > 1.65) return 0.10;
  if (t > 1.3) return 0.20;
  return 0.30;
};

/**
 * Generate verdict and recommendation
 */
const generateVerdict = (percentChange, isSignificant, hormone, monthlyCost) => {
  if (!isSignificant) {
    return {
      title: 'NO EFFECT',
      action: 'stop',
      emoji: '❌',
      color: '#ef4444',
      message: `No measurable impact on ${hormone}. Save $${monthlyCost}/month.`,
      savings: monthlyCost * 12,
    };
  }

  // Determine if change is good or bad based on hormone
  const isPositiveChange = (
    (hormone === 'testosterone' && percentChange > 0) ||
    (hormone === 'cortisol' && percentChange < 0) ||
    (hormone === 'progesterone' && percentChange > 0)
  );

  const absChange = Math.abs(percentChange);

  if (isPositiveChange && absChange > 15) {
    return {
      title: 'STRONG POSITIVE',
      action: 'keep',
      emoji: '✅',
      color: '#22c55e',
      message: `${absChange.toFixed(0)}% improvement in ${hormone}. Keep taking!`,
      savings: 0,
    };
  } else if (isPositiveChange && absChange > 5) {
    return {
      title: 'MODERATE POSITIVE',
      action: 'keep',
      emoji: '✅',
      color: '#22c55e',
      message: `${absChange.toFixed(0)}% improvement in ${hormone}. Beneficial.`,
      savings: 0,
    };
  } else if (!isPositiveChange && absChange > 10) {
    return {
      title: 'NEGATIVE EFFECT',
      action: 'stop',
      emoji: '🔴',
      color: '#ef4444',
      message: `${absChange.toFixed(0)}% worse ${hormone}. Stop immediately.`,
      savings: monthlyCost * 12,
    };
  } else {
    return {
      title: 'MARGINAL',
      action: 'consider_stopping',
      emoji: '⚠️',
      color: '#f59e0b',
      message: `Minimal effect (${absChange.toFixed(0)}%). Consider stopping.`,
      savings: monthlyCost * 12,
    };
  }
};

