import React, { useContext, useState, useEffect }  from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderMenu from '../components/headerMenu';
import { Ionicons } from '@expo/vector-icons';
import { gs, colors } from "../styles";
import paystackImage from '../assets/images/paystack_logo.png';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import * as Animatable from 'react-native-animatable'
import { NumberValueFormat } from '../components/formatValue';
import  { Paystack }  from 'react-native-paystack-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';


const PayStackScreen = ({route, navigation}) => {
    let routeName = route.params?.amt;
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(true)
    const [currentRate, setCurrentRate] = useState({});
    const [payStackToken, setPayStackToken] = useState({});
    const [ totalMoney, setTotalMoney] = useState('')
    const [payStackPaymentStatus, setPayStackPaymentStatus] = useState('');
    
    var totalMoneySend = '';

    // get local storage app setting details here
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
      const dataInfo = JSON.parse(res)
      setPayStackToken(dataInfo.app_paypayKey)
      })
      
      //console.log(payStackToken)

    const newTotal = totalMoney * routeName.buy_amt;
         //console.log('Paystack data ', routeName)
         // manual checkout action routes
    const checkOutPaystack = async(data)=>{
        const manualData ={
        tag_id: routeName.tag_id,
        myId: routeName.myId,
        buy_amt: routeName.buy_amt,
        buy_note: routeName.sell_note,
        serviceName: routeName.serviceName,
        serviceCategory: 'Exchange',
        method: 'Paystack Checkout',
        buy_note: routeName.buy_note,
        total_money: routeName.total_money,
        "serviceType": routeName.serviceType,
        payId: data
       
     }
         try {
             setIsLoading(true);
             const res = await client.post('/api/fundBuy_funding', manualData,{
                 headers: {
                 'Authorization': 'Bearer '+userToken,
                 }
             })
             // if the response is successful redirect to the new page
                 if(res.data.msg == '200'){
                  Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Success',
                    button:'Okay',
                    textBody: 'Your transaction was successful',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    });
                    navigation.navigate('Home')
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
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <View  style={gs.homeSideMenu}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                      </View>
                   
                  </TouchableOpacity>
                    }/>

                    {!show && <Animatable.View
                    animation="fadeIn"
                    easing={'ease-in'}
                    duration={800}
                    useNativeDriver={true}>
                        <View style={{justifyContent:'center', alignItems:'center', padding:30}}>
                            <Image source={paystackImage} style={{borderRadius:15, height:50, width:50}} />
                        </View>
                        <Text style={{fontFamily:'_semiBold', fontSize:30, color:colors.textBlack, textAlign:'center', marginBottom:20}}>
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
                        
                        <Paystack  
                          paystackKey={payStackToken}
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
                          autoStart={true}
                        />
                      </View>
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
})

export default PayStackScreen;
