import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandPageScreen from '../screens/landPageScreen';
import SignupScreen from '../screens/signupScreen';
import LoginScreen from '../screens/loginScreen';
import ForgetPasswordScreen from '../screens/forgetPasswordScreen';
import VerifySignupScreen from '../screens/verifySignupScreen';
import _retrieveData from '../components/firstLaunch';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LandStack = createNativeStackNavigator();

const WelcomeStack = () => {
  return (
            <LandStack.Navigator screenOptions={{headerShown:false}}>
                <LandStack.Screen component={LandPageScreen} name='LandPage' />
                <LandStack.Screen component={LoginScreen} name='Login' />
                <LandStack.Screen component={SignupScreen} name='Register' />
                <LandStack.Screen component={ForgetPasswordScreen} name='ForgetPassword' />
            </LandStack.Navigator>
  );
}

export default WelcomeStack
