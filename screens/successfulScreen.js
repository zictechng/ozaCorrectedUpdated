import React, { useContext, useState } from 'react';
import { StyleSheet, View, Text} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs,colors } from '../styles';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Entypo, Ionicons, MaterialCommunityIcons,} from '@expo/vector-icons';
import CustomSmallButton from '../components/customSmallButton';
import CustomButton from '../components/customButton';
import { AuthContext } from '../contextAPI/authContext';

const SuccessfulScreen = ({route, navigation}) => {
    //source={bgImage} resizeMode='stretch'
    const isFocused = useIsFocused();
    let receiveInfo = route.params?.dataSend;
    const [isSuccess, setIsSuccess] = useState();
    const {userToken, userInfo, setUserInfo, appSettingDetails} = useContext(AuthContext)

    //console.log(" success Info ", receiveInfo)

  return (
    <View style={{flex:1, backgroundColor:colors.primaryColor2}}>
               <SafeAreaView style={{flex:1}}>
                      <StatusBar
                        style='light'/>

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        {/* <TouchableOpacity style={[gs.homeSideMenu, {borderWidth: 0}]}>
                            <Entypo name='sweden' size={23} color={colors.textColor}/>
                        </TouchableOpacity> */}

                        {/* <Text style={styles.profileTitle}>Succcessful</Text> */}
                        <Text></Text>
                        {/* <TouchableOpacity onPress={() =>navigation.replace('Home')}>
                          <View style={[gs.homeSideMenu, {borderColor: colors.textColor, width:30}]}>
                          <Ionicons name='close' size={30} color={colors.textColor}/>
                         </View>
                            
                        </TouchableOpacity> */}
                    </View>
                   
                </View>
         
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    <View>
                        <MaterialCommunityIcons name='thumb-up-outline' size={40} color={colors.textColor} />
                    </View>
                <Text style={{fontFamily:'_semiBold', fontSize:20, color:colors.textColor}}>Successful</Text>

                <View style={{marginHorizontal: 15, marginVertical:30}}>
                    <Text style={{fontFamily:'_semiBold', fontSize:16, color:colors.bgColor}}>Your transfer was successful! {`\n`}Thank you for choosing {appSettingDetails.app_name? appSettingDetails.app_name: ''}.</Text>
                </View>
            </View>
          </SafeAreaView>
          <CustomButton 
                buttonStyle={styles.actionButton}
                textStyle={{fontFamily:'_semiBold', fontSize:17, marginLeft:15, color:colors.textBlack}}
                textLabel={'Okay'}
                buttonAction={() => navigation.navigate('Home')}
            />
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
    actionButton:{
      borderRadius:10, 
      marginHorizontal:15, 
      marginVertical:20, 
      backgroundColor:colors.bgColor, 
      height:50,
      justifyContent:'center', 
      alignItems:'center'
    },
    buttonSellText:{
      color:colors.textColor, 
      fontFamily:'_semiBold', 
      fontSize:15
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

      signInButton: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
         backgroundColor: colors.primaryColor1
    },

    textSign:{
        fontFamily:'_semiBold',
        fontSize: 17,
        color: colors.textColor
    },

})


export default SuccessfulScreen;
