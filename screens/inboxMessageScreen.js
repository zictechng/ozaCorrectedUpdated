import React, { useContext, useState, useEffect } from 'react';
import { ActivityIndicator,FlatList, StyleSheet, View, StatusBar, Text, TextInput, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView } from 'react-native';
import { gs,colors } from '../styles';
//import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused} from '@react-navigation/native';
import { Avatar, Badge} from 'react-native-elements';
import * as Animatable from 'react-native-animatable'
import { Entypo,} from '@expo/vector-icons';
import CustomSmallButton from '../components/customSmallButton';
import moment from "moment";
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';


const InboxMessageScreen = () => {
      const navigation = useNavigation();
      const isFocused = useIsFocused();
      const {logoutAction, userToken, userInfo, setUserInfo} = useContext(AuthContext)
    //source={bgImage} resizeMode='stretch'
      const [messageData, setMessageData] = useState([]);
      const [fetchMessageData, setFetchMessageData] = useState([]);
      const [messageLoading, setMessageLoading] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [loadMore, setLoadMore] = useState(false);
      const [noRecordFound, setnoRecordFound] = useState(false);
      const [currentPage, setCurrentPage] = useState(1);
      const [isListEnd, setIsListEnd] = useState();
      const [isRefreshing, setIsRefreshing] = useState(false);

      // method one of fetching messages with pagination by creating a separate hook to call 
      // when load more is clicked
      const getMessageData = async () => {
      //   if(connectionState === true){
      //     //alert('Please connect')
      //     Toast.show({
      //         type: ALERT_TYPE.DANGER,
      //         title: 'No Internet Connection',
      //         textBody: 'Sorry, your device is not connected to internet! Please, connect to wifi or mobile data to continue',
      //         titleStyle: {fontFamily: '_semiBold', fontSize: 18},
      //         textBodyStyle: {fontFamily: '_regular', fontSize: 14,},
      //         })
      //      return
      // }
        setMessageLoading(true);
        try {
          const res = await client.get(`api/user_notificationMobile/${userInfo.userData._id}?page=${currentPage}`
          );
          // console.log('Result ', res.data)
          if (
            !Array.isArray(res.data) ||
            res.data.status === "404"
             
          ) {
            setnoRecordFound(true)
            //setAllDataFetched(false);
            return setLoadMore(false);
          }
          setMessageData([...res.data]);
          //setMessageNotice(true);
        } catch (e) {
          console.log(e);
        } finally {
          setMessageLoading(false);
          setLoadMore(false);
        }
      };

         // method two of fetching messages with pagination
      const loadMessages = async() =>{
        //console.log("current Page ", currentPage)
        if(!isLoading && !isListEnd){
          setIsLoading(true);
          try {
            const res = await client.get(`api/user_notificationMobile/${userInfo.userData._id}?page=`+currentPage,{
              headers: {
                'Authorization': 'Bearer '+userToken,
                }
            }
          );
          //console.log("response: " + res);
          if(res.data.length > 0){
            setCurrentPage(currentPage + 1)
            setFetchMessageData([...fetchMessageData, ...res.data])
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
      useEffect(() =>{
        loadMessages()
      },[isFocused])

      //page refreshing function goes here
      const handleRefresh = React.useCallback(() => {
        setIsRefreshing(true);
        loadMessages()
        setTimeout(() => {
        setIsRefreshing(false);
        }, 2000);
      }, []);

  // footer
  const renderFooter =() =>{
    return (
      <View style={{justifyContent:'center', alignItems:'center'}}>
        {isLoading ? (
          <ActivityIndicator size={25} color={colors.primaryColor1} style={{margin:15}} />
        ): 
          <View style={{justifyContent:'center', alignItems:'center', marginBottom:10}}>
            <Text style={{fontFamily:"_regular", fontSize:13, color:colors.textSecColor}}>No more data</Text>
        </View>
      }
      </View>
    )
  }
       // flat list data here
  const messageSheet = ({ item, index }) => (
     <Animatable.View style={[styles.rowWrapper, { flexShrink: 1} ]}
          animation="fadeInUpBig" key={item.index}>
            <Text style={styles.mobileTitle}>{item.alert_name}</Text>
            <View style={{flexShrink: 1, marginHorizontal:9}}>
                <Text style={[styles.mobileMessage, {textAlign: 'justify',}]}>{item.alert_nature}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                <Text style={styles.mobileMessage}></Text>
                <Text style={[styles.mobileMessage, {marginRight: 15, color:'#aaa', fontSize: 12, marginBottom: 12}]}>{moment(item.alert_date).format("YYYY/MM/DD hh:mm:ss")}</Text>
            </View>
                    
      </Animatable.View>  
  )
  
  return (
    <View style={{flex:1, backgroundColor:colors.primaryColor2}}>
        <SafeAreaView style={{flex:1}}>

        <StatusBar barStyle="light-content" translucent
        backgroundColor="transparent" />

                        <HeaderMenu 
                          buttonHome={<TouchableOpacity
                          onPress={() =>navigation.openDrawer()}>
                            <View  style={gs.homeSideMenu}>
                            <Entypo name='sweden' size={23} color={colors.textColor}/>
                          
                          </View>
                          </TouchableOpacity>}
                          titleName={'Message'}
                          profileTitle={styles.profileTitle}
                        />
                        <View style={{marginBottom:30}}></View>
                    <View style={{backgroundColor:colors.bgColor, flex:1,}}>
                
                        {/* list view will come here for each tab clicked */}
                          
                          <FlatList 
                            data={fetchMessageData}
                            renderItem={messageSheet}
                            ListFooterComponent={renderFooter}
                            onEndReached={loadMessages}
                            onEndReachedThreshold={0.5}
                            //ListEmptyComponent={emptyList}
                            showsVerticalScrollIndicator={false}
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            />
                          
                             {!isLoading && !fetchMessageData ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                              <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textSecColor}}>No Messages at the moment</Text>
                            </View>:''}
                
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


export default InboxMessageScreen;
