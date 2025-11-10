// Floating Action Button (FAB) - Sticky + button at bottom with gradient
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

export default function FloatingButton({ onPress, icon = '+' }) {
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Add new hormone test"
      accessibilityHint="Opens hormone selection screen"
    >
      <LinearGradient
        colors={COLORS.gradients.fab}
        style={styles.fab}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.fabText}>{icon}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    alignSelf: 'center',
    borderRadius: 32,
    ...SHADOWS.lg,
    elevation: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: Platform.OS === 'ios' ? 38 : 32,
  },
});

