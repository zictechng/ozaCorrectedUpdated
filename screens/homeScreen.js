import React , {useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { useIsFocused, useFocusEffect} from '@react-navigation/native';
import { 
    Dimensions, 
    View, 
    Text,
    StyleSheet, 
    ScrollView,
    SafeAreaView,
    TouchableOpacity, 
    Modal, 
    Image, 
    ImageBackground,
    RefreshControl,
    StatusBar, 
    Alert,
    Button,
    ActivityIndicator,
    Linking,
    Pressable} from 'react-native';
import Collapsible from 'react-native-collapsible';
//import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, Entypo } from '@expo/vector-icons';
import { gs, colors } from '../styles';
import { PaymentIcon } from 'react-native-payment-icons';
import background from '../assets/images/sec1.png';
const { width } = Dimensions.get('window');
import {windowWidth } from '../utils/Dimensions'
import BannerSlider from '../components/BannerSlider';
import moment from "moment";
import { sliderData } from '../model/data';
import ChartData from '../model/chartData';
import BottomWarning from '../components/bottomWarning';
import { useNavigation } from '@react-navigation/native';
import RBSheet from "react-native-raw-bottom-sheet";
import BottomSheet from 'react-native-simple-bottom-sheet';
import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';
import SellBottomSheet from '../components/sellBottomSheet';
import BuyBottomSheet from '../components/buyBottomSheet';
import RateBottomSheet from '../components/rateBottomSheet';
import HeaderMenu from '../components/headerMenu';
import { AuthContext } from '../contextAPI/authContext';
import * as Updates from 'expo-updates';
import FirstWord from '../components/firstWord';
import { 
    AppModeModal,
    CheckRegistrationStage,  
    NumberValueFormat, 
    ShowLogoutModal, 
    ShowUpdateModal, 
    _AppSystemSettings, 
    accessCheck} from '../components/controls';
import client from '../contextAPI/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import { noticeData } from '../components/errorNotice';
import HTMLView from 'react-native-htmlview';
import { BarChart } from "react-native-gifted-charts";
import Carousel from 'react-native-snap-carousel';

const HomeScreen = ({navigation}) =>{
    const isFocused = useIsFocused();
    
    const {logoutAction, userToken, userInfo, setUserInfo, appSettingDetails, setAppSettingDetails, completeRegData, setCompleteRegData,
        logoutModal, setLogoutModal} = useContext(AuthContext)
    const [recentTranData, setRecentTranData] = useState([]);
    const [noTransaction, setNoTransaction] = useState(false);
    const [notifications, setNotification] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [statusBarState, setStatusBarState] = useState(false);
    const [dataOption, setDataOption] = useState([]);
    const [dataPayoneer, setDataPayoneer] = useState([]);
    const [dataBitcoin, setDataBitcoin] = useState([]);
    const [homeChartDisplay, setHomeChartDisplay] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [appMode, setAppMode] = useState(false);
    const [appModeMessage, setAppModeMessage] = useState('');
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    
    // _retrieveData = async () => {
    //     try {
    //       const value = await AsyncStorage.getItem('AppSettingData');
    //       if (value !== null) {
    //         // We have data!!
    //         const data2 = JSON.parse(value)
    //         //console.log(data2.app_paypayKey);
    //       }
    //     } catch (error) {
    //       // Error retrieving data
    //     }
    //   };
    
    const renderBanner = ({item, index}) => {
        return <BannerSlider data={item}/>
    }

    //Paystack test API key:  pk_test_b4c6f3d49923f1825caed0c704da954d67eac8b1
   
    // check if user token has expired or active here
    const checkUserToken = () =>{
        if(userInfo?.userData == null || userInfo?.userData == undefined){
            console.log("No ID send ",)
        }
        accessCheck(userInfo.userData?._id, userToken).then((res)=>{
            //console.log('success ', res);
            if(res == '402'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Session has expired! Login again to continue...',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                logoutAction();
                return
            }
            if(res == '401'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Authentication Failed',
                    textBody: 'Please! Login to continue...',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    logoutAction()
               return
            }
            if(res == '404'){
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'User not authorized',
                    textBody: 'Please! Sign up for a new account',
                    titleStyle: noticeData[0].errorTitleStyle,
                    textBodyStyle: noticeData[0].errorMessageStyle,
                    })
                    logoutAction()
               return
            }
        })
      }
      
    const refSellRBSheet = useRef();
    const refBuyRBSheet = useRef();
    // function that show only first name // First words in a sentence
    const myName = FirstWord(userInfo.userData?.display_name);
    //console.log('Application details ', appSettingDetails.app_payoneer_sale)
   
    // call logout function
    const signMeOut =() =>{
        logoutAction()
        setLogoutModal(false);
        }

    // action to close incomplete registration popup
        const closeIncompleteRegistration = () =>{
            setCompleteRegData(false);
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
            setAppSettingDetails(appInfoDetails)
           // console.log('User Details fetch local storage ')
          }
          else{
              console.log("something went wrong while fetching user details")
          }
      } catch (error) {
          console.log( 'fetching user information failed ', error.message)
      }   
    }
    const checkRegStage = CheckRegistrationStage();
    // get latest transaction details
    const latestTransaction = async()=>{
       myId = userInfo.userData?._id
       if(myId == '' || myId == null){
        console.log('Access denied')
        return console.log('Access denied')
       }
        try{
        const recentTransaction = await client.get('/api/recent_transactions/'+myId,{
            headers: {
                'Authorization': 'Bearer '+userToken,
                    }
            })
            if(recentTransaction.data.status == '402'){
                //console.log('Login failed')
                return
            }
            else if(recentTransaction.data?.length){
                //console.log('Yes ', recentTransaction.data)
                setRecentTranData(recentTransaction.data)
                setNoTransaction(false)
            }
            else{
                setNoTransaction(true)
            }
            }catch (e){
            console.log(e.message);
            }
        }

    const getMessageCount = async() =>{
        myId = userInfo.userData?._id
        try{
          const res = await client.get('/api/user_messageCount/'+myId,{
            headers: {
                'Authorization': 'Bearer '+userToken,
                    }
            })
          let count = res.data.userMessage;
          //console.log('No Notification ', count)
          if(count > 0){
            //setNotification(res.data)
            setNotification(res.data.userMessage)
           // console.log('No Notification 2 ', res.data)
          }
          else if(res.data.status == '404') {
            //console.log('No unread Notification')
            setNotification(0)
             }
        
        }catch (e){
          console.log('error ',e.message);
        }
      };
      
      const sellPaypalBtn =() =>{

        if(appSettingDetails?.app_paypal_sale == false){
        Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Sorry! This service is currently not available at the moment',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
            refSellRBSheet.current.close();
            return
        }
        else 
            {
            refSellRBSheet.current.close();
            navigation.navigate('SalesPage', 
            {pageName:'PayPal',
             categoryType: 'Sales',
            })
            
            }
      }
      const sellPayoonerBtn =() =>{
        if(appSettingDetails?.app_payoneer_sale == false){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Sorry! This service is currently not available at the moment',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                refSellRBSheet.current.close();
                return
        }
        else{
            refSellRBSheet.current.close();
            navigation.navigate('SalesPage', 
            {pageName:'Payoneer',
            categoryType: 'Sales'
            })
            }
       
      }
      const sellBtcBtn =() =>{
        if(appSettingDetails?.app_bitcoin_sale == false){
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Sorry! This service is currently not available at the moment',
                titleStyle: noticeData[0].errorTitleStyle,
                textBodyStyle: noticeData[0].errorMessageStyle,
                })
                refSellRBSheet.current.close();
                return
        }
        else{
            refSellRBSheet.current.close();
             navigation.navigate('SalesPage', 
             {pageName:'Bitcoin',
             categoryType: 'Sales'
            })
        }
        
      }

      // Add fund link
      const addFundNavigation =() =>{
        navigation.navigate('FundAccount')
        }

      // buying link
      const buyPaypalBtn =() =>{
        if(appSettingDetails?.app_paypal_buy == false){
            Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Sorry! This service is currently not available at the moment',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
            refBuyRBSheet.current.close();
            return
        }
        else{
            refBuyRBSheet.current.close();
            navigation.navigate('BuyPage',
            {
            pageName:'PayPal',
            categoryType: 'Buy',
            })
            }
        }

      const buyPayoneerBtn =() =>{
        if(appSettingDetails?.app_payoneer_buy == false){
            Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Sorry! This service is currently not available at the moment',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
            refBuyRBSheet.current.close();
            return
        }
        else{
            refBuyRBSheet.current.close();
             navigation.navigate('BuyPage', 
            {
                pageName:'Payoneer',
                categoryType: 'Buy',
            })
            }
    }

      const buyBtcBtn =() =>{
        if(appSettingDetails?.app_bitcoin_buy == false){
            Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Error',
            textBody: 'Sorry! This service is currently not available at the moment',
            titleStyle: noticeData[0].errorTitleStyle,
            textBodyStyle: noticeData[0].errorMessageStyle,
            })
            refBuyRBSheet.current.close();
            return
        }
        else{
            refBuyRBSheet.current.close();
            navigation.navigate('BuyPage', 
             {
            pageName:'Bitcoin',
            categoryType: 'Buy',
             })
            }
       }

// get app settings here
 _AppSystemSettings().then((res) => {
    // yes user can not login
    if(res?.app_operation_status == false){
    setAppMode(true)
    setAppModeMessage(res?.app_mode_message)
    }
    
    // No user can login
    else if(res?.app_operation_status == true){
    setAppMode(false)
    setAppModeMessage(res?.app_mode_message)
    }
    })
    
    // fetch chart data
       const fetchData = async()=>{
        myId = userInfo.userData._id
        if(myId == '' || myId == null){
         //console.log('Access denied')
         return console.log('Access denied')
        }
         try{
            setChartLoading(true)
         const recentChart = await client.get('/api/chart_transactions/'+myId,{
             headers: {
                 'Authorization': 'Bearer '+userToken,
                     }
             })
             if(recentChart.data.msg =='201'){
              let result = recentChart.data;
              
              const objArr = recentChart.data; 
              setDataOption(objArr.paypal[0]?.totalAmount) 
              setDataPayoneer(objArr.payoneer[0]?.totalAmount)
              setDataBitcoin(objArr.bitcoin[0]?.totalAmount)
              
              }
                const objArr = recentChart.data;
                //console.log(objArr.bitcoin.length)
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
                setChartLoading(false);
             }
      
         }

      useEffect(() =>{
        // check for new updates
        async function checkForUpdate() {
            try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                setIsUpdateAvailable(true);
                console.log('Update available')
            }
            } catch (error) {
            console.error('Error checking for updates:', error);
            }
        }
        checkForUpdate();

        //console.log(('Home ' ,userInfo.userData))
         if(isFocused && checkRegStage != 'true'){
             setCompleteRegData(true);
             RefreshUserDetails();
             //console.log('Incomplete registration Focus ', checkRegStage)
           }
           else{
            setCompleteRegData(false);
           }
           latestTransaction();
           getMessageCount();
           //accessCheck()
           checkUserToken()
           setStatusBarState(true);
           fetchData()
           _AppSystemSettings()
           
       }, [isFocused]) 

// this function will be called and redirect user to google app store to download new version
    const openPlayStore = () => {
        Linking.openURL('market://details?id=com.zictech.ozaapp')
          .catch(() => {
            // Fallback if Google Play Store is not available
            Linking.openURL('https://play.google.com/store/apps/details?id=com.zictech.ozaapp');
          });
       };

    //page refreshing function goes here
    const handleHomeRefresh = useCallback(() => {
        setIsRefreshing(true);
        RefreshUserDetails()
        getMessageCount()
        latestTransaction()
        checkUserToken();
        fetchData()
        setTimeout(() => {
        setIsRefreshing(false);
        }, 1000);
        RefreshUserDetails()
        _AppSystemSettings()
      }, []);

      // open collapsed state
      const openCollapsedState = ()=>{
        setIsCollapsed(!isCollapsed)
      }

      const closeModal = () =>{
        setLogoutModal(false);
      }

      //xAxisLabelTexts={['PayPal', 'Payoneer', 'Bitcoin']}
      const data=[{value:dataOption == null ? 0 : dataOption, label: 'PayPal'}, {value:dataPayoneer == null ? 0:  dataPayoneer, label:'Payoneer'}, {value:dataBitcoin == null ? 0 : dataBitcoin, label:'Bitcoin'}]

      return (
        
        <SafeAreaView style={{flex:1, backgroundColor:colors.bgColor}}>
                    {
                    isFocused &&
                    <StatusBar
                    barStyle={'dark-content'}
                    translucent
                    backgroundColor="transparent"/>
                    }
                
                {!appMode &&
                <>
                 <HeaderMenu 
                buttonHome={<TouchableOpacity onPress={() =>navigation.openDrawer()}>
                    <View style={gs.homeSideMenu}>
                        <Entypo name='sweden' size={23} color={colors.textColor}/>
                    </View>
                        </TouchableOpacity>}

                buttonLeft={<TouchableOpacity style={gs.homeSideMenu} onPress={() =>navigation.navigate('Message')} >
                <Feather name='bell' size={20} color={colors.textColor}/>
                    {notifications > 0 && 
                <View style={{position: "absolute", top: -1, right: -10, marginRight: 10, borderRadius:50, backgroundColor: colors.greenColor, width:8, height:8}}></View>}
                </TouchableOpacity>}/>
                
                <View style={[styles.LoginDivTitle, {marginHorizontal:20}]}>
                     <Text style={styles.loginTitle}>Hi {myName},</Text>
                    <HTMLView
                        value={appSettingDetails?.app_short_name}
                        stylesheet={styles.loginTitleDesc}/>
                    
                </View>
                
                <ScrollView showsVerticalScrollIndicator={true} style={{paddingHorizontal:20}}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleHomeRefresh} />
                      }>
                        <View style={styles.balanceStyle}>
                            <ImageBackground source={background} resizeMode='cover' imageStyle={{opacity: 0.3}} style={{flex:1}}>
                            
                                    <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8, marginVertical:10}}>

                                        <View style={{marginHorizontal:10, marginTop:10}}>
                                            <Text style={styles.balanceTitle}>All time transaction</Text>
                                            <Text style={styles.amtStyle}><NumberDollarValueFormat value={userInfo.userData?.tran_account}/></Text>
                                        </View>
                                        <View style={{flexDirection:'column', marginTop:10}}>
                                            <View style={{marginHorizontal:15, flexDirection:'row', justifyContent:'flex-end'}}>
                                                <Text style={{fontFamily:'_semiBold', fontSize:12, color:colors.textColor}}>Accepted</Text>
                                                <PaymentIcon type='master' width={30}/>
                                            </View>
                                            <View style={{justifyContent:'center', alignItems:'center', padding:15}}>
                                                <Text style={{color:'#fff', fontFamily:'_semiBold', fontSize:14}}>Bonus: <NumberDollarValueFormat value={userInfo.userData?.signup_account}/></Text>
                                            </View>
                                        </View>
                                    </View>                                 
                            
                             </ImageBackground>
                        
                        </View>

                    <View style={{flex:1, justifyContent:'center', alignItems:'center', padding:5}}>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecColor} />
                    </View>

                    {/* action buttons */}
                    <View style={styles.actionButtonView}>
                        
                        <TouchableOpacity style={styles.actionButton} onPress={() => refSellRBSheet.current.open()}>
                            <Text style={styles.buttonSellText}>Sell</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButtonAdd} onPress={() =>addFundNavigation()}>
                            <Text style={styles.buttonAddText}>Add</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButtonBuy} onPress={() => refBuyRBSheet.current.open()}>
                            <Text style={styles.buttonBuyText}>Buy</Text>
                        </TouchableOpacity>
                    </View>

                      {/* Chart data goes here */}
                    <View style={[styles.recentTranView, {marginTop: 15, marginHorizontal:15}]}>
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
                                    {chartLoading ? <ActivityIndicator size={'large'} color={colors.primaryColor1} />:
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
                           </View>
                                 
                        </Collapsible>
                        {isCollapsed &&<View style={{marginTop:20}}>
                        
                        {/* <LineChart data = {data} />
                        <PieChart data = {data} />
                        <PopulationPyramid data = {[{left:10,right:12}, {left:9,right:8}]} /> */}

                        </View>}
                     {/* Chart data goes here */}
                     {/* <Text style={styles.recentChartText}>Transactions Flow</Text>
                        <View style={styles.chartView}>
                            <ChartData />
                        </View> */}

                    {/* slider images and text */}
                    <View style={{marginVertical: 10,}}>
                        {/* <View style={{backgroundColor:colors.lightGreenColor2, height:130, borderRadius:10}}>
                            <View style={{flexDirection:'row', marginTop: 5, marginHorizontal:5, alignItems:'center'}}>
                                <Image source={productImage} style={{borderRadius:10, width:50, height:50}} />
                                <Text style={{marginLeft: 5, fontFamily:'_semiBold', fontSize:14}}>Awesome Rate with Bitcoin </Text>
                            </View>
                            <View style={{marginVertical:5, marginHorizontal:8}}>
                                <Text style={{marginLeft: 5, fontFamily:'_regular', fontSize:12}}>Enjoy amazing rate with your bitcoin sale with us selling your bitcoin, No better place than mappido </Text>
                            </View>
                            
                        </View> */}
                    </View>

                    <Carousel 
                        ref={(c) => { this._carousel = c; }}
                        data={sliderData}
                        renderItem={renderBanner}
                        sliderWidth={windowWidth -40} // - 40 means subtract 20 from left margin, 20 from right margin
                        itemWidth={280}
                        loop={true}
                    />

                    {/* recent transaction */}
                    <View style={styles.recentTranView}>
                        <Text style={styles.recentTranText}>Transactions</Text>
                        {}<TouchableOpacity onPress={() =>navigation.navigate('History')}>
                            <Ionicons name="chevron-forward-circle-sharp" size={30} color={colors.primaryColor1} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        
                    </View>

                    <ShowUpdateModal 
                        openModal={isUpdateAvailable}
                        animationType={'fade'}
                        modalTitle={'New Update!'}
                        ModalDesc={'A new version is available please, download latest update'}
                        logoutBtn={() => openPlayStore()}
                        modalBgColor={"rgba(0,0,0,0.6)"}
                        bntYesText={'Download Update'}
                    />

                    <View style={[styles.historyMainView2,{ marginBottom:15}]}>
                    {!noTransaction && recentTranData?.map((item, index) => (
                        
                        <TouchableOpacity style={styles.historyView} onPress={()=>navigation.navigate('History')}
                        key={index}>
                            <View style={{marginHorizontal:10, marginTop:15,}}>
                                <Text style={styles.historyTextDate}>{moment(item.creditOn).format("DD/MM/YYYY hh:mm:ss")}</Text>
                                <Text style={styles.historyTextStatus}>{item.transac_nature} {item.transaction_status}</Text>
                            </View>
                            <View style={styles.historyViewIn}>
                                <View>
                                <Text style={styles.historyAmtText}>
                                {item.currency_level =='2' ? <NumberDollarValueFormat value={item.amount} />:<NumberValueFormat value={item.amount} />}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={24} color={colors.textSecColor} />
                            </View>
                        </TouchableOpacity>
                            ))}
                    </View>

                    {noTransaction &&<View style={{marginBottom:30}}>
                        <Text style={{fontFamily:'_regular', fontSize:12, color:colors.textSecColor, textAlign:'center'}}>No recent transaction at the moment</Text>
                    </View>}

                    <View style={{marginTop:10, marginBottom:30}}>
                    </View>
                </ScrollView>

                {/* Bottom sheet here when sell button is click */}
                <RBSheet
                    ref={refSellRBSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    openDuration={500}
                    closeDuration={400}
                    height={350}
                    
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
                        
                    <SellBottomSheet 
                        titleText={'Sell'}
                        titleStyle={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}
                        buttonStyle={styles.bottomSheetButton}
                        imageIconPaypal={paypalImage}
                        imageIconPayooner={payoonerImage}
                        imageIconBitcoin={bitcoinImage}
                        imageStyle={styles.bottomSheetImageStyle}
                        buttonTextStyle={styles.bottomSheetButtonText}
                        buttonLabel_paypal={'PayPal'}
                        buttonLabel_payooner={'Payoneer'}
                        buttonLabel_bitcoin={'Bitcoin'}
                        onPress1={() => sellPaypalBtn() }
                        onPress2={() => sellPayoonerBtn()}
                        onPress3={() => sellBtcBtn()}
                    />
                </RBSheet>

                {/* Buy bottom sheet */}
                <RBSheet
                    ref={refBuyRBSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    openDuration={500}
                    closeDuration={400}
                    height={350}
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
                        
                    <BuyBottomSheet 
                        titleText={'Buy'}
                        titleStyle={{fontFamily:'_semiBold', fontSize:25, color:colors.textBlack}}
                        buttonStyle={styles.bottomSheetButton}
                        imageIconPaypal={paypalImage}
                        imageIconPayooner={payoonerImage}
                        imageIconBitcoin={bitcoinImage}
                        imageStyle={styles.bottomSheetImageStyle}
                        buttonTextStyle={styles.bottomSheetButtonText}
                        buttonLabel_paypal={'PayPal'}
                        buttonLabel_payooner={'Payoneer'}
                        buttonLabel_bitcoin={'Bitcoin'}
                        onPress1={() => buyPaypalBtn()}
                        onPress2={() => buyPayoneerBtn()}
                        onPress3={() => buyBtcBtn()}
                    />
                        
                        {/* create custom component and add it */}
                </RBSheet>

                {/* Show current rate here... */}
                <BottomSheet isOpen={false}
                    sliderMinHeight={25}
                    wrapperStyle={{
                            backgroundColor: colors.textColor,
                        }}
                    innerContentStyle={{
                        backgroundColor: colors.textColor,
                    }}>
                        
                    {(onScrollEndDrag) => (
                    <ScrollView onScrollEndDrag={onScrollEndDrag}>
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
                    )}

                </BottomSheet>

                {/* show if user profile is not complete */}
                {completeRegData && <BottomWarning 
                closeBtn={<View style={{justifyContent:'flex-end', alignItems:'flex-end'}}>
                            <TouchableOpacity style={styles.closeBnt}
                            onPress={() => {closeIncompleteRegistration()}}>
                                <View style={styles.closeBtnView}>
                                    <Ionicons name="close" size={25} color={colors.textColor}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                icon={<Ionicons name="information-circle-outline" size={24} color={colors.textColor}/>}
                title={'Incomplete Profile'}
                subTitle={'Please, complete your account registration process to remove restrictions in your account.'}
                buttonText={'Okay'}
                buttonTextStyle={{color:colors.textColor, fontFamily:'_semiBold', fontSize:14}}
                buttonStyle={{borderRadius:50, borderColor:colors.lightGreenColor1, width:60, height:30, borderWidth:1, justifyContent:'center', alignItems:'center', marginBottom:20}}
                titleStyle={{marginLeft: 5, fontFamily:'_bold', fontSize:15, color:colors.bgColor}}
                subTitleStyle={{marginLeft: 5, fontFamily:'_regular', fontSize:12, color:colors.textColor}}
                onPress={() => navigation.navigate('SignupSteps')}
                bgColor={{backgroundColor:colors.primaryColor1}}
                />}

                {/* Call Logout modal function */}
                <ShowLogoutModal 
                    openModal={logoutModal}
                    animationType={'fade'}
                    modalTitle={'Caution!'}
                    ModalDesc={'Are you sure you want to logout ?'}
                    closeBtn={() => closeModal(!logoutModal)}
                    logoutBtn={() => signMeOut()}
                    modalBgColor={"rgba(0,0,0,0.5)"}
                    bntYesText={'Logout'}
                />
                 </>
                }

                {/* Show this when app is set to off mode from the admin */}
                {appMode && <View style={{flex: 1}}>
                    <AppModeModal 
                    openModal={appMode}
                    animationType={'slide'}
                    ModalShortDesc={'Application Error...'}
                    ModalDesc={appModeMessage}
                    closeBtn={() => signMeOut()}
                    logoutBtn={() => signMeOut()}
                    modalBgColor={"rgba(0,0,0,0.2)"}
                    bntYesText={'Okay'}
                    />
                </View>
                }
    </SafeAreaView>
        
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBnt:{
        borderRadius:50, 
        borderWidth:2, 
        borderColor:colors.primaryColor1, 
        backgroundColor:colors.primaryColor1, 
        marginHorizontal: 10
    },
    closeBtnView:{
        borderRadius:50, 
        borderWidth:2, 
        borderColor:colors.textColor, 
        backgroundColor:colors.primaryColor1, 
        justifyContent:'center', 
        alignItems:'center', 
        marginTop:-20
},
    balanceStyle:{
        flex: 1, 
        borderRadius:8, 
        height:100,
        backgroundColor:colors.primaryColor1,
        shadowRadius:10, 
        marginTop:20, 
        shadowColor:'#000', 
        shadowOffset:{
            width: 0,
            height: 10,
        }, 
        shadowOpacity: 0.23,
        elevation: 1
    },
        contentContainer: {
        flex: 1,
        alignItems: 'center',
      },
      balanceTitle:{
        fontFamily:'_semiBold', 
        fontSize:13, 
        color:colors.textSecColor
    },
    amtStyle:{
        fontFamily:'_bold', 
        fontSize:25, 
        color:colors.textColor, 
        marginBottom: 8
    },
    actionButtonView:{
        flex:1, height:100, 
        justifyContent:'center', 
        alignItems:'center', 
        padding:10, 
        flexDirection:'row', 
        borderRadius: 8, 
        marginBottom: 30
    },
    actionButton:{
        width:90, 
        height:40, 
        borderRadius:20, 
        backgroundColor:colors.primaryColor1, 
        justifyContent:'center', 
        alignItems:'center', 
        marginRight:10
    },
    actionButtonBuy:{
        width: 90,
        height:40, 
        borderRadius:20, 
        backgroundColor:colors.greenColor, 
        justifyContent:'center', 
        alignItems:'center', 
        marginRight:5
    },
    actionButtonAdd:{
        width:90,
        height:40, 
        borderRadius:20, 
        borderColor:colors.primaryColor2, 
        borderWidth:1, 
        justifyContent:'center', 
        alignItems:'center', 
        marginRight:10
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
    buttonSellText:{
        color:colors.textColor, 
        fontFamily:'_semiBold', 
        fontSize:15
    },
    buttonAddText:{
        color:colors.textColor1,
        fontFamily:'_semiBold', 
        fontSize:15
    },
    buttonBuyText:{
        color:colors.textColor,
        fontFamily:'_semiBold', 
        fontSize:15
    },
    checkboxText: {
        margin:0,
        marginRight:5,
        borderRadius:5,
        color:'lightgrey',
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
    bgImage:{
        position: 'absolute',
        width: 130,
        height: 90,
        bottom: -6,
        right: -10,
     },
     loginTitle:{
        fontFamily:'_bold', 
        fontSize:17, 
        color:'#333', 
     },
     loginTitleDesc:{
        fontFamily:'_regular',  
        fontSize:14, 
        color:'#aaa', 
     },
     LoginDivTitle:{
        marginBottom:10, 
        marginTop: 15,
    },
    recentChartText:{
        fontFamily:'_semiBold', 
        fontSize:14, 
        color:colors.textSecColor
    },
    chartText:{
        fontFamily:'_regular', 
        fontSize:14, 
        color:colors.darkBg
    },

    chartView:{
        justifyContent:'center', 
        alignItems:'center', 
        flexDirection:'row',
        //marginLeft:20, 
    },
    recentTranView:{
        flex: 1, 
        justifyContent:'space-between', 
        flexDirection:'row', 
        marginBottom: 10, 
        marginTop: 50
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
        height:70,
        justifyContent:'center',
        
    },
    historyMainView2:{
        flex: 1, 
        borderRadius:10, 
        backgroundColor:colors.textColor,
        justifyContent:'center',
        
    },
    historyView:{
        flexDirection:'row', 
        justifyContent:'space-between', 
        marginBottom:10
    },
    historyTextDate:{
        fontFamily:'_semiBold', 
        fontSize:13, 
        color:colors.textSecColor
    },
    historyTextStatus:{
        fontFamily:'_bold', 
        fontSize:13, 
        color:colors.lightHl, 
        marginBottom: 8
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


    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        width: '85%',
        height: 150,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 0.8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
      },
      button: {
        borderRadius: 8,
        padding: 8,
      },
      buttonOpen: {
        backgroundColor: '#F194FF',
      },
      buttonClose: {
        backgroundColor: '#ccc',
      },
      buttonYes: {
        backgroundColor: colors.primaryColor1,
      },
      textStyle: {
        color: 'white',
        textAlign: 'center',
        fontFamily:'_bold', 
        fontSize:13, 
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
        marginTop: -30
      },
    
  });

  export default HomeScreen;
