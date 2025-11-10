# HORMOIQ - PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Active Development  
**Golden Rule:** Do not make any changes until you have 95% confidence that you know what to build. Ask follow-up questions until you have that confidence.

---

## EXECUTIVE SUMMARY

HormoIQ is a React Native mobile app that complements a physical saliva test kit business. Users purchase a hormone pen saliva tester with 12 saliva tests to use throughout the month (3x/week) to test cortisol, testosterone, and progesterone levels at home. The app helps users record results and access insights through 5 core features designed for maximum retention.

**Business Model:** Physical product (test kit) + mobile app (data analysis & insights)  
**Target Users:** Health-conscious adults tracking hormone optimization  
**Retention Goals:** 40%+ D7, 25%+ D30  
**Core Value:** Transform raw hormone data into actionable insights and behavior change

---

## TECHNICAL STACK

**Frontend:**
- React Native (Expo SDK 54)
- React 19.1.0
- AsyncStorage for local persistence

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (future phase)
- Supabase Edge Functions (for complex calculations)
- Row Level Security policies

**AI/ML:**
- OpenAI GPT-4 API
- API Key: Stored in `.env` file as `OPENAI_API_KEY`

**Future Integrations:**
- Roboflow API (camera-based test scanning)
- Push notifications (Expo Notifications)

**Supabase Configuration:**
- Project ID: `xyxhvvpyyfgwssimntxs`
- Project URL: `https://xyxhvvpyyfgwssimntxs.supabase.co`
- Anon Key: (configured in `lib/supabase.js`)

---

## PRODUCT PHILOSOPHY

**What We're Building:**
A habit-forming hormone optimization tool that users check daily (not just when testing).

**What We're NOT Building:**
- Generic health tracking app
- Food diary or calorie counter
- Workout logger
- Sleep tracker (others do this better)
- Medical diagnostic tool

**Core Principle:**  
Each of the 5 features creates a different retention hook. Together they're inescapable.

---

## THE 5 CORE FEATURES (Build Priority Order)

### FEATURE 1: TEST™ - The 2-Minute Data Ritual

**Status:** Phase 1 (MVP)  
**Priority:** CRITICAL - Foundation for all other features

**What It Is:**
Fast, frictionless hormone test logging with instant context and insights.

**User Flow:**
1. User opens app after saliva test
2. Selects hormone(s) to log (can test 1, 2, or all 3)
3. Enters values via manual input with sliders/number pads
4. Adds context: sleep quality (1-5 stars), exercise (yes/no toggle), stress level (emoji picker), optional supplements/notes
5. Taps "Save"
6. Receives instant insight + streak update

**Technical Specs:**

**Input Ranges (Physiological Min/Max):**
```
Cortisol: 2.0 - 50.0 ng/mL
  - Optimal morning (8 AM): 8-20 ng/mL (ages 20-40)
  - Unit: ng/mL
  - Decimal precision: 1 place (e.g., 16.2)

Testosterone (Male): 15.0 - 1200.0 ng/dL
  - Optimal: 500-900 ng/dL (ages 18-35)
  - Unit: ng/dL
  - Decimal precision: 1 place

Testosterone (Female): 15.0 - 70.0 ng/dL
  - Optimal: 35-70 ng/dL (ages 18-35)
  - Unit: ng/dL
  - Decimal precision: 1 place

Progesterone: 0.1 - 25.0 ng/mL
  - Female (luteal): 100-130 pg/mL peak (ages 25-39)
  - Female (postmenopausal): ~50-60 pg/mL
  - Male: ~20-30 pg/mL (low, stable)
  - Unit: ng/mL or pg/mL (conversion: 1 ng/mL = 1000 pg/mL)
  - Decimal precision: 1 place
```

**Context Fields:**
```javascript
{
  sleep_quality: 1-5 (star rating),
  exercise_today: boolean,
  stress_level: 1-5 (emoji picker: 😊 😐 😟 😫 😱),
  supplements_taken: string[] (tags),
  notes: string (optional, max 500 chars)
}
```

**Instant Insights Algorithm:**
```javascript
// After user saves test
function generateInstantInsight(newTest, userHistory) {
  const insights = [];
  
  // 1. Optimal range check
  if (isInOptimalRange(newTest.cortisol, userAge, timeOfDay)) {
    insights.push(`✓ Cortisol: ${newTest.cortisol} ng/mL (optimal for ${timeOfDay})`);
  } else if (isAboveOptimal(newTest.cortisol)) {
    insights.push(`⚠️ Cortisol elevated: ${newTest.cortisol} ng/mL (typical: ${getOptimalRange()})`);
  }
  
  // 2. Comparison to previous test
  if (userHistory.length >= 1) {
    const lastTest = userHistory[userHistory.length - 1];
    const percentChange = ((newTest.cortisol - lastTest.cortisol) / lastTest.cortisol) * 100;
    insights.push(`📊 ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}% vs your last test`);
  }
  
  // 3. Personal ranking
  const ranking = calculatePersonalRanking(newTest.cortisol, userHistory);
  insights.push(`🏆 This is your ${ranking} best cortisol reading`);
  
  // 4. Pattern detection
  if (detectsPattern(userHistory, newTest)) {
    insights.push(`💡 Pattern detected: Your Monday cortisol is always 15-20% higher`);
  }
  
  // 5. Streak celebration
  const streak = calculateStreak(userHistory);
  if (streak >= 3) {
    insights.push(`🔥 ${streak}-day streak! You're in top ${calculatePercentile(streak)}% of users`);
  }
  
  return insights;
}
```

**Streak Mechanics:**
- Streak increments when user tests within 4 days of last test
- Breaks if >4 days pass without testing
- Display: "🔥 12-day streak!"
- Milestone celebrations: 7 days, 14 days, 30 days, 60 days, 90 days

**UI/UX Requirements:**
- Completion time: <2 minutes from open to save
- Input method: Number pad for manual entry (Phase 1), camera scan (Phase 2+)
- Auto-suggestions: Pre-fill time of day, common patterns
- Accessibility: Large tap targets, clear labels, emoji + text
- Offline support: Save locally, sync when online

**Success Metrics:**
- Time to complete: <90 seconds (median)
- Test logging completion rate: >95%
- Context data completion: >70%

---

### FEATURE 2: READYSCORE™ - Daily 0-100 Check-In

**Status:** Phase 1 (MVP)  
**Priority:** CRITICAL - Daily habit anchor

**What It Is:**
A single 0-100 score that tells users how ready they are for today, based on latest hormone data and patterns.

**Unlock Logic:**
- Appears after 1st test with "confidence %" indicator
- Confidence = (tests_completed / 10) * 100
- Max confidence: 100% at 10 tests
- Display confidence always: "ReadyScore: 82 (Confidence: 70%)"

**Algorithm (Detailed):**

```javascript
function calculateReadyScore(user) {
  // Requires at least 1 test
  if (user.tests.length === 0) return null;
  
  const latestTest = user.tests[user.tests.length - 1];
  const testAge = Date.now() - latestTest.timestamp;
  const maxTestAge = 24 * 60 * 60 * 1000; // 24 hours
  
  // If latest test is >24hrs old, use degraded score
  if (testAge > maxTestAge) {
    return calculateDegradedScore(user);
  }
  
  let score = 50; // Start at neutral
  
  // === CORTISOL CONTRIBUTION (40% weight) ===
  const cortisolScore = evaluateCortisol(latestTest.cortisol, user.age, latestTest.time);
  // Returns -20 to +20 based on optimal range
  score += cortisolScore * 0.4;
  
  // === TESTOSTERONE CONTRIBUTION (30% weight) ===
  if (latestTest.testosterone) {
    const testScore = evaluateTestosterone(latestTest.testosterone, user.age, user.gender);
    // Returns -15 to +15
    score += testScore * 0.3;
  }
  
  // === PROGESTERONE CONTRIBUTION (15% weight - varies by gender) ===
  if (latestTest.progesterone && user.gender === 'female') {
    const progScore = evaluateProgesterone(latestTest.progesterone, user.age, user.cycleDay);
    // Returns -10 to +10
    score += progScore * 0.15;
  }
  
  // === CONTEXT MODIFIERS (15% weight) ===
  if (latestTest.sleep_quality >= 4) score += 5;
  else if (latestTest.sleep_quality <= 2) score -= 5;
  
  if (latestTest.stress_level >= 4) score -= 5;
  else if (latestTest.stress_level <= 2) score += 3;
  
  if (latestTest.exercise_today) score += 2;
  
  // === TREND MODIFIER (recent patterns) ===
  if (user.tests.length >= 3) {
    const trend = calculateHormoneTrend(user.tests.slice(-3));
    if (trend === 'improving') score += 5;
    else if (trend === 'declining') score -= 5;
  }
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Calculate confidence
  const confidence = Math.min(100, (user.tests.length / 10) * 100);
  
  return {
    score,
    confidence,
    timestamp: Date.now()
  };
}

function evaluateCortisol(cortisol, age, timeOfDay) {
  const optimalRange = getOptimalCortisolRange(age, timeOfDay);
  const [min, max] = optimalRange;
  const mid = (min + max) / 2;
  
  if (cortisol >= min && cortisol <= max) {
    // In optimal range - positive score
    const deviation = Math.abs(cortisol - mid) / (max - min);
    return 20 * (1 - deviation); // 15-20 for perfect, 10-15 for edges
  } else if (cortisol < min) {
    // Too low (rare but concerning)
    const percentBelow = ((min - cortisol) / min) * 100;
    if (percentBelow > 30) return -15;
    return -5;
  } else {
    // Too high (stress)
    const percentAbove = ((cortisol - max) / max) * 100;
    if (percentAbove > 50) return -20; // Very high
    if (percentAbove > 30) return -15; // High
    return -8; // Slightly elevated
  }
}
```

**Color Coding:**
```
0-49:   RED    "Recovery Mode 🔴"
50-69:  ORANGE "Steady Pace 🟠"
70-89:  GREEN  "Strong Day 🟢"
90-100: BLUE   "Peak Performance 🔵"
```

**Display Messages:**
```javascript
const messages = {
  0-49: [
    "Recovery mode. Light workload recommended.",
    "Your body needs rest today. Take it easy.",
    "Not your peak day. Prioritize essentials only."
  ],
  50-69: [
    "Steady pace. Moderate intensity ideal.",
    "Good for routine work. Save heroics for tomorrow.",
    "Solid baseline. Maintain, don't push."
  ],
  70-89: [
    "Strong day. Tackle important tasks now.",
    "You're in the zone. Seize it.",
    "High performance window. Go for it."
  ],
  90-100: [
    "Peak performance. Crush it. 🚀",
    "Your best day. Make it count.",
    "Everything is firing. Attack your goals."
  ]
};
```

**Update Frequency:**
- Recalculates automatically after each new test
- User can manually refresh (pull-to-refresh)
- Shows "Last updated: X hours ago"
- If >24hrs old: Show degraded score with "Test today for accurate score"

**UI/UX Requirements:**
- Prominent display on home screen (largest element)
- Animated score ring/progress circle
- Tap for detailed breakdown
- Show confidence % always
- Color-coded background gradient

---

### FEATURE 3: IMPACT™ - What Works For YOU

**Status:** Phase 2  
**Priority:** HIGH - ROI proof, drives upgrades

**What It Is:**
Shows which supplements, habits, and lifestyle changes have measurable effects on YOUR hormones with statistical data.

**Unlock Logic:**
- Unlocks after 15 total tests
- Requires at least 3 tests with supplement/habit tagged
- Shows message before unlock: "12 more tests to unlock Impact™ insights"

**User Flow:**
1. User sets up "experiments" or tags habits consistently
2. After 15+ tests, Impact™ analyzes correlations
3. Shows before/after comparison for each supplement/habit
4. Displays statistical significance and ROI

**Experiment Setup:**
```javascript
// User can create structured experiments
{
  experiment_id: uuid,
  name: "Vitamin D Test",
  type: "supplement", // or "habit", "exercise", "diet"
  start_date: timestamp,
  end_date: timestamp (optional),
  hypothesis: "Increase testosterone",
  status: "active" | "completed" | "abandoned"
}

// OR simple tagging
// User just tags tests: "Took Vitamin D", "Fasting", "Heavy workout"
// App auto-detects periods with/without
```

**Analysis Algorithm:**
```javascript
function analyzeImpact(user, supplement) {
  // Find all tests WITH supplement
  const testsWithSupplement = user.tests.filter(t => 
    t.supplements_taken.includes(supplement)
  );
  
  // Find all tests WITHOUT supplement (baseline)
  const testsWithoutSupplement = user.tests.filter(t => 
    !t.supplements_taken.includes(supplement)
  );
  
  if (testsWithSupplement.length < 3 || testsWithoutSupplement.length < 3) {
    return { insufficient_data: true };
  }
  
  // Calculate averages
  const avgWith = calculateAverage(testsWithSupplement, 'testosterone');
  const avgWithout = calculateAverage(testsWithoutSupplement, 'testosterone');
  
  // Calculate percent change
  const percentChange = ((avgWith - avgWithout) / avgWithout) * 100;
  
  // Statistical significance (simple t-test)
  const pValue = calculateTTest(testsWithSupplement, testsWithoutSupplement, 'testosterone');
  const isSignificant = pValue < 0.10; // 90% confidence threshold
  
  // ROI calculation (if supplement has cost)
  const monthlyCost = SUPPLEMENT_COSTS[supplement] || 0;
  const hormoneImprovement = percentChange;
  
  return {
    supplement,
    hormone: 'testosterone',
    avgWithout,
    avgWith,
    percentChange,
    isSignificant,
    pValue,
    sampleSizeWith: testsWithSupplement.length,
    sampleSizeWithout: testsWithoutSupplement.length,
    monthlyCost,
    recommendation: generateRecommendation(percentChange, isSignificant, monthlyCost)
  };
}

function generateRecommendation(percentChange, isSignificant, cost) {
  if (!isSignificant) {
    return {
      verdict: "NO EFFECT",
      action: `Stop wasting $${cost}/month`,
      confidence: "low"
    };
  }
  
  if (percentChange > 15) {
    return {
      verdict: "STRONG POSITIVE",
      action: "Keep taking. Proven benefit for YOU.",
      confidence: "high"
    };
  } else if (percentChange > 5) {
    return {
      verdict: "MODERATE POSITIVE",
      action: "Likely helpful. Continue testing.",
      confidence: "medium"
    };
  } else if (percentChange < -5) {
    return {
      verdict: "NEGATIVE EFFECT",
      action: "Stop immediately. May be harming you.",
      confidence: "high"
    };
  } else {
    return {
      verdict: "MARGINAL",
      action: "Not worth the cost. Consider stopping.",
      confidence: "medium"
    };
  }
}
```

**Display Format:**
```
VITAMIN D
✅ +22% testosterone (8 tests with vs 12 without)
📊 Statistical significance: High (p=0.04)
💰 Cost: $25/month
📈 Your result: 720 ng/dL (with) vs 590 ng/dL (without)
✅ VERDICT: Keep taking. Proven benefit for YOU.

ASHWAGANDHA
❌ -2% cortisol (6 tests with vs 10 without)
📊 Statistical significance: None (p=0.67)
💰 Cost: $35/month
📉 Your result: No measurable effect
❌ VERDICT: Stop wasting $35/month.

SAVINGS OPPORTUNITY: Stop Ashwagandha → Save $420/year
```

**Success Metrics:**
- Users who see 1+ "stop wasting money" insight: 80%+
- Users who report changing supplement routine: 40%+
- Perceived ROI: "Paid for itself" sentiment: 60%+

---

### FEATURE 4: ASK™ - AI Hormone Coach

**Status:** Phase 2  
**Priority:** HIGH - Engagement between tests

**What It Is:**
Conversational AI that knows YOUR complete hormone history and answers questions about patterns, concerns, and optimization.

**OpenAI Integration:**
```javascript
// lib/openai.js
import OpenAI from 'openai';

import { OPENAI_API_KEY } from '@env';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

async function askHormoneCoach(userMessage, userContext) {
  const systemPrompt = generateSystemPrompt(userContext);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response.choices[0].message.content;
}

function generateSystemPrompt(userContext) {
  const { user, recentTests, patterns, supplements } = userContext;
  
  return `You are an expert hormone optimization coach with access to this user's complete hormone testing history.

USER PROFILE:
- Age: ${user.age}, Gender: ${user.gender}
- Total tests completed: ${user.tests.length}
- Testing since: ${user.first_test_date}

RECENT HORMONE DATA (last 7 days):
${formatRecentTests(recentTests)}

IDENTIFIED PATTERNS:
${formatPatterns(patterns)}

CURRENT SUPPLEMENTS:
${formatSupplements(supplements)}

Your role:
1. Answer questions about THEIR specific hormone data and patterns
2. Provide actionable, personalized advice based on THEIR results
3. Explain hormone fluctuations in plain English
4. Reassure when normal, alert when concerning
5. Suggest optimization strategies backed by their data
6. Never diagnose medical conditions - recommend seeing doctor if concerning

Tone: Knowledgeable but conversational, direct, encouraging
Format: Short paragraphs, bullet points when helpful
Length: 2-4 paragraphs max (aim for brevity)

IMPORTANT: 
- Always reference their specific numbers and patterns
- Avoid generic advice - make it personal
- If you need more data to answer, ask what to test next
- Mention statistical context ("men your age average X")`;
}
```

**Conversation Types:**

1. **Interpretation Questions:**
```
User: "Why is my cortisol so high today?"
AI: "Your cortisol of 24 ng/mL today was 45% above your average (16). 
Looking at your notes, you mentioned 'investor pitch' yesterday. 
This is a normal stress response. Your pattern shows cortisol spikes 
20-40% during high-stress work events and normalizes within 2-3 days. 
Test again tomorrow AM - I predict it'll be back to 18-20."
```

2. **Optimization Questions:**
```
User: "How can I increase my testosterone?"
AI: "Based on your data, here's what moves YOUR testosterone:

✅ Heavy lifting days: +18% average (710 vs 600 ng/dL)
✅ 8+ hours sleep: +12% average
❌ Alcohol nights: -15% average (even 2-3 drinks)

Your current T of 620 is middle-of-pack for age 35. 
To reach top 30% (700+), prioritize: 3x/week heavy lifts + consistent sleep.
You've hit 750+ on 4 occasions - all had those factors."
```

3. **Concern/Anxiety Questions:**
```
User: "Is 15.2 ng/mL cortisol bad?"
AI: "15.2 is totally normal for you. It's within your typical range 
(14-18) and matches the population average for your age. 

Context matters: You tested at 8 AM after good sleep (⭐⭐⭐⭐). 
This is exactly where you should be.

Your lowest was 12.1, highest was 22.3 (during that work deadline). 
You're in the healthy middle. Nothing to worry about."
```

**Proactive Insights:**
AI can message user when patterns detected:
```
"📊 Pattern Alert: Your cortisol has been elevated for 5 consecutive 
tests (avg 21 vs your typical 15). All during 'project launch week' 
per your notes. Consider stress management or testing on a rest day 
to see your baseline. Want tips for bringing it down?"
```

**UI/UX:**
- Chat interface (like iMessage)
- Voice input option (future)
- Suggested questions as quick-reply buttons
- "Thinking..." animation while AI responds
- Save important conversations to favorites

**Rate Limiting:**
- Free users: 10 questions/month
- Pro users: Unlimited
- Cost management: Track tokens, optimize prompts

---

### FEATURE 5: BIOAGE™ - Biological Age Calculator

**Status:** Phase 2  
**Priority:** MEDIUM-HIGH - Viral growth driver

**What It Is:**
Calculates user's biological age based on hormone levels vs age-cohort averages. Shareable status symbol.

**Unlock Logic:**
- **Partial unlock after 3 tests:** Shows preliminary BioAge with low confidence
- **100% confidence at 12 tests:** Full algorithm with high accuracy
- Progress bar: "9 more tests for full BioAge accuracy"

**Algorithm (Science-Based):**

This uses the comprehensive research from `Bioageinfo.md`:

```javascript
function calculateBioAge(user) {
  const chronologicalAge = user.age;
  let ageAdjustment = 0;
  
  // Minimum 3 tests required
  if (user.tests.length < 3) {
    return { locked: true, testsNeeded: 3 - user.tests.length };
  }
  
  // Get recent average hormone levels (last 30 days or 10 tests)
  const recentTests = getRecentTests(user.tests, 30, 10);
  const avgHormones = calculateAverages(recentTests);
  
  // === CORTISOL CONTRIBUTION (40% weight) ===
  const cortisolAdjustment = evaluateCortisolForBioAge(
    avgHormones.cortisol,
    user.age,
    user.gender,
    recentTests
  );
  ageAdjustment += cortisolAdjustment * 1.5; // 1.5x weight
  
  // === TESTOSTERONE CONTRIBUTION (30% weight for men, 20% for women) ===
  const testosteroneAdjustment = evaluateTestosteroneForBioAge(
    avgHormones.testosterone,
    user.age,
    user.gender,
    recentTests
  );
  const testWeight = user.gender === 'male' ? 1.5 : 1.0;
  ageAdjustment += testosteroneAdjustment * testWeight;
  
  // === PROGESTERONE CONTRIBUTION (women only, 15% weight) ===
  if (user.gender === 'female' && avgHormones.progesterone) {
    const progesteroneAdjustment = evaluateProgesteroneForBioAge(
      avgHormones.progesterone,
      user.age,
      user.isMenopausal
    );
    ageAdjustment += progesteroneAdjustment * 1.0;
  }
  
  // === CONSISTENCY BONUS ===
  if (hasHighTestingConsistency(user.tests, 4)) {
    ageAdjustment -= 1; // -1 year for testing 3+ times/week for 4+ weeks
  }
  
  // === MULTI-HORMONE OPTIMIZATION BONUS ===
  if (allHormonesOptimal(avgHormones, user.age, user.gender)) {
    ageAdjustment -= 1; // -1 year for all hormones in optimal range
  }
  
  // === MULTI-HORMONE DYSREGULATION PENALTY ===
  const dysregulatedCount = countDysregulatedHormones(avgHormones, user.age, user.gender);
  if (dysregulatedCount >= 2) {
    ageAdjustment += 1; // +1 year if 2+ hormones severely off
  }
  
  // Calculate final BioAge
  const bioAge = chronologicalAge + ageAdjustment;
  
  // Constraints: ±15 years max
  const constrainedBioAge = Math.max(
    chronologicalAge - 15,
    Math.min(bioAge, chronologicalAge + 15)
  );
  
  // Calculate confidence based on test count
  const confidence = calculateBioAgeConfidence(user.tests.length);
  
  // Calculate percentile ranking
  const percentile = calculatePercentileRanking(
    chronologicalAge - constrainedBioAge,
    user.age,
    user.gender
  );
  
  return {
    bioAge: Math.round(constrainedBioAge),
    chronologicalAge,
    yearsDifference: Math.round(chronologicalAge - constrainedBioAge),
    confidence,
    percentile,
    breakdown: {
      cortisol: cortisolAdjustment,
      testosterone: testosteroneAdjustment,
      progesterone: user.gender === 'female' ? progesteroneAdjustment : null,
      consistency: hasHighTestingConsistency(user.tests, 4) ? -1 : 0,
      optimization: allHormonesOptimal(avgHormones, user.age, user.gender) ? -1 : 0
    }
  };
}

// Cortisol evaluation uses age-specific ranges from research
function evaluateCortisolForBioAge(cortisol, age, gender, tests) {
  const optimalRange = getOptimalCortisolForAge(age, gender);
  const [min, max] = optimalRange;
  
  let score = 0;
  
  // Step 1: Compare to age-appropriate optimal range
  if (cortisol >= min && cortisol <= max) {
    score += 0; // Optimal
  } else if (cortisol > max) {
    const percentAbove = ((cortisol - max) / max) * 100;
    if (percentAbove > 50) score += 2;
    else if (percentAbove > 30) score += 1;
    else score += 0.5;
  } else if (cortisol < min) {
    score += 0.5; // Slightly concerning
  }
  
  // Step 2: Consistency score
  const testsInOptimal = tests.filter(t => 
    t.cortisol >= min && t.cortisol <= max
  ).length;
  const percentInOptimal = testsInOptimal / tests.length;
  
  if (percentInOptimal >= 0.8 && tests.length >= 12) {
    score -= 1; // Excellent consistency
  } else if (percentInOptimal < 0.4) {
    score += 1; // Poor consistency
  }
  
  return score; // Range: -1 to +3
}

// Testosterone evaluation (gender-specific)
function evaluateTestosteroneForBioAge(testosterone, age, gender, tests) {
  if (!testosterone) return 0;
  
  const percentileRank = getTestosteronePercentileForAge(testosterone, age, gender);
  
  if (gender === 'male') {
    if (percentileRank >= 70) return -1.5; // Top 30%
    else if (percentileRank >= 30) return 0; // Normal
    else if (percentileRank >= 10) return 1; // Bottom 30%
    else return 2; // Very low
  } else { // female
    const optimalRange = getOptimalTestosteroneForAge(age, gender);
    const [min, max] = optimalRange;
    
    if (testosterone >= min && testosterone <= max) return 0;
    else if (testosterone < min * 0.8) return 1;
    else if (testosterone < min * 0.6) return 1.5;
    else return 0.5;
  }
}

function calculateBioAgeConfidence(testCount) {
  if (testCount < 3) return 0;
  if (testCount >= 12) return 100;
  
  // Linear scale from 3 to 12 tests
  // 3 tests = ~33% confidence
  // 6 tests = ~66% confidence
  // 12 tests = 100% confidence
  return Math.round(((testCount - 3) / (12 - 3)) * 100);
}

function calculatePercentileRanking(yearsDifference, age, gender) {
  // Based on normal distribution
  // Mean = 0 years difference, SD = 5 years
  
  if (yearsDifference >= 12) return 98; // Top 2%
  if (yearsDifference >= 8) return 90; // Top 10%
  if (yearsDifference >= 5) return 75; // Top 25%
  if (yearsDifference >= 2) return 60;
  if (yearsDifference >= -2) return 50; // Average
  if (yearsDifference >= -5) return 25; // Bottom 25%
  if (yearsDifference >= -8) return 10; // Bottom 10%
  return 2; // Bottom 2%
}
```

**Hormone Reference Ranges (from research):**
```javascript
// Morning Cortisol (8 AM, ng/mL) - from Bioageinfo.md
const CORTISOL_RANGES = {
  male: {
    '20-30': [8, 20],
    '31-40': [8, 18],
    '41-50': [8, 16],
    '51-60': [9, 19],
    '61-70': [10, 22],
    '71+': [11, 25]
  },
  female: {
    '20-30': [7, 18],
    '31-40': [7, 17],
    '41-50': [7, 15],
    '51-60': [8, 18],
    '61-70': [9, 21],
    '71+': [10, 24]
  }
};

// Testosterone (ng/dL)
const TESTOSTERONE_RANGES = {
  male: {
    '18-35': [500, 900],
    '36-45': [400, 800],
    '46-55': [350, 700],
    '56-65': [300, 600],
    '66+': [250, 550]
  },
  female: {
    '18-35': [35, 70],
    '36-45': [30, 60],
    '46-55': [25, 55],
    '56+': [15, 40]
  }
};

// Progesterone (pg/mL) - females only
const PROGESTERONE_RANGES = {
  female: {
    follicular: [50, 80],
    luteal: [100, 130], // Peak at ages 25-39
    postmenopausal: [50, 60]
  },
  male: [20, 30] // Low, stable
};
```

**Display Format:**
```
🎉 BIOAGE UNLOCKED!

Your BioAge: 28
Your Age: 35
You're 7 years younger biologically! 🎉

Confidence: 100% ✅
You rank in top 22% of men age 30-40

BREAKDOWN:
✓ Cortisol: -1 year (excellent management)
✓ Testosterone: -2 years (top 30% for your age)
✓ Consistency: -1 year (testing 3x/week)
✓ Optimization: -1 year (all hormones optimal)

WHAT THIS MEANS:
Based on your hormone levels, you have the biological 
markers of someone 7 years younger. Keep doing what 
you're doing! 💪
```

**Social Sharing:**
- Generate shareable image card
- Pre-filled social post: "Just found out I'm biologically 28 despite being 35. Optimizing hormones with @HormoIQ"
- Blur actual numbers (privacy), show only BioAge
- Referral code embedded in share

**Update Frequency:**
- Recalculates after each test
- Only notifies user if change ≥1 year
- Major changes (≥2 years): Push notification

---

## DATABASE SCHEMA (Supabase)

```sql
-- Users table (for future auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Hormone tests table
CREATE TABLE hormone_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Hormone values
  cortisol DECIMAL(4,1), -- ng/mL (e.g., 16.2)
  testosterone DECIMAL(5,1), -- ng/dL (e.g., 720.5)
  progesterone DECIMAL(4,1), -- ng/mL (e.g., 12.3)
  
  -- Context data
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  exercise_today BOOLEAN DEFAULT FALSE,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  
  -- Tags and notes
  supplements_taken TEXT[], -- Array of supplement names
  notes TEXT,
  
  -- Metadata
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ready scores table
CREATE TABLE ready_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
  calculated_at TIMESTAMP DEFAULT NOW(),
  based_on_test_id UUID REFERENCES hormone_tests(id)
);

-- BioAge calculations table
CREATE TABLE bioage_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chronological_age INTEGER,
  biological_age INTEGER,
  years_difference INTEGER,
  confidence INTEGER,
  percentile INTEGER,
  breakdown JSONB, -- Detailed breakdown of score components
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- AI conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB, -- Array of {role, content, timestamp}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplements/experiments table
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('supplement', 'habit', 'exercise', 'diet', 'other')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  hypothesis TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impact analysis results (cached)
CREATE TABLE impact_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  hormone TEXT NOT NULL,
  avg_without DECIMAL(6,2),
  avg_with DECIMAL(6,2),
  percent_change DECIMAL(5,2),
  p_value DECIMAL(4,3),
  is_significant BOOLEAN,
  sample_size_with INTEGER,
  sample_size_without INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tests_user_date ON hormone_tests(user_id, test_date DESC);
CREATE INDEX idx_tests_user_cortisol ON hormone_tests(user_id, cortisol);
CREATE INDEX idx_ready_scores_user ON ready_scores(user_id, calculated_at DESC);
CREATE INDEX idx_bioage_user ON bioage_calculations(user_id, calculated_at DESC);
CREATE INDEX idx_conversations_user ON ai_conversations(user_id, updated_at DESC);
```

---

## DEVELOPMENT PHASES

### PHASE 1: MVP (Weeks 1-4)
**Goal:** Core data collection + basic insights

**Features:**
1. ✅ Expo app setup + Supabase integration (DONE)
2. TEST™ feature
   - Manual hormone input UI
   - Context tagging
   - Data persistence to Supabase
   - Basic validation
3. READYSCORE™ feature
   - Algorithm implementation
   - Home screen display
   - Confidence indicator
4. Basic data visualization
   - Test history list
   - Simple line charts

**Success Criteria:**
- User can log test in <2 minutes
- ReadyScore displays correctly
- Data persists reliably
- App doesn't crash

---

### PHASE 2: Intelligence Layer (Weeks 5-8)
**Goal:** Add AI + advanced analytics

**Features:**
1. ASK™ AI Coach
   - OpenAI integration
   - Conversation UI
   - Context building from user data
2. IMPACT™ Analysis
   - Correlation algorithm
   - Before/after comparisons
   - ROI calculator
3. Enhanced TEST™
   - Better insights
   - Pattern detection
   - Streak mechanics

**Success Criteria:**
- AI responds coherently with user's data
- Impact analyses are actionable
- Users engage with AI 2-3x/week

---

### PHASE 3: Viral Features (Weeks 9-12)
**Goal:** Drive retention + growth

**Features:**
1. BIOAGE™ Calculator
   - Full algorithm
   - Percentile rankings
   - Social sharing cards
2. Push notifications
   - Daily ReadyScore reminder
   - Test reminders (3x/week)
   - Pattern alerts
3. Onboarding flow
   - User profile setup
   - Initial goals
   - Tutorial

**Success Criteria:**
- BioAge shares drive referrals
- D7 retention >40%
- D30 retention >25%

---

### PHASE 4: Scale & Polish (Weeks 13-16)
**Goal:** Production-ready

**Features:**
1. Authentication system
   - Supabase Auth
   - Email verification
   - Password reset
2. Roboflow camera scanning
   - Replace manual input
   - OCR for test results
   - Validation
3. Performance optimization
   - Caching
   - Lazy loading
   - Animation polish
4. Analytics tracking
   - User events
   - Retention metrics
   - Feature usage

**Success Criteria:**
- Camera scanning >90% accuracy
- App feels fast and polished
- Ready for TestFlight/beta

---

## UI/UX DESIGN PRINCIPLES

### Brand Personality
- **Clinical but approachable:** Scientific accuracy with plain-English explanations
- **Empowering, not anxious:** Frame insights as opportunities, not problems
- **Data-driven optimist:** "Here's what works for YOU"

### Visual Design
- **Color palette:**
  - Primary: Blue (#3b82f6) - Trust, science
  - Success: Green (#22c55e) - Optimal
  - Warning: Orange (#f59e0b) - Caution
  - Alert: Red (#ef4444) - Attention needed
  - Background: Light gray (#f5f5f5)
  
- **Typography:**
  - Headers: Bold, large, clear hierarchy
  - Body: 16px+, high readability
  - Data: Monospace for numbers
  
- **Components:**
  - Large tap targets (minimum 44x44pt)
  - Clear visual feedback
  - Smooth animations (spring physics)
  - Dark mode support (future)

### Interaction Patterns
- **Pull-to-refresh:** Update scores/data
- **Swipe:** Navigate between features
- **Long-press:** Additional options
- **Haptic feedback:** Confirm actions
- **Skeleton screens:** While loading

---

## ANALYTICS & METRICS

### Key Performance Indicators (KPIs)

**Retention:**
- D1: 60%+
- D7: 40%+
- D30: 25%+
- D90: 15%+

**Engagement:**
- Tests per user per month: 10+ (ideal: 12)
- ReadyScore checks per week: 5+ (daily habit)
- AI questions per user per month: 5+
- Time in app per session: 3-5 minutes

**Feature Usage:**
- TEST™: 100% (required)
- READYSCORE™: 90%+ daily check
- ASK™: 60%+ use within first 30 days
- IMPACT™: 40%+ unlock and use
- BIOAGE™: 70%+ share after unlock

**Growth:**
- Viral coefficient: 0.3+ (from BioAge shares)
- Referral rate: 20%+ of users refer 1+ friend
- App store rating: 4.5+ stars

**Business:**
- Physical kit → app activation: 80%+
- Upgrade to Pro (future): 15%+
- Customer lifetime value: 6+ months active

### Tracking Events

```javascript
// Key events to track
const EVENTS = {
  // Onboarding
  'app_opened_first_time': {},
  'profile_completed': { age, gender },
  
  // Core actions
  'test_logged': { hormones, time_taken, context_added },
  'ready_score_viewed': { score, confidence },
  'ai_question_asked': { category, satisfied },
  'impact_unlocked': {},
  'bioage_unlocked': { years_difference, percentile },
  
  // Engagement
  'daily_streak': { days },
  'test_reminder_accepted': {},
  'pattern_alert_viewed': {},
  
  // Social
  'bioage_shared': { platform },
  'referral_sent': {},
  
  // Churn signals
  'days_since_last_test': { days },
  'low_ready_score_3_consecutive': {}
};
```

---

## TECHNICAL CONSIDERATIONS

### Performance
- **Target:** 60fps animations, <2s load time
- **Optimization:**
  - Lazy load heavy components
  - Memoize expensive calculations
  - Cache API responses locally
  - Use React.memo for static components

### Offline Support
- **Core functionality works offline:**
  - Log tests (sync later)
  - View cached ReadyScore
  - Read conversation history
- **Requires online:**
  - AI coach queries
  - Impact analysis calculations
  - BioAge updates

### Security
- **Data encryption:**
  - All hormone data encrypted at rest (Supabase)
  - TLS for all network requests
- **Privacy:**
  - No PII in analytics
  - Anonymized aggregate data only
  - User can delete all data
- **API keys:**
  - Never hardcode in client (use env vars)
  - Rotate regularly
  - Monitor usage

### Scalability
- **Database:**
  - Indexed queries
  - Partitioning for large datasets
  - Archive old data (>2 years)
- **AI costs:**
  - Cache common Q&A
  - Rate limit per user
  - Use GPT-3.5 for simple queries, GPT-4 for complex

---

## FUTURE ENHANCEMENTS (Post-MVP)

### Phase 5+
1. **Community features:**
   - Anonymous leaderboards
   - Success stories
   - Challenges/competitions

2. **Advanced analytics:**
   - Predictive modeling
   - Optimal testing windows
   - Goal tracking

3. **Integrations:**
   - Apple Health
   - Oura Ring
   - Whoop
   - MyFitnessPal

4. **Personalization:**
   - Custom ranges
   - Goal setting
   - Progress photos

5. **E-commerce:**
   - In-app test kit purchase
   - Recommended supplements
   - Affiliate partnerships

---

## SUCCESS CRITERIA

**This PRD is successful if:**

1. ✅ Every team member can reference this doc and know exactly what to build
2. ✅ 95% of feature decisions can be made without asking "what should this do?"
3. ✅ Technical implementation is clear and unambiguous
4. ✅ Success metrics are measurable and tracked
5. ✅ The 5 core features drive the retention targets (40% D7, 25% D30)

**Golden Rule Compliance:**
- All specifications detailed enough for 95% confidence
- Ambiguities resolved with research data (Bioageinfo.md)
- Technical requirements clearly defined
- User experience flows mapped completely

---

## APPENDIX

### Glossary
- **ReadyScore:** 0-100 daily readiness score
- **BioAge:** Biological age vs chronological age
- **Impact:** Correlation analysis of supplements/habits
- **Saliva test:** Physical test strip for hormone measurement
- **ng/mL:** Nanograms per milliliter (cortisol, progesterone)
- **ng/dL:** Nanograms per deciliter (testosterone)
- **pg/mL:** Picograms per milliliter (progesterone alternate unit)

### References
- Bioageinfo.md (comprehensive hormone research)
- OpenAI API documentation
- Supabase documentation
- React Native best practices
- Expo guidelines

---

**DOCUMENT CONTROL**

Created: November 10, 2025  
Author: Product Team  
Reviewers: Engineering, Design, Business  
Next Review: After Phase 1 completion  
Status: **ACTIVE - REFERENCE FOR ALL DEVELOPMENT**

---

**END OF PRD**

