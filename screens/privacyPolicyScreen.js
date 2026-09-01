import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View, Text, TextInput, TouchableOpacity,  ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Entypo, Ionicons,} from '@expo/vector-icons';
import HTMLView from 'react-native-htmlview';
import client from '../contextAPI/client';
import HeaderMenu from '../components/headerMenu';
import { WebView } from 'react-native-webview';

const {width, height} = Dimensions.get('screen');
const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
    
    const[fetchInfo, setFetchInfo] = useState({})
    const[fetchLoading, setFetchLoading] = useState(false)
    const[emptyContent, setEmptyContent] = useState(false)
    
    useEffect(() =>{
      loadAbout()
    },[])

    // load about company details
    const loadAbout = async() =>{
          setFetchLoading(true)
      try {
        const res = await client.get('/api/fetchAboutCompany')
      if(res.data.msg == '200'){
        setFetchInfo(res.data.infoData)
        //console.log("result ", res.data.infoData)
        }
        else if(res.data.status == '404'){
          setEmptyContent(true)
          console.log("Error message ", res.data)
        }
      } catch (error) {
        console.log('Server error occurred ', error.message)
      }
      finally{
        setFetchLoading(false);
      }
    }


  return (
    // <View style={{flex:1, backgroundColor:'transparent'}}>
    //           <SafeAreaView style={{flex:1}}>

    //                 <StatusBar style='dark' />

    //                    <View style={{backgroundColor:'transparent', marginTop:Platform.OS ==='ios'? 10 : 40 , marginLeft: 20, marginBottom:5} }>
    //                    <TouchableOpacity
    //                       onPress={() =>navigation.goBack()}>
    //                           <View style={{backgroundColor:colors.primaryColor2, width:30, height:30, alignItems:'center', justifyContent:'center', borderRadius:20} }>
    //                             <Ionicons name='arrow-back' size={23} color={colors.textColor}/>
    //                           </View>
    //                     </TouchableOpacity>
    //                   </View>
    //                 <View style={{backgroundColor:colors.bgColor, flex:1,}}>      
    //                     {/* list view will come here for each tab clicked */}
    //                             {!fetchLoading && fetchInfo?.company_term_conditions == null?
    //                             <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
    //                                 <Ionicons name="information-circle-outline" size={50} color="black" style={{opacity: 0.2}} />
    //                               <Text style={{fontFamily:'_regular', fontSize:17, color:colors.textSecColor}}>No information at the moment!</Text>
    //                             </View>
    //                             : ''}
    //                 <View style={styles.webviewContainer}>
    //                       <WebView
    //                           originWhitelist={['*']}
    //                         source={{ uri: 'https://oza-mobile-website.onrender.com/mobileUserPolicy' }}
    //                         javaScriptEnabled={true}
    //                         domStorageEnabled={true}
    //                         startInLoadingState={true}
                            
    //                         renderLoading={() => <ActivityIndicator
    //                           style={{
    //                               backgroundColor: 'transparent', position: 'absolute', left: width * 0.35, top: height / 2 - 50, zIndex: 9,
    //                               height: width * 0.3,
    //                               width: width * 0.3,
    //                               borderRadius: 20
    //                           }}
    //                           color={colors.primaryColor1}
    //                           size="large" />}
    //                         />
    //                   </View>
    //                 </View>

    //         </SafeAreaView>
    //  </View>
    <View style={{flex:1, backgroundColor:colors.primaryColor2}}>
              <SafeAreaView style={{flex:1}}>

                    <StatusBar style='light' />

                        <HeaderMenu 
                          buttonHome={<TouchableOpacity
                          onPress={() =>navigation.goBack()}>
                              <View style={gs.homeSideMenu}>
                                <Ionicons name='arrow-back' size={23} color={colors.textColor}/>
                              </View>
                              </TouchableOpacity>}
                          titleName={'Privacy Policy'}
                          profileTitle={styles.profileTitle}
                        />
                        <View style={{marginBottom:30}}></View>
                    <View style={{backgroundColor:colors.bgColor, flex:1,}}>      
                        {/* list view will come here for each tab clicked */}
                                {!fetchLoading && fetchInfo?.company_privacy_policy == null || fetchInfo?.policy_status !='Active'?
                                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                                    <Ionicons name="information-circle-outline" size={50} color="black" style={{opacity: 0.2}} />
                                  <Text style={{fontFamily:'_regular', fontSize:17, color:colors.textSecColor}}>No information at the moment!</Text>
                                </View>
                                : ''}
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {fetchLoading ? <ActivityIndicator size={30} color={colors.primaryColor1} />:''}

                            {!fetchLoading && fetchInfo?.company_privacy_policy != null && fetchInfo?.policy_status == 'Active' ?
                              <View style={{marginHorizontal:15, marginTop:8}}>
                                
                                <View style={{marginHorizontal: 5, flex:1}}>
                                  <HTMLView
                                    value={fetchInfo?.company_privacy_policy != null || fetchInfo?.company_privacy_policy != undefined? fetchInfo?.company_privacy_policy: '' }
                                    stylesheet={styles.style}
                                  />   
                                </View>
                              </View>
                            :''}

                        </ScrollView>
                        
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
    style: {
    fontFamily:'_regular', 
    fontSize:14, 
    color:colors.textBlack, 
    textAlign:'justify' 
  },
    webviewContainer: {
      flex: 1,
      alignSelf: 'stretch',
    },
    actionButton:{
        width:100, 
        height:30, 
        borderRadius:20, 
        backgroundColor:colors.primaryColor1, 
        alignItems:'center',
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


export default PrivacyPolicyScreen;
