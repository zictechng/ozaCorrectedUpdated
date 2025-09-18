import React, { useState, useContext, useFocusEffect, useEffect, useCallback, useRef } from 'react';
import { View,Platform, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useIsFocused } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Modal from "react-native-modal";
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import {NumberValueFormat} from '../components/formatValue';
//import CountDown from 'react-native-countdown-component';
import CountDownTimer from 'react-native-countdown-timer-hooks';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { ToastAndroid } from 'react-native';
import { Alert } from 'react-native';
import { ConfirmPaymentModal, applicationDetails } from '../components/controls';


const FundAccountNextScreen = ({route, navigation}) => {
    const refTimer = useRef();
    const isFocused = useIsFocused();
    let amtReceive = route.params?.payment;
    let payId = route.params?.track_id;
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext)
    const [paymentDone, setPaymentDone] = useState(false);
    const [currentRate, setCurrentRate] = useState({});
    const [companyBank, setCompanyBank] = useState({});
    const [paymentTime, setPaymentTime] = useState(false);
    const [paymentTimer, setPaymentTimer] = useState(3540);
    const [timerDisplay, setTimerDisplay] = useState(true);
    const [appInfo, setAppInfo] = useState({})
       // For keeping a track on the Timer
    const [timerEnd, setTimerEnd] = useState(false);
    const [payBtnConfirm, setPayBtnConfirm] = useState(false);

    const paymentConfirmed = () =>{
        setPaymentDone(true);
    }

    const paymentCloseConfirmed = () =>{
        setPaymentDone(false);
    }

    // const cancelledModal =() =>{
    //     navigation.replace('Home');
    //     Dialog.hide();
    // }
    const cancelledModal =() =>{
        setPayBtnConfirm(false);
        //navigation.replace('Home');
        navigation.navigate('UploadPaymentProof',{
            track_id:payId
            });
        //Dialog.hide();
    }
    const timerCallbackFunc = (timerFlag) => {
        // Setting timer flag to finished
        setTimerEnd(timerFlag);
        setPaymentTime(true)
        setPaymentTimer('00:00:00')
        console.log(
          ' Timer is out.',
        );};

      const paymentMade =()=>{
        //setPayBtnConfirm(true);
        navigation.navigate('UploadPaymentProof',{
            track_id:payId
            });
       }

    // get the current rate
      const getCurrentRate = async() =>{
        try {
            const res = await client.get('/api/fetchRate')
            if(res.data.msg == '200'){
              const userDetails = res.data.infoData; 
              setCurrentRate(userDetails)
              //console.log('User rate ', userDetails) 
            }
            else{
                console.log("something went wrong while fetching current rate details")
            }
        } catch (error) {
            console.log( 'fetching rate information failed ', error)
        }
      }
      // get the current company bank account information
      const getCompanyBank = async() =>{
        try {
            const res = await client.get('/api/fetchBankInfo')
            if(res.data.msg == '200'){
              const userDetails = res.data.bankData; 
              setCompanyBank(userDetails)
              //console.log('Bank details ', userDetails) 
            }
            else{
                console.log("something went wrong while fetching company bank details")
            }
        } catch (error) {
            console.log( 'fetching bank information failed ', error)
        }
      }
 // fetch app laughing page information 
 const appDetails = () =>{
    applicationDetails().then((res )=>{
    //console.log(res);
    setAppInfo(res.infoData)
    })
}

    useEffect(() => {
        getCurrentRate();
        getCompanyBank();
        appDetails()
      }, [])
      
      useEffect(() => {
        const interval = setInterval(() => {
            setTimerDisplay((timerDisplay) => !timerDisplay)
        }, 1000)
        return () => {
            clearInterval(interval)
        }
      }, [])
      // function to copy bank one information
      const copyToClipboardBank1 = async () => {
    try {
            await Clipboard.setStringAsync(
                `${appInfo.app_name} App \n`+ ' Account Number: '+ companyBank.company_acct_number1
                +'\n '+'Account Name: '+ companyBank.company_acct_name1
                +'\n '+'Bank Name: '+ companyBank.company_bank1);
        // Display a success message 
        if (Platform.OS === 'android') { 
            ToastAndroid.show('Bank details copied successfully!', 
                ToastAndroid.SHORT); 
        } else if (Platform.OS === 'ios') { 
            Alert.alert('Bank details copied successfully!'); 
        } 
        } catch (error) {
            console.error(error);
        }
        
    };

    // function to copy bank two information
    const copyToClipboardBank2 = async () => {
        try {
             await Clipboard.setStringAsync(
                `${appInfo.app_name} App \n`+ 'Account Number: '+ companyBank.company_acct_number2
                    +'\n '+'Account Name: '+ companyBank.company_acct_name2
                    +'\n '+'Bank Name: '+ companyBank.company_bank2
             );
            // Display a success message 
            if (Platform.OS === 'android') { 
                ToastAndroid.show('Bank details copied successfully!', 
                    ToastAndroid.SHORT); 
            } else if (Platform.OS === 'ios') { 
                Alert.alert('Bank details copied successfully!'); 
            } 
        } catch (error) {
            console.log(error);
        }
        
    };
     const copyToClipboardMoMo = async () => {
        try {
             await Clipboard.setStringAsync(
                `${appInfo.app_name} App \n`+ 'Account Number: '+ companyBank.company_momoAccount
                    +'\n '+'Bank Name: '+ 'MoMo '
             );
            // Display a success message 
            if (Platform.OS === 'android') { 
                ToastAndroid.show('Account details copied successfully!', 
                    ToastAndroid.SHORT); 
            } else if (Platform.OS === 'ios') { 
                Alert.alert('Account details copied successfully!'); 
            } 
        } catch (error) {
            console.log(error);
        }
        
    };
      //const dueAmount = (currentRate * amtReceive) 

  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        {/* <TouchableOpacity style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='arrow-back' size={25} color={colors.textColor}/>
                        </TouchableOpacity> */}

                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                        <TouchableOpacity style={{}} onPress={() =>navigation.replace('Home')}>
                        <View>
                            <Ionicons name='close-outline' size={30} color={colors.blackColor1}/>
                           
                        </View>
                     </TouchableOpacity>
                    </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Funding Initiated</Text>
                        </View>

                        {/* <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                                Request to fund your account has been sent Successfully.</Text>
                         </View> */}
                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textBlack, opacity:0.7}}>
                                        Use your email ID or Transaction ID in your description when making the transfer payment to fast track your account funding.</Text>
                                </View>
                            <View style={[styles.formPage, {marginTop:5}]}>
                                
                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    <Text style={{fontFamily:'_regular', fontSize:13, color:colors.textBlack, opacity:0.6}}>
                                        Your request is currently pending, till payment is receive your wallet will be funded.
                                        </Text>
                                </View>

                                <View style={{justifyContent:'center', alignItems:'center', marginBottom:15}}>

                                {!paymentTime && <CountDownTimer
                                                //ref={refTimer}
                                                timestamp={paymentTimer}
                                                timerCallback={timerCallbackFunc}
                                                containerStyle={{
                                                    height: 40,
                                                    width: 100,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderRadius: 10,
                                                    backgroundColor: 
                                                    colors.blackColor1,
                                                }}
                                                textStyle={{
                                                    fontSize: 25,
                                                    color: '#FFFFFF',
                                                    fontWeight: '500',
                                                    letterSpacing: 0.25,
                                                    }}
                                                />}
                                                {/*  */}
                                                {paymentTime && <View style={{
                                                    height: 56,
                                                    width: 120,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderRadius: 10,
                                                    backgroundColor:'#bf5f0b',
                                                }}>
                                                <Text style={[styles.blinkStyle, {
                                                 display: timerDisplay ? 'none': 'flex'
                                                }]}>
                                                00:00:00
                                            </Text>
                                        </View>}

                                        <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textBlack, opacity:0.6}}>
                                                Request elapsed withing 24hours
                                        </Text>
                                </View>
                           
                            </View>
                                {/* This show count down timer in seconds */}
                                    {/* <CountdownCircleTimer
                                        isPlaying
                                        duration={60}
                                        colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                                        colorsTime={[7, 5, 2, 0]}>
                                        {({ remainingTime }) => <Text>{remainingTime}</Text>}
                                    </CountdownCircleTimer> */
                                    }

                            <View style={[styles.formPage, {marginTop:40}]}>
                                
                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    <View style={{flexDirection:'row', justifyContent:"space-between"}}>
                                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>
                                            Amount to send in naira
                                        </Text>
                                        {/* <TouchableOpacity onPress={() =>paymentConfirmed()}>
                                            <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.primaryColor1}}>
                                                Account Details
                                            </Text>
                                        </TouchableOpacity> */}
                                        
                                    </View>
                                    
                                        <Text style={{fontFamily:'_regular', fontSize:30, color:colors.textBlack}}>
                                            <NumberValueFormat value={amtReceive} />
                                        </Text>
                                </View>
                           
                            </View>

                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    <Text style={{fontFamily:'_regular', fontSize:12, color:colors.textBlack}}>
                                        Payment should be made in naira to {appInfo.app_name} official account only from any where in the world.</Text>
                                        <TouchableOpacity onPress={() =>paymentConfirmed()}>
                                            <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.primaryColor1, marginTop:10}}>
                                                View Account Details
                                            </Text>
                                        </TouchableOpacity>
                                </View>
                        
                            {/* custom button here */}
                            <CustomButton 
                                buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:10, marginBottom:20, justifyContent:'center', alignItems:'center'}}
                                viewStyle={{padding:12, alignItems:'center'}}
                                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                textLabel={"I'v made payment"}
                                buttonAction={() => paymentMade()}
                            />
                    {/* view bank details modal */}
                    <Modal isVisible={paymentDone}
                        animationIn={'zoomIn'}
                        animationInTiming={700}
                        animationOut={'slideOutDown'}
                        animationOutTiming={500}
                        backdropOpacity={0.60}>
                    <View style={styles.dialogView1}>
                        <View style={styles.dialogView2}>
                            <Text style={styles.dialogText1}>
                                Company Account Details
                            </Text>
                            {/* <Pressable style={styles.dialogCancelBtn}
                            onPress={() =>openAcctPinModal(false)}>
                            <Ionicons name='close' size={20} />
                            </Pressable> */}
                        </View>
                            <Text style={[styles.dialogText2, {fontSize:15, fontFamily:'_semiBold', textAlign:"center"}]}>
                                Use this details to do your payment.
                            </Text>

                            <View style={{flexDirection:'row', marginHorizontal:10}}>
                                <TouchableOpacity onPress={() => copyToClipboardBank1()}>
                                <View style={{width:30, height:30}}>
                                    <Ionicons name='copy-outline' size={20} color={colors.primaryColor2} />
                                </View>
                                    </TouchableOpacity>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={styles.dialogText2}>
                                        Account Name: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_acct_name1}</Text>
                                    </Text>
                                    <Text style={styles.dialogText2}>
                                        Bank Name: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_bank1}</Text>
                                    </Text>
                                    <Text style={styles.dialogText2}>
                                        Account Number: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_acct_number1}</Text>
                                    </Text>
                                </View>
                            </View>
                         
                            <View style={{borderBottomWidth:1, color:colors.redColor, marginBottom:8, opacity:0.3}}></View>
                            
                                <View style={{flexDirection:'row', marginHorizontal:10}}>
                                    <TouchableOpacity onPress={() => copyToClipboardBank2()}>
                                    <View style={{width:30, height:30}}>
                                    <Ionicons name='copy-outline' size={20} color={colors.primaryColor2} />
                                    
                                    </View>
                                        </TouchableOpacity>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={styles.dialogText2}>
                                        Account Name: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_acct_name2}</Text>
                                    </Text>
                                    <Text style={styles.dialogText2}>
                                    Account Number: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_acct_number2}</Text>
                                    </Text>
                                    <Text style={styles.dialogText2}>
                                    Bank Name: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_bank2}</Text>
                                    </Text>
                                 </View>
                            </View>

                            <View style={{borderBottomWidth:1, color:colors.redColor, marginBottom:8, opacity:0.3}}></View>
                            
                                {/* <View style={{flexDirection:'row', marginHorizontal:10}}>
                                    <TouchableOpacity onPress={() => copyToClipboardMoMo()}>
                                    <View style={{width:30, height:30}}>
                                        <Ionicons name='copy-outline' size={20} color={colors.primaryColor2} />
                                    </View>
                                        </TouchableOpacity>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={styles.dialogText2}>
                                        Account Name: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>MoMo</Text>
                                    </Text>
                                    <Text style={styles.dialogText2}>
                                    Account Number: <Text style={[styles.dialogText2, {fontFamily:'_semiBold'}]}>{companyBank.company_momoAccount}</Text>
                                    </Text>
                                    
                                 </View>
                            </View> */}
                            
                        <View style={{justifyContent:'center', alignItems:'center', marginBottom:10, marginTop:10}}>
                            <TouchableOpacity style={styles.dialogActionBtn}
                            onPress={() => paymentCloseConfirmed()}>
                            <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.primaryColor1, marginTop:4}}>Okay</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </Modal>

                <ConfirmPaymentModal 
                    openModal={payBtnConfirm}
                    animationType={'slide'}
                    //modalTitle={'Wow!'}
                    ModalShortDesc={'Wow...'}
                    ModalDesc={`This sounds good! If payment has been made, we will review and credit your account shortly, thank you.`}
                    closeBtn={() => cancelledModal()}
                    logoutBtn={() => cancelledModal()}
                    modalBgColor={"rgba(0,0,0,0.7)"}
                    bntYesText={'Okay'}
                />

        </ScrollView>
     </View>
            
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
    action: {
        marginTop: 20,
        borderBottomColor: '#aaa',
        paddingBottom: 5,
        
    },
    blinkStyle:{
        fontSize: 25,
        color: '#FFFFFF',
        fontWeight: '500',
        letterSpacing: 0.25,
        },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
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
        fontSize:15, 
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
    formPage:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:5,
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
    borderColor: '#aaa',
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
    color: '#05375a',
    fontFamily: '_regular',
},

});

export default FundAccountNextScreen;
