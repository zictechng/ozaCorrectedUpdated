import React , {useContext, useCallback, useState, useEffect } from 'react';
import {Platform, Dimensions, Pressable, View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather, Entypo } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { gs, colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import IsValidEmail from '../components/checkEmailFormat';
import IsValidPhoneNumber from '../components/checkPhoneFormat';
import HeaderMenu from '../components/headerMenu';
import LoaderIndicator from '../components/loaderIndicator';
import client from '../contextAPI/client';
import { ShowLogoutModal, _AppSystemSettings } from '../components/controls';
import CountryPicker from 'react-native-country-picker-modal';


const { width } = Dimensions.get('window');

const SignupScreen = () =>{
    const navigation = useNavigation();

    const [isChecked, setChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [isButtonDisable, setIsButtonDisable] = useState(false);
    const [appDetails, setAppDetails] = useState({});
    const [appSignupStatus, setAppSignupStatus] = useState(false);
    const [appStatus, setAppStatus] = useState(false);
    const [codeError, setCodeError] = useState(false);

    const {userEmail, setUserEmail} = useContext(AuthContext)

    const [countryCode, setCountryCode] = useState(null); // No default country initially
    const [country, setCountry] = useState(null);
    const [visible, setVisible] = useState(false); // Control modal visibility

    const [dataDetails, setDataDetails] = React.useState({
        full_name: '',
        phone_code: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
        secureTextEntry: true,
        confirm_secureTextEntry: true,
        })
        const handleInputChange = (name, val) => {
            setDataDetails({
              ...dataDetails,
              [name]: val,
            });
          };

          // create function for the toggle button
    const updateSecureTextEntry = (val) => {
        setDataDetails({
            ...dataDetails,
            secureTextEntry: !dataDetails.secureTextEntry
        })
    }
    // create function for the toggle button
    const updateSecureTextConfirmPassword = (val) => {
        setDataDetails({
            ...dataDetails,
            confirm_secureTextEntry: !dataDetails.confirm_secureTextEntry
        })
    }

        // close error modal
        const closeModal = () =>{
            setAppStatus(false);
        }

        const onSelect = (selectedCountry) => {
            setCountryCode(selectedCountry.cca2); // Set the country code (ISO Alpha-2)
            setCountry(selectedCountry);          // Set the country object
            setVisible(false);                    // Close the modal after selecting
          };

    const sendReg = async() =>{
           
        if(country == null || country.length == 0){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Please select your country.',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
            });
            return
        }
        //console.log("country Code: " + country.callingCode, country.name)
            if (dataDetails.full_name.length == 0 || dataDetails.phone.length == 0 || dataDetails.email.length == 0 || dataDetails.password.length == 0 || dataDetails.confirm_password.length == 0) {
            Toast.show({
                 type: ALERT_TYPE.DANGER,
                 title: 'Error',
                 textBody: 'Required fields are missing',
                 textBodyStyle: noticeData[0].errorMessageStyle,
                 titleStyle: noticeData[0].errorTitleStyle,
             })
             return
            }
            // validate email format
            if(!IsValidEmail(dataDetails.email)){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Invalid email',
                    textBody: 'Please enter a valid email format.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                });
                return
            }
            //validate the phone format and length 
            if(!IsValidPhoneNumber(dataDetails.phone)){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Invalid phone number',
                    textBody: 'Please enter a valid phone number format.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                });
                return
            }
            // Remove all non-digit characters
            const cleanedPhoneNumber = dataDetails.phone.replace(/\D/g, '');
            if (cleanedPhoneNumber.length > 12) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Phone number error',
                    textBody: 'Please enter a 12 digits phone number max.',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                });
                return
              } 
    
            if (dataDetails.password !== dataDetails.confirm_password) {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Password do not match',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                });
                return
            }
            if(!isChecked){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Accept terms and conditions',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                });
                return
            }
            if(dataDetails.phone_code == '' && country.callingCode == null){

            setCodeError(true)
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Country phone code is missing',
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    titleStyle: noticeData[0].errorTitleStyle,
                })
            return
            }
            if(appSignupStatus == false){
                setAppStatus(true)
                return
               }
            
            const sendData = {
                display_name: dataDetails.full_name,
                phone:  '+'+country.callingCode + dataDetails.phone,
                email: dataDetails.email,
                password: dataDetails.password,
                user_country: country.name,
                share_code: dataDetails.refer_code,
                confirm_password: dataDetails.confirm_password,
                }
             // update context hook value here
            const updatedCar = dataDetails.email;
            setUserEmail(updatedCar)

            //console.log('Register details:', sendData);
          try {
            setIsLoading(true);
            setIsBtnLoading(true);
            setIsButtonDisable(true);
            const res = await client.post('/api/register', sendData)
           //console.log(res.data.userCode);
            if(res.data.msg == '201'){ 
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title:'Success',
                textBody: 'Registration successful! \n Verify your account',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              })
              AsyncStorage.setItem('userOTP', JSON.stringify(res.data.userCode));
              
              // Navigate to the next screen
              setDataDetails({
                email: '',
                password: '',
                confirm_password: '',
                full_name: '',
                phone_code:'',
                phone: '',
                secureTextEntry: true,
                confirm_secureTextEntry: true,
                });
                setChecked(false)
                setCountry(null)
               //navigate('VerifyOTP');
              navigation.navigate("VerifyOTP", {
                otpCode:res.data.userCode
              })
             }
             
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
                        textBody: 'User phone number already in use',
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
              setIsLoading(false);
              setIsBtnLoading(false);
              setIsButtonDisable(false);
              }


        // //signupUserAction(dataDetails)
        // signupAction(dataDetails)
        // if(nextPage){
        //     navigation.navigate('VerifyOTP')
        // }
        // console.log("Navigation ", nextPage)
    }
    
       // get app information from local storage here
 _getAppLocalInfo = async () =>{

    AsyncStorage.getItem('AppSettingInfo').then(res =>{
        if(res !== null){
            setAppDetails(JSON.parse(res))
        }
        }).catch(err => console.log(err.message))
     }
//console.log("-------", appSignupStatus)

    useEffect(() =>{
        _getAppLocalInfo()
        _AppSystemSettings()

        _AppSystemSettings().then((res) =>{
            //console.log(res.app_new_signup_status)
            setAppSignupStatus(res?.app_new_signup_status)
            })

       }, [])

  return (

    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{flex:1}}>

                <StatusBar style='dark'/>

                <HeaderMenu buttonHome={
                <TouchableOpacity onPress={() =>navigation.navigate('Login')}>
                        <View style={gs.homeSideMenu}>
                        <Ionicons name='arrow-back' size={25} color={colors.textColor}/>
                        </View>
                     </TouchableOpacity>
                    }/>
                <View style={{flex:1, justifyContent:'center', borderRadius:10}} >
                    
                    {/* show loader when processing request */}
                    {isBtnLoading && <LoaderIndicator 
                    loader={isBtnLoading}
                    textInfo={'Processing...'}
                    />}
                    
                    <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:10}}>
                    <View style={[styles.LoginDivTitle, {marginHorizontal:20}]}>
                        <Text style={styles.loginTitle}>Signup <Text></Text></Text>
                        <Text style={styles.loginTitleDesc}>It easy to join {appDetails.infoData?.app_name}, it takes less than five minutes.</Text>
                    
                    </View>
                    <View style={{marginHorizontal:10}}>
                        
                        <View style={{flexDirection:'row',
                            marginBottom:15,
                            borderWidth: 1,  // size/width of the border
                            borderRadius: 7,
                            borderColor: 'lightgrey',  // color of the border
                            paddingLeft: 10,
                            height: 50}}>
                            <Ionicons name='person' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                            <TextInput 
                            placeholder='Full Name'
                            autoCapitalize="sentences"
                            style={{flex:1, paddingVertical:0}}
                            maxLength={20}
                            value={dataDetails.full_name}
                            onChangeText={(val) => handleInputChange("full_name", val)}
                            ></TextInput>
                        </View>
                        
                        <TouchableOpacity onPress={() => setVisible(true)} style={{flexDirection:'row',
                            marginBottom:15,
                            borderWidth: 1,  // size/width of the border
                            borderRadius: 7,
                            borderColor: 'lightgrey',  // color of the border
                            paddingLeft: 10,
                            height: 50}}>
                            {!country && <Ionicons name='flag' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                            
                            <CountryPicker
                                withFlagButton
                                countryCode={countryCode}
                                withFlag
                                withFilter={true}
                                withEmoji
                                placeholder=" " // here
                                withAlphaFilter
                                visible={visible} // Control modal visibility
                                onSelect={onSelect}
                                onClose={() => setVisible(false)}
                            />
                            {!country && 
                            <Text style={{flex:1, paddingLeft:-10, paddingVertical:12, color:'#aaa'}}> Select Country </Text>
                            }

                            <Text style={styles.selectedText}> {country?.name}</Text>
                        </TouchableOpacity>
                            
                        {codeError && <Text style={{fontFamily:'_regular', fontSize:12, color:'red'}}>Enter Phone Code</Text>}
                        <View style={{flexDirection:'row'}}>
                            <View style={{
                                marginBottom:15,
                                borderWidth: 1,  // size/width of the border
                                borderRadius: 7,
                                borderColor: codeError ? 'red': 'lightgrey',  // color of the border
                                paddingLeft: 10,
                                height: 50,
                                marginRight:8}}>
                                {country ? 
                                <Text style={[styles.selectedText, {width:80, color:"#000"}]}> {'+'+country.callingCode}</Text>
                                :
                                <TextInput 
                                placeholder='EX:(+234)'
                                style={{flex:1, paddingVertical:0}}
                                maxLength={5}
                                width={70}
                                value={dataDetails.phone_code}
                                onChangeText={(val) => handleInputChange("phone_code", val)}
                                />}
                            </View>
                            
                            <View style={{flex:1, flexDirection:'row',
                                marginBottom:15,
                                borderWidth: 1,  // size/width of the border
                                borderRadius: 7,
                                borderColor: 'lightgrey',  // color of the border
                                paddingLeft: 10,
                                height: 50}}>
                                <MaterialIcons name='phone' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                                <TextInput 
                                placeholder='Phone Number'
                                style={{flex:1, paddingVertical:0}}
                                maxLength={12}
                                keyboardType='numeric'
                                value={dataDetails.phone}
                                onChangeText={(val) => handleInputChange("phone", val)}
                                />
                             </View>
                        </View>
                        
                        <View style={{flexDirection:'row',
                            marginBottom:15,
                            borderWidth: 1,  // size/width of the border
                            borderRadius: 7,
                            borderColor: 'lightgrey',  // color of the border
                            paddingLeft: 10,
                            height: 50}}>
                            <MaterialIcons name='alternate-email' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                            <TextInput 
                            placeholder='Email ID'
                            style={{flex:1, paddingVertical:0}}
                            keyboardType='email-address'
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={dataDetails.email}
                            onChangeText={(val) => handleInputChange("email", val)}
                            />
                        </View>

                        <View style={{flexDirection:'row',
                            marginBottom:15,
                            borderWidth: 1,  // size/width of the border
                            borderRadius: 7,
                            borderColor: 'lightgrey',  // color of the border
                            paddingLeft: 10,
                            height: 50}}>
                            <MaterialIcons name='code' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                            <TextInput 
                            placeholder='Referral Code (Optional)'
                            style={{flex:1, paddingVertical:0}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={dataDetails.refer_code}
                            onChangeText={(val) => handleInputChange("refer_code", val)}
                            />
                        </View>

                        <View style={{flexDirection:'row',
                            borderWidth: 1, 
                            borderRadius: 7,
                            borderColor: 'lightgrey',
                            paddingLeft: 10,
                            height: 50}}>
                            <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                            <TextInput 
                            placeholder='Password' style={{flex:1, paddingVertical:0}} 
                            secureTextEntry={dataDetails.secureTextEntry ? true : false}
                            value={dataDetails.password}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={(val) => handleInputChange("password", val)} 
                            />
                            <TouchableOpacity onPress={updateSecureTextEntry}>
                                
                                {dataDetails.secureTextEntry ?
                                    <Feather
                                        name="eye-off"
                                        color="#666"
                                        size={20}
                                        style={{marginRight:8, marginTop:15, opacity:0.4}}
                                    />
                                    :
                                    <Feather
                                        name="eye"
                                        color="#666"
                                        size={20}
                                        style={{marginRight:8, marginTop:15, opacity:0.4}}
                                    />
                                }
                                    {/*<Feather name='eye' size={20} color='#666' style={{marginRight:8, marginTop:15, opacity:0.4}} /> */}
                            </TouchableOpacity>
                        </View>
                            {/* <View>
                                <Text><PasswordStrengthMeterBar 
                                password={dataDetails.password} 
                                minLength={5}
                                maxLength={16}/></Text>
                            </View> */}
                        <View style={{flexDirection:'row',
                            borderWidth: 1, 
                            marginTop:15,
                            borderRadius: 7,
                            borderColor: 'lightgrey',
                            paddingLeft: 10,
                            height: 50}}>
                            <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                            <TextInput 
                            placeholder='Confirm Password' style={{flex:1}} 
                            secureTextEntry={dataDetails.confirm_secureTextEntry ? true : false}
                            value={dataDetails.confirm_password}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={(val) => handleInputChange("confirm_password", val)}
                            />
                            <TouchableOpacity onPress={updateSecureTextConfirmPassword}>
                                    {dataDetails.confirm_secureTextEntry ?
                                        <Feather
                                            name="eye-off"
                                            color="#666"
                                            size={20}
                                            style={{marginRight:8, marginTop:15, opacity:0.4}}
                                        />
                                        :
                                        <Feather
                                            name="eye"
                                            color="#666"
                                            size={20}
                                            style={{marginRight:8, marginTop:15, opacity:0.4}}
                                        />
                                    }
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:'row', marginHorizontal:10, paddingTop:10}}>
                            <View style={{marginLeft:-8}}>
                                <Checkbox
                                value={isChecked}
                                onValueChange={setChecked}
                                color={isChecked ? colors.primaryColor2 : undefined}
                                style={styles.checkboxText}
                                //onValueChange={(newValue) => setToggleCheckBox(newValue)}
                                />
                             </View>
                             <View style={{}}>
                                    <Text style={[gs.loginPageForgetPass,]}>By signup, you agreed to the company 
                                    <Text style={[gs.singupPageDesc, {fontSize:13}]} onPress={() =>navigation.navigate('Terms_Conditions')}> Terms and Conditions </Text>
                                     and privacy policy </Text>
                                     
                                </View>
                        </View>

                        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginTop:50, marginBottom:30}}>
                            <TouchableOpacity style={styles.signInButton}
                            onPress={() => sendReg()}>
                                <Text style={styles.textSign}>Signup</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:30}}>
                        <Text style={gs.signupPageDescTitle}>I have an account?</Text>
                            <TouchableOpacity onPressOut={() =>navigation.navigate('Login')}>
                                <View>
                                    <Text style={gs.singupPageDesc}>Login</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <ShowLogoutModal 
                        openModal={appStatus}
                        animationType={'fade'}
                        modalTitle={'Error Occurred'}
                        ModalDesc={'Sorry! Server is currently unavailable, Try again'}
                        closeBtn={() => closeModal(!appStatus)}
                        logoutBtn={() => closeModal(!appStatus)}
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
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderStyle: {
        fontSize: 16,
        color:colors.textSecColor,
        marginRight:5, marginTop:15, opacity:0.4
      },
    checkboxText: {
        margin:0,
        marginRight:5,
        borderRadius:5,
        color:'lightgrey',
      },
      signInButton: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
         backgroundColor: colors.primaryColor1
    },

    textSign:{
        fontFamily:'_semiBold',
        fontSize: 17,
        color: colors.textColor
    },
    bgImage:{
        position: 'absolute',
        width: 130,
        height: 90,
        bottom: -6,
        right: -10,
     },
     loginTitle:{
        fontFamily:'_bold', 
        fontSize:25, 
        color:'#333', 
     },
     loginTitleDesc:{
        fontFamily:'_regular',  
        fontSize:15, 
        color:'#777', 
        marginTop:10
     },
     LoginDivTitle:{
        marginBottom:30, 
        marginTop: 65,
    }
    ,
    selectCountry:{
    flex: 1,
    },
    placeholderContainer: {
      padding: 8,
      borderColor: '#ccc',
      },
    placeholderText: {
      color: '#999',
      fontSize: 16,
      marginBottom: 10,
    },
    selectedText: {
      fontSize: 18,
      color: '#aaa',
      marginTop:8,
      marginBottom: 10,
    },
  });

  export default SignupScreen;
