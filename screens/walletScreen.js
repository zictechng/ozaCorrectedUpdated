import React, { useContext, useState, useEffect, useRef }  from 'react';
import { Dimensions , StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView,Image, ImageBackground, ScrollView, RefreshControl,ActivityIndicator } from 'react-native';
import { gs,colors } from '../styles';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons,} from '@expo/vector-icons';
import moment from "moment";
import {windowWidth } from '../utils/Dimensions'
import bgImage from '../assets/images/app_land2.jpg';
import { PaymentIcon } from 'react-native-payment-icons';
import { NumberValueFormat } from '../components/formatValue';
import WalletChartData from '../model/walletChartData';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import Collapsible from 'react-native-collapsible';

import Carousel from 'react-native-snap-carousel';
import { NumberDollarValueFormat } from '../components/formatDollarValue';

const { width } = Dimensions.get('window');

const WalletScreen = ({navigation}) => {
    const isFocused = useIsFocused();
    
    const {userToken, userInfo, setUserInfo} = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [isWalletLoading, setIsWalletLoading] = useState(false)
    const [walletHistory, setWalletHistory] = useState([])
    const [walletBalance, setWalletBalance] = useState([])
    const [bonusTotalBalance, setBonusTotalBalance] = useState({})
    const [withdrawTotalBalance, setWithdrawTotalBalance] = useState({})
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [homeChartDisplay, setHomeChartDisplay] = useState(false);
    const [dataOption, setDataOption] = useState([]);
    const [dataPayoneer, setDataPayoneer] = useState([]);
    const [dataBitcoin, setDataBitcoin] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const [weeklyData, setWeeklyData] = useState('');
    const [monthlyData, setMonthlyData] = useState('');
    const [yearlyData, setYearlyData] = useState('');
    const [chartLoading, setChartLoading] = useState(false);
    const [chartDataLoading, setChartDataLoading] = useState(false);
    const [chartDetails, setChartDetails] = useState(false);

    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    //console.log("Active Slider", activeIndex)
    // open collapsed state
    const openCollapsedState = ()=>{
      setIsCollapsed(!isCollapsed)
    }
    const dataWallet = [
      { id: 1, 
        title: 'Current Funding Balance', 
        buttonTitle:'Fund Account', 
        image: require('../assets/images/money_ex.png'),
        iconType: <Ionicons name='add' size={20} color='#fff'/>,
        btnTittle:'Add Fund', 
        amt: userInfo.userData.amount? userInfo.userData.amount : '0.0',
      },
      { id: 2, 
        title: 'Bonus Balance', 
        image: '' ,
        buttonTitle:'Withdraw', 
        iconType: <Ionicons name='arrow-down-outline' size={20} color='#fff'/>,
        btnTittle:'Withdraw',

        userAmt: userInfo.userData.all_bonus_acct? userInfo.userData.all_bonus_acct : '0.0',
        amtBalance: userInfo.userData.all_withdraw_acct? userInfo.userData.all_withdraw_acct : '0.0',
      },
    ];


    const redirectionButton =(data) =>{
      if(data == 0 )
      {
        navigation.navigate('Add-fund')
      }
      else if(data == 1)
      {
        navigation.navigate('withdraw-fund')
      }
      else{
        alert('Sorry, something went wrong!')
      }
    }

    useEffect(() =>{
      fetchDataChart()
      //walletID()
    },[])

    // fetch chart data
           const fetchDataChart = async()=>{
            myId = userInfo.userData._id
            if(myId == '' || myId == null){
             //console.log('Access denied')
             return console.log('Access denied')
            }
             try{
              setChartDataLoading(true)
             const recentChart = await client.get('/api/chart_transactions/'+myId,{
                 headers: {
                     'Authorization': 'Bearer '+userToken,
                         }
                 })
                 console.log('Data 1 ', result)
                 if(recentChart.data.msg =='201'){
                  let result = recentChart.data;
                  console.log('Data ', result)
                  const objArr = recentChart.data; 
                  setDataOption(objArr.paypal[0]?.totalAmount) 
                  setDataPayoneer(objArr.payoneer[0]?.totalAmount)
                  setDataBitcoin(objArr.bitcoin[0]?.totalAmount)
                  
                  }
                    const objArr = recentChart.data;
                    console.log(objArr.paypal.length)
                    if(objArr.paypal.length < 1 && objArr.payoneer.length < 1 && objArr.bitcoin.length < 1) {
                    setHomeChartDisplay(true);    
                    }
                    if(objArr.paypal.length > 0 || objArr.payoneer.length > 0 || objArr.bitcoin.length > 0) {
                    setHomeChartDisplay(false);    
                    }
          
                 else if(recentChart.data.status == '402'){
                     //console.log('Login failed')
                     return
                 }
                 else if(recentChart.data.status == '404'){
                     console.log('No chart data ',)
                  }
                 else{
                     console.log('chart balance')
                 }
                 }catch (e){
                 console.log(e.message);
                 }
                 finally{
                  setChartDataLoading(false);
                 }
          
             }
    // fetching all history base on paypal transaction with pagination
    const getWalletHistory = async() =>{
         setIsLoading(true);
          try {
            const res = await client.get('/api/history-wallet/'+userInfo.userData.tag_id,{
                headers: {
                    'Authorization': 'Bearer '+userToken,
                        }
                })
            //console.log("response: " + res);
          if(res.data.length > 0){
            setWalletHistory(res.data)
             }
          else{
            console.log('No record found')
          }

          } catch (error) {
            console.log(error.message);
          } finally {
            setIsLoading(false);
           }
         }

       // fetching all history base on paypal transaction with pagination
    const getWalletBalance = async() =>{
        setIsWalletLoading(true);
         try {
           const res = await client.get('/api/user_Wallet_summary/'+userInfo.userData.tag_id,{
               headers: {
                   'Authorization': 'Bearer '+userToken,
                    }
               })
           
            if(res.data.msg =='201'){
            let result = res.data.feedback;
            let resultData = res.data;
            let bonusResult = res.data.feedbackBonus;
            //console.log('all result ', bonusResult)
            setBonusTotalBalance(bonusResult)
            setWalletBalance(result)
            setWithdrawTotalBalance(res.data.feedbackWithdraw)
            //console.log("response: " + JSON.stringify( res.data.feedback));
            }
         else{
           console.log('No record found')
         }

         } catch (error) {
           console.log(error.message);
         } finally {
            setIsWalletLoading(false);
          }    
        }

    // refresh user details from db after any operation into the database
    const RefreshUserDetails = async()=>{
      //console.log("Refresh ID ", data)
    try {
        const res = await client.get('/api/userProfileMobile/'+userInfo.userData._id,{
          headers: {
              'Authorization': 'Bearer '+userToken,
                  }
          })
        if(res.data.msg == '200'){
          const userDetails = res.data; 
          const appDataInfo = res.data.appData;
          //console.log('User Details fetch local storage ', res.data)
          AsyncStorage.setItem('userInfo', JSON.stringify(userDetails));
          AsyncStorage.setItem('AppSettingData', JSON.stringify(appDataInfo));
         }
         let userInfoDetails = await AsyncStorage.getItem('userInfo');
         let appInfoDetails = await AsyncStorage.getItem('AppSettingData');
            userInfoDetails = JSON.parse(userInfoDetails)
            appInfoDetails = JSON.parse(appInfoDetails)
        if(userInfoDetails){
          setUserInfo(userInfoDetails);
         // console.log('User Details fetch local storage ')
        }
        else{
            console.log("something went wrong while fetching user details")
        }
    } catch (error) {
        console.log( 'fetching user information failed ', error.message)
    }   
  }

  // get latest transaction details
    const fetchData = async()=>{
  myId = userInfo.userData._id
  if(myId == '' || myId == null){
   console.log('Access denied')
   return console.log('Access denied')
  }
  setChartLoading(true)
   try{

   const recentChart = await client.get('/api/chart_transactions/'+myId,{
       headers: {
           'Authorization': 'Bearer '+userToken,
               }
       })
       if(recentChart.data.msg =='201'){
        let result = recentChart.data;
        const objArr = recentChart.data; 
        setWeeklyData(result.weekly) 
        setMonthlyData(result.monthly)
        setYearlyData(result.yearly)
         //console.log('Yes ', result.yearly) 
         if(result.weekly == '0' && result.monthly == '0' && result.yearly == '0') {
          setHomeChartDisplay(true);
         } 
         else if(result.weekly != '0' || result.monthly != '0' || result.yearly != '0' ) {
          setHomeChartDisplay(false);
         } 
       }
       else if(recentChart.data.status == '402'){
           //console.log('Login failed')
           return
       }
       else if(recentChart.data.status == '404'){
           console.log('No chart data ',)
        }
       else{
           console.log('chart balance')
       }
       }catch (e){
       console.log(e.message);
       }
       
       finally{
        setChartLoading(false);
       }
       
    }

   useEffect(() =>{
    getWalletBalance()
    getWalletHistory();
    RefreshUserDetails();
    fetchData()
    fetchDataChart()
    //walletID()
  },[isFocused])
   //console.log('Weekly ', weeklyData)
        //page refreshing function goes here
      const handleRefresh = React.useCallback(() => {
        setIsRefreshing(true);
        RefreshUserDetails()
        getWalletBalance()
        getWalletHistory()
        fetchData()
        setTimeout(() => {
        setIsRefreshing(false);
        }, 1000);
      }, []);


       //xAxisLabelTexts={['PayPal', 'Payoneer', 'Bitcoin']}
       const dataChart=[{value:dataOption == null ? 0 : dataOption, label: 'PayPal'}, {value:dataPayoneer == null ? 0:  dataPayoneer, label:'Payoneer'}, {value:dataBitcoin == null ? 0 : dataBitcoin, label:'Bitcoin'}]


      const renderItem = ({ item }) => (
        <View style={{flex: 1, borderRadius:8, marginTop:15, backgroundColor:colors.primaryColor1,
          shadowRadius:5, shadowColor:'#000', shadowOffset:{width: 0,
              height:2,}, shadowOpacity: 0.23, elevation: 1, height: 130, marginBottom:10}}>
              <ImageBackground source={item.image} resizeMode='cover' imageStyle={{opacity: 0.3}} style={{flex:1}}>
                  
                      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
      
                          <View style={{marginHorizontal:10, marginTop:10}}>
                              <Text style={{fontFamily:'_semiBold', fontSize:13, color:colors.bgColor}}>{item.title} </Text>
                              <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textColor, marginBottom: 8}}>
                                {/* <NumberValueFormat value={walletBalance[0]?.totalAmount? walletBalance[0]?.totalAmount : '0.0'} /> */}
                                
                                {item.id == 1 && item.amt > 100000000 ? <Text>{'\u20A6'}100M</Text> : item.id == 1 && item.amt < 100000000 ? <Text><NumberValueFormat value={item.amt} /></Text> : item.id == 2 && item.userAmt > 100000000 ? <Text>$100M</Text>: item.id == 2 && item.userAmt < 100000000 ? <Text><NumberDollarValueFormat value={item.userAmt} /></Text> : <Text>0.00</Text>}
                                
                                </Text>
                          </View>
                              <View style={{marginHorizontal:5, flexDirection:'row', alignItems:'center', justifyContent:'center' }}>
                                  <PaymentIcon type='master' width={30}/>
                              </View>
                          </View>
                            <View style={{marginHorizontal:5, flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                              <TouchableOpacity onPress={() => redirectionButton(activeIndex)} style={{backgroundColor:'transparent', borderColor:'#fff', borderWidth:1, borderRadius:10, height:30, justifyContent:'center', alignItems:'center'}}>
                                <View style={{flexDirection:'row', marginHorizontal:10}}>
                                  <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textColor}}>{item.buttonTitle}  </Text>
                                  {item.iconType}
                                </View>
                              </TouchableOpacity>  
                          </View>
              </ImageBackground>
            </View>
            );
     
      const data=[{value:weeklyData == '0' ? 0: weeklyData, label: 'Weekly'}, {value:monthlyData == '0'? 0: monthlyData, label:'Monthly'}, {value:yearlyData == '0' ? 0 : yearlyData, label:'Yearly'}]
         
  return (
    <ImageBackground style={{flex:1}} source={bgImage} resizeMode='cover'>
        <SafeAreaView style={{flex:1}}>

        <StatusBar style='light' />

                <View style={gs.homeHeaderRow}>
                    <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                        <TouchableOpacity
                        onPress={() => navigation.goBack()}>
                            <View style={[gs.homeSideMenu, {borderWidth: 0}]} >
                                <Ionicons name='arrow-back' size={23} color={colors.textColor} />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.profileTitle}>My Wallet</Text>
                        <Text></Text>
                        {/* <TouchableOpacity style={gs.homeSideMenu}>
                            <Feather name='bell' size={20} color={colors.textColor}/>
                            
                        </TouchableOpacity> */}
                    </View>
                    <View style={{marginBottom:30}}></View>
                 </View>
            
            <View style={{backgroundColor:colors.bgColor, flex:1,}}>
                        
            <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:20}}
                  refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
              
              {/* <View style={{flex: 1, borderRadius:8, marginTop:15, backgroundColor:colors.primaryColor1,
              shadowRadius:5, shadowColor:'#000', shadowOffset:{width: 0,
                  height:2,}, shadowOpacity: 0.23, elevation: 1, height: 80}}>
                    <ImageBackground source={background} resizeMode='cover' imageStyle={{opacity: 0.3}} style={{flex:1}}>
                      
                            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>

                              <View style={{marginHorizontal:10, marginTop:10}}>
                                  <Text style={{fontFamily:'_semiBold', fontSize:13, color:colors.bgColor}}>Current Wallet Balance </Text>
                                  <Text style={{fontFamily:'_bold', fontSize:30, color:colors.textColor, marginBottom: 8}}>
                                    
                                    <NumberValueFormat value={userInfo.userData.amount? userInfo.userData.amount : '0.0'} />
                                    </Text>
                              </View>
                                  <View style={{marginHorizontal:5, flexDirection:'row', alignItems:'center' }}>
                                      <TouchableOpacity onPress={() =>navigation.navigate('FundAccount')}>
                                      <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textColor}}>Add Fund </Text>
                                      </TouchableOpacity>
                                      
                                      <PaymentIcon type='master' width={30}/>
                                  </View>
                      </View>
                  </ImageBackground>
                  
              </View> */}
                {/* Wallet slider here */}
                <View>
                    <Carousel
                      ref={carouselRef}
                      data={dataWallet}
                      renderItem={renderItem}
                      sliderWidth={windowWidth -40} // - 40 means subtract 20 from left margin, 20 from right margin
                      itemWidth={width * 0.8}
                      onSnapToItem={(index) => setActiveIndex(index)}
                    />
                  </View>

                {activeIndex == 0 &&
                  <View>
                    {/* Wallet Chart data goes here */}
                    
                        <View style={styles.chartView}>
                            {/* <WalletChartData /> */}
                              <View style={{marginTop: 20}}></View>
                                {chartLoading ? <ActivityIndicator size={'large'} color={colors.primaryColor1} />
                                :
                                  ! chartDetails &&
                                    <BarChart
                                        key={'xyz'}
                                        hideRules={true}
                                        barBorderTopLeftRadius ={5}
                                        barBorderTopRightRadius ={5}
                                        xAxisColor ="lightgrey"
                                        frontColor="#1D2667"
                                        yAxisColor ="lightgrey"
                                        noOfSections={5}
                                        height={250}
                                        spacing={25}
                                        isAnimated ={true}
                                        animationDuration={800}
                                        animationEasing={'Easing.ease'}
                                        barWidth={41}
                                        data = {data}
                                        xAxisLabelTextStyle={styles.chartText}
                                    />
                                  }
                                    
                        </View>

                    {/* recent added fund map list here */}
                  
                    {!isLoading && walletHistory.map((item, index) => (
                    
                    <TouchableOpacity style={[styles.historyMainView,{ marginBottom:15}]} onPress={()=>{}}
                    key={index}>
                            <View style={styles.historyView}>
                             <View style={{marginHorizontal:10, marginTop:5, flexDirection:'row'}}>
                                <Feather name="arrow-up-left" size={30} color="#09d97b"/>
                                  <View style={{flexDirection:'column'}}>
                                    <Text style={styles.historyTextDate}>{moment(item.creditOn).format("DD/MM/YYYY hh:mm:ss")}</Text>
                                    <Text style={[styles.historyTextStatus, {marginRight:5}]}>{item.fund_type}</Text>
                                  </View>
                                    
                              </View>
                                    <View style={styles.historyViewIn}>
                                        <View style={{flexDirection:'column'}}>
                                        <Text style={styles.historyAmtText}><NumberValueFormat value={item.amount} /></Text>
                                        <Text style={[styles.historyTextStatus, {fontSize:10, marginBottom:-10}]}>{item.fund_status}</Text>
                                        </View>
                                      
                                    </View>
                                
                            </View>
                                
                    </TouchableOpacity>
                        ))}
                  </View>
                  }

                    {!chartLoading && walletHistory.length < 1 &&
                      <View>
                          <Text style={{fontFamily:'_regular', fontSize:14, color:colors.textSecColor, textAlign:'center'}}>No recent transaction at the moment</Text>
                      </View>
                      }
                  {/* bonus summary block */}
                {activeIndex == 1 &&
                  <View style={{flex: 1, flexDirection:'row', justifyContent:'center', alignItems:'center', marginHorizontal:5}}>
                        
                        <View style={{flex: 1, borderRadius:8, marginTop:15, backgroundColor:colors.colorWhite,
                              shadowRadius:5, shadowColor:'#000', shadowOffset:{width: 0,
                            height:2,}, shadowOpacity: 0.23, elevation: 1, marginBottom:10, marginLeft:8}}>
                                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:5}}>
                                    <View style={{marginHorizontal:5, marginTop:10}}>
                                        <Text style={{fontFamily:'_semiBold', fontSize:13, color:colors.lightHl}}>{'Pending Bonus'} </Text>
                                        <Text style={{fontFamily:'_bold', fontSize:23, color:colors.lightBg, marginBottom: 8}}>
                                          {/* <NumberValueFormat value={walletBalance[0]?.totalAmount? walletBalance[0]?.totalAmount : '0.0'} /> */}
                                            {bonusTotalBalance == 0 || bonusTotalBalance == null ? '$0.00' : bonusTotalBalance > 1000000 ? <Text>$1M</Text> : <NumberDollarValueFormat value={bonusTotalBalance} />}
                                          </Text>
                                          <Text style={{fontFamily:'_regular', fontSize:11, color:colors.textSecColor, marginBottom: 8}}>
                                            Current pending bonus balance
                                          </Text>
                                    </View>
                              </View>
                        </View>

                            <View style={{flex: 1, borderRadius:8, marginTop:15, backgroundColor:colors.colorWhite,
                                shadowRadius:5, shadowColor:'#000', shadowOffset:{width: 0,
                                height:2,}, shadowOpacity: 0.23, elevation: 1, marginBottom:10, marginLeft:8}}>
                             <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
                                <View style={{marginHorizontal:5, marginTop:10}}>
                                    <Text style={{fontFamily:'_semiBold', fontSize:13, color:colors.lightHl}}>{'Total Withdraw'} </Text>
                                    <Text style={{fontFamily:'_bold', fontSize:23, color:colors.lightBg, marginBottom: 5}}>
                                      {/* <NumberValueFormat value={walletBalance[0]?.totalAmount? walletBalance[0]?.totalAmount : '0.0'} /> */}
                                      {withdrawTotalBalance == 0 || withdrawTotalBalance == null ? '$0.00' : withdrawTotalBalance > 1000000 ? <Text>$1M</Text> : <NumberDollarValueFormat value={withdrawTotalBalance} />}
                                      </Text>
                                      <Text style={{fontFamily:'_regular', fontSize:11, color:colors.textSecColor, marginBottom: 8}}>
                                        All time Withdrawal from your account.
                                      </Text>
                                </View>                                    
                            </View>
                          </View>                          
                  </View>
                }


                 {/* Chart data goes here */}
                  <View style={[styles.recentTranView, {marginTop: 15, marginHorizontal:5}]}>
                    <Text style={styles.recentTranText}>Transactions Flow</Text>
                    {!homeChartDisplay &&
                    <TouchableOpacity onPress={() => openCollapsedState()}>
                        <View style={{width:50, height:50, justifyContent:'center', alignItems:'center', marginTop:-15}}>
                          {isCollapsed ? <Ionicons name="stats-chart-sharp" size={20} color={colors.primaryColor1} />: <Ionicons name="stats-chart-sharp" size={20} color={colors.textSecColor} />}
                        </View>
                    
                    </TouchableOpacity> }
                </View>
                    <Collapsible collapsed={isCollapsed}>
                          <View style={{marginTop:10, borderColor: '#dededc', marginBottom:5}}>
                              <View style={styles.chartView}>
                                {chartDataLoading ? <ActivityIndicator size={'large'} color={colors.primaryColor1} />:
                                <BarChart
                                    key={'xyz'}
                                    hideRules={true}
                                    barBorderTopLeftRadius ={5}
                                    barBorderTopRightRadius ={5}
                                    xAxisColor ="lightgrey"
                                    frontColor="#1D2667"
                                    yAxisColor ="lightgrey"
                                    noOfSections={5}
                                    height={250}
                                    spacing={25}
                                    isAnimated ={true}
                                    animationDuration={800}
                                    animationEasing={'Easing.ease'}
                                    barWidth={41}
                                    data = {dataChart}
                                    xAxisLabelTextStyle={styles.chartText}
                                />
                                }
                            </View>    
                        </View>
                              
                    </Collapsible>
                    {isCollapsed &&<View style={{marginTop:20}}>
                    
                    {/* <LineChart data = {data} />
                    <PieChart data = {data} />
                    <PopulationPyramid data = {[{left:10,right:12}, {left:9,right:8}]} /> */}

                    </View>}
                  
              </ScrollView> 
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
    chartText:{
      fontFamily:'_regular', 
      fontSize:14, 
      color:colors.darkBg
  },
    recentTranView:{
      flex: 1, 
      justifyContent:'space-between', 
      flexDirection:'row', 
      marginBottom: 10, 
      marginTop: 40,
      marginHorizontal:5,
  },
  recentTranText:{
      fontFamily:'_regular', 
      fontSize:15, 
      color:colors.fadeText
  },
    chartText:{
      fontFamily:'_regular', 
      fontSize:14, 
      color:colors.darkBg
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
    chartView:{
        justifyContent:'center', 
        alignItems:'center', 
        padding:10, 
        borderRadius: 10
    },
    recentChartText:{
        fontFamily:'_semiBold', 
        fontSize:14, 
        color:colors.textSecColor
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

    recentTranView:{
        flex: 1, 
        justifyContent:'space-between', 
        flexDirection:'row', 
        marginBottom: 5, 
        marginTop: 20
    },
    recentTranText:{
        fontFamily:'_regular', 
        fontSize:14, 
        color:colors.lightBg
    },
    historyMainView:{
        flex: 1, 
        borderRadius:10, 
        backgroundColor:colors.textColor,
        height: 70,
        justifyContent:'center'
    },
    historyView:{
        flexDirection:'row', 
        justifyContent:'space-between', 
        marginBottom:2
    },
    historyTextDate:{
        fontFamily:'_semiBold', 
        fontSize:13, 
        color:colors.textSecColor,
        marginLeft:5
    },
    historyTextStatus:{
        fontFamily:'_bold', 
        fontSize:13, 
        color:colors.lightHl, 
        marginBottom: 8,
        marginRight: 5,
    },
    historyViewIn:{
        marginHorizontal:5, 
        flexDirection:'row', 
        alignItems:'center'
    },
    historyAmtText:{
        fontFamily:'_semiBold', 
        fontSize:17, 
        color:colors.lightBg
    },

    
    carouselItem: {
      backgroundColor: colors.primaryColor1,
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
    },
    image: {
      width: 300,
      height: 150,
      borderRadius: 10,
      },
    title: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: 'bold',
    },
})


export default WalletScreen;
