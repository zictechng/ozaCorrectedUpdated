import React, { useContext, useState, useEffect} from 'react';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable'
import { View, Button, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView , ToastAndroid, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import client from '../contextAPI/client';
import { AuthContext } from '../contextAPI/authContext';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import LoaderIndicator from '../components/loaderIndicator';
import {CLOUDINARY_ACCOUNT_NAME, CLOUDINARY_PRESET_NAME} from '@env'
import * as DocumentPicker from 'expo-document-picker';

const UploadPaymentProof = ({route, navigation}) => {
      const isFocused = useIsFocused();
      let trackPayId = route.params?.track_id;
      const [image, setImage] = useState(null);
      const {userInfo, setUserInfo, userToken} = useContext(AuthContext)
      const [loading, setLoading] = useState(false);
      const [loading2, setLoading2] = useState(false);
      const [loading3, setLoading3] = useState(false);
      const [imageValue, setImageValue] = useState('');
      const [fileUploadType, setFileUploadType] = useState();

      const [selectedFile, setSelectedFile] = React.useState(null);
      
      let myId = userInfo.userData._id; // get logged in user ID

      useEffect(() => {
        if(isFocused){
       // console.log("navigation changed ", userInfo?.userData )
            }
          
         }, [isFocused]);
      // Get user details from local storage after every request/operation into the database
      const FetchLocalStorage = async()=>{
        setLoading3(true)
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
          setLoading3(false);
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

      // function to upload file to cloudinary here
      const uploadPaymentProofDocument = async() => {
        if(!image) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Error',
            textBody: 'Please select a photo',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          })
          return
        }
        setLoading(true)
       let newfile = {
          uri: image,
          type:`payment_proof/${image.split(".")[1]}`,
          name:`payment_proof.${image.split(".")[1]}`,
        }
        const data = new FormData()
        data.append('file', newfile)
        data.append('upload_preset', CLOUDINARY_PRESET_NAME)
        data.append('upload_name', CLOUDINARY_ACCOUNT_NAME)
          try {
            const response = await fetch("https://api.cloudinary.com/v1_1/ddm1owlon/image/upload", {
                method: 'POST',
                body: data
              });

              const result = await response.json(); // Parse JSON
              const secureUrl = result.secure_url;
              setImageValue(result.public_id);
            
                if (secureUrl) {
                  uploadDocumentUrl(secureUrl);
                  setLoading(false);
                }
              } catch (error) {
                deleteImageId(imageValue)
                console.log(error.message)
                setLoading(false)
              }
            }

      //function to save uploaded file details to database
      const uploadDocumentUrl = async(data) => {
        setLoading2(true)
        const sendData = {
          'userId': myId,
          'image_url': data,
          'trackId': trackPayId,
          'fileType': fileUploadType,
          'public_id': imageValue
        }
          try {
              const res = await client.post('/api/user_uploadPaymentProof', sendData,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
                    }
             })
          if(res.data.msg == '201'){
            Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title:'Success',
              textBody: 'Proof of payment uploaded successfully',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
             setImage(null)
             setFileUploadType('')
             navigation.navigate('Home')
             
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

      
      useEffect(() =>{
        if(isFocused){
          FetchLocalStorage()
          //console.log(userInfo.userData.reg_stage2)
          }
          FetchLocalStorage()
          
        }, [isFocused])


        // function to pick files
        const pickPaymentProof = async () => {
           try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"], 
                copyToCacheDirectory: true,
              });
          
              if (result.type === 'cancel') return;
          
              const file = result.assets[0]; // get the first selected file
              const { name, uri, mimeType } = file;

              // fallback if name or mimeType missing
              const fileName = name || uri.split('/').pop();
              const fileMime = mimeType || getMimeTypeFromFileName(fileName);

              const fileType = isImageOrPdf(fileMime);
          
              if (fileType === 'unknown') {
                const message = 'Unsupported file type. Please select an image or PDF.';
                Platform.OS === 'android'
                  ? ToastAndroid.show(message, ToastAndroid.SHORT)
                  : alert(message);
                return;
              }
          
              // Save selected file
              setFileUploadType(fileType);
              setSelectedFile(uri, name);
              setImage(uri);
          
            } catch (error) {
              console.log('Error picking document:', error);
            }
              };

          // Helper for mime type fallback
          const getMimeTypeFromFileName = (filename) => {
            if (!filename) return 'unknown';
            const ext = filename.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'].includes(ext))
              return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            if (ext === 'pdf') return 'application/pdf';
            return 'unknown';
          };

        // function to check file mime type
          const isImageOrPdf = (mimeType) => 
          {
            const imageMimeTypes = [
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/bmp',
              'image/webp',
              'image/tiff',
            ];
            if (imageMimeTypes.includes(mimeType)) return 'image';
            if (mimeType === 'application/pdf') return 'pdf';
            return 'unknown';
          };
        
  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                          <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                          <Ionicons name='close-outline' size={23} color={colors.blackColor1}/>
                          </View>
                           
                        </TouchableOpacity>
                        <Text></Text>
                        

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
                        textInfo={'  Uploading...'}
                        />}
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>Upload Payment Proof</Text>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>It's highly recommended to upload proof of payment when you choose manual payment method to fast track your transaction approval.</Text>
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
                            onPress={pickPaymentProof}
                            >
                        {!image && <Ionicons name='document-outline' size={80} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                        {fileUploadType =='image' && <Image source={{ uri: image }} style={{ width: 200, height: 150, borderRadius:5, marginTop:20 }} />}
                        
                        {fileUploadType == 'pdf' && <Ionicons name='attach' size={80} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}

                        {!image && <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textSecColor}}>Tap to pick a file</Text> }
                        {fileUploadType =='pdf' && <Text style={{fontFamily:'_semiBold', fontSize:18, color:colors.textSecColor}}>File Attached</Text>}
                        </TouchableOpacity>
                        {fileUploadType =='pdf' &&<Text style={{fontFamily:'_semiBold', alignSelf:'center', fontSize:12, color:colors.textSecColor, marginBottom:10}}>You can upload now</Text>}
                        </Animatable.View>

                        
                        <View style={{marginHorizontal:20, marginTop:30, borderBottomWidth:1, borderColor: '#dededc', marginBottom:5}}>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10, borderColor: '#dededc', marginBottom:5}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor, marginBottom:10}}>{'*'} Video file not supported</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{'*'} PNG, JPG and PDF format only</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>{'*'} 5MB maximum {fileUploadType}</Text>
                        
                        </View>

                            {/* custom button here */}
                          <Animatable.View
                            animation={'zoomIn'}
                            delay={1200}
                            useNativeDriver={true}>
                                <CustomButton 
                                  buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:60}}
                                  viewStyle={{padding:10, alignItems:'center'}}
                                  textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                  textLabel={'Upload'}
                                  buttonAction={() => uploadPaymentProofDocument()}
                              />
                            
                              <View style={{justifyContent:'center', alignItems:'center', margin:20}}>
                                  <TouchableOpacity style={{marginTop:5}} onPress={() => navigation.navigate('Home')}>
                                  <Text style={[gs.loginPageDesc,{color:colors.textBlack}]}>Maybe Later</Text>
                                  </TouchableOpacity>
                              </View>
                          </Animatable.View>
                            
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

    image: {
        marginTop: 20,
        width: '100%',
        height: 300,
      },
      pdfContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 5,
      },
      pdfText: {
        fontSize: 16,
      },
});

export default UploadPaymentProof;
