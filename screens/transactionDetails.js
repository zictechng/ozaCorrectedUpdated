import React, { useContext, useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, Alert, ToastAndroid, Platform, ActivityIndicator } from 'react-native';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Ionicons} from '@expo/vector-icons';
import bgImage from '../assets/images/bg7.png';
import CustomButton from '../components/customButton';
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import {  NumberValueFormat } from '../components/controls';
import FirstWord from '../components/firstWord';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../contextAPI/client';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import moment from 'moment';

const TransactionsDetails = ({route}) =>{

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    let tPayId = route.params?.record_id;

    const bgImageLocal = require("../assets/images/bg6.png");
    const proImage = require("../assets/images/default_profile.png");

    const {userToken, userInfo} = useContext(AuthContext)
   
    const [appDetails, setAppDetails] = useState();
    const [dataDetails, setDataDetails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // function that show only first name // First words in a sentence
    const myName = FirstWord(userInfo.userData.display_name);
    //console.log('Image ', userInfo.userData.profile_photo)
       
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

  // fetching all history with pagination
  const loadTransactionDetails = async() =>{
    //console.log("current Page ", currentPage)
      setIsLoading(true);
      try {
        const res = await client.get(`api/getTransactionInfo/${tPayId}`,{
          headers: {
            'Authorization': 'Bearer '+userToken,
            }
        }
      );
     // console.log("response: " + res);
      if(res.data.msg == '200'){
        //console.log("response: " + res);
        setDataDetails(res.data.dataInfo)
        setIsLoading(false)
      }
      else if(res.data.status == '404')
        {
            Alert.alert('Sorry, there was an error! Try again later')
        }
      else{
        setIsListEndAll(true)
        setIsLoading(false)
      }

      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
       }
  }

    useEffect(() =>{
        loadTransactionDetails()
    
      }, [])
      
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
                    <Ionicons name='arrow-back' size={25} color={colors.textColor}/>
                    </View>
                        </TouchableOpacity>}
                    titleName={'Transactions Details'}
                    profileTitle={styles.profileTitle}
                />
                <View style={{marginBottom:90}}></View>

                 <ImageBackground style={{flex:1}} backgroundColor={colors.bgColor} resizeMode='stretch'>
                        
                            <ScrollView showsVerticalScrollIndicator={false}>
                                { isLoading ? (
                                <View style={{justifyContent:'center', alignItems:'center'}}>
                                    <ActivityIndicator size={25} color={colors.primaryColor1} style={{margin:15}} />
                                </View>
                                ): 
                            
                            <View>
                                <View style={{marginHorizontal:20, marginTop:20}}>
                                <Text style={[styles.rowLabel, {color:colors.darkHl, fontSize:20}]}>Transaction Overview</Text>
                                </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:0, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Amount</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:20}]}>{dataDetails.currency_level == '2' ? <NumberDollarValueFormat value={dataDetails.amount} /> : <NumberValueFormat value={dataDetails.amount} />}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Tag ID</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.acct_number}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Service Type</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.tran_service_type}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction Type</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.tran_type}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction Category</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.transac_category}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction Nature</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.transac_nature}</Text>
                                    </View>       
                                </View>
                            </View>                           
 
                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction Note</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10, fontSize:15}]}>{dataDetails.tran_desc}</Text>
                                    </View>       
                                </View>
                            </View>
                            {dataDetails.trans_method && 
                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Payment Method</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.trans_method}</Text>
                                    
                                    </View>       
                                </View>
                            </View>}

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Status</Text>
                                        <Text style={[styles.rowLabel, {color:'#777', fontSize:15}]}>{dataDetails.transaction_status}</Text>
                                    
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction ID</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10, fontSize:15}]}>{dataDetails.tid}</Text>
                                    
                                    </View>       
                                </View>
                            </View>
                                {dataDetails.pay_tran != null && dataDetails.pay_tran !=='' &&
                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Payment ID</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10, fontSize:15}]}>{dataDetails.pay_tran}</Text>
                                    
                                    </View>       
                                </View>
                            </View>}

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Transaction Date</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10, fontSize:15}]}>{moment(dataDetails.creditOn).format("DD/MMM/YYYY hh:mm:ss")}</Text>
                                    </View>       
                                </View>
                            </View>

                            <View style={[styles.rowWrapperProfile, {borderTopWidth:1, borderBottomWidth:1, marginTop: 10} ]}>
                                 <View>
                                    <View style={[styles.row, {marginTop: 10}]}>
                                        <Text style={[styles.rowLabel, {color:'#cccac6'}]}>Approved Date</Text>
                                        <Text style={[styles.rowLabel, {color:'#777' , marginBottom: 10, fontSize:15}]}>{moment(dataDetails.approved_date).format("DD/MMM/YYYY hh:mm:ss")}</Text>
                                    
                                    </View>       
                                </View>
                            </View>
      
                            {/* custom button here */}
                            {/* <CustomButton 
                                buttonStyle={[styles.formPage, {marginTop:40, marginBottom:15}]}
                                icon={<FontAwesome name='bank' size={17} style={{color:colors.primaryColor1}} />}
                                viewStyle={{padding:10, flexDirection:'row', alignItems:'center'}}
                                textStyle={{fontFamily:'_regular', fontSize:17, marginLeft:15, color:'#777'}}
                                textLabel={'Bank Details'}
                                buttonAction={() => navigation.navigate('BankDetails')}
                            /> */}
                                {dataDetails.transac_category !=='Withdraw' && dataDetails.payment_proof_url == null || dataDetails.payment_proof_url == '' ?
                                <CustomButton 
                                    buttonStyle={[styles.formPage, {  marginTop:20, marginBottom:30, backgroundColor:colors.primaryColor1}]}
                                    icon={<Ionicons name='documents' size={20} style={{color:colors.colorWhite}}/>}
                                    viewStyle={{padding:10, flexDirection:'row',alignItems:'center'}}
                                    textStyle={{fontFamily:'_regular', fontSize:17, marginLeft:15, color:colors.colorWhite}}
                                    textLabel={'Upload Proof of payment'}
                                    buttonAction={() => navigation.navigate('UploadPaymentProof', {
                                        track_id:dataDetails.tid
                                    })}
                                />:
                                <Text style={{marginTop:30}}></Text>
                                }
                            </View>
                            }
                            </ScrollView>

                            {!isLoading && dataDetails == null || dataDetails == undefined && 
                                <View style={{justifyContent:'center', alignItems:'center', marginBottom:10}}>
                                    <Text style={{fontFamily:"_regular", fontSize:13, color:colors.textSecColor}}>Something went wrong! Try again later</Text>
                                </View>
                            }
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
        marginHorizontal:20, 
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

export default TransactionsDetails;
