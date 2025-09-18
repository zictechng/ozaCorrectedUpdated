import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Alert, Button, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { File } from 'expo-file-system';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/customButton';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import LoaderIndicator from '../components/loaderIndicator';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocumentName } from '../model/data';
import {CLOUDINARY_ACCOUNT_NAME, CLOUDINARY_PRESET_NAME} from '@env'

const UploadDocumentScreen = ({navigation}) => {
      const isFocused = useIsFocused();
      const MAX_FILE_SIZE_MB = 5;
      const {userInfo, setUserInfo, userToken} = useContext(AuthContext)

      const [value, setValue] = useState(null);
      const [isFocus, setIsFocus] = useState(false);

      const [image, setImage] = useState(null);
      const [loading, setLoading] = useState(false);
      const [loading2, setLoading2] = useState(false);
      const [imageValue, setImageValue] = useState('');
      let myId = userInfo.userData._id; // get logged in user ID

      useEffect(() => {
        if(isFocused){
       // console.log("navigation changed ", userInfo?.userData )
        if(userInfo?.userData.reg_stage4 =="Yes"){
            navigation.navigate('Home');
            //console.log("navigation Stage ", userInfo?.userData.reg_stage2 )
          }
          // if(userInfo?.userData.reg_stage2 !="Yes"){
          //     navigation.navigate('CompleteSignup');
          //   }
          // else if(userInfo?.userData.reg_stage3 !="Yes"){
          //   navigation.navigate('UploadProfile_image');
          // }
          
        }
         
         }, [isFocused]);
      //console.log('Selected value: ' + value )

       // delete method here
       const deleteImageId = async(data) =>{
        const sendData = {
          'userId': myId,
          'delete_url': data
        }
          try {
              const res = await client.post('/api/deleteUploaded_image', sendData,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
              }
          })
          if(res.data.msg == '201'){
             let userInfo = await AsyncStorage.getItem('userInfo');
             userInfo = JSON.parse(userInfo)
            setUserInfo(userInfo)
           }
          else if(res.data.status == '401'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Failed',
              textBody: res.data.message,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return
          }
          else if(res.data.status == '402'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: 'You need to login and try again.',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return
          }
          else if(res.data.status == '500'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: res.data.message,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return
          }
        } catch (error) {
          console.log(error.message)
        }
      }

      const renderLabel = () => {
        if (value || isFocus) {
          return (
            <Text style={[styles.label, isFocus && { color: colors.primaryColor1 }]}>
             
            </Text>
          );
        }
        return null;
      };

      const checkPermissions = async () => {
              // First request permission (may show prompt if undetermined)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          
            if (status === 'granted') {
              return true;
            }
          
            if (status === 'denied') {
              Alert.alert(
                'Permission required',
                Platform.OS === 'ios'
                  ? 'Please enable full photo access in your device settings and reopen the app.'
                  : 'Please enable media library access in your device settings.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
              );
              return false;
              }
            const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              return newStatus === 'granted';
            };


      const pickImage = async () => {
      const hasPermission = await checkPermissions();
        if (!hasPermission) return;

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
        });
        // check file type here
        if(result.assets[0].type !== 'image') {
          Toast.show({
              type: ALERT_TYPE.WARNING,
              title:'Error',
              textBody: 'Files type not supported',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            result.canceled = true
            setImage(null)
            return
          }
          
        if (!result.canceled) {
          const file = new File(result.assets[0].uri);
          const fileInfo = await file.info({ size: true });
        
          if (!fileInfo.exists || fileInfo.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            Toast.show({
              type: ALERT_TYPE.WARNING,
              title:'Error',
              textBody: `File size must be smaller than ${MAX_FILE_SIZE_MB}MB`,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
              });
            return;
          }
          // File is valid, use it
          setImage(result.assets[0].uri);
          
        }
      };

   // Get user details from local storage after every request/operation into the database
   const FetchLocalStorage = async()=>{
    setLoading(true)
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
      setLoading(false);
    }
  }

      // function to upload photo here
      const uploadDocument = async() => {
        if(!image) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Error',
            textBody: 'Please select a document to upload',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          })
          return
        }
        if(value === undefined || value ==='' || value===null) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Error',
            textBody: 'Please select document type',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          })
          return
        }
        setLoading(true)

          let newfile = {
            uri: image,
            type:`document2FA/${image.split(".")[1]}`,
            name:`document2FA.${image.split(".")[1]}`,
          }
          const data = new FormData()
          data.append('file', newfile)
          data.append('upload_preset', CLOUDINARY_PRESET_NAME)
          data.append('upload_name', CLOUDINARY_ACCOUNT_NAME)
          try {
              const response = await fetch("https://api.cloudinary.com/v1_1/ddm1owlon/image/upload", 
              {
                method: 'POST',
                body: data
              }
            );

              const result = await response.json(); // Parse JSON
              const secureUrl = result.secure_url;
                setImageValue(result.public_id);
            
                if (secureUrl) {
                  uploadPhotoURL(secureUrl);
                  setLoading(false);
                }
              } catch (error) {
                deleteImageId(imageValue)
                console.log(error.message)
                setLoading(false)
              }
          }

      const uploadPhotoURL = async(data) => {
        setLoading2(true)
        const sendData = {
          'userId': myId,
          'image_url': data,
          'document_name': value
        }
          try {
              const res = await client.post('/api/user_uploadDocument', sendData,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
              }
          })
          if(res.data.msg == '201'){
              Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title:'Success',
              textBody: 'Document successfully uploaded',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            let userInfoReturn = res.data;
            AsyncStorage.setItem('userInfo', JSON.stringify(userInfoReturn));
            
            FetchLocalStorage()
            let userInfo = await AsyncStorage.getItem('userInfo');
                userInfo = JSON.parse(userInfo)
                setUserInfo(userInfo)
             setImage(null)
            navigation.navigate('Verify2faces')
          }
          else if(res.data.status == '401'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Failed',
              textBody: res.data.message,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return deleteImageId(imageValue)
            
          }
          else if(res.data.status == '400'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: 'File too large',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return deleteImageId(imageValue)
          }
          else if(res.data.status == '404'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Failed',
              textBody: 'You need to have an account',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return deleteImageId(imageValue)
           }
          else if(res.data.status == '402'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: 'You need to login and try again.',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            deleteImageId(imageValue)
            return
          }
          else if(res.data.status == '500'){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: res.data.message,
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return deleteImageId(imageValue)
          }
          
         } catch (error) {
          deleteImageId(imageValue)
          console.log(error.message)
        }
        finally{
          setLoading2(false)
        }
          
      }

  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                      <Text></Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close-outline' size={23} color={colors.blackColor1}/>
                          </View>
                        </TouchableOpacity>
                        
                    </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                  {/* show loader when processing request */}
                        {loading && <LoaderIndicator 
                        loader={loading}
                        textInfo={'  Processing...'}
                        />}
                        {loading2 && <LoaderIndicator 
                        loader={loading2}
                        textInfo={'  Updating...'}
                        />}
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>Documents Upload</Text>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Upload your document to verified your account</Text>
                            
                        </View>

                        <Animatable.View 
                          animation={'fadeIn'}
                          delay={200}
                          useNativeDriver={true}
                          style={styles.formPage}>
                            <View style={{marginBottom:10, marginHorizontal:10, borderWidth: 1, borderRadius: 10,
                                borderColor: 'lightgrey', marginTop:20}}>
                                
                                <Dropdown
                                style={[styles.dropdown, isFocus && { borderColor: colors.primaryColor1 }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={DocumentName}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocus ? 'Select Type' : '...'}
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
                                    color={isFocus ? colors.textSecColor : colors.primaryColor1}
                                    name="document-text"
                                    size={20}
                                    />
                                )}
                                />
                            </View>
                        
                        <TouchableOpacity style={{ justifyContent:'center', alignItems:'center',
                            marginBottom:25,
                            borderColor: 'lightgrey',
                            paddingLeft: 10,
                            }}
                            onPress={pickImage}
                            >
                        {!image && <Ionicons name='document' size={80} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                        {image && <Image source={{ uri: image }} style={{ width: 300, height: 150, borderRadius:5 }} />}
                          <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textSecColor}}>Tap to pick a file</Text>
                        </TouchableOpacity>
                           
                        </Animatable.View>
                        
                        <Animatable.View animation={'fadeIn'}
                          delay={500}
                          useNativeDriver={true} style={{marginHorizontal:20, marginTop:10, borderBottomWidth:1, borderColor: '#dededc', marginBottom:5}}>
                            <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textBlack, marginTop:10}}>Any of the document below is accepted</Text>
                        </Animatable.View>

                        <Animatable.View animation={'fadeIn'}
                          delay={500}
                          useNativeDriver={true} style={{marginHorizontal:20, marginTop:10, borderColor: '#dededc', marginBottom:5}}>
                            <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textSecColor}}>{'*'} International Passport</Text>
                            <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textSecColor}}>{'*'} Government Official ID <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textBlack}}>('NIN')</Text></Text>
                            <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textSecColor}}>{'*'} Driving License</Text>
                            <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textSecColor}}>{'*'} Bank Statement <Text style={{fontFamily:'_regular', fontSize:16, color:colors.textBlack}}>('Three months old')</Text></Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor, marginTop: 10}}>{ } accepted file types are PNG and JPEG only</Text>
                        
                        </Animatable.View>
                            
                          <Animatable.View
                            animation={'zoomIn'}
                            delay={1000}
                            useNativeDriver={true}
                            >
                              <CustomButton 
                                  buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:60}}
                                  viewStyle={{padding:10, alignItems:'center'}}
                                  textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                  textLabel={'Upload Document'}
                                  buttonAction={() => uploadDocument()}
                              />
                              <View style={{justifyContent:'center', alignItems:'center', margin:20}}>
                                  <TouchableOpacity style={{marginTop:5}} onPress={() => navigation.navigate('Home') }>
                                  <Text style={[gs.loginPageDesc,{color:colors.textBlack}]}>Maybe Later</Text>
                                  </TouchableOpacity>
                              </View>
                            </Animatable.View>
                            {/* custom button here */}
                            
                           
                    </ScrollView>
                </View>
            
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    formPage:{
      borderRadius:10, 
      marginHorizontal:10, 
      backgroundColor:colors.textColor, 
      marginTop:20,
      shadowColor: '#000',
      shadowOffset: { 
      width: 0, 
      height: 2 
      },
      shadowOpacity: 0.5,
      shadowRadius: 2,
      elevation: 1, 
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

export default UploadDocumentScreen;
