import React, {useContext, useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  StyleSheet,
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  Linking
} from 'react-native';
//import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { gs, colors } from '../styles';
import bgImageLocal from '../assets/images/bg6.png';
import client from '../contextAPI/client';
import { AuthContext } from '../contextAPI/authContext';
import * as Updates from 'expo-updates';
import { ShowUpdateModal } from '../components/controls';

const LandPageScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const [appLoading, setAppLoading] = useState(false)
  const [appInfo, setAppInfo] = useState({})
  const [appDetails, setAppDetails] = useState({});
  const {isLoading, userEmail, setUserEmail, otpStatus, setOtpStatus, appSettingDetails} = useContext(AuthContext)
  const [iLoading, setILoading] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  // check if user otp is pending
  const isPendingOTP = async()=>{
    try {
      setILoading(true);
      let otpDetails = await AsyncStorage.getItem('userOTP');
        //console.log('User Code ', otpDetails)
        let userOtpDetails = JSON.parse(otpDetails)
        if(userOtpDetails){
          setUserEmail(userOtpDetails.email)
          setOtpStatus(true)
         //console.log('User Code ', userOtpDetails.email)
         navigation.navigate("VerifyOTP")
        }
     } catch (error) {
      console.log(`Login error ${error.message}`);
    }
    finally{
      setILoading(false);
    }
  }
  useEffect(() =>{
    _getAppLocalInfo()
    isPendingOTP()
    // check for new updates
    async function checkForUpdate() {
      try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
          setIsUpdateAvailable(true);
          console.log('Update available')
      }
      } catch (error) {
      console.error('Error checking for updates:', error);
      }
  }
  checkForUpdate();
     // check for new updates
    //  async function checkForUpdate() {
    //   try {
    //     const update = await Updates.checkForUpdateAsync();
    //     if (update.isAvailable) {
    //       setIsUpdateAvailable(true);
    //       console.log('Update available')
    //     }
    //   } catch (error) {
    //     console.error('Error checking for updates:', error);
    //   }
    // }
    // checkForUpdate();

   }, [])

   //console.log('App URL ', appSettingDetails.app_baseurl)
  // fetch app laughing page information 
    const pageInfo = async() =>{
      try{
        setAppLoading(true)
        const res = await client.get('/api/fetchApp_info')
            //console.log('response ', JSON.stringify(res.data))
            if(res.data.msg =='200'){
              let appSettingDetails = res.data;
             //console.log('Yes ')
             setAppInfo(res.data.infoData)
             AsyncStorage.setItem('AppSettingInfo',  JSON.stringify( appSettingDetails));
            }
            else if(res.data.status == '404'){
               console.log('Access Login failed ', res.data.status)
              }
           }catch (e){
            console.log(e.message);
            }
        finally{
          setAppLoading(false);
        }
      }
      
       // get app information from local storage here
 _getAppLocalInfo = async () =>{

  AsyncStorage.getItem('AppSettingInfo').then(res =>{
      if(res != null){
          setAppDetails(JSON.parse(res))
          //console.log(res);
      }
      else if(res == null || res == '' || res== undefined){
        pageInfo()
      }
      }).catch(err => console.log(err.message))
   }
  //const bgImageLocal = require("../assets/images/bg6.png");

   // this function will be called and redirect user to google app store to download new version
   const openPlayStore = () => {
    Linking.openURL('market://details?id=com.zictech.ozaapp')
      .catch(() => {
        // Fallback if Google Play Store is not available
        Linking.openURL('https://play.google.com/store/apps/details?id=com.zictech.ozaapp');
      });
   };
  
  if(appLoading){
    return (
      <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:colors.primaryColor2}}>
                {
                     isFocused &&
                        <StatusBar
                            barStyle={'light-content'}
                            translucent
                            backgroundColor="transparent"
                        />
                    }
          <ActivityIndicator size={'large'} color={colors.textColor} />
      </View>
      )
  }

  if(isLoading){
    return (
      <View style={{flex: 1, justifyContent:'center', alignItems:'center', backgroundColor:colors.primaryColor2}}>
                {
                     isFocused &&
                        <StatusBar
                            barStyle='light-content'
                            translucent
                            backgroundColor="transparent"
                        />
                    }
          <ActivityIndicator size={'large'} color={colors.textColor} />
      </View>
      )
  }

  return (
        <ImageBackground style={{flex:1}} source={bgImageLocal} resizeMode='cover'>
           
            <StatusBar barStyle='light-content' translucent backgroundColor="transparent"/>
            
                <View style={{flex:1, backgroundColor:'transparent'}}></View>
                    <View style={{flex:3, alignItems: 'center',justifyContent: 'center'}}>
                      <Text style={[gs.logoText]}>{appDetails.infoData?.app_name? appDetails.infoData?.app_name.toUpperCase() : appInfo.app_name?.toUpperCase() || ''}</Text>
                    </View>
                    <ScrollView>
                <Animatable.View animation='fadeInUpBig' style={{flex:4, backgroundColor:'transparent'}}>

                  <View style={{marginHorizontal:15}}>

                      <Text style={{fontSize:40, color: colors.lightGreenColor1, fontWeight:'700'}}>-------</Text>

                      <Text style={gs.landPageTitle}>{appDetails.infoData?.app_launch_title? appDetails.infoData?.app_launch_title : appInfo.app_launch_title}</Text>
                      
                      <View style={{marginTop:15}}>
                      <Text style={gs.landPageDesc}>
                        {appDetails.infoData?.app_launch_desc? appDetails.infoData?.app_launch_desc: appInfo.app_launch_desc}</Text>
                      
                     </View>

                        <View style={{alignItems:'flex-end', marginTop:40}}>
                          <TouchableOpacity style={gs.circleIconLeft} onPress={() => navigation.navigate('Login')}>
                              <View style={gs.circleIcon}>
                              <MaterialIcons name="navigate-next" size={24} color="black" />
                              </View>
                          </TouchableOpacity>
                      </View>
                    
                  </View>
                  
                </Animatable.View>

                <ShowUpdateModal 
                    openModal={isUpdateAvailable}
                    animationType={'fade'}
                    modalTitle={'New Update!'}
                    ModalDesc={'A new version is available please, download latest update'}
                    logoutBtn={() => openPlayStore()}
                    modalBgColor={"rgba(0,0,0,0.4)"}
                    bntYesText={'Download Update'}
                />
            </ScrollView>
            
           
        </ImageBackground>
      );
}

const styles = StyleSheet.create({
  landPageDesc:{
    fontSize: 13,
    color: "#fff",
    fontFamily: "_regular",
    letterSpacing: -0.08
  }
  
});

export default LandPageScreen;
