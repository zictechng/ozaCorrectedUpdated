import React, { useContext, useState, useEffect }  from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderMenu from '../components/headerMenu';
import { Ionicons } from '@expo/vector-icons';
import { gs, colors } from "../styles";
import payoonerImage from '../assets/images/payooner3.png';
import CustomButton from '../components/customButton';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import * as Animatable from 'react-native-animatable'


const PayoneerCheckOutScreen = ({route, navigation}) => {
    let routeName = route.params?.amt;
    //let routeServiceType = route.params?.categoryType
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(true)
    
    // grab the route details
    const routeDetails ={
            tag_id: routeName.tag_id,
            myId: routeName.myId,
            sell_amt: routeName.amt,
            sell_note: routeName.sell_note,
            serviceName: routeName.serviceName,
            serviceCategory: 'Exchange',
            method: 'Payoneer Checkout',
            total_moneySell: routeName.total_money,
            "serviceType": routeName.serviceType
         }
         // manual checkout action routes
    const checkOutManually = async()=>{
        const manualData ={
        tag_id: routeName.tag_id,
        myId: routeName.myId,
        sell_amt: routeName.amt,
        sell_note: routeName.sell_note,
        serviceName: routeName.serviceName,
        serviceCategory: 'Exchange',
        method: 'Payoneer Manual Checkout',
        total_money: routeName.total_money,
        "serviceType": routeName.serviceType  
        }
         try {
             setIsLoading(true);
             const res = await client.post('/api/fundPurchase_funding', manualData,{
                 headers: {
                 'Authorization': 'Bearer '+userToken,
                 }
             })
             // if the response is successful redirect to the new page
                 if(res.data.msg == '200'){
                      navigation.navigate('CheckManual', {
                         paymentDetails: routeDetails,
                         tid: res.data
                     })
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
            //console.log(" Money ", routeName.total_money)
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
                    buttonHome={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <View  style={gs.homeSideMenu}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                          </View>
                    
                  </TouchableOpacity>
                    }/>

                    {!show && <Animatable.View
                    animation="slideInUp"
                    easing={'ease-in'}
                    duration={600}
                    useNativeDriver={true}>
                        <View style={{justifyContent:'center', alignItems:'center', padding:30}}>
                            <Image source={payoonerImage} style={{borderRadius:15, height:50, width:50}} />
                        </View>
                        <View style={{marginHorizontal:15}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Sorry, payoneer checkout is currently not available at the moment!</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor, marginTop:20}}>Consider continue with manual transfer</Text>
                        </View>
                    </Animatable.View>
                 }
                    {show &&
                    <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
                        <ActivityIndicator size={'large'} color={colors.primaryColor1} />
                        <Text style={{fontFamily:'_regular', fontSize:14}}>Please wait...</Text>
                    </View>
                    }
                {!show && <Animatable.View style={styles.bottom}
                animation="fadeIn"
                delay={500}
                easing={'ease-in'}
                useNativeDriver={true}
                duration={900}>
                    <CustomButton
                        buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:30, marginBottom:20,
                           bottom:10}}
                        viewStyle={{padding:10, alignItems:'center'}}
                        textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                        textLabel={isLoading ? (
                            <ActivityIndicator color={colors.textColor} size={25} />
                          ): 'Continue Manually'}
                        buttonAction={() => checkOutManually()}
                        />
                </Animatable.View>}
                    
            </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
      },
})

export default PayoneerCheckOutScreen;
