// Streak Calculation Utility
// PRD: Streak increments when user tests within 4 days of last test

/**
 * Calculate current testing streak
 * @param {array} tests - All hormone tests (sorted by date, newest first)
 * @returns {object} { streak, lastTestDate, milestones }
 */
export const calculateStreak = (tests) => {
  if (!tests || tests.length === 0) {
    return { streak: 0, lastTestDate: null, milestones: [] };
  }

  const sortedTests = [...tests].sort((a, b) => 
    new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
  );

  let streak = 1; // Start with 1 for the most recent test
  const now = Date.now();
  const mostRecentTest = new Date(sortedTests[0].test_date).getTime();
  
  // Check if streak is broken (more than 4 days since last test)
  const daysSinceLastTest = (now - mostRecentTest) / (24 * 60 * 60 * 1000);
  if (daysSinceLastTest > 4) {
    return { 
      streak: 0, 
      lastTestDate: sortedTests[0].test_date,
      milestones: [],
      daysSinceLastTest: Math.floor(daysSinceLastTest),
    };
  }

  // Calculate streak by counting consecutive tests within 4-day windows
  for (let i = 0; i < sortedTests.length - 1; i++) {
    const currentTest = new Date(sortedTests[i].test_date).getTime();
    const previousTest = new Date(sortedTests[i + 1].test_date).getTime();
    const daysBetween = (currentTest - previousTest) / (24 * 60 * 60 * 1000);

    if (daysBetween <= 4) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  // Determine reached milestones
  const milestones = [];
  const milestoneThresholds = [3, 7, 14, 30, 60, 90];
  
  for (const threshold of milestoneThresholds) {
    if (streak >= threshold) {
      milestones.push(threshold);
    }
  }

  return {
    streak,
    lastTestDate: sortedTests[0].test_date,
    milestones,
    daysSinceLastTest: Math.floor(daysSinceLastTest),
  };
};

/**
 * Get streak emoji and message
 * @param {number} streak - Current streak count
 * @returns {object} { emoji, message, color }
 */
export const getStreakDisplay = (streak) => {
  if (streak === 0) {
    return {
      emoji: '⏳',
      message: 'Start your streak!',
      color: '#9ca3af',
    };
  }

  if (streak >= 90) {
    return {
      emoji: '🏆',
      message: `${streak}-day legend! 🔥`,
      color: '#f59e0b',
    };
  }

  if (streak >= 60) {
    return {
      emoji: '💎',
      message: `${streak}-day diamond streak!`,
      color: '#8b5cf6',
    };
  }

  if (streak >= 30) {
    return {
      emoji: '⭐',
      message: `${streak}-day superstar!`,
      color: '#10b981',
    };
  }

  if (streak >= 14) {
    return {
      emoji: '🔥',
      message: `${streak}-day streak!`,
      color: '#ef4444',
    };
  }

  if (streak >= 7) {
    return {
      emoji: '🔥',
      message: `${streak}-day streak!`,
      color: '#f97316',
    };
  }

  if (streak >= 3) {
    return {
      emoji: '🔥',
      message: `${streak}-day streak!`,
      color: '#fbbf24',
    };
  }

  return {
    emoji: '📅',
    message: `${streak} day${streak > 1 ? 's' : ''}`,
    color: '#60a5fa',
  };
};

/**
 * Calculate percentile rank for streak
 * @param {number} streak - Current streak count
 * @returns {number} Percentile (0-100)
 */
export const getStreakPercentile = (streak) => {
  // Approximate distribution based on retention metrics
  if (streak >= 90) return 98;
  if (streak >= 60) return 95;
  if (streak >= 30) return 85;
  if (streak >= 14) return 70;
  if (streak >= 7) return 50;
  if (streak >= 3) return 30;
  return 15;
};

/**
 * Check if user just hit a milestone
 * @param {number} currentStreak - Current streak
 * @param {number} previousStreak - Previous streak
 * @returns {number|null} Milestone hit, or null
 */
export const checkMilestoneHit = (currentStreak, previousStreak) => {
  const milestones = [3, 7, 14, 30, 60, 90];
  
  for (const milestone of milestones) {
    if (currentStreak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }
  
  return null;
};

/**
 * Get milestone celebration message
 * @param {number} milestone - Milestone number
 * @returns {object} { title, message, emoji }
 */
export const getMilestoneCelebration = (milestone) => {
  const celebrations = {
    3: {
      title: '3-Day Streak! 🎉',
      message: "You're building a habit! Keep it up!",
      emoji: '🔥',
    },
    7: {
      title: 'Week Warrior! 🏅',
      message: "One week of consistency! You're in the top 50% of users.",
      emoji: '⭐',
    },
    14: {
      title: 'Two Week Champion! 🎖️',
      message: "Your dedication is inspiring! Top 30% of users.",
      emoji: '🔥',
    },
    30: {
      title: '30-Day Legend! 🏆',
      message: "A full month! You're in the top 15% of users. Your hormones thank you!",
      emoji: '⭐',
    },
    60: {
      title: 'Diamond Status! 💎',
      message: "60 days of excellence! Top 5% of users. You're a hormone optimization master!",
      emoji: '💎',
    },
    90: {
      title: 'Hall of Fame! 🏆',
      message: "90 days! Top 2% of users. You've achieved legendary status!",
      emoji: '👑',
    },
  };

  return celebrations[milestone] || {
    title: `${milestone}-Day Streak!`,
    message: 'Amazing consistency!',
    emoji: '🔥',
  };
};

