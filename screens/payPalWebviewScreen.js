import React, { useContext, useState, useEffect }  from 'react';
import { Dimensions, Animated, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderMenu from '../components/headerMenu';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { gs, colors } from "../styles";
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const {width, height} = Dimensions.get('screen');
const PayPalWebviewScreen = ({route, navigation}) => {
    let routeName = route.params?.amt;
    const { uri } = route.params;
    //let routeServiceType = route.params?.categoryType
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [baseUrl, setBaseUrl] = useState({});
    const [show, setShow] = useState(true)
    
    // get local storage app setting details
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
      const dataBaseUrl = JSON.parse(res)
      setBaseUrl(dataBaseUrl.app_baseurl)
      })
    
         useEffect(() => {
            const timeId = setTimeout(() => {
              // After 3 seconds set the show value to false
              setShow(false)
            }, 3000)
        
            return () => {
              clearTimeout(timeId)
            }
          }, []);

        //console.log('Base URL: ' + baseUrl)
          const handleNavigationStateChange = (newNavState) => {
            //console.log('navigation ', newNavState)
            if (newNavState.title == '' && newNavState.url.includes(`${baseUrl}/api/success`)) {
                navigation.navigate('Home')
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    button:'Okay',
                    textBody: 'Payment was successful',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  });
                  return
            }
            else if (newNavState.title != '' && newNavState.url.includes(`${baseUrl}/api/success`)) {
                navigation.navigate('Home')
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    button:'Okay',
                    textBody: 'Payment was successful',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  });
                  return
            }
            else if (newNavState.title != '' && newNavState.url.includes(`${baseUrl}/api/cancel`)) {
                navigation.navigate('Home')
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'Payment cancelled or failed',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  });
                  return
            }
            
            
          };

  return (
            <SafeAreaView style={{flex: 1, backgroundColor:colors.colorWhite}}>
                <StatusBar barStyle="dark-content" backgroundColor={"transparent"} />

                    <HeaderMenu
                    buttonHome={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <View  style={gs.homeSideMenu}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                          </View>
                    
                  </TouchableOpacity>
                    }/>

                    <View style={{ flex: 1 }}>
                        <WebView
                            source={{ uri }}
                            onNavigationStateChange={handleNavigationStateChange}
                            startInLoadingState // or `startInLoadingState={true}`
                            renderLoading={() => <ActivityIndicator
                              style={{
                                  backgroundColor: 'transparent', position: 'absolute', left: width * 0.35, top: height / 2 - 50, zIndex: 9,
                                  height: width * 0.3,
                                  width: width * 0.3,
                                  borderRadius: 20
                              }}
                              color={colors.primaryColor1}
                              size="large" />}
                         />
                </View>
             </SafeAreaView>
        );
}

const styles = StyleSheet.create({
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
      },
})

export default PayPalWebviewScreen;
