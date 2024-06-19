import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons, Feather, Entypo, MaterialCommunityIcons, FontAwesome5} from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { Switch } from 'react-native-elements';

const AccountScreen = () => {
  return (
    <View style={{flex:1, backgroundColor:colors.bgColor}}>
        <SafeAreaView style={{flex:1}}>

            <StatusBar style='dark' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]}>
                                <Ionicons name='arrow-back' size={25} color={colors.textColor}/>
                        
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
                            <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textBlack}}>Account</Text>
                        </View>
                
                        <View style={styles.formPage}>
                            <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', marginBottom:5}}>
                                <MaterialIcons name='support-agent' size={25} color={colors.primaryColor2} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Support</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <Ionicons name='person' size={25} color={colors.primaryColor2} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Personal Details</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formPage}>
                            
                            <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row', marginBottom:10}}>
                                        <Ionicons name='document' size={25} color={colors.primaryColor2} />
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Document</Text>
                                    </View>
                            </TouchableOpacity>
        
                           <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row', marginBottom:10}}>
                                    <MaterialIcons name='privacy-tip' size={25} color={colors.primaryColor2} />
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Privacy Policy</Text>
                                    </View>
                             </TouchableOpacity>

                           <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row', marginBottom:10}}>
                                        <Ionicons name='information-circle' size={25} color={colors.primaryColor2} />
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Terms & Conditions</Text>
                                    </View>
                             </TouchableOpacity>

                            <TouchableOpacity style={{flexDirection:'row', padding:10, alignItems:'center', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'row', marginBottom:10}}>
                                        <MaterialIcons name='block' size={25} color={colors.primaryColor2} />
                                        <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Blocked Account</Text>
                                    </View>     
                            </TouchableOpacity>
                                     
                        </View>

                        <TouchableOpacity style={{borderRadius:10, marginHorizontal:10, backgroundColor:colors.textColor, marginTop:20, marginBottom:30}}>
                            <View style={{flexDirection:'row', padding:10, alignItems:'center'}}>
                                <FontAwesome5 name='heart-broken' size={25} color={colors.redColor} />
                                <Text style={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}>Close Account</Text>
                            </View>
                            
                        </TouchableOpacity>
                          
                    </ScrollView>
                            <View style={{flex:1, justifyContent:'center', alignItems:'center', marginBottom:20}}>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>1.0</Text>
                                <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor}}>Mappido</Text>
                            </View>
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
        height: 2 
        },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 0.9, 
        },
    settingTitle:{
        color:colors.textColor,
        fontSize:20,
        marginLeft: -20,
        fontFamily: '_semiBold',
      },

});

export default AccountScreen;
