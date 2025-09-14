import React, { useContext, useEffect, useRef, useState } from 'react';
import {ToastAndroid, View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, SafeAreaView, ScrollView, Platform, ImageBackground } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Modal from "react-native-modal";
import RBSheet from "react-native-raw-bottom-sheet";
import { MaterialIcons, Ionicons, Entypo, Feather} from '@expo/vector-icons';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
//import { Switch } from 'react-native-elements';
import * as Clipboard from 'expo-clipboard';
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import { Pressable } from 'react-native';
import client from '../contextAPI/client';
import { Alert } from 'react-native';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { GetLocalStorage, LogoutModal, ShowLogoutModal, send2FANotification, sendEmailNotification, sendInAppNotification } from '../components/controls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import bgImage from '../assets/images/app_land2.jpg';


const SettingScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const {logoutAction, userToken, userInfo, setUserInfo, appSettingDetails} = useContext(AuthContext);
    const [userBankInfo, setUserBankInfo] = useState({});
    const [noRecord, setNoRecord] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEmailEnabled, setIsEmailEnabled] = useState(false);
    const [isInAppMode, setIsInAppMode] = useState(false);
    const [f2AMode, setF2Mode] = useState(false);
    const [acctPin, setAcctPin] = useState(false);
    const [acctPinLoading, setAcctPinLoading] = useState(false);
    const [logoutModalShow, setLogoutModalShow] = useState(false);

    let myId = userInfo.userData._id; // get logged in user ID
    const refSellRBSheet = useRef();

    useEffect(() => {
        getUserBankDetails();
        if(isFocused){
            RefreshUserDetails();
        }
      }, [isFocused]);
      
      useEffect(() =>{
        
        RefreshUserDetails();
        checkEmailNotificationStatus();
        check2FANotification();
        checkInAppNotification();
             
      },[])

      const openAcctPinModal =(value) =>{
        setAcctPin(value);
      }
      
      // refresh user details from db after any operation into the database
      const RefreshUserDetails = async()=>{
        try {
          const res = await client.get('/api/userProfileMobile/'+myId)
          if(res.data.msg == '200'){
            const userDetails = res.data; 
            AsyncStorage.setItem('userInfo', JSON.stringify( userDetails));
           }
           let userInfoDetails = await AsyncStorage.getItem('userInfo');
              userInfoDetails = JSON.parse(userInfoDetails)
          if(userInfoDetails){
            setUserInfo(userInfoDetails);
         //console.log('User Details fetch local storage ', userInfoDetails)
            setIsEmailEnabled(userInfoDetails.userData.receive_email_notification)
            setF2Mode(userInfoDetails.userData.activate_2fa_login)
            setIsInAppMode(userInfoDetails.userData.receive_app_message)
            
         }
          else{
              console.log("something went wrong while fetching user details")
          }
      } catch (error) {
          console.log( 'fetching user information failed ', error)
      }   
    }

    // run a api request to fetch user bank details
    const getUserBankDetails = async () =>{
        setLoading(true);
        try {
            const res = await client.get(`api/user_bankDetails/${myId}`,
                {
                    headers: {
                      'Authorization': 'Bearer '+userToken,
                      }
                  });
            if(res.data.msg == '200'){
                setUserBankInfo(res.data.bankDetail)
            }
            else if(res.data.status =='403'){
                console.log('ACCESS DENIED')
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'No access',
                    textBody: 'Access Denied',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  })
            }
            else if(res.data.status =='404'){
                setNoRecord(true)
                //console.log('no bank details found')
            }
            else if(res.data.status =='500'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Error',
                    textBody: 'Sorry, something went wrong, try again',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  })
            }
            else{
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Network Error',
                    textBody: 'Technical errored occurred, try again',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  })
            }
        } catch (error) {
            console.log("error occurred ",error)
        }
        finally {
            setLoading(false);
            }
        }
         
    // check 2FA notification current state
    const check2FANotification = () =>{
        if(userInfo.userData.activate_2fa_login == true) {
            setF2Mode(true); 
        }
        if(userInfo.userData.activate_2fa_login == false) {
            setF2Mode(false);  
        }
      }

      // check in-app notifications current state
      const checkInAppNotification = () =>{
        if(userInfo.userData.receive_app_message == true) {
            setIsInAppMode(true); 
        }
        if(userInfo.userData.receive_app_message == false) {
            setIsInAppMode(false);  
        }
      }

      // check email notification status first
    const checkEmailNotificationStatus = ()=>{
    if(userInfo.userData.receive_email_notification == true){
        setIsEmailEnabled(true);
        //console.log('active state ', isEmailEnabled)
    }
    if(userInfo.userData.receive_email_notification == false){
        setIsEmailEnabled(false);
       // console.log('active state ', isEmailEnabled)
    }
}

      // run an api request to update email sending notification for user details
    const toggleEmailSwitch = async(value) => {
        setIsEmailEnabled(value);
        // call the custom function to send api request and update db
        sendEmailNotification(userInfo.userData._id, value, userToken);
    }
        
    const toggle2FASwitch = async(value) =>{
        //setF2aSelectionMode(value)
        setF2Mode(value)
        // call the custom function to send api request and update db
        send2FANotification(userInfo.userData._id, value, userToken)
    }

    const toggleInAppSwitch = async(value) =>{
        //setF2aSelectionMode(value)
        setIsInAppMode(value)
        // call the custom function to send api request and update db
        sendInAppNotification(userInfo.userData._id, value, userToken)
    }
    
    // function to call logout hook from useContext
    const signMeOut =() =>{
        logoutAction()
        setLogoutModalShow(false);
        //navigation.navigate('Home');
        //Dialog.hide();
    }
    // close logout modal
    const closeModal = () =>{
        setLogoutModalShow(false);
      }

    const [userDetails, setUserDetails] = React.useState({
        new_pin: '',
        confirm_secureTextEntry: true,
        })
        
    const handleInputChange = (name, val) => {
        setUserDetails({
          ...userDetails,
          [name]: val,
        });
    }
// create function for the toggle button
const updateSecureTextConfirmPassword = (val) => {
    setUserDetails({
        ...userDetails,
        confirm_secureTextEntry: !userDetails.confirm_secureTextEntry
    })
}

    const resetPinAction = async() => {
        const pinData = {
            pin: userDetails.new_pin,
            userEmail: userInfo.userData.email,
            userId: userInfo.userData._id
        }
        if(userDetails.new_pin.length == 0){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title:'Error',
                textBody: 'Please, enter pin',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              })
            return
            }

        try {
            setAcctPinLoading(true)
            const res = await client.post('/api/updateUser_AccountPinMobile', pinData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                }
            })
            if(res.data.msg == '201'){
              setUserDetails({
                new_pin: '',
                confirm_secureTextEntry: true,
               })
               Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Successful',
                textBody: 'Pin updated successfully!',
                textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                titleStyle: { fontFamily: '_bold', fontSize: 20 },
               })
               openAcctPinModal(false)
                return
              }
              else if (res.data.status == '401') {
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Failed',
                  textBody: 'Authentication required',
                  textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                  titleStyle: { fontFamily: '_bold', fontSize: 20 },
                })
               }
               else if (res.data.status == '404') {
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  textBody: 'No records found',
                  textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                  titleStyle: { fontFamily: '_bold', fontSize: 20 },
                })
               }
              else if (res.data.status == '500') {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Error occurred while processing! Please try again later',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                })
              }
              else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    textBody: 'Sorry, Something went wrong',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
        
                   })
                }
            
            } catch (error) {
              //console.log('Server error occurred ', error.message)
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
              if(error.status == '500'){
                  Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  textBody: 'Server error ' +error.message,
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                  })
                  return
                  } 
            }
            finally{
                setAcctPinLoading(false);
              }
    }

    // function to logout user
    const logoutUser = () =>{
        setLogoutModalShow(true);
        // Dialog.show({
        //     type: ALERT_TYPE.WARNING,
        //     title: 'Hay!',
        //     textBody: 'Are you sure you want to logout ?',
        //     button: 'Yes',
        //     textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
        //     titleStyle: { fontFamily: '_bold', fontSize: 20 },
        //     onPressButton:(() => void signMeOut()),
        //  })
    }
      
    // block account dialog
 const blockNotice = () =>{
    Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Caution!',
        textBody: 'Are you sure you want to blocked your account ?',
        button: 'Yes',
        textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
        titleStyle: { fontFamily: '_bold', fontSize: 20 },
        onPressButton:(() => void blockMyAccount()),
     })
    }
    // block account api route
    const blockMyAccount = async() =>{
    const myData ={
        uid: userInfo.userData._id,
    }
    try {
        const res = await client.post('/api/block_AccountMobile', myData,{
        headers: {
        'Authorization': 'Bearer '+userToken,
            }
        })
        if(res.data.msg == '200'){
            logoutAction()
            //console.log(res.data.msg)
            Dialog.hide();
        Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: 'Your account has been blocked successfully',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        }
        else{
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title:'Sorry',
                textBody: 'Something went wrong, try again later',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              })
            return
        }
    } catch (error) {
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
          if(error.status == '500'){
              Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Error',
              textBody: 'Server error ' +error.message,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
              })
              return
              } 
    }
    }

const copyToClipboard = async () => {
    await Clipboard.setStringAsync(userInfo.userData.tag_id);
    // Display a success message 
    if (Platform.OS === 'android') { 
        ToastAndroid.show('Account ID copied to clipboard!', 
            ToastAndroid.SHORT); 
    } else if (Platform.OS === 'ios') { 
        Alert.alert('Account ID copied to clipboard!'); 
    } 
};
  return (
    
        <ImageBackground style={{flex:1,}} source={bgImage} resizeMode='cover'>
            <SafeAreaView style={{flex:1}}>
                {
                isFocused &&
                    <StatusBar
                    style='light'/>
                }
                {!acctPin &&
                    <StatusBar
                    style='light'/>
                    }
                <HeaderMenu 
                    buttonHome={
                    <TouchableOpacity onPress={() =>{}}>
                        <View style={gs.homeSideMenu}>
                        {/* <Ionicons name='arrow-back' size={23} color={colors.textColor}/> */}
                    </View>
                    </TouchableOpacity>
                    }
                    titleName={'Settings'}
                    profileTitle={styles.settingTitle}
                />

                <View style={{marginBottom:30}}></View>
                <View style={{flex:1, backgroundColor:colors.bgColor}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{marginHorizontal:10, marginTop:10}}>
                        <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>Settings</Text>
                    </View>

                    <TouchableOpacity style={styles.formPage} onPress={() =>navigation.navigate('contacts')}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <MaterialIcons name='support-agent' size={20} color={colors.primaryColor2} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Help</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor, marginTop:20}}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between', marginHorizontal:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textColor1}}>Account details</Text>
                            <Pressable style={{fontFamily:'_regular', fontSize:15, color:colors.textColor1}} onPress={() => refSellRBSheet.current.open()}><Text>View</Text></Pressable>
                            
                        </View>

                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between', marginHorizontal:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textColor1}}>Account type</Text>
                            <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textColor1}}>Virtual</Text>
                            
                        </View>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between', marginHorizontal:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textColor1}}>Customer ID</Text>
                            
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity onPress={() =>copyToClipboard()}>
                                    <Ionicons name='copy-outline' size={20} color={colors.primaryColor2} />
                                </TouchableOpacity>
                                <Text style={{fontFamily:'_regular', fontSize:15, textAlign:'right',color:colors.textColor1}}> {userInfo.userData.tag_id} </Text>
                            </View>
                        </View>
                        
                    </View>

                    <View style={styles.formPage}>
                        
                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row'}}>
                                    <MaterialIcons name='email' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Email Notifications</Text>
                                </View>
                            <Switch 
                                trackColor={{true: colors.primaryColor2}}
                                thumbColor={isEmailEnabled ? colors.primaryColor1 : '#f4f3f4'}
                                onValueChange={toggleEmailSwitch}
                                value={isEmailEnabled}
                                
                            />
                        </View>

                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row'}}>
                                    <MaterialIcons name='security' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>2FA</Text>
                                </View>
                            <Switch 
                                trackColor={{true: colors.primaryColor2}}
                                thumbColor={f2AMode ? colors.primaryColor1 : '#f4f3f4'}
                                onValueChange={toggle2FASwitch}
                                value={f2AMode}
                            />
                            
                        </View>

                        <View style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row'}}>
                                    <MaterialIcons name='notifications-active' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>In-App Notifications</Text>
                                </View>
                            <Switch 
                                trackColor={{true: colors.primaryColor2}}
                                thumbColor={isInAppMode ? colors.primaryColor1 : '#f4f3f4'}
                                onValueChange={toggleInAppSwitch}
                                value={isInAppMode}
                            />
                        </View>

                        <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() => navigation.navigate('ResetPassword')}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <MaterialIcons name='lock' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Reset Password</Text>
                                </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() => openAcctPinModal(true)}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <Entypo name='flickr-with-circle' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Account Pin</Text>
                                </View>
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() =>navigation.navigate('Profile')}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <Ionicons name='person' size={25} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Account</Text>
                                </View>
                        </TouchableOpacity> */}

                        <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() =>blockNotice()}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <Entypo name='block' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Block Account</Text>
                                </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() =>navigation.navigate('About')}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <Ionicons name='people' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>About Us</Text>
                                </View>
                        </TouchableOpacity>

                        {/* <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}
                        onPress={() =>navigation.navigate('Privacy_Policy')}>
                                <View style={{flexDirection:'row', marginBottom:10}}>
                                    <MaterialIcons name='privacy-tip' size={20} color={colors.primaryColor2} />
                                    <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Privacy Policy</Text>
                                </View>
                        </TouchableOpacity> */}

                    </View>

                    <TouchableOpacity style={[styles.formPage, {marginBottom:30}]}
                    onPress={() =>logoutUser()}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <MaterialIcons name='logout' size={25} color={colors.red} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Log Out</Text>
                        </View>
                        
                    </TouchableOpacity>
                        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:20}}>
                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{appSettingDetails?.app_version}</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{appSettingDetails?.app_name}</Text>
                        </View>
                    
                    <Modal isVisible={acctPin}
                        animationIn={'zoomIn'}
                        animationInTiming={900}
                        animationOut={'slideOutDown'}
                        animationOutTiming={700}
                        backdropOpacity={0.60}>
                    <View style={styles.dialogView1}>
                    <View style={styles.dialogView2}>
                    <Text style={styles.dialogText1}>
                        Reset PIN
                    </Text>
                    <Pressable style={styles.dialogCancelBtn}
                    onPress={() =>openAcctPinModal(false)}>
                        <Ionicons name='close' size={20} />
                    </Pressable>
                </View>
                    <Text style={styles.dialogText2}>
                        We recommend that you reset/update your account pin and do not share it with anyone for security reasons.
                    </Text>

                    <View style={styles.dialogInputText1}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='Enter Pin' style={{flex:1, }} 
                        secureTextEntry={userDetails.confirm_secureTextEntry ? true : false}
                        autoCorrect={false}
                        value={userDetails.new_pin}
                        onChangeText={(val) => handleInputChange("new_pin", val)}
                        />
                        <TouchableOpacity onPress={updateSecureTextConfirmPassword}>
                                
                            {userDetails.confirm_secureTextEntry ?
                                <Feather
                                    name="eye-off"
                                    color="#666"
                                    size={20}
                                    style={{marginRight:8, marginTop:15, opacity:0.4}}
                                />
                                :
                                <Feather
                                    name="eye"
                                    color="#666"
                                    size={20}
                                    style={{marginRight:8, marginTop:15, opacity:0.4}}
                                />
                            }
                        </TouchableOpacity>
                    </View>

                        <View style={{justifyContent:'center', alignItems:'center', marginBottom:10}}>
                            <TouchableOpacity style={styles.dialogActionBtn}
                            onPress={() => resetPinAction()}>
                                <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.primaryColor1, marginTop:4}}>{acctPinLoading? <ActivityIndicator size={25} color={colors.primaryColor1}/>:'Reset'}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                    </Modal>

                </ScrollView>
                </View>
                <LogoutModal 
                    openModal={logoutModalShow}
                    modalTitle={'Caution'}
                    ModalDesc={'Are you sure you want to logout?'}
                    closeBtn={() => closeModal(!logoutModalShow)}
                    logoutBtn={() => signMeOut()}
                    bntYesText={'Logout'}
                    />
                    {/* create custom component and add it */}
                    <RBSheet
                        ref={refSellRBSheet}
                        closeOnDragDown={true}
                        closeOnPressMask={true}
                        openDuration={900}
                        closeDuration={400}
                        height={350}
                        closeOnPressBack={true}
                        keyboardAvoidingViewEnabled={true}
                        customStyles={{
                        container:{
                            backgroundColor: colors.bgColor,
                        },
                        draggableIcon: {
                            backgroundColor: "#000"
                        }
                        }}>
                        
                        <View style={{marginHorizontal: 20}}>
                            <Text style={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}>Account Details: </Text>
                                
                            <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={{paddingVertical:5, marginBottom:20}}>
                                        <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>Easily manage your account details on the go</Text>
                                    </View>
                                <View style={styles.accountView}>
                                    <Text style={styles.accountDetailsTile}>Account Name</Text>
                                    <Text style={styles.accountDetails}>{userBankInfo?.bank_acct_name}</Text>
                                </View>
                            
                                <View style={styles.accountView}>
                                    <Text style={styles.accountDetailsTile}>Account Number</Text>
                                    <Text style={styles.accountDetails}>{userBankInfo?.bank_acct_number}</Text>
                                </View>
                            
                                <View style={styles.accountView}>
                                    <Text style={styles.accountDetailsTile}>Bank Name</Text>
                                    <Text style={styles.accountDetails}>{userBankInfo?.bank_name}</Text>
                                </View>
                                <View style={styles.accountView}>
                                    <Text style={styles.accountDetailsTile}>Account PIN</Text>
                                    <Text style={styles.accountDetails}>{userInfo.userData.acct_cot_pin}</Text>
                                </View>
                                <View style={[styles.accountView, {marginBottom:30}]}>
                                    <Text style={styles.accountDetailsTile}>Tag ID</Text>
                                    <Text style={styles.accountDetails}>{userInfo.userData.tag_id}</Text>
                                </View>
                            </ScrollView>
                        </View>
                </RBSheet>

                </SafeAreaView>
        </ImageBackground>
        
        
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountDetailsTile:{
    fontFamily:'_semiBold', 
    fontSize:13, 
    color:colors.textBlack
    },
    accountDetails:{
    fontFamily:'_semiBold', 
    fontSize:14, 
    color:colors.textSecColor
    },
    accountView:{
    flexDirection:'row', 
    justifyContent:'space-between', 
    marginBottom:10
    },
    dialogView1:{
    borderRadius:10, 
    marginHorizontal:10, 
    backgroundColor:colors.textColor
    },
    dialogView2:{
        width:'100%', 
        borderTopRightRadius:10, 
        borderTopLeftRadius:10, 
        marginBottom:20, 
        height:40, 
        backgroundColor:colors.primaryColor1
    },
    dialogText1:{
    fontFamily:'_semiBold', 
    fontSize:17, 
    color:colors.bgColor, 
    textAlign:'center', marginTop:5
},
dialogCancelBtn:{
    marginTop: -45, 
    borderRadius:50, 
    backgroundColor:colors.bgColor, 
    height:30, width:30, 
    alignItems:'center', 
    justifyContent:'center' 
},
    dialogText2:{
        fontFamily:'_regular', 
        fontSize:13, 
        color:colors.textBlack, 
        marginHorizontal:10, 
        marginBottom:10, 
},
    dialogInputText1:{
        flexDirection:'row',
        marginBottom:35,
        borderWidth: 1, 
        borderRadius: 7,
        borderColor: 'lightgrey',
        paddingLeft: 10,
        height: 50,
        marginHorizontal:10
},
    dialogActionBtn:{
        borderRadius:10, 
        marginHorizontal:20, 
        marginTop:5, 
        marginBottom:10, 
        width:80, 
        height:35, 
        alignItems:'center',
        borderColor: colors.primaryColor1,
        borderWidth:1
    },
    bottomSheetButton:{
        flexDirection:'row', 
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:20, 
        height:50, 
        alignItems:'center',
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 1 
        },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        elevation: 1, 
        },
    bottomSheetButtonText:{
        fontFamily:'_semiBold', 
        fontSize:17, 
        marginLeft:15, 
        color:colors.primaryColor1
        },
    settingTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
      },
      formPage:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:20,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 1 
        },
        shadowOpacity: 0.5,
        shadowRadius: 0.9,
        elevation: 1, 
        },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        },
        modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        },
        modalSubText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        },
    
        retryButtonText: {
            color: '#aaa',  // Text color matching border color
            fontSize: 16,
        },
        btn:{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius:20, 
            borderColor:colors.primaryColor1, 
            borderWidth:0.8, 
            justifyContent:'center', 
            alignItems:'center', 
            }

});

export default SettingScreen;
