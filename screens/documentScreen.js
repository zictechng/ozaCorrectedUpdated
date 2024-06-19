import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5} from '@expo/vector-icons';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { Switch } from 'react-native-elements';
import { AuthContext } from '../contextAPI/authContext';


const DocumentScreen = ({navigation}) => {

    const {userToken, userInfo, setUserInfo} = useContext(AuthContext)
    const [documentVerify, setDocumentVerify] = useState(false)
    const [acctAproved, setAcctAproved] = useState(false)

    useEffect(() =>{
        if(userInfo.userData.reg_stage4 == 'Yes'){
            setDocumentVerify(true);
        }
        if(userInfo.userData.acct_approved_status == 'Approved'){
            setAcctAproved(true);
        }
        
            //console.log((userInfo.userData.reg_stage5))
            //console.log("Document completed ", documentVerify)
      }, [])

   return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                                <Ionicons name='close-outline' size={25} color={colors.textColor}/>
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
                        <View style={{marginHorizontal:15, marginTop:10}}>
                            <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Documents</Text>
                        </View>

                        <View style={{marginHorizontal:15, marginTop:10, marginBottom:10}}>
                            {acctAproved && <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>Your document have been verified Successfully</Text>}
                            {!documentVerify && <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Your document verification is pending or not yet uploaded</Text>}
                            {documentVerify && !acctAproved && <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textBlack}}>Your document is now been review please, be patient.</Text>}
                        </View>
                            <View style={styles.formPage}>
                                
                                    <View style={{justifyContent:'center', alignItems:'center'}}>
                                        {documentVerify && <Ionicons name='document' size={200} color={colors.primaryColor2}
                                        style={{transform: [{rotate: '-15deg'}], opacity:.25}} />}

                                        {!documentVerify && <Ionicons name='document' size={200} color={colors.primaryColor2}
                                        style={{transform: [{rotate: '-15deg'}], opacity:.70}} /> }
                                        {acctAproved && <MaterialCommunityIcons name='check-decagram' size={25} style={styles.accountVerify} />}
                                    </View>
                        
                            </View>
                         <View style={{marginBottom:30}}></View>
                         
                    </ScrollView>
                    <TouchableOpacity style={[documentVerify? styles.buttonDisable: styles.buttonActive ]}
                        onPress={() =>navigation.navigate('UploadDocument')}
                        disabled={documentVerify}>
                            <View style={{flexDirection:'row', height:50, alignItems:'center', marginHorizontal:15, justifyContent:'center'}}>
                                <FontAwesome5 name='file' size={25} color={documentVerify? colors.primaryColor1 : '#fff'} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color: documentVerify? colors.primaryColor1: '#fff'}}>Upload Documents</Text>
                            </View>
                            
                    </TouchableOpacity>
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

    buttonDisable:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.bgColor, 
        borderWidth:1,
        borderColor:colors.primaryColor1,
        marginTop:20,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 0.9 
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 0.9, 
        opacity: 0.7,
        bottom:10,
        },
    buttonActive:{
        borderRadius:10, 
        marginHorizontal:10, 
        backgroundColor:colors.primaryColor1, 
        borderWidth:1,
        marginTop:20,
        shadowColor: '#000',
        shadowOffset: { 
        width: 0, 
        height: 0.9 
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 0.9, 
        bottom:10,
        },

});

export default DocumentScreen;
