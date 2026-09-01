import React, { useState, useEffect, useContext, useRef} from 'react';
import { View, Text,Platform, TextInput, StatusBar, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable'
import { Ionicons,FontAwesome} from '@expo/vector-icons';
import { gs,colors } from '../styles';
//import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import LoaderIndicator from '../components/loaderIndicator';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowLogoutModal } from '../components/controls';


const FundAccountScreen = ({navigation}) => {
    const isFocused = useIsFocused();
    
    const {logoutAction, userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [amtLoading, setAmtLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startPaystack, setStartPaystack] = useState(false);
    const [minimFunding, setMinimFunding] = useState({});
    const [maxiFunding, setMaxiFunding] = useState({});
    const [paymentButton, setPaymentButton] = useState(false);
    const refFundCheckOut = useRef();

    // get local storage app setting details
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
        const dataInfo = JSON.parse(res)
        setMinimFunding(dataInfo.app_minim_funding)
        setMaxiFunding(dataInfo.app_maxi_funding)
        
        })
        //console.log(minimFunding)

        const [contactData, setContactData] = React.useState({
        amt_sending: '',
        amt_note: '',
        check_subjectInputChange: false,
        check_messageInputChange: false,
    });
    const handleInputChange = (name, val) => {
        setContactData({
          ...contactData,
          [name]: val,
        });
    }
    const paystackWebViewRef = useRef()
    useEffect(() => {
        
    }, [])

    // close logout modal
    const closeModal = () =>{
        setPaymentButton(false);
      }

    const processSell = () =>{
        
        if(contactData.amt_sending == null || contactData.amt_sending == ''){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Some required information are missing',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
             }
        if(contactData.amt_sending == 0){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Wrong value entered',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
        if(contactData.amt_sending < minimFunding){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: `Minimum of \u20A6${minimFunding} accepted`,
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
        }
        refFundCheckOut.current.open();
     }

    // function to process funding request
    const checkOutManually = async() =>{
        const amtData={
            amt: contactData.amt_sending,
            note: contactData.amt_note,
            userId: userInfo.userData._id,
         }
            //console.log("Data sent ", amtData)
            if(amtData.amt == '' || amtData.amt == undefined){
                Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Please enter a valid amount',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
            return
            }
        // check amount sending
         if(amtData.amt > maxiFunding){
            Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: `Amount should not exceed \u20A6${maxiFunding}`,
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        return
         }
         setAmtLoading(true)
         try {
            const res = await client.post('/api/userAccount_funding', amtData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                }
            })
            // if the response is successful redirect to the new page
                if(res.data.msg == '200'){
                    refFundCheckOut.current.close();
                    //console.log('result ', res.data.feedback)
                    navigation.navigate('FundingNextPage',{
                    payment: amtData.amt,
                    track_id:res.data.feedback 
                    });

                    setContactData({
                        amt_sending: '',
                        amt_note: '',
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
            else if(res.data.status == '403'){
                refFundCheckOut.current.close();
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
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
                refFundCheckOut.current.close();
            return
            }
        if(response.data.app_payStack_btn == false || response.data.app_payStack_btn =='false'){
                setPaymentButton(true);
                setIsLoading(false)
                refFundCheckOut.current.close();
            return
            }
        
        refFundCheckOut.current.close();
        const payStackData ={
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        amt: contactData.amt_sending,
        note: contactData.amt_note,
        userId: userInfo.userData._id,
        serviceName: 'Account Funding',
        serviceCategory: 'Exchange',
        method: 'Paystack Checkout',
        total_money: contactData.amt_sending,
        }

        // check funding limit before sending request to paystack
        const res = await client.post('/api/check_fundingLimit', payStackData,{
            headers: {
            'Authorization': 'Bearer '+userToken,
            }
        })
        // if the response is successful redirect to the new page
         if(res.data.status == '401'){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Failed to authenticate',
            textBody: res.data.message,
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
            setIsLoading(false)
            refFundCheckOut.current.close();
        return
        }
        else if(res.data.status == '403'){
         refFundCheckOut.current.close();
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: res.data.message,
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
        setIsLoading(false)
        return
         }
    
        if(payStackData.buy_amt != ''){
            navigation.navigate('FundAcctPaystackCheckout', {
                'amt': payStackData
            })
            setContactData({
                buy_amt:''
            })
            setIsLoading(false)
        }
    }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.primaryColor2}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{flex:1}}>

                    <StatusBar barStyle="light-content" translucent backgroundColor={"transparent"}/>

                 <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        
                        <TouchableOpacity 
                        onPress={() =>navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0, backgroundColor:colors.colorWhite}]}>
                            <Ionicons name='close' size={23} color={colors.primaryColor1}/>
                        </View>
                           </TouchableOpacity>
                           <Text></Text>
                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                        </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                 {/* show loader when processing request */}
                        {amtLoading && <LoaderIndicator 
                            loader={amtLoading}
                            textInfo={'Processing...'}
                            />}

                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Fund Account</Text>
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
                                        Enter the amount you want to fund your account with.</Text>
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
                                    <FontAwesome name='money' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                    <TextInput 
                                    placeholder='Amount (in Naira)'
                                    style={{flex:1}}
                                    keyboardType='numeric'
                                    onChangeText={(val) => handleInputChange("amt_sending", val.trim())}
                                    value={contactData.amt_sending}
                                    />
                                </View>
                                <View style={styles.textAreaContainer}>
                                     <View style={[styles.action, {marginRight: 10}]}>
                                        <TextInput 
                                        placeholder="Reason/purpose (Optional)"
                                        style={styles.textInput}
                                        autoCapitalize="none"
                                        onChangeText={(val) => handleInputChange("amt_note", val)}
                                        multiline={true}
                                        numberOfLines={10}
                                        maxLength={350}
                                        textAlignVertical="top"
                                        value={contactData.amt_note}
                                        />
                                    </View>
                            
                                </View>
            
                            </Animatable.View>
                        
                            {/* custom button here */}
                            <Animatable.View
                            animation={'zoomIn'}
                            delay={100}
                            useNativeDriver={true}
                            >
                                <CustomButton 
                                buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:30}}
                                viewStyle={{padding:10, alignItems:'center'}}
                                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                textLabel={'Fund Account'}
                                buttonAction={() => processSell ()}
                                disabled={amtLoading}
                            />
                            </Animatable.View>
                     <RBSheet
                        ref={refFundCheckOut}
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
                                <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>It's faster to get paid when you checkout with Paystack directly</Text>

                            </View>
                            
                        <TouchableOpacity style={styles.checkBtn}
                            onPress={()=> PaystackOut()}>
                            <View>
                                <Text style={{fontFamily:'_regular', fontSize:17, color:colors.bgColor}}>  
                                {isLoading ? " " : "Pay with Paystack"}
                                    {isLoading && (
                                    <ActivityIndicator color={colors.textColor} size={25} />
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    <TouchableOpacity style={[styles.checkBtn, {backgroundColor:colors.bgColor, borderColor:colors.primaryColor1, borderWidth:1, marginBottom:10, marginTop:10}]}
                        onPress={() => checkOutManually()}>
                            <View>
                                <Text style={{fontFamily:'_regular', fontSize:17, color:colors.primaryColor1}}>
                                {amtLoading ? " " : "Manual Transfer"}
                                    {amtLoading && (
                                    <ActivityIndicator color={colors.textColor} size={25} />
                                    )}
                                </Text>
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
                        modalBgColor={"rgba(0,0,0,0.5)"}
                        bntYesText={'Okay'}
                    />
                    </ScrollView>
                </View>
            
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
        shadowRadius: 1,
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
    borderWidth: 0.5,
    borderRadius:10,
    marginHorizontal:10,
    marginBottom:20
  },
  textArea: {
    height: 50,
    justifyContent: "flex-start"
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    fontFamily: '_regular',
    textAlignVertical: 'top',  // hack android
    height: 150,  
},

});

export default FundAccountScreen;
