import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text,TouchableOpacity, SafeAreaView, FlatList, ImageBackground } from 'react-native';
import { useNavigation, useIsFocused} from '@react-navigation/native';
import * as Animatable from 'react-native-animatable'
import { gs,colors } from '../styles';
import { StatusBar } from 'expo-status-bar';
import { Entypo, Feather, FontAwesome, Ionicons,} from '@expo/vector-icons';
import CustomSmallButton from '../components/customSmallButton';
import moment from "moment";
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { ActivityIndicator } from 'react-native';
import { NumberValueFormat } from '../components/formatValue';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import bgImage from '../assets/images/app_land2.jpg';


const HistoryScreen = ({navigation}) => {
  const isFocused = useIsFocused();
    //source={bgImage} resizeMode='stretch'

    const {logoutAction,userToken, userInfo, setUserInfo} = useContext(AuthContext)
    //source={bgImage} resizeMode='stretch'
      const [messageData, setMessageData] = useState([]);
      const [fetchMessageData, setFetchMessageData] = useState([]);
      const [fetchPaypalData, setFetchPaypalData] = useState([]);
      const [fetchPayoonerData, setFetchPayoonerData] = useState([])
      const [messageLoading, setMessageLoading] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [isPaypalLoading, setIsPaypalLoading] = useState(false);
      const [isPayoonerLoading, setIsPayoonerLoading] = useState(false);
      const [loadMore, setLoadMore] = useState(false);
      const [currentPage, setCurrentPage] = useState(1);
      const [currentPagePaypal, setCurrentPagePaypal] = useState(1);
      const [currentPagePayooner, setCurrentPagePayooner] = useState(1);
      const [isListEndAll, setIsListEndAll] = useState();
      const [isListEndPaypal, setIsListEndPaypal] = useState();
      const [isListEndPayooner, setIsListEndPayooner] = useState();
      const [category, setCategory] = useState(1);
      const [isRefreshing, setIsRefreshing] = useState(false);
      
      //check which button was clicked
      const checkBtnClicked = (value) =>{
            setCategory(value);
            if(value == 2){
              paypalHistory()
            }
            if(value == 3){
              payoonerHistory()
            }
            if(value == 1){
              loadMessages()
            }
            else{
              // do nothing
            }
      }
       
      // fetching all history with pagination
         const loadMessages = async() =>{
          //console.log("current Page ", currentPage)
          //console.log("current Page ", currentPage)
          if(!isLoading && !isListEndAll){
            setIsLoading(true);
            try {
              const res = await client.get(`api/all_historyMobile/${userInfo.userData._id}?page=`+currentPage,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
                  }
              }
            );
           // console.log("response: " + res);
            if(res.data.length > 0){
              setCurrentPage(currentPage + 1)
              setFetchMessageData([...fetchMessageData, ...res.data])
              setIsLoading(false)
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
        }

         // fetching all history base on paypal transaction with pagination
         const paypalHistory = async() =>{
          //console.log("current Page ", currentPagePaypal)
          if(!isPaypalLoading && !isListEndPaypal){
  
           // console.log("result ", paypalHistory)
            setIsPaypalLoading(true);
            try {
              const res = await client.get(`api/all_historyMobilePapay/${userInfo.userData._id}?page=`+currentPagePaypal,{
                headers: {
                  'Authorization': 'Bearer '+userToken,
                  }
              }
            );
           // console.log("response: " + res);
            if(res.data.length > 0){
              setCurrentPagePaypal(currentPagePaypal + 1)
              setFetchPaypalData([...fetchPaypalData, ...res.data])
              setIsPaypalLoading(false)
            }
            else{
              setIsListEndPaypal(true)
              setIsPaypalLoading(false)
            }
  
            } catch (error) {
              console.log(error.message);
            } finally {
              setIsPaypalLoading(false);
             }
  
          }
        }

         // fetching history base on payooner transaction with pagination
         const payoonerHistory = async() =>{
         // console.log("current Page ", currentPage)
          if(!isPayoonerLoading && !isListEndPayooner){
  
           // console.log("result ", paypalHistory)
           setIsPayoonerLoading(true);
            try {
              const res = await client.get(`api/all_historyMobilePayooner/${userInfo.userData._id}?page=`+currentPagePayooner,
              {
                headers: {
                  'Authorization': 'Bearer '+userToken,
                  }
              });
            //console.log("response: " + res);
            if(res.data.length > 0){
              setCurrentPagePayooner(currentPagePayooner + 1)
              setFetchPayoonerData([...fetchPayoonerData, ...res.data])
              setIsPayoonerLoading(false)
            }
            else{
              setIsListEndPayooner(true)
              setIsPayoonerLoading(false)
            }
  
            } catch (error) {
              console.log(error.message);
            } finally {
              setIsPayoonerLoading(false);
             }
  
          }
        }


  // Paypal listView footer
  const paypalRenderFooter =() =>{
    return (
      <View style={{justifyContent:'center', alignItems:'center'}}>
        {isPaypalLoading ? (
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

  // payooner footer listView
  const payoonerRenderFooter =() =>{
    return (
      <View style={{justifyContent:'center', alignItems:'center'}}>
        {isPayoonerLoading ? (
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
  // flat list data here
  const allHistorySheet = ({ item, index }) => (
     <Animatable.View style={[styles.recentTransaction ,{flexShrink: 1,}]}
          animation="fadeInUpBig" useNativeDriver={true} duration={1000} key={item.index}>
            <TouchableOpacity style={styles.rowWrapper}
                  onPress={() => navigation.navigate('TranDetails', {
                    record_id:item._id
                  })}  key={index} >

            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
               
               <View style={{flexDirection: 'row'}}>
                 {item.tran_type =='Debit'? <Feather name="arrow-down-left"
                 size={30} color="#ea3372" marginLeft={5}/> : <Feather name="arrow-up-left"
                 size={30} color="#09d97b" marginLeft={5}/>}

                 <View style={{marginTop:-5, marginLeft:5}}>
                     <Text style={{fontFamily:'_semiBold',
                     color:'#777', fontSize:15, marginTop: 5}}>{item.transac_nature}</Text>
                     
                   </View>
               </View>
                 
               {/* text */}
               <View style={{flexDirection:'row'}}>
                        <Text></Text>
                       <Text style={{fontFamily:'_semiBold', fontSize:15, marginBottom: 5, textAlign:'right'}}>
                       {item.tran_type =='Debit'? '-' : '+'}{item.currency_level =='2' ? <NumberDollarValueFormat value={item.amount} />:<NumberValueFormat value={item.amount} />}</Text>
                 </View>
               
             </View>
             
             <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:5}}>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa",}}>{moment(item.creditOn).format("DD/MM/YYYY hh:mm:ss")}</Text>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa"}}>{item.tran_type}</Text>    
             </View>
              </TouchableOpacity>
              
      </Animatable.View>  
  )
  // paypal flat list data here
  const paypalHistorySheet = ({ item, index }) => (
    <Animatable.View style={[styles.recentTransaction ,{flexShrink: 1,}]}
         animation="fadeInUpBig" useNativeDriver={true} key={item.index}>
           <TouchableOpacity style={styles.rowWrapper}
                 onPress={() =>{}}  key={index} >
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
               
              <View style={{flexDirection: 'row'}}>
                 {item.tran_type =='Debit'? <Feather name="arrow-down-left"
                 size={30} color="#ea3372" marginLeft={5}/> : <Feather name="arrow-up-left"
                 size={30} color="#09d97b" marginLeft={5}/>}

                 <View style={{marginTop:-5, marginLeft:5}}>
                     <Text style={{fontFamily:'_semiBold',
                     color:'#777', fontSize:15, marginTop: 5}}>{item.transac_nature}</Text>
                     
                   </View>
               </View>
                 
               {/* text */}
               <View style={{flexDirection:'row'}}>
                        <Text></Text>
                       <Text style={{fontFamily:'_semiBold', fontSize:15, marginBottom: 5}}>
                       {item.tran_type =='Debit'? '-' : '+'}{item.currency_level =='2' ? <NumberDollarValueFormat value={item.amount} />:<NumberValueFormat value={item.amount} />}</Text>
                 </View>
              </View>
             
             <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:5}}>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa",}}>{moment(item.creditOn).format("DD/MM/YYYY hh:mm:ss")}</Text>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa"}}>{item.tran_type}</Text>    
             </View>
             </TouchableOpacity>
             
     </Animatable.View>  
 )

 // paypal flat list data here
 const payoonerHistorySheet = ({ item, index }) => (
  <Animatable.View style={[styles.recentTransaction ,{flexShrink: 1,}]}
       animation="fadeInUpBig" useNativeDriver={true} key={item.index}>
         <TouchableOpacity style={styles.rowWrapper}
               onPress={() =>{}}  key={index} >
             <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
               
             <View style={{flexDirection: 'row'}}>
                 {item.tran_type =='Debit'? <Feather name="arrow-down-left"
                 size={30} color="#ea3372" marginLeft={5}/> : <Feather name="arrow-up-left"
                 size={30} color="#09d97b" marginLeft={5}/>}

                 <View style={{marginTop:-5, marginLeft:5}}>
                     <Text style={{fontFamily:'_semiBold',
                     color:'#777', fontSize:15, marginTop: 5}}>{item.transac_nature}</Text>
                     
                   </View>
               </View>
                 
               {/* text */}
                    <View style={{flexDirection:'row'}}>
                        <Text></Text>
                       <Text style={{fontFamily:'_semiBold', fontSize:15, marginBottom: 5}}>
                       {item.tran_type =='Debit'? '-' : '+'}{item.currency_level =='2' ? <NumberDollarValueFormat value={item.amount} />:<NumberValueFormat value={item.amount} />}</Text>
                 
                     </View>
              </View>
             
             <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:5}}>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa",}}>{moment(item.creditOn).format("DD/MM/YYYY hh:mm:ss")}</Text>
               <Text style={{fontFamily:'_semiBold', fontSize:10, color:"#aaa"}}>{item.tran_type}</Text>    
             </View>
           </TouchableOpacity>
           
   </Animatable.View>  
)




useEffect(() =>{
  loadMessages()
  paypalHistory()
  payoonerHistory()
},[isFocused, isPaypalLoading, isPayoonerLoading])

const handleRefreshPaypal = React.useCallback(() => {
  setIsRefreshing(true);
  paypalHistory()
  setTimeout(() => {
  setIsRefreshing(false);
  }, 2000);
}, []);

const handleRefreshPayoneer = React.useCallback(() => {
  setIsRefreshing(true);
  payoonerHistory()
  setTimeout(() => {
  setIsRefreshing(false);
  }, 2000);
}, []);
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
            <Text style={{fontFamily:"_regular", fontSize:13, color:colors.textSecColor}}></Text>
        </View>
      }
      </View>
    )
  }

         
  // footer
  const allRenderFooter =() =>{
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

  return (
    <ImageBackground style={{flex:1,}} source={bgImage} resizeMode='cover'>
        <SafeAreaView style={{flex:1}}>

              <StatusBar style='light' />

                  <HeaderMenu 
                    buttonHome={<TouchableOpacity
                    onPress={() =>navigation.openDrawer()}>
                        <View style={gs.homeSideMenu}>
                            {/* <Entypo name='sweden' size={23} color={colors.textColor}/> */}
                        </View>
                        </TouchableOpacity>}
                    titleName={'History'}
                    profileTitle={styles.profileTitle}
                  />
                 <View style={{marginBottom:30}}></View>
            
            <View style={{backgroundColor:colors.bgColor, flex:1,}}>
                <View style={{flexDirection:'row', justifyContent:'center', padding:10}}>
                    <CustomSmallButton 
                        buttonStyle={[category == 1? styles.actionButton: styles.actionBtn2]}
                        textStyle={ category == 1? styles.buttonSellText: {color:colors.primaryColor1} }
                        textLabel={'All'}
                        buttonAction={() => checkBtnClicked('1')}
                    />

                    <CustomSmallButton 
                        viewStyle={{ justifyContent:'center', alignItems:'center',
                        marginLeft:10
                        }}
                        buttonStyle={[category == 2 ? styles.actionButton : styles.actionBtn2 ]}
                        textStyle={[category == 2? styles.buttonSellText: {color:colors.primaryColor1}]}
                        textLabel={'PayPal'}
                        buttonAction={() => checkBtnClicked('2')}
                    />
                    <CustomSmallButton 
                        viewStyle={{
                        marginLeft:10
                        }}
                        buttonStyle={[category ==3 ? styles.actionButton  : styles.actionBtn2]}
                        textStyle={[category ==3 ? styles.buttonSellText : {color:colors.primaryColor1}]}
                        textLabel={'Payoneer'}
                        buttonAction={() => checkBtnClicked('3')}
                    />
                </View>

                
                {/* list view will come here for each tab clicked */}
                          {category == 1 &&
                          <FlatList 
                          data={fetchMessageData}
                          renderItem={allHistorySheet}
                          ListFooterComponent={renderFooter}
                          onEndReached={loadMessages}
                          onEndReachedThreshold={0.5}
                          showsVerticalScrollIndicator={false}
                          refreshing={isRefreshing}
                          onRefresh={handleRefresh}
                          />}
                            
                            {category == 2 &&
                            <FlatList 
                            data={fetchPaypalData}
                            renderItem={paypalHistorySheet}
                            ListFooterComponent={paypalRenderFooter}
                            onEndReached={paypalHistory}
                            onEndReachedThreshold={0.5}
                            //ListEmptyComponent={paypalEmptyList}
                            refreshing={isRefreshing}
                            onRefresh={handleRefreshPaypal}
                            />}
                            {category == 3 &&
                            <FlatList 
                            data={fetchPayoonerData}
                            renderItem={payoonerHistorySheet}
                            //ListFooterComponent={payoonerRenderFooter}
                            onEndReached={paypalHistory}
                            onEndReachedThreshold={0.5}
                            //ListEmptyComponent={paypalEmptyList}
                            refreshing={isRefreshing}
                            onRefresh={handleRefreshPayoneer}
                            />}

                            {!isLoading && category == 1 && fetchMessageData.length <1 ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                              <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textSecColor}}>No history at the moment</Text>
                            </View>:''}

                            {!isPaypalLoading && category == 2 && fetchPaypalData.length <1 ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                              <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textSecColor}}>No paypal history at the moment</Text>
                            </View>:''}

                            {!isPayoonerLoading && category == 3 && fetchPayoonerData.length <1 ? <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                              <Text style={{fontFamily:'_regular', fontSize:15, color:colors.textSecColor}}>No payooner history at the moment</Text>
                            </View>:''}
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
  
    recentTransaction:{
      borderRadius:10, 
      marginHorizontal: 15,
      backgroundColor: "#fff",
      paddingRight:10, 
      height: 70,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: -0.30,
      shadowRadius: 0.2,
      shadowColor: "#000",
      elevation: 0.1,
      marginBottom: 10,
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
    //borderColor: '#e3e3e3',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
    actionButtonView:{
      flex:1, height:70, 
      justifyContent:'center', 
      alignItems:'center', 
      padding:10, 
      flexDirection:'row', 
      borderRadius: 8, 
      marginBottom: 30
  },
   
    actionButton:{
      width:80, 
      height:35, 
      borderRadius:20, 
      backgroundColor:colors.primaryColor1, 
      justifyContent:'center', 
      alignItems:'center', 
      marginRight:10
  },
  actionBtn2:{
    width:80, 
    height:35,
    borderRadius:20,
    backgroundColor:'transparent', 
    borderColor:colors.primaryColor1, 
    borderWidth:1,
    justifyContent:'center', 
    alignItems:'center', 
    marginRight:10
  },

    buttonSellText:{
      color:colors.textColor, 
      fontFamily:'_semiBold', 
      fontSize:14
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


export default HistoryScreen;
