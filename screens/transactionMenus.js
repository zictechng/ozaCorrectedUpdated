import React, { useContext, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RBSheet from 'react-native-raw-bottom-sheet';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import RateBottomSheet from '../components/rateBottomSheet';
import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';

// ── Action Card ───────────────────────────────────
const ActionCard = ({ icon, iconBg, iconColor, title, subtitle, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.actionCard, { backgroundColor: colors.bgCard }]}
    onPress={onPress}
    activeOpacity={0.85}>
    <View style={[styles.actionIconBox, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={26} color={iconColor} />
    </View>
    <View style={styles.actionInfo}>
      <Text style={[styles.actionTitle, { color: colors.textBlack }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: colors.textSecColor }]}>{subtitle}</Text>
    </View>
    <View style={[styles.actionArrow, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="chevron-forward" size={18} color={colors.primaryColor1} />
    </View>
  </TouchableOpacity>
);

// ── Main Transaction Menus ────────────────────────
const TransactionMenus = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userInfo, appSettingDetails } = useContext(AuthContext);

  const refRateSheet = useRef();

  const actions = [
    {
      id: 'fund',
      icon: 'wallet-outline',
      iconBg: '#EEF2FF',
      iconColor: colors.primaryColor1,
      title: 'Add Funds',
      subtitle: 'Top up your wallet balance via Paystack',
      route: 'FundAccount',
    },
    {
      id: 'send',
      icon: 'send-outline',
      iconBg: '#D1FAE5',
      iconColor: '#10B981',
      title: 'Send Funds',
      subtitle: 'Transfer funds to another user instantly',
      route: 'SendFund',
    },
    {
      id: 'withdraw',
      icon: 'arrow-down-circle-outline',
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      title: 'Withdraw Funds',
      subtitle: 'Withdraw to your linked bank account',
      route: 'withdraw-fund',
    },
    {
      id: 'sell',
      icon: 'trending-up-outline',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
      title: 'Sell Digital Assets',
      subtitle: 'Sell PayPal, Payoneer or Bitcoin',
      route: 'SalesPage',
    },
    {
      id: 'buy',
      icon: 'trending-down-outline',
      iconBg: '#DBEAFE',
      iconColor: '#3B82F6',
      title: 'Buy Digital Assets',
      subtitle: 'Buy PayPal, Payoneer or Bitcoin',
      route: 'BuyPage',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ─────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.rateBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => refRateSheet.current.open()}
          activeOpacity={0.8}>
          <MaterialIcons name="currency-exchange" size={18} color={colors.primaryColor1} />
          <Text style={[styles.rateBtnText, { color: colors.primaryColor1 }]}>
            View Rates
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroIconBox}>
            <Ionicons name="swap-horizontal" size={28} color={colors.primaryColor1} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Manage Your Funds</Text>
            <Text style={styles.heroDesc}>
              Add, send, withdraw and trade digital assets at the best rates
            </Text>
          </View>
        </LinearGradient>

        {/* ── Wallet Balance Strip ──────────────── */}
        <View style={[styles.balanceStrip, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>
          <View>
            <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>
              Wallet Balance
            </Text>
            <Text style={[styles.balanceValue, { color: colors.textBlack }]}>
              ₦{Number(userInfo?.userData?.tran_account || 0).toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.walletBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.85}>
            <Ionicons name="wallet-outline" size={16} color="#fff" />
            <Text style={styles.walletBtnText}>My Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* ── Section Title ─────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
          Quick Actions
        </Text>

        {/* ── Action Cards ──────────────────────── */}
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            icon={action.icon}
            iconBg={action.iconBg}
            iconColor={action.iconColor}
            title={action.title}
            subtitle={action.subtitle}
            colors={colors}
            onPress={() => navigation.navigate(action.route)}
          />
        ))}

        {/* ── Rate Notice ───────────────────────── */}
        <TouchableOpacity
          style={[styles.rateNotice, {
            backgroundColor: colors.bgLight,
            borderColor: colors.dividerColor,
          }]}
          onPress={() => refRateSheet.current.open()}
          activeOpacity={0.8}>
          <MaterialIcons name="currency-exchange" size={20} color={colors.primaryColor1} />
          <View style={styles.rateNoticeInfo}>
            <Text style={[styles.rateNoticeTitle, { color: colors.textBlack }]}>
              Current Exchange Rates
            </Text>
            <Text style={[styles.rateNoticeDesc, { color: colors.textSecColor }]}>
              Tap to view live PayPal, Payoneer and Bitcoin rates
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primaryColor1} />
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── Rate Bottom Sheet ────────────────────── */}
      <RBSheet
        ref={refRateSheet}
        closeOnDragDown
        closeOnPressMask
        openDuration={400}
        closeDuration={300}
        height={260}
        closeOnPressBack
        customStyles={{
          container: {
            backgroundColor: colors.bgColor,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
          draggableIcon: { backgroundColor: colors.dividerColor },
        }}>
        <ScrollView>
          <RateBottomSheet
            titleText="Live Exchange Rates"
            titleStyle={{
              fontFamily: '_bold',
              fontSize: typography.xl,
              color: colors.textBlack,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
            }}
            imageIconPaypal={paypalImage}
            imageIconPayooner={payoonerImage}
            imageIconBitcoin={bitcoinImage}
            imageStyle={styles.sheetImageStyle}
            buttonTextStyle={{
              fontFamily: '_semiBold',
              fontSize: typography.base,
              marginLeft: spacing.md,
              color: colors.primaryColor1,
            }}
            textStyle={{
              fontFamily: '_semiBold',
              fontSize: typography.sm,
              marginTop: spacing.xs,
              color: colors.textSecColor,
            }}
          />
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    fontSize: typography.xxl,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  rateBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Hero Banner
  heroBanner: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
    marginBottom: 4,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },

  // Balance Strip
  balanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    lineHeight: 30,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    ...shadows.sm,
  },
  walletBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 20,
  },

  // Section Title
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.md,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: { flex: 1 },
  actionTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 20,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Rate Notice
  rateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    gap: spacing.md,
  },
  rateNoticeInfo: { flex: 1 },
  rateNoticeTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  rateNoticeDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 20,
  },

  // Sheet
  sheetImageStyle: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
});

export default TransactionMenus;