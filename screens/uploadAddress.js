import React, { useContext, useState, useEffect} from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import client from '../contextAPI/client';
import { AuthContext } from '../contextAPI/authContext';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import LoaderIndicator from '../components/loaderIndicator';
import Verify2faSuccess from '../components/veriy2faSuccess';
import {CLOUDINARY_ACCOUNT_NAME, CLOUDINARY_PRESET_NAME} from '@env'


const UploadProofAddress = ({navigation}) => {
      const isFocused = useIsFocused();
      
      const [image, setImage] = useState(null);
      const {userInfo, setUserInfo, userToken, completeRegData, setCompleteRegData} = useContext(AuthContext)
      const [loading, setLoading] = useState(false);
      const [loading2, setLoading2] = useState(false);
      const [documentUploaded, setDocumentUploaded] = useState(false);
      const [imageValue, setImageValue] = useState('');
      
      let myId = userInfo.userData._id; // get logged in user ID

      useEffect(() => {
        if(isFocused){
       // console.log("navigation changed ", userInfo?.userData )
                if(userInfo?.userData.reg_stage6 =="Yes"){
                    navigation.navigate('Home');
                }
            }
         }, [isFocused]);

      // image/file picker here
        const pickImage = async () => {
          // No permissions request is necessary for launching the image library
          let resultResponse = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          //console.log("File details ", resultResponse.type);
          // check file type here
          if(resultResponse.assets[0].type =='video') {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title:'Error',
                textBody: 'Videos files are not supported',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
              })
              resultResponse.canceled = true;
              setImage(null)
              return
            }
          
          if (!resultResponse.canceled) {
            setImage(resultResponse.assets[0].uri);
            let fileInfo = await FileSystem.getInfoAsync(resultResponse.assets[0].uri);
            fileSize = 1024 * 1024 * 5
            if(fileInfo.size > fileSize) {
              console.log('file size larger than expected')
              Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title:'Error',
                    textBody: 'File size is larger than 5MB',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                  })
                setImage(null)
              return
            }
          }
        };

      // close success modal and go back to home page
        const closeModal = () =>{
            setDocumentUploaded(false);
            //FetchLocalStorage();
            navigation.navigate('Home')
          }

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

      // function to upload photo here
      const uploadPhoto = async() => {
              if (!image) {
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Error',
                  textBody: 'Please select a document to upload',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                });
                return;
              }
            
              setLoading(true);
            
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
                const response = await fetch(
                  "https://api.cloudinary.com/v1_1/ddm1owlon/image/upload",
                  {
                    method: 'POST',
                    body: data,
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
                deleteImageId(imageValue);
                console.log(error.message);
                setLoading(false);
              }
          
          }

      const uploadPhotoURL = async(data) => {
        setLoading2(true)
        const sendData = {
          'userId': myId,
          'image_url': data
        }
          try {
              const res = await client.post('/api/user_uploadProof_address', sendData,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
              }
          })
          if(res.data.msg == '201'){
            let userInfoReturn = res.data;
            AsyncStorage.setItem('userInfo', JSON.stringify(userInfoReturn));

            FetchLocalStorage()
            setDocumentUploaded(true)
            setCompleteRegData(false)
            setImage(null)
            let userInfo = await AsyncStorage.getItem('userInfo');
                userInfo = JSON.parse(userInfo)
                setUserInfo(userInfo)
            Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title:'Success',
              textBody: 'Proof of address uploaded successfully',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })  
            navigation.navigate('Home');
              
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
                        <TouchableOpacity onPress={() => navigation.navigate('SignupSteps')}>
                              <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                              <Ionicons name='close-outline' size={23} color={colors.blackColor1}/>
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
                            <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>Upload Proof of Address</Text>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>It's highly recommended to upload proof of address to verified your address.</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>Upload a scanned copy of your utility bills or bank statement</Text>
                         </View>

                        <Animatable.View 
                           animation={'fadeIn'}
                           delay={400}
                           useNativeDriver={true}  
                        style={styles.formPage}>
                            
                        
                        <TouchableOpacity style={{ justifyContent:'center', alignItems:'center',
                            marginBottom:25,
                            borderColor: 'lightgrey',
                            paddingLeft: 10,
                            }}
                            onPress={pickImage}
                            >
                        {!image && <Ionicons name='document-outline' size={80} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                        {image && <Image source={{ uri: image }} style={{ width: 200, height: 150, borderRadius:5, marginTop:20 }} />}
                        {!image && <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textSecColor}}>Tap to pick a file</Text> }
                        </TouchableOpacity>
                           
                        </Animatable.View>
                        
                        <View style={{marginHorizontal:20, marginTop:30, borderBottomWidth:1, borderColor: '#dededc', marginBottom:5}}>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10, borderColor: '#dededc', marginBottom:5}}>
                            {/* <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor}}>{'*'} Video file not supported</Text> */}
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{'*'} PNG or JPG format only </Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{'*'} 5MB maximum </Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{'*'} Not older than three months </Text>
                        
                        </View>
                    
                            {/* custom button here */}
                          <Animatable.View
                            animation={'zoomIn'}
                            delay={500}
                            useNativeDriver={true}>
                                <CustomButton 
                                  buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:60}}
                                  viewStyle={{padding:10, alignItems:'center'}}
                                  textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                  textLabel={'Upload'}
                                  buttonAction={() => uploadPhoto()}
                              />
                            
                              <View style={{justifyContent:'center', alignItems:'center', margin:20}}>
                                  <TouchableOpacity style={{marginTop:5}} onPress={() => navigation.navigate('Home')}>
                                  <Text style={[gs.loginPageDesc,{color:colors.textBlack}]}>Maybe Later</Text>
                                  </TouchableOpacity>
                              </View>
                          </Animatable.View>
                    <Verify2faSuccess 
                        modalVisible={documentUploaded}
                        actionButton2={() => closeModal()}
                    />
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
    formPage:{
      borderRadius:10, 
      marginHorizontal:10, 
      backgroundColor:colors.textColor, 
      marginTop:20,
      shadowColor: '#000',
      shadowOffset: { 
      width: 0, 
      height: 0.9 
      },
      shadowOpacity: 0.5,
      shadowRadius: 0.6,
      elevation: 1, 
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

export default UploadProofAddress;
