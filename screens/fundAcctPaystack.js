import React, { useContext, useState, useEffect, useRef }  from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderMenu from '../components/headerMenu';
import { Ionicons } from '@expo/vector-icons';
import { gs, colors } from "../styles";
import paystackImage from '../assets/images/paystack_logo.png';
import CustomButton from '../components/customButton';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import * as Animatable from 'react-native-animatable'
import { NumberValueFormat } from '../components/formatValue';
import  { Paystack, paystackProps }  from 'react-native-paystack-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';


const FundAccountPaystackScreen = ({route, navigation}) => {
    let routeName = route.params?.amt;
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [payStackPaymentStatus, setPayStackPaymentStatus] = useState('');
    const [show, setShow] = useState(true)
    const [payStackAPI, setPayStackAPI] = useState({});

    // get local storage app setting details
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
        const dataInfo = JSON.parse(res)
        setPayStackAPI(dataInfo.app_paypayKey)
        })
        
        const paystackWebViewRef = useRef(paystackProps.PayStackRef);

        //console.log('Paystack data ', payStackAPI)
        // manual checkout action routes

        //console.log("Live Url: ", payPayToken)
    // check if paystack button/api is available
    const checkPaymentGateway = async() =>{
        const response = await client.get('/api/check_paymentBtn',{
            headers: {
            'Authorization': 'Bearer '+userToken,
            }
        })
        if(response.data.status == '404'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Failed to authenticate',
                textBody: res.data.msg,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
            navigation.navigate('Home') 
            return
            }
        if(response.data.app_payStack_btn == false || response.data.app_payStack_btn =='false'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Payment gateway not available at the moment! Please, Use manual transfer',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                navigation.navigate('Home') 
            return
            }
    }
    const checkOutPaystack = async(data)=>{
        const manualData ={
        tag_id: routeName.tag_id,
        serviceName: routeName.serviceName,
        serviceCategory: 'Exchange',
        method: 'Paystack Checkout',
        total_money: routeName.total_money,
        payId: data,
        amt: routeName.total_money,
        note: routeName.note,
        userId: userInfo.userData._id,
        }
     try {
        const res = await client.post('/api/userAccount_funding', manualData,{
            headers: {
            'Authorization': 'Bearer '+userToken,
            }
        })
        // if the response is successful redirect to the new page
            if(res.data.msg == '200'){
            // navigation redirect back to the home page
                Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                button:'Okay',
                textBody: 'Transaction completed successfully! Please check your email',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                navigation.replace('Home');
                }
            else if(res.data.status == '401'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Failed to authenticate',
                textBody: res.data.message,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
            }
            else if(res.data.status == '403'){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: res.data.message,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
              navigation.replace('Home');
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
        
        } catch (error) {
        console.log('Error catch ', error.message)
        if(error.message == 'Network Error'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: error.message,
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
            setIsLoading(false)
        }
     }

    useEffect(() => {
    const timeId = setTimeout(() => {
    // After 3 seconds set the show value to false
    checkPaymentGateway();
    setShow(false)
    }, 1000)
     return () => {
    clearTimeout(timeId)
    }
    }, []);

  return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle="dark-content" backgroundColor={"transparent"} />
                <HeaderMenu
                    buttonLeft={
                    <TouchableOpacity
                    onPress={() => navigation.goBack()}>
                      <View style={gs.homeSideMenu}>
                      <Ionicons
                      name="close"
                      size={25}
                      color={colors.textColor}/>
                       </View>
                    
                  </TouchableOpacity>
                    }/>

                    {!show && <Animatable.View
                    animation="fadeIn"
                    easing={'ease-in'}
                    duration={500}
                    useNativeDriver={true}>
                        <View style={{justifyContent:'center', alignItems:'center', padding:30}}>
                            <Image source={paystackImage} style={{borderRadius:15, height:50, width:50}} />
                        </View>
                        <Text style={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack, textAlign:'center', marginBottom:20}}>
                            <NumberValueFormat value={routeName.total_money} />
                        </Text>

                        <View style={{marginHorizontal:15}}>
                            {payStackPaymentStatus == 'Approved' ?
                            <View>
                                <Text style={{fontFamily:'_semiBold', fontSize:18, color:colors.greenColor, marginTop:10, textAlign:'center'}}>Payment successful and approved</Text>
                            </View>
                            : 
                            <View>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack, textAlign:'center'}}>The secure, easy and convenient way to pay faster</Text>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor, marginTop:10, textAlign:'center'}}>Please click authorized to proceed</Text>
                            </View>
                            }
                        </View>

                        <View style={{ flex: 1 }}>
                            {/* <Paystack  
                                paystackKey={payStackAPI}
                                showPayButton={true}
                                amount={routeName.total_money}
                                billingEmail={userInfo.userData.email}
                                channels={["card", "mobile_money"]}
                                billingName={userInfo.userData.display_name}
                                onCancel={(e) => {
                                    // handle response here
                                    console.log("Cancelled ", e)
                                    if(e.status ==='cancelled'){
                                    navigation.goBack()
                                    }
                                }}
                                onSuccess={(res) => {
                                // handle response here
                                //console.log(res.data);
                                setPayStackPaymentStatus(res.data.transactionRef.message)
                                checkOutPaystack(res.data.transactionRef.reference);
                            }}
                            ref={paystackWebViewRef}
                            autoStart={true}
                            /> */}
                        <Paystack  
                          paystackKey={payStackAPI}
                          amount={routeName.total_money}
                          billingEmail={userInfo.userData.email}
                          channels={["card", "mobile_money"]}
                          billingName={userInfo.userData.display_name}
                          onCancel={(e) => {
                            // handle response here
                            console.log("Cancelled ", e)
                            if(e.status ==='cancelled'){
                              navigation.goBack('Home')
                              }
                          }}
                          onSuccess={(res) => {
                            // handle response here
                            //console.log(res.data);
                            setPayStackPaymentStatus(res.data.transactionRef.message)
                            checkOutPaystack(res.data.transactionRef.reference);
                          }}
                          ref={paystackWebViewRef}
                          autoStart={true}
                        />
                        </View>
                            {payStackPaymentStatus !='Approved'?
                            <TouchableOpacity style={styles.checkBtn}
                                onPress={()=> paystackWebViewRef.current.startTransaction()}>
                                <View>
                                    <Text style={{fontFamily:'_regular', fontSize:17, color:colors.bgColor}}>  
                                    {isLoading ? " " : "Pay with Paystack"}
                                        {isLoading && (
                                        <ActivityIndicator color={colors.textColor} size={25} />
                                        )}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            :''}
                    </Animatable.View>
                    
                 }
                    {show &&
                    <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={'large'} color={colors.primaryColor1} />
                        <Text style={{fontFamily:'_regular', fontSize:14}}>Please wait...</Text>
                    </View>
                    }        
            </SafeAreaView>
            );
    }

const styles = StyleSheet.create({
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      checkBtn:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.primaryColor1, 
        marginTop:20, 
        marginBottom:20,
        height:50,
        justifyContent:'center',
        alignItems:'center',
        marginHorizontal:20,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 1 
        },
        shadowOpacity: 0.5,
        shadowRadius: 0.9,
        elevation: 0.8, 
    },
})

export default FundAccountPaystackScreen;
