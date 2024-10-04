import React, { useContext, useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, Alert, ToastAndroid, Platform } from 'react-native';
import { gs,colors } from '../styles';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Entypo, MaterialCommunityIcons, FontAwesome} from '@expo/vector-icons';
import bgImage from '../assets/images/bg5.png';
import proBg from '../assets/images/pro_bg.png';
import imageIcon from '../assets/images/note.png';
import shareImageBg  from '../assets/images/gift.png';
import ShareFriend from '../components/shareFriends';
import CustomButton from '../components/customButton';
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import { CheckRegistrationStage, NavigateNextPage, ProfileImage } from '../components/controls';
import FirstWord from '../components/firstWord';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../contextAPI/client';

const ProfileScreen = () =>{
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const bgImageLocal = require("../assets/images/bg6.png");
    const proImage = require("../assets/images/default_profile.png");

    const {userInfo, setUserInfo, completeRegData, setCompleteRegData} = useContext(AuthContext)
    const [incompleteReg, setIncompleteReg] = useState(true);
    const [shareDialog, setShareDialog] = useState(true);
    const [appDetails, setAppDetails] = useState();
    const [businessRate, setBusinessRate] = useState('');
    const [signupState, setSignupState] = useState(false);

    // function that show only first name // First words in a sentence
    const myName = FirstWord(userInfo.userData.display_name);
    //console.log('Image ', userInfo.userData.profile_photo)
    // check users registration process if user is already completed the process
    const checkRegStage = CheckRegistrationStage();
    
        // action to close incomplete registration popup
        const closeIncompleteRegistration = () =>{
            setIncompleteReg(false);
            setCompleteRegData(false);
            setSignupState(false);
        }
        // action to close share with friends popup
        const closeShareWithFriends = () =>{
            setShareDialog(false);
        }
         
    // get app information from local storage here
    const getDataLocal = async () => {
    try {
      const value = await AsyncStorage.getItem('AppSettingInfo')
      let dataLocal = JSON.parse(value)
      if(dataLocal != null) {
        // value previously stored
        setAppDetails(dataLocal)
      }
      
    } catch(e) {
      // error reading value
      console.log( 'app setting empty ', e)
    }
  }
     // refresh user details from db after any operation into the database
     const RefreshUserDetails = async()=>{
        //console.log("Refresh ID ", data)
      try {
          const res = await client.get('/api/userProfileMobile/'+userInfo.userData._id)
          if(res.data.msg == '200'){
            const userDetails = res.data; 
            AsyncStorage.setItem('userInfo', JSON.stringify( userDetails));
           }
           let userInfoDetails = await AsyncStorage.getItem('userInfo');
              userInfoDetails = JSON.parse(userInfoDetails)
          if(userInfoDetails){
            setUserInfo(userInfoDetails);
           // console.log('User Details fetch local storage ')
          }
          else{
              console.log("something went wrong while fetching user details")
          }
      } catch (error) {
          console.log( 'fetching user information failed ', error)
      }   
    }

    // get the bonus rate from the database
    const getBonusRate = async()=>{
        //console.log("Refresh ID ", data)
      try {
          const res = await client.get('/api/bonus_rate')
          if(res.data.msg == '200'){
            const dataBillRate = res.data; 
            AsyncStorage.setItem('businessRate', JSON.stringify( dataBillRate));
           }
           let dataRate = await AsyncStorage.getItem('businessRate');
           dataRate = JSON.parse(dataRate)
          if(dataRate){
            setBusinessRate(dataRate);
           // console.log('User Details fetch local storage ')
          }
          else{
              console.log("something went wrong while fetching user details")
          }
      } catch (error) {
          console.log( 'fetching user information failed ', error)
      }   
    }
    const checkSignupStatus = () =>{
        if(isFocused && checkRegStage == false){
            setSignupState(true);
            setCompleteRegData(true)
           console.log('Incomplete registration profile Focus ', checkRegStage)
            RefreshUserDetails()
          }
    }
    useEffect(() =>{
        //console.log('Incomplete registration ', completeRegData)
        //console.log("Not completed ", checkRegStage)
          checkSignupStatus()
          getDataLocal()
          getBonusRate();
            //console.log((userInfo.userData.reg_stage5))
      }, [isFocused])
      
      //console.log(businessRate.appDataRate.signup_bonus_rate)
      // function to copy user tag ID and share
    const shareCopyID = async () => {
        try {
             await Clipboard.setStringAsync(
                appDetails.infoData?.app_name+' App is a reliable platform for you to earn a living and deal with varieties of products and services: '+ '\n'
                +' Use this Tag ID '+' '+ userInfo.userData.tag_id+ ` to signup and get ${'$'+ businessRate.appDataRate?.signup_bonus_rate} free reward` +'\nVisit ' + 'https://ozaapp.com');
            // Display a success message 
            if (Platform.OS === 'android') { 
                ToastAndroid.show('Your referral ID copied successfully! \n Share it on any social networks to earn money', 
                    ToastAndroid.SHORT); 
            } else if (Platform.OS === 'ios') { 
                Alert.alert('Referral ID copied! \n Share it on any social networks to earn money'); 
            } 
        //setShareDialog(false);
        } catch (error) {
            console.log(error);
        }
        
    };

    
  return (
    <ImageBackground style={{flex:1}} source={bgImage} resizeMode='cover'>
        
        <SafeAreaView style={{flex:1}}>

                <StatusBar style='light' />
                {/* <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Entypo name='sweden' size={23} color={colors.textColor}/>
                        </TouchableOpacity>

                        <Text style={styles.profileTitle}>Profile</Text>
                        <Text></Text>
                        
                    </View>
                        
                </View> */}

                <HeaderMenu 
                    buttonHome={<TouchableOpacity onPress={() =>navigation.goBack()}>
                    <View  style={[gs.homeSideMenu, {backgroundColor:'transparent', borderWidth: 0}]}>
                        <Ionicons name='close' size={23} color={colors.textColor}/>
                    </View>
                        </TouchableOpacity>}
                    titleName={'Profile'}
                    profileTitle={styles.profileTitle}
                />
                <View style={{marginBottom:90}}></View>

                 <ImageBackground style={{flex:1}} source={proBg} resizeMode='stretch'>
                        
                        <View style={styles.accountView}>
                            {ProfileImage(userInfo.userData?.profile_photo)}
                            {userInfo.userData.acct_approved_status ==="Approved"? <MaterialCommunityIcons name='check-decagram' size={25} style={styles.accountVerify} />:''}
                        </View>

                        <View style={{justifyContent:'center', 
                        alignItems:'center'}}><Text>TagID: {userInfo?.userData.tag_id}</Text>
                        </View>
                            
                        {signupState &&
                            <View style={styles.actionSignupView}>
                                <View style={styles.actionSignupRow}>
                                    <Image source={imageIcon} style={{width:30, height:30, borderRadius:8, opacity:.8}} />
                                    <Text style={styles.actionSignupText}>Please, complete your account registration to remove restriction</Text>
                                    <View>
                                        <TouchableOpacity style={{marginRight:5}} onPress={() => closeIncompleteRegistration()}>
                                        <Ionicons name='close' size={20} color={colors.primaryColor2} />
                                        </TouchableOpacity>
                                    </View>
                                
                                </View>
                                    <TouchableOpacity onPress={() => navigation.navigate('SignupSteps')}>
                                    <Text style={styles.actionSignupButton}>Okay</Text>
                                    </TouchableOpacity>
                            </View>
                        }
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{marginHorizontal:20, marginTop:20}}>
                                    <Text style={[styles.rowLabel, {color:colors.darkHl, fontSize:17}]}>Personal information</Text>
                                </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:0, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Full Name</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.display_name}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Phone Number</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.phone}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Email</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.email}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Sex</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.gender}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Date of Birth</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.dob}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>State</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.state}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>City</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.city}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Country</Text>
                                        <Text style={[styles.rowLabel, {color:'#777'}]}>{userInfo.userData.country}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, borderBottomWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Home Address</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userInfo.userData.address}</Text>
                                    
                                    </View>       
                                </View>
                            </View>
      
                            {/* custom button here */}
                            <CustomButton 
                                buttonStyle={[styles.formPage, {marginTop:40, marginBottom:15}]}
                                icon={<FontAwesome name='bank' size={17} style={{color:colors.primaryColor1}} />}
                                viewStyle={{padding:10, flexDirection:'row', alignItems:'center'}}
                                textStyle={{fontFamily:'_regular', fontSize:17, marginLeft:15, color:'#777'}}
                                textLabel={'Bank Details'}
                                buttonAction={() => navigation.navigate('BankDetails')}
                            />
                            <CustomButton 
                                buttonStyle={[styles.formPage, {  marginTop:5, marginBottom:15}]}
                                icon={<Ionicons name='documents' size={20} style={{color:colors.primaryColor1}}/>}
                                viewStyle={{padding:10, flexDirection:'row',alignItems:'center'}}
                                textStyle={{fontFamily:'_regular', fontSize:17, marginLeft:15, color:'#777'}}
                                textLabel={'Account Documents'}
                                buttonAction={() => navigation.navigate('DocumentView')}
                            />
                            <CustomButton 
                                buttonStyle={[styles.formPage, {  marginTop:5, marginBottom:30}]}
                                icon={<Ionicons name='wallet-outline' size={20} style={{color:colors.primaryColor1}}/>}
                                viewStyle={{padding:10, flexDirection:'row',alignItems:'center'}}
                                textStyle={{fontFamily:'_regular', fontSize:17, marginLeft:15, color:'#777'}}
                                textLabel={'Wallet'}
                                buttonAction={() => navigation.navigate('Wallet')}
                            />
                            
                            {shareDialog && <ShareFriend 
                                imageSource={shareImageBg}
                                imageStyle={styles.bgReferral}
                                shareButtonStyle={[gs.actionButtonShare, {marginTop:5}]}
                                shareButtonText={gs.buttonSellText}
                                buttonLabel={'Share'}
                                desText={`Share your ID with your friends and love once to signup both of you earn ${'$'+ businessRate.appDataRate?.signup_bonus_rate}`}
                                iconType={<Ionicons name='close' size={20} color={colors.primaryColor2} />}
                                onPress1={() => shareCopyID()}
                                onPress2={() => closeShareWithFriends()}
                            />}
                         
                        </ScrollView>
                               
                 </ImageBackground>
          </SafeAreaView>
        
     </ImageBackground>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formPage:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:20,
        height:50,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 0.9 
        },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 0.9, 
        },
    accountView:{
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius:50, 
        backgroundColor:colors.bgColor, 
        height:70, 
        width:70, 
        marginHorizontal:'40%', 
        marginTop:-40
    },
    accountVerify:{
        position: "absolute", 
        top: 30, 
        right: -20, 
        marginRight: 10, 
        color:colors.greenColor,
    },
    actionSignupView:{
        borderRadius:10, 
        backgroundColor:colors.lightGreenColor1, 
        marginHorizontal:10, 
        alignItems:'center', 
        marginTop:10
    },
        actionSignupRow:{
        flexDirection:'row', 
        alignItems:'center', 
        marginTop:5, 
        marginHorizontal:5
    },
    
        actionSignupText:{
        fontFamily:'_regular', 
        fontSize:14, 
        marginHorizontal:5, 
        flexShrink:1, 
        flexWrap: 'wrap',
    },

    actionSignupButton:{
        fontFamily:'_bold', 
        fontSize:14, 
        color:colors.primaryColor2, 
        marginBottom:5
    },
    buttonSellText:{
        color:colors.textColor, 
        fontFamily:'_semiBold', 
        fontSize:15
    },
    profileTitle:{
      color:colors.textColor,
      fontSize:20,
      marginLeft: -20,
      fontFamily: '_semiBold',
    },
    rowSpacer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
      },
      rowLabel: {
        fontSize: 14,
        fontFamily: '_semiBold',
        color: '#777',
        textAlign: 'justify'
      },
      rowWrapperProfile: {
        paddingLeft: 24,
        //backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#dededc'
      },
      row: {
        flexDirection: 'column',
        paddingRight: 24,
        height: "auto",
      },
      bgImage:{
        position: 'absolute',
        resizeMode:'cover',
        opacity: 0.7,
        transform: [{skewX: '45deg'}],
        bottom: 0,
        right: 10,
       },

       
    shareRow:{
        flexDirection:'row', 
        justifyContent:'space-between', 
        alignItems:'center', 
        marginHorizontal:5, 
        marginTop:5,
    },
    shareText:{
    fontFamily:'_regular', 
    fontSize:14, 
    marginHorizontal:5, 
    flexShrink:1, 
    flexWrap: 'wrap'},
    bgReferral:{
        position: 'absolute',
        resizeMode:'cover',
        opacity: 0.7,
        transform: [{skewX: '45deg'}],
        bottom: 0,
        right: 10,
        borderRadius:8, 
        opacity:0.6,
        width:90, 
        height:85, 
       },

       
})


export default ProfileScreen;