
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, ActivityIndicator, RefreshControl, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import moment from 'moment';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

// ── Source Type Config ────────────────────────────
const SOURCE_CONFIG = {
  bills_payment:      { label: 'Bills Payment',      icon: 'receipt-outline',          color: '#4C5FD5', bg: '#EEF2FF' },
  buy_sell:           { label: 'Buy / Sell',          icon: 'swap-horizontal-outline',  color: '#F59E0B', bg: '#FEF3C7' },
  referral:           { label: 'Referral Bonus',      icon: 'people-outline',           color: '#EC4899', bg: '#FCE7F3' },
  business_promoter:  { label: 'Business Promoter',  icon: 'briefcase-outline',        color: '#8B5CF6', bg: '#EDE9FE' },
  admin_credit:       { label: 'Admin Credit',        icon: 'shield-checkmark-outline', color: '#10B981', bg: '#D1FAE5' },
  redemption:         { label: 'Coins Redeemed',      icon: 'cash-outline',             color: '#EF4444', bg: '#FEE2E2' },
};

const getSourceConfig = (source) =>
  SOURCE_CONFIG[source] || { label: source || 'Coins', icon: 'star-outline', color: '#4C5FD5', bg: '#EEF2FF' };

// ── Coin Transaction Item ─────────────────────────
const CoinItem = ({ item, colors }) => {
  const cfg      = getSourceConfig(item.source_type);
  const isCredit = item.type === 'credit';

  return (
    <View style={[styles.coinItem, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>
      <View style={[styles.coinItemIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.coinItemInfo}>
        <Text style={[styles.coinItemLabel, { color: colors.textBlack }]}>{cfg.label}</Text>
        {item.description ? (
          <Text style={[styles.coinItemDesc, { color: colors.textSecColor }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={[styles.coinItemDate, { color: colors.textSecColor }]}>
          {moment(item.createdAt).format('DD MMM YYYY • hh:mm A')}
        </Text>
      </View>
      <View style={styles.coinItemRight}>
        <Text style={[
          styles.coinItemAmount,
          { color: isCredit ? '#10B981' : '#EF4444' },
        ]}>
          {isCredit ? '+' : '-'}{item.coins}
        </Text>
        <Text style={[styles.coinItemUnit, { color: colors.textSecColor }]}>coins</Text>
        <Text style={[styles.coinItemBalance, { color: colors.textSecColor }]}>
          Bal: {item.coins_balance_after}
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────
const CoinsHistoryScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo, setUserInfo } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [history, setHistory]           = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isListEnd, setIsListEnd]       = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [currentCoins, setCurrentCoins] = useState(0);
  const [totalRecord, setTotalRecord]   = useState(0);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCoins, setRedeemCoins]   = useState('');
  const [isRedeeming, setIsRedeeming]   = useState(false);
  const [coinSettings, setCoinSettings] = useState(null);

  useEffect(() => {
    if (isFocused) {
      loadHistory(true);
      fetchSettings();
    }
  }, [isFocused]);

  const fetchSettings = async () => {
    try {
      const res = await client.get('/api/rewards_settings', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') setCoinSettings(res.data.settings);
    } catch {}
  };

  const loadHistory = useCallback(async (reset = false) => {
    if (!reset && isListEnd) return;
    if (reset) setIsLoading(true);
    const page = reset ? 1 : currentPage;
    try {
      const res = await client.get(
        `/api/coins_history/${userInfo?.userData?.tag_id}?pageNumber=${page}&pageLimit=20`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        const items = res.data.history || [];
        setHistory(prev => reset ? items : [...prev, ...items]);
        setCurrentCoins(res.data.currentCoins || 0);
        setTotalRecord(res.data.totalRecord || 0);
        setCurrentPage(page + 1);
        setIsListEnd(page >= res.data.totalPage);
      } else {
        setIsListEnd(true);
      }
    } catch {
      setIsListEnd(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, isListEnd, userInfo, userToken]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setIsListEnd(false);
    loadHistory(true);
  };

  // ── Redeem Coins ──────────────────────────────
  const handleRedeem = async () => {
    const coins = Number(redeemCoins);
    const min   = Number(coinSettings?.min_redeem_coins || 100);
    if (!coins || coins < min) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Minimum Required', textBody: `Minimum redemption is ${min} coins.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (coins > currentCoins) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Coins', textBody: `You only have ${currentCoins} coins.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsRedeeming(true);
    try {
      const res = await client.post(
        '/api/redeem_coins',
        { userId: userInfo?.userData?._id, coinsToRedeem: coins },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setShowRedeemModal(false);
        setRedeemCoins('');
        const ngn = coins * Number(coinSettings?.coin_ngn_value || 1);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Coins Redeemed! 🎉',
          textBody: `${coins} coins converted to ₦${ngn.toLocaleString()} and credited to your main wallet.`,
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => loadHistory(true),
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Redemption failed. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not process redemption. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsRedeeming(false);
    }
  };

  const ngnValue   = currentCoins * Number(coinSettings?.coin_ngn_value || 1);
  const usdValue   = (currentCoins * Number(coinSettings?.coin_usd_value || 0.001)).toFixed(4);
  const minRedeem  = Number(coinSettings?.min_redeem_coins || 100);
  const canRedeem  = currentCoins >= minRedeem;

  const ListHeader = () => (
    <>
      {/* ── Hero ──────────────────────────── */}
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.heroBanner}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroTop}>
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Text style={styles.heroCoinEmoji}>🪙</Text>
          </View>
          <View style={styles.heroCoinsInfo}>
            <Text style={styles.heroLabel}>Total Coins Balance</Text>
            <Text style={styles.heroCoins}>{currentCoins.toLocaleString()}</Text>
            <Text style={styles.heroCoins} />
          </View>
        </View>
        <View style={styles.heroValueRow}>
          <View style={styles.heroValueItem}>
            <Text style={styles.heroValueLabel}>NGN Value</Text>
            <Text style={styles.heroValueAmount}>₦{ngnValue.toLocaleString()}</Text>
          </View>
          <View style={styles.heroValueDivider} />
          <View style={styles.heroValueItem}>
            <Text style={styles.heroValueLabel}>USD Value</Text>
            <Text style={styles.heroValueAmount}>${usdValue}</Text>
          </View>
          <View style={styles.heroValueDivider} />
          <View style={styles.heroValueItem}>
            <Text style={styles.heroValueLabel}>Transactions</Text>
            <Text style={styles.heroValueAmount}>{totalRecord}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Redeem Button ─────────────────── */}
      <TouchableOpacity
        style={[
          styles.redeemBtn,
          { backgroundColor: canRedeem ? '#F59E0B' : colors.bgLight,
            borderColor: canRedeem ? '#F59E0B' : colors.dividerColor },
        ]}
        onPress={() => canRedeem && setShowRedeemModal(true)}
        disabled={!canRedeem}
        activeOpacity={0.85}>
        <Ionicons name="cash-outline" size={20} color={canRedeem ? '#fff' : colors.textSecColor} />
        <Text style={[styles.redeemBtnText, { color: canRedeem ? '#fff' : colors.textSecColor }]}>
          {canRedeem
            ? `Redeem Coins — Min ${minRedeem} coins`
            : `Need ${minRedeem - currentCoins} more coins to redeem`}
        </Text>
      </TouchableOpacity>

      {/* ── How to Earn ───────────────────── */}
      <View style={[styles.earnCard, { backgroundColor: colors.bgCard }]}>
        <Text style={[styles.earnTitle, { color: colors.textBlack }]}>
          💡 How to Earn Coins
        </Text>
        {[
          { icon: 'receipt-outline',         color: '#4C5FD5', text: 'Pay bills — earn coins on every bill payment' },
          { icon: 'swap-horizontal-outline', color: '#F59E0B', text: 'Buy or sell assets — earn coins on trades' },
          { icon: 'people-outline',          color: '#EC4899', text: 'Refer friends — earn coins when they sign up' },
        ].map((item, i) => (
          <View key={i} style={[styles.earnRow, { borderBottomColor: colors.dividerColor }]}>
            <View style={[styles.earnIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.earnText, { color: colors.textSecColor }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* ── History Header ────────────────── */}
      <Text style={[styles.historyTitle, { color: colors.textBlack }]}>
        Coin History
      </Text>
    </>
  );

  const ListFooter = () => {
    if (isLoading && history.length > 0) return (
      <ActivityIndicator color="#F59E0B" style={{ padding: spacing.xl }} />
    );
    if (isListEnd && history.length > 0) return (
      <Text style={[styles.listEnd, { color: colors.textSecColor }]}>
        All transactions loaded
      </Text>
    );
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Coins & Rewards</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={handleRefresh}>
          {isRefreshing
            ? <ActivityIndicator size={18} color="#F59E0B" />
            : <Ionicons name="refresh-outline" size={20} color={colors.textBlack} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Main List ───────────────────────────── */}
      {isLoading && history.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item._id || 'coin'}_${index}`}
          renderItem={({ item }) => <CoinItem item={item} colors={colors} />}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={<ListFooter />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🪙</Text>
              <Text style={[styles.emptyTitle, { color: colors.textBlack }]}>No Coins Yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecColor }]}>
                Start earning coins by paying bills, buying/selling assets or referring friends.
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={() => !isListEnd && loadHistory()}
          onEndReachedThreshold={0.3}
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#F59E0B']} />
          }
        />
      )}

      {/* ── Redeem Modal ─────────────────────────── */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRedeemModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.modalTitle, { color: colors.textBlack }]}>Redeem Coins</Text>
              <Text style={[styles.modalDesc, { color: colors.textSecColor }]}>
                Convert your coins to NGN credited directly to your main wallet.
              </Text>

              {/* Rate info */}
              <View style={[styles.rateCard, { backgroundColor: colors.bgLight }]}>
                <View style={styles.rateRow}>
                  <Text style={[styles.rateLabel, { color: colors.textSecColor }]}>Your Coins</Text>
                  <Text style={[styles.rateValue, { color: '#F59E0B' }]}>{currentCoins.toLocaleString()}</Text>
                </View>
                <View style={[styles.rateDivider, { backgroundColor: colors.dividerColor }]} />
                <View style={styles.rateRow}>
                  <Text style={[styles.rateLabel, { color: colors.textSecColor }]}>Rate</Text>
                  <Text style={[styles.rateValue, { color: colors.textBlack }]}>
                    1 coin = ₦{coinSettings?.coin_ngn_value || 1}
                  </Text>
                </View>
                <View style={[styles.rateDivider, { backgroundColor: colors.dividerColor }]} />
                <View style={styles.rateRow}>
                  <Text style={[styles.rateLabel, { color: colors.textSecColor }]}>Minimum</Text>
                  <Text style={[styles.rateValue, { color: colors.textBlack }]}>{minRedeem} coins</Text>
                </View>
              </View>

              {/* Coins input */}
              <View style={[styles.redeemInput, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                <Text style={styles.coinEmoji}>🪙</Text>
                <TextInput
                  style={[styles.redeemInputField, { color: colors.textBlack }]}
                  placeholder={`Min ${minRedeem} coins`}
                  placeholderTextColor={colors.textSecColor2}
                  keyboardType="numeric"
                  value={redeemCoins}
                  onChangeText={setRedeemCoins}
                />
              </View>

              {/* Preview */}
              {redeemCoins && Number(redeemCoins) > 0 && (
                <View style={[styles.previewRow, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.previewText}>
                    {redeemCoins} coins = ₦{(Number(redeemCoins) * Number(coinSettings?.coin_ngn_value || 1)).toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: '#F59E0B' },
                    (!redeemCoins || Number(redeemCoins) < minRedeem) && { opacity: 0.5 }]}
                  onPress={handleRedeem}
                  disabled={isRedeeming || !redeemCoins || Number(redeemCoins) < minRedeem}
                  activeOpacity={0.85}>
                  {isRedeeming
                    ? <ActivityIndicator color="#fff" size={20} />
                    : <Text style={styles.modalConfirmText}>Redeem Now</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => { setShowRedeemModal(false); setRedeemCoins(''); }}>
                  <Text style={[styles.modalCancelText, { color: colors.textSecColor }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xxxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerTitle: { fontFamily: '_bold', fontSize: typography.xl },
  backBtn: { width: 42, height: 42, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },

  // Hero
  heroBanner: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden', ...shadows.lg },
  heroCircle1: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' },
  heroCircle2: { position: 'absolute', left: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  heroIconBox: { width: 56, height: 56, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  heroCoinEmoji: { fontSize: 28 },
  heroCoinsInfo: { flex: 1 },
  heroLabel: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  heroCoins: { fontFamily: '_bold', fontSize: 36, color: '#fff', lineHeight: 44 },
  heroValueRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.lg, padding: spacing.md },
  heroValueItem: { flex: 1, alignItems: 'center' },
  heroValueLabel: { fontFamily: '_regular', fontSize: typography.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  heroValueAmount: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
  heroValueDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: spacing.sm },

  // Redeem Button
  redeemBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 52, borderRadius: radius.lg, marginHorizontal: spacing.xl, marginBottom: spacing.lg, gap: spacing.sm, borderWidth: 1.5 },
  redeemBtnText: { fontFamily: '_bold', fontSize: typography.base },

  // Earn Card
  earnCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  earnTitle: { fontFamily: '_bold', fontSize: typography.base, marginBottom: spacing.md },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, gap: spacing.md },
  earnIcon: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  earnText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // History
  historyTitle: { fontFamily: '_bold', fontSize: typography.lg, marginHorizontal: spacing.xl, marginBottom: spacing.md },

  // Coin Item
  coinItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, gap: spacing.md },
  coinItemIcon: { width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  coinItemInfo: { flex: 1 },
  coinItemLabel: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22, marginBottom: 2 },
  coinItemDesc: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20, marginBottom: 2 },
  coinItemDate: { fontFamily: '_regular', fontSize: typography.xs, lineHeight: 18 },
  coinItemRight: { alignItems: 'flex-end', flexShrink: 0 },
  coinItemAmount: { fontFamily: '_bold', fontSize: typography.xl, lineHeight: 26 },
  coinItemUnit: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 18 },
  coinItemBalance: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 18, marginTop: 2 },

  // Empty
  emptyState: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: '_bold', fontSize: typography.xl },
  emptyDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, textAlign: 'center' },

  // List footer
  listEnd: { fontFamily: '_regular', fontSize: typography.sm, textAlign: 'center', padding: spacing.xl },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  modalTitle: { fontFamily: '_bold', fontSize: typography.xxl, marginBottom: 4 },
  modalDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.lg },
  rateCard: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rateDivider: { height: 1 },
  rateLabel: { fontFamily: '_regular', fontSize: typography.base },
  rateValue: { fontFamily: '_bold', fontSize: typography.base },
  redeemInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56, gap: spacing.sm, marginBottom: spacing.md },
  coinEmoji: { fontSize: 22 },
  redeemInputField: { flex: 1, fontFamily: '_bold', fontSize: typography.xl, paddingVertical: 0 },
  previewRow: { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, alignItems: 'center' },
  previewText: { fontFamily: '_bold', fontSize: typography.base, color: '#92400E' },
  modalBtns: { gap: spacing.md },
  modalConfirmBtn: { height: 52, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  modalConfirmText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
  modalCancelBtn: { alignItems: 'center', padding: spacing.md },
  modalCancelText: { fontFamily: '_semiBold', fontSize: typography.base },
});

export default CoinsHistoryScreen;
