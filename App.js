import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { isProfileComplete } from './utils/userProfile';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import SelectHormoneScreen from './screens/SelectHormoneScreen';
import TestInputScreen from './screens/TestInputScreen';
import ImpactScreen from './screens/ImpactScreen';
import AskScreen from './screens/AskScreen';
import BioAgeScreen from './screens/BioAgeScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const profileComplete = await isProfileComplete();
    setInitialRoute(profileComplete ? 'Dashboard' : 'UserProfile');
  };

  // Wait for profile check
  if (!initialRoute) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            initialParams={{ onboarding: true }}
          />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="SelectHormone" component={SelectHormoneScreen} />
          <Stack.Screen name="TestInput" component={TestInputScreen} />
          <Stack.Screen name="Impact" component={ImpactScreen} />
          <Stack.Screen name="Ask" component={AskScreen} />
          <Stack.Screen name="BioAge" component={BioAgeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </>
  );
}
