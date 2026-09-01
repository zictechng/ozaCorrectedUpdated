import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Collapsible from 'react-native-collapsible';
import Carousel from 'react-native-snap-carousel';
import { PaymentIcon } from 'react-native-payment-icons';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { isSmallPhone, sheetHeight } from '../utils/responsive';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import { NumberValueFormat } from '../components/formatValue';
import { NumberDollarValueFormat } from '../components/formatDollarValue';
import { windowWidth } from '../utils/Dimensions';

const { width } = Dimensions.get('window');

// ── Stat Card Component ───────────────────────────
const StatCard = ({ label, value, icon, color, bgColor, isDollar }) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
    <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>
        {isDollar
          ? <NumberDollarValueFormat value={value || '0'} />
          : <NumberValueFormat value={value || '0'} />}
      </Text>
    </View>
  </View>
);

// ── Transaction Item Component ────────────────────
const WalletTransactionItem = ({ item }) => {
  const { colors } = useThemeStyles();
  return (
  <View style={[styles.transactionItem, { backgroundColor: colors.bgCard }]}>
    <View style={styles.transactionLeft}>
      <View style={[styles.transactionIconBox, { backgroundColor: colors.bgLight }]}>
        <Feather name="arrow-up-left" size={20} color={colors.successColor} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {item.fund_type}
        </Text>
        <Text style={styles.transactionDate}>
          {moment(item.creditOn).format('DD MMM YYYY • hh:mm A')}
        </Text>
      </View>
    </View>
    <View style={styles.transactionRight}>
      <Text style={styles.transactionAmount}>
        <NumberValueFormat value={item.amount} />
      </Text>
      <View style={[
        item.fund_status === 'Success'
          ? gs.badgeSuccess
          : gs.badgeWarning,
        { marginTop: 4 }
      ]}>
        <Text style={
          item.fund_status === 'Success'
            ? gs.badgeSuccessText
            : gs.badgeWarningText
        }>
          {item.fund_status}
        </Text>
      </View>
    </View>
  </View>
    );
  };

// ── Main Wallet Screen ────────────────────────────
const WalletScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo, setUserInfo } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState([]);
  const [bonusTotalBalance, setBonusTotalBalance] = useState(0);
  const [withdrawTotalBalance, setWithdrawTotalBalance] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartDataLoading, setChartDataLoading] = useState(false);
  const [dataOption, setDataOption] = useState(0);
  const [dataPayoneer, setDataPayoneer] = useState(0);
  const [dataBitcoin, setDataBitcoin] = useState(0);
  const [weeklyData, setWeeklyData] = useState(0);
  const [monthlyData, setMonthlyData] = useState(0);
  const [yearlyData, setYearlyData] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('transactions');

  const carouselRef = useRef(null);

  const dataWallet = [
    {
      id: 1,
      title: 'Funding Balance',
      subtitle: 'Available to spend',
      icon: 'wallet-outline',
      
      bgColor: colors.bgLight,
      amount: userInfo?.userData?.amount || '0.0',
      isDollar: false,
      actionLabel: 'Fund Account',
      actionIcon: 'add',
    },
    {
      id: 2,
      title: 'Bonus Balance',
      subtitle: 'Earned rewards',
      icon: 'gift-outline',
      bgColor: '#FFF3CD',
      amount: userInfo?.userData?.all_bonus_acct || '0.0',
      isDollar: true,
      actionLabel: 'Withdraw',
      actionIcon: 'arrow-down-outline',
    },
  ];

  // ── Fetch Chart Data ──────────────────────────
  const fetchDataChart = async () => {
    try {
      const myId = userInfo?.userData?._id;
      if (!myId) return;
      setChartDataLoading(true);
      const res = await client.get('/api/chart_transactions/' + myId, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      setWeeklyData(res.data.weekly ?? 0);
      setMonthlyData(res.data.monthly ?? 0);
      setYearlyData(res.data.yearly ?? 0);
      if (res.data.msg === '201') {
        const objArr = res.data;
        setDataOption(objArr.paypal[0]?.totalAmount ?? 0);
        setDataPayoneer(objArr.payoneer[0]?.totalAmount ?? 0);
        setDataBitcoin(objArr.bitcoin[0]?.totalAmount ?? 0);
      }
    } catch (e) {
      console.log('Chart data error:', e.message);
    } finally {
      setChartDataLoading(false);
    }
  };

  // ── Fetch Wallet History ──────────────────────
  const getWalletHistory = async () => {
    setIsLoading(true);
    try {
      const res = await client.get('/api/history-wallet/' + userInfo?.userData?.tag_id, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.length > 0) setWalletHistory(res.data);
    } catch (error) {
      console.log('Wallet history error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch Wallet Balance ──────────────────────
  const getWalletBalance = async () => {
    setIsWalletLoading(true);
    try {
      const res = await client.get('/api/user_Wallet_summary/' + userInfo?.userData?.tag_id, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '201') {
        setWalletBalance(res.data.feedback);
        setBonusTotalBalance(res.data.feedbackBonus);
        setWithdrawTotalBalance(res.data.feedbackWithdraw);
      }
    } catch (error) {
      console.log('Wallet balance error:', error.message);
    } finally {
      setIsWalletLoading(false);
    }
  };

  // ── Refresh User Details ──────────────────────
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
      console.log('Refresh error:', error.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getWalletBalance();
      getWalletHistory();
      RefreshUserDetails();
      fetchDataChart();
    }
  }, [isFocused]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    RefreshUserDetails();
    getWalletBalance();
    getWalletHistory();
    fetchDataChart();
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  const redirectionButton = (index) => {
    if (index === 0) navigation.navigate('Add-fund');
    else if (index === 1) navigation.navigate('withdraw-fund');
  };

  // ── Chart Data ────────────────────────────────
  const barChartData = [
    { value: dataOption || 0, label: 'PayPal', frontcolor: '#4C5FD5' },
    { value: dataPayoneer || 0, label: 'Payoneer', frontColor: colors.accentGold },
    { value: dataBitcoin || 0, label: 'Bitcoin', frontColor: colors.accentGreen },
  ];

  const pieChartData = [
    { value: weeklyData || 0,  label: 'Weekly' },
    { value: monthlyData || 0, color: '#F0A500', label: 'Monthly' },
    { value: yearlyData || 0, color: '#00C896', label: 'Yearly' },
  ];

  // ── Wallet Card Renderer ──────────────────────
  const renderWalletCard = ({ item, index }) => (
    <LinearGradient
      colors={
        item.id === 1
          ? [colors.primaryColor1, colors.primaryColor1b]
          : ['#1A1D2E', '#2D3561']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.walletCard}>

      {/* Decorative circles */}
      <View style={styles.cardCircleLarge} />
      <View style={styles.cardCircleSmall} />

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <Ionicons name={item.icon} size={20} color="#fff" />
        </View>
        <PaymentIcon type="master" width={36} />
      </View>

      {/* Balance */}
      <View style={styles.cardBalanceSection}>
        <Text style={styles.cardBalanceLabel}>{item.title}</Text>
        <Text style={styles.cardBalanceAmount}>
          {item.isDollar
            ? <NumberDollarValueFormat value={item.amount} />
            : <NumberValueFormat value={item.amount} />}
        </Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.cardActionBtn}
        onPress={() => redirectionButton(index)}
        activeOpacity={0.85}>
        <Ionicons name={item.actionIcon} size={16} color="#fff" />
        <Text style={styles.cardActionText}>{item.actionLabel}</Text>
      </TouchableOpacity>

    </LinearGradient>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryColor1}
            colors={[colors.primaryColor1]}
          />
        }>

        {/* ── Wallet Card Carousel ────────────── */}
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            data={dataWallet}
            renderItem={renderWalletCard}
            sliderWidth={windowWidth - 40}
            itemWidth={windowWidth - 80}
            onSnapToItem={(index) => setActiveIndex(index)}
            loop={false}
          />
          {/* Carousel Dots */}
          <View style={styles.dotsRow}>
            {dataWallet.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Quick Action Buttons ────────────── */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundcolor: '#4C5FD5' }]}
            onPress={() => navigation.navigate('Add-fund')}
            activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.quickActionText}>Fund Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.accentGreen }]}
            onPress={() => navigation.navigate('withdraw-fund')}
            activeOpacity={0.85}>
            <Ionicons name="arrow-down-circle-outline" size={18} color="#fff" />
            <Text style={styles.quickActionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.accentGold }]}
            onPress={() => navigation.navigate('SendFund')}
            activeOpacity={0.85}>
            <Ionicons name="send-outline" size={18} color="#fff" />
            <Text style={styles.quickActionText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Cards ─────────────────────── */}
        <View style={gs.sectionHeader}>
          <Text style={gs.sectionTitle}>Wallet Summary</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            label="Pending Bonus"
            value={bonusTotalBalance}
            icon="gift-outline"
            color={colors.accentGold}
            bgColor="#FFF3CD"
            isDollar={true}
          />
          <StatCard
            label="Total Withdrawn"
            value={withdrawTotalBalance}
            icon="arrow-down-outline"
            color={colors.successColor}
            bgColor={colors.greenColorLight}
            isDollar={true}
          />
          <StatCard
            label="Total Funded"
            value={walletBalance[0]?.totalAmount}
            icon="wallet-outline"
            color={colors.primaryColor1}
            bgColor={colors.bgLight}
            isDollar={false}
          />
        </View>

        {/* ── Tabs ────────────────────────────── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
            onPress={() => setActiveTab('transactions')}>
            <Text style={[
              styles.tabText,
              activeTab === 'transactions' && styles.tabTextActive,
            ]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => setActiveTab('analytics')}>
            <Text style={[
              styles.tabText,
              activeTab === 'analytics' && styles.tabTextActive,
            ]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Transactions Tab ─────────────────── */}
        {activeTab === 'transactions' && (
          <View style={styles.tabContent}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.primaryColor1}
                style={{ marginTop: spacing.xl }}
              />
            ) : walletHistory.length === 0 ? (
              <View style={gs.emptyStateContainer}>
                <Ionicons name="wallet-outline" size={48} color={colors.textSecColor2} />
                <Text style={gs.emptyStateText}>No transactions yet</Text>
                <Text style={gs.emptyStateSubText}>
                  Fund your account to get started
                </Text>
              </View>
            ) : (
              walletHistory.map((item, index) => (
                <WalletTransactionItem key={index} item={item} />
              ))
            )}
          </View>
        )}

        {/* ── Analytics Tab ────────────────────── */}
        {activeTab === 'analytics' && (
          <View style={styles.tabContent}>

            {/* Bar Chart */}
            <View style={styles.chartCard}>
              <View style={gs.sectionHeader}>
                <Text style={gs.sectionTitle}>Transaction Flow</Text>
                <TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)}>
                  <Ionicons
                    name={isCollapsed ? 'stats-chart' : 'stats-chart-outline'}
                    size={20}
                    color={colors.primaryColor1}
                  />
                </TouchableOpacity>
              </View>
              <Collapsible collapsed={isCollapsed}>
                {chartDataLoading ? (
                  <ActivityIndicator size="large" color={colors.primaryColor1} />
                ) : (
                  <BarChart
                    hideRules
                    barBorderTopLeftRadius={5}
                    barBorderTopRightRadius={5}
                    xAxisColor={colors.dividerColor}
                    yAxisColor={colors.dividerColor}
                    noOfSections={5}
                    height={220}
                    spacing={30}
                    isAnimated
                    animationDuration={800}
                    barWidth={45}
                    data={barChartData}
                    xAxisLabelTextStyle={styles.chartLabel}
                    yAxisTextStyle={styles.chartLabel}
                  />
                )}
              </Collapsible>
            </View>

            {/* Pie Chart */}
            <View style={styles.chartCard}>
              <Text style={[gs.sectionTitle, { marginBottom: spacing.lg }]}>
                Period Breakdown
              </Text>
              {chartDataLoading ? (
                <ActivityIndicator size="large" color={colors.primaryColor1} />
              ) : (
                <View style={styles.pieChartRow}>
                  <PieChart
                    data={pieChartData}
                    showText={false}
                    donut={true}
                    radius={70}
                    innerRadius={45}
                    centerLabelComponent={() => (
                      <View style={styles.pieCenter}>
                        <Ionicons name="stats-chart" size={20} color={colors.primaryColor1} />
                      </View>
                    )}
                  />
                  <View style={styles.pieLegend}>
                    {pieChartData.map((item, index) => (
                      <View key={index} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <View>
                          <Text style={styles.legendLabel}>{item.label}</Text>
                          <Text style={styles.legendValue}>
                            {Number(item.value).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
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
  headerTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
  },

  // Carousel
  carouselContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Wallet Card
  walletCard: {
    borderRadius: radius.xl,
    padding: isSmallPhone ? spacing.lg : spacing.xl,
    height: isSmallPhone ? 170 : 200,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardCircleLarge: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  cardCircleSmall: {
    position: 'absolute',
    left: -20,
    bottom: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBalanceSection: {
    marginBottom: spacing.md,
  },
  cardBalanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: 4,
  },
  cardBalanceAmount: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: '_regular',
    fontSize: typography.xs,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  cardActionText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    marginLeft: 6,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.lg,
    gap: 6,
    ...shadows.sm,
  },
  quickActionText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
  },

  // Stats
  statsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    marginBottom: 2,
  },
  statValue: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  tabActive: {
  },
  tabText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  tabTextActive: {
  },
  tabContent: {
    marginBottom: spacing.lg,
  },

  // Transactions
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
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
  },

  // Charts
  chartCard: {
    
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  chartLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
  },
  pieChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieLegend: {
    flex: 1,
    marginLeft: spacing.xl,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  legendLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  legendValue: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
  },
});

export default WalletScreen;