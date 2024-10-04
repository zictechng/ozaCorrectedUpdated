import 'react-native-gesture-handler';
import React, { useEffect, useState } from "react";
import registerNNPushToken from 'native-notify';
import { useCustomFonts } from "./useCustomFont";
import {
  AlertNotificationRoot,
} from "react-native-alert-notification";

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNav from './navigation/appNav';
import UserProvider from './contextAPI/userProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App({navigation}) {
  registerNNPushToken(20657, 'ceihqjd7quGFm0Oe0IDDzL');

  const [userDataDetails, setUserDataDetails]= useState('');
  const [userLogToken, setUserLogToken] = useState('');
  
  // get user information from local storage here
 _getUserLocalInfo = async () =>{
  try {
    const UserInfo = await AsyncStorage.getItem('userInfo');
    if(UserInfo.userData == null) {
      navigation.replace('Login')
    }
  } catch (error) {
    }
 }
 _getUserTokenInfo = async () =>{
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    //const launch = await AsyncStorage.getItem('alreadyLaunch');
    if (userToken !== null) {
      setUserLogToken(userToken);
      //console.log("User Token in App ", userToken);
    }
    else{
      setUserLogToken('');
    }
    //console.log("User launch the App already ", launch);
  } catch (error) {
    // Error retrieving data
    //console.log("Local error here ", error.message);
  }
 }
 
 useEffect(() =>{
    _getUserLocalInfo();
    _getUserTokenInfo()
}, []);

  const { fontsLoaded } = useCustomFonts();

  if (fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
          <AlertNotificationRoot>
            <AppNav />
           {/* <FundAccountNextScreen /> */}
          </AlertNotificationRoot>
      </UserProvider>
  );
}

