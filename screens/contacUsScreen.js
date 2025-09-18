import React, { useContext, useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
 } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import {Entypo, Ionicons} from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/customButton';
import { ContactOptionData } from '../model/data';
import { AuthContext } from '../contextAPI/authContext';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';
import LoaderIndicator from '../components/loaderIndicator';
import { isLetters } from '../components/controls';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ContactUsScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {userToken, userInfo, setUserInfo} = useContext(AuthContext)

    const DismissKeyboard = ({ children }) => (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
          {children}
        </TouchableWithoutFeedback>
      );
   
    const [isFocus, setIsFocus] = useState(false);
    const [value, setValue] = useState(null);
    const [messageLoading, setMessageLoading] = useState(false);
    
    const [checkStatus, setCheckStatus] = useState(true);
    
    const [contactData, setContactData] = React.useState({
        reportMessage: '',
        check_subjectInputChange: false,
        check_messageInputChange: false,
    });

    
      const goBack =() =>{
          navigation.navigate('Home');
          Dialog.hide();
      }
      

    // function for message input field
    const textInputChangeMessage = (val) => {
        if(val.trim().length >= 20){
            setContactData({
                ...contactData,
                reportMessage: val,
                check_messageInputChange: false,
              });
             
        }else {
            setContactData({
                ...contactData,
                reportMessage: val,
                check_messageInputChange: true,
             });
             
        }
    }

    // get the formation needed to send to backend server
        const getMessageData={
          subject: value,
          email: userInfo.userData.email,
          ticket_message: contactData.reportMessage,
          createdBy: userInfo.userData._id,
          ticket_type: 'Contact',
        }

      // send message
      const sendMessage = async () => {
              if(!value || !contactData.reportMessage)
                {
                  Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'All fields are required',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                return
                }
                if(contactData.reportMessage.trim().length < 20)
                {
                  Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Message should contain at least 20 characters long',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                return
                }
                if(isLetters(contactData.reportMessage)){
                  Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Content contain some forbidding characters',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                return
                }
          try {
            setMessageLoading(true)
            const res = await client.post('/api/submit_ticketMobile', getMessageData,{
              headers: {
              'Authorization': 'Bearer '+userToken,
            }
        })
          console.log("error, ", res.data);
            if(res.data.msg == '200'){
              
              setContactData({
               reportMessage: '',
               check_messageInputChange:false,
             })
             setValue(null)
             setCheckStatus(false);
             
             Dialog.show({
              type: ALERT_TYPE.SUCCESS,
              title: 'Successful',
              textBody: 'Message sent successfully!\n We will get in-touched shortly',
              button: 'Okay',
              textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
              titleStyle: { fontFamily: '_bold', fontSize: 20 },
              onPressButton:(() => void goBack()),
              })
            }
            else if (res.data.status == '401') {
              Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Failed',
                textBody: 'Authentication required',
                textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                titleStyle: { fontFamily: '_bold', fontSize: 20 },
              })
             }
             else if (res.data.status == '402') {
              Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: res.data.message,
                textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                titleStyle: { fontFamily: '_bold', fontSize: 20 },
              })
              AsyncStorage.removeItem('userToken');
              
             }
            else if (res.data.status == '500') {
              Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  textBody: 'Error occurred while processing! Please try again later',
                  textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
                  titleStyle: { fontFamily: '_bold', fontSize: 20 },
              })
            }
            else {
              Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  titleStyle: { fontFamily: '_bold', fontSize: 20 },
                  textBody: 'Sorry, Something went wrong',
                  textBodyStyle: { fontFamily: '_regular', fontSize: 16 },
      
                 })
              }
          
          } catch (error) {
            console.log('Server error occurred ', error.message)
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
            setMessageLoading(false);
            }
      }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1, backgroundColor:colors.bgColor}}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
            <View style={{flex:1, backgroundColor:colors.primaryColor2}}>
            <SafeAreaView style={{flex:1}}>

                    {
                     isFocused &&
                        <StatusBar
                        style='light'/>
                    }
            
                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity 
                        onPress={() =>navigation.navigate('Home')}>
                          <View style={[gs.homeSideMenu, {borderWidth: 0}, {backgroundColor:colors.primaryColor2}]}>
                          <Ionicons name='arrow-back' size={23} color={colors.textColor}/>
                        </View>
                            </TouchableOpacity>

                        <Text style={styles.profileTitle}>Contact Us</Text>
                        <Text></Text>
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                 </View>
                         {/* show loader when processing request */}
                    {messageLoading && <LoaderIndicator 
                            loader={messageLoading}
                            textInfo={'Processing...'}
                            />}
            <View style={{backgroundColor:colors.bgColor, flex:2}}>
                {/* <View style={{justifyContent:'center', alignItems:'center', marginHorizontal:10}}>
                    <Image source={bgImage} resizeMode='cover' style={{width:350, height:150, opacity:.70}} />
                </View> */}
                
                <View style={{marginHorizontal:10, marginTop:20, marginBottom:8}}>
                    <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textBlack, textAlign:'center', marginBottom:20}}>
                        How may we help you today?</Text>
                        <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>
                        You can write us and we will response to your request/complaint swiftly.</Text>
                </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <View>
                          <Animatable.View style={[styles.formPage, {marginTop:30}]}
                              animation={'fadeInUpBig'}
                              delay={200}
                              useNativeDriver={true}>
                                <View style={{marginBottom:20, marginHorizontal:10, borderWidth: 1, borderRadius: 10,
                                    borderColor: 'lightgrey', marginTop:20}}>
                                    <Dropdown
                                    style={[styles.dropdown, isFocus && { borderColor: colors.primaryColor1 }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    iconStyle={styles.iconStyle}
                                    data={ContactOptionData}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocus ? 'Select Subject' : '...'}
                                    value={value}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    onChange={item => {
                                        setValue(item.value);
                                        setIsFocus(false);
                                    }}
                                    />
                                </View>

                                <View style={styles.textAreaContainer}>
                        
                                    <View style={[styles.action, {marginRight: 10}]}>
                                        <TextInput 
                                        placeholder="Enter Message [350 Max characters]"
                                        style={styles.textInput}
                                        autoCapitalize="none"
                                        onChangeText={(val) => textInputChangeMessage(val)}
                                        multiline={true}
                                        numberOfLines={10}
                                        maxLength={350}
                                        textAlignVertical="top"
                                        value={contactData.reportMessage}
                                        onEndEditing={(e) =>textInputChangeMessage(e.nativeEvent.text)}
                                        />
                                    </View>
                            
                                </View>
                          {/* How error message here if message field is empty */}
                          { contactData.check_messageInputChange && checkStatus ?
                          <Animatable.View animation="fadeInLeft" duration={500}>
                            <Text style={styles.errorMsg}>Message should contain at least 20 characters long </Text>
                          </Animatable.View> : null
                          }
                    
                      </Animatable.View>
                          {/* custom button here */}
                          <Animatable.View
                            animation={'zoomIn'}
                            delay={1000}
                            useNativeDriver={true}
                          >
                              <CustomButton 
                                    buttonStyle={[styles.btnStyle, messageLoading? styles.btnStyleDisable:'']}
                                    viewStyle={{padding:10, alignItems:'center'}}
                                    textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                    textLabel={'Submit'}
                                    buttonAction={() => sendMessage()}
                                    disabled={messageLoading}
                                />
                          </Animatable.View>
                           
                        </View>
                
                    </ScrollView>
            </View>  
            
        </SafeAreaView>
     </View>
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

    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnStyle:{
      borderRadius:10, 
      marginHorizontal:20, 
      backgroundColor:colors.primaryColor1, 
      marginTop:60
    },
    btnStyleDisable:{
      borderRadius:10, 
      marginHorizontal:20, 
      backgroundColor:colors.primaryColor1, 
      marginTop:60,
      opacity: 0.7
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        //borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
      },
      errorMsg: {
        color: '#FF0000',
        fontSize: 14,
        fontFamily: '_regular',
        paddingHorizontal: 10,
        marginBottom: 10,
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

      bgReferral:{
        position: 'absolute',
        resizeMode:'cover',
        bottom: 0,
        right: -8,
        borderRadius:8, 
        opacity:0.30,
        width:250, 
        height:90, 
       },

       textAreaContainer: {
        borderColor: '#aaa',
        borderWidth: 0.5,
        borderRadius:10,
        marginHorizontal:10,
        marginBottom:20
      },
      textArea: {
        height: 150,
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


export default ContactUsScreen;
