import React , {useContext, useCallback, useState, useEffect, useRef } from 'react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {Platform, Alert, Dimensions, StatusBar, View, Text, BackHandler, TextInput, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal, Image, ImageBackground, KeyboardAvoidingView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { gs, colors } from '../styles';
//import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';
import LoaderIndicator from '../components/loaderIndicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');


const VerifySignupScreen = ({route}) =>{

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    let verifyCode = route.params?.otpCode;

    const {userRegEmail, userEmail, otpStatus} = useContext(AuthContext)
    const [copiedText, setCopiedText] = useState('');
    const [copiedTextOTP, setCopiedTextOtp] = useState('');
    const [enterCode, setEnterCode] = useState('');
    const [domain, setDomain] = useState('');
    const [username, setUsername] = useState('');
    const [name, domainPart] = userEmail.split('@');
    const [btnVerifyLoading, setBtnVerifyLoading] = useState(false);
    const [sendingUserOtp, setSendingUserOtp] = useState(false);
    const otpRef = useRef(null);

    // console.log('User OTP ', AsyncStorage.getItem('userOTP'))
        const data = AsyncStorage.getItem('userOTP').then((res) => {
        const usersOTP = JSON.parse(res)
        //console.log('User OTP ', userOTP)
            
        })

    useEffect(() => {
        if (verifyCode) {
            // Call your function if route has a value or exists
            SendOTP()
          }
   
     setTimeout(() => otpRef.current.focusField(0), 250);
      // this will get the email send to this page and format it
      setUsername(name);
      setDomain(domainPart);
      // confirm before going back
      const backAction = () => {
        Alert.alert('Hold on!', `Are you sure you want to go back?\nThis action will cancelled your operation `, [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => navigation.goBack()},
        ]);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
  
      return () => backHandler.remove();

      }, [name, domainPart, isFocused]);



      // get first 3 letters of the email
      const displayEmail = name.substring(0, 5);

      // call this function when button verify is clicked
      const  ConfirmCode = async () =>{
        if(enterCode.length != 6){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error!',
                textBody: 'OTP code required 6 digits characters',
                textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                titleStyle: { fontFamily: '_bold', fontSize: 20 },
                })
            return
        }
        setBtnVerifyLoading(true)
        //console.log('Auto Send Press', enterCode);
        try{
            const res = await client.post('/api/otp_verify', {
                otp_code: enterCode,
                user_email: userRegEmail,
            })
            if(res.data.msg =='200'){
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    title: 'Success',
                    textBody: 'Account activated successfully',
                    button: 'Okay',
                   });
                setEnterCode('')
                AsyncStorage.removeItem('userOTP');
                navigation.navigate('Login');

            } else if(res.data.status == '401') {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'No user found.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
                
            }
            else if(res.data.status == '403'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Try again.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
               
            }
            else if(res.data.status == '404'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'Invalid OTP code.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
            }
            else if(res.data.status == '500'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Sorry',
                    textBody: 'Something went wrong!.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
            }
             else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Something went wrong.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
                }
        }
        catch (error) {
            console.log(error.message)
        }
        finally {
            setBtnVerifyLoading(false)
        }
      };

      // automatically call verify function once OTP code is entered
      const  confirmCodeAuto = async (useCode, useEmail) =>{
        // if(connectionState === true){
        //     //alert('Please connect')
        //     Toast.show({
        //         type: ALERT_TYPE.DANGER,
        //         title: 'No Internet Connection',
        //         textBody: 'Sorry, your device is not connected to internet! Please, connect to wifi or mobile data to continue',
        //         titleStyle: {fontFamily: '_semiBold', fontSize: 18},
        //         textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
        //         })
        //      return
        // }
       setBtnVerifyLoading(true)
        try{
            const res = await client.post('/api/otp_verify', {
                otp_code: useCode,
                user_email: useEmail,
            })
            if(res.data.msg =='200'){
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    textBody: 'Account activated successfully',
                    button: 'Okay',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                   });
            AsyncStorage.removeItem('userOTP');
            navigation.navigate('Login');
            } else if(res.data.status == '401') {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'No user found.',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                    })
                // Alert.alert("Login failed", "No user found",[
                //     {text: "Okay"}
                // ]);
            }
            else if(res.data.status == '403'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Try again.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
            }
            else if(res.data.status == '404'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'Invalid OTP code.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
            }
            else if(res.data.status == '500'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Sorry',
                    textBody: 'Something went wrong!.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
            }
             else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Something went wrong.',
                    textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                    titleStyle: { fontFamily: '_bold', fontSize: 20 },
                    })
                }
        }
        catch (error) {
            console.log(error.message)
        }
        finally {
            setBtnVerifyLoading(false)
        }
      };

      // resending code
      const resendOTP = async() =>{
        const otpData={
            'email': userEmail,
        }
        try {
            setBtnVerifyLoading(true)
            const res = await client.post('/api/otpResend', otpData)
            //console.log(res.data);
            if(res.data.msg == '200'){ 
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title:'Success',
                textBody: 'OTP Sent! \n Please check your email or spam box',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              })
             }
            
            else if(res.data.status == '401') {
                    Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Failed',
                    textBody: 'Record record found',
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
                    textBody: 'Email ID is missing',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
                else if(res.data.status == '409'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'User email already in use',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                }
                else if(res.data.status == '403'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'User phone already in use',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                    } 
                else if(res.data.status == '404'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'Sorry, there was an error! Please try again later',
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
            if(error.message == 'Request failed with status code 404'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, error occurred! Please try again',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    return
                } 
            }
            finally {
            setBtnVerifyLoading(false)
              }
      }

       // send user activation code after signup once this page is loaded
       const SendOTP = async() =>{
        const otpData={
            'email': userEmail,
            'otp_code': verifyCode.reg_otp,
            }
            try {
                setSendingUserOtp(true)
                const res = await client.post('/api/sendUserOTP', otpData)
                //console.log(res.data);
                if(res.data.msg == '200'){ 
                  //console.log('OTP Send ', res.data)
                 }
                
                else if(res.data.status == '401') {
                    console.log(res.data)
                    }
                else if(res.data.status == '400'){
                    console.log(res.data)
                    }
                    
                    else {
                        console.log(res.data)
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
                    if(error.message == 'Request failed with status code 404'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'Sorry, error occurred! Please try again',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                        return
                    } 
                }
                    finally {
                    setSendingUserOtp(false)
                    }
            }

      const backActionPress = () => {
        Alert.alert('Hold on!', `Are you sure you want to go back?\nThis action will cancelled your operation `, [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => navigation.navigate('Register')},
        ]);
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backActionPress,
      );

  return (

<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{flex:1}}>
                    {
                     isFocused &&
                        <StatusBar
                            barStyle='dark-content'
                            translucent
                            backgroundColor="transparent"
                        />
                    }
                <View style={{backgroundColor:'transparent', justifyContent:'flex-start', marginTop:40, marginHorizontal:10}}>
                    <TouchableOpacity onPress={() => backActionPress()}>
                        <View style={[gs.homeSideMenu, {marginBottom:5}]}>
                        <Ionicons name='arrow-back' size={20} color={colors.textColor} />
                        </View>
                    </TouchableOpacity>
                </View>
                {/* show loader when processing request */}
                {btnVerifyLoading && <LoaderIndicator 
                loader={btnVerifyLoading}
                textInfo={'Processing...'}
                />}
                <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:20}}>

                <View style={{alignItems:'center'}}></View>

            <View style={styles.LoginDivTitle}>
                <Text style={styles.loginTitle}>Activate Account </Text>
                <Text style={styles.loginTitleDesc}>We have sent an OTP Code to <Text style={{fontFamily:'_bold'}}>{userEmail}</Text>, please check your email.</Text>
                {!otpStatus ?
                
                <View>
                    <Text style={[styles.loginTitleDesc, {color:'#aaa', fontSize: 15}]}>Sometimes network might delay the email to arrival.</Text>
                    
                </View>
                
                :<Text style={[styles.loginTitleDesc, {color:'#aaa', fontSize: 15}]}>You have a pending account activation, enter the OTP Code to activate it now.</Text>}
            </View>
                    
                <View style={{justifyContent:'center', alignItems:'center', marginTop: -20}}>
                
                    <OTPInputView
                        ref={otpRef}
                        style={{width: '95%', height: 150}}
                        pinCount={6}
                        autoFocusOnLoad = {false}
                        codeInputFieldStyle={{
                            width: 45,
                            height: 40,
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: "#aaa",
                            color: colors.blackColor2,
                            padding:5,
                            //borderBottomWidth: 10,
                            //borderBottomColor: "#aaa",
                        }}
                        keyboardType={'number-pad'}
                        
                        autofillFromClipboard={true}
                        returnKeyType={'done'}
                        onCodeChanged = {code => { setEnterCode(`${code}`)}}
                        onCodeFilled={
                            (code) =>{
                                setEnterCode(`${code}`);
                                setCopiedText(`${code}`)
                                confirmCodeAuto(`${code}`, userEmail)
                            }
                        }
                    />
                    
                </View>
                {!otpStatus &&
                <Text style={[styles.loginTitleDesc, {color:'#aaa', fontSize: 15, marginTop: -20}]}>If you didn't received OTP immediately, you can close the app, come back when you have received the OTP Code and activate your account.

                </Text>
                }
                    <View style={{ justifyContent:'center', alignItems:'center', marginBottom:40}}>
                        <Text style={{fontFamily:'_regular', fontSize:15}}>
                        <Text style={{fontFamily:'_semiBold', color:colors.redColor, fontSize:17}} onPress={() => resendOTP()}> Resend OTP</Text></Text>
                    </View>

                <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:5, marginHorizontal:10}}>
                        <TouchableOpacity style={styles.signInButton} onPress={() =>ConfirmCode()}>
                            <Text style={styles.textSign}>Activate</Text>
                        </TouchableOpacity>
                    </View>
            </ScrollView>
                    
        </SafeAreaView>
    </TouchableWithoutFeedback>
</KeyboardAvoidingView>
        
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    borderStyleBase: {
        width: 30,
        height: 45
      },
    
      borderStyleHighLighted: {
        borderColor: "#03DAC6",
      },
    
      underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
      },
    
      underlineStyleHighLighted: {
        borderColor: "#03DAC6",
      },
    checkboxText: {
        margin:0,
        marginRight:5,
        borderRadius:5,
        color:'lightgrey',
      },
      signInButton: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
         backgroundColor: colors.primaryColor1
    },

    textSign:{
        fontFamily:'_semiBold',
        fontSize: 17,
        color: colors.textColor
    },
    bgImage:{
        position: 'absolute',
        width: 130,
        height: 90,
        bottom: -6,
        right: -10,
     },
     loginTitle:{
        fontFamily:'_bold', 
        fontSize:32, 
        color:'#333', 
     },
     loginTitleDesc:{
        fontFamily:'_regular',  
        fontSize:15, 
        color:'#333', 
        marginTop:10
     },
     LoginDivTitle:{
        marginBottom:10, 
        marginTop: 20,
    }
    
  });

  export default VerifySignupScreen;
