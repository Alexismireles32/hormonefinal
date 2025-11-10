// Reusable Button Component
// Minimalistic, elegant design following theme constants
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: COLORS.primary,
          color: COLORS.white,
        };
      case 'success':
        return {
          backgroundColor: COLORS.success,
          color: COLORS.white,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
          color: COLORS.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: COLORS.primary,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          color: COLORS.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          fontSize: TYPOGRAPHY.sm,
        };
      case 'medium':
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          fontSize: TYPOGRAPHY.base,
        };
      case 'large':
        return {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          fontSize: TYPOGRAPHY.lg,
        };
      default:
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          fontSize: TYPOGRAPHY.base,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        isDisabled && styles.disabled,
        variant === 'primary' && SHADOWS.md,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator 
          color={variantStyles.color}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: variantStyles.color,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility minimum tap target
  },
  text: {
    fontWeight: TYPOGRAPHY.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});

