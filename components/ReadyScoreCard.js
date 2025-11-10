// ReadyScore Display Component - Minimalistic header card
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function ReadyScoreCard({ readyScoreData }) {
  if (!readyScoreData || readyScoreData.stale) {
    return (
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.label}>ReadyScore</Text>
          <Text style={styles.emptyMessage}>
            {readyScoreData?.message || 'No recent tests'}
          </Text>
        </View>
      </View>
    );
  }

  const { score, confidence, message, color } = readyScoreData;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.content}>
        <Text style={styles.label}>ReadyScore</Text>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color }]}>{score}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.message}>{message}</Text>
            <Text style={styles.confidence}>{confidence}% confidence</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textTertiary,
    ...SHADOWS.md,
  },
  content: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  score: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.bold,
    lineHeight: 56,
  },
  metaContainer: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  message: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  confidence: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

