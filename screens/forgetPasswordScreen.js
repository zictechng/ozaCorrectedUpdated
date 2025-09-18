import React , {useContext, useCallback, useState, useEffect } from 'react';
import { Dimensions, StatusBar, View, Text, TextInput, StyleSheet, ScrollView, Keyboard, KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { gs, colors } from '../styles';
//import {  } from 'expo-status-bar';
import HeaderMenu from '../components/headerMenu';
import LoaderIndicator from '../components/loaderIndicator';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import client from '../contextAPI/client';
import { noticeData } from '../components/errorNotice';
import IsValidEmail from '../components/checkEmailFormat';
const { width } = Dimensions.get('window');
const windowHeight = Dimensions.get('window').height;

const ForgetPasswordScreen = ({navigation}) =>{

    const appLogoLocal = require("../assets/images/sec3.png");
    const appBgLocal = require("../assets/images/bg_sec2.png");

    const [isChecked, setChecked] = useState(false);
    const [isEmailSend, setIsEmailSend] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [emailVerify, setEmailVerify] = useState('')

    //console.log(' update ', isEmailSend)

    const [userDetails, setUserDetails] = React.useState({
        new_password: '',
        otp_code: '',
        confirm_password: '',
        secureTextEntry: true,
        confirm_secureTextEntry: true,
        })
        const handleInputChange = (name, val) => {
            setUserDetails({
              ...userDetails,
              [name]: val,
            });
          };

          // create function for the toggle button
    const updateSecureTextEntry = (val) => {
        setUserDetails({
            ...userDetails,
            secureTextEntry: !userDetails.secureTextEntry
        })
    }
    // create function for the toggle button
    const updateSecureTextConfirmPassword = (val) => {
        setUserDetails({
            ...userDetails,
            confirm_secureTextEntry: !userDetails.confirm_secureTextEntry
        })
    }

    // reset the password now
    const resetPasswordAction = async() =>{
            const userData = {
            password: userDetails.new_password,
            otpPin: userDetails.otpPin,
            userEmail: emailVerify,
            }
        if (userDetails.new_password.length == 0 || userDetails.confirm_password.length == 0 || userDetails.otp_code.length == 0) {
            Toast.show({
                 type: ALERT_TYPE.DANGER,
                 title: 'Error',
                  textBody: 'Required fields are missing',
                 textBodyStyle: noticeData[0].errorMessageStyle,
                 titleStyle: noticeData[0].errorTitleStyle,
             })
             return
            }
            if (userDetails.new_password !== userDetails.confirm_password) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Password do not match',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                });
                return
            }
            if(userDetails.otp_code != verifyCode){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                     textBody: 'Invalid OTP code',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                })
                return
            }
            try {
                setResetLoading(true);
                const res = await client.post('/api/resetPasswordMobile', userData)
                if(res.data.msg === '200') {
                // clear the form
                    setUserDetails({
                    password: '',
                    otp_code: '',
                    confirm_password: '',
                    secureTextEntry: false,
                    confirm_secureTextEntry: false,
                    });
                    setEmailLoading(false);
                    setIsEmailSend(false)
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title:'Successful',
                        textBody: 'Your password has been updated successfully',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        });
                    navigation.navigate('Login');
                }
                else if(res.data.status == '404') {
                    Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Failed',
                    textBody: 'No user record found',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
                else if(res.data.status == '400'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'All fields required.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
               else if(res.data.status == '500'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'Server error : ' + res.data.message,
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                    } 
                    
                else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Something went wrong, try again later',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                } 
                } catch (error) {
                    console.log('Server error occurred ', error.message)
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
                finally {
                    setResetLoading(false)
                    }
         }

    // send opt to user email to verify password reset
    const sendResetMail = async() => {
        //console.log('send Mail ', userEmail)
        if(userEmail === '' || userEmail === null){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title:'Error',
                textBody: 'Please enter your email address',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
            }
            // validate email format
            if(!IsValidEmail(userEmail)){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Invalid email',
                    textBody: 'Please enter a valid email format.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                });
                return
            }
            const userData ={
                user_email: userEmail
            }
        try {
            setEmailLoading(true);
            const res = await client.post('/api/forgetPasswordMobile', userData)
        if(res.data.msg == '200'){ 
           setIsEmailSend(true);
            setUserEmail('')
            setVerifyCode(res.data.otpPin)
            setEmailVerify(res.data.myEmail)
           
           }
           else if(res.data.status == '404') {
            Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Failed',
            textBody: 'No record found',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        }
        else if(res.data.status == '400'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Failed',
            textBody: 'All fields required.',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        }
       else if(res.data.status == '500'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: res.data.message,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
            } 
            
        else {
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Sorry, Something went wrong, try again later',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        } 
        } catch (error) {
            console.log('Server error occurred ', error.message)
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
            setEmailLoading(false)
            }
        
    }
    
  return (     
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <SafeAreaView style={{flex:1}}>
         <StatusBar barStyle="dark-content" translucent backgroundColor={"transparent"} />

        <View style={{flex:1, justifyContent:'center', borderRadius:10}}>
    
            <HeaderMenu buttonHome={<TouchableOpacity 
            onPress={() =>navigation.navigate('Login')}>
                <View style={gs.homeSideMenu}>
                <Ionicons name='arrow-back' size={25} color={colors.blackColor1} />
                </View>
                
            </TouchableOpacity>
            }/>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal:20}}>

                    {/* show loader when processing request */}
                    {resetLoading && <LoaderIndicator 
                            loader={resetLoading}
                            textInfo={'Processing...'}
                            />}
            <View style={{alignItems:'center'}}></View>

                <View style={styles.LoginDivTitle}>
                <Text style={styles.loginTitle}>Forget Password</Text>
                {!isEmailSend &&<Text style={styles.loginTitleDesc}>Don't worry, you can easily recover your account</Text>}
                {!isEmailSend && <Text style={[styles.loginTitleDesc, {color:colors.textSecColor}]}>Enter registered email to get started</Text>}
                </View>
  
        <View style={{marginHorizontal:10}}>
        
                {!isEmailSend && <View style={{flexDirection:'row',
                    marginBottom:15,
                    borderWidth: 1,  // size/width of the border
                    borderRadius: 7,
                    borderColor: 'lightgrey',  // color of the border
                    paddingLeft: 10,
                    height: 50}}>
                    <MaterialIcons name='alternate-email' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                    <TextInput 
                    placeholder='Registered Email ID'
                    style={{flex:1, paddingVertical:0}}
                    keyboardType='email-address'
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={userEmail?.toLowerCase()}
                    onChangeText={text =>setUserEmail(text)}
                    />
                </View>}
                

                {isEmailSend && <View >
                    <Text style={[styles.loginTitleDesc, {marginBottom:10, color:colors.textSecColor}]}>We have sent you an OTP to authenticate your request! Please, check your email.</Text>
                    <View style={{flexDirection:'row',
                        marginBottom:15,
                        borderWidth: 1, 
                        borderRadius: 7,
                        borderColor: 'lightgrey',
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='New Password' style={{flex:1, paddingVertical:0}} 
                        secureTextEntry={userDetails.secureTextEntry ? true : false}
                        value={userDetails.new_password}
                        onChangeText={(val) => handleInputChange("new_password", val)}
                        />
                       <TouchableOpacity onPress={updateSecureTextEntry}>
                                
                                {userDetails.secureTextEntry ?
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
                                {/*<Feather name='eye' size={20} color='#666' style={{marginRight:8, marginTop:15, opacity:0.4}} /> */}
                        </TouchableOpacity>
                    </View>

                    <View style={{flexDirection:'row',
                        marginBottom:15,
                        borderWidth: 1, 
                        borderRadius: 7,
                        borderColor: 'lightgrey',
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='Confirm New Password' style={{flex:1, paddingVertical:0}} 
                        secureTextEntry={userDetails.confirm_secureTextEntry ? true : false}
                        autoCorrect={false}
                        value={userDetails.confirm_password}
                        onChangeText={(val) => handleInputChange("confirm_password", val)} 
                        />
                        <TouchableOpacity onPress={updateSecureTextConfirmPassword}>
                                
                                {userDetails.secureTextEntry ?
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
                                {/*<Feather name='eye' size={20} color='#666' style={{marginRight:8, marginTop:15, opacity:0.4}} /> */}
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',
                        marginBottom:35,
                        borderWidth: 1,  // size/width of the border
                        borderRadius: 7,
                        borderColor: 'lightgrey',  // color of the border
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='qr-code' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='OTP Code'
                        style={{flex:1, paddingVertical:0}}
                        maxLength={6}
                        keyboardType='numeric'
                        value={userDetails.otp_code}
                        onChangeText={(val) => handleInputChange("otp_code", val)}/>
                    </View>
                </View>}
        
        </View>
                {!isEmailSend && <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:5, marginHorizontal:10}}>
                    <TouchableOpacity style={[styles.signInButton1, emailLoading ? styles.signInButton2 :'']}
                    onPress={() =>sendResetMail()}
                    disabled={emailLoading}>
                        <Text style={styles.textSign}>{emailLoading? ' ' : "Submit"}{emailLoading && <ActivityIndicator color={colors.textColor} size={25} />}</Text>
                    </TouchableOpacity>
                </View>}

                {isEmailSend && <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:5, marginHorizontal:10}}>
                    <TouchableOpacity style={[styles.signInButton, !isEmailSend ? styles.signInButton2 :'']}
                    onPress={() =>resetPasswordAction()}
                    disabled={resetLoading}>
                        <Text style={styles.textSign}>Reset Password</Text>
                    </TouchableOpacity>
                </View>}

                
        </ScrollView>        
</View>
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
    signInButton1: {
        width: '100%',
        height: 50,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: colors.primaryColor1
    },

    signInButton2: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginTop: 40,
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: colors.primaryColor1,
        opacity: 0.7
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
        fontSize:25, 
        color:'#333', 
     },
     loginTitleDesc:{
        fontFamily:'_regular',  
        fontSize:15, 
        color:'#333', 
        marginTop:10
     },
     LoginDivTitle:{
        marginBottom:30, 
        marginTop: 70,
    },
    
  });

  export default ForgetPasswordScreen;
