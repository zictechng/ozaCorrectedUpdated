import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity, SafeAreaView, ScrollView , Platform, ToastAndroid, ImageBackground} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { FontAwesome6, Ionicons, Entypo, AntDesign} from '@expo/vector-icons';

import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import shareImageBg  from '../assets/images/gift_share.png';
import * as Clipboard from 'expo-clipboard';
import ShareFriend from '../components/shareFriends';
import HeaderMenu from '../components/headerMenu';
import RBSheet from "react-native-raw-bottom-sheet";
import { AuthContext } from '../contextAPI/authContext';
import { applicationDetails } from '../components/controls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bgImage from '../assets/images/app_land2.jpg';


const AccountMenus = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const {userInfo, setUserInfo, appSettingDetails} = useContext(AuthContext);

    const [acctPin, setAcctPin] = useState(false);
    const [rateView, setRateView] = useState(false);
    const [appInfo, setAppInfo] = useState({})
    const [businessRate, setBusinessRate] = useState('');

    let myId = userInfo.userData._id; // get logged in user ID
    const refAccountViewBSheet = useRef();

       // get business rate settings from local storage here
    const getData = async () => {
        try {
          const value = await AsyncStorage.getItem('businessRate')
          dataRate = JSON.parse(value)
            if(dataRate != null) {
            // value previously stored
            setBusinessRate(dataRate.appDataRate)
           }
          else{
            setBusinessRate('')
          }
        } catch(e) {
          // error reading value
        }
      }

      // get application details
    const appDetails = () =>{
        applicationDetails().then((res )=>{
        //console.log(res);
        setAppInfo(res.infoData)
        })
    }
    const title = 'Thank you for choosing '+appInfo?.app_name + '';

        // sharing of text content only.
        // to share images and other content together we need to use expo share or third party libraries

        const onShare = async () => {
            try {
              const shareMessage = `${appInfo?.app_name} is more reliable for all virtual funds exchange. I use it to sell my Paypal, Payoneer, and Bitcoin funds at high rates.\n\nStart selling your funds with it today.\nUse my ID ${userInfo?.userData.tag_id} to join and get free cash back!\n`;
          
              const result = await Share.share({
                message: shareMessage,
                title: appInfo?.app_name, // Android uses this as dialog title
                url: Platform.OS === 'android' ? 'https://ozaapp.com' : undefined, // Optional, helps Android
              });
          
              if (result.action === Share.sharedAction) {
                if (result.activityType) {
                  console.log('Shared with activity type:', result.activityType);
                } else {
                  console.log('Shared successfully');
                }
              } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
              }
            } catch (error) {
              console.log('Share error:', error.message);
            }
          };

            // function to copy user tag ID and share
              const shareCopyID = async () => {
                  try {
                       await Clipboard.setStringAsync(
                        appInfo?.app_name+' App is a reliable platform for you to earn a living and deal with varieties of products and services: '+ '\n'
                          +' Use this Tag ID '+' '+ userInfo.userData.tag_id+ ` to signup and get ${'$'+ businessRate.appDataRate?.signup_bonus_rate} free reward` +'\nVisit ' + 'https://ozaapp.com');
                      // Display a success message 
                      if (Platform.OS === 'android') { 
                          ToastAndroid.show('Referral ID copied successfully! \n Share it on any social networks to earn money', 
                              ToastAndroid.SHORT); 
                      } else if (Platform.OS === 'ios') { 
                          Alert.alert('Referral ID copied! \n Share it on any social networks to earn money'); 
                      } 
                  //setShareDialog(false);
                  } catch (error) {
                      console.log(error);
                  }
                  
              };
 
    useEffect(() =>{
        appDetails();
        getData()
        },[isFocused])

               
  return (
    
        <ImageBackground style={{flex:1}} source={bgImage} resizeMode='cover'>
            <SafeAreaView style={{flex:1}}>
                {
                isFocused &&
                    <StatusBar
                    style='light'/>
                }
                {!acctPin &&
                    <StatusBar
                    style='light'/>
                    }
                <HeaderMenu 
                    buttonHome={<TouchableOpacity onPress={() =>{}}>
                        <View style={gs.homeSideMenu}>
                        {/* <Ionicons name='arrow-back' size={23} color={colors.textColor}/> */}
                    </View>
                        </TouchableOpacity>}
                    titleName={'Account'}
                    profileTitle={styles.settingTitle}
                />

                <View style={{marginBottom:30}}></View>
                <View style={{flex:1, backgroundColor:colors.bgColor}}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{marginHorizontal:10, marginTop:10}}>
                        <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>User Account</Text>
                    </View>

                    <TouchableOpacity style={styles.formPage} onPress={() =>navigation.navigate('profile')}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <Ionicons name='person' size={25} color={colors.primaryColor2} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Profile</Text>
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity style={[styles.formPage, {marginBottom:-3}]}
                        onPress={() =>navigation.navigate('messages')}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <Entypo name='notification' size={25} color={colors.primaryColor2} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Notifications</Text>
                        </View>
                        
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.formPage, {marginBottom:-3}]}
                        onPress={() =>navigation.navigate('referrals')}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <FontAwesome6 name="users" size={25} color={colors.primaryColor2} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Referrals</Text>
                        </View>
                        
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={[styles.formPage, {marginBottom:30}]}
                        onPress={() => OpenAccountDetails()}>
                        <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                            <FontAwesome name="bank" size={25} color={colors.primaryColor2} />
                            <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Bank Details</Text>
                        </View>
                        
                    </TouchableOpacity> */}
                </ScrollView>


                <ShareFriend  
                imageSource={shareImageBg} 
                imageStyle={styles.bgReferral}
                shareButtonStyle={styles.btnShare}
                shareButtonText={styles.btnShareText}
                buttonLabel={'Tell a friend'}
                desText={`Start telling your friends about us both of you earn ${'$'+businessRate?.signup_bonus_rate} for free`}
                onPress1={Platform.OS === 'android' ? shareCopyID : onShare}
                onPress2={() => {}}
                />

                </View>
                    
                {/* Show current rate here... */}
                <RBSheet
                ref={refAccountViewBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                openDuration={900}
                closeDuration={400}
                height={350}
                closeOnPressBack={true}
                keyboardAvoidingViewEnabled={true}
                customStyles={{
                container:{
                    backgroundColor: colors.bgColor,
                },
                draggableIcon: {
                    backgroundColor: "#000"
                }
                }}>

                <View style={{marginHorizontal: 20}}>
                    <Text style={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}>Bank Details </Text>
                        
                    <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{paddingVertical:5, marginBottom:20}}>
                                <Text style={{fontFamily:'_semiBold', fontSize:14, color:colors.textSecColor}}>Easily manage your bank account details on the go</Text>
                            </View>
                        <View style={styles.accountView}>
                            <Text style={styles.accountDetailsTile}>Account Name</Text>
                            <Text style={styles.accountDetails}>{userInfo?.bank_acct_name}</Text>
                        </View>
                    
                        <View style={styles.accountView}>
                            <Text style={styles.accountDetailsTile}>Account Number</Text>
                            <Text style={styles.accountDetails}>{userInfo?.bank_acct_number}</Text>
                        </View>
                    
                        <View style={styles.accountView}>
                            <Text style={styles.accountDetailsTile}>Bank Name</Text>
                            <Text style={styles.accountDetails}>{userInfo?.bank_name}</Text>
                        </View>
                        <View style={styles.accountView}>
                            <Text style={styles.accountDetailsTile}>Account PIN</Text>
                            <Text style={styles.accountDetails}>{userInfo.userData.acct_cot_pin}</Text>
                        </View>
                        <View style={[styles.accountView, {marginBottom:30}]}>
                            <Text style={styles.accountDetailsTile}>Tag ID</Text>
                            <Text style={styles.accountDetails}>{userInfo.userData.tag_id}</Text>
                        </View>
                    </ScrollView>
                </View>
                </RBSheet>

            </SafeAreaView>
        </ImageBackground>
        
        
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountDetailsTile:{
    fontFamily:'_semiBold', 
    fontSize:13, 
    color:colors.textBlack
    },
    accountDetails:{
    fontFamily:'_semiBold', 
    fontSize:14, 
    color:colors.textSecColor
    },
    accountView:{
    flexDirection:'row', 
    justifyContent:'space-between', 
    marginBottom:10
    },
    dialogView1:{
    borderRadius:10, 
    marginHorizontal:10, 
    backgroundColor:colors.textColor
    },
    dialogView2:{
    width:'100%', 
    borderTopRightRadius:10, 
    borderTopLeftRadius:10, 
    marginBottom:20, 
    height:40, 
    backgroundColor:colors.primaryColor1
    },
    bottomSheetImageStyle:{
        width:30, 
        height:30, 
        borderRadius:10
    },
    bottomSheetButtonText:{
        fontFamily:'_semiBold', 
        fontSize:17, 
        marginLeft:15, 
        color:colors.primaryColor1
    },
    dialogText1:{
    fontFamily:'_semiBold', 
    fontSize:17, 
    color:colors.bgColor, 
    textAlign:'center', marginTop:5
},
dialogCancelBtn:{
    marginTop: -45, 
    borderRadius:50, 
    backgroundColor:colors.bgColor, 
    height:30, width:30, 
    alignItems:'center', 
    justifyContent:'center' 
},
    dialogText2:{
        fontFamily:'_regular', 
        fontSize:13, 
        color:colors.textBlack, 
        marginHorizontal:10, 
        marginBottom:10, 
},
    dialogInputText1:{
        flexDirection:'row',
        marginBottom:35,
        borderWidth: 1, 
        borderRadius: 7,
        borderColor: 'lightgrey',
        paddingLeft: 10,
        height: 50,
        marginHorizontal:10
},
    dialogActionBtn:{
        borderRadius:10, 
        marginHorizontal:20, 
        marginTop:5, 
        marginBottom:10, 
        width:80, 
        height:35, 
        alignItems:'center',
        borderColor: colors.primaryColor1,
        borderWidth:1
    },
    bottomSheetButton:{
        flexDirection:'row', 
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.textColor, 
        marginTop:20, 
        height:50, 
        alignItems:'center',
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 1 
        },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        elevation: 1, 
        },
    bottomSheetButtonText:{
        fontFamily:'_semiBold', 
        fontSize:17, 
        marginLeft:15, 
        color:colors.primaryColor1
        },
    settingTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
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
        elevation: 1, 
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

btnShare:{
    borderRadius:50, 
    borderColor:colors.primaryColor1, 
    width:100, 
    height:40, 
    borderWidth:1, 
    justifyContent:'center', 
    alignItems:'center', 
    marginBottom:10,
    marginTop:10,
},
btnShareText:{
    color:colors.blackColor1, 
    fontFamily:'_semiBold', 
    fontSize:14
}

});

export default AccountMenus;
