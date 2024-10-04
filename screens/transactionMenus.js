import React, { useContext, useEffect, useRef, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Modal from "react-native-modal";
import { MaterialIcons, Ionicons} from '@expo/vector-icons';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import HeaderMenu from '../components/headerMenu';
import RBSheet from "react-native-raw-bottom-sheet";
import { AuthContext } from '../contextAPI/authContext';
import RateBottomSheet from '../components/rateBottomSheet';
import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';


const TransactionMenus = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const {userInfo, setUserInfo, appSettingDetails} = useContext(AuthContext);

    const [acctPin, setAcctPin] = useState(false);
    const [rateView, setRateView] = useState(false);

    let myId = userInfo.userData._id; // get logged in user ID
    const refVieRateBSheet = useRef();

    useEffect(() => {
       
      }, [isFocused]);
      
      useEffect(() =>{
       },[])

      const OpenRateView = () =>
      {
        setRateView(!refVieRateBSheet.current.open())
      }
      
    const [userDetails, setUserDetails] = React.useState({
        new_pin: '',
        confirm_secureTextEntry: true,
        })
 
  
  return (
    
        <SafeAreaView style={{flex:1, backgroundColor:colors.primaryColor2}}>

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
                        buttonHome={
                        <TouchableOpacity onPress={() =>{}}>
                            <View style={gs.homeSideMenu}>
                            {/* <Ionicons name='arrow-back' size={23} color={colors.textColor}/> */}
                         </View>
                        </TouchableOpacity>
                        }
                        titleName={'Transactions'}
                        profileTitle={styles.settingTitle}
                    />
                
                 <View style={{marginBottom:30}}></View>
                 <View style={{flex:1, backgroundColor:colors.bgColor}}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{marginHorizontal:10, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:25, color:colors.textBlack}}>App Transactions</Text>
                        </View>
                
                        <TouchableOpacity style={styles.formPage} onPress={() =>navigation.navigate('FundAccount')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='add' size={25} color={colors.primaryColor2} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Add Funds</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.formPage, {marginBottom:-3}]}
                            onPress={() =>navigation.navigate('SendFund')}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='send-sharp' size={25} color={colors.primaryColor2} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Send Funds</Text>
                            </View>
                            
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.formPage, {marginBottom:30}]}
                            onPress={() =>OpenRateView()}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <MaterialIcons name='currency-exchange' size={25} color={colors.primaryColor2} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Exchange Rate</Text>
                            </View>
                            
                        </TouchableOpacity>

            </ScrollView>
        </View>
                         
            {/* Show current rate here... */}
            <RBSheet
                    ref={refVieRateBSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    openDuration={500}
                    closeDuration={400}
                    height={250}
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
                <ScrollView>
                    <RateBottomSheet 
                        titleText={'Rate'}
                        titleStyle={{fontFamily:'_semiBold', fontSize:20, color:colors.textBlack}}
                        imageIconPaypal={paypalImage}
                        imageIconPayooner={payoonerImage}
                        imageIconBitcoin={bitcoinImage}
                        imageStyle={styles.bottomSheetImageStyle}
                        buttonTextStyle={styles.bottomSheetButtonText}
                        textStyle={{fontFamily:'_semiBold', fontSize:14, marginTop:8}}
                    />

                </ScrollView>
            </RBSheet>
              
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

});

export default TransactionMenus;
