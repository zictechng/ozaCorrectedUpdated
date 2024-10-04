import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Foundation, MaterialIcons} from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/homeScreen';
import HistoryScreen from '../screens/historyScreen';
import SettingScreen from '../screens/settingScreen';
import { AuthContext } from '../contextAPI/authContext';
import TransactionMenus from '../screens/transactionMenus';
import AccountMenus from '../screens/accountMenus';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

const HomeStack = ({navigation}) => {

    const {logoutAction, userInfo, setUserInfo,} = useContext(AuthContext)
    const horizontalAnimation = {
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 1],
                  }),
                },
              ],
            },
          };
        },
      };

  return (
    <Tab.Navigator
            screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                height: 60, // Set the height of the tab bar
                paddingVertical: 3, // Optional: Add padding to adjust space around icons
              },
            tabBarActiveTintColor: '#1D2667',
            tabBarInactiveTintColor: 'gray',
            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
            tabBarHideOnKeyboard: true,
      })}>
        <Tab.Screen name="Dashboard" component={HomeScreen}
            options={{
               //tabBarBadge: 3,
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                let iconColor = focused ? '#1D2667' : 'gray';
                return <MaterialIcons name={focused ? 'dashboard' : 'dashboard'} 
                size={25} 
                color={iconColor} 
                style={{ marginTop: 8 }}
                />;
                },
                  tabBarLabel: '',
                }}
        />
        <Tab.Screen name="Transaction" component={TransactionMenus} 
            options={{
                //tabBarBadge: 3,
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                 let iconColor = focused ? '#1D2667' : 'gray';
                return <Ionicons name={focused ? 'stats-chart' : 'stats-chart'} 
                size={23} 
                color={iconColor}
                style={{ marginTop: 8 }} />;
                },
                tabBarLabel: '',
                }}
        />

        <Tab.Screen name="History" component={HistoryScreen} 
            options={{
                //tabBarBadge: 3,
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                 let iconColor = focused ? '#1D2667' : 'gray';
                return <Ionicons name={focused ? 'timer' : 'timer'} 
                size={27} 
                color={iconColor}
                style={{ marginTop: 8 }} />;
                },
                tabBarLabel: '',
                }}
        />

        <Tab.Screen name="Account" component={AccountMenus} 
            options={{
                //tabBarBadge: 3,
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                let iconColor = focused ? '#1D2667' : 'gray';
                return <Ionicons name={focused ? 'person' : 'person'} 
                size={25} 
                color={iconColor}
                style={{ marginTop: 8 }} />;
                },
                tabBarLabel: '',
                }}
        />

        <Tab.Screen name="Setting" component={SettingScreen} 
            options={{
                //tabBarBadge: 3,
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                 let iconColor = focused ? '#1D2667' : 'gray';
                return <Ionicons name={focused ? 'settings' : 'settings'} 
                size={25} 
                color={iconColor}
                style={{ marginTop: 8 }} />;
                },
                tabBarLabel: '',
                }}        
        />

        
      </Tab.Navigator>
  );
}

export default HomeStack;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
