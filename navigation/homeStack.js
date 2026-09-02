import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/homeScreen';
import HistoryScreen from '../screens/historyScreen';
import SettingScreen from '../screens/settingScreen';
import ProfileScreen from '../screens/profileScreen';
import TransactionMenus from '../screens/transactionMenus';
import useThemeStyles from '../hooks/useThemeStyles';

const Tab = createBottomTabNavigator();

const HomeStack = () => {
  const { colors, isDark } = useThemeStyles();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primaryColor1,
        tabBarInactiveTintColor: colors.textSecColor,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.dividerColor,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 90 : 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: '_semiBold',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
      }}>

      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons
              name={focused ? 'dashboard' : 'dashboard'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Transactions */}
      <Tab.Screen
        name="Transaction"
        component={TransactionMenus}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* History */}
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default HomeStack;

const styles = StyleSheet.create({});