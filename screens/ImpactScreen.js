// Impact Screen - Shows what supplements/habits actually work for YOU
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getHormoneTests, getTestCount } from '../utils/database';
import { analyzeAllSupplements } from '../utils/impactAnalysis';

export default function ImpactScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testCount, setTestCount] = useState(0);
  const [analyses, setAnalyses] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      const count = await getTestCount();
      setTestCount(count);

      if (count >= 15) {
        const tests = await getHormoneTests();
        const results = analyzeAllSupplements(tests);
        setAnalyses(results);

        // Calculate total potential savings
        const savings = results
          .filter(a => a.verdict.action === 'stop')
          .reduce((sum, a) => sum + a.annualCost, 0);
        setTotalSavings(savings);
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadImpactData();
  };

  // Locked state (less than 15 tests)
  if (testCount < 15) {
    const remaining = 15 - testCount;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Impact™</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.lockedContainer}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.lockedTitle}>Impact™ Locked</Text>
            <Text style={styles.lockedText}>
              Log {remaining} more test{remaining === 1 ? '' : 's'} to unlock personalized supplement analysis
            </Text>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(testCount / 15) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{testCount} / 15 tests</Text>

            <View style={styles.featurePreview}>
              <Text style={styles.previewTitle}>What you'll get:</Text>
              <Text style={styles.previewItem}>• See which supplements actually work for YOU</Text>
              <Text style={styles.previewItem}>• Statistical proof with before/after data</Text>
              <Text style={styles.previewItem}>• Calculate money saved from stopping ineffective supplements</Text>
              <Text style={styles.previewItem}>• Personalized recommendations based on YOUR results</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (analyses.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Impact™</Text>
            <View style={styles.backButton} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💊</Text>
              <Text style={styles.emptyTitle}>No Supplements Tracked Yet</Text>
              <Text style={styles.emptyText}>
                Start adding supplements and habits when you log tests. After a few weeks, we'll show you what actually works!
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Main Impact view with results
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Impact™</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Savings Banner */}
          {totalSavings > 0 && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsTitle}>💰 Potential Savings</Text>
              <Text style={styles.savingsAmount}>${totalSavings}/year</Text>
              <Text style={styles.savingsText}>
                Stop taking supplements that don't work for YOU
              </Text>
            </View>
          )}

          {/* Analysis Cards */}
          {analyses.map((analysis, index) => (
            <View 
              key={`${analysis.supplement}-${analysis.hormone}-${index}`}
              style={[styles.analysisCard, { borderLeftColor: analysis.verdict.color }]}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.supplementName}>{analysis.supplement}</Text>
                <Text style={styles.verdictEmoji}>{analysis.verdict.emoji}</Text>
              </View>

              {/* Verdict */}
              <View style={styles.verdictBadge}>
                <Text style={[styles.verdictText, { color: analysis.verdict.color }]}>
                  {analysis.verdict.title}
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Effect on {analysis.hormone}:</Text>
                <Text style={[
                  styles.statValue,
                  { color: analysis.percentChange > 0 ? COLORS.success : COLORS.error }
                ]}>
                  {analysis.percentChange > 0 ? '+' : ''}{analysis.percentChange}%
                </Text>
              </View>

              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Sample size:</Text>
                <Text style={styles.statValue}>
                  {analysis.sampleSizeWith} with vs {analysis.sampleSizeWithout} without
                </Text>
              </View>

              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Statistical confidence:</Text>
                <Text style={styles.statValue}>
                  {analysis.confidenceLevel ? `${analysis.confidenceLevel}%` : 'Low'}
                </Text>
              </View>

              {analysis.monthlyCost > 0 && (
                <View style={styles.statsRow}>
                  <Text style={styles.statLabel}>Cost:</Text>
                  <Text style={styles.statValue}>${analysis.monthlyCost}/month</Text>
                </View>
              )}

              {/* Data */}
              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Without</Text>
                  <Text style={styles.dataValue}>{analysis.avgWithout}</Text>
                </View>
                <Text style={styles.dataArrow}>→</Text>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>With</Text>
                  <Text style={styles.dataValue}>{analysis.avgWith}</Text>
                </View>
              </View>

              {/* Message */}
              <Text style={styles.message}>{analysis.verdict.message}</Text>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Based on {testCount} tests. Results are personalized to YOUR body.
            </Text>
            <Text style={styles.footerHint}>Pull down to refresh</Text>
          </View>
        </ScrollView>
      </View>
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
    backgroundColor: COLORS.background,
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  lockEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  lockedTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  lockedText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  featurePreview: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOWS.md,
  },
  previewTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  previewItem: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  // Empty state
  emptyContainer: {
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
    lineHeight: 24,
    maxWidth: 300,
  },
  // Savings banner
  savingsBanner: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  savingsTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  savingsAmount: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    textAlign: 'center',
  },
  // Analysis cards
  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  supplementName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  verdictEmoji: {
    fontSize: 28,
  },
  verdictBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  verdictText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  dataValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  dataArrow: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.textTertiary,
  },
  message: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
});

