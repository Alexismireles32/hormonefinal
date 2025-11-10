// ASK™ Screen - AI Hormone Coach (Perplexity-style UI)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { askHormoneCoach, getStarterQuestions } from '../lib/openai';
import { getUserContextForAI, saveConversation } from '../utils/aiDatabase';

export default function AskScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    const context = await getUserContextForAI();
    setUserContext(context);
    
    // Set initial suggested questions
    if (context) {
      setSuggestedQuestions(getStarterQuestions(context));
    }
  };

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || loading) return;
    
    const userMessage = messageText.trim();
    setInputText('');
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: Date.now() },
    ];
    setMessages(newMessages);
    setSuggestedQuestions([]);
    
    setLoading(true);
    
    try {
      // Build conversation history for OpenAI
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      // Get AI response
      const { answer, suggestedQuestions: newSuggestions } = await askHormoneCoach(
        userMessage,
        userContext,
        conversationHistory
      );
      
      // Add AI response
      const updatedMessages = [
        ...newMessages,
        { role: 'assistant', content: answer, timestamp: Date.now() },
      ];
      setMessages(updatedMessages);
      setSuggestedQuestions(newSuggestions);
      
      // Save conversation
      try {
        await saveConversation(updatedMessages);
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.', 
          timestamp: Date.now() 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputText(question);
    handleSendMessage(question);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ask™</Text>
          <View style={styles.backButton} />
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>🤖</Text>
              <Text style={styles.welcomeTitle}>AI Hormone Coach</Text>
              <Text style={styles.welcomeText}>
                Ask me anything about your hormone data, patterns, and wellness optimization.
              </Text>
              
              {userContext && userContext.testCount > 0 && (
                <View style={styles.contextBadge}>
                  <Text style={styles.contextText}>
                    📊 I have access to your {userContext.testCount} tests
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <View key={index}>
              {message.role === 'user' ? (
                <View style={styles.userMessageContainer}>
                  <View style={styles.userMessage}>
                    <Text style={styles.userMessageText}>{message.content}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.aiMessageContainer}>
                  <View style={styles.aiMessage}>
                    <Text style={styles.aiMessageText}>{message.content}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.aiMessageContainer}>
              <View style={styles.aiMessage}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay1]} />
                  <View style={[styles.typingDot, styles.typingDotDelay2]} />
                </View>
              </View>
            </View>
          )}

          {/* Suggested Questions */}
          {!loading && suggestedQuestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggested questions:</Text>
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestedQuestion(question)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{question}</Text>
                  <Text style={styles.suggestionArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your hormones..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  // Welcome
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: SPACING.lg,
  },
  contextBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  contextText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.medium,
  },
  // Messages
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.white,
    lineHeight: 22,
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  aiMessage: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: '85%',
    ...SHADOWS.sm,
  },
  aiMessageText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textTertiary,
    opacity: 0.6,
  },
  typingDotDelay1: {
    animationDelay: '0.2s',
  },
  typingDotDelay2: {
    animationDelay: '0.4s',
  },
  // Suggestions
  suggestionsContainer: {
    marginTop: SPACING.md,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  suggestionArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.bold,
  },
});

