import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LandPageScreen from '../screens/landPageScreen';
import LoginScreen from '../screens/loginScreen';
import SignupScreen from '../screens/signupScreen';
import ForgetPasswordScreen from '../screens/forgetPasswordScreen';
import VerifySignupScreen from '../screens/verifySignupScreen';
import TermsConditionsScreen from '../screens/term_conditionScreen';
import PrivacyPolicyScreen from '../screens/privacyPolicyScreen';

const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────
// AUTH STACK
// All unauthenticated screens live here.
// Shown when user is not logged in.
// ─────────────────────────────────────────────────
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* ── ONBOARDING ───────────────────────── */}
      <Stack.Screen
        name="LandPage"
        component={LandPageScreen}
        options={{ animation: 'fade' }}
      />

      {/* ── AUTHENTICATION ───────────────────── */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Register"
        component={SignupScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ForgetPassword"
        component={ForgetPasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VerifyOTP"
        component={VerifySignupScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* ── LEGAL — accessible before login ──── */}
      <Stack.Screen
        name="Terms_Conditions"
        component={TermsConditionsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      {/* Alias used in landPageScreen + signupScreen */}
      <Stack.Screen
        name="TermCondition"
        component={TermsConditionsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Privacy_Policy"
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      {/* Alias used in landPageScreen + signupScreen */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ animation: 'slide_from_right' }}
      />

    </Stack.Navigator>
  );
};

export default AuthStack;