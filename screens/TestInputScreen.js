// Test Input Screen - Log hormone test with slider
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { HORMONE_RANGES } from '../constants/hormones';
import { getCurrentTimeOfDay, getTimeOfDayEmoji } from '../utils/time';
import { saveHormoneTest, getTestUser } from '../utils/database';
import { isInOptimalRange, formatHormoneValue } from '../utils/validation';
import { saveReadyScore } from '../utils/readyScoreDatabase';
import { calculateReadyScore } from '../utils/readyScore';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import SupplementInput from '../components/SupplementInput';

export default function TestInputScreen({ route, navigation }) {
  const { hormone } = route.params;
  const range = HORMONE_RANGES[hormone.id];
  
  // Calculate midpoint as default value
  const midpoint = (range.min + range.max) / 2;
  
  const [value, setValue] = useState(midpoint);
  const [saving, setSaving] = useState(false);
  const [timeOfDay] = useState(getCurrentTimeOfDay());
  const [supplements, setSupplements] = useState([]);

  // Get optimal range for display (using age 30, male as default for now)
  const getOptimalRange = () => {
    if (hormone.id === 'cortisol') {
      return range.optimal.male['31-40'];
    } else if (hormone.id === 'testosterone') {
      return range.optimal.male['18-35'];
    }
    return null;
  };

  const optimalRange = getOptimalRange();
  const isOptimal = optimalRange ? (value >= optimalRange[0] && value <= optimalRange[1]) : false;

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare test data
      const testData = {
        [hormone.id]: parseFloat(value.toFixed(range.decimals)),
        time_of_day: timeOfDay,
        test_date: new Date().toISOString(),
        supplements_taken: supplements.length > 0 ? supplements : null,
      };

      // Save to database
      const savedTest = await saveHormoneTest(testData);

      if (savedTest) {
        // Calculate and save ReadyScore
        try {
          // Get all tests for calculation
          const { data: allTests } = await supabase
            .from('hormone_tests')
            .select('*')
            .eq('user_id', savedTest.user_id)
            .order('test_date', { ascending: false });

          if (allTests && allTests.length > 0) {
            const readyScoreData = calculateReadyScore(
              allTests[0],
              allTests,
              { age: 30, gender: 'male' } // Will get from user profile later
            );
            
            if (readyScoreData && readyScoreData.score !== null) {
              await saveReadyScore(savedTest.id, readyScoreData);
            }
          }
        } catch (error) {
          console.error('Error calculating ReadyScore:', error);
          // Don't block the success flow if ReadyScore fails
        }

        // Show success with instant insight
        const insight = generateInstantInsight();
        Alert.alert(
          'Test Saved! ✅',
          insight,
          [
            {
              text: 'Done',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving test:', error);
      Alert.alert('Error', 'Failed to save test. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateInstantInsight = () => {
    if (isOptimal) {
      return `Your ${hormone.name} level of ${formatHormoneValue(value, hormone.id)} ${range.unit} is in the optimal range! 🎉`;
    } else if (optimalRange && value > optimalRange[1]) {
      const percentAbove = ((value - optimalRange[1]) / optimalRange[1] * 100).toFixed(0);
      return `Your ${hormone.name} is ${percentAbove}% above optimal range. Consider stress management techniques.`;
    } else if (optimalRange && value < optimalRange[0]) {
      return `Your ${hormone.name} is below optimal range. Make sure you're getting adequate rest and nutrition.`;
    }
    return `${hormone.name} level recorded: ${formatHormoneValue(value, hormone.id)} ${range.unit}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{hormone.emoji}</Text>
          <Text style={styles.title}>{hormone.name}</Text>
          <Text style={styles.subtitle}>{hormone.description}</Text>
        </View>

        {/* Time Badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>
            {getTimeOfDayEmoji(timeOfDay)} {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
          </Text>
        </View>

        {/* Value Display */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueNumber}>
            {formatHormoneValue(value, hormone.id)}
          </Text>
          <Text style={styles.valueUnit}>{range.unit}</Text>
          {isOptimal && (
            <View style={styles.optimalBadge}>
              <Text style={styles.optimalText}>✓ Optimal</Text>
            </View>
          )}
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={range.min}
            maximumValue={range.max}
            value={value}
            onValueChange={setValue}
            minimumTrackTintColor={isOptimal ? COLORS.success : COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={isOptimal ? COLORS.success : COLORS.primary}
            step={range.decimals === 1 ? 0.1 : 1}
          />
          
          {/* Range Labels */}
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>{range.min}</Text>
            <Text style={styles.rangeLabel}>{range.max}</Text>
          </View>

          {/* Optimal Range Indicator */}
          {optimalRange && (
            <View style={styles.optimalRangeInfo}>
              <Text style={styles.optimalRangeText}>
                Optimal range: {optimalRange[0]} - {optimalRange[1]} {range.unit}
              </Text>
            </View>
          )}
        </View>

        {/* Supplements/Habits Section */}
        <View style={styles.supplementsSection}>
          <Text style={styles.sectionTitle}>Supplements & Habits (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Track what you're taking to see what actually works for YOU
          </Text>
          <SupplementInput value={supplements} onChange={setSupplements} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Save Test"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            variant="primary"
            size="large"
            style={styles.saveButton}
          />
          
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="text"
            disabled={saving}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  timeBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  timeBadgeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  valueNumber: {
    fontSize: 72,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    lineHeight: 80,
  },
  valueUnit: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },
  optimalBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  optimalText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  sliderContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  rangeLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  optimalRangeInfo: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  optimalRangeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  supplementsSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  actions: {
    gap: SPACING.sm,
  },
  saveButton: {
    width: '100%',
  },
});

