// Swipable ReadyScore Cards Component
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);
const CARD_SPACING = SPACING.lg;

export default function ReadyScoreCarousel({ readyScores }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  if (!readyScores || readyScores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent tests</Text>
      </View>
    );
  }

  const onScroll = (event) => {
    const slideSize = CARD_WIDTH + CARD_SPACING;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  const renderCard = ({ item }) => {
    if (!item || item.score === null) {
      return (
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyCardText}>{item.explanation || 'No data'}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.card, { borderLeftColor: item.color }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.categoryLabel}>
            {item.category === 'overall' ? 'READYSCORE' : 
             item.category === 'physical' ? 'PHYSICAL PERFORMANCE' :
             item.category === 'mental' ? 'MENTAL CLARITY' : 'READYSCORE'}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreNumber, { color: item.color }]}>
            {item.score}
          </Text>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>{item.title}</Text>
            {item.confidence !== undefined && (
              <Text style={styles.confidence}>{item.confidence}% confidence</Text>
            )}
          </View>
        </View>

        {/* Explanation */}
        <Text style={styles.explanation}>{item.explanation}</Text>

        {/* Factors (if available) */}
        {item.factors && item.factors.length > 0 && (
          <View style={styles.factorsContainer}>
            {item.factors.slice(0, 3).map((factor, index) => (
              <Text key={index} style={styles.factorText}>
                {factor}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={readyScores}
        renderItem={renderCard}
        keyExtractor={(item, index) => `${item.category}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      {readyScores.length > 1 && (
        <View style={styles.pagination}>
          {readyScores.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  flatListContent: {
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginRight: CARD_SPACING,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  emptyCard: {
    borderLeftColor: COLORS.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyCardText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: TYPOGRAPHY.bold,
    lineHeight: 56,
  },
  scoreInfo: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  scoreTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  confidence: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  explanation: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  factorsContainer: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  factorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

