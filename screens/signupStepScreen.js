import React, { useContext, useEffect, useRef, useState } from 'react';
import {ToastAndroid, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, Ionicons, Entypo, Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
//import { Switch } from 'react-native-elements';
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SignupStepScreen = ({navigation}) => {
    const isFocused = useIsFocused();

    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [stage2, setStage2] = useState(false);
    const [stage3, setStage3] = useState(false);
    const [stage4, setStage4] = useState(false);
    const [stage5, setStage5] = useState(false);
    const [stage6, setStage6] = useState(false);
    const [acctPin, setAcctPin] = useState(false);
    const [acctPinLoading, setAcctPinLoading] = useState(false);

    let myId = userInfo.userData._id; // get logged in user ID
    const refSellRBSheet = useRef();
     
     // refresh user details from db after any operation into the database
     const RefreshUserDetails = async()=>{
        //console.log("Refresh ID ", data)
      try {
          const res = await client.get('/api/userProfileMobile/'+userInfo.userData._id,{
            headers: {
                'Authorization': 'Bearer '+userToken,
                    }
            })
          if(res.data.msg == '200'){
            const userDetails = res.data; 
            const appDataInfo = res.data.appData;
            //console.log('User Details fetch local storage ', res.data)
            AsyncStorage.setItem('userInfo', JSON.stringify(userDetails));
            AsyncStorage.setItem('AppSettingData', JSON.stringify(appDataInfo));
           }
           let userInfoDetails = await AsyncStorage.getItem('userInfo');
           let appInfoDetails = await AsyncStorage.getItem('AppSettingData');
              userInfoDetails = JSON.parse(userInfoDetails)
              appInfoDetails = JSON.parse(appInfoDetails)
          if(userInfoDetails){
            setUserInfo(userInfoDetails);
           
           //console.log('User Details fetch local storage Signup Stage ', userInfoDetails)
          }
          else{
              console.log("something went wrong while fetching user details")
          }
      } catch (error) {
          console.log( 'fetching user information failed ', error.message)
      }   
    }

    const checkRegStage = () =>{
        if(userInfo?.userData.reg_stage2 =="Yes"){
            setStage2(true);
            }
        if(userInfo?.userData.reg_stage3 =="Yes"){
            setStage3(true);
            }
            else{
                setStage3(false);   
            }
        if(userInfo?.userData.reg_stage4 =="Yes"){
            setStage4(true);
            }
        if(userInfo?.userData.reg_stage5 =="Yes"){
            setStage5(true);
            }
        if(userInfo?.userData.reg_stage6 =="Yes"){
            setStage6(true);
            }
    }

    useEffect(() => {
        if(isFocused){
       // console.log("navigation changed ", userInfo?.userData )

        if(userInfo?.userData.reg_stage2 =="Yes" && userInfo?.userData.reg_stage2 !=''){
            setStage2(true);
            //console.log("navigation Stage ", userInfo?.userData.reg_stage2 )
            }
        if(userInfo?.userData.reg_stage3 =="Yes" && userInfo?.userData.reg_stage3 !=''){
            setStage3(true);
            }
            else{
                setStage3(false);   
            }
        if(userInfo?.userData.reg_stage4 =="Yes" && userInfo?.userData.reg_stage4 !=''){
            setStage4(true);
            }
        if(userInfo?.userData.reg_stage5 =="Yes" &&userInfo?.userData.reg_stage5 !=''){
            setStage5(true);
            }
        if(userInfo?.userData.reg_stage6 =="Yes" &&userInfo?.userData.reg_stage6 !=''){
            setStage6(true);
            }
         }
         
         RefreshUserDetails()
         //_getAppLocalInfo()
         }, [isFocused]);
      
    const openAcctPinModal =(value) =>{
        setAcctPin(value);
      }

    const [userDetails, setUserDetails] = useState({
        new_pin: '',
        confirm_secureTextEntry: true,
        })

  return (
    
        <SafeAreaView style={{flex:1, backgroundColor:colors.bgColor}}>

                    {
                     isFocused &&
                        <StatusBar
                        style='dark'/>
                    }
                    {!acctPin &&
                        <StatusBar
                        style='dark'/>
                        }
                    <HeaderMenu 
                        buttonHome={<TouchableOpacity onPress={() =>navigation.goBack()}>
                            <View style={[gs.homeSideMenu, ]}>
                            <Ionicons name='arrow-back' size={23} color={colors.blackColor1}/>
                         </View>
                            </TouchableOpacity>}
                        // titleName={'Setting'}
                        // profileTitle={styles.settingTitle}
                    />
                
                 <View style={{marginBottom:30}}></View>
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:20, color:colors.textBlack}}>Signup Process</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor, marginTop:10}}>Complete your account signup process to enjoy the amazing offer that we have for you</Text>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>It takes less than five minutes to complete</Text>
                        </View>
                
                        <View style={styles.formPage}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='person-outline' size={25} color={colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color:colors.textSecColor}}>Open account</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                    <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.formPage}
                        disabled={stage2} onPress={() =>navigation.navigate('CompleteSignup')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='person-outline' size={25} color={!stage2? colors.primaryColor2: colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color: !stage2? colors.textBlack: colors.textSecColor}}>Complete Profile Details</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                    {!stage2 ? <MaterialCommunityIcons name='progress-close' size={23} color={colors.redColor}/>:
                                    <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/> }
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.formPage}
                        disabled={stage3} onPress={() => navigation.navigate('UploadProfile_image')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='images' size={25} color={!stage3? colors.primaryColor2: colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color:!stage3? colors.textBlack: colors.textSecColor}}>Upload Profile Photo</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                   {!stage3 ? <MaterialCommunityIcons name='progress-close' size={23} color={colors.redColor}/>:
                                   <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/>}
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.formPage}
                        disabled={stage4} onPress={() => navigation.navigate('UploadDocument')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='document-text-outline' size={25} color={!stage4? colors.primaryColor2: colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color: !stage4? colors.textBlack: colors.textSecColor}}>Upload Document ID</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                   {!stage4 ? <MaterialCommunityIcons name='progress-close' size={23} color={colors.redColor}/>:
                                   <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/>}
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.formPage}
                         disabled={stage5} onPress={() => navigation.navigate('Verify2faces')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <MaterialIcons name='verified-user' size={25} color={!stage5? colors.primaryColor2: colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color: !stage5? colors.textBlack: colors.textSecColor}}>Proof Account Ownership</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                    {!stage5 ? <MaterialCommunityIcons name='progress-close' size={23} color={colors.redColor}/>:
                                    <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/> }
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.formPage}
                         disabled={stage6} onPress={() => navigation.navigate('UploadProofAddress')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='document-text-outline' size={25} color={!stage6? colors.primaryColor2: colors.textSecColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:14, marginLeft:15, color: !stage6? colors.textBlack: colors.textSecColor}}>Proof of Address</Text>
                                <View style={{flex:1, flexDirection:'row', justifyContent:'flex-end'}}>
                                    {!stage6 ? <MaterialCommunityIcons name='progress-close' size={23} color={colors.redColor}/>:
                                    <Ionicons name='checkmark-circle' size={23} color={colors.textSecColor}/> }
                                </View>
                            </View>
                        </TouchableOpacity>
              
            </ScrollView>
        </View>
                       
        </SafeAreaView>
        
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
        color:colors.textBlack,
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

});

export default SignupStepScreen;
