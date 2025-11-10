// Hormone Reference Ranges and Validation
// Based on PRD specifications and Bioageinfo.md research

export const HORMONE_RANGES = {
  cortisol: {
    min: 2.0,
    max: 50.0,
    unit: 'ng/mL',
    decimals: 1,
    optimal: {
      male: {
        '20-30': [8, 20],
        '31-40': [8, 18],
        '41-50': [8, 16],
        '51-60': [9, 19],
        '61-70': [10, 22],
        '71+': [11, 25],
      },
      female: {
        '20-30': [7, 18],
        '31-40': [7, 17],
        '41-50': [7, 15],
        '51-60': [8, 18],
        '61-70': [9, 21],
        '71+': [10, 24],
      },
    },
  },
  
  testosterone: {
    min: 15.0,
    max: 1200.0,
    unit: 'ng/dL',
    decimals: 1,
    optimal: {
      male: {
        '18-35': [500, 900],
        '36-45': [400, 800],
        '46-55': [350, 700],
        '56-65': [300, 600],
        '66+': [250, 550],
      },
      female: {
        '18-35': [35, 70],
        '36-45': [30, 60],
        '46-55': [25, 55],
        '56+': [15, 40],
      },
    },
  },
  
  progesterone: {
    min: 0.1,
    max: 25.0,
    unit: 'ng/mL',
    decimals: 1,
    optimal: {
      male: [20, 30], // Low, stable
      female: {
        follicular: [50, 80],
        luteal: [100, 130],
        postmenopausal: [50, 60],
      },
    },
  },
};

export const TIME_OF_DAY = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
};

export const STRESS_LEVELS = {
  1: { emoji: '😊', label: 'Very Low' },
  2: { emoji: '😐', label: 'Low' },
  3: { emoji: '😟', label: 'Moderate' },
  4: { emoji: '😫', label: 'High' },
  5: { emoji: '😱', label: 'Very High' },
};

export const SLEEP_QUALITY = {
  1: { stars: '⭐', label: 'Very Poor' },
  2: { stars: '⭐⭐', label: 'Poor' },
  3: { stars: '⭐⭐⭐', label: 'Fair' },
  4: { stars: '⭐⭐⭐⭐', label: 'Good' },
  5: { stars: '⭐⭐⭐⭐⭐', label: 'Excellent' },
};

