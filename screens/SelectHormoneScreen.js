// Select Hormone Screen - Choose which hormone to test
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const HORMONES = [
  {
    id: 'cortisol',
    name: 'Cortisol',
    emoji: '⚡',
    description: 'Stress hormone',
    color: COLORS.primary,
  },
  {
    id: 'testosterone',
    name: 'Testosterone',
    emoji: '💪',
    description: 'Performance hormone',
    color: COLORS.success,
  },
  {
    id: 'progesterone',
    name: 'Progesterone',
    emoji: '🌸',
    description: 'Balance hormone',
    color: COLORS.warning,
  },
];

export default function SelectHormoneScreen({ navigation }) {
  const handleSelectHormone = (hormone) => {
    navigation.navigate('TestInput', { hormone });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Hormone</Text>
          <Text style={styles.subtitle}>Which hormone did you test today?</Text>
        </View>

        {/* Hormone Cards */}
        <View style={styles.cardsContainer}>
          {HORMONES.map((hormone) => (
            <TouchableOpacity
              key={hormone.id}
              style={[styles.card, { borderLeftColor: hormone.color }]}
              onPress={() => handleSelectHormone(hormone)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text style={styles.emoji}>{hormone.emoji}</Text>
                <View style={styles.textContent}>
                  <Text style={styles.hormoneName}>{hormone.name}</Text>
                  <Text style={styles.hormoneDescription}>{hormone.description}</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
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
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  textContent: {
    flex: 1,
  },
  hormoneName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  hormoneDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  arrow: {
    fontSize: TYPOGRAPHY.xxxl,
    color: COLORS.textTertiary,
    marginLeft: SPACING.md,
  },
  cancelButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
});

