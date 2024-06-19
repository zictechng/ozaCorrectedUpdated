import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    TouchableOpacity,
    KeyboardAvoidingView, 
    Keyboard, 
    TouchableWithoutFeedback, 
    SafeAreaView, 
    Image, 
    ImageBackground, 
    ScrollView, 
    Platform,
    Alert} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons, FontAwesome} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';
import moneyImage from '../assets/images/money_ex.png';
import { AuthContext } from '../contextAPI/authContext';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import RBSheet from 'react-native-raw-bottom-sheet';
import client from '../contextAPI/client';
import LoaderIndicator from '../components/loaderIndicator';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowLogoutModal } from '../components/controls';


const SellingScreen = ({route, navigation}) => {
    let routeName = route.params?.pageName;
    let routeServiceType = route.params?.categoryType
      const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
      const [isLoading, setIsLoading] = useState(false);
      
      const [result, setResult] = useState(null);
      const [openedBrowser, setOpenedBrowser] = useState(false);
      const [emailVerify, setEmailVerify] = useState("");
      const [currentRate, setCurrentRate] = useState({});
      const [paymentButton, setPaymentButton] = useState(false);

      const [baseUrl, setBaseUrl] = useState({});

      const [contactData, setContactData] = useState({
        tag_id: '',
        sell_amt: '',
        sell_note: '',
    });

    // get local storage app setting details
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
      const dataBaseUrl = JSON.parse(res)
      setBaseUrl(dataBaseUrl.app_baseurl)
      })

    const refSellCheckOut = useRef();
    //console.log(baseUrl)

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
        totalMoneySend = currentRate.paypal_buying * contactData.sell_amt
      return  totalMoneySend
      }
      else if(routeName == 'Payoneer'){
        totalMoneySend = currentRate.payoneer_buying * contactData.sell_amt
        return  totalMoneySend
      }
      else if(routeName == 'Bitcoin'){
        totalMoneySend = currentRate.btc_buying * contactData.sell_amt
        return  totalMoneySend
      }
    }

    //process the sell request here
    const sellData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        sell_amt: contactData.sell_amt,
        sell_note: contactData.sell_note,
        serviceName: routeName,
        serviceCategory: 'Exchange',
        service_type: routeServiceType,
        total_moneySell: totalAmount(),
     }

    const processSell = () =>{
        
        if(sellData.sell_amt == null || sellData.sell_amt == ''){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Some required information are missing',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
             }
        if(sellData.sell_amt == 0){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Wrong value entered',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
        if(sellData.sell_amt < 5){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Minimum of $5 accepted',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
             refSellCheckOut.current.open();
     }

    const CheckRouteName = () =>{
        if(routeName == 'PayPal' || routeName == 'Paypal'){
            return ( <Image source={paypalImage} style={{borderRadius:10, width:40, height:40}}/>
            )
        }
        else if(routeName == 'Payoneer'){
            return ( <Image source={payoonerImage} style={{borderRadius:10, width:40, height:40}}/>
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
       refSellCheckOut.current.close();
       const manualData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        sell_amt: contactData.sell_amt,
        sell_note: contactData.sell_note,
        serviceName: routeName,
        serviceCategory: 'Exchange',
        method: 'Manual Checkout',
        total_money: totalAmount(),
        "serviceType": routeServiceType
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
                        paymentDetails: sellData,
                        tid: res.data
                    })
                    setContactData({
                        tag_id: '',
                        sell_amt: '',
                        sell_note: '',
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

    const checkOutPaypal2 = () => {
        refSellCheckOut.current.close();
        const manualData ={
            tag_id: userInfo.userData.tag_id,
            myId: userInfo.userData._id,
            amt: contactData.sell_amt,
            sell_note: contactData.sell_note,
            serviceName: routeName,
            serviceCategory: 'Exchange',
            method: 'Paypal Checkout',
            "serviceType": routeServiceType
        }
        if(sellData.sell_amt != ''){
            navigation.navigate('PaypalPayment', {
                'amt': manualData
            })
            setContactData({
                sell_amt:''
            })
        }
    }

    // checkout with payoneer
    const checkOutPayoneer = () => {
        refSellCheckOut.current.close();
        const manualData ={
            tag_id: userInfo.userData.tag_id,
            myId: userInfo.userData._id,
            amt: contactData.sell_amt,
            sell_note: contactData.sell_note,
            serviceName: routeName,
            serviceCategory: 'Exchange',
            method: 'Payoneer Checkout',
            total_money: totalAmount(),
            "serviceType": routeServiceType
        }
        if(sellData.sell_amt != ''){
            setIsLoading(false)
            navigation.navigate('PayoneerCheckout', {
                'amt': manualData
            })
            setContactData({
                sell_amt:''
            })
        }
    }

      useEffect(() => {
        if (openedBrowser) {
            refSellCheckOut.current.close();
            const observer = setInterval(() => {
                // your logic: anything you need to happen when the browser has closed
                console.log('Payment closed ')
                setContactData({
                    sell_amt:''
                })
                setOpenedBrowser(false);
                setIsLoading(false)
            }, 500);
          navigation.navigate('Home')
            return () => {
                clearInterval(observer);
            };
          
        }
    }, [openedBrowser]);

    // send request to backend to process payment with paypal
const checkOutPaypal3 = async () => {
    //console.log('send Mail ', userAmount)
    if (contactData.sell_amt === "" || contactData.sell_amt === null) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Please enter amount",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    // send request to backend here....
    // Prepare data for the payment request
    const paymentData = {
      amount: contactData.sell_amt, 
      currency: "USD",
      tag_id: userInfo.userData.tag_id,
      myId: userInfo.userData._id,
      amt: contactData.sell_amt,
      sell_note: contactData.sell_note,
      serviceName: routeName,
      serviceCategory: 'Exchange',
      method: 'Paypal Checkout',
      "serviceType": routeServiceType
    };
    setIsLoading(true)
    try {
      // Make a POST request to the backend endpoint
      const response = await fetch(`${baseUrl}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+userToken,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        // Handle error response from the server
        console.error('Error:', response.statusText);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Failed to initiate payment',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        return;
      }
      const responseData = await response.json();
      //console.log('My way ', responseData.status);
      if(responseData.status == '401'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: responseData.message + '!\n Your login not authenticated',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          });
          setIsLoading(false);
          return;
      }

      // Parse the response JSON
      console.log(responseData.approvalUrl, "FDFd")
      _handlePressButtonAsync(responseData.approvalUrl)
      setEmailVerify(responseData.approvalUrl)
      
      // console.log('Payment feedback ', result);
      if (result && result.type === "cancel") {
        console.log('Browser closed by user');
      }else if (result && result.type === "dismiss") {
        console.log('Browser dismiss by user');
      }
      else if (result && result.type === "successful") {
        console.log('Payment successful');
      }
      else if (result && result.type === "success") {
        console.log('Payment success');
      }
      
      setIsLoading(false)
      setContactData({
        sell_amt:''
    })

    } catch (error) {
      console.error('Error:', error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'An error occurred while processing the payment',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      setIsLoading(false)
      return
    }

  };

   // send request to backend to process payment with paypal
const checkOutPaypal = async () => {
    //console.log('send Mail ', userAmount)
    if (contactData.sell_amt === "" || contactData.sell_amt === null) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Please enter amount",
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    // send request to backend here....
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
          refSellCheckOut.current.close();
      return
      }
  if(response.data.app_paypal_bnt == false || response.data.app_paypal_bnt =='false'){
      
          setPaymentButton(true);
          setIsLoading(false)
          refSellCheckOut.current.close();
      return
      }
    // Prepare data for the payment request
    const paymentData = {
      amount: contactData.sell_amt, 
      currency: "USD",
      tag_id: userInfo.userData.tag_id,
      myId: userInfo.userData._id,
      amt: contactData.sell_amt,
      sell_note: contactData.sell_note,
      serviceName: routeName,
      serviceCategory: 'Exchange',
      method: 'Paypal Checkout',
      total_money: totalAmount(),
      "serviceType": routeServiceType
      };
    
    try {
      // Make a POST request to the backend endpoint
      const response = await fetch(`${baseUrl}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+userToken,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        // Handle error response from the server
        console.error('Error:', response.statusText);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'Failed to initiate payment',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        return;
      }
      const responseData = await response.json();
      //console.log('My way ', responseData.status);
      if(responseData.status == '401'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: responseData.message + '!\n Your login not authenticated',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          });
          setIsLoading(false);
          return;
      }
      if(responseData.msg == '200'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Success',
            textBody: 'Payment successful done',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          });
          setIsLoading(false)
          return;
      }

      // Parse the response JSON
      //console.log(responseData.approvalUrl, "FDFd")
      const approvalUrl = responseData.approvalUrl;
      //navigation.navigate('WebViewScreen', { uri: approvalUrl });
      navigation.navigate('paypalWebview', { uri: approvalUrl });
      setIsLoading(false)
      refSellCheckOut.current.close();
      
      // console.log('Payment feedback ', result);
      if (result && result.type === "cancel") {
        console.log('Browser closed by user');
      }else if (result && result.type === "dismiss") {
        console.log('Browser dismiss by user');
      }
      else if (result && result.type === "successful") {
        console.log('Payment successful');
      }
      else if (result && result.type === "success") {
        console.log('Payment success');
      }
      
      setIsLoading(false)
      setContactData({
        sell_amt:''
    })

    } catch (error) {
      console.error('Error:', error.message);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'An error occurred while processing the payment',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      setIsLoading(false)
      return
    }

  };

  useEffect(() => {
    getCurrentRate()
    //console.log(" Money ", totalAmount())
     
    }, [contactData.sell_amt]);

  return (
    
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={{flex:1}}>

                <StatusBar style='dark' />

            <View style={gs.homeHeaderRow}>
                <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                    <Text></Text>
                    {/* <Text style={styles.settingTitle}>Settings</Text> */}
                   
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                      </View>
                    </TouchableOpacity>
                    
                </View>
                <View style={{marginBottom:30}}></View>
                
            </View>
        <View style={{flex:1, backgroundColor:colors.bgColor}}>
         
        <ScrollView>
            <View style={{marginHorizontal:10, marginTop:10}}>
                <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Sell</Text>
            </View>
            {/* show loader when processing request */}
            {/* {isLoading && <LoaderIndicator 
                loader={isLoading}
                textInfo={'Processing...'}
                />} */}
        <View style={{backgroundColor:colors.bgColor, flex:1,}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:70, marginTop:20}}>
            
            {CheckRouteName()}
            <FontAwesome name='exchange' size={30} color={colors.textSecColor} style={{}} />
            
            <Image source={moneyImage} style={{borderRadius:10, width:40, height:40}}/>
          </View>
                
      </View>

            <View style={{marginHorizontal:20, marginTop:10}}>
                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                    Most reliable, secure and profitable way to your hard earned virtual funds, with instant payment</Text>
             </View>

             <Animatable.View
                animation={'fadeInUpBig'}
                delay={100}
                useNativeDriver={true}
                style={[styles.formPage, {marginTop:30}]}>
                    
                    <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>
                            Enter the amount you want to sell/exchange.</Text>
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
                        onChangeText={(val) => handleInputChange("sell_amt", val)}
                        value={contactData.sell_amt}/>
                    </View>
                    <View style={styles.textAreaContainer}>
                         <View style={[styles.action, {marginRight: 10}]}>
                            <TextInput 
                            placeholder="Reason/purpose (Optional)"
                            style={styles.textInput}
                            autoCapitalize="none"
                            onChangeText={(val) => handleInputChange("sell_note", val)}
                            multiline={true}
                            numberOfLines={10}
                            maxLength={350}
                            textAlignVertical="top"
                            value={contactData.sell_note}
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
                      buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:30, marginBottom:20}}
                      viewStyle={{padding:10, alignItems:'center'}}
                      textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                      textLabel={'Submit'}
                      buttonAction={() => processSell()}
                  />
                </Animatable.View>
               
                
            </ScrollView>
         </View>

                <RBSheet
                    ref={refSellCheckOut}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    openDuration={400}
                    closeDuration={300}
                    height={276}
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
                  <ScrollView>
                    <View style={{alignItems:'center', marginTop:10, marginHorizontal:10}}>
                        <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.textBlack, marginBottom:10}}>Choose checkout method</Text>
                        {routeName != 'Bitcoin' && <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>It's faster to get paid when you checkout with {routeName} directly</Text>}
                        {routeName == 'Bitcoin' && <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>Safe, secured, reliable and convenient way to get virtual funds</Text>}
                    </View>
                        {routeName == 'Paypal' || routeName == 'PayPal' ?
                    <TouchableOpacity style={styles.checkBtn}
                        onPress={checkOutPaypal}>
                        <View>
                            <Text style={{fontFamily:'_regular', fontSize:17, color:colors.bgColor}}>  
                             {isLoading ? " " : "Check out with Paypal"}
                                {isLoading && (
                                <ActivityIndicator color={colors.textColor} size={25} />
                                )}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    :''}
                    {routeName == 'Payoneer' ?
                    <TouchableOpacity style={styles.checkBtn} 
                    onPress={() => checkOutPayoneer()}>
                        <View>
                            <Text style={{fontFamily:'_regular', fontSize:17, color:colors.bgColor}}> Check out with Payoneer</Text>
                        </View>
                    </TouchableOpacity>
                    :''}
                    <TouchableOpacity style={[styles.checkBtn, {backgroundColor:colors.bgColor, borderColor:colors.primaryColor1, borderWidth:1, marginBottom:10, marginTop:10}]}
                    onPress={() => checkOutManually()}>
                        <View>
                            <Text style={{fontFamily:'_regular', fontSize:17, color:colors.primaryColor1}}> Manual Transfer</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{marginBottom: 20}}></View>
                </ScrollView>
             </RBSheet>


             <ShowLogoutModal 
              openModal={paymentButton}
              animationType={'fade'}
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
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
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
    elevation: 0.8, 
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

export default SellingScreen;
