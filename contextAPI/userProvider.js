import React, {useState, useEffect, useContext} from 'react';
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
    
    // const updateUserEmail = (newValue) => {
    //   setUserRegEmail({ ...userRegEmail, value: newValue });
    // };


  // get user information from local storage here
 _getAppLocalInfo = async () =>{

  AsyncStorage.getItem('userInfo').then(res =>{
      if(res != null){
          setUserInfo(JSON.parse(res))
          //console.log('User data ', res);
      }
      else if(res == null || res == '' || res== undefined){
        pageInfo()
      }
      }).catch(err => console.log(err.message))
   }
    // login function
    const loginAction = async(username, password)=>{
      //console.log('Login details:', username, password);
      setIsBtnLoading(true);
      try {
        setIsLoading(true);
        setIsButtonDisable(true);
        const res = await client.post('/api/login', {
          username,
          password
      })
        //console.log(res.data);
    if(res.data.msg =='200'){ 
      //console.log('App Setting ' ,res.data.appData);
      let userInfo = res.data;
      let appSettingDetails = res.data.appData;
        setUserInfo(userInfo)
        setUserToken(userInfo.token)

        setAppSettingDetails(appSettingDetails)
        AsyncStorage.setItem('userToken', userInfo.token);
        AsyncStorage.setItem('AppSettingData',  JSON.stringify( appSettingDetails));
        AsyncStorage.setItem('userInfo', JSON.stringify( userInfo));
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
      
      //logout function 
      const logoutAction = ()=>{
      setIsLoading(true);
      //setUserLaunch(false)
      setUserToken(null);
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userInfo');
      AsyncStorage.removeItem('AppSettingInfo');
      //AsyncStorage.removeItem('alreadyLaunch');
      setIsLoading(false);
    }

    const navigateContact = ()=>{
      setContactNavigation(true);
    }

    const pageInfo = async() =>{
      try{
        setIsLoading(true)
        const res = await client.get('/api/fetchApp_info')
            //console.log('response ', JSON.stringify(res.data))
            if(res.data.msg =='200'){
             //console.log('Yes ')
             setAppSettingDetails(res.data.infoData)
            }
            else if(res.data.status == '404'){
              // console.log('App details details ', res.data.status)
              }
           }catch (e){
            console.log(e.message);
            }
        finally{
          setIsLoading(false);
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
            console.log('User LoggedIn ')
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
            // We have data!!
            setUserLaunch(value);
            }
      } catch (error) {
       // Error retrieving data
       console.log("No first launch error ");
      }
    }

    useEffect(() =>{
      isLoggedIn()
      _getAppLocalInfo()
      pageInfo()
      _retrieveData()
  //    setTimeout(async() =>{
  //       AsyncStorage.getItem('alreadyLaunch').then(value =>{
  //         if(value == null){
  //           AsyncStorage.setItem('alreadyLaunch', 'true');
  //         }
  //         else if(value !== null){
  //           setUserLaunch(true);
  //         }
  //       });
  //  }, 1000)
      
    }, [])
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
          logoutModal, setLogoutModal}}
          >
            {children}
        </AuthContext.Provider>
    )
}

export default UserProvider