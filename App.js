import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCustomFonts } from "./useCustomFont";
import {
  AlertNotificationRoot,
} from "react-native-alert-notification";

import UserProvider from './contextAPI/userProvider';
import AppNav from './navigation/appNav';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkProvider } from './contextAPI/networkProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  
  if (!BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => {};
  }

  const [userDataDetails, setUserDataDetails]= useState('');
  const [userLogToken, setUserLogToken] = useState('');

      const _getUserLocalInfo = async () => {
        try {
          const UserInfo = await AsyncStorage.getItem('userInfo');
          const parsedUserInfo = UserInfo ? JSON.parse(UserInfo) : null;
          if (!parsedUserInfo || !parsedUserInfo.userData) {
            // handle missing user
            console.log('No user info found');
          }
        } catch (error) {
          console.log('Error retrieving local info', error);
        }
      };

      const _getUserTokenInfo = async () =>{
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken !== null) {
            setUserLogToken(userToken);
          } else {
            setUserLogToken('');
          }
        } catch (error) {
          console.log("Local error here ", error.message);
        }
      };

     useEffect(() =>{
        _getUserLocalInfo();
         _getUserTokenInfo()
     }, []);

  const { fontsLoaded } = useCustomFonts();
  
      if (!fontsLoaded) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1D2667" />
          </View>
        );
      }

  return (
    <SafeAreaProvider>
        <NetworkProvider >
          <UserProvider>
              <AlertNotificationRoot>
                <AppNav />
               {/* <FundAccountNextScreen /> */}
              </AlertNotificationRoot>
          </UserProvider>
        </NetworkProvider>
        </SafeAreaProvider>
  );
}


