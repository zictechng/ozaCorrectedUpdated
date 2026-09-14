import React, {useState, useEffect, useContext} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import client from "./client";
import { AuthContext } from './authContext';
import ErrorNotice, { noticeData } from '../components/errorNotice';

const UserProvider = ({children}) =>{
    const [test, setTest] = useState('Test Value');
    const [isLoading, setIsLoading] = useState(false);
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [isButtonDisable, setIsButtonDisable] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [appSettingDetails, setAppSettingDetails] = useState();
    const [userLaunch, setUserLaunch] = useState(null);
    const [PayPalKey, setPayPalKey] = useState('');
    const [payStackKey, setPayStackKey] = useState('');

    const [nextPage, setNextPage] = useState(false);
    const [userEmail, setUserEmail] = useState();
    const [appInfoSetting, setAppInfoSetting] = useState();
    const [appBaseUrl, setAppBaseUrl] = useState('');
    const [completeRegData, setCompleteRegData] = useState(false);
    const [homeChartDisplay, setHomeChartDisplay] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [otpStatus, setOtpStatus] = useState(false)

  // get user information from local storage here
  const _getAppLocalInfo = async () =>{
  await AsyncStorage.getItem('userInfo').then(res =>{
      if(res != null){
          setUserInfo(JSON.parse(res))
      }
      else if(res == null || res == '' || res== undefined){
        pageInfo()
      }
      }).catch(err => console.log(err.message))
   }

    // login function
    const loginAction = async(username, password)=>{
      setIsBtnLoading(true);
      try {
        setIsLoading(true);
        setIsButtonDisable(true);
        const res = await client.post('/api/login', {
          username,
          password
      })
    if(res.data.msg =='200'){ 
      let userInfo = res.data;
      let appSettingDetails = res.data.appData;
        setUserInfo(userInfo)
        setUserToken(userInfo.token)
        setAppSettingDetails(appSettingDetails)
        AsyncStorage.setItem('userToken', userInfo.token);
        AsyncStorage.setItem('AppSettingData', JSON.stringify(appSettingDetails));
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

        // ── Fetch fresh profile immediately after login ──
        try {
          const profileRes = await client.get(
            '/api/userProfileMobile/' + userInfo.userData._id,
            { headers: { 'Authorization': 'Bearer ' + userInfo.token } }
          );
          if (profileRes.data.msg === '200') {
            setUserInfo(profileRes.data);
            AsyncStorage.setItem('userInfo', JSON.stringify(profileRes.data));
          }
        } catch (profileError) {
          console.log('Profile refresh error:', profileError.message);
        }
        }
      else if(res.data.status == '401') {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Failed',
            textBody: 'No user record found',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          })
          }
          else if(res.data.status == '404'){
          Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Failed',
              textBody: 'Username or Password incorrect.',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
              })
            }
            else if(res.data.status == '402'){
              Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Failed',
                  textBody: 'Account not active',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                  })
              } 
              else if(res.data.status == '400'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Username or password missing',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                } 
          else {
              Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  textBody: 'Sorry, Something went wrong.',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                  })
              } 
        } catch (error) {
          console.log(error.message)
          if(error.message == 'Network Error'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message +' occurred',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
          } 
        }
        finally {
          setIsLoading(false);
          setIsBtnLoading(false);
          setIsButtonDisable(false);
          }
      }
      
      // Async logout API call
        const logoutRequest = async (logout_data) => {
          try {
            const authLogout = await client.get(`/api/user_logout/${logout_data}`);
            return authLogout.data;
          } catch (error) {
            console.error("Error during logout:", error.message);
            throw new Error("Logout failed");
          }
        };

    // Logout Action
      const logoutAction = async () => {
        try {
          setIsLoading(true);
          const logout_data = userInfo?.userData?._id;
          if (logout_data) {
            await logoutRequest(logout_data);
          }

          await AsyncStorage.multiRemove([
            'userToken',
            'userInfo',
            'AppSettingData',
          ]);

          setUserToken(null);
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          setIsLoading(false);
        }
      };

        const navigateContact = ()=>{
      setContactNavigation(true);
    }

    // ── Refresh user profile from API ─────────────
    const refreshUserProfile = async () => {
        try {
          if (!userToken || !userInfo?.userData?._id) return;
          
          const res = await client.get(
            '/api/userProfileMobile/' + userInfo.userData._id,
            { headers: { 'Authorization': 'Bearer ' + userToken } }
          );
          //console.log('User profile fetch:', res.data);
          // 1. Check if backend explicitly returns a blocked/suspended status in the payload
          const userStatus = res.data?.userData?.acct_status; // Adjust key based on your DB schema (e.g., 'active', 'suspended', 'blocked')
          if (userStatus === 'suspended' || userStatus === 'blocked' || userStatus === 'deleted') {
            await logoutAction();
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Account Restricted',
              textBody: 'Your account has been suspended or blocked! Contact support.',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            });
            return;
          }

          // 2. Normal profile and balance sync
          if (res.data.msg === '200') {
            setUserInfo(res.data);
            await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
          }
        } catch (error) {
          console.log('Refresh profile error:', error.message);

          // 3. If the token is invalidated or user is deleted on the backend (yielding 401/403/404)
          if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
            await logoutAction();
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Session Expired',
              textBody: 'Your account status has changed. Please log in again.',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            });
          }
        }
      };

    // Updated with isBackground flag to avoid full-screen spinner flicker during sync
    const pageInfo = async(isBackground = false) =>{
      try{
        if (!isBackground) setIsLoading(true);
        const res = await client.get('/api/fetchApp_info')
            if(res.data.msg =='200'){
             setAppSettingDetails(res.data.infoData)
             await AsyncStorage.setItem('AppSettingData', JSON.stringify(res.data.infoData));
            }
           }catch (e){
            console.log(e.message);
           }
        finally{
          if (!isBackground) setIsLoading(false);
        }
      }

    // is logged in function here
    const isLoggedIn = async()=>{
      try {
        setIsLoading(true);
        let userToken = await AsyncStorage.getItem('userToken');
        let userInfo = await AsyncStorage.getItem('userInfo');
        let appSettingDetails = await AsyncStorage.getItem('AppSettingData');
          
          userInfo = JSON.parse(userInfo)
          appSettingDetails = JSON.parse(appSettingDetails)
          if(userInfo){
            setUserToken(userToken);
            setUserInfo(userInfo);
            setAppSettingDetails(appSettingDetails)
          }
       } catch (error) {
        console.log(`Login error ${error.message}`);
      }
      finally{
        setIsLoading(false);
      }
    }

    const _retrieveData = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunch');
          if (value !== null) {
            setUserLaunch(value);
            }
      } catch (error) {
       console.log("No first launch error ");
      }
    }

    useEffect(() =>{
      isLoggedIn()
      _getAppLocalInfo()
      pageInfo()
      _retrieveData()
    }, [])

    // ── Real-Time Auto-Sync Polling & AppState Foreground Listener ──
    useEffect(() => {
      if (!userToken) return;

      // 1. Periodic background sync every 15 seconds
      const pollInterval = setInterval(() => {
        pageInfo(true);
        refreshUserProfile();
      }, 15000);

      // 2. Instant sync when app transitions from background back to foreground
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          pageInfo(true);
          refreshUserProfile();
        }
      });

      return () => {
        clearInterval(pollInterval);
        subscription.remove();
      };
    }, [userToken]);

    return (
        <AuthContext.Provider value={{
          test, 
          loginAction, 
          logoutAction, 
          isLoading, 
          isBtnLoading,
          isButtonDisable,
          userToken,
          setUserToken,
          nextPage, 
          appSettingDetails,
          setAppSettingDetails,
          userInfo,
          setUserInfo,
          userLaunch, setUserLaunch,
          navigateContact,
          completeRegData, setCompleteRegData,
          appInfoSetting, setAppInfoSetting,
          userEmail, setUserEmail,
          payStackKey,
          homeChartDisplay, setHomeChartDisplay,
          appBaseUrl, setAppBaseUrl,
          otpStatus, setOtpStatus,
          logoutModal, setLogoutModal,
          refreshUserProfile}}
          >
            {children}
        </AuthContext.Provider>
    )
}

export default UserProvider;