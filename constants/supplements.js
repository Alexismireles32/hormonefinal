// Common supplements and their typical costs
// Used for ROI calculations in Impact™ feature

export const COMMON_SUPPLEMENTS = [
  { name: 'Vitamin D', cost: 25, category: 'vitamin' },
  { name: 'Zinc', cost: 20, category: 'mineral' },
  { name: 'Magnesium', cost: 25, category: 'mineral' },
  { name: 'Ashwagandha', cost: 35, category: 'adaptogen' },
  { name: 'Tongkat Ali', cost: 45, category: 'adaptogen' },
  { name: 'Maca Root', cost: 30, category: 'adaptogen' },
  { name: 'Fish Oil', cost: 30, category: 'omega' },
  { name: 'Creatine', cost: 25, category: 'performance' },
  { name: 'L-Theanine', cost: 20, category: 'amino' },
  { name: 'Rhodiola', cost: 35, category: 'adaptogen' },
];

export const COMMON_HABITS = [
  { name: 'Heavy Workout', category: 'exercise' },
  { name: 'Light Exercise', category: 'exercise' },
  { name: 'Meditation', category: 'stress' },
  { name: 'Cold Shower', category: 'recovery' },
  { name: 'Fasting', category: 'diet' },
  { name: 'High Carb Meal', category: 'diet' },
  { name: 'Alcohol', category: 'lifestyle' },
  { name: 'Poor Sleep', category: 'sleep' },
  { name: 'Extra Sleep', category: 'sleep' },
  { name: 'Sauna', category: 'recovery' },
];

export const getSupplementCost = (supplementName) => {
  const supplement = COMMON_SUPPLEMENTS.find(
    s => s.name.toLowerCase() === supplementName.toLowerCase()
  );
  return supplement ? supplement.cost : 30; // Default $30/month
};

export const getAllSupplementsAndHabits = () => {
  return [
    ...COMMON_SUPPLEMENTS.map(s => ({ ...s, type: 'supplement' })),
    ...COMMON_HABITS.map(h => ({ ...h, type: 'habit', cost: 0 })),
  ].sort((a, b) => a.name.localeCompare(b.name));
};

