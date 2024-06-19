import React, { useContext, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Keyboard, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Alert } from 'react-native';
import { gs,colors } from '../styles';
import * as Animatable from 'react-native-animatable'
import { StatusBar } from 'expo-status-bar';
import { Avatar, Badge} from 'react-native-elements';
import { Ionicons, Feather, Entypo,} from '@expo/vector-icons';
import proPassImage from '../assets/images/pass_image.png';
import { AuthContext } from '../contextAPI/authContext';
import LoaderIndicator from '../components/loaderIndicator';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';


const ResetPasswordScreen = ({navigation}) => {
    //source={bgImage} resizeMode='stretch'
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);


    let myId = userInfo.userData._id; // get logged in user ID
    const [requestLoading, setRequestLoading] = useState(false);
    const [errorWarning, setErrorWarning] = useState(false);
    const [errorMessage, setErrorMessage] = useState();


    const [userDetails, setUserDetails] = React.useState({
        new_password: '',
        confirm_password: '',
        secureTextEntry: true,
        confirm_secureTextEntry: true,
        })
        const handleInputChange = (name, val) => {
            setUserDetails({
              ...userDetails,
              [name]: val,
            });
        }

          // create function for the toggle button
    const updateSecureTextEntry = (val) => {
        setUserDetails({
            ...userDetails,
            secureTextEntry: !userDetails.secureTextEntry
        })
    }
    // create function for the toggle button
    const updateSecureTextConfirmPassword = (val) => {
        setUserDetails({
            ...userDetails,
            confirm_secureTextEntry: !userDetails.confirm_secureTextEntry
        })
    }

    // success message alert dialog here
    const successAlert = () =>
        Alert.alert('Successful', 'Password updated successfully!\n Remember to login with your new password', [
            {
                text: 'Reset',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {text: 'OK', onPress: () => navigation.navigate('Home')},
        ]);

    const resetPasswordAction = async() =>{
        setErrorWarning(false);
        const userData = {
            password: userDetails.new_password,
            userEmail: userInfo.userData.email,
            userId: userInfo.userData._id
            }
        if (userDetails.new_password.length == 0 || userDetails.confirm_password.length == 0) {
            
            setErrorWarning(true)
            setErrorMessage('Required fields are missing')
            return
            }
            if (userDetails.new_password !== userDetails.confirm_password) {
               setErrorWarning(true)
                setErrorMessage('Password do not match')
                return
            }
          try {
            setRequestLoading(true)
            const res = await client.post('/api/updateUser_passwordMobile', userData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                }
            })
          if(res.data.msg == '201'){
            setUserDetails({
             new_password: '',
             confirm_password:'',
             secureTextEntry: true,
             confirm_secureTextEntry: true,
             })
             setErrorWarning(false)
             successAlert()
        return
          }
          else if (res.data.status == '401') {
            Alert.alert('Access denied')
           }
          else if (res.data.status == '500') {
            Alert.alert('occurred while processing! Please try again later')
          }
          else {
           Alert.alert('Sorry, Something went wrong! Try again')
            }
        } catch (error) {
            console.log('Server error occurred ', error.message)
            if(error.message == 'Network Error'){
             
            Alert.alert(error.message +' occurred')
              return
              } 
            if(error.status == '500'){
                Alert.alert('Server error ' +error.message,)
                return
                } 
        }
        finally{
            setRequestLoading(false)
        }
    }


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{flex:1}}>

        <StatusBar style='light' />

                <View style={[gs.homeHeaderRow,]}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity
                        onPress={() => navigation.goBack()}>
                     <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close' size={23} color={colors.textColor}/>
                     </View>
                     </TouchableOpacity>

                        <Text style={styles.profileTitle}>Password Reset</Text>
                        <Text></Text>
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                 </View>
                        {/* show loader when processing request */}
                    {requestLoading && <LoaderIndicator 
                    loader={requestLoading}
                    textInfo={'Updating...'}
                    />}
            <View style={{backgroundColor:colors.bgColor, flex:1,}}>
                
                <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:20}}>
                    
                    <View style={{marginTop:20}}>
                        <Text style={{fontFamily:'_semiBold', fontSize:32, color:'#353535'}}>Reset Password?</Text>
                        <Text style={styles.loginTitleDesc}>
                            Don't worry, you can easily reset your account password.</Text>
                    </View>
                    <View style={{justifyContent:'center', alignItems:'center', marginBottom:35}}>
                        <ImageBackground source={proPassImage} resizeMode='cover' style={{width:150, height:90, opacity:.70, marginTop:10}}>
                        </ImageBackground>
                    </View>

                    <View style={{flexDirection:'row',
                        marginBottom:20,
                        borderWidth: 1, 
                        borderRadius: 7,
                        borderColor: 'lightgrey',
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='New Password' style={{flex:1, paddingVertical:0}} 
                        secureTextEntry={userDetails.secureTextEntry ? true : false}
                        autoCorrect={false}
                        value={userDetails.new_password}
                        onChangeText={(val) => handleInputChange("new_password", val)}
                        onEndEditing={(e) =>handleInputChange(e.nativeEvent.text)}
                        />
                        <TouchableOpacity onPress={updateSecureTextEntry}>
                                
                                {userDetails.secureTextEntry ?
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

                    <View style={{flexDirection:'row',
                        marginBottom:35,
                        borderWidth: 1, 
                        borderRadius: 7,
                        borderColor: 'lightgrey',
                        paddingLeft: 10,
                        height: 50}}>
                        <Ionicons name='lock-closed-outline' size={20} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />
                        <TextInput 
                        placeholder='Confirm New Password' style={{flex:1, }} 
                        confirm_secureTextEntry={userDetails.confirm_secureTextEntry ? true : false}
                        autoCorrect={false}
                        value={userDetails.confirm_password}
                        onChangeText={(val) => handleInputChange("confirm_password", val)}
                         />
                        <TouchableOpacity onPress={updateSecureTextConfirmPassword}>
                                
                                {userDetails.confirm_secureTextEntry ?
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
                        
                            {errorWarning? 
                            <Animatable.View animation="fadeInLeft" duration={1000} style={{backgroundColor:colors.lightRed, marginHorizontal: 20, height: 40, borderRadius: 5, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                                <Ionicons name='warning' size={25} color={colors.redColor}></Ionicons>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor, marginTop:10, textAlign:'justify', marginTop: -1}}> {errorMessage} </Text>
                            </Animatable.View> : null }
                            
                </ScrollView>
                
                
                <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:8, marginHorizontal:10, marginTop:10}}>
                        <TouchableOpacity style={styles.signInButton}
                        onPress={() =>resetPasswordAction()}>
                            <Text style={styles.textSign}>Reset</Text>
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
        color:'#353535',
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
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
    loginTitleDesc:{
        fontFamily:'_regular',  
        fontSize:15, 
        color:'#333', 
       },

})


export default ResetPasswordScreen;
