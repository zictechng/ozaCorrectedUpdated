import React , {useContext, useCallback, useState, useEffect } from 'react';
import { Platform,Dimensions, View, Text, TextInput, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import Checkbox from 'expo-checkbox';
import { gs, colors } from '../styles';
import { AuthContext } from '../contextAPI/authContext';
import { ActivityIndicator } from 'react-native';
import { Error401, noticeData } from '../components/errorNotice';
//import { StatusBar } from 'expo-status-bar';
import IsValidEmail from '../components/checkEmailFormat';
import { Pressable } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { _AppSystemSettings } from '../components/controls';

const { width } = Dimensions.get('window');

const LoginScreen = ({navigation}) =>{
    const isFocused = useIsFocused();

    const {loginAction, isBtnLoading, isButtonDisable} = useContext(AuthContext)
    
    const [email, setEmail] = useState(null);
    const[password, setPassword] = useState(null);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    
    const [isChecked, setChecked] = useState(false);
    const [checkLoginState, setCheckLoginState] = useState(false);
    const [appDetails, setAppDetails] = useState({});
    //const[btnLoading, setBtnLoading] = useState(false);
    const appLogoLocal = require("../assets/images/sec3.png");
    const appBgLocal = require("../assets/images/sec7b.png");
   
    // create function for the toggle button
    const updateSecureTextEntry = () => {
        if(secureTextEntry){
            setSecureTextEntry(false);
        }
        else{
            setSecureTextEntry(true);
        }
    }
    
    const UserLogin = () =>{
        const arrPassword = password;
        const arrEmail = email;
        //console.log('The length is', arrPassword);
        // Check if input is valid
        if (arrPassword == 0 || arrPassword == null || arrEmail == 0 || arrEmail == null) {
            //Alert.alert("Please enter")
            Toast.show({
                 type: ALERT_TYPE.DANGER,
                 title: 'Error',
                 textBody: 'Required fields are missing',
                 textBodyStyle: noticeData[0].errorMessageStyle,
                 titleStyle: noticeData[0].errorTitleStyle,
             })
              return
            }
        if(!IsValidEmail(arrEmail)){
            Toast.show({
                 type: ALERT_TYPE.DANGER,
                 title: 'Error',
                 textBody: 'Enter your email address format correctly',
                 textBodyStyle: noticeData[0].errorMessageStyle,
                 titleStyle: noticeData[0].errorTitleStyle,
             })
             return
        }
        //console.log("User login ", arrEmail, arrPassword)
        
        loginAction(email, password)
    }

    // get app information from local storage here
    const _getAppLocalInfo = async () =>{

    AsyncStorage.getItem('AppSettingInfo').then(res =>{
        if(res !== null){
            setAppDetails(JSON.parse(res))
        }
        }).catch(err => console.log(err.message))
     }
    
     // get app system settings here
     _AppSystemSettings().then((res) => {
        // yes user can not login
        if(res?.app_stop_login_status == false){
        setCheckLoginState(true)
        }
        
        // user can login
        else if(res?.app_stop_login_status == true){
            setCheckLoginState(false)
        }
        })

     useEffect(() =>{
     _getAppLocalInfo()
     _AppSystemSettings()
   
    }, [])

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
        
            <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:20}}>

                <View style={{alignItems:'center'}}></View>

              <View style={styles.LoginDivTitle}>
                <Text style={styles.loginTitle}> Login</Text>
                <Text style={styles.loginTitleDesc}> To your {appDetails.infoData?.app_name} account and explore</Text>
              </View>
                
                <View style={{marginHorizontal:10}}>
                    
                    <View style={{flexDirection:'row',
                        marginBottom:25,
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
                        value={email?.toLowerCase()}
                        onChangeText={text =>setEmail(text)}
              />
                    </View>

                    <View style={{flexDirection:'row',
                        marginBottom:25,
                        borderWidth: 1, 
                        borderRadius: 7,
                        borderColor: 'lightgrey',
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='Password' style={{flex:1, paddingVertical:0}} 
                        secureTextEntry={secureTextEntry ? true : false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={password}
                        onChangeText={text =>setPassword(text)} 
                        />
                        <TouchableOpacity onPress={updateSecureTextEntry}>
                                {secureTextEntry ?
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

                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row'}}>
                            <Checkbox
                            value={isChecked}
                            onValueChange={setChecked}
                            color={isChecked ? colors.primaryColor2 : undefined}
                            style={styles.checkboxText}
                            //onValueChange={(newValue) => setToggleCheckBox(newValue)}
                             />
                            <Text style={gs.loginPageForgetPass}>Stay Sign-In</Text>
                        </View>
                        
                        <Pressable onPress={() => navigation.navigate('ForgetPassword')}><Text style={gs.loginPageForgetPass}>Forget Password?</Text></Pressable>
                    </View>

                    <View style={{flex:1, justifyContent:'center', alignItems:'center', marginTop:70}}>
                        <TouchableOpacity style={[styles.signInButton, isButtonDisable ||checkLoginState? styles.signInButtonDisable: '']}
                        onPress={() => UserLogin()}
                        disabled={isButtonDisable || checkLoginState}>
                            <Text style={styles.textSign}>{isBtnLoading? ' ' : "Login"}{isBtnLoading && <ActivityIndicator color={colors.textColor} size={25} />}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
            </ScrollView>
            <View source={appBgLocal} resizeMode='cover' style={{flex:1,opacity:0.9}}>
                <View style={{justifyContent:'center', alignItems:'center', margin:20}}>
                <Text style={gs.loginPageDescTitle}>Don't have an account?</Text>
                <TouchableOpacity style={{marginTop:5}}
                onPress={() =>navigation.navigate('Register')}>
                <Text style={gs.loginPageDesc}>Signup</Text>
                </TouchableOpacity>
                </View>
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
    signInButtonDisable: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: colors.primaryColor1,
        opacity: 0.7
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
        color:'#333', 
        marginTop:10
     },
     LoginDivTitle:{
        marginBottom:30, 
        marginTop: 100,
    }
    
  });

  export default LoginScreen;
