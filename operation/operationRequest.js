import React, {useContext, useCallback, useState, useEffect } from 'react';
import { Dimensions, View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Modal, Image, ImageBackground, Alert} from 'react-native';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
    

const signupUserAction = async(data) =>{
     
    const navigation = useNavigation();
    const {isBtnLoading, isButtonDisable, nextPage} = useContext(AuthContext)
    const [isRegBtnLoading, setIsRegBtnLoading] = useState(false);
    const [isRegButtonDisable, setIsRegButtonDisable] = useState(false);

    const sendData = {
      full_name: data.full_name,
      phone: data.phone_code + data.phone,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
  }
  console.log('Register details:', sendData);
    // try {
    //   setIsLoading(true);
    //   isBtnLoading(true);
    //   isButtonDisable(true);
      
    //   const res = await client.post('/api/register', sendData)
    //   console.log(res.data);
    //   if(res.data.msg == '201'){ 
    //     Toast.show({
    //       type: ALERT_TYPE.SUCCESS,
    //       title:'Success',
    //       textBody: 'Register successfully',
    //       titleStyle: noticeData[0].errorTitleStyle,
    //       textBodyStyle: noticeData[0].errorMessageStyle,
    //     })
    //     navigation.navigate("VerifyOTP")
    //     }
    //     else if(res.data.status == '401') {
    //             Toast.show({
    //               type: ALERT_TYPE.DANGER,
    //               title:'Failed',
    //               textBody: 'No user record found',
    //               titleStyle: noticeData[0].errorTitleStyle,
    //               textBodyStyle: noticeData[0].errorMessageStyle,
    //             })
    //        }
    //        else if(res.data.status == '404'){
    //         Toast.show({
    //             type: ALERT_TYPE.DANGER,
    //             title: 'Failed',
    //             textBody: 'Username or Password incorrect.',
    //             titleStyle: {fontFamily: '_semiBold', fontSize: 18},
    //             textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
    //             })
    //           }
    //           else if(res.data.status == '402'){
    //             Toast.show({
    //                 type: ALERT_TYPE.DANGER,
    //                 title: 'Failed',
    //                 textBody: 'Account not active',
    //                 titleStyle: {fontFamily: '_semiBold', fontSize: 18},
    //                 textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
    //                 })
    //             } 
    //             else if(res.data.status == '400'){
    //               Toast.show({
    //                   type: ALERT_TYPE.DANGER,
    //                   title: 'Error',
    //                   textBody: 'Username or password missing',
    //                   titleStyle: {fontFamily: '_semiBold', fontSize: 18},
    //                   textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
    //                   })
    //               } 
    //         else {
    //             Toast.show({
    //                 type: ALERT_TYPE.DANGER,
    //                 title: 'Error',
    //                 textBody: 'Sorry, Something went wrong.',
    //                 titleStyle: {fontFamily: '_semiBold', fontSize: 18},
    //                 textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
    //                 })
    //            } 
    //   } catch (error) {
    //     console.log(error.message)
    //   }
    //   finally {
    //     setIsLoading(false);
    //     isBtnLoading(false);
    //     isButtonDisable(false);
    //     }
  }
  
const RegisterUser= {

}

export default signupUserAction
