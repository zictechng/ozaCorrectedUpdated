import React, { useContext, useState, useEffect } from 'react';
import { flexGrow, StatusBar, View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, Modal,Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, Ionicons, AntDesign, Fontisto} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gs,colors } from '../styles';
//import { StatusBar } from 'expo-status-bar';
import { Dropdown } from 'react-native-element-dropdown';
import { getToday, getFormatedDate } from 'react-native-modern-datepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomButton from '../components/customButton';
import { AuthContext } from '../contextAPI/authContext';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';
import LoaderIndicator from '../components/loaderIndicator';
import { GenderData } from '../model/data';
import IsValidEmail from '../components/checkEmailFormat';


const CompleteSignupScreen = ({navigation}) => {
    const isFocused = useIsFocused();
    const {userInfo, setUserInfo, userToken} = useContext(AuthContext)
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    // date implementation
    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()) +1, 'DD/MM/YYYY')

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    
    const showDatePicker = () => {
      setDatePickerVisibility(true);
    };
  
    const hideDatePicker = () => {
      setDatePickerVisibility(false);
    };
 
    useEffect(() => {
        
        if(isFocused){
       // console.log("navigation changed ", userInfo?.userData )
        if(userInfo?.userData.reg_stage2 =="Yes"){
            navigation.navigate('Home');
            //console.log("navigation Stage ", userInfo?.userData.reg_stage2 )
                }
            }
         
         }, [isFocused]);
    
    const handleConfirm = (date) => {
      //console.log("A date has been picked: ", getFormatedDate(date, 'DD/MM/YYYY') );
      setSelectedDate(getFormatedDate(date, 'DD/MM/YYYY'))
      hideDatePicker();
    };

    const [dataDetails, setDataDetails] = useState({
        sex: '',
        dob: '',
        state: '',
        country: '',
        address: '',
        bank_name: '',
        acct_name: '',
        acct_number: '',
        paypal_address:'',
        payoneer_address:'',
        btc_address:'',
        })
        const handleInputChange = (name, val) => {
            setDataDetails({
              ...dataDetails,
              [name]: val,
            });
          };

    const submitRegistration = async ()=>{
        const registrationDetails ={
            sex: value,
            dob: selectedDate,
            state: dataDetails.state,
            //country: dataDetails.country,
            address: dataDetails.address,
            bank_name: dataDetails.bank_name,
            acct_name: dataDetails.acct_name,
            acct_number: dataDetails.acct_number,
            userId: userInfo.userData._id,
            btc_address: dataDetails.btc_address,
            payoneer_address: dataDetails.payoneer_address,
            paypal_address: dataDetails.paypal_address
        }
        //console.log('selected data ', registrationDetails)

        if (registrationDetails.sex == 0 || registrationDetails.dob == 0 || registrationDetails.state == 0 || registrationDetails.address == 0 || 
            registrationDetails.bank_name == 0 || registrationDetails.acct_name == 0 || registrationDetails.acct_number == 0) {
            Toast.show({
                 type: ALERT_TYPE.DANGER,
                 title: 'Error',
                 textBody: 'Required fields are missing',
                 textBodyStyle: noticeData[0].errorMessageStyle,
                 titleStyle: noticeData[0].errorTitleStyle,
             })
             return
            }
            if (registrationDetails.acct_number.length < 8) {
                Toast.show({
                     type: ALERT_TYPE.DANGER,
                     title: 'Error',
                     textBody: 'Account number should be 8 digits minimum',
                     textBodyStyle: noticeData[0].errorMessageStyle,
                     titleStyle: noticeData[0].errorTitleStyle,
                 })
                 return
                }
                // validate paypal address email format
                if(!IsValidEmail(registrationDetails.paypal_address)){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Invalid parameters',
                        textBody: 'Paypal address should be a valid email format.',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                    });
                    return
                }
                // validate payoneer address email format
                    if(!IsValidEmail(registrationDetails.payoneer_address)){
                        Toast.show({
                            type: ALERT_TYPE.DANGER,
                            title: 'Invalid parameters',
                            textBody: 'Payoneer address should be a valid email format.',
                            titleStyle: noticeData[0].errorTitleStyle,
                            textBodyStyle: noticeData[0].errorMessageStyle,
                        });
                        return
                    }
            try {
                setIsBtnLoading(true)
                const res = await client.post('/api/complete_registration', registrationDetails,{
                    headers: {
                    'Authorization': 'Bearer '+userToken,
                        }
                    })
                if(res.data.msg == '201'){ 
                    Toast.show({
                      type: ALERT_TYPE.SUCCESS,
                      title:'Success',
                      textBody: 'Details updated successfully',
                      titleStyle: noticeData[0].errorTitleStyle,
                      textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    let userInfoReturn = res.data;
                    
                    AsyncStorage.setItem('userInfo', JSON.stringify(userInfoReturn));
                    // clear the form
                    let userInfo = await AsyncStorage.getItem('userInfo');
                    userInfo = JSON.parse(userInfo)
                    setUserInfo(userInfo)

                    setDataDetails({
                        sex: null,
                        dob: null,
                        state: '',
                        country: '',
                        address: '',
                        bank_name: '',
                        acct_name: '',
                        acct_number: '',
                    })
                    FetchLocalStorage()
                    // redirect to next page
                   
                    navigation.navigate('UploadProfile_image')
                }
                // move to the next page

                else if(res.data.status == '401') {
                    Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Failed',
                    textBody: 'No user record found',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
                else if(res.data.status == '404'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Failed',
                    textBody: 'All fields required.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
                else if(res.data.status == '402'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Failed',
                        textBody: 'Account not active',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                } 
                else if(res.data.status == '400'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Username or password missing',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                }
                else if(res.data.status == '409'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'User email already in use',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                }
                else if(res.data.status == '403'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'User phone already in use',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                    } 
                else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Sorry, Something went wrong.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                } 
                
            } catch (error) {
                console.log(error.message)
                if(error.message == 'Network Error'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: error.message +' occurred',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                        })
                        return
                    } 
            }
            finally {
                setIsBtnLoading(false);
                //setIsButtonDisable(false);
                }
        }

  // Get user details from local storage after every request/operation into the database
  const FetchLocalStorage = async()=>{
    setIsBtnLoading(true)
    try {
      let userInfoDetails = await AsyncStorage.getItem('userInfo');
            userInfoDetails = JSON.parse(userInfoDetails)
        if(userInfoDetails){
          setUserInfo(userInfoDetails);
         //console.log('User Details fetch local storage ', userInfoDetails)
        }
       
    } catch (error) {
      console.log(`Fetch local storage error ${error}`);
      
    }
    finally{
        setIsBtnLoading(false);
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
                        <Text></Text>
                        <TouchableOpacity onPress={() =>navigation.navigate('SignupSteps')}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close-outline' size={25} color={colors.textColor}/>
                            </View>
                            </TouchableOpacity>

                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                        
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                        {/* show loader when processing request */}
                            {isBtnLoading && <LoaderIndicator 
                            loader={isBtnLoading}
                            textInfo={'Processing...'}
                            />}
                    <View style={{flex:1, backgroundColor:colors.bgColor}}>
                        <ScrollView contentContainerStyle={{flexGrow:1}} showsVerticalScrollIndicator={false}>
                            <View style={{marginHorizontal:10, marginTop:10}}>
                                <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Complete Registration</Text>
                            </View>

                            <View style={{marginHorizontal:15, marginTop:10}}>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>Highly recommended you complete your registration process to lift restriction in your account and to enjoy the amazing offer we have for you.</Text>
                            </View>

                            <View style={{marginHorizontal:15, marginTop:10}}>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor}}>{'*'} Ensure to entered correct details only</Text>
                            </View>
                    
                            <Animatable.View 
                            animation={'fadeInUpBig'}
                            delay={400}
                            useNativeDriver={true}
                            style={styles.formPage}>
                                <View style={{marginHorizontal:10, marginTop: 20, marginBottom:10}}>
                                    <View style={{ 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        
                                    <Dropdown
                                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={GenderData}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={'Sex'}
                                    value={value}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setValue(item.value);
                                        setIsFocus(false);
                                    }}
                                    renderLeftIcon={() => (
                                        <Ionicons
                                        style={styles.icon}
                                        color={colors.textSecColor}
                                        name="person"
                                        
                                        size={20}
                                        />
                                    )}
                                    />
                                    </View>
                                    
                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <AntDesign name='calendar' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} onPress={() =>showDatePicker()} />
                                        <TouchableOpacity onPress={() =>showDatePicker()}>
                                            <Text style={{flex:1, marginRight:5, marginTop:15, color:colors.textSecColor}}
                                            maxLength={20}>
                                            {selectedDate ? selectedDate : 'Date of Birth'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='location-city' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='State/City'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={50}
                                        autoCorrect={false}
                                        value={dataDetails.state}
                                        onChangeText={(val) => handleInputChange("state", val)}
                                        />
                                    </View>

                                    {/* <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='flag' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Country'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={50}
                                        autoCorrect={false}
                                        value={dataDetails.country}
                                        onChangeText={(val) => handleInputChange("country", val)}
                                        />
                                    </View> */}

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='location-on' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Current Home Address'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={200}
                                        autoCorrect={false}
                                        value={dataDetails.address}
                                        onChangeText={(val) => handleInputChange("address", val)}
                                        />
                                    </View>
                                    
                                    <View style={{marginHorizontal:15, marginTop:10, marginBottom:10}}>
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.textSecColor}}>Bank Information</Text>
                                    </View>
                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='switch-account' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Account Name'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={150}
                                        autoCorrect={false}
                                        value={dataDetails.acct_name}
                                        onChangeText={(val) => handleInputChange("acct_name", val)}
                                        />
                                    </View>

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='confirmation-number' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Account Number'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={10}
                                        keyboardType='numeric'
                                        autoCorrect={false}
                                        value={dataDetails.acct_number}
                                        onChangeText={(val) => handleInputChange("acct_number", val)}
                                        />
                                    </View>

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <MaterialIcons name='account-balance' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Bank Name'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={100}
                                        autoCorrect={false}
                                        value={dataDetails.bank_name}
                                        onChangeText={(val) => handleInputChange("bank_name", val)}
                                        />
                                    </View>

                                    <View style={{marginHorizontal:15, marginTop:10, marginBottom:10}}>
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, color:colors.textSecColor}}>Wallet Address</Text>
                                    </View>
                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <Fontisto name='wallet' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Paypal Address'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={100}
                                        autoCorrect={false}
                                        value={dataDetails.paypal_address}
                                        onChangeText={(val) => handleInputChange("paypal_address", val)}
                                        />
                                    </View>

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <Fontisto name='wallet' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Payoneer Address'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={100}
                                        autoCorrect={false}
                                        value={dataDetails.payoneer_address}
                                        onChangeText={(val) => handleInputChange("payoneer_address", val)}
                                        />
                                    </View>

                                    <View style={{flexDirection:'row', 
                                        marginBottom:15,
                                        borderWidth: 1,  // size/width of the border
                                        borderRadius: 7,
                                        borderColor: 'lightgrey',  // color of the border
                                        paddingLeft: 10,
                                        height: 50}}>
                                        <Fontisto name='wallet' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                        <TextInput 
                                        placeholder='Bitcoin Address'
                                        style={{flex:1, paddingVertical:0}}
                                        maxLength={100}
                                        autoCorrect={false}
                                        value={dataDetails.btc_address}
                                        onChangeText={(val) => handleInputChange("btc_address", val)}
                                        />
                                    </View>
                                </View>
                            </Animatable.View>

                            {/* Date Modal alert here */}
                                {/* <Modal
                                transparent={true}
                                animationType="slide"
                                useNativeDriver={true}
                                visible={open}>

                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                    
                                    <DatePicker 
                                        mode='calendar'
                                        //minimumDate={startDate}
                                        minimumDate="1975-01-01 00:00:00"
                                        maximumDate={startDate}
                                        selected={date}
                                        onDateChange={handleChange}
                                        options={{
                                        textHeaderColor: colors.primaryColor2,
                                        textDefaultColor: colors.textBlack,
                                        selectedTextColor: '#fff',
                                        mainColor: colors.primaryColor2,
                                        textSecondaryColor: colors.primaryColor1,
                                        //borderColor: 'rgba(122, 146, 165, 0.1)',
                                        }}
                                        
                                    />

                                    <TouchableOpacity style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor, marginBottom:30}}
                                        onPress={handleOnPress}>
                                        {datePick ? <Text style={{fontFamily:'_semiBold', color:colors.primaryColor1, fontSize: 15}}>Confirm</Text>: 
                                        <Text style={{fontFamily:'_semiBold', color:'#aaa', fontSize: 15}}>Close</Text> }
                                    </TouchableOpacity>
                                    </View>
                                </View>
                                
                            </Modal> */}
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                maximumDate={new Date()}
                                minimumDate={new Date(1970, 0, 1)}
                                onConfirm={handleConfirm}
                                onCancel={hideDatePicker}
                            />

                            {/* custom button here */}
                            <Animatable.View
                                animation={'zoomIn'}
                                delay={1200}
                                useNativeDriver={true}>
                                <CustomButton 
                                buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:20}}
                                viewStyle={{padding:10, alignItems:'center'}}
                                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                textLabel={'Submit'}
                                buttonAction={() => submitRegistration()}
                                disabled={isBtnLoading}
                            />
                             <View style={{justifyContent:'center', alignItems:'center', margin:20}}>
                                    <TouchableOpacity style={{marginTop:5}} onPress={() =>navigation.navigate('Home')}
                                    disabled={isBtnLoading}>
                                    <Text style={[gs.loginPageDesc,{color:colors.textBlack}]}>Maybe Later</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animatable.View>
                                                   
                        </ScrollView>
                    </View>
            
        </SafeAreaView>
        </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centeredView:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
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
        elevation: 0.9, 
        },
      modalView:{
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset:{
          width: 0,
          height: 2,
        },
        shadowOpacity:0.25,
        shadowRadius: 4,
        elevation:3,
      },
    settingTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
      },
      accountVerify:{
        position: "absolute", 
        top: 30, 
        right: +20, 
        marginRight: 10, 
        color:colors.greenColor,
    },

    dropdown: {
        height: 50,
        borderColor: 'gray',
        //borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
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

});

export default CompleteSignupScreen;
