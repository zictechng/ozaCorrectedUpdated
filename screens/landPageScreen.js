import React, {useContext, useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  StyleSheet,
  Text, 
  View, 
  ScrollView, 
  ImageBackground, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { gs, colors } from '../styles';
import bgImageLocal from '../assets/images/app_land2.jpg';
import client from '../contextAPI/client';
import { AuthContext } from '../contextAPI/authContext';
import * as Updates from 'expo-updates';
import { ShowUpdateModal } from '../components/controls';
import RenderHTML from 'react-native-render-html';

const LandPageScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const [appLoading, setAppLoading] = useState(false)
  const [appInfo, setAppInfo] = useState({})
  const [appDetails, setAppDetails] = useState({});
  const {isLoading, userEmail, setUserEmail, otpStatus, setOtpStatus, appSettingDetails} = useContext(AuthContext)
  const [iLoading, setILoading] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const { width } = useWindowDimensions();

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

  // fetch app laughing page information 
  const pageInfo = async (setAppDetails, setAppLoading) => {
    try {
      setAppLoading(true);
      const res = await client.get('/api/fetchApp_info');
  
      if (res.data.msg === '200') {
        const appSettingDetails = res.data;
  
        // update state
        setAppDetails(appSettingDetails);
  
        // persist locally
        await AsyncStorage.setItem(
          'AppSettingInfo',
          JSON.stringify(appSettingDetails)
        );
        //console.log('Fresh settings saved locally');
      } else if (res.data.status === '404') {
        console.log('Access Login failed', res.data.status);
      }
    } catch (err) {
      console.log('Error fetching app info', err.message);
    } finally {
      setAppLoading(false);
    }
  };
      
       // get app information from local storage here
    const getAppLocalInfo = async (setAppDetails, setAppLoading) => {
        try {
          setAppLoading(true);
          const res = await AsyncStorage.getItem('AppSettingInfo');
      
          if (res !== null) {
            const parsed = JSON.parse(res);
            setAppDetails(parsed);
            console.log('Loaded cached settings');
          } else {
            // If nothing in storage, fetch from API
            await pageInfo(setAppDetails, setAppLoading);
          }
        } catch (err) {
          console.log('Error reading local storage', err.message);
        } finally {
          setAppLoading(false);
        }
      };

  //console.log(appDetails.infoData?.app_launch_title)


  useEffect(() => {
    // 1. Load local storage
    // 2. Then fetch new data
    const init = async () => {
      await getAppLocalInfo(setAppDetails, setAppLoading);
      // fetch fresh data from API and update storage
      await pageInfo(setAppDetails, setAppLoading);
    };

    init();
  }, []);

  if (appLoading && !appDetails) {
    return <ActivityIndicator size="large" color={colors.primaryColor1} />;
  }

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

  const htmlContent =
    appDetails.infoData?.app_launch_desc ||
    appInfo.app_launch_desc;

  return (
        <ImageBackground style={{flex:1}} source={bgImageLocal} resizeMode='cover'>
           
            <StatusBar barStyle='light-content' translucent backgroundColor="transparent"/>
            
              {/* <View style={{flex:1, backgroundColor:'transparent'}}></View> */}
                    <View style={{flex:2, alignItems: 'center',justifyContent: 'center'}}>
                      <Text style={[gs.logoText]}>{appDetails.infoData?.app_name? appDetails.infoData?.app_name.toUpperCase() : appInfo.app_name?.toUpperCase() || ''}</Text>
                    </View>
                    <ScrollView>
                <Animatable.View animation='fadeInUpBig' style={{flex:4, backgroundColor:'transparent'}}>

                  <View style={{marginHorizontal:15}}>
                      <Text style={gs.landPageTitle}>{appDetails.infoData?.app_launch_title? appDetails.infoData?.app_launch_title : appInfo.app_launch_title}</Text>
                      
                      <View style={{marginTop:30}}>
                      <Text style={gs.landPageDesc}>
                      <RenderHTML
                        contentWidth={width}
                        source={{ html: htmlContent }}
                      /></Text>
                      
                     </View>

                        {/* <View style={{alignItems:'center', marginTop:60}}>
                          <TouchableOpacity style={gs.startButton} onPress={() => navigation.navigate('Login')}>
                              <View style={gs.start_circleIcon}>
                              <MaterialIcons name="navigate-next" size={24} color="black" />
                              </View>
                          </TouchableOpacity>
                      </View> */}
                    
                  </View>
                  
                </Animatable.View>
            </ScrollView>

                  <View style={styles.buttonContainer}>
                  <TouchableOpacity style={gs.startButton} onPress={() => navigation.navigate('Login')}>
                    <View style={gs.start_circleIcon}>
                      <MaterialIcons name="navigate-next" size={24} color="black" />
                    </View>
                  </TouchableOpacity>
                </View>

                  <ShowUpdateModal 
                    openModal={isUpdateAvailable}
                    animationType={'fade'}
                    modalTitle={'New Update!'}
                    ModalDesc={'A new version is available please, download latest update'}
                    logoutBtn={() => openPlayStore()}
                    modalBgColor={"rgba(0,0,0,0.4)"}
                    bntYesText={'Download Update'}
                />
            
        </ImageBackground>
      );
}

const styles = StyleSheet.create({
  landPageDesc:{
    fontSize: 15,
    color: "#fff",
    fontFamily: "_regular",
    letterSpacing: -0.08
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40, // adjust as needed
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LandPageScreen;
