import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Platform, ToastAndroid, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useTheme from '../hooks/useTheme';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import ReferralCard from '../components/ReferralCard';
import CoinDisplay from '../components/CoinDisplay';
import SectionCard from '../components/SectionCard';

// ── Stats Card ────────────────────────────────────
const ReferralStatCard = ({ label, value, icon, color, bgColor }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bgCard, ...shadows.sm }]}>
      <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecColor }]}>{label}</Text>
    </View>
  );
};

// ── List Footer ───────────────────────────────────
const ListFooter = ({ isLoading, isEnd, colors }) => {
  if (isLoading) {
    return (
      <View style={styles.footerRow}>
        <ActivityIndicator size={22} color={colors.primaryColor1} />
        <Text style={[styles.footerText, { color: colors.textSecColor }]}>
          Loading more...
        </Text>
      </View>
    );
  }
  if (isEnd) {
    return (
      <View style={styles.footerEndRow}>
        <View style={[styles.footerLine, { backgroundColor: colors.dividerColor }]} />
        <Text style={[styles.footerEndText, { color: colors.textSecColor }]}>
          All referrals loaded
        </Text>
        <View style={[styles.footerLine, { backgroundColor: colors.dividerColor }]} />
      </View>
    );
  }
  return <View style={{ height: spacing.xl }} />;
};

// ── Main Screen ───────────────────────────────────
const ReferralScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();
  const { userToken, userInfo } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [isListEnd, setIsListEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [businessRate, setBusinessRate] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [coinSettings, setCoinSettings] = useState(null);
  const [userCoins, setUserCoins] = useState(0);

  // ── Load Referrals ────────────────────────────
  const loadReferrals = useCallback(async (reset = false) => {
    if (isLoading || (isListEnd && !reset)) return;
    setIsLoading(true);
    const page = reset ? 1 : currentPage;
    try {
      const res = await client.get(
        `api/user_referrals/${userInfo.userData._id}?page=${page}`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.length > 0) {
        setReferrals(prev => reset ? res.data : [...prev, ...res.data]);
        setCurrentPage(page + 1);
        setIsListEnd(false);
      } else {
        setIsListEnd(true);
      }
    } catch (error) {
      console.log('Referrals error:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isListEnd, currentPage, userInfo, userToken]);

  // ── Load Business Rate ────────────────────────
  const loadBusinessRate = async () => {
    try {
      const cached = await AsyncStorage.getItem('businessRate');
      if (cached) {
        const parsed = JSON.parse(cached);
        setBusinessRate(parsed.appDataRate);
      }
      const res = await client.get('/api/bonus_rate');
      if (res.data.msg === '200') {
        setBusinessRate(res.data.appDataRate);
        AsyncStorage.setItem('businessRate', JSON.stringify(res.data));
      }
    } catch (error) {
      console.log('Business rate error:', error.message);
    }
  };

  // ── Load App Details ──────────────────────────
  const loadAppDetails = async () => {
    try {
      const cached = await AsyncStorage.getItem('AppSettingInfo');
      if (cached) setAppDetails(JSON.parse(cached));
    } catch (error) {
      console.log('App details error:', error.message);
    }
  };

  // ── Load Coin Data ────────────────────────────
  const loadCoinData = async () => {
    try {
      const res = await client.get('/api/rewards_settings');
      if (res.data.msg === '200') setCoinSettings(res.data.settings);

      const coinsRes = await client.get(
        '/api/user_coins/' + userInfo.userData._id,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (coinsRes.data.msg === '200') setUserCoins(coinsRes.data.coins || 0);
    } catch (error) {
      console.log('Coin data error:', error.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadReferrals(true);
      loadBusinessRate();
      loadAppDetails();
      loadCoinData();
    }
  }, [isFocused]);

  // ── Pull to Refresh ───────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setReferrals([]);
    setCurrentPage(1);
    setIsListEnd(false);
    await loadReferrals(true);
    setIsRefreshing(false);
  }, []);

  // ── Share Referral Code ───────────────────────
  const shareReferralCode = async () => {
    try {
      const appName = appDetails?.infoData?.app_name || 'OtaMobile';
      const bonus = businessRate?.signup_bonus_rate
        ? `$${businessRate.signup_bonus_rate}`
        : 'a bonus';
      const tagId = userInfo?.userData?.tag_id || '';
      const message = [
        `🎉 Join ${appName} and earn ${bonus} instantly!`,
        ``,
        `Use my referral code: ${tagId}`,
        `Sign up here: https://ozaapp.com`,
        ``,
        `Buy & sell PayPal, Payoneer, Bitcoin.`,
        `Pay bills, buy data & airtime at the cheapest rates.`,
      ].join('\n');

      await Clipboard.setStringAsync(message);

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Referral message copied! Share it to earn rewards 🎉',
          ToastAndroid.LONG
        );
      } else {
        Alert.alert('Copied!', 'Referral message copied. Share it to earn rewards 🎉');
      }
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  // ── Stats ─────────────────────────────────────
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(
    r => r.ref_status === 'Active' || r.ref_status === 'Completed'
  ).length;
  const pendingReferrals = totalReferrals - activeReferrals;

  // ── Header Component ──────────────────────────
  const ListHeader = () => (
    <View>
      {/* ── Hero Banner ──────────────────────── */}
      <LinearGradient
        colors={[colors.primaryColor1, colors.primaryColor1b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.heroIconBox}>
          <Ionicons name="people" size={32} color={colors.primaryColor1} />
        </View>
        <Text style={styles.heroTitle}>Refer & Earn</Text>
        <Text style={styles.heroDesc}>
          Share your code and earn rewards every time
          someone signs up and transacts on the app
        </Text>

        {/* Referral Code Box */}
        <View style={styles.codeBox}>
          <View style={styles.codeLeft}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <Text style={styles.codeValue}>
              {userInfo?.userData?.tag_id || '—'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={shareReferralCode}
            activeOpacity={0.85}>
            <Ionicons name="share-outline" size={18} color={colors.primaryColor1} />
            <Text style={styles.copyBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bonus Amount */}
        {businessRate?.signup_bonus_rate && (
          <View style={styles.bonusRow}>
            <Ionicons name="gift-outline" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={styles.bonusText}>
              Each referral earns your friend ${businessRate.signup_bonus_rate} signup bonus
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* ── Stats Row ──────────────────────────── */}
      <View style={styles.statsRow}>
        <ReferralStatCard
          label="Total Referred"
          value={totalReferrals}
          icon="people-outline"
          color={colors.primaryColor1}
          bgColor={colors.bgLight}
        />
        <ReferralStatCard
          label="Active"
          value={activeReferrals}
          icon="checkmark-circle-outline"
          color={colors.successColor}
          bgColor={colors.greenColorLight}
        />
        <ReferralStatCard
          label="Pending"
          value={pendingReferrals}
          icon="time-outline"
          color={colors.warningColor}
          bgColor={colors.warningLight}
        />
      </View>

      {/* ── Coins & Rewards ──────────────────── */}
      <View style={[styles.coinsSection, {
        backgroundColor: colors.bgCard,
        ...shadows.card,
      }]}>
        <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
          🪙 My Coins & Rewards
        </Text>
        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerColor }]} />
        <CoinDisplay
          coins={userCoins}
          coinNgnValue={coinSettings?.coin_ngn_value || 1}
          coinUsdValue={coinSettings?.coin_usd_value || 0.001}
        />
      </View>

      {/* ── How It Works ─────────────────────── */}
      <View style={[styles.howItWorksCard, {
        backgroundColor: colors.bgCard,
        ...shadows.card,
      }]}>
        <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
          How It Works
        </Text>
        <View style={[styles.sectionDivider, { backgroundColor: colors.dividerColor }]} />

        {[
          { step: '1', icon: 'share-outline', color: colors.primaryColor1, bg: colors.bgLight,
            title: 'Share Your Code', desc: 'Copy and share your unique referral code with friends and family' },
          { step: '2', icon: 'person-add-outline', color: colors.successColor, bg: colors.greenColorLight,
            title: 'Friend Signs Up', desc: 'Your friend registers using your referral code and gets a signup bonus' },
          { step: '3', icon: 'cash-outline', color: colors.accentGold, bg: colors.accentGoldLight,
            title: 'Both Earn Rewards', desc: 'You earn coins and referral bonus every time your referral transacts' },
        ].map((step) => (
          <View key={step.step} style={styles.stepRow}>
            <View style={[styles.stepIconBox, { backgroundColor: step.bg }]}>
              <Ionicons name={step.icon} size={20} color={step.color} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: colors.textBlack }]}>
                {step.title}
              </Text>
              <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Share Button ─────────────────────── */}
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.primaryColor1 }]}
        onPress={shareReferralCode}
        activeOpacity={0.85}>
        <Ionicons
          name="share-social-outline"
          size={20}
          color="#fff"
          style={{ marginRight: spacing.sm }}
        />
        <Text style={styles.shareBtnText}>Copy & Share Referral Code</Text>
      </TouchableOpacity>

      {/* ── Referrals List Header ─────────────── */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.textBlack }]}>
          My Referrals
        </Text>
        <View style={[styles.listCountBadge, { backgroundColor: colors.bgLight }]}>
          <Text style={[styles.listCount, { color: colors.primaryColor1 }]}>
            {totalReferrals}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ─────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[gs.homeSideMenu, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Referrals & Rewards
        </Text>
        <TouchableOpacity
          style={[gs.homeSideMenu, { backgroundColor: colors.bgLight }]}
          onPress={shareReferralCode}>
          <Ionicons name="share-outline" size={22} color={colors.primaryColor1} />
        </TouchableOpacity>
      </View>

      {/* ── FlatList ────────────────────────── */}
      <FlatList
        data={referrals}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => <ReferralCard item={item} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.bgLight }]}>
                <Ionicons name="people-outline" size={48} color={colors.textSecColor2} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>
                No Referrals Yet
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
                Share your referral code and start earning rewards when friends sign up
              </Text>
              
            </View>
          ) : null
        }
        ListFooterComponent={
          <ListFooter isLoading={isLoading} isEnd={isListEnd} colors={colors} />
        }
        onEndReached={() => loadReferrals()}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          referrals.length === 0 && { flexGrow: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primaryColor1}
            colors={[colors.primaryColor1]}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={{ height: spacing.xs }} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    marginBottom: spacing.xs,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  codeLeft: {
    flex: 1,
  },
  codeLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    lineHeight: 16,
  },
  codeValue: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    letterSpacing: 2,
    lineHeight: 28,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  copyBtnText: {
    fontFamily: '_bold',
    fontSize: typography.sm,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  bonusText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    flex: 1,
    lineHeight: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 2,
  },

  // Coins Section
  coinsSection: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  // How It Works
  howItWorksCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.md,
  },
  sectionDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Share Button
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  shareBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },

  // List Header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  listTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  listCountBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  listCount: {
    fontFamily: '_bold',
    fontSize: typography.sm,
  },

  // List Content
  listContent: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyShareBtn: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  emptyShareBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  footerEndRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  footerLine: {
    flex: 1,
    height: 1,
  },
  footerEndText: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    lineHeight: 16,
  },
});

export default ReferralScreen;