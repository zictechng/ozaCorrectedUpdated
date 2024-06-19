import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons, AntDesign} from '@expo/vector-icons';
import { colors } from '../styles';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/homeScreen';
import ProfileScreen from '../screens/profileScreen';
import InboxMessageScreen from '../screens/inboxMessageScreen';
import HistoryScreen from '../screens/historyScreen';
import SettingScreen from '../screens/settingScreen';
import CustomDrawer from '../components/customDrawer';
import { AuthContext } from '../contextAPI/authContext';
import FundAccountScreen from '../screens/fundAccountScreen';
import SendFundScreen from '../screens/sendFundScreen';
import ReferralScreen from '../screens/referralScreen';
import FundAccountNextScreen from '../screens/fundAcctNextScreen';

const Drawer = createDrawerNavigator();

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
    <Drawer.Navigator drawerContent={props =><CustomDrawer {...props}/>} 
    screenOptions={{headerShown:false,
    animation: 'slide_from_right', 
    drawerActiveBackgroundColor: colors.primaryColor1,
    drawerActiveTintColor:'#fff',
    drawerInactiveTintColor:'#333',
    drawerLabelStyle:{marginLeft: -20, 
    fontFamily:'_regular', fontSize:17}}}>

 <Drawer.Screen component={HomeScreen} name="Dashboard"
    options={{
        drawerIcon:({color}) =>(
            <Ionicons name="home-outline" size={22} color={color} />
        )
    }}
    
 />
<Drawer.Screen component={ProfileScreen} name="Profile"
screenOptions={{horizontalAnimation}}
    options={{
        drawerIcon:({color}) =>(
            <Ionicons name="person-outline" size={22} color={color} />
        )
    }}
    
/>
<Drawer.Group >
<Drawer.Screen component={FundAccountScreen} name="FundAccount"
    screenOptions={{ animation: 'slide_from_right'}}
    options={{
        animation: 'slide_from_right',
        title:'Fund Account',
        drawerIcon:({color}) =>(
            <Ionicons name="add-circle-outline" size={22} color={color} />
        )
    }}
/>
</Drawer.Group>
<Drawer.Screen component={SendFundScreen} name="SendFund"
    options={{
        title:'Send Fund',
        drawerIcon:({color}) =>(
            <Ionicons name="send-outline" size={22} color={color} />
        )
    }}
/>

<Drawer.Screen component={InboxMessageScreen} name="Message"
    options={{
        drawerIcon:({color}) =>(
            <Ionicons name="chatbox-ellipses-outline" size={22} color={color} />
        )
    }}
/>
<Drawer.Screen component={HistoryScreen} name="History"
    options={{
        drawerIcon:({color}) =>(
            <Ionicons name="timer-outline" size={22} color={color} />
        )
    }}
/>
<Drawer.Screen component={ReferralScreen} name="Referrals"
    options={{
        title:'Referrals',
        drawerIcon:({color}) =>(
            <AntDesign name="addusergroup" size={22} color={color} />
        )
    }}
/>
<Drawer.Screen component={SettingScreen} name="Setting"
    options={{
        title:'Setting',
        drawerIcon:({color}) =>(
            <Ionicons name="settings-outline" size={22} color={color}  />
        )
    }}
/>

</Drawer.Navigator>
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
