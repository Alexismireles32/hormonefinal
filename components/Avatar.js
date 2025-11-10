// Avatar Component - Displays user avatar with gradient fallback
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

export default function Avatar({ 
  imageUri, 
  name, 
  size = 48, 
  gradientColors = COLORS.gradients.ring 
}) {
  // Extract initials from name
  const getInitials = () => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials();
  const borderRadius = size / 2;
  const fontSize = size * 0.4;

  // If image URI is provided, show image
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.avatar, { width: size, height: size, borderRadius }]}
        accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
      />
    );
  }

  // Otherwise show gradient with initials
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.avatarGradient, { width: size, height: size, borderRadius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text 
        style={[styles.initials, { fontSize }]}
        accessibilityLabel={name ? `${name}'s avatar` : 'User avatar'}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.background,
  },
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: COLORS.purple600,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
  },
});

