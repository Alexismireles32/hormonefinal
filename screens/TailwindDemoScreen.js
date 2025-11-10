// Demo Screen showing StyleSheet + Tailwind working together
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function TailwindDemoScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            NativeWind Demo
          </Text>
          <Text className="text-base text-gray-600">
            Both StyleSheet and Tailwind classes work together! 🎉
          </Text>
        </View>

        {/* Example 1: Pure Tailwind */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-semibold text-purple-600 mb-2">
            ✨ Pure Tailwind Classes
          </Text>
          <Text className="text-sm text-gray-600 mb-3">
            Using only className prop with Tailwind utilities
          </Text>
          <View className="flex-row gap-2">
            <View className="bg-purple-100 px-3 py-1 rounded-full">
              <Text className="text-purple-700 text-xs font-medium">Tag 1</Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-medium">Tag 2</Text>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-medium">Tag 3</Text>
            </View>
          </View>
        </View>

        {/* Example 2: Pure StyleSheet */}
        <View style={styles.styleSheetCard}>
          <Text style={styles.cardTitle}>
            📱 Pure StyleSheet
          </Text>
          <Text style={styles.cardDescription}>
            Using only style prop with StyleSheet.create
          </Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, styles.tagPurple]}>
              <Text style={styles.tagText}>Tag 1</Text>
            </View>
            <View style={[styles.tag, styles.tagBlue]}>
              <Text style={styles.tagText}>Tag 2</Text>
            </View>
            <View style={[styles.tag, styles.tagGreen]}>
              <Text style={styles.tagText}>Tag 3</Text>
            </View>
          </View>
        </View>

        {/* Example 3: Mixed Approach */}
        <View 
          style={styles.complexShadow}
          className="bg-white rounded-2xl p-6 mb-4"
        >
          <Text className="text-xl font-semibold text-orange-600 mb-2">
            🎨 Mixed: Both Together!
          </Text>
          <Text style={styles.cardDescription}>
            Using both style AND className props
          </Text>
          <Text className="text-sm text-gray-500 italic mt-2">
            Complex shadow from StyleSheet + Tailwind for layout/colors
          </Text>
        </View>

        {/* Example 4: Your Theme Colors in Tailwind */}
        <View className="bg-primary rounded-2xl p-6 mb-4">
          <Text className="text-white text-xl font-bold mb-2">
            🎯 Your Theme Colors
          </Text>
          <Text className="text-white/80 text-sm mb-4">
            Custom colors from tailwind.config.js
          </Text>
          <View className="flex-row gap-2">
            <View className="bg-purple100 px-3 py-2 rounded-lg flex-1">
              <Text className="text-purple700 text-xs font-semibold text-center">
                purple100
              </Text>
            </View>
            <View className="bg-success px-3 py-2 rounded-lg flex-1">
              <Text className="text-white text-xs font-semibold text-center">
                success
              </Text>
            </View>
            <View className="bg-error px-3 py-2 rounded-lg flex-1">
              <Text className="text-white text-xs font-semibold text-center">
                error
              </Text>
            </View>
          </View>
        </View>

        {/* Example 5: Responsive Layout */}
        <View className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            📐 Flexbox with Tailwind
          </Text>
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-white p-3 rounded-lg shadow-sm flex-1 mr-2">
              <Text className="text-2xl font-bold text-purple-600">68</Text>
              <Text className="text-xs text-gray-500">Score</Text>
            </View>
            <View className="bg-white p-3 rounded-lg shadow-sm flex-1 ml-2">
              <Text className="text-2xl font-bold text-green-600">12</Text>
              <Text className="text-xs text-gray-500">Tests</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="bg-white/50 px-2 py-1 rounded flex-1">
              <Text className="text-xs text-gray-700 text-center">Flex 1</Text>
            </View>
            <View className="bg-white/50 px-2 py-1 rounded flex-1">
              <Text className="text-xs text-gray-700 text-center">Flex 1</Text>
            </View>
            <View className="bg-white/50 px-2 py-1 rounded flex-1">
              <Text className="text-xs text-gray-700 text-center">Flex 1</Text>
            </View>
          </View>
        </View>

        {/* Example 6: Interactive Button */}
        <TouchableOpacity 
          className="bg-purple-600 rounded-xl p-4 mb-4 active:bg-purple-700"
          onPress={() => alert('Tailwind button pressed!')}
        >
          <Text className="text-white text-center font-semibold text-base">
            Tap Me - Tailwind Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => alert('StyleSheet button pressed!')}
        >
          <Text style={styles.buttonText}>
            Tap Me - StyleSheet Button
          </Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          className="bg-gray-200 rounded-xl p-4 mt-2"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-700 text-center font-medium">
            ← Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// StyleSheet still works perfectly!
const styles = StyleSheet.create({
  styleSheetCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tagRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
  },
  tagPurple: {
    backgroundColor: COLORS.purple100,
  },
  tagBlue: {
    backgroundColor: '#DBEAFE',
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
  },
  tagText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
  },
  complexShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.semibold,
    fontSize: TYPOGRAPHY.base,
  },
});

