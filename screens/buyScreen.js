import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
    ActivityIndicator,
    View, 
    Text, 
    TextInput,
    TouchableWithoutFeedback,
     StyleSheet, 
     Keyboard, 
     KeyboardAvoidingView, 
     TouchableOpacity, 
     SafeAreaView, 
     Image, 
     ImageBackground, 
     Platform,
     ScrollView } from 'react-native';

import { AntDesign, MaterialIcons, Ionicons, Feather, Entypo, MaterialCommunityIcons, FontAwesome5, Fontisto, FontAwesome} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import paypalImage from '../assets/images/paypal2.png';
import payoneerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';
import moneyImage from '../assets/images/money_ex.png';
import { AuthContext } from '../contextAPI/authContext';
import RBSheet from 'react-native-raw-bottom-sheet';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';
import { ShowLogoutModal } from '../components/controls';


const BuyScreen = ({route, navigation}) => {
    let routeName = route.params?.pageName;
    let routeServiceType = route.params?.categoryType
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
      const [image, setImage] = useState(null);
      const [amtLoading, setAmtLoading] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [currentRate, setCurrentRate] = useState({});
      const [paymentButton, setPaymentButton] = useState(false);
      
      const [contactData, setContactData] = useState({
        tag_id: '',
        buy_amt: '',
        buy_note: '',
    });

    const refBuyCheckOut = useRef();

    // function for message input field
    const handleInputChange = (name, val) => {
        setContactData({
          ...contactData,
          [name]: val,
        });
    }
   
    // close logout modal
    const closeModal = () =>{
        setPaymentButton(false);
      }

    // get current exchange rate from db
    const getCurrentRate = async() =>{
        try{
          const res = await client.get('/api/current_rate',{
            headers: {
                'Authorization': 'Bearer '+userToken,
                    }
            })
          if(res.data.msg !== '404'){
            setCurrentRate(res.data)
            //console.log('No Notification ', res.data)
          }
          else if(res.data.status == '404') {
            //console.log('No Active Notification 404')
             }
          
        }catch (e){
          console.log('error ',e.message);
        }
       };
    var totalMoneySend = '';
     // function that will calculate the new total and return the new total
     const totalAmount = () =>{
        let totalMoneySend = ''
        if(routeName == 'PayPal'){
          totalMoneySend = currentRate.paypal_selling * contactData.buy_amt
        return  totalMoneySend
        }
        else if(routeName == 'Payoneer'){
          totalMoneySend = currentRate.payoneer_selling * contactData.buy_amt
          return  totalMoneySend
        }
        else if(routeName == 'Bitcoin'){
            totalMoneySend = currentRate.btc_selling * contactData.buy_amt
            return  totalMoneySend
          }
      }
    //process the sell request here
    const buyData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        buy_amt: contactData.buy_amt,
        buy_note: contactData.buy_note,
        serviceName: routeName,
        serviceCategory: 'Exchange',
        service_type: routeServiceType,
        total_money: totalAmount(),
    }

    const processBuy = () =>{
        if(buyData.buy_amt == null || buyData.buy_amt == ''){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Some required information are missing',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
             }
        if(buyData.buy_amt == 0){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Wrong value entered',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
        if(buyData.buy_amt < 5){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Minimum of $5 accepted',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
             refBuyCheckOut.current.open();
             //console.log(buyData)
        }

    const CheckRouteName = () =>{
        if(routeName == 'PayPal' || routeName == 'Paypal'){
            return ( <Image source={paypalImage} style={{borderRadius:10, width:40, height:40}}/>
            )
        }
        else if(routeName == 'Payoneer'){
            return ( <Image source={payoneerImage} style={{borderRadius:10, width:40, height:40}}/>
            )
        }
        else if(routeName == 'Bitcoin' || routeName == 'bitcoin'){
            return ( <Image source={bitcoinImage} style={{borderRadius:10, width:40, height:40}}/>
            )
        }
        else{
            return ( <Image source={moneyImage} style={{borderRadius:10, width:50, height:50, opacity: 0.3}}/>
            )
        }
    }
       
    // manual checkout action routes
    const checkOutManually = async()=>{
       refBuyCheckOut.current.close();
       const manualData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        buy_amt: contactData.buy_amt,
        buy_note: contactData.buy_note,
        serviceName: routeName,
        serviceCategory: 'Exchange',
        method: 'Manual Checkout',
        total_money: totalAmount(),
        "serviceType": routeServiceType
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
                     navigation.navigate('CheckManual', {
                        paymentDetails: buyData,
                        tid: res.data
                    })
                    setContactData({
                        tag_id: '',
                        buy_amt: '',
                        buy_note: '',
                    })
                    setIsLoading(false)
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
            setAmtLoading(false)
            }
        }


// paystack checkout here
 const PaystackOut = async() => {
    setIsLoading(true)
    // check if paystack button/api is available
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
            setIsLoading(false)
            refBuyCheckOut.current.close(); 
        return
        }
    if(response.data.app_payStack_btn == false || response.data.app_payStack_btn =='false'){
            setPaymentButton(true);
            setIsLoading(false)
            refBuyCheckOut.current.close();
        return
        }
    
        refBuyCheckOut.current.close();
       const payStackData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        buy_amt: contactData.buy_amt,
        buy_note: contactData.buy_note,
        serviceName: routeName,
        serviceCategory: 'Exchange',
        method: 'Paystack Checkout',
        total_money: totalAmount(),
        "serviceType": routeServiceType 
        }
        
        if(payStackData.buy_amt != ''){
            navigation.navigate('Paystack_checkout', {
                'amt': payStackData
            })
            setContactData({
                buy_amt:''
            })
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getCurrentRate()
        }, [contactData.buy_amt]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

            

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <Text></Text>
                        <TouchableOpacity 
                        onPress={() => navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                                <Ionicons name='close' size={25} color={colors.textColor}/>
                            </View>
                            </TouchableOpacity>

                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                           
                    </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Buy</Text>
                        </View>

                        <View style={{backgroundColor:colors.bgColor, flex:1,}}>
                            <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:70, marginTop:20}}>
                                <Image source={moneyImage} style={{borderRadius:10, width:40, height:40}}/>
                                    <FontAwesome name='exchange' size={30} color={colors.textSecColor} style={{}} />
                                {CheckRouteName()}
                            </View>
                    
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                                Most reliable, secure and easy way to get virtual funds at low rate.</Text>
                         </View>

                         <Animatable.View 
                            animation={'fadeInUpBig'}
                            delay={100}
                            useNativeDriver={true}
                         style={[styles.formPage, {marginTop:40}]}>
                                
                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>
                                        Enter the amount you want to exchange/buy.</Text>
                                </View>
                                <View style={{
                                    flexDirection:'row', 
                                    marginBottom:15,
                                    marginHorizontal:10,
                                    borderWidth: 1,  // size/width of the border
                                    borderRadius: 7,
                                    borderColor: 'lightgrey',  // color of the border
                                    paddingLeft: 10,
                                    height: 50}}>
                                    <FontAwesome name='dollar' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                    <TextInput 
                                    placeholder='Amount'
                                    style={{flex:1}}
                                    keyboardType='numeric'
                                    maxLength={4}
                                    onChangeText={(val) => handleInputChange("buy_amt", val)}
                                    value={contactData.buy_amt}/>
                                </View>
                                <View style={styles.textAreaContainer}>
                                     <View style={[styles.action, {marginRight: 10}]}>
                                        <TextInput 
                                        placeholder="Reason/purpose (Optional)"
                                        style={styles.textInput}
                                        autoCapitalize="none"
                                        onChangeText={(val) => handleInputChange("buy_note", val)}
                                        multiline={true}
                                        numberOfLines={10}
                                        maxLength={350}
                                        textAlignVertical="top"
                                        value={contactData.buy_note}
                                        />
                                    </View>
                            
                                </View>
            
                            </Animatable.View>
                        
                            {/* custom button here */}
                            <Animatable.View
                                animation={'zoomIn'}
                                delay={500}
                                useNativeDriver={true}>
                                <CustomButton 
                                    buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:30}}
                                    viewStyle={{padding:10, alignItems:'center'}}
                                    textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                    textLabel={'Submit'}
                                    buttonAction={() => processBuy()}
                                />
                            </Animatable.View>
                                  
                    </ScrollView>
                </View>

                <RBSheet
                    ref={refBuyCheckOut}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    openDuration={400}
                    closeDuration={300}
                    height={300}
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
                        <View style={{alignItems:'center', marginTop:10, marginHorizontal: 10}}>
                            <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.textBlack, marginBottom:10}}>Choose checkout method</Text>
                            <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>It's faster to get paid when you check-out with Paystack directly! It's safe, secured and convenient.</Text>
                        </View>
                        {routeName == 'Paypal' || routeName == 'PayPal' ?
                    <TouchableOpacity style={styles.checkBtn}
                    onPress={() => PaystackOut()}>
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
                    {routeName == 'Payoneer' ?
                    <TouchableOpacity style={styles.checkBtn} 
                    onPress={() => PaystackOut()}>
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
                    {routeName == 'Bitcoin' ?
                    <TouchableOpacity style={styles.checkBtn} 
                    onPress={() => PaystackOut()}>
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
                   <TouchableOpacity style={[styles.checkBtn, {backgroundColor:colors.bgColor, borderColor:colors.primaryColor1, borderWidth:1, marginBottom:10, marginTop:10}]}
                    onPress={() => checkOutManually()}>
                        <View>
                            <Text style={{fontFamily:'_regular', fontSize:17, color:colors.primaryColor1}}>Manual transfer</Text>
                        </View>
                    </TouchableOpacity>

                </RBSheet>
            
            <ShowLogoutModal 
                openModal={paymentButton}
                animationType={'slide'}
                modalTitle={'Error!'}
                ModalDesc={'Payment gateway not available at the moment! Please, Use manual transfer'}
                closeBtn={() => closeModal(!paymentButton)}
                logoutBtn={() => closeModal(!paymentButton)}
                modalBgColor={"rgba(0,0,0,0.3)"}
                bntYesText={'Okay'}
            />
        </SafeAreaView>
        </TouchableWithoutFeedback>
         </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    action: {
        marginTop: 20,
        borderBottomColor: '#aaa',
        paddingBottom: 5,
        height:130,
        
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkBtn:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.primaryColor1, 
        marginTop:30, 
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
    
    formPage:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:20,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 0 
        },
        shadowOpacity: 0.5,
        shadowRadius: 0.9,
        elevation: 0.9, 
        },

    settingTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
      },
      
    actionButton:{
      width:100, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center', 
     },
  buttonSellText:{
    color:colors.textColor, 
    fontFamily:'_semiBold', 
    fontSize:15
},
textAreaContainer: {
    borderColor: '#aaa',
    borderWidth: 0.5,
    borderRadius:10,
    marginHorizontal:10,
    marginBottom:20,
    
  },
  textArea: {
    height: 50,
    justifyContent: "flex-start"
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    fontFamily: '_regular',
},

});

export default BuyScreen;
