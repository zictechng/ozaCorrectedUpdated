import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandPageScreen from '../screens/landPageScreen';
import SignupScreen from '../screens/signupScreen';
import LoginScreen from '../screens/loginScreen';
import ForgetPasswordScreen from '../screens/forgetPasswordScreen';
import VerifySignupScreen from '../screens/verifySignupScreen';
import _retrieveData from '../components/firstLaunch';
import { AuthContext } from '../contextAPI/authContext';
import TermsConditionsScreen from '../screens/term_conditionScreen';


const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const {userLaunch, setUserLaunch} = useContext(AuthContext)
  //console.log(userLaunch)

  // This will make scree slide from left to right / right to slide
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
            <Stack.Navigator screenOptions={{headerShown:false}}>

                  <Stack.Screen 
                    component={LandPageScreen} 
                    name="LandPage" 
                    screenOptions={{horizontalAnimation}}/>

                  <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
                  <Stack.Screen 
                    component={LoginScreen} 
                    name="Login"
                    screenOptions={{animation: 'slide_from_right'}}/>
                    </Stack.Group>

                    <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
                    <Stack.Screen 
                      component={SignupScreen} 
                      name="Register"
                      screenOptions={{animation: 'slide_from_right'}}/>
                    </Stack.Group>
                   
                    <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
                    <Stack.Screen 
                      component={ForgetPasswordScreen}
                      screenOptions={{animation: 'slide_from_right'}}
                      name="ForgetPassword"/>
                    </Stack.Group>
                    
                    <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
                      <Stack.Screen 
                      component={VerifySignupScreen} 
                      name="VerifyOTP"
                      screenOptions={{animation: 'slide_from_right'}}/>
                    </Stack.Group>

                    <Stack.Group screenOptions={{ animation: 'slide_from_right'}}>
                      <Stack.Screen 
                      component={TermsConditionsScreen} 
                      name="Terms_Conditions"
                      screenOptions={{animation: 'slide_from_right'}}/>
                    </Stack.Group>
                  
            </Stack.Navigator>


// this is for checking if app has been launched before then show login page
// Do't show welcome page
              // <Stack.Navigator screenOptions={{headerShown:false}}>
              // {userLaunch == null ? <Stack.Screen component={WelcomeStack} name="WelcomePage" />:
              // <>
              // <Stack.Screen component={LoginScreen} name="Login"/>
              // <Stack.Screen component={SignupScreen} name="Register"/>
              // <Stack.Screen component={ForgetPasswordScreen} name="ForgetPassword"/>
              // <Stack.Screen component={VerifySignupScreen} name="VerifyOTP"/>
              // </>
              // }
              // </Stack.Navigator>

            
  );
}


export default AuthStack;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
