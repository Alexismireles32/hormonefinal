// BioAge™ Screen - Hormonal Age vs Calendar Age
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { calculateAndSaveBioAge } from '../utils/bioageDatabase';
import { getTestCount } from '../utils/database';
import { getUserProfile } from '../utils/userProfile';

export default function BioAgeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [bioAgeData, setBioAgeData] = useState(null);
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    loadBioAge();
  }, []);

  const loadBioAge = async () => {
    try {
      setLoading(true);
      
      const count = await getTestCount();
      setTestCount(count);
      
      // Get user profile
      const userProfile = await getUserProfile();
      
      // Check if profile is complete
      if (!userProfile.age || !userProfile.gender) {
        // Profile incomplete - show error or redirect
        setBioAgeData({ bioAge: null, message: 'Please complete your profile first' });
        setLoading(false);
        return;
      }
      
      const result = await calculateAndSaveBioAge(userProfile);
      setBioAgeData(result);
    } catch (error) {
      console.error('Error loading BioAge:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Calculating your BioAge...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not enough data
  if (!bioAgeData || bioAgeData.bioAge === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>BioAge™</Text>
            <View style={styles.backButton} />
          </View>

          {/* Locked State */}
          <View style={styles.lockedContainer}>
            <Text style={styles.lockedEmoji}>🔒</Text>
            <Text style={styles.lockedTitle}>BioAge™ Locked</Text>
            <Text style={styles.lockedMessage}>{bioAgeData.message}</Text>
            
            <View style={styles.requirementBox}>
              <Text style={styles.requirementTitle}>Requirements to unlock:</Text>
              <Text style={styles.requirementItem}>• 10+ hormone tests</Text>
              <Text style={styles.requirementItem}>• 2+ weeks of data</Text>
              <Text style={styles.requirementItem}>• Multiple hormones tested</Text>
            </View>
            
            <View style={styles.progressBox}>
              <Text style={styles.progressText}>Your progress:</Text>
              <Text style={styles.progressCount}>{testCount} / 10 tests</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const { bioAge, chronologicalAge, delta, breakdown, confidence, percentile } = bioAgeData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BioAge™</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main BioAge Display */}
          <View style={styles.bioAgeCard}>
            <Text style={styles.bioAgeLabel}>Your BioAge</Text>
            <Text style={styles.bioAgeNumber}>{bioAge}</Text>
            <Text style={styles.chronoAgeText}>Your age: {chronologicalAge}</Text>
            
            {delta !== 0 && (
              <View style={[styles.deltaBadge, delta > 0 ? styles.deltaBadgePositive : styles.deltaBadgeNegative]}>
                <Text style={styles.deltaText}>
                  {delta > 0 ? `${delta} years younger! 🎉` : `${Math.abs(delta)} years older`}
                </Text>
              </View>
            )}
          </View>

          {/* Confidence */}
          <View style={styles.confidenceCard}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceEmoji}>{confidence.emoji}</Text>
              <Text style={styles.confidenceTitle}>{confidence.message}</Text>
            </View>
            <Text style={styles.confidenceSubtext}>
              Based on {testCount} tests. More tests = higher accuracy.
            </Text>
          </View>

          {/* Percentile */}
          <View style={styles.percentileCard}>
            <Text style={styles.percentileEmoji}>📊</Text>
            <Text style={styles.percentileTitle}>{percentile.message}</Text>
            <Text style={styles.percentileText}>
              You rank in the <Text style={styles.percentileBold}>{percentile.rank}</Text> of people your age.
            </Text>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>How we calculated your BioAge:</Text>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Cortisol (×1.5)</Text>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownValue, breakdown.cortisol.weighted < 0 && styles.breakdownValuePositive]}>
                  {breakdown.cortisol.weighted > 0 ? '+' : ''}{breakdown.cortisol.weighted.toFixed(1)} yrs
                </Text>
                <Text style={styles.breakdownMessage}>{breakdown.cortisol.message}</Text>
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Testosterone</Text>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownValue, breakdown.testosterone.weighted < 0 && styles.breakdownValuePositive]}>
                  {breakdown.testosterone.weighted > 0 ? '+' : ''}{breakdown.testosterone.weighted.toFixed(1)} yrs
                </Text>
                <Text style={styles.breakdownMessage}>{breakdown.testosterone.message}</Text>
              </View>
            </View>

            {breakdown.progesterone && (
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Progesterone</Text>
                <View style={styles.breakdownRight}>
                  <Text style={[styles.breakdownValue, breakdown.progesterone.weighted < 0 && styles.breakdownValuePositive]}>
                    {breakdown.progesterone.weighted > 0 ? '+' : ''}{breakdown.progesterone.weighted.toFixed(1)} yrs
                  </Text>
                  <Text style={styles.breakdownMessage}>{breakdown.progesterone.message}</Text>
                </View>
              </View>
            )}

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Hormone Balance</Text>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownValue, breakdown.ratio.weighted < 0 && styles.breakdownValuePositive]}>
                  {breakdown.ratio.weighted > 0 ? '+' : ''}{breakdown.ratio.weighted.toFixed(1)} yrs
                </Text>
                <Text style={styles.breakdownMessage}>{breakdown.ratio.message}</Text>
              </View>
            </View>

            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Consistency</Text>
              <View style={styles.breakdownRight}>
                <Text style={[styles.breakdownValue, breakdown.behavior.weighted < 0 && styles.breakdownValuePositive]}>
                  {breakdown.behavior.weighted > 0 ? '+' : ''}{breakdown.behavior.weighted.toFixed(1)} yrs
                </Text>
                <Text style={styles.breakdownMessage}>{breakdown.behavior.message}</Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Adjustment</Text>
              <Text style={[styles.totalValue, parseFloat(breakdown.totalAdjustment) < 0 && styles.totalValuePositive]}>
                {parseFloat(breakdown.totalAdjustment) > 0 ? '+' : ''}{breakdown.totalAdjustment} years
              </Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>📌 What BioAge means</Text>
            <Text style={styles.disclaimerText}>
              BioAge estimates your biological age based on hormone markers. It's for general wellness insights, 
              not medical diagnosis. Results improve with more tests (aim for 40+ for high confidence).
            </Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  // Locked state
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  lockedEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  lockedTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  lockedMessage: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  requirementBox: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    width: '100%',
    ...SHADOWS.sm,
  },
  requirementTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  requirementItem: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  progressBox: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  progressCount: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
  },
  // BioAge display
  bioAgeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  bioAgeLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bioAgeNumber: {
    fontSize: 72,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    lineHeight: 80,
  },
  chronoAgeText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  deltaBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  deltaBadgePositive: {
    backgroundColor: '#10b981',
  },
  deltaBadgeNegative: {
    backgroundColor: '#ef4444',
  },
  deltaText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.white,
  },
  // Confidence
  confidenceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  confidenceEmoji: {
    fontSize: 24,
  },
  confidenceTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  confidenceSubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  // Percentile
  percentileCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  percentileEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  percentileTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  percentileText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  percentileBold: {
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  // Breakdown
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  breakdownTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breakdownLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
    flex: 1,
  },
  breakdownRight: {
    flex: 2,
    alignItems: 'flex-end',
  },
  breakdownValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: '#ef4444',
    marginBottom: SPACING.xs / 2,
  },
  breakdownValuePositive: {
    color: '#10b981',
  },
  breakdownMessage: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    borderTopWidth: 2,
    borderTopColor: COLORS.textPrimary,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: '#ef4444',
  },
  totalValuePositive: {
    color: '#10b981',
  },
  // Disclaimer
  disclaimerCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  disclaimerTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

