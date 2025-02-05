import React, { useState, useEffect, useContext, useRef} from 'react';
import { View, Text,Platform, TextInput, StatusBar, StyleSheet, TouchableOpacity, SafeAreaView, Image, ImageBackground, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
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
import { NumberDollarValueFormat } from '../components/formatDollarValue';


const WithdrawFund = ({navigation}) => {
    const isFocused = useIsFocused();
    
    const {logoutAction, userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [amtLoading, setAmtLoading] = useState(false);
    const [minimFunding, setMinimFunding] = useState({});
    const [maxiWithdraw, setMaxiWithdraw] = useState({});
    const [paymentButton, setPaymentButton] = useState(false);
    const refFundCheckOut = useRef();

    // get local storage app setting details
    const data = AsyncStorage.getItem('AppSettingData').then((res) => {
        const dataInfo = JSON.parse(res)
        setMinimFunding(dataInfo.app_minim_funding)
        setMaxiWithdraw(dataInfo.app_maxi_withdrawal)
        
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

    // close successful modal
    const closeModal = () =>{
        refFundCheckOut.current.close();
        navigation.navigate('Home')
      }

    // function to process withdrawal request
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
         setAmtLoading(true)
         try {
            const res = await client.post('/api/userFundWithdrawal', amtData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                }
            })
           
            // if the response is successful redirect to the new page
                if(res.data.msg == '200'){
                    refFundCheckOut.current.open();
                    //console.log('result ', res.data.feedback)
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
                    if(error.status == '403'){
                        Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: error.message,
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


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{flex:1}}>
                    {
                    isFocused &&
                    <StatusBar
                    barStyle={'dark-content'}
                    translucent
                    backgroundColor="transparent"/>
                    }
                 <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        
                        <TouchableOpacity 
                        onPress={() =>navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
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
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Withdraw Funds</Text>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                            Enter the amount you want to withdraw today.</Text>
                         </View>

                         <Animatable.View 
                            animation={'fadeInUpBig'}
                            delay={100}
                            useNativeDriver={true}
                            style={[styles.formPage, {marginTop:40}]}>
                                
                                <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                    {/* <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>
                                        Enter the amount you want to fund your account with.</Text> */}
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
                                    placeholder='Amount (in USD)'
                                    style={{flex:1}}
                                    keyboardType='numeric'
                                    onChangeText={(val) => handleInputChange("amt_sending", val.trim())}
                                    value={contactData.amt_sending}
                                    />
                                </View>
                                <Text style={{marginHorizontal:20, marginTop:-10, marginBottom:10, color:'#aaa', fontSize:12, fontFamily:'_regular'}}>
                                    Current Wallet balance: <NumberDollarValueFormat value={userInfo.userData?.all_bonus_acct} /></Text>
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
                                textLabel={'Withdraw'}
                                buttonAction={() => checkOutManually ()}
                                disabled={amtLoading}
                            />
                            </Animatable.View>
                     <RBSheet
                        ref={refFundCheckOut}
                        closeOnDragDown={true}
                        closeOnPressMask={false}
                        openDuration={400}
                        closeDuration={300}
                        height={300}
                        closeOnPressBack={false}
                        keyboardAvoidingViewEnabled={true}
                        customStyles={{
                        container:{
                            backgroundColor: colors.bgColor,
                            borderTopLeftRadius:20,
                            borderTopRightRadius:20,
                        },
                        draggableIcon: {
                            backgroundColor: "#000"
                        }
                        }}>
                        <ScrollView>
                            <View style={{alignItems:'center', marginTop:10, marginHorizontal:20}}>
                                    <Animatable.View
                                    animation={'zoomIn'}
                                    delay={100}
                                    useNativeDriver={true}>
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.textBlack, marginBottom:10,marginTop:-10 }}>
                                        <Ionicons name='checkmark-circle' size={70} style={{color:colors.primaryColor1}} /></Text>
                                    </Animatable.View>
                                
                                
                                <Text style={{fontFamily:'_semiBold', fontSize:20, color:colors.textSecColor, marginTop:-10, marginBottom:10}}>
                                    Successful
                                </Text>

                                <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>
                                    Your withdrawal request was successfully submitted! Your bank account will be credited once approved.
                                </Text>
                            </View>
                            <CustomButton 
                                buttonStyle={{borderRadius:10, marginHorizontal:15, backgroundColor:colors.primaryColor1, marginTop:30, marginBottom:10}}
                                viewStyle={{padding:10, alignItems:'center'}}
                                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                textLabel={'Okay'}
                                buttonAction={() => closeModal ()}
                                disabled={amtLoading}
                            />
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
    textAlignVertical: 'top',  // hack android
    height: 150,  
},

});

export default WithdrawFund;
