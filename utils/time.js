// Time utilities for automatic time-of-day detection
import { TIME_OF_DAY } from '../constants/hormones';

/**
 * Get current time of day based on hour
 * @returns {string} 'morning', 'afternoon', 'evening', or 'night'
 */
export const getCurrentTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return TIME_OF_DAY.morning;
  } else if (hour >= 12 && hour < 17) {
    return TIME_OF_DAY.afternoon;
  } else if (hour >= 17 && hour < 21) {
    return TIME_OF_DAY.evening;
  } else {
    return TIME_OF_DAY.night;
  }
};

/**
 * Format time of day for display
 * @param {string} timeOfDay - Time of day constant
 * @returns {string} Formatted display string
 */
export const formatTimeOfDay = (timeOfDay) => {
  const map = {
    [TIME_OF_DAY.morning]: 'Morning',
    [TIME_OF_DAY.afternoon]: 'Afternoon',
    [TIME_OF_DAY.evening]: 'Evening',
    [TIME_OF_DAY.night]: 'Night',
  };
  return map[timeOfDay] || timeOfDay;
};

/**
 * Get emoji for time of day
 * @param {string} timeOfDay - Time of day constant
 * @returns {string} Emoji
 */
export const getTimeOfDayEmoji = (timeOfDay) => {
  const map = {
    [TIME_OF_DAY.morning]: '🌅',
    [TIME_OF_DAY.afternoon]: '☀️',
    [TIME_OF_DAY.evening]: '🌆',
    [TIME_OF_DAY.night]: '🌙',
  };
  return map[timeOfDay] || '🕐';
};

