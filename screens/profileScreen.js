import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  StyleSheet, View, Text, TouchableOpacity, Image,
  ScrollView, StatusBar, Platform, ToastAndroid,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import { gs, colors, spacing, radius, typography, shadows } from '../styles';
import { AuthContext } from '../contextAPI/authContext';
import {
  CheckRegistrationStage,
  ProfileImage,
  ShowLogoutModal,
} from '../components/controls';
import FirstWord from '../components/firstWord';
import client from '../contextAPI/client';
import StatCard from '../components/StatCard';
import MenuItem from '../components/MenuItem';
import InfoRow from '../components/InfoRow';
import CoinDisplay from '../components/CoinDisplay';
import { getUserTier, getNextTier, getTierProgress, getCoinsToNextTier } from '../constants/tierSystem';

// ─────────────────────────────────────────────────
// TIER SYSTEM
// ─────────────────────────────────────────────────


// ── Main Profile Screen ───────────────────────────
const ProfileScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const {
    userInfo, setUserInfo,
    userToken,
    logoutAction,
    completeRegData, setCompleteRegData,
  } = useContext(AuthContext);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [businessRate, setBusinessRate] = useState(null);
  const [coinSettings, setCoinSettings] = useState(null);
  const [userCoins, setUserCoins] = useState(0);

  const myName = FirstWord(userInfo?.userData?.display_name || 'User');
  const checkRegStage = CheckRegistrationStage();
  const userTier = getUserTier(userCoins);

  // ── Refresh User Details ──────────────────────
  const RefreshUserDetails = async () => {
    try {
      const res = await client.get(
        '/api/userProfileMobile/' + userInfo?.userData?._id,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUserInfo(res.data);
      }
    } catch (error) {
      console.log('Refresh error:', error.message);
    }
  };

  // ── Fetch Business Rate ───────────────────────
  const fetchBusinessRate = async () => {
    try {
      const res = await client.get('/api/bonus_rate');
      if (res.data.msg === '200') {
        setBusinessRate(res.data.appDataRate);
        AsyncStorage.setItem('businessRate', JSON.stringify(res.data));
      }
    } catch (error) {
      console.log('Business rate error:', error.message);
    }
  };

  // ── Fetch Coin Settings & User Coins ──────────
  const fetchCoinData = async () => {
    try {
      const res = await client.get('/api/rewards_settings');
      if (res.data.msg === '200') {
        setCoinSettings(res.data.settings);
      }
      const coinsRes = await client.get(
        '/api/user_coins/' + userInfo?.userData?._id,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (coinsRes.data.msg === '200') {
        setUserCoins(coinsRes.data.coins || 0);
      }
    } catch (error) {
      console.log('Coin data error:', error.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      RefreshUserDetails();
      fetchBusinessRate();
      fetchCoinData();
      if (checkRegStage === false) {
        setCompleteRegData(true);
      }
    }
  }, [isFocused]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Promise.all([RefreshUserDetails(), fetchBusinessRate(), fetchCoinData()])
      .finally(() => setIsRefreshing(false));
  }, []);

  // ── Copy Referral Code ────────────────────────
  const copyReferralCode = async () => {
    try {
      const appName = 'OtaMobile';
      const bonus = businessRate?.signup_bonus_rate
        ? `$${businessRate.signup_bonus_rate}`
        : 'a bonus';
      const message = `${appName} — earn ${bonus} instantly!\nUse my referral code: ${userInfo?.userData?.tag_id}\nDownload: https://ozaapp.com`;
      await Clipboard.setStringAsync(message);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Referral code copied! Share it to earn rewards 🎉', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied!', 'Referral code copied. Share it to earn rewards 🎉');
      }
    } catch (error) {
      console.log('Copy error:', error.message);
    }
  };

  // ── Handle Logout ─────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    try {
      await logoutAction();
    } catch (error) {
      console.log('Logout error:', error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ── Coin Value Calculation ────────────────────
  const coinNgnValue = coinSettings?.coin_ngn_value || 1;
  const coinUsdValue = coinSettings?.coin_usd_value || 0.001;
  const totalNgn = (userCoins * coinNgnValue).toLocaleString();
  const totalUsd = (userCoins * coinUsdValue).toFixed(4);

  // ── KYC Status ───────────────────────────────
  const isVerified = userInfo?.userData?.acct_approved_status === 'Approved';
  const isComplete = checkRegStage === 'true';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgColor} />

      {/* ── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.navigate('settingScreen')}>
          <Ionicons name="settings-outline" size={22} color={colors.primaryColor1} />
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

        {/* ── Profile Hero Card ─────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {userInfo?.userData?.profile_photo ? (
                <Image
                  source={{ uri: userInfo.userData.profile_photo }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {myName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color={colors.successColor}
                  />
                </View>
              )}
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>
                {userInfo?.userData?.display_name || 'User'}
              </Text>
              <Text style={styles.heroEmail}>
                {userInfo?.userData?.email || ''}
              </Text>
              <View style={styles.heroStatusRow}>
                {isVerified ? (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="shield-checkmark" size={12} color={colors.successColor} />
                    <Text style={styles.verifiedPillText}>Verified Account</Text>
                  </View>
                ) : (
                  <View style={styles.unverifiedPill}>
                    <Ionicons name="alert-circle" size={12} color={colors.warningColor} />
                    <Text style={styles.unverifiedPillText}>Unverified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: userTier.color + '30' }]}>
            <Text style={styles.tierEmoji}>{userTier.icon}</Text>
            <Text style={[styles.tierName, { color: '#fff' }]}>
              {userTier.name} Tier
            </Text>
          </View>
        </LinearGradient>
        

        {/* ── Stats Row ────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            label="Member Since"
            value={moment(userInfo?.userData?.createdAt).format('MMM YYYY')}
            icon="calendar-outline"
            color={colors.primaryColor1}
          />
          <StatCard
            label="Account Status"
            value={isComplete ? 'Complete' : 'Incomplete'}
            icon={isComplete ? 'checkmark-circle' : 'time-outline'}
            color={isComplete ? colors.successColor : colors.warningColor}
          />
          <StatCard
            label="Account Type"
            value={userInfo?.userData?.account_type || 'Standard'}
            icon="person-outline"
            color={colors.accentGold}
          />
        </View>

        {/* ── Personal Information ──────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow icon="person-outline" label="Full Name" value={userInfo?.userData?.display_name} />
          <InfoRow icon="phone-portrait-outline" label="Phone Number" value={userInfo?.userData?.phone} />
          <InfoRow icon="mail-outline" label="Email Address" value={userInfo?.userData?.email} />
          <InfoRow icon="transgender-outline" label="Gender" value={userInfo?.userData?.gender} />
          <InfoRow icon="calendar-outline" label="Date of Birth" value={userInfo?.userData?.dob} />
          <InfoRow icon="location-outline" label="State" value={userInfo?.userData?.state} />
          <InfoRow icon="business-outline" label="City" value={userInfo?.userData?.city} />
          <InfoRow icon="earth-outline" label="Country" value={userInfo?.userData?.country} />
          <InfoRow icon="home-outline" label="Address" value={userInfo?.userData?.address} />
        </View>

        {/* ── Coins & Rewards Card ──────────────── */}
          <View style={styles.coinsCard}>
            <View style={styles.coinsHeader}>
              <View style={styles.coinsHeaderLeft}>
                <Text style={styles.coinsSectionTitle}>🪙 My Coins & Rewards</Text>
              </View>
              <TouchableOpacity
                style={styles.coinsHistoryBtn}
                onPress={() => navigation.navigate('referrals')}>
                <Text style={styles.coinsHistoryBtnText}>History</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primaryColor1} />
              </TouchableOpacity>
            </View>
            <View style={styles.coinsDivider} />
            <CoinDisplay
              coins={userCoins}
              coinNgnValue={coinNgnValue}
              coinUsdValue={coinUsdValue}
            />
          </View>

        {/* ── Referral Card ─────────────────────── */}
        <View style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <Ionicons name="people-outline" size={20} color={colors.primaryColor1} />
            <Text style={styles.referralTitle}>My Referral Code</Text>
          </View>
          <View style={styles.referralCodeRow}>
            <Text style={styles.referralCode}>
              {userInfo?.userData?.tag_id || '—'}
            </Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={copyReferralCode}
              activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
              <Text style={styles.copyBtnText}>Copy & Share</Text>
            </TouchableOpacity>
          </View>
          {businessRate?.signup_bonus_rate && (
            <Text style={styles.referralHint}>
              🎁 You and your friends earn ${businessRate.signup_bonus_rate} when they sign up with your code
            </Text>
          )}
        </View>

        {/* ── Incomplete Registration Banner ─────── */}
        {!isComplete && (
          <TouchableOpacity
            style={styles.incompleteBanner}
            onPress={() => navigation.navigate('SignupSteps')}
            activeOpacity={0.85}>
            <View style={styles.incompleteBannerLeft}>
              <Ionicons name="alert-circle" size={22} color={colors.warningColor} />
              <View style={styles.incompleteBannerInfo}>
                <Text style={styles.incompleteBannerTitle}>
                  Complete Your Profile
                </Text>
                <Text style={styles.incompleteBannerDesc}>
                  Verify your account to remove restrictions and unlock all features
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.warningColor} />
          </TouchableOpacity>
        )}

        {/* ── Account Actions ───────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem
            icon="card-outline"
            label="Bank Details"
            subtitle="Manage your bank account information"
            iconBg="#EEF2FF"
            iconColor={colors.primaryColor1}
            onPress={() => navigation.navigate('BankDetails')}
          />
          <MenuItem
            icon="documents-outline"
            label="KYC Documents"
            subtitle="Upload and manage verification documents"
            iconBg="#F0FDF4"
            iconColor={colors.successColor}
            rightBadge={isComplete ? null : 'Required'}
            onPress={() => navigation.navigate('DocumentView')}
          />
          <MenuItem
            icon="wallet-outline"
            label="My Wallet"
            subtitle="View balance and transaction history"
            iconBg="#FFF3CD"
            iconColor={colors.accentGold}
            onPress={() => navigation.navigate('Wallet')}
          />
          <MenuItem
            icon="people-outline"
            label="Referrals & Rewards"
            subtitle="Track your referrals and earned bonuses"
            iconBg="#FCE7F3"
            iconColor="#EC4899"
            onPress={() => navigation.navigate('referrals')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Transaction History"
            subtitle="View all your past transactions"
            iconBg="#DBEAFE"
            iconColor="#3B82F6"
            onPress={() => navigation.navigate('History')}
          />
        </View>

        {/* ── Settings & Support ────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          <MenuItem
            icon="lock-closed-outline"
            label="Security & Privacy"
            subtitle="Change PIN, password and security settings"
            iconBg="#FEE2E2"
            iconColor={colors.dangerColor}
            onPress={() => navigation.navigate('settingScreen')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            subtitle="Manage your notification preferences"
            iconBg="#FFEDD5"
            iconColor={colors.warningColor}
            onPress={() => navigation.navigate('settingScreen')}
          />
          <MenuItem
            icon="chatbox-outline"
            label="Contact Support"
            subtitle="Get help from our support team"
            iconBg="#ECFDF5"
            iconColor={colors.successColor}
            onPress={() => navigation.navigate('contacts')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About Us"
            subtitle="Learn more about OtaMobile"
            iconBg={colors.bgLight}
            iconColor={colors.primaryColor1}
            onPress={() => navigation.navigate('About')}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy Policy"
            subtitle="Read our privacy policy"
            iconBg={colors.bgLight}
            iconColor={colors.textSecColor}
            onPress={() => navigation.navigate('Privacy_Policy')}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Conditions"
            subtitle="Read our terms of service"
            iconBg={colors.bgLight}
            iconColor={colors.textSecColor}
            onPress={() => navigation.navigate('Terms_Conditions')}
          />
        </View>

        {/* ── Logout Button ─────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.85}
          disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color={colors.dangerColor} size={22} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={colors.dangerColor}
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── App Version ───────────────────────── */}
        <Text style={styles.appVersion}>OtaMobile v2.0.1</Text>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── Logout Confirmation Modal ─────────── */}
      <ShowLogoutModal
        openModal={showLogoutModal}
        modalTitle="Sign Out"
        ModalDesc="Are you sure you want to sign out of your account?"
        closeBtn={() => setShowLogoutModal(false)}
        logoutBtn={handleLogout}
        modalBgColor="rgba(0,0,0,0.5)"
        animationType="fade"
        bntYesText="Sign Out"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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

  // Hero Card
  heroCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarInitials: {
    fontFamily: '_bold',
    fontSize: typography.xxxl,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: radius.full,
    padding: 1,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 2,
  },
  heroEmail: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  heroStatusRow: {
    flexDirection: 'row',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  verifiedPillText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
  },
  unverifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  unverifiedPillText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tierEmoji: {
    fontSize: 16,
  },
  tierName: {
    fontFamily: '_bold',
    fontSize: typography.sm,
  },

  // Coins Card
  coinsSectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 2,
  },
  coinsHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  coinsHistoryBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },
  coinsDivider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  coinsCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: 15,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  coinsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  coinsHeaderLeft: {
    flex: 1,
  },
  // Referral Card
  referralCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  referralTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  referralCode: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    letterSpacing: 2,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  copyBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },
  referralHint: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Incomplete Banner
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  incompleteBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.sm,
  },
  incompleteBannerInfo: {
    flex: 1,
  },
  incompleteBannerTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    marginBottom: 2,
    lineHeight: 22,
  },
  incompleteBannerDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Section Card
  sectionCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
    marginTop: 15,
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },

  // Info Row

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  logoutBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },

  // App Version
  appVersion: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});

export default ProfileScreen;