import React, { useContext,useState, useEffect } from 'react';
import { ToastAndroid, Alert, ActivityIndicator, FlatList, StyleSheet, View, Text, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView } from 'react-native';
import { gs,colors } from '../styles';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable'
import { useNavigation, useIsFocused} from '@react-navigation/native';
import {Ionicons, Feather, Entypo,} from '@expo/vector-icons';
import proBg from '../assets/images/refferal_bg5.png';
import moment from "moment";
import shareImageBg  from '../assets/images/gift_share.png';
import ShareFriend from '../components/shareFriends';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ReferralScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const {logoutAction, userToken, userInfo, setUserInfo} = useContext(AuthContext)
  const [currentPage, setCurrentPage] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [noRecord, setNoRecord] = useState(false);
  const [fetchReferralData, setFetchReferralData] = useState([]);
  const [shareDialog, setShareDialog] = useState(true);
  const [appDetails, setAppDetails] = useState();
  const [businessRate, setBusinessRate] = useState('');
    //source={bgImage} resizeMode='stretch'

       // action to close share with friends popup
       const closeShareWithFriends = () =>{
        setShareDialog(false);
    }
        // method two of fetching messages with pagination
        const loadReferrals = async() =>{
          //console.log("current Page ", currentPage)
          if(!isLoading && !isListEnd){
            setIsLoading(true);
            try {
              const res = await client.get(`api/user_referrals/${userInfo.userData._id}?page=`+currentPage,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
                  }
              }
            );
            //console.log("response: " + res);
            if(res.data.length > 0){
              setCurrentPage(currentPage + 1)
              setFetchReferralData([...fetchReferralData, ...res.data])
              setIsLoading(false)
            }
              else{
                setIsListEnd(true)
                setIsLoading(false)
              }
           } catch (error) {
              console.log(error.message);
            } finally {
              setIsLoading(false);
             }
            }
        }

    // footer
    const renderFooter =() =>{
      return (
        <View style={{justifyContent:'center', alignItems:'center'}}>
          {isLoading ? (
            <ActivityIndicator size={25} color={colors.primaryColor1} style={{margin:15}} />
          ): 
          //   <View style={{justifyContent:'center', alignItems:'center', marginBottom:10}}>
          //     <Text style={{fontFamily:"_regular", fontSize:13, color:colors.textSecColor}}>No more data</Text>
          // </View>
          ''
        }
        </View>
      )
    }
    
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
      //console.log('Rate: ', businessRate?.signup_bonus_rate)

    useEffect(() =>{
      loadReferrals()
      _getAppLocalInfo()
      getData()
      getDataLocal()
    },[isFocused])

     // function to copy user tag ID and share
     const shareCopyID = async () => {
      try {
           await Clipboard.setStringAsync(
            appDetails?.infoData.app_name+ ' is a reliable platform for selling Paypal and Payoneer funds and you can earn a living, deal with other varieties of products and services: '+ '\n'
              +' Use this Tag ID '+''+ userInfo?.userData.tag_id+ ` to signup and get ${'$'+businessRate?.signup_bonus_rate} free reward` +'\nVisit ' + 'https://ozaapp.com');
          // Display a success message 
          if (Platform.OS === 'android') { 
              ToastAndroid.show('Referral ID copied successfully! \n Share it on any social networks to earn money', 
                  ToastAndroid.SHORT); 
          } else if (Platform.OS === 'ios') { 
              Alert.alert('Referral ID copied successfully! \n Share it on any social networks to earn money'); 
          } 
      //setShareDialog(false);
      } catch (error) {
          console.log(error);
      }
      
  };

  return (
    <ImageBackground style={{flex:1, backgroundColor:colors.primaryColor2}} 
    source={proBg} resizeMode='cover'>
        <SafeAreaView style={{flex:1}}>

        <StatusBar style='light' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity onPress={() =>navigation.openDrawer()}>
                          <View  style={[gs.homeSideMenu, {backgroundColor:'transparent', borderWidth: 0}]}>
                        <Entypo name='sweden' size={23} color={colors.textColor}/>
                    </View>
                           </TouchableOpacity>

                        <Text style={styles.profileTitle}>Referrals</Text>
                        <Text></Text>
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                 </View>
            
            <View style={{backgroundColor:colors.bgColor, flex:2}}>
                {/* <View style={{justifyContent:'center', alignItems:'center', marginHorizontal:10}}>
                    <Image source={bgImage} resizeMode='cover' style={{width:350, height:150, opacity:.70}} />
                </View> */}
                <View style={{marginHorizontal:10, marginTop:10}}>
                    <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>The people you have shared your link with that signup and connect with {appDetails?.infoData.app_name? appDetails?.infoData.app_name+ ' App' :''}</Text>
                </View>
                
                {/* List view will come here */}
                <FlatList 
                  data={fetchReferralData}
                  renderItem={({item}) =>
                    <Animatable.View style={[styles.rowWrapper, { flexShrink: 1} ]}
                        animation="fadeInUpBig">
                          <Text style={styles.mobileTitle}>{item.ref_userName}</Text>
                          <View style={{flexShrink: 1,  marginRight: 10}}>
                              <Text style={[styles.mobileMessage, {textAlign: 'justify',}]}></Text>
                          </View>
                          <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                              <Text style={[styles.mobileMessage, {color:'#aaa',}]}>{item.ref_status}</Text>
                              <Text style={[styles.mobileMessage, {marginRight: 15, color:'#aaa', fontSize: 12, marginBottom: 12}]}>
                                {moment(item.createdOn).format("YYYY/mm/DD hh:mm:ss")}</Text>
                          </View>
                                  
                    </Animatable.View>  
                  }
                  ListFooterComponent={renderFooter}
                  onEndReached={loadReferrals}
                  onEndReachedThreshold={0.5}
                  estimatedItemSize={200}
                  //ListEmptyComponent={emptyList}
                  />
                
                    {!isLoading && fetchReferralData.length < 1 ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textSecColor}}>No referrals at the moment</Text>
                  </View>:''}
                  
            </View>

            <View style={{backgroundColor:colors.bgColor}}>
              {shareDialog && <ShareFriend  
                    imageSource={shareImageBg} 
                    imageStyle={styles.bgReferral}
                    shareButtonStyle={gs.actionButtonShare}
                    shareButtonText={gs.buttonSellText}
                    buttonLabel={'Share'}
                    desText={'Share with your friends and love once, to earn more money'}
                    iconType={<Ionicons name='close' size={20} color={colors.primaryColor2} />}
                    onPress1={() => shareCopyID()}
                    onPress2={() => closeShareWithFriends()}
                />
              }
            </View>

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
    mobileTitle:{
      fontFamily:'_semiBold',
      fontSize: 14,
      color:'#777',
      marginTop: 10,
      marginHorizontal:10,
  },
  mobileMessage: {
    fontFamily:'_regular',
    fontSize: 14,
    marginBottom: 10,
    marginHorizontal:10
},
  rowWrapper:{
    marginTop:10,
    backgroundColor: '#fff',
    borderColor: '#e3e3e3',
    borderRadius: 10,
    marginHorizontal: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: -0.22,
    shadowRadius: 0.2,
    shadowColor: "#000",
    elevation: 0.1,
    marginBottom: 10,
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

})


export default ReferralScreen;
