# HormoIQ - Path to 100/100 Implementation Plan

**Current Score:** 72/100  
**Target Score:** 100/100  
**Timeline:** 9-13 days

---

## Phase 1: Foundation Fixes (72 → 82)
**Duration:** 2-3 days | **Impact:** +10 points

### 1.1 Typography System Overhaul (+3 points)

**Files to modify:**
- `constants/theme.js`
- All screen files

**Tasks:**
```javascript
// Update theme.js
export const TYPOGRAPHY = {
  // Font sizes (mobile-first, accessibility-compliant)
  xxxl: 36,    // Hero headlines
  xxl: 32,     // Section headers
  xl: 28,      // Card titles
  lg: 22,      // Subheadings
  base: 16,    // Body text
  sm: 14,      // Secondary text (increased from 14)
  xs: 13,      // Captions (increased from 12)
  
  // Font family
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights (unchanged)
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

**Implementation steps:**
1. Install Inter font: `npx expo install expo-font @expo-google-fonts/inter`
2. Update App.js to load fonts before rendering
3. Find/replace all `fontSize: TYPOGRAPHY.xs` with conditional checks for minimum 13px
4. Add letter-spacing to all uppercase text components
5. Test on small devices (iPhone SE)

**Acceptance criteria:**
- [ ] All text is minimum 13px
- [ ] Inter font loads and displays correctly
- [ ] Letter-spacing applied to section headers
- [ ] No layout breaking on small screens

---

### 1.2 Unified Color System (+3 points)

**Files to modify:**
- `constants/theme.js`
- `screens/DashboardScreen.js`
- All component files

**Tasks:**
```javascript
// Update theme.js
export const COLORS = {
  // Primary purple scale (7 shades)
  purple50: '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',  // Main brand color
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  
  // Gradient presets
  gradients: {
    background: ['#F6F0FF', '#FEF7F4'],
    hero: ['#8B5CF6', '#7C3AED'],      // Updated for better contrast
    ring: ['#F5F3FF', '#DDD6FE'],
    card: ['#EDE9FE', '#DDD6FE'],
  },
  
  // Semantic colors
  primary: '#8B5CF6',
  success: '#10B981',   // Updated green
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutrals (unchanged)
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  
  // Text (updated for better contrast)
  textPrimary: '#1F2937',    // Darker
  textSecondary: '#6B7280',  // Medium gray
  textTertiary: '#9CA3AF',   // Light gray
  
  // Interactive states
  disabled: 'rgba(0, 0, 0, 0.38)',
  focus: '#8B5CF6',
  active: '#7C3AED',
  
  // Borders & overlays
  border: '#D1D5DB',         // Darker for visibility
  borderLight: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Shadows (unchanged)
  shadow: '#000000',
};
```

**Implementation steps:**
1. Update theme.js with new color system
2. Replace all hardcoded gradient arrays with `COLORS.gradients.hero`, etc.
3. Update Dashboard hero card gradient to use new purple600/700
4. Fix contrast ratios on white text over purple (test with WebAIM checker)
5. Update progress card backgrounds to use purple100/200
6. Update border colors throughout app

**Acceptance criteria:**
- [ ] All gradients defined in theme.js
- [ ] No hardcoded hex colors in component files
- [ ] White text on purple passes WCAG AA (4.5:1)
- [ ] Border colors visible on background

---

### 1.3 Enhanced Component Quality (+4 points)

#### A. Rebuild FAB Component

**File:** `components/FloatingButton.js`

**New implementation:**
```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

export default function FloatingButton({ onPress, icon = '+' }) {
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={COLORS.gradients.hero}
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
    ...SHADOWS.lg,
    borderRadius: 32,
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
    lineHeight: 38,
  },
});
```

**Acceptance criteria:**
- [ ] FAB uses purple gradient
- [ ] Shadow is consistent with design system
- [ ] Press feedback is smooth

#### B. Create Avatar Component

**New file:** `components/Avatar.js`

```javascript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

export default function Avatar({ 
  imageUri, 
  name, 
  size = 48, 
  gradientColors = COLORS.gradients.ring 
}) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
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
    fontWeight: '600',
  },
});
```

**Implementation steps:**
1. Create Avatar component file
2. Update DashboardScreen to use Avatar with initials
3. Add name field to user profile
4. Test with various name lengths

**Acceptance criteria:**
- [ ] Avatar displays initials from name
- [ ] Gradient background looks polished
- [ ] Supports optional image URI
- [ ] Scales properly with size prop

#### C. Add Loading States to Buttons

**File:** `components/Button.js`

```javascript
// Add to Button component
import { ActivityIndicator } from 'react-native';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,  // NEW
  disabled = false,
  ...props 
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(variant),
        getSizeStyles(size),
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? COLORS.white : COLORS.primary} 
        />
      ) : (
        <Text style={[styles.text, getTextStyles(variant), getSizeTextStyles(size)]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Add disabled style
const styles = StyleSheet.create({
  // ... existing styles
  disabled: {
    opacity: 0.5,
  },
});
```

**Implementation steps:**
1. Update Button component with loading prop
2. Add ActivityIndicator during async operations
3. Update all button usages to pass loading state
4. Test on TestInputScreen save flow

**Acceptance criteria:**
- [ ] Buttons show spinner during async operations
- [ ] Disabled opacity is correct
- [ ] Spinner color matches button variant
- [ ] User can't double-tap submit

---

## Phase 2: Visual Polish (82 → 90)
**Duration:** 3-4 days | **Impact:** +8 points

### 2.1 Micro-Interactions (+3 points)

**Install dependencies:**
```bash
npx expo install react-native-reanimated
npx expo install react-native-haptic-feedback
```

#### A. Button Press Animation

**New file:** `components/AnimatedButton.js`

```javascript
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedButton({ children, onPress, haptic = true, style, ...props }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
    if (haptic) {
      ReactNativeHapticFeedback.trigger('impactLight');
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });
  };

  return (
    <AnimatedTouchable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}
```

**Implementation steps:**
1. Wrap all TouchableOpacity components with AnimatedButton
2. Add haptic feedback to primary actions (save, submit, etc.)
3. Test press animation timing and spring physics
4. Adjust scale value for different component sizes

**Acceptance criteria:**
- [ ] All buttons scale on press
- [ ] Spring animation feels natural
- [ ] Haptic feedback works on iOS and Android
- [ ] No performance issues on slower devices

#### B. Animated Progress Rings

**File:** `screens/DashboardScreen.js`

```javascript
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressRing({ progress, size = 90, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value / 100),
  }));

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Animated progress circle */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#FFFFFF"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );
}
```

**Acceptance criteria:**
- [ ] Progress rings animate from 0 to value
- [ ] Animation is smooth (60fps)
- [ ] Easing curve feels natural
- [ ] Works on both iOS and Android

#### C. Success Animation

**Install Lottie:**
```bash
npx expo install lottie-react-native
```

**New component:** `components/SuccessAnimation.js`

```javascript
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SuccessAnimation({ onComplete }) {
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        onAnimationFinish={onComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 120,
    height: 120,
  },
});
```

**Tasks:**
1. Download success checkmark Lottie from LottieFiles
2. Replace Alert.alert with modal + success animation
3. Add to test save flow
4. Test animation timing

**Acceptance criteria:**
- [ ] Success animation plays on test save
- [ ] Modal dismisses after animation
- [ ] Feels satisfying and rewarding
- [ ] Doesn't block user if they want to skip

---

### 2.2 Data Visualization (+3 points)

**Install chart library:**
```bash
npm install react-native-chart-kit react-native-svg
```

#### A. Hormone Trend Chart

**New component:** `components/HormoneChart.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function HormoneChart({ data, hormoneName, color = COLORS.primary }) {
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hormoneName} Trend</Text>
      <LineChart
        data={data}
        width={screenWidth - SPACING.lg * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  chart: {
    marginVertical: SPACING.xs,
    borderRadius: 16,
  },
});
```

**Implementation steps:**
1. Create HormoneChart component
2. Add to Dashboard or new "Trends" screen
3. Format test data for chart (last 7-14 tests)
4. Add touch interaction to show values
5. Test on different screen sizes

**Acceptance criteria:**
- [ ] Chart displays hormone values over time
- [ ] Bezier curve smooths line
- [ ] Touch shows value at point
- [ ] Responsive to screen width
- [ ] Loads quickly with data

#### B. Sparkline Component

**New file:** `components/Sparkline.js`

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

export default function Sparkline({ data, width = 60, height = 24, color = '#8B5CF6' }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
```

**Implementation steps:**
1. Create Sparkline component
2. Add to dashboard cards (streak, readyscore)
3. Pass last 7 values for each metric
4. Style to match card design

**Acceptance criteria:**
- [ ] Sparkline shows mini trend
- [ ] Scales correctly in cards
- [ ] Color matches card theme
- [ ] Updates when data changes

---

### 2.3 Layout Improvements (+2 points)

#### A. Hero Card Redesign

**Update:** `screens/DashboardScreen.js`

```javascript
// Adjust hero card JSX structure
<LinearGradient
  colors={COLORS.gradients.hero}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.heroCard}
>
  <View style={styles.heroTop}>
    <View style={styles.heroLeft}>
      <Text style={styles.heroLabel}>Your readiness looks great</Text>
      <Text style={styles.heroMessage}>
        {primaryScore?.message || 'Log a test to unlock'}
      </Text>
      <TouchableOpacity style={styles.heroButton} onPress={handleAddTest}>
        <Text style={styles.heroButtonText}>Log test now</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.heroRight}>
      <ProgressRing progress={primaryScore?.score || 0} />
      <Text style={styles.heroScore}>{primaryScore?.score || '--'}</Text>
    </View>
  </View>
  <View style={styles.heroBottom}>
    <Text style={styles.heroConfidence}>
      {Math.round(primaryScore?.confidence || 0)}% Confidence
    </Text>
  </View>
</LinearGradient>

// Update styles
const styles = StyleSheet.create({
  heroCard: {
    marginHorizontal: SPACING.md,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 200,  // Ensure adequate height
    ...SHADOWS.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroRight: {
    alignItems: 'center',
  },
  // ... rest of styles
});
```

**Acceptance criteria:**
- [ ] Hero card is wider and more prominent
- [ ] Content is well-balanced left/right
- [ ] Button is easily tappable
- [ ] Progress ring is clearly visible

#### B. Standardize Section Spacing

**Global style update across all screens:**
```javascript
const styles = StyleSheet.create({
  section: {
    marginHorizontal: SPACING.md,  // Always 16px
    marginBottom: SPACING.lg,       // Always 24px
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,       // Always 8px
  },
});
```

**Acceptance criteria:**
- [ ] All sections use consistent margins
- [ ] Vertical rhythm is maintained
- [ ] No jarring spacing jumps
- [ ] Works on all screen sizes

---

## Phase 3: Advanced Features (90 → 95)
**Duration:** 2-3 days | **Impact:** +5 points

### 3.1 Bottom Tab Navigation (+2 points)

**Update:** `App.js`

```javascript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          borderTopColor: COLORS.borderLight,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Ask"
        component={AskScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="SelectHormone" component={SelectHormoneScreen} />
        <Stack.Screen name="TestInput" component={TestInputScreen} />
        <Stack.Screen name="Impact" component={ImpactScreen} />
        <Stack.Screen name="BioAge" component={BioAgeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Acceptance criteria:**
- [ ] Bottom tabs always visible on main screens
- [ ] Active tab is highlighted
- [ ] Tab icons are clear
- [ ] Navigation is intuitive

---

### 3.2 Accessibility (+2 points)

**Add to all interactive components:**
```javascript
<TouchableOpacity
  accessibilityLabel="Log new hormone test"
  accessibilityHint="Opens hormone selection screen"
  accessibilityRole="button"
  onPress={handleAddTest}
>
  {/* ... */}
</TouchableOpacity>

<Text
  accessibilityRole="header"
  style={styles.title}
>
  Select Hormone
</Text>

<Image
  source={avatarUri}
  accessibilityLabel="User profile avatar"
  accessible={true}
/>
```

**Implementation steps:**
1. Audit all screens for accessibility labels
2. Add accessibilityLabel to all buttons, links, images
3. Add accessibilityHint for complex interactions
4. Set accessibilityRole for semantic meaning
5. Test with VoiceOver (iOS) and TalkBack (Android)

**Acceptance criteria:**
- [ ] All interactive elements have labels
- [ ] Screen reader can navigate entire app
- [ ] Hints provide context for actions
- [ ] Roles are semantically correct

---

### 3.3 Mobile Optimization (+1 point)

**Testing checklist:**
- [ ] Test on iPhone SE (375×667)
- [ ] Test on iPhone 14 Pro Max (430×932)
- [ ] Test with Large Text accessibility setting
- [ ] Test with VoiceOver enabled
- [ ] Test with Reduce Motion enabled
- [ ] Test landscape orientation

**Fixes:**
1. Add hitSlop to small touch targets
2. Fix text wrapping with numberOfLines
3. Lock portrait orientation
4. Respect reduced motion preferences

```javascript
// Add hit slop to small buttons
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  {/* ... */}
</TouchableOpacity>

// Fix text wrapping
<Text
  numberOfLines={2}
  ellipsizeMode="tail"
>
  {longText}
</Text>

// Respect reduced motion
import { useReducedMotion } from 'react-native-reanimated';

const reducedMotion = useReducedMotion();
const animationDuration = reducedMotion ? 0 : 300;
```

**Acceptance criteria:**
- [ ] All text is readable on small screens
- [ ] Touch targets are 44×44 minimum
- [ ] App respects accessibility settings
- [ ] No layout breaks on any device

---

## Phase 4: Premium Details (95 → 100)
**Duration:** 2-3 days | **Impact:** +5 points

### 4.1 Advanced Animations (+2 points)

#### A. Skeleton Loaders

**Install:**
```bash
npm install react-native-skeleton-placeholder
```

**Create:** `components/SkeletonCard.js`

```javascript
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { View } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../constants/theme';

export function SkeletonCard() {
  return (
    <SkeletonPlaceholder>
      <View
        style={{
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
          padding: SPACING.md,
        }}
      >
        <View style={{ width: 120, height: 20, borderRadius: 4 }} />
        <View style={{ width: '100%', height: 60, borderRadius: 8, marginTop: SPACING.sm }} />
        <View style={{ width: 80, height: 16, borderRadius: 4, marginTop: SPACING.xs }} />
      </View>
    </SkeletonPlaceholder>
  );
}
```

**Acceptance criteria:**
- [ ] Skeleton shows while data loads
- [ ] Matches card layout
- [ ] Smooth transition to real content
- [ ] Improves perceived performance

#### B. Page Transitions

**Update navigation config:**
```javascript
<Stack.Navigator
  screenOptions={{
    headerShown: false,
    animation: 'slide_from_right',
    animationDuration: 300,
  }}
>
  {/* screens */}
</Stack.Navigator>
```

**Acceptance criteria:**
- [ ] Smooth slide transitions
- [ ] Consistent timing (300ms)
- [ ] No jank or stuttering
- [ ] Works on Android and iOS

---

### 4.2 Dark Mode (+1 point)

**Create:** `constants/darkTheme.js`

```javascript
export const DARK_COLORS = {
  background: '#1F2937',
  white: '#111827',
  black: '#FFFFFF',
  
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  border: '#374151',
  borderLight: '#4B5563',
  
  // Gradients adjusted for dark mode
  gradients: {
    background: ['#1F2937', '#111827'],
    hero: ['#7C3AED', '#6D28D9'],
    // ... rest
  },
};
```

**Implementation:**
1. Create dark theme constants
2. Add theme context provider
3. Update all components to use theme
4. Add theme toggle in settings
5. Persist theme preference

**Acceptance criteria:**
- [ ] Dark mode available in settings
- [ ] All screens support dark mode
- [ ] Contrast ratios maintained
- [ ] Preference persists

---

### 4.3 Final Polish (+2 points)

#### A. Haptic Feedback

**Add to key interactions:**
```javascript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// On test save
ReactNativeHapticFeedback.trigger('notificationSuccess');

// On error
ReactNativeHapticFeedback.trigger('notificationError');

// On button press
ReactNativeHapticFeedback.trigger('impactLight');

// On slider drag
ReactNativeHapticFeedback.trigger('selection');
```

#### B. Toast Notifications

**Install:**
```bash
npm install react-native-toast-message
```

**Replace Alert.alert:**
```javascript
import Toast from 'react-native-toast-message';

// Success
Toast.show({
  type: 'success',
  text1: 'Test Saved!',
  text2: insight,
  position: 'top',
});

// Error
Toast.show({
  type: 'error',
  text1: 'Error',
  text2: 'Failed to save test',
  position: 'top',
});
```

#### C. Empty State Illustrations

**Create custom empty states:**
- No tests yet: Friendly illustration with test tube
- Impact locked: Lock icon with progress bar
- No supplements tracked: Pill bottle illustration

**Use Figma or get from:**
- unDraw (https://undraw.co)
- Illustrations (https://illlustrations.co)
- Streamline (https://streamlinehq.com)

**Acceptance criteria:**
- [ ] All empty states have illustrations
- [ ] Illustrations match brand style
- [ ] SVG format for scalability
- [ ] Accessible alt text provided

---

## Testing Checklist

### Devices
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (standard)
- [ ] iPhone 14 Pro Max (large screen)
- [ ] Android (Pixel 5)
- [ ] Android (Samsung Galaxy S22)
- [ ] iPad (tablet)

### Accessibility
- [ ] VoiceOver navigation (iOS)
- [ ] TalkBack navigation (Android)
- [ ] Large Text setting
- [ ] Bold Text setting
- [ ] Reduce Motion setting
- [ ] High Contrast setting

### Performance
- [ ] App loads in <2 seconds
- [ ] Animations run at 60fps
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] Fast navigation

### Functionality
- [ ] All features work without crashes
- [ ] Data persists correctly
- [ ] Network errors handled gracefully
- [ ] Offline mode shows appropriate messaging

---

## Success Metrics

### Phase 1 (82/100)
- Typography passes accessibility audit
- Color contrast ratios all >4.5:1
- FAB looks premium
- Avatar component production-ready

### Phase 2 (90/100)
- All interactions have feedback
- Charts display correctly
- Layout is balanced
- Micro-animations delight users

### Phase 3 (95/100)
- Navigation is intuitive
- Accessibility score >90%
- Mobile optimization complete

### Phase 4 (100/100)
- App feels premium
- Dark mode works flawlessly
- All polish items complete
- Ready for App Store submission

---

## Final Deliverables

1. **Updated app** achieving 100/100 score
2. **Component library** documentation
3. **Design system** guide
4. **Accessibility** audit report
5. **Performance** benchmark report
6. **App Store** screenshots and marketing materials

---

**Estimated Total Effort:** 9-13 days
**Target Launch Date:** [Add date based on start date + 13 days]

