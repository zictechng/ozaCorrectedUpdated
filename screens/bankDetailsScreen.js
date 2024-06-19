import React, { useContext, useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialIcons, Ionicons, Feather, Entypo, MaterialCommunityIcons, FontAwesome5} from '@expo/vector-icons';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { Dropdown } from 'react-native-element-dropdown';
import BottomWarning from '../components/bottomWarning';
import { AuthContext } from '../contextAPI/authContext';
import { CheckRegistrationStage, NavigateNextPage } from '../components/controls';
import client from '../contextAPI/client';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';

const BankDetailsScreen = ({navigation}) => {
    const isFocused = useIsFocused();
    const {userInfo, userToken, completeRegData, setCompleteRegData} = useContext(AuthContext)
    const [userBankInfo, setUserBankInfo] = useState({});
    const [noRecord, setNoRecord] = useState(false);
    const [loading, setLoading] = useState(false);
    let myId = userInfo.userData._id; // get logged in user ID
    //console.log(myId);
    // check users registration process if user is already completed the process
    const checkRegStage = CheckRegistrationStage();
        
        // action to close incomplete registration popup
        const closeIncompleteRegistration = () =>{
            setCompleteRegData(false);
        }
        
        useEffect(() => {
            getUserBankDetails();
            if(isFocused && checkRegStage !== 'true'){
                setCompleteRegData(true)
                //console.log('Incomplete registration bank details Focus ', checkRegStage)
             }
          }, [isFocused]);
      
        // run a api request to fetch user bank details
        const getUserBankDetails = async () =>{
            setLoading(true);
            try {
                const res = await client.get(`api/user_bankDetails/${myId}`,
                {
                    headers: {
                      'Authorization': 'Bearer '+userToken,
                      }
                  });
                if(res.data.msg == '200'){
                    setUserBankInfo(res.data.bankDetail)
                    setNoRecord(false)
                   }
                else if(res.data.status =='403'){
                    console.log('ACCESS DENIED')
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title:'No access',
                        textBody: 'Access Denied',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                      })
                }
                else if(res.data.status =='404'){
                    setNoRecord(true)
                    // Toast.show({
                    //     type: ALERT_TYPE.DANGER,
                    //     title:'No record found',
                    //     textBody: 'Sorry, we could not find your details',
                    //     titleStyle: noticeData[0].errorTitleStyle,
                    //     textBodyStyle: noticeData[0].errorMessageStyle,
                    //   })
                    console.log('no bank record found')
                }
                else if(res.data.status =='500'){
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title:'Error',
                        textBody: 'Sorry, something went wrong, try again later',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                      })
                }
                else{
                    Toast.show({
                        type: ALERT_TYPE.DANGER,
                        title:'Network Error',
                        textBody: 'Technical errored occurred, try again',
                        titleStyle: noticeData[0].errorTitleStyle,
                        textBodyStyle: noticeData[0].errorMessageStyle,
                      })
                }
            } catch (error) {
                console.log("error occurred ",error)
            }
            finally {
                setLoading(false);
                }
            }

  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity onPress={() => navigation.goBack() }>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Ionicons name='close' size={25} color={colors.textColor}/>
                        
                            </View>
                            </TouchableOpacity>

                        {/* <Text style={styles.settingTitle}>Settings</Text> */}
                        <Text></Text>
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                    
                 </View>
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Bank Details</Text>
                        </View>

                        <View style={{marginHorizontal:20, marginTop:10}}>
                            <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Your bank account information</Text>
                        </View>

                        <View style={styles.formPage}>
                            
                             {loading ? <View style={{marginVertical:30}}>
                                <ActivityIndicator size={25} color={colors.primaryColor1} />
                                </View>
                                :
                    <View>
                            {noRecord ?
                            <View>
                                <Text style={{fontFamily:'_semiBold', fontSize:17, textAlign:'center', color:colors.textSecColor, marginVertical:30}}> No data found!</Text>
                                <Text style={{fontFamily:'_semiBold', fontSize:12, textAlign:'center', color:colors.textSecColor, marginBottom:20}}> We think you have not updated/completed your account profile registration process.</Text>
                            </View>
                            :
                            <View>
                                <View style={[styles.rowWrapperProfile, {borderTopWidth:0, marginTop: 10} ]}>
                                <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Account Name</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.bank_acct_name}</Text>
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Account Number</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.bank_acct_number}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginBottom:20} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Bank Name</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.bank_name}</Text>
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginBottom:20} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Paypal Address</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.paypal_address}</Text>
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginBottom:20} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Payoneer Address</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.payoneer_address}</Text>
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginBottom:20} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Bitcoin Address</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10}]}>{userBankInfo?.btc_address}</Text>
                                    </View>       
                                </View>
                            </View>
                            </View>
                            }
                         </View>
                            }
                    </View>
                     </ScrollView>
                </View>
                    {/* show if user profile is not complete */}
                     
                     {completeRegData && <BottomWarning 
                        closeBtn={<View style={{justifyContent:'flex-end', alignItems:'flex-end'}}>
                                    <TouchableOpacity style={styles.closeBnt}
                                    onPress={() => {closeIncompleteRegistration()}}>
                                        <View style={styles.closeBtnView}>
                                            <Ionicons name="close" size={25} color={colors.textColor}/>
                                        </View>
                                    </TouchableOpacity>
                                 </View>
                            }
                        icon={<Ionicons name="information-circle-outline" size={24} color={colors.textColor}/>}
                        title={'Incomplete Profile'}
                        subTitle={'Complete your registration to remove restrictions in your account to enjoy the amazing offers we have for you.'}
                        buttonText={'Okay'}
                        buttonTextStyle={{color:colors.textColor, fontFamily:'_semiBold', fontSize:14}}
                        buttonStyle={{borderRadius:50, borderColor:colors.lightGreenColor1, width:60, height:30, borderWidth:1, justifyContent:'center', alignItems:'center', marginBottom:20}}
                        titleStyle={{marginLeft: 5, fontFamily:'_bold', fontSize:15, color:colors.bgColor}}
                        subTitleStyle={{marginLeft: 5, fontFamily:'_regular', fontSize:12, color:colors.textColor}}
                        onPress={() => navigation.navigate('SignupSteps')}
                        bgColor={{backgroundColor:colors.primaryColor1}}
                    />}
                         
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
    closeBnt:{
        borderRadius:50, 
        borderWidth:2, 
        borderColor:colors.primaryColor1, 
        backgroundColor:colors.primaryColor1, 
        marginHorizontal: 10
    },
    closeBtnView:{
        borderRadius:50, 
        borderWidth:2, 
        borderColor:colors.textColor, 
        backgroundColor:colors.primaryColor1, 
        justifyContent:'center', 
        alignItems:'center', 
        marginTop:-20
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
    rowWrapperProfile: {
        paddingLeft: 24,
        //backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#dededc'
      },
      rowLabel: {
        fontSize: 14,
        fontFamily: '_semiBold',
        color: '#777',
        textAlign: 'justify'
      },

});

export default BankDetailsScreen;
