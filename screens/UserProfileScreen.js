// User Profile Setup Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { getUserProfile, saveUserProfile } from '../utils/userProfile';
import Button from '../components/Button';

export default function UserProfileScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  const [isPostmenopausal, setIsPostmenopausal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOnboarding = route?.params?.onboarding || false;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    if (profile.name) setName(profile.name);
    if (profile.age) setAge(profile.age.toString());
    if (profile.gender) setGender(profile.gender);
    setIsPostmenopausal(profile.isPostmenopausal || false);
  };

  const handleSave = async () => {
    // Validation
    if (!age || !gender) {
      Alert.alert('Missing Information', 'Please provide your age and gender.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      Alert.alert('Invalid Age', 'Please enter an age between 18 and 100.');
      return;
    }

    try {
      setLoading(true);

      const profile = {
        name: name.trim() || null,
        age: ageNum,
        gender,
        isPostmenopausal: gender === 'female' ? isPostmenopausal : false,
      };

      await saveUserProfile(profile);

      if (isOnboarding) {
        // Navigate to dashboard after onboarding
        navigation.replace('Dashboard');
      } else {
        // Go back if editing profile
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {!isOnboarding && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {isOnboarding ? 'Welcome to HormoIQ' : 'Edit Profile'}
          </Text>
          {!isOnboarding && <View style={styles.backButton} />}
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isOnboarding && (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeEmoji}>🧬</Text>
              <Text style={styles.welcomeTitle}>Let's personalize your experience</Text>
              <Text style={styles.welcomeText}>
                We need a few details to provide accurate hormone insights tailored to you.
              </Text>
            </View>
          )}

          {/* Name Input (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Name (Optional)</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="words"
              maxLength={50}
              accessibilityLabel="Name input"
              accessibilityHint="Your name will be displayed on your profile"
            />
            <Text style={styles.helpText}>
              Used for personalization and avatar display
            </Text>
          </View>

          {/* Age Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Enter your age"
              placeholderTextColor={COLORS.textTertiary}
              maxLength={3}
            />
            <Text style={styles.helpText}>
              Used to calculate age-specific optimal hormone ranges
            </Text>
          </View>

          {/* Gender Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('male')}
                activeOpacity={0.7}
              >
                <Text style={styles.genderEmoji}>👨</Text>
                <Text style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextSelected,
                ]}>
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('female')}
                activeOpacity={0.7}
              >
                <Text style={styles.genderEmoji}>👩</Text>
                <Text style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextSelected,
                ]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              Hormone ranges differ significantly between male and female
            </Text>
          </View>

          {/* Menopause Status (Female only) */}
          {gender === 'female' && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Menopause Status (Optional)</Text>
              <TouchableOpacity
                style={[
                  styles.checkboxRow,
                  isPostmenopausal && styles.checkboxRowSelected,
                ]}
                onPress={() => setIsPostmenopausal(!isPostmenopausal)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  {isPostmenopausal && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxText}>I am postmenopausal</Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                Helps calculate accurate progesterone and testosterone ranges
              </Text>
            </View>
          )}

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              🔒 Your data is stored locally and securely. We only use it to personalize 
              your hormone insights.
            </Text>
          </View>

          {/* Save Button */}
          <Button
            title={isOnboarding ? 'Get Started' : 'Save Changes'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textPrimary,
    ...SHADOWS.sm,
  },
  helpText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  genderButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  genderEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  genderText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  checkboxRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    flex: 1,
  },
  privacyNotice: {
    backgroundColor: '#f3f4f6',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  saveButton: {
    width: '100%',
  },
});

