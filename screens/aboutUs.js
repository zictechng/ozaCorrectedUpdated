import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity,  ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Entypo, Ionicons,} from '@expo/vector-icons';
import HTMLView from 'react-native-htmlview';
import HeaderMenu from '../components/headerMenu';
import client from '../contextAPI/client';

const AboutUs = () => {
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
                          titleName={'About Us'}
                          profileTitle={styles.profileTitle}
                        />
                        <View style={{marginBottom:30}}></View>
                    <View style={{backgroundColor:colors.bgColor, flex:1,}}>      
                        {/* list view will come here for each tab clicked */}
                                {!fetchLoading && emptyContent ?
                                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                                    <Ionicons name="information-circle-outline" size={50} color="black" style={{opacity: 0.2}} />
                                  <Text style={{fontFamily:'_regular', fontSize:17, color:colors.textSecColor}}>No information at the moment!</Text>
                                </View>
                                : ''}
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {fetchLoading ? <ActivityIndicator size={30} color={colors.primaryColor1} />:''}

                            {!fetchLoading && fetchInfo?
                              <View style={{marginHorizontal:15, marginTop:8}}>
                                <Text style={{fontFamily:'_semiBold', fontSize:20, color:colors.textBlack, textAlign:'justify', marginBottom:8 }}>
                                  {fetchInfo?.company_name}
                                </Text>
                                <View style={{marginHorizontal: 5, textAlign:'justify'}}>
                                <HTMLView
                                  value={fetchInfo?.company_desc != null || fetchInfo.company_desc != undefined ? fetchInfo.company_desc : ''}
                                  stylesheet={{fontFamily:'_regular', fontSize:14, color:colors.textBlack, textAlign:'justify' }}
                                  /> 
                                </View>
                                
                                 
                                {/* <HTMLView
                                  value={fetchInfo?.company_desc != null || fetchInfo.company_desc != undefined ? fetchInfo.company_desc : ''}
                                  stylesheet={{fontFamily:'_regular', fontSize:14, color:colors.textBlack, textAlign:'justify' }}
                                  /> */}

                                  <View style={{marginBottom: 10, marginTop:10}}>
                                    <Text style={{fontFamily:'_semiBold', fontSize:15, color:colors.textBlack, textAlign:'justify', marginBottom:8 }}>
                                        Reg: {fetchInfo?.company_regId}
                                    </Text>
                                    <Text style={{fontFamily:'_semiBold', fontSize:15, color:colors.textBlack, textAlign:'justify', marginBottom:8 }}>
                                      Support Email: {fetchInfo?.company_email}
                                     </Text>
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


export default AboutUs;
