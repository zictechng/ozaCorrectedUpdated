import React, { useState, useContext, useEffect } from "react";
import { Platform,Alert, StatusBar, Button, StyleSheet, Pressable, View, Text, TextInput, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { gs,colors } from '../styles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from 'react-native-animatable'
//import { StatusBar } from 'expo-status-bar';
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons,} from '@expo/vector-icons';
import CustomButton from '../components/customButton';
import Modal from "react-native-modal";
import ConfirmAccountPin from "../components/confirmPin";
import { KeyboardAvoidingView } from "react-native";
import { AuthContext } from "../contextAPI/authContext";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { noticeData } from "../components/errorNotice";
import { NumberValueFormat } from "../components/controls";
import { ActivityIndicator } from "react-native";
import {DotIndicator} from 'react-native-indicators';
import client from "../contextAPI/client";
import { Dropdown } from "react-native-element-dropdown";
import { SendFundOptionData } from "../model/data";
import { NumberDollarValueFormat } from "../components/formatDollarValue";

const SendFundScreen = ({navigation}) => {
    //source={bgImage} resizeMode='stretch'
    const {logoutAction, userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [amtLoading, setAmtLoading] = useState(false);

    const [acctPin, setAcctPin] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    const [newData, setNewData] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isGettingID, setIsGettingID] = useState(false);
    const [appDetails, setAppDetails] = useState({});
    const [messageError, setMessageError] = useState('');

    // get app information from local storage here
 _getAppLocalInfo = async () =>{

    AsyncStorage.getItem('AppSettingInfo').then(res =>{
        if(res != null){
            setAppDetails(JSON.parse(res))
        }
        }).catch(err => console.log(err.message))
     }

    const [contactData, setContactData] = useState({
        tag_id: '',
        sendAmt: '',
        send_note: '',
    });
    const handleInputChange = (name, val) => {
        setContactData({
          ...contactData,
          [name]: val,
        });
    }

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
        setAmtLoading(false)
        setMessageError('')
    };

    // fetch receiver details
    const getReceiverDetails = async() => {
        setIsGettingID(true)
        try {
            
        const res = await client.post('/api/fetch_AccountDetailsMobile',{
          data: contactData.tag_id
        } 
        )
          if(res.data.msg == '200'){
            //console.log(' ', res.data.userData);
          setNewData(res.data.userData)
          
          }
          else if(res.data.status == '404'){
           //console.log('no account found')
           setNewData('')
          }
          else {
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Error',
              textBody: 'Something went wrong',
              textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
              titleStyle: { fontFamily: '_bold', fontSize: 20 },
              })
          }

      } catch (error) {
        console.log(error.message)
      }
      finally {
        setIsGettingID(false)
      }
    }
    
    useEffect(() => {
        // Use a setTimeout to delay the execution of the function
        const timeoutId = setTimeout(() => {
          if(contactData.tag_id.length == 7){
            getReceiverDetails();
          }
          // Clear the timeout to prevent further execution
          clearTimeout(timeoutId);
        }, 500);
        _getAppLocalInfo()
      }, []);

    // this will be call each time the contactData.tag_id changes
    useEffect(() => {
        // Use a setTimeout to delay the execution of the function
        const timeoutId = setTimeout(() => {
          if(contactData.tag_id.length == 7){
            getReceiverDetails();
          }
          // Clear the timeout to prevent further execution
          clearTimeout(timeoutId);
        }, 500);
        _getAppLocalInfo()
      }, [contactData.tag_id]);


    const getSendInfo={
        amt: contactData.sendAmt,
        tagId: contactData.tag_id,
        note: contactData.send_note,
        userId: userInfo.userData._id,
        acctPin: acctPin,
        account_source: value,
    }

    const sendFundProcess = async() => { 
        if(getSendInfo.amt == '' || getSendInfo.tagId == '' || getSendInfo.amt == null){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Some required information are missing',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                return
            }
            if(getSendInfo.account_source == '' || getSendInfo.account_source == null){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Account source is required',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    return
            }
            //console.log(getSendInfo)
            if(getSendInfo.amt != '' && getSendInfo.tagId != '' && getSendInfo.account_source!= null){
                toggleModal()
            }
         }

         //confirm account pin and process the request
    const processFundSending = async () => {
       if(acctPin == null || acctPin == undefined || acctPin == ''){
            // Toast.show({
            //     type: ALERT_TYPE.DANGER,
            //     title: 'Error',
            //     textBody: 'Please enter account pin',
            //     titleStyle: noticeData[0].errorTitleStyle,
            //     textBodyStyle: noticeData[0].errorMessageStyle,
            //     })
            setMessageError('Please enter account pin')
                return null
            }
        setAmtLoading(true)
        try {
            const res = await client.post('/api/userSending_funding', getSendInfo,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                }
            })
            if(res.data.msg == '200'){
                setNewData([])
                toggleModal()
                setAcctPin('');
                setContactData({
                    tag_id: '',
                    sendAmt: '',
                    send_note: '',
                })
                // Toast.show({
                //     type: ALERT_TYPE.SUCCESS,
                //     title: 'Success',
                //     textBody: 'Transaction was successfully sent',
                //     titleStyle: noticeData[0].errorTitleStyle,
                //     textBodyStyle: noticeData[0].errorMessageStyle,
                //     })
                navigation.navigate('Successful')
            }
            else if(res.data.status == '404'){
               
                Alert.alert(res.data.message)
            }
                else if(res.data.status == '500'){
                    Alert.alert(res.data.message)
                }
            else{
                Alert.alert('Something went wrong! Try again later')
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
        
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.primaryColor2}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{flex:1}}>

            {/* <StatusBar style='light' translucent={true} backgroundColor='transparent' /> */}
            <StatusBar barStyle="light-content" translucent backgroundColor={"transparent"}/>

                    <View style={gs.homeHeaderRow}>
                        <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                            <TouchableOpacity onPress={() =>navigation.goBack()}>
                                <View style={[gs.homeSideMenu, {borderWidth: 0, backgroundColor:colors.colorWhite}]}>
                                    <Ionicons name='close' size={23} color={colors.primaryColor1}/>
                                </View>
                                 </TouchableOpacity>

                            <Text style={styles.profileTitle}>Send Fund</Text>
                            <Text></Text>
                            {/* <TouchableOpacity style={gs.homeSideMenu}>
                                <Feather name='bell' size={20} color={colors.textColor}/>
                                
                            </TouchableOpacity> */}
                        </View>
                        <View style={{marginBottom:30}}></View>
                    </View>
                
                    <View style={{flex:1, backgroundColor:colors.bgColor}}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* <View style={{marginHorizontal:10, marginTop:10}}>
                                <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Buy</Text>
                            </View> */}

                            <View style={{marginHorizontal:20, marginTop:10}}>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                                    It's easier, faster to send fund to members of {appDetails.infoData?.app_name} at zero charges.</Text>
                            </View>
                            
                            <Animatable.View 
                            animation={'fadeInUpBig'}
                            delay={100}
                            useNativeDriver={true}
                            style={styles.formPage}>

                            {/* {amtLoading ? <LoaderIndicator loader={amtLoading}
                            textInfo={'Processing...'} /> : ''} */}
                                    
                                    <View style={{marginHorizontal:20, marginTop:10, marginBottom:20}}>
                                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>
                                            Enter the receiver Tag ID, enter amount you want to send and choose account source.</Text>
                                    </View>
                                    <View style={{
                                        flexDirection:'row', 
                                        marginHorizontal:10,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='perm-identity' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Receiver Tag ID'
                                        style={{flex:1}}
                                        keyboardType="numeric"
                                        maxLength={7}
                                        onChangeText={(val) => handleInputChange("tag_id", val)}
                                        value={contactData.tag_id}/>
                                    </View>

                                    <View style={{marginBottom:newData.length?10:-15, marginHorizontal:10, borderWidth: 1, borderRadius: 10,
                                    borderColor: 'lightgrey', marginTop:20}}>
                                    <Dropdown
                                    style={[styles.dropdown, isFocus && { borderColor: colors.primaryColor1 }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={SendFundOptionData}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus ? 'Account Source' : '...'}
                                    value={value}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setValue(item.value);
                                        setIsFocus(false);
                                    }}
                                    />
                                </View>
                                    
                                    {isGettingID && <DotIndicator color={colors.primaryColor1} size={5} />}
                                    {!newData && <View style={{marginBottom:15}}></View>}
                                    <Text style={{fontFamily:'_semiBold', fontSize:14, textAlign:'right', marginRight:20, marginBottom:10, marginTop:5}}>
                                        {newData? newData: ''}
                                    </Text>
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
                                        placeholder='Amount'
                                        style={{flex:1}}
                                        keyboardType='numeric'
                                        onChangeText={(val) => handleInputChange("sendAmt", val)}
                                        value={contactData.sendAmt}/>
                                    </View>
                                    <View style={styles.textAreaContainer}>
                                        <View style={[styles.action, {marginRight: 10}]}>
                                            <TextInput 
                                            placeholder="Reason/purpose (Optional)"
                                            style={styles.textInput}
                                            autoCapitalize="none"
                                            onChangeText={(val) => handleInputChange("send_note", val)}
                                            multiline={true}
                                            numberOfLines={10}
                                            maxLength={350}
                                            textAlignVertical="top"
                                            value={contactData.send_note}
                                         />
                                        </View>
                                
                                    </View>
                
                                </Animatable.View>
                                
                                {/* <BarIndicator color='#F2688B' size={20} /> */}
                                
                            
                                {/* custom button here */}
                                <Animatable.View
                                    animation={'zoomIn'}
                                    delay={1000}
                                    useNativeDriver={true}
                                    >
                                    <CustomButton 
                                    buttonStyle={styles.signInButton}
                                    viewStyle={{padding:10, alignItems:'center'}}
                                    textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                    textLabel={'Send'}
                                    buttonAction={() => sendFundProcess()}
                                />
                                </Animatable.View>
                                
                               
                                <View style={{marginBottom:20}}></View>
                                <Modal isVisible={isModalVisible}
                                    animationIn={'zoomIn'}
                                    animationInTiming={300}
                                    animationOut={'slideOutDown'}
                                    animationOutTiming={500}
                                    backdropOpacity={0.60}
                                    onBackButtonPress={() =>toggleModal()}
                                    //onBackdropPress={() => toggleModal()}
                                >
                                   <ConfirmAccountPin
                                        title={'Enter Pin'}
                                        btnClose={
                                            <Pressable style={styles.dialogCancelBtn}
                                                onPress={() => toggleModal()}
                                                disabled={amtLoading}>
                                                <Ionicons name='close' size={20} />
                                            </Pressable>
                                                }
                                            amtStyle={{fontFamily: '_semiBold', fontSize:17}}
                                            payDesc={'Sending ' } 
                                            textMoney={getSendInfo.account_source =='1'?<NumberValueFormat value={getSendInfo.amt} />: <NumberDollarValueFormat value={getSendInfo.amt} />}
                                            sendingTo={'To ' + getSendInfo.tagId}
                                            errorMessage={messageError}
                                            errorMessageStyle={{fontFamily:'_regular', fontSize:13, color:colors.redColor, marginHorizontal:10, marginBottom:messageError?-5:2, marginTop:messageError?5:-10, justifyContent:'center', alignSelf:'center'}}
                                            icon={<MaterialCommunityIcons name='shield-key-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                                            placeholder={'Enter account pin'}
                                            keyboardType='numeric'
                                            maxLength={6}
                                            value={acctPin}
                                            onChangeText={text =>setAcctPin(text)}
                                            btnAction={
                                            <View style={{justifyContent:'center', alignItems:'center', marginBottom:8, marginHorizontal:20, marginTop:10}}>
                                            <TouchableOpacity style={[styles.btnStyle, amtLoading? styles.btnStyleDisable:'']} 
                                            onPress={() =>processFundSending()}
                                            disabled={amtLoading}>
                                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}>
                                                {amtLoading? <ActivityIndicator size={20} color={colors.bgColor} />: 'Confirm'}
                                            </Text>
                                       
                                     </TouchableOpacity>
                                    </View>
                                    }/>
                                </Modal>
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
    dropdown: {
        height: 50,
        borderColor: 'gray',
        //borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      placeholderStyle: {
        fontSize: 16,
        color:colors.textSecColor
      },
      selectedTextStyle: {
        fontSize: 16,
      },
      iconStyle: {
        width: 20,
        height: 20,
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
    signInButton: {
        marginHorizontal:20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        marginTop:20,
        backgroundColor: colors.primaryColor1,
        marginBottom:30,
    },
    btnStyle:{
        borderRadius:10, 
        marginHorizontal:20, 
        backgroundColor:colors.primaryColor1, 
        marginTop:15,
        marginBottom:10,
        width:'100%',
        height: 45,
        justifyContent: 'center',
        alignItems:'center',
      },
    btnStyleDisable:{
        borderRadius:10, 
        marginHorizontal:20, 
        backgroundColor:colors.primaryColor1, 
        marginTop:15,
        marginBottom:10,
        opacity: 0.7
      },
    container2: {
        paddingVertical: 24,
      },
    dialogCancelBtn:{
        marginTop: -43, 
        borderRadius:50, 
        backgroundColor:colors.bgColor, 
        height:35, width:35, 
        alignItems:'center', 
        justifyContent:'center' 
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
        marginTop:40,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 1 
        },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        elevation: 1, 
        },

    homeHeaderRow:{
        backgroundColor:'transparent', 
        marginTop:40, 
        marginHorizontal:15
      },
      homeSideMenu:{
        borderRadius: 8, 
        borderWidth: 2, 
        backgroundColor:colors.primaryColor2, 
        width:30, 
        alignItems:'center', 
        justifyContent:'center'
      },
      profileTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
      },

    textSign:{
        fontFamily:'_semiBold',
        fontSize: 17,
        color: colors.textColor
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


})


export default SendFundScreen;
