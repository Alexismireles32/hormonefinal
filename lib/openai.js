// OpenAI Integration for ASK™ AI Hormone Coach
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Generate system prompt for wellness-focused AI coach
 * CRITICAL: Must stay within general wellness category (non-FDA)
 */
const generateSystemPrompt = (userContext) => {
  const { recentTests, testCount, patterns, supplements } = userContext;
  
  return `You are a knowledgeable wellness coach specializing in hormone optimization insights. You help users understand their personal hormone tracking data and provide general wellness guidance.

CRITICAL COMPLIANCE GUIDELINES:
- You provide GENERAL WELLNESS information only (NOT medical advice)
- You NEVER diagnose medical conditions or diseases
- You NEVER prescribe treatments or medications
- You NEVER replace professional medical care
- Always recommend consulting healthcare providers for medical concerns
- Frame insights as "data suggests" or "patterns indicate" (not definitive)
- Focus on lifestyle, nutrition, stress management, exercise, and sleep
- Stay in general wellness territory at all times

USER'S HORMONE DATA:
- Total tests logged: ${testCount}
- Recent hormone levels:
${formatRecentTests(recentTests)}

OBSERVED PATTERNS:
${formatPatterns(patterns)}

SUPPLEMENTS/HABITS TRACKED:
${formatSupplements(supplements)}

YOUR ROLE:
1. Help users understand THEIR specific hormone patterns
2. Provide personalized wellness insights based on THEIR data
3. Suggest lifestyle optimizations (sleep, exercise, stress, nutrition)
4. Explain hormone fluctuations in plain English
5. Offer context from population data ("people in your age group typically...")
6. Celebrate wins and provide encouragement
7. Flag concerning patterns and suggest seeing a doctor (wellness perspective)

RESPONSE STYLE:
- Conversational and friendly, but professional
- Use short paragraphs (2-3 sentences max)
- Include relevant emoji when natural (not excessive)
- Reference their specific numbers and dates
- Provide actionable wellness tips
- Be encouraging and supportive

RESPONSE LENGTH:
- Keep responses concise (3-5 paragraphs max)
- Get to the point quickly
- Use bullet points for lists

WELLNESS FOCUS EXAMPLES:
✅ "Your cortisol pattern suggests high stress. Consider meditation or deep breathing."
✅ "This testosterone level is common for your age. Strength training may help."
✅ "Your data shows better results after 8+ hours sleep. Prioritize rest."
❌ "You have adrenal fatigue." (diagnosis)
❌ "Take this medication." (prescription)
❌ "You don't need to see a doctor." (medical advice)

Remember: You're a wellness insights tool, not a medical professional. Always stay in general wellness territory.`;
};

/**
 * Format recent tests for context
 */
const formatRecentTests = (tests) => {
  if (!tests || tests.length === 0) {
    return '- No recent tests available';
  }
  
  return tests.slice(0, 5).map(test => {
    const date = new Date(test.test_date).toLocaleDateString();
    const hormones = [];
    if (test.cortisol) hormones.push(`Cortisol: ${test.cortisol} ng/mL`);
    if (test.testosterone) hormones.push(`Testosterone: ${test.testosterone} ng/dL`);
    if (test.progesterone) hormones.push(`Progesterone: ${test.progesterone} ng/mL`);
    
    return `- ${date}: ${hormones.join(', ')} (${test.time_of_day})`;
  }).join('\n');
};

/**
 * Format patterns for context
 */
const formatPatterns = (patterns) => {
  if (!patterns || patterns.length === 0) {
    return '- Not enough data yet to identify clear patterns';
  }
  
  return patterns.map(p => `- ${p}`).join('\n');
};

/**
 * Format supplements for context
 */
const formatSupplements = (supplements) => {
  if (!supplements || supplements.length === 0) {
    return '- No supplements currently tracked';
  }
  
  return supplements.map(s => `- ${s}`).join('\n');
};

/**
 * Ask the AI coach a question
 * @param {string} userMessage - User's question
 * @param {object} userContext - User's hormone data and patterns
 * @param {array} conversationHistory - Previous messages
 * @returns {object} { answer, suggestedQuestions }
 */
export const askHormoneCoach = async (userMessage, userContext, conversationHistory = []) => {
  try {
    const systemPrompt = generateSystemPrompt(userContext);
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
    
    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });
    
    const answer = response.choices[0].message.content;
    
    // Generate suggested follow-up questions
    const suggestedQuestions = await generateSuggestedQuestions(
      userMessage,
      answer,
      userContext
    );
    
    return {
      answer,
      suggestedQuestions,
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error asking hormone coach:', error);
    throw error;
  }
};

/**
 * Generate 3 suggested follow-up questions (Perplexity style)
 * @returns {array} Array of 3 suggested questions
 */
const generateSuggestedQuestions = async (userQuestion, aiAnswer, userContext) => {
  try {
    const prompt = `Based on this conversation about hormone wellness:

User asked: "${userQuestion}"
AI answered: "${aiAnswer}"

User has ${userContext.testCount} hormone tests logged.

Generate 3 natural follow-up questions the user might ask. Make them:
1. Specific to their data and situation
2. Actionable and practical
3. Focused on general wellness (lifestyle, habits, optimization)
4. Short and clear (5-10 words each)

Return ONLY the 3 questions, one per line, no numbering or bullets.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 150,
    });
    
    const questionsText = response.choices[0].message.content.trim();
    const questions = questionsText
      .split('\n')
      .filter(q => q.trim())
      .slice(0, 3);
    
    return questions.length === 3 ? questions : [
      'What can I do to optimize my hormone levels?',
      'How does sleep affect my results?',
      'When is the best time to test?',
    ];
  } catch (error) {
    console.error('Error generating suggested questions:', error);
    return [
      'What can I do to optimize my hormone levels?',
      'How does sleep affect my results?',
      'When is the best time to test?',
    ];
  }
};

/**
 * Get starter questions for first-time users
 */
export const getStarterQuestions = (userContext) => {
  const { testCount } = userContext;
  
  if (testCount === 0) {
    return [
      'What hormones should I test first?',
      'What do cortisol levels tell me?',
      'How often should I test?',
    ];
  } else if (testCount < 5) {
    return [
      'What do my recent results mean?',
      'Is my cortisol level normal?',
      'How can I improve my testosterone?',
    ];
  } else {
    return [
      'What patterns do you see in my data?',
      'Which supplements might help me?',
      'How do I compare to others my age?',
    ];
  }
};

