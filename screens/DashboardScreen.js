// Dashboard Screen - Complete Redesign Based on homepage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, 
  TouchableOpacity, Dimensions, Animated 
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import Avatar from '../components/Avatar';
import { getHormoneTests, getTestCount } from '../utils/database';
import { calculateAllReadyScores } from '../utils/readyScoreDatabase';
import { calculateStreak } from '../utils/streak';
import { getUserProfile } from '../utils/userProfile';
import { calculateAndSaveBioAge } from '../utils/bioageDatabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [testCount, setTestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readyScores, setReadyScores] = useState([]);
  const [streak, setStreak] = useState(0);
  const [recentTests, setRecentTests] = useState([]);
  const [userName, setUserName] = useState('User');
  const [bioAgeData, setBioAgeData] = useState(null);
  
  // Animated gradient for Ask card
  const gradientAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    // Start gradient animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnimation, {
          toValue: 1,
          duration: 7500,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnimation, {
          toValue: 0,
          duration: 7500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboard();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profile = await getUserProfile();
      setUserName(profile.name || 'User');
      
      // Load test count
      const count = await getTestCount();
      setTestCount(count);
      
      // Load recent tests
      const tests = await getHormoneTests();
      setRecentTests(tests.slice(0, 5));
      
      // Load ReadyScores
      if (count > 0) {
        const scores = await calculateAllReadyScores();
        setReadyScores(scores);
      }
      
      // Load streak
      if (tests.length > 0) {
        const streakData = calculateStreak(tests);
        setStreak(streakData.currentStreak || 0);
      }

      // Load BioAge
      if (count >= 3) {
        const profile = await getUserProfile();
        if (profile.age && profile.gender) {
          const bioAge = await calculateAndSaveBioAge(profile);
          setBioAgeData(bioAge);
        }
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleAddTest = () => {
    navigation.navigate('SelectHormone');
  };

  // Get scores
  const primaryScore = readyScores.find(s => s.category === 'overall');
  const physicalScore = readyScores.find(s => s.category === 'physical');
  const mentalScore = readyScores.find(s => s.category === 'mental');

  // Calculate unlock progress
  const impactLocked = testCount < 15;
  const bioAgeLocked = testCount < 3;
  const impactRemaining = Math.max(0, 15 - testCount);
  const bioAgeRemaining = Math.max(0, 3 - testCount);

  // Calculate completed tests today (mock for now)
  const completedToday = testCount > 0 ? Math.min(testCount, 12) : 0;

  return (
    <View style={styles.container}>
      {/* Decorative Blur Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
      <View style={styles.decorativeCircle4} />
      <View style={styles.decorativeCircle5} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{userName}</Text>
          </View>
          <Avatar 
            name={userName}
            size={48}
            gradientColors={COLORS.gradients.hero}
          />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {testCount === 0 ? (
            // Empty State
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🧪</Text>
              <Text style={styles.emptyTitle}>No Tests Yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button below to log your first hormone test
              </Text>
            </View>
          ) : (
            <>
              {/* ReadyScore Card with Circular Progress */}
              <View style={styles.readyScoreCard}>
                <View style={styles.readyScoreHeader}>
                  <Text style={styles.readyScoreTitle}>ReadyScore™</Text>
                  <Text style={styles.sparkleIcon}>✨</Text>
                </View>

                <View style={styles.readyScoreMain}>
                  {/* Circular Progress */}
                  <View style={styles.circularProgress}>
                    <Svg width={120} height={120} viewBox="0 0 120 120">
                      {/* Background circle */}
                      <Circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#f0f0f0"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <Circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={COLORS.black}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(primaryScore?.score || 0) / 100 * 314} 314`}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="60, 60"
                      />
                    </Svg>
                    <View style={styles.scoreCenter}>
                      <Text style={styles.scoreValue}>{Math.round(primaryScore?.score || 0)}</Text>
                      <Text style={styles.scoreMax}>out of 100</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.scoreDescription}>
                    <Text style={styles.scoreMessage}>
                      {primaryScore?.explanation || 'Your body is performing well today. Keep up the good habits!'}
                    </Text>
                    <Text style={styles.scoreUpdated}>Updated recently</Text>
                  </View>
                </View>

                {/* Score Breakdown - Mini Cards */}
                <View style={styles.scoreBreakdown}>
                  {/* Physical */}
                  <LinearGradient
                    colors={['#DCFCE7', '#BBF7D0']}
                    style={styles.miniScoreCard}
                  >
                    <Text style={styles.miniScoreLabel}>Physical</Text>
                    <Text style={styles.miniScoreValue}>{Math.round(physicalScore?.score || 0)}</Text>
                    <Text style={styles.miniScoreMax}>/100</Text>
                  </LinearGradient>

                  {/* Mental */}
                  <LinearGradient
                    colors={['#F3E8FF', '#E9D5FF']}
                    style={styles.miniScoreCard}
                  >
                    <Text style={styles.miniScoreLabel}>Emotional</Text>
                    <Text style={styles.miniScoreValue}>{Math.round(mentalScore?.score || 0)}</Text>
                    <Text style={styles.miniScoreMax}>/100</Text>
                  </LinearGradient>

                  {/* Streak */}
                  <LinearGradient
                    colors={['#DBEAFE', '#BFDBFE']}
                    style={styles.miniScoreCard}
                  >
                    <Text style={styles.miniScoreLabel}>Intellectual</Text>
                    <Text style={styles.miniScoreValue}>{Math.round((primaryScore?.score || 0) * 0.85)}</Text>
                    <Text style={styles.miniScoreMax}>/100</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Ask Chatbot Preview - Animated Gradient */}
              <TouchableOpacity 
                style={styles.askCard}
                onPress={() => navigation.navigate('Ask')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#DBEAFE', '#F3E8FF', '#FCE7F3']}
                  style={styles.askGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.askContent}>
                    <View style={styles.askHeader}>
                      <View style={styles.askIconCircle}>
                        <Text style={styles.askIcon}>💬</Text>
                      </View>
                      <Text style={styles.askTitle}>Ask anything</Text>
                    </View>
                    <Text style={styles.askDescription}>
                      Get personalized insights about your hormones and wellness
                    </Text>
                    <View style={styles.askPreview}>
                      <Text style={styles.askPreviewText}>
                        "How can I improve my cortisol levels?"
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Hormonal Age Section */}
              {!bioAgeLocked && bioAgeData && (
                <TouchableOpacity 
                  style={styles.bioAgeCard}
                  onPress={() => navigation.navigate('BioAge')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.bioAgeTitle}>Hormonal Age</Text>
                  <View style={styles.bioAgeMain}>
                    <View>
                      <Text style={styles.bioAgeValue}>{Math.round(bioAgeData.bioAge)}</Text>
                      <Text style={styles.bioAgeLabel}>years old</Text>
                    </View>
                    <View style={styles.bioAgeDiff}>
                      <Text style={[
                        styles.bioAgeDiffValue, 
                        bioAgeData.difference < 0 ? styles.bioAgeDiffPositive : styles.bioAgeDiffNegative
                      ]}>
                        {bioAgeData.difference > 0 ? '+' : ''}{Math.round(bioAgeData.difference)}
                      </Text>
                      <Text style={styles.bioAgeDiffLabel}>vs chronological</Text>
                    </View>
                  </View>
                  <View style={styles.bioAgeProgress}>
                    <View style={styles.bioAgeProgressInfo}>
                      <Text style={styles.bioAgeProgressLabel}>Optimal range</Text>
                      <Text style={styles.bioAgeProgressRange}>
                        {bioAgeData.optimalRange?.min || 20}-{bioAgeData.optimalRange?.max || 30} years
                      </Text>
                    </View>
                    <View style={styles.bioAgeProgressBar}>
                      <View style={[
                        styles.bioAgeProgressFill, 
                        { width: `${Math.min(100, bioAgeData.percentile || 65)}%` }
                      ]} />
                    </View>
                  </View>
                  <Text style={styles.bioAgeFooter}>
                    {bioAgeData.interpretation || 
                     `Your hormonal profile suggests your body is functioning ${Math.abs(Math.round(bioAgeData.difference))} years ${bioAgeData.difference < 0 ? 'younger' : 'older'} than your actual age.`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Today's Progress Section */}
              <View style={styles.impactCard}>
                <View style={styles.impactHeader}>
                  <Text style={styles.impactTitle}>Today's Progress</Text>
                  <Text style={styles.impactProgress}>{completedToday}/12 tests</Text>
                </View>
                <Text style={styles.impactDescription}>
                  Track your testing journey to unlock all features
                </Text>

                {/* Progress Items */}
                <View style={styles.impactItems}>
                  {/* Test Entry */}
                  <TouchableOpacity 
                    style={styles.impactItem}
                    onPress={() => navigation.navigate('SelectHormone')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#EDE9FE', '#DDD6FE']}
                      style={styles.impactIconGradient}
                    >
                      <Text style={styles.impactIconText}>🧪</Text>
                    </LinearGradient>
                    <View style={styles.impactInfo}>
                      <View style={styles.impactTitleRow}>
                        <Text style={styles.impactItemTitle}>Hormone Test</Text>
                        {testCount > 0 && <Text style={styles.impactCheck}>✓</Text>}
                      </View>
                      <Text style={styles.impactItemSubtitle}>
                        {testCount > 0 ? `${testCount} tests completed` : 'Add your first test'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* ReadyScore */}
                  <TouchableOpacity 
                    style={styles.impactItem}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#DCFCE7', '#BBF7D0']}
                      style={styles.impactIconGradient}
                    >
                      <Text style={styles.impactIconText}>⚡</Text>
                    </LinearGradient>
                    <View style={styles.impactInfo}>
                      <View style={styles.impactTitleRow}>
                        <Text style={styles.impactItemTitle}>ReadyScore™</Text>
                        {testCount > 0 && <Text style={styles.impactCheck}>✓</Text>}
                      </View>
                      <Text style={styles.impactItemSubtitle}>
                        {testCount > 0 ? `${Math.round(primaryScore?.confidence || 0)}% confidence` : 'Complete a test to unlock'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Impact */}
                  <TouchableOpacity 
                    style={[styles.impactItem, impactLocked && styles.impactItemLocked]}
                    onPress={() => !impactLocked && navigation.navigate('Impact')}
                    disabled={impactLocked}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={impactLocked ? ['#F3F4F6', '#E5E7EB'] : ['#FED7AA', '#FDBA74']}
                      style={styles.impactIconGradient}
                    >
                      <Text style={styles.impactIconText}>{impactLocked ? '🔒' : '💊'}</Text>
                    </LinearGradient>
                    <View style={styles.impactInfo}>
                      <View style={styles.impactTitleRow}>
                        <Text style={styles.impactItemTitle}>Impact™</Text>
                        {!impactLocked && <Text style={styles.impactCheck}>✓</Text>}
                      </View>
                      <Text style={styles.impactItemSubtitle}>
                        {impactLocked ? `${impactRemaining} tests left` : 'What works for you'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* BioAge */}
                  <TouchableOpacity 
                    style={[styles.impactItem, bioAgeLocked && styles.impactItemLocked]}
                    onPress={() => !bioAgeLocked && navigation.navigate('BioAge')}
                    disabled={bioAgeLocked}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={bioAgeLocked ? ['#F3F4F6', '#E5E7EB'] : ['#BFDBFE', '#93C5FD']}
                      style={styles.impactIconGradient}
                    >
                      <Text style={styles.impactIconText}>{bioAgeLocked ? '🔒' : '🧬'}</Text>
                    </LinearGradient>
                    <View style={styles.impactInfo}>
                      <View style={styles.impactTitleRow}>
                        <Text style={styles.impactItemTitle}>BioAge™</Text>
                        {!bioAgeLocked && <Text style={styles.impactCheck}>✓</Text>}
                      </View>
                      <Text style={styles.impactItemSubtitle}>
                        {bioAgeLocked ? `${bioAgeRemaining} tests left` : 'Your hormone age'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Streak */}
                  <TouchableOpacity 
                    style={styles.impactItem}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FCE7F3', '#FBCFE8']}
                      style={styles.impactIconGradient}
                    >
                      <Text style={styles.impactIconText}>🔥</Text>
                    </LinearGradient>
                    <View style={styles.impactInfo}>
                      <View style={styles.impactTitleRow}>
                        <Text style={styles.impactItemTitle}>Streak</Text>
                        {streak > 0 && <Text style={styles.impactCheck}>✓</Text>}
                      </View>
                      <Text style={styles.impactItemSubtitle}>
                        {streak > 0 ? `${streak} day streak` : 'Start your streak'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {}}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.fabButton}
            onPress={handleAddTest}
            activeOpacity={0.85}
          >
            <View style={styles.fabCircle}>
              <Text style={styles.fabIcon}>+</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Impact')}
          >
            <Text style={styles.navIcon}>📋</Text>
            <Text style={styles.navLabel}>Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // Decorative Blur Circles
  decorativeCircle1: {
    position: 'absolute',
    top: 80,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDE047',
    opacity: 0.6,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 64,
    right: 96,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#93C5FD',
    opacity: 0.6,
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 128,
    right: 16,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#C4B5FD',
    opacity: 0.6,
  },
  decorativeCircle4: {
    position: 'absolute',
    top: 96,
    right: 160,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#BBF7D0',
    opacity: 0.6,
  },
  decorativeCircle5: {
    position: 'absolute',
    top: 160,
    right: 80,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DDD6FE',
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 10,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  welcomeName: {
    fontSize: 30,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  // ReadyScore Card
  readyScoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  readyScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  readyScoreTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  sparkleIcon: {
    fontSize: 20,
  },
  readyScoreMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  circularProgress: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  scoreCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  scoreMax: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  scoreDescription: {
    flex: 1,
  },
  scoreMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  scoreUpdated: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  miniScoreCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  miniScoreLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  miniScoreValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  miniScoreMax: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  // Ask Card
  askCard: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  askGradient: {
    padding: SPACING.lg,
  },
  askContent: {
    zIndex: 10,
  },
  askHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  askIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  askIcon: {
    fontSize: 20,
  },
  askTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  askDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  askPreview: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  askPreviewText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
  },
  // BioAge Card
  bioAgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  bioAgeTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  bioAgeMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  bioAgeValue: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    lineHeight: 48,
  },
  bioAgeLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  bioAgeDiff: {
    alignItems: 'flex-end',
  },
  bioAgeDiffValue: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.semibold,
  },
  bioAgeDiffPositive: {
    color: COLORS.success,
  },
  bioAgeDiffNegative: {
    color: COLORS.error,
  },
  bioAgeDiffLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  bioAgeProgress: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  bioAgeProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  bioAgeProgressLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  bioAgeProgressRange: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  bioAgeProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  bioAgeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.full,
  },
  bioAgeFooter: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  // Impact Card
  impactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  impactTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  impactProgress: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  impactDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  impactItems: {
    gap: SPACING.sm,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  impactItemLocked: {
    opacity: 0.6,
  },
  impactIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactIconText: {
    fontSize: 20,
  },
  impactInfo: {
    flex: 1,
  },
  impactTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  impactItemTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  impactCheck: {
    fontSize: 18,
    color: COLORS.success,
  },
  impactItemSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    zIndex: 50,
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: TYPOGRAPHY.xs,
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  fabButton: {
    marginTop: -24,
  },
  fabCircle: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.black,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '300',
  },
});
