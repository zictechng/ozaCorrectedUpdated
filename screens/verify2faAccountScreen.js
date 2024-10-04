import React, { useContext, useState, useEffect, useRef  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, Entypo, Fontisto} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable'
import * as FileSystem from 'expo-file-system'
import Collapsible from 'react-native-collapsible';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../components/customButton';
import CustomSmallButton from '../components/customSmallButton';
import sampleSelfieImage from "../assets/images/2fa_sample.png"
import Verify2faImageSample from '../components/verif2faImageSample';
import { AuthContext } from '../contextAPI/authContext';
import LoaderIndicator from '../components/loaderIndicator';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import { ActivityIndicator } from 'react-native';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Verify2faSuccess from '../components/veriy2faSuccess';
import {CLOUDINARY_ACCOUNT_NAME, CLOUDINARY_PRESET_NAME} from '@env'
import CheckPhotoType from '../components/checkPhotoType';

const MAX_FILE_SIZE_MB = 5 * 1024 * 1024; // 5MB in bytes

const Verify2faAccountScreen = ({route, navigation}) => {
      const isFocused = useIsFocused();
      let newPhoto = route.params?.userPhoto;
      const {userInfo, setUserInfo, userToken, completeRegData, setCompleteRegData} = useContext(AuthContext)
      const [image, setImage] = useState(null);
      const [loading, setLoading] = useState(false);
      const [loading2, setLoading2] = useState(false);
      const [loading2fa, setLoading2FA] = useState(false);
      const [isCollapsed, setIsCollapsed] = useState(true);
      const [isCollapsedReason, setIsCollapsedReason] = useState(true);
      const [isDisableBtn, setIsDisableBtn] = useState(false);
      const [otpSend, setOtpSend] = useState(false);
      const [documentSend, setDocumentSend] = useState(false);
      const [documentType, setDocumentType] = useState('');
      const [imageValue, setImageValue] = useState('');
     
      let myId = userInfo.userData._id; // get logged in user ID

      useEffect(() => {
        if(isFocused){
          setImage(newPhoto);
          CheckPhotoType(newPhoto).then((res)=>{
            setDocumentType(res)
            //console.log("Image Type ", res )
          })
       
        if(userInfo?.userData.reg_stage5 =="Yes"){
            navigation.navigate('Home');
             }
            }

            CheckFileSize()
         }, [isFocused, navigation]);


      // open collapsed state
      const openCollapsedState = ()=>{
        setIsCollapsed(!isCollapsed)
      }

      
      // open collapsed state
      const openCollapsedStateReason = ()=>{
        setIsCollapsedReason(!isCollapsedReason)
      }

      // open collapsed state
      const resetOtpSending = ()=>{
        setOtpSend(false)
        setImage(null)
      }

      const [isModalVisible, setModalVisible] = useState(false);

      const toggleModal = () => {
          setModalVisible(!isModalVisible);
      };
     
   
     // go to camera page
     const takeSelfie = () =>{
      navigation.navigate('OpeCamera')
    }

     // Retake photo to go to camera page
     const reTakeSelfie = () =>{
      setImage(null)
      navigation.navigate('OpeCamera', { userPhoto: null })
      
    }

    //check file size
    const CheckFileSize = async ()=>{
      if (!newPhoto) {
        return null;
      }
      try {
        const fileInfo = await FileSystem.getInfoAsync(newPhoto);
        if (!fileInfo) {
          return 'unknown';
        }
        
        const fileSize = fileInfo.size;

          // Check if file size is greater than 5MB, if so resize it
          if (fileSize > MAX_FILE_SIZE_MB) {
            const resizedUri = await ImageSizeReside(newPhoto);
            //console.log("New Photo Size ", resizedUri); //
            setImage(resizedUri);
          } else {
            setImage(newPhoto); // If it's already under 5MB, use original image
          }
       } catch (error) {
        console.error("Error getting file info:", error);
      }
    
    }

    const ImageSizeReside = async(uri) =>{
      if (!uri) {
        //console.error('No URI provided for image resize check.');
        return 'unknown';
      }

    try {
      let resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }], // Adjust the width to your requirement (aspect ratio is maintained)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Adjust compression level
      );

      const resizedFileInfo = await FileSystem.getInfoAsync(resizedImage.uri);

      // Continue resizing if it's still larger than 5MB
      while (resizedFileInfo.size > MAX_FILE_SIZE_MB) {
        resizedImage = await ImageManipulator.manipulateAsync(
          resizedImage.uri,
          [{ resize: { width: resizedImage.width * 0.8 } }], // Gradually reduce size
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Lower compression
        );
      }

      return resizedImage.uri; // Return resized image URI
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri; // Return original URI if resizing fails
    }
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
    
    // send otp code to user via email when get started is clicked
      const sendOTPCode = async() =>{
        //console.log('sendOTPCode', userInfo.userData._id)
        const formData ={
          userId: userInfo.userData._id,
        }
          if(userInfo.userData.email === undefined || userInfo.userData.email ===''){
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title:'Error',
              textBody: 'Please login to get started',
              titleStyle: noticeData[0].errorTitleStyle,
              textBodyStyle: noticeData[0].errorMessageStyle,
            })
            return
          }
        try {
          setLoading2FA(true)
          setIsDisableBtn(true)
          const res = await client.post('/api/user_2fa_otpSend', formData,{
                headers: {
                'Authorization': 'Bearer '+userToken,
                  }
              })

              if(res.data.msg == '201'){
                // Toast.show({
                //   type: ALERT_TYPE.SUCCESS,
                //   title:'Success',
                //   textBody: 'OTP Have been to your email successfully',
                //   titleStyle: noticeData[0].errorTitleStyle,
                //   textBodyStyle: noticeData[0].errorMessageStyle,
                // })
                FetchLocalStorage()
                setOtpSend(true)
                setCompleteRegData(false)
                // go to camera screen
                navigation.navigate('OpeCamera')
              }
              else if(res.data.status == '401'){
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title:'Failed',
                  textBody: res.data.message,
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
              else if(res.data.status == '400'){
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title:'Error',
                  textBody: 'File too large',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
              else if(res.data.status == '404'){
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title:'Failed',
                  textBody: 'You need to have an account',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
              else if(res.data.status == '402'){
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title:'Error',
                  textBody: 'You need to login and try again.',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
              else if(res.data.status == '500'){
                Toast.show({
                  type: ALERT_TYPE.DANGER,
                  title:'Error',
                  textBody: res.data.message,
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
              else{
                Toast.show({
                  type: ALERT_TYPE.SUCCESS,
                  title:'Error',
                  textBody: 'System Error Occurred',
                  titleStyle: noticeData[0].errorTitleStyle,
                  textBodyStyle: noticeData[0].errorMessageStyle,
                })
              }
            } catch (error) {
              console.log(error)
            }
            finally{
              setLoading2FA(false)
              setIsDisableBtn(false)
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

    // function to upload 2FA verification here
      const upload2FADocument = async() => {
        if(image === undefined || image ==='' || image===null) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title:'Error',
            textBody: 'Please select a document to upload',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
          })
          return
        }

        // ResizeImageSize(image).then((data)=>{
        //   console.log("Image Size ", data )
        // })
        
        setLoading(true)
        //  const formData = new FormData();
        //   formData.append('document2FA', {
        //     name: 'document2FA',
        //     uri: image,
        //     type: 'image/jpg', // mime type of file
        //     });
        //   formData.append('userId', myId);
          let newfile = {
            uri: image,
            type:`document2FA/${image.split(".")[1]}`,
            name:`document2FA.${image.split(".")[1]}`,
          }
          const data = new FormData()
          data.append('file', newfile)
          data.append('upload_preset', CLOUDINARY_PRESET_NAME)
          data.append('upload_name', CLOUDINARY_ACCOUNT_NAME)

        //   try {
        //       const res = await client.post('/api/user_upload2fa', formData,{
        //         headers: {
        //         'Content-Type': 'multipart/form-data',
        //         'Authorization': 'Bearer '+userToken,
        //       }
        //   })
          
        //   if(res.data.msg == '201'){
        //     let userInfoReturn = res.data;
        //     AsyncStorage.setItem('userInfo', JSON.stringify(userInfoReturn));

        //     FetchLocalStorage()
        //     setDocumentSend(true)
        //     setCompleteRegData(false)
        //     setImage(null)
        //     let userInfo = await AsyncStorage.getItem('userInfo');
        //         userInfo = JSON.parse(userInfo)
        //         setUserInfo(userInfo)
        //     //navigation.navigate('Verify2faces')
        //     navigation.navigate('UploadProofAddress')
        //   }
        //   else if(res.data.status == '401'){
        //     Toast.show({
        //       type: ALERT_TYPE.DANGER,
        //       title:'Failed',
        //       textBody: res.data.message,
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        //   else if(res.data.status == '400'){
        //     Toast.show({
        //       type: ALERT_TYPE.DANGER,
        //       title:'Error',
        //       textBody: 'File too large',
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        //   else if(res.data.status == '404'){
        //     Toast.show({
        //       type: ALERT_TYPE.DANGER,
        //       title:'Failed',
        //       textBody: 'You need to have an account',
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        //   else if(res.data.status == '402'){
        //     Toast.show({
        //       type: ALERT_TYPE.DANGER,
        //       title:'Error',
        //       textBody: 'You need to login and try again.',
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        //   else if(res.data.status == '500'){
        //     Toast.show({
        //       type: ALERT_TYPE.DANGER,
        //       title:'Error',
        //       textBody: res.data.message,
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        //   else{
        //     Toast.show({
        //       type: ALERT_TYPE.SUCCESS,
        //       title:'Error',
        //       textBody: 'System Error Occurred',
        //       titleStyle: noticeData[0].errorTitleStyle,
        //       textBodyStyle: noticeData[0].errorMessageStyle,
        //     })
        //   }
        // } catch (error) {
        //   console.log(error.message)
        // }
        try {
          res = await fetch("https://api.cloudinary.com/v1_1/ddm1owlon/image/upload", {
              method: 'POST',
              body: data
            }).then(res => res.json())
              .then(data =>{
              const secureUrl = data.secure_url;
              //console.log('After Upload ', data.public_id);
              setImageValue(data.public_id)
              if(secureUrl){
                uploadPhotoURL(secureUrl)
                //setDeleteImageId(data.public_id)
                setLoading(false)
              }
            })
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
            'fileType': documentType,
            'public_id': imageValue
          }
            try {
                const res = await client.post('/api/user_upload2fa', sendData,{
                  headers: {
                    'Authorization': 'Bearer '+userToken,
                }
            })
            if(res.data.msg == '201'){
            let userInfoReturn = res.data;
            AsyncStorage.setItem('userInfo', JSON.stringify(userInfoReturn));

            FetchLocalStorage()
            setDocumentSend(true)
            setCompleteRegData(false)
            setImage(null)
            let userInfo = await AsyncStorage.getItem('userInfo');
                userInfo = JSON.parse(userInfo)
                setUserInfo(userInfo)
            //navigation.navigate('Verify2faces')
            navigation.navigate('UploadProofAddress')
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
                        
                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                        <Text></Text>
                        {/* <TouchableOpacity style={{}}>
                            <Ionicons name='close-outline' size={30} color={colors.primaryColor1}/>
                            
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => navigation.navigate('SignupSteps')}>
                        <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                        <Ionicons name='close-outline' size={25} color={colors.textColor}/>
                        </View>
                            
                        </TouchableOpacity>
                    </View>
                    <View style={{marginBottom:20}}></View>
                    <View style={{marginTop:0}}>
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>Account Ownership Verification</Text>
                        </View>
                 </View>

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
                        
                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>Verify you are who you are! Let's us know you are the person behind this account profile.</Text>
                         </View>

                        <Animatable.View 
                            animation={'fadeIn'}
                            delay={200}
                            useNativeDriver={true} 
                            style={styles.formPage}>
                            
                        {/* Hidden this first, when email send then show it */}
                            <TouchableOpacity style={[styles.btnTapImageUpload]}
                                onPress={takeSelfie}
                                disabled={!otpSend}>

                            {!image && <Fontisto name='photograph' size={80} color='#666' style={{marginRight:5, marginTop:15, opacity:0.4}} />}
                            {image && <Image source={{ uri: image }} style={{ width: 250, height: 260, borderRadius:5, marginTop:15 }} />}
                            {!loading2fa && !image && otpSend ? <Text style={[styles.btnTap, otpSend && !image? styles.btnTap2: '']}>Tap to take a selfie</Text>:''}
                          </TouchableOpacity>
                          
                         {/* Custom small button */}
                         {loading2fa && <View style={{justifyContent:'center', alignItems:'center',
                            marginBottom:25}}>
                              <View style={[styles.btnLoading, isDisableBtn? styles.btnLoadingDisable : '']}>
                              <ActivityIndicator size={20} color={colors.textColor}/>
                            </View>
                          </View>
                          }

                         {!loading2fa && !otpSend ? 
                         <Animatable.View
                            animation={'zoomIn'}
                            delay={400}
                            useNativeDriver={true}>
                              <CustomSmallButton 
                                viewStyle={{ justifyContent:'center', alignItems:'center',
                                marginBottom:25,
                                }}
                                buttonStyle={styles.actionButton}
                                textStyle={styles.buttonSellText}
                                textLabel={'Get Started'}
                                buttonAction={() => sendOTPCode()}
                              />
                         </Animatable.View>:
                         image? <Animatable.View
                            useNativeDriver={true}>
                              <CustomSmallButton 
                                viewStyle={{ justifyContent:'center', alignItems:'center',
                                marginBottom:25,
                                }}
                                buttonStyle={styles.bntRetakeAction}
                                textStyle={styles.buttonSellText}
                                textLabel={'Re-Take photo'}
                                buttonAction={() => reTakeSelfie()}
                              />
                         </Animatable.View>
                         :''}
                      </Animatable.View>
                        
                        {!image && otpSend? <View style={{marginHorizontal:20, marginTop:10, marginBottom:5}} >
                          <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.primaryColor2, marginTop:10}}>I did not receive OTP code <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.redColor, marginTop:10}} onPress={() =>resetOtpSending()}> Start Again</Text></Text>
                        </View>:''} 
                        
                        <Animatable.View 
                          animation={'zoomIn'} 
                          duration={500}
                          useNativeDriver={true}>
                             <TouchableOpacity
                         style={styles.formPageBnt} onPress={() => openCollapsedState()}>
                             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal:5, padding:5}}>
                               <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color:'#777', }}>Reason for KYC verification</Text>
                               {isCollapsed ? <Entypo name='chevron-small-down' size={30} />: <Entypo name='chevron-small-up' size={30} style={{marginHorizontal:10}} /> }
                             </View>
                           <Collapsible collapsed={isCollapsed}>
                             <View style={{marginHorizontal:20, marginTop:10, borderColor: '#dededc', marginBottom:5}}>
                               <Text style={{fontFamily:'_regular', fontSize:14, color:colors.primaryColor2, marginBottom:8}}>{'*'} We want to know you and lift restrictions off your account </Text>
                                   <Text style={{fontFamily:'_regular', fontSize:14, color:colors.primaryColor2, marginBottom:8}}>{'*'} To secure your account</Text>
                                   <Text style={{fontFamily:'_regular', fontSize:14, color:colors.primaryColor2, marginBottom:8}}>{'*'} To enable you have full access to all our products to glow your business </Text>
                                   <Text style={{fontFamily:'_regular', fontSize:14, color:colors.primaryColor2, marginBottom:8}}>{'*'} Access to loan without any paper work </Text>
                                   <Text style={{fontFamily:'_regular', fontSize:14, color:colors.primaryColor2, marginBottom:8}}>{'*'} Build more trust with others in the platform and do business safely.</Text>
                                   <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor, marginTop:10}}>{'*'} Please note, The document will not be stored, we only use it to verify who you are and uplift restrictions from your account .</Text>
                                   
                               </View>
                                 {/* <View style={{justifyContent:'center', alignItems:'center', marginTop:20, marginBottom: 15}}>
                                 <TouchableOpacity onPress={() => toggleModal()} style={styles.btnToggle}>
                                   <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.primaryColor2}}>View Example</Text>
                                 </TouchableOpacity>
                               </View> */}
                           </Collapsible>
                             
                         </TouchableOpacity>
 
                         </Animatable.View>

                         <Animatable.View 
                          animation={"zoomIn" }
                          duration={700}
                          useNativeDriver={true}>
                             <TouchableOpacity
                         style={styles.formPageBntReason} onPress={() => openCollapsedStateReason()}>
                             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal:7, padding:5}}>
                               <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color:'#777', }}>Tips on account verification</Text>
                               {isCollapsedReason ? <Entypo name='chevron-small-down' size={30} />: <Entypo name='chevron-small-up' size={30} style={{marginHorizontal:10}} /> }
                             </View>
                           <Collapsible collapsed={isCollapsedReason}>
                             <View style={{marginHorizontal:20, marginTop:10, borderColor: '#dededc', marginBottom:8}}>
                            
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1, marginBottom:8}}>{'*'} Click the get started button.</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1, marginBottom:8}}>{'*'} We will send you an OTP Code to your email. </Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1, marginBottom:8}}>{'*'} Ensure to save the OTP code in a safe place for future reference. </Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1, marginBottom:8}}>{'*'} For better focus, aligned your face within the frame on the camera and Tab on take a photo.</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1, marginBottom:8}}>{'*'} Uploading documents or photos other than what is requested may result in account suspension.</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.redColor, marginBottom:8}}>{'*'} Your image must be readable, in focus, and free of reflections and glare.</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.blackColor1}}>{'*'} Then, upload it for your account verification </Text>
                            </View>
                                 
                           </Collapsible>
                             
                         </TouchableOpacity>
 
                         </Animatable.View>
                       {/* custom button here */}
                            {newPhoto &&
                            <CustomButton 
                                buttonStyle={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.primaryColor1, marginTop:60}}
                                viewStyle={{height:50,justifyContent:'center', alignItems:'center'}}
                                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textColor}}
                                textLabel={'Upload'}
                                buttonAction={() => upload2FADocument()}/>
                            }
                            <View style={{justifyContent:'center', alignItems:'center', marginTop:20, marginBottom:40}}>
                                <TouchableOpacity style={{marginTop:5}} onPress={() => navigation.navigate('Home')}>
                                <Text style={[gs.loginPageDesc,{color:colors.textBlack}]}>Maybe Later</Text>
                                </TouchableOpacity>
                            </View>

                                {/* modal example here */}
                              <Verify2faImageSample 
                                image={sampleSelfieImage}
                                modalVisible={isModalVisible}
                                actionButton1={() => toggleModal()}
                                actionButton2={() => toggleModal()}
                              />
                              {/* success dialog show here */}
                          {/* <Verify2faSuccess 
                            modalVisible={documentSend}
                            actionButton2={() => closeModal()}
                          /> */}
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

    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      margin: 20,
    },
    button: {
      flex: 0.1,
      alignSelf: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 20,
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
    btnTap:{
      fontFamily:'_semiBold', 
      fontSize:12, 
      color:colors.textSecColor
    },
    btnTapImageUpload:{ 
      justifyContent:'center', 
      alignItems:'center',
      marginBottom:25,
      borderColor: 'lightgrey',
      paddingLeft: 10,
    },
    btnTapImageUploadDisable:{ 
      justifyContent:'center', 
      alignItems:'center',
      marginBottom:25,
      borderColor: 'lightgrey',
      paddingLeft: 10,
      opacity: 0.7
    },
   
    btnTap2:{
      fontFamily:'_semiBold', 
      fontSize:15, 
      color:colors.textSecColor,
      marginBottom:40,
    },
    btnToggle:{
      borderRadius:10, 
      marginHorizontal:20, 
      width:120, 
      height:35,
      justifyContent:'center', 
      alignItems:'center',
      borderColor: colors.primaryColor1,
      borderWidth:1
    },
    btnLoading:{
      width:100, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center' 
    },
    btnLoadingDisable: {
      width:100, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center',
      opacity: 0.7
  },
    formPage:{
      borderRadius:10, 
      marginHorizontal:10, 
      backgroundColor:colors.textColor, 
      marginTop:40,
      shadowColor: '#000',
      shadowOffset: { 
      width: 0, 
      height: 0.9 
      },
      shadowOpacity: 0.5,
      shadowRadius: 0.6,
      elevation: 0.9, 
      },
      formPageBnt:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:30,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 0.5 
        },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        elevation: 1, 
        },
        formPageBntReason:{
          borderRadius:10, 
          marginHorizontal:10, 
          backgroundColor:colors.textColor, 
          marginTop:20,
          shadowColor: '#000',
          shadowOffset: { 
          width: 0, 
          height: 0.5 
          },
          shadowOpacity: 0.5,
          shadowRadius: 1,
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
    actionButton:{
      width:100, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center', 
     },
     bntRetakeAction:{
      width:150, 
      height:30, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center', 
     },
  buttonSellText:{
    color:colors.textColor, 
    fontFamily:'_semiBold', 
    fontSize:14,
    textAlign: 'center',
},
});

export default Verify2faAccountScreen;
