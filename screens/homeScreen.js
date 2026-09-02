import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ImageBackground, Dimensions,
  ActivityIndicator, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import RBSheet from 'react-native-raw-bottom-sheet';
import HTMLView from 'react-native-htmlview';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { _AppSystemSettings } from '../components/controls';
import { noticeData } from '../components/errorNotice';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import { NumberValueFormat } from '../components/formatValue';
import { windowWidth } from '../utils/Dimensions';
import HeaderMenu from '../components/headerMenu';
import SellBottomSheet from '../components/sellBottomSheet';
import BuyBottomSheet from '../components/buyBottomSheet';
import MoreBottomSheet from '../components/moreBottomSheet';
import { ShowUpdateModal, AppModeModal } from '../components/controls';
import {
  BuySellIcon,
  ElectricityIcon,
  TVIcon,
  ExamCardIcon,
  RewardsIcon,
} from '../components/bannerIcons';
const { width } = Dimensions.get('window');

const paypalImage = require('../assets/images/paypal1.png');
const payoonerImage = require('../assets/images/payooner2.png');
const bitcoinImage = require('../assets/images/bitcoin.png');
const background = require('../assets/images/sec3.png');

// ── Quick Action Button Component ─────────────────
const QuickActionBtn = ({ icon, label, onPress, color, bgColor, colors }) => (
  <TouchableOpacity style={styles.quickActionBtn} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickActionIcon, { backgroundColor: bgColor || colors.bgLight }]}>
      <Ionicons name={icon} size={22} color={color || colors.primaryColor1} />
    </View>
    <Text style={[styles.quickActionLabel, { color: colors.textBlack }]}>{label}</Text>
  </TouchableOpacity>
);

// ── Service Status Badge ──────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'paused') {
    return (
      <View style={[gs.badgeWarning, { marginTop: 4 }]}>
        <Text style={gs.badgeWarningText}>Maintenance</Text>
      </View>
    );
  }
  return null;
};

// ── Add this helper above HomeScreen ──────────────
const formatTranAmount = (item) => {
  const num = Number(item.amount || 0);
  if (item.currency_level === '2') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₦${num.toLocaleString('en-NG')}`;
};

// ── Bill Service Card Component ───────────────────
const BillServiceCard = ({ icon, label, color, bgColor, onPress, status, colors }) => {
  const isDisabled = status === 'paused';
  const isHidden = status === 'hidden';
  if (isHidden) return null;

  return (
    <TouchableOpacity
      style={[
        gs.billServiceCard,
        { backgroundColor: colors.bgCard },
        isDisabled && { opacity: 0.6 },
      ]}
      onPress={isDisabled ? null : onPress}
      activeOpacity={0.8}>
      <View style={[gs.billServiceIcon, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={[gs.billServiceLabel, { color: colors.textBlack }]}>{label}</Text>
      <StatusBadge status={status} />
    </TouchableOpacity>
  );
};

// ── Transaction Item Component ────────────────────
const TransactionItem = ({ item, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.transactionItem, { backgroundColor: colors.bgCard }]}
    onPress={onPress}
    activeOpacity={0.8}>
    <View style={styles.transactionLeft}>
      <View style={[
        styles.transactionIconBox,
        {
          backgroundColor: item.tran_type === 'Credit'  
            ? '#D1FAE5'
            : '#FEE2E2',
        },
      ]}>
        <Ionicons
          name={item.tran_type === 'Credit' ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={item.tran_type === 'Credit' ? colors.successColor : colors.dangerColor}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, { color: colors.textBlack }]} numberOfLines={1}>
          {item.transac_nature}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecColor }]}>
          {moment(item.creditOn).format('DD MMM YYYY • hh:mm A')}
        </Text>
      </View>
    </View>
    <View style={styles.transactionRight}>
      <Text style={[
        styles.transactionAmount,
        { color: item.tran_type === 'Credit' ? colors.successColor : colors.dangerColor },
      ]}>
        {item.tran_type === 'Credit' ? '+' : '−'}{formatTranAmount(item)}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
    </View>
  </TouchableOpacity>
);

// ── Main Home Screen ──────────────────────────────
const HomeScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const {
    userToken, userInfo, setUserInfo,
    appSettingDetails, setAppSettingDetails,
    completeRegData, setCompleteRegData,
    logoutModal, setLogoutModal,
  } = useContext(AuthContext);

  const refSellRBSheet = useRef();
  const refBuyRBSheet = useRef();
  const refMoreRBSheet = useRef();
  const carouselRef = useRef(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentTranData, setRecentTranData] = useState([]);
  const [noTransaction, setNoTransaction] = useState(false);
  const [appMode, setAppMode] = useState(false);
  const [appModeMessage, setAppModeMessage] = useState('');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [billServices, setBillServices] = useState({
    airtime: 'active',
    electricity: 'active',
    mobile_data: 'active',
    tv_subscription: 'active',
    exam_cards: 'active',
  });



const [sliderData] = useState([
  { id: 1, title: 'Buy & Sell Virtual Funds Instantly', desc: 'PayPal, Payoneer & Bitcoin at best rates', color: ['#4C5FD5', '#6C7FE8'], icon: 'swap-horizontal', BannerIcon: BuySellIcon },
  { id: 2, title: 'Pay Bills Easily', desc: 'Electricity & data at your fingertips', color: ['#00C896', '#00A87E'], icon: 'flash', BannerIcon: ElectricityIcon },
  { id: 3, title: 'TV Subscriptions', desc: 'DSTV, GOtv & Startimes — renew instantly', color: ['#8B5CF6', '#6D28D9'], icon: 'tv', BannerIcon: TVIcon },
  { id: 4, title: 'Exam Scratch Cards', desc: 'WAEC, NECO, JAMB & NABTEB instantly', color: ['#F59E0B', '#D97706'], icon: 'school', BannerIcon: ExamCardIcon },
  { id: 5, title: 'Earn Rewards', desc: 'Refer friends and earn bonus on every signup', color: ['#EF4444', '#DC2626'], icon: 'gift', BannerIcon: RewardsIcon },
]);

  const myName = userInfo?.userData?.fullname?.split(' ')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, ${myName} 👋`;
    if (hour < 17) return `Good Afternoon, ${myName} 👋`;
    return `Good Evening, ${myName} 👋`;
  };

  // ── Fetch Bill Services Status ──────────────────
  const fetchBillServicesStatus = async () => {
    try {
      const res = await client.get('/api/bills_services_status');
      if (res.data.msg === '200') {
        setBillServices(res.data.services);
      }
    } catch (error) {
      console.log('Bills services status error:', error.message);
    }
  };

  // ── Fetch Recent Transactions ───────────────────
  const latestTransaction = async () => {
    try {
      const res = await client.get('/api/latest_transaction/' + userInfo?.userData?._id, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setRecentTranData(res.data.data);
        setNoTransaction(res.data.data.length === 0);
      } else {
        setNoTransaction(true);
      }
    } catch (error) {
      console.log('Latest transaction error:', error.message);
      setNoTransaction(true);
    }
  };

  // ── Refresh User Details ────────────────────────
  const RefreshUserDetails = async () => {
    try {
      const res = await client.get('/api/userProfileMobile/' + userInfo?.userData?._id, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUserInfo(res.data);
      }
    } catch (error) {
      console.log('Refresh user error:', error.message);
    }
  };

  // ── Check User Token ────────────────────────────
  const checkUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) navigation.replace('Login');
    } catch (error) {
      console.log('Token check error:', error.message);
    }
  };

  // ── App System Settings ─────────────────────────
  useEffect(() => {
    _AppSystemSettings().then((res) => {
      if (res?.app_operation_status === false) {
        setAppMode(true);
        setAppModeMessage(res?.app_mode_message);
      } else {
        setAppMode(false);
      }
    });
  }, []);

  // ── On Screen Focus ─────────────────────────────
  useEffect(() => {
    if (isFocused) {
      latestTransaction();
      fetchBillServicesStatus();
    }
  }, [isFocused]);

  // ── Sign Out ────────────────────────────────────
  const signMeOut = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userInfo', 'AppSettingInfo']);
      navigation.replace('Login');
    } catch (error) {
      console.log('Sign out error:', error.message);
    }
  };

  // ── Pull to Refresh ─────────────────────────────
  const handleHomeRefresh = useCallback(() => {
    setIsRefreshing(true);
    RefreshUserDetails();
    latestTransaction();
    fetchBillServicesStatus();
    checkUserToken();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  // ── Close Incomplete Registration Banner ────────
  const closeIncompleteRegistration = () => setCompleteRegData(false);

  // ── Open Play Store ─────────────────────────────
  const openPlayStore = () => {
    Linking.openURL('market://details?id=com.ozaapp.mobile').catch(() =>
      Linking.openURL('https://play.google.com/store/apps/details?id=com.ozaapp.mobile')
    );
  };

  // ── Sell Navigation ─────────────────────────────
  const sellPaypalBtn = () => {
    if (appSettingDetails?.app_paypal_sell === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refSellRBSheet.current.close(); return;
    }
    refSellRBSheet.current.close();
    navigation.navigate('SalesPage', { pageName: 'PayPal', categoryType: 'Sell' });
  };

  const sellPayoonerBtn = () => {
    if (appSettingDetails?.app_payoneer_sell === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refSellRBSheet.current.close(); return;
    }
    refSellRBSheet.current.close();
    navigation.navigate('SalesPage', { pageName: 'Payoneer', categoryType: 'Sell' });
  };

  const sellBtcBtn = () => {
    if (appSettingDetails?.app_bitcoin_sell === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refSellRBSheet.current.close(); return;
    }
    refSellRBSheet.current.close();
    navigation.navigate('SalesPage', { pageName: 'Bitcoin', categoryType: 'Sell' });
  };

  // ── Buy Navigation ──────────────────────────────
  const buyPaypalBtn = () => {
    if (appSettingDetails?.app_paypal_buy === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refBuyRBSheet.current.close(); return;
    }
    refBuyRBSheet.current.close();
    navigation.navigate('BuyPage', { pageName: 'PayPal', categoryType: 'Buy' });
  };

  const buyPayoneerBtn = () => {
    if (appSettingDetails?.app_payoneer_buy === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refBuyRBSheet.current.close(); return;
    }
    refBuyRBSheet.current.close();
    navigation.navigate('BuyPage', { pageName: 'Payoneer', categoryType: 'Buy' });
  };

  const buyBtcBtn = () => {
    if (appSettingDetails?.app_bitcoin_buy === false) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Unavailable', textBody: 'This service is currently unavailable' });
      refBuyRBSheet.current.close(); return;
    }
    refBuyRBSheet.current.close();
    navigation.navigate('BuyPage', { pageName: 'Bitcoin', categoryType: 'Buy' });
  };

  // ── More Navigation ─────────────────────────────
  const addFundBtn = () => {
    refMoreRBSheet.current.close();
    navigation.navigate('Add-fund', { pageName: 'FundAccount', categoryType: 'Funding' });
  };

  const WithdrawBtn = () => {
    refMoreRBSheet.current.close();
    navigation.navigate('withdraw-fund', { pageName: 'WithdrawFund', categoryType: 'Withdraw' });
  };

  const walletBtn = () => {
    refMoreRBSheet.current.close();
    navigation.navigate('Wallet', { pageName: 'wallet', categoryType: 'Funding' });
  };

  // ── Carousel Banner Renderer ────────────────────
    const renderBanner = ({ item }) => (
  <LinearGradient
    colors={item.color}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.bannerSlide}>
    <View style={styles.bannerCircleLarge} />
    <View style={styles.bannerCircleSmall} />

    <View style={styles.bannerContent}>
      <View style={[
        styles.bannerIconBox,
        { backgroundColor: 'rgba(255,255,255,0.2)' }, 
      ]}>
        <Ionicons name={item.icon} size={16} color="#fff" />
      </View>
      <Text style={[styles.bannerTitle, { color: '#fff' }]}>
        {item.title}
      </Text>
      <Text style={[styles.bannerDesc, { color: 'rgba(255,255,255,0.85)' }]}>
        {item.desc}
      </Text>
    </View>

    <View style={styles.bannerImageContainer}>
      <item.BannerIcon />
    </View>
  </LinearGradient>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      {isFocused && (
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.bgColor}
        />
      )}

      {!appMode && (
        <>
                    {/* ── Header ─────────────────────────── */}
          <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
            <View>
              <Text style={[styles.greetingText, { color: colors.textBlack }]}>
                {getGreeting()}
              </Text>
              {appSettingDetails?.app_short_name ? (
                <HTMLView
                  value={appSettingDetails.app_short_name}
                  stylesheet={{
                    p: [styles.subGreetingText, { color: colors.textSecColor }],
                  }}
                />
              ) : (
                <Text style={[styles.subGreetingText, { color: colors.textSecColor }]}>
                  Welcome back
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.profileBtn, { backgroundColor: colors.bgLight }]}
              onPress={() => navigation.navigate('profile')}
              activeOpacity={0.8}>
              <Feather name="user" size={22} color={colors.primaryColor1} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.bgColor }]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleHomeRefresh}
                tintColor={colors.primaryColor1}
                colors={[colors.primaryColor1]}
              />
            }>

            {/* ── Balance Card ────────────────── */}
            <LinearGradient
              colors={[colors.primaryColor1, colors.primaryColor1b]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}>
              <ImageBackground
                source={background}
                resizeMode="cover"
                imageStyle={{ opacity: 0.08 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.balanceRow}>
                <View>
                  <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                    Available Balance
                  </Text>
                  <Text style={[styles.balanceAmount, { color: '#fff' }]}>                
                    ₦{Number(userInfo?.userData?.tran_account || 0).toLocaleString('en-NG')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.moreBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => refMoreRBSheet.current.open()}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={[
                styles.rewardsRow,
                { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.lg, padding: spacing.md }, 
              ]}>
                <View>
                  <Text style={[styles.rewardsLabel, { color: 'rgba(255,255,255,0.75)' }]}> 
                    Rewards Balance
                  </Text>
                  <Text style={[styles.rewardsAmount, { color: '#fff' }]}>                  
                    ₦{Number(userInfo?.userData?.signup_account || 0).toLocaleString('en-NG')}
                  </Text>
                </View>
                <View style={[
                  styles.balanceBadge,
                  { backgroundColor: 'rgba(255,255,255,0.15)' },                            
                ]}>
                  <Ionicons name="gift-outline" size={16} color={colors.accentGold} />
                  <Text style={[styles.balanceBadgeText, { color: '#fff' }]}>Bonus</Text>    
                </View>
              </View>
            </LinearGradient>

            {/* ── Quick Actions ───────────────── */}
                        <View style={[styles.quickActionsRow, { backgroundColor: colors.bgCard }]}>
              <QuickActionBtn
                icon="arrow-up-outline"
                label="Sell"
                color="#EF4444"
                bgColor="#FEE2E2"
                colors={colors}
                onPress={() => refSellRBSheet.current.open()}
              />
              <QuickActionBtn
                icon="arrow-down-outline"
                label="Buy"
                color="#10B981"
                bgColor="#D1FAE5"
                colors={colors}
                onPress={() => refBuyRBSheet.current.open()}
              />
              <QuickActionBtn
                icon="add-circle-outline"
                label="Fund"
                color={colors.primaryColor1}
                bgColor={colors.bgLight}
                colors={colors}
                onPress={addFundBtn}
              />
              <QuickActionBtn
                icon="wallet-outline"
                label="Wallet"
                color="#F0A500"
                bgColor="#FFF3CD"
                colors={colors}
                onPress={walletBtn}
              />
            </View>

            {/* ── Bill Services Section ───────── */}
            <View style={gs.sectionHeader}>
              <Text style={[gs.sectionTitle, { color: colors.textBlack }]}>Bill Payments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BillsHome')}>
                <Text style={[gs.sectionLink, { color: colors.primaryColor1 }]}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.billServicesGrid}>
                            <BillServiceCard
                icon="phone-in-talk"
                label="Airtime"
                color="#EC4899"
                bgColor="#FCE7F3"
                status={billServices.airtime}
                colors={colors}
                onPress={() => navigation.navigate('Airtime')}
              />
              <BillServiceCard
                icon="lightning-bolt"
                label="Electricity"
                color="#F59E0B"
                bgColor="#FEF3C7"
                status={billServices.electricity}
                colors={colors}
                onPress={() => navigation.navigate('Electricity')}
              />
              <BillServiceCard
                icon="wifi"
                label="Mobile Data"
                color="#3B82F6"
                bgColor="#DBEAFE"
                status={billServices.mobile_data}
                colors={colors}
                onPress={() => navigation.navigate('MobileData')}
              />
              <BillServiceCard
                icon="television-play"
                label="TV Sub"
                color="#8B5CF6"
                bgColor="#EDE9FE"
                status={billServices.tv_subscription}
                colors={colors}
                onPress={() => navigation.navigate('TVSubscription')}
              />
              <BillServiceCard
                icon="school-outline"
                label="Exam Cards"
                color="#10B981"
                bgColor="#D1FAE5"
                status={billServices.exam_cards}
                colors={colors}
                onPress={() => navigation.navigate('ExamCards')}
              />
            </View>

            {/* ── Promo Banner Carousel ───────── */}
            <View style={styles.carouselContainer}>
              <Carousel
                ref={carouselRef}
                data={sliderData}
                renderItem={renderBanner}
                sliderWidth={windowWidth - 40}
                itemWidth={windowWidth - 80}
                loop={true}
                autoplay={true}
                autoplayInterval={4000}
              />
            </View>

            {/* ── Recent Transactions ─────────── */}
            <View style={gs.sectionHeader}>
              <Text style={[gs.sectionTitle, { color: colors.textBlack }]}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={[gs.sectionLink, { color: colors.primaryColor1 }]}>View all</Text>
              </TouchableOpacity>
            </View>

            {noTransaction ? (
              <View style={gs.emptyStateContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.textSecColor2} />
                <Text style={[gs.emptyStateText, { color: colors.textSecColor }]}>
                No transactions yet
              </Text>
              <Text style={[gs.emptyStateSubText, { color: colors.textSecColor2 }]}>
                Your recent transactions will appear here
              </Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {recentTranData?.map((item, index) => (
                 <TransactionItem
                    key={index}
                    item={item}
                    colors={colors}
                    onPress={() => navigation.navigate('TranDetails', { record_id: item._id })}
                  />
                ))}
              </View>
            )}

            {/* ── Incomplete Registration Banner ─ */}
            {completeRegData && (
              <View style={[
                styles.incompleteCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.warningColor,             
                },
              ]}>
                <View style={styles.incompleteHeader}>
                  <View style={styles.incompleteIconRow}>
                    <Ionicons name="information-circle" size={22} color={colors.warningColor} />
                    <Text style={[styles.incompleteTitle, { color: colors.textBlack }]}>
                      Incomplete Profile
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeIncompleteRegistration}>
                    <Ionicons name="close-circle" size={22} color={colors.textSecColor} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.incompleteDesc, { color: colors.textSecColor }]}>
                  Complete your account registration to remove restrictions.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.incompleteBtn,
                    { backgroundColor: colors.primaryColor1 },
                  ]}
                  onPress={() => navigation.navigate('SignupSteps')}>
                  <Text style={[styles.incompleteBtnText, { color: '#fff' }]}>
                    Complete Now
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ShowUpdateModal
              openModal={isUpdateAvailable}
              animationType="fade"
              modalTitle="New Update!"
              ModalDesc="A new version is available. Please download the latest update."
              logoutBtn={openPlayStore}
              modalBgColor="rgba(0,0,0,0.6)"
              bntYesText="Download Update"
            />

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* ── Sell Bottom Sheet ───────────── */}
          <RBSheet
            ref={refSellRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            openDuration={300}
            closeDuration={250}
            height={370}
            closeOnPressBack={true}
            customStyles={{
              container: {  borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.bgCard, },
              draggableIcon: { backgroundColor: colors.dividerColor },
            }}>
            <SellBottomSheet
              titleText="Sell"
              titleStyle={[styles.bottomSheetTitle, { color: colors.textBlack }]}
              buttonStyle={gs.bottomSheetButton}
              imageIconPaypal={paypalImage}
              imageIconPayooner={payoonerImage}
              imageIconBitcoin={bitcoinImage}
              imageStyle={gs.bottomSheetImageStyle}
              buttonTextStyle={gs.bottomSheetButtonText}
              buttonLabel_paypal="PayPal"
              buttonLabel_payooner="Payoneer"
              buttonLabel_bitcoin="Bitcoin"
              onPress1={sellPaypalBtn}
              onPress2={sellPayoonerBtn}
              onPress3={sellBtcBtn}
            />
          </RBSheet>

          {/* ── Buy Bottom Sheet ────────────── */}
          <RBSheet
            ref={refBuyRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            openDuration={300}
            closeDuration={250}
            height={370}
            closeOnPressBack={true}
            customStyles={{
              container: {  borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.bgCard, },
              draggableIcon: { backgroundColor: colors.dividerColor },
            }}>
            <BuyBottomSheet
              titleText="Buy"
              titleStyle={[styles.bottomSheetTitle, { color: colors.textBlack }]}
              buttonStyle={gs.bottomSheetButton}
              imageIconPaypal={paypalImage}
              imageIconPayooner={payoonerImage}
              imageIconBitcoin={bitcoinImage}
              imageStyle={gs.bottomSheetImageStyle}
              buttonTextStyle={gs.bottomSheetButtonText}
              buttonLabel_paypal="PayPal"
              buttonLabel_payooner="Payoneer"
              buttonLabel_bitcoin="Bitcoin"
              onPress1={buyPaypalBtn}
              onPress2={buyPayoneerBtn}
              onPress3={buyBtcBtn}
            />
          </RBSheet>

          {/* ── More Bottom Sheet ───────────── */}
          <RBSheet
            ref={refMoreRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            openDuration={300}
            closeDuration={250}
            height={370}
            closeOnPressBack={true}
            customStyles={{
              container: {  borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.bgCard, },
              draggableIcon: { backgroundColor: colors.dividerColor },
            }}>
            <MoreBottomSheet
              titleText="More Options"
              titleStyle={[styles.bottomSheetTitle, { color: colors.textBlack }]}
              buttonStyle={gs.bottomSheetButton}
              iconType1={<Feather name="plus-circle" size={20} color={colors.primaryColor1} />}
              iconType2={<Feather name="minus-circle" size={20} color={colors.primaryColor1} />}
              iconType3={<Ionicons name="wallet-outline" size={20} color={colors.primaryColor1} />}
              imageStyle={gs.bottomSheetImageStyle}
              buttonTextStyle={gs.bottomSheetButtonText}
              buttonLabel_paypal="Fund Account"
              buttonLabel_payooner="Withdraw Funds"
              buttonLabel_bitcoin="My Wallet"
              onPress1={addFundBtn}
              onPress2={WithdrawBtn}
              onPress3={walletBtn}
            />
          </RBSheet>
        </>
      )}

      {/* ── App Maintenance Mode ────────────────── */}
      {appMode && (
        <View style={{ flex: 1 }}>
          <AppModeModal
            openModal={appMode}
            animationType="slide"
            ModalShortDesc="Service Unavailable"
            ModalDesc={appModeMessage}
            closeBtn={signMeOut}
            logoutBtn={signMeOut}
            modalBgColor="rgba(0,0,0,0.2)"
            bntYesText="Okay"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
   greetingText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  subGreetingText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: 2,
  },
   profileBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Balance Card
  balanceCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: '_bold',
    fontSize: typography.huge,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    marginBottom: 2,
  },
  rewardsAmount: {
    fontFamily: '_semiBold',
    fontSize: typography.xl,
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  balanceBadgeText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    marginLeft: 4,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    textAlign: 'center',
  },

  // Bill Services
  billServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  // Carousel
  carouselContainer: {
    marginVertical: spacing.lg,
  },
  bannerSlide: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 4,
  },
  bannerDesc: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 18,
  },
    bannerDot: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.sm,
    zIndex: 2,
  },
  bannerIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bannerImageContainer: {
    width: 100,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
    opacity: 0.92,
  },
  bannerImage: {
    width: 105,
    height: 105,
    transform: [{ rotate: '-10deg' }],
  },
  bannerCircleLarge: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    zIndex: 0,
  },
  bannerCircleSmall: {
    position: 'absolute',
    right: 60,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 0,
  },

  // Transactions
  transactionsList: {
    marginBottom: spacing.lg,
  },
   transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
   transactionIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
  },
  transactionDate: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontFamily: '_bold',
    fontSize: typography.base,
    marginRight: 4,
  },

  // Incomplete Registration
    incompleteCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  incompleteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  incompleteIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incompleteTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    marginLeft: spacing.xs,
  },
  incompleteDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  incompleteBtn: {
    
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  incompleteBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },

  // Bottom Sheet
  bottomSheetTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});

export default HomeScreen;