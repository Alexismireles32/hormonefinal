// Dashboard Screen - Home screen with empty state and floating + button
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import FloatingButton from '../components/FloatingButton';
import Avatar from '../components/Avatar';
import { getHormoneTests, getTestCount } from '../utils/database';
import { calculateAllReadyScores } from '../utils/readyScoreDatabase';
import { calculateStreak, getStreakDisplay, getStreakPercentile } from '../utils/streak';
import { getUserProfile } from '../utils/userProfile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper functions for score coloring
const getScoreColor = (score) => {
  if (score >= 80) return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
  if (score >= 60) return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
  return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Attention';
};

export default function DashboardScreen({ navigation }) {
  const [testCount, setTestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readyScores, setReadyScores] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [lastTestDate, setLastTestDate] = useState(null);
  const [userName, setUserName] = useState('User');
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDashboard();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDashboard = async () => {
    try {
      // Load user profile
      const profile = await getUserProfile();
      if (profile) {
        setUserName(profile.name || 'HormoIQ User');
      }

      const count = await getTestCount();
      setTestCount(count);

      // Calculate all ReadyScores if tests exist
      if (count > 0) {
        const tests = await getHormoneTests();
        const scores = await calculateAllReadyScores();
        setReadyScores(scores);
        setRecentTests(tests.slice(0, 5)); // Store recent tests for mini metrics
        
        if (tests && tests.length > 0) {
          setLastTestDate(tests[0].test_date);
        } else {
          setLastTestDate(null);
        }
        
        // Calculate streak
        const streak = calculateStreak(tests);
        setStreakData(streak);
      } else {
        setReadyScores([]);
        setRecentTests([]);
        setStreakData(null);
        setLastTestDate(null);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  const handleAddTest = () => {
    navigation.navigate('SelectHormone');
  };

  const primaryScore = readyScores.length > 0 ? readyScores[0] : null;
  const secondaryScores = readyScores.filter(score => score.category !== 'overall').slice(0, 2);
  const impactLocked = testCount < 15;
  const impactRemaining = impactLocked ? 15 - testCount : 0;
  const bioAgeLocked = testCount < 10;
  const bioAgeRemaining = bioAgeLocked ? 10 - testCount : 0;
  const streakDetails = streakData ? getStreakDisplay(streakData.streak) : null;
  const daysSinceLast = streakData?.daysSinceLastTest ?? null;
  const formattedLastTest = lastTestDate
    ? new Date(lastTestDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '—';

  const nextUnlockMessage = impactLocked
    ? `${impactRemaining} more test${impactRemaining === 1 ? '' : 's'} to unlock Impact™`
    : bioAgeLocked
    ? `${bioAgeRemaining} more test${bioAgeRemaining === 1 ? '' : 's'} to unlock BioAge™`
    : 'All premium insights unlocked';

  return (
    <LinearGradient colors={COLORS.gradients.background} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Avatar 
                  name={userName}
                  size={48}
                  gradientColors={COLORS.gradients.ring}
                />
                <View>
                  <Text style={styles.greeting}>Hello!</Text>
                  <Text style={styles.appTitle}>Your Dashboard</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('UserProfile', { onboarding: false })}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Settings"
                accessibilityHint="Opens user profile and settings"
              >
                <Text style={styles.settingsIcon}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {testCount === 0 ? (
              // Empty state
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🧪</Text>
                <Text style={styles.emptyTitle}>No Tests Yet</Text>
                <Text style={styles.emptyText}>
                  Tap the + button below to log your first hormone test
                </Text>
              </View>
            ) : (
  {/* Health Score Card - Option 1 Tech Health Design */}
        <View style={styles.healthScoreCard}>
          {/* Header with Title and Status Badge */}
          <View style={styles.healthScoreHeader}>
            <View style={styles.healthScoreTitle}>
              <Text style={styles.activityIcon}>📊</Text>
              <Text style={styles.healthScoreTitleText}>ReadyScore™</Text>
            </View>
            {primaryScore && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: getScoreColor(primaryScore.score).bg }
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  { color: getScoreColor(primaryScore.score).text }
                ]}>
                  {getScoreLabel(primaryScore.score)}
                </Text>
              </View>
            )}
          </View>

          {/* Circular Progress Ring with Score */}
          <View style={styles.circularProgressContainer}>
            {/* Background Ring */}
            <View style={styles.progressRingBackground}>
              {[...Array(40)].map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.progressDot,
                    { 
                      transform: [
                        { rotate: `${i * 9}deg` },
                        { translateY: -85 }
                      ]
                    }
                  ]} 
                />
              ))}
            </View>

            {/* Foreground Ring (Gradient Simulation) */}
            {primaryScore && (
              <View style={styles.progressRingForeground}>
                {[...Array(Math.floor((primaryScore.score / 100) * 40))].map((_, i) => (
                  <LinearGradient
                    key={i}
                    colors={['#A855F7', '#EC4899', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.progressDotActive,
                      { 
                        transform: [
                          { rotate: `${i * 9}deg` },
                          { translateY: -85 }
                        ]
                      }
                    ]} 
                  />
                ))}
              </View>
            )}

            {/* Center Score Display */}
            <View style={styles.centerScoreDisplay}>
              <Text style={styles.centerScoreNumber}>
                {primaryScore ? Math.round(primaryScore.score) : '--'}
              </Text>
              <Text style={styles.centerScoreUnit}>/100</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.healthScoreDescription}>
            {primaryScore?.explanation || 'Log a test to unlock your daily readiness score'}
          </Text>

          {/* Mini Hormone Metrics */}
          {recentTests.length > 0 && (
            <View style={styles.miniMetricsRow}>
              {recentTests[0].cortisol_value && (
                <View style={styles.miniMetricChip}>
                  <Text style={styles.miniMetricLabel}>COR</Text>
                  <Text style={styles.miniMetricValue}>
                    {Math.round(recentTests[0].cortisol_value * 0.9)}%
                  </Text>
                </View>
              )}
              {recentTests[0].testosterone_value && (
                <View style={[styles.miniMetricChip, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
                  <Text style={[styles.miniMetricLabel, { color: '#991B1B' }]}>TES</Text>
                  <Text style={[styles.miniMetricValue, { color: '#DC2626' }]}>
                    {Math.round(recentTests[0].testosterone_value * 0.85)}%
                  </Text>
                </View>
              )}
              {recentTests[0].progesterone_value && (
                <View style={[styles.miniMetricChip, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                  <Text style={[styles.miniMetricLabel, { color: '#1E3A8A' }]}>PRO</Text>
                  <Text style={[styles.miniMetricValue, { color: '#2563EB' }]}>
                    {Math.round(recentTests[0].progesterone_value * 0.95)}%
                  </Text>
                </View>
              )}
              {primaryScore && (
                <View style={[styles.miniMetricChip, { 
                  backgroundColor: COLORS.purple100, 
                  borderColor: COLORS.purple200,
                  marginLeft: 'auto' 
                }]}>
                  <Text style={[styles.miniMetricLabel, { color: COLORS.purple700 }]}>↑</Text>
                  <Text style={[styles.miniMetricValue, { color: COLORS.purple700 }]}>
                    {Math.round(primaryScore.confidence)}%
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Secondary Scores - Compact Cards */}
        {secondaryScores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Related Insights</Text>
            <View style={styles.secondaryScoresRow}>
              {secondaryScores.map((score, index) => (
                <View
                  key={score.category || index}
                  style={[
                    styles.secondaryScoreCard,
                    index % 2 === 0 ? styles.physicalCard : styles.mentalCard,
                  ]}
                >
                  {/* Icon Indicator */}
                  <View style={styles.scoreIconCircle}>
                    <Text style={styles.scoreIcon}>
                      {score.category === 'physical' ? '💪' : '🧠'}
                    </Text>
                  </View>

                  {/* Score Value */}
                  <Text style={styles.secondaryScoreNumber}>
                    {Math.round(score.score)}
                  </Text>

                  {/* Label */}
                  <Text style={styles.secondaryScoreLabel}>
                    {score.category === 'physical' ? 'Physical' : 'Mental'}
                  </Text>

                  {/* Mini Progress Bar */}
                  <View style={styles.miniProgressBar}>
                    <View
                      style={[
                        styles.miniProgressFill,
                        {
                          width: `${Math.min(score.score, 100)}%`,
                          backgroundColor: index % 2 === 0 ? '#93C5FD' : '#FCA5A5',
                        },
                      ]}
                    />
                  </View>

                  {/* Message */}
                  <Text style={styles.secondaryScoreMessage} numberOfLines={2}>
                    {score.message}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
                
                {/* Compact Mobile Dashboard */}
                <View style={styles.content}>
                  {/* Quick Stats Row */}
                  <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Quick Stats</Text>
                    <View style={styles.quickStatsRow}>
                      {/* Streak */}
                      <View style={styles.quickStatCard}>
                        <Text style={styles.quickStatEmoji}>🔥</Text>
                        <Text style={styles.quickStatValue}>{streakData?.streak || 0}</Text>
                        <Text style={styles.quickStatLabel}>day streak</Text>
                      </View>

                      {/* Tests */}
                      <View style={styles.quickStatCard}>
                        <Text style={styles.quickStatEmoji}>✅</Text>
                        <Text style={styles.quickStatValue}>{testCount}</Text>
                        <Text style={styles.quickStatLabel}>tests</Text>
                      </View>

                      {/* Days Since Last */}
                      <View style={styles.quickStatCard}>
                        <Text style={styles.quickStatEmoji}>📅</Text>
                        <Text style={styles.quickStatValue}>
                          {daysSinceLast === 0 ? 'Today' : daysSinceLast || '--'}
                        </Text>
                        <Text style={styles.quickStatLabel}>
                          {daysSinceLast === 0 ? '' : daysSinceLast === 1 ? 'day ago' : 'days ago'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Feature Tools - Compact Cards */}
                  <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Explore Tools</Text>
                    <View style={styles.toolsGrid}>
                      {/* Impact */}
                      <TouchableOpacity
                        style={[styles.toolCard, impactLocked && styles.toolCardLocked]}
                        onPress={() => navigation.navigate('Impact')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.toolIconContainer}>
                          <Text style={styles.toolIcon}>{impactLocked ? '🔒' : '💊'}</Text>
                        </View>
                        <Text style={styles.toolTitle}>Impact™</Text>
                        <Text style={styles.toolSubtitle} numberOfLines={2}>
                          {impactLocked 
                            ? `${impactRemaining} test${impactRemaining === 1 ? '' : 's'} left`
                            : 'What works for you'}
                        </Text>
                      </TouchableOpacity>

                      {/* BioAge */}
                      <TouchableOpacity
                        style={[styles.toolCard, bioAgeLocked && styles.toolCardLocked]}
                        onPress={() => navigation.navigate('BioAge')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.toolIconContainer}>
                          <Text style={styles.toolIcon}>{bioAgeLocked ? '🔒' : '🧬'}</Text>
                        </View>
                        <Text style={styles.toolTitle}>BioAge™</Text>
                        <Text style={styles.toolSubtitle} numberOfLines={2}>
                          {bioAgeLocked 
                            ? `${bioAgeRemaining} test${bioAgeRemaining === 1 ? '' : 's'} left`
                            : 'Your hormone age'}
                        </Text>
                      </TouchableOpacity>

                      {/* Ask */}
                      <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => navigation.navigate('Ask')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.toolIconContainer}>
                          <Text style={styles.toolIcon}>🤖</Text>
                        </View>
                        <Text style={styles.toolTitle}>Ask™</Text>
                        <Text style={styles.toolSubtitle} numberOfLines={2}>
                          AI hormone coach
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <FloatingButton onPress={handleAddTest} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  settingsIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 4,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    gap: SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  // Main ReadyScore Card - Minimal & Elegant
  // Health Score Card - Option 1 Tech Health Design
  healthScoreCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  healthScoreTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  activityIcon: {
    fontSize: 20,
  },
  healthScoreTitleText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  progressRingBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  progressRingForeground: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerScoreDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerScoreNumber: {
    fontSize: 64,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    lineHeight: 64,
    letterSpacing: -2,
  },
  centerScoreUnit: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textTertiary,
    marginTop: -4,
  },
  healthScoreDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  miniMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  miniMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: BORDER_RADIUS.sm,
  },
  miniMetricLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.purple700,
  },
  miniMetricValue: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.purple600,
  },
  section: {
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  // Secondary Score Cards - Soft Minimal Design
  secondaryScoresRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryScoreCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  physicalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#93C5FD', // Soft blue
  },
  mentalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FCA5A5', // Soft red/pink
  },
  scoreIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  scoreIcon: {
    fontSize: 24,
  },
  secondaryScoreNumber: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  secondaryScoreLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.sm,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  secondaryScoreMessage: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  secondaryScorePlaceholder: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  // Quick Stats Row - Compact Mobile Design
  quickStatsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    minHeight: 100,
  },
  quickStatEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.xl,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Tools Grid - Compact Card Design
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  toolCard: {
    width: (SCREEN_WIDTH - (SPACING.md * 2) - SPACING.sm) / 2,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    minHeight: 130,
  },
  toolCardLocked: {
    opacity: 0.6,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  toolIcon: {
    fontSize: 24,
  },
  toolTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  toolSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

