import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';

// ── Asset Types ───────────────────────────────────
const ASSETS = [
  {
    id: 'paypal',
    label: 'PayPal',
    image: paypalImage,
    color: '#003087',
    bgColor: '#E8F0FE',
    currency: 'USD',
    placeholder: 'Enter NGN amount to spend',
    hint: 'Enter the Naira amount you want to spend to buy PayPal balance',
  },
  {
    id: 'payoneer',
    label: 'Payoneer',
    image: payoonerImage,
    color: '#FF4800',
    bgColor: '#FFF0EB',
    currency: 'USD',
    placeholder: 'Enter NGN amount to spend',
    hint: 'Enter the Naira amount you want to spend to buy Payoneer balance',
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    image: bitcoinImage,
    color: '#F7931A',
    bgColor: '#FFF4E5',
    currency: 'BTC',
    placeholder: 'Enter NGN amount to spend',
    hint: 'Enter the Naira amount you want to spend to buy Bitcoin',
  },
];

// ── Asset Card ────────────────────────────────────
const AssetCard = ({ asset, isSelected, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.assetCard,
      { backgroundColor: colors.bgCard, borderColor: colors.dividerColor },
      isSelected && { borderColor: asset.color, backgroundColor: asset.bgColor },
    ]}
    onPress={() => onSelect(asset)}
    activeOpacity={0.85}>
    <Image source={asset.image} style={styles.assetImage} resizeMode="contain" />
    <Text style={[
      styles.assetLabel,
      { color: colors.textBlack },
      isSelected && { color: asset.color },
    ]}>
      {asset.label}
    </Text>
    {isSelected && (
      <View style={[styles.assetCheck, { backgroundColor: asset.color }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    )}
  </TouchableOpacity>
);

// ── Rate Row ──────────────────────────────────────
const RateRow = ({ label, value, colors }) => (
  <View style={[styles.rateRow, { borderBottomColor: colors.dividerColor }]}>
    <Text style={[styles.rateLabel, { color: colors.textSecColor }]}>{label}</Text>
    <Text style={[styles.rateValue, { color: colors.textBlack }]}>{value}</Text>
  </View>
);

// ── Main Buy Screen ───────────────────────────────
const BuyScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountDetail, setAccountDetail] = useState('');
  const [selectedRate, setSelectedRate] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [accountFocused, setAccountFocused] = useState(false);

  const walletBalance = Number(userInfo?.userData?.tran_account || 0);

  // ── Fetch rates when asset selected ──────────
  useEffect(() => {
    if (!selectedAsset) return;
    fetchRates(selectedAsset.id);
  }, [selectedAsset]);

    const fetchRates = async (assetId) => {
    setIsLoadingRates(true);
    setSelectedRate(null);
    try {
      const res = await client.get('/api/fetchRate', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        const rateData = res.data.infoData;
        // Map asset id to the correct selling rate field
        let rate = null;
        if (assetId === 'paypal') {
          rate = rateData?.paypal_selling;
        } else if (assetId === 'payoneer') {
          rate = rateData?.payoneer_selling;
        } else if (assetId === 'bitcoin') {
          rate = rateData?.btc_selling;
        }
        if (rate) {
          setSelectedRate({ rate, _id: assetId });
        } else {
          setSelectedRate(null);
        }
      }
    } catch (error) {
      console.log('Fetch rates error:', error.message);
    } finally {
      setIsLoadingRates(false);
    }
  };

  // ── Calculate USD equivalent ──────────────────
  const usdEquivalent = () => {
    if (!amount || !selectedRate?.rate) return '0.00';
    return (Number(amount) / Number(selectedRate.rate)).toFixed(2);
  };

  // ── Validate ──────────────────────────────────
  const validate = () => {
    if (!selectedAsset) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Asset', textBody: 'Please select a digital asset you want to buy.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Amount', textBody: 'Please enter a valid Naira amount to spend.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) > walletBalance) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: `Your wallet balance is ₦${walletBalance.toLocaleString()}. Please fund your wallet first.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!accountDetail.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Account Required', textBody: `Please enter your ${selectedAsset.label} account email or address to receive the funds.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!selectedRate) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Rate', textBody: 'No exchange rate available. Please try again later.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Proceed to checkout ───────────────────────
    const handleProceed = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setIsProcessing(true);
    try {
      const manualData = {
        tag_id: userInfo?.userData?.tag_id,
        myId: userInfo?.userData?._id,
        buy_amt: amount,
        serviceName: selectedAsset.label,
        serviceCategory: 'Exchange',
        method: 'Manual Checkout',
        total_money: (Number(amount) / Number(selectedRate.rate)).toFixed(2),
        serviceType: selectedAsset.id,
        accountDetail: accountDetail.trim(),
        currency: selectedAsset.currency,
      };

      const res = await client.post(
        '/api/fundBuy_funding',
        manualData,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );

      if (res.data.msg === '200') {
        navigation.navigate('CheckManual', {
          asset: selectedAsset.id,
          assetLabel: selectedAsset.label,
          amount: usdEquivalent(),
          rate: selectedRate.rate,
          ngnAmount: amount,
          rateId: selectedRate._id,
          currency: selectedAsset.currency,
          userId: userInfo?.userData?._id,
        });
        setAmount('');
        setAccountDetail('');
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">

            {/* ── Header ──────────────────────── */}
            <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                Buy Assets
              </Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons name="trending-down" size={28} color="#3B82F6" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Buy Digital Assets</Text>
                <Text style={styles.heroDesc}>
                  Buy PayPal, Payoneer or Bitcoin using your wallet balance at the best rates
                </Text>
              </View>
            </LinearGradient>

            {/* ── Wallet Balance ────────────────── */}
            <View style={[styles.balanceCard, {
              backgroundColor: colors.bgCard,
              borderColor: colors.dividerColor,
            }]}>
              <View style={[styles.balanceIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>
                  Wallet Balance
                </Text>
                <Text style={[styles.balanceValue, { color: colors.textBlack }]}>
                  ₦{walletBalance.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.fundBtn, { backgroundColor: '#3B82F6' }]}
                onPress={() => navigation.navigate('FundAccount')}
                activeOpacity={0.85}>
                <Text style={styles.fundBtnText}>Add Funds</Text>
              </TouchableOpacity>
            </View>

            {/* ── Select Asset ──────────────────── */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                Select Asset to Buy
              </Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecColor }]}>
                Choose the digital asset you want to purchase with your Naira balance
              </Text>
              <View style={styles.assetsRow}>
                {ASSETS.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAsset?.id === asset.id}
                    onSelect={(a) => {
                      setSelectedAsset(a);
                      setAmount('');
                      setAccountDetail('');
                    }}
                    colors={colors}
                  />
                ))}
              </View>
            </View>

            {/* ── Rate Card ─────────────────────── */}
            {selectedAsset && (
              <View style={[styles.rateCard, {
                backgroundColor: colors.bgCard,
                borderColor: selectedAsset.color,
              }]}>
                <View style={styles.rateCardHeader}>
                  <Image
                    source={selectedAsset.image}
                    style={styles.rateCardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.rateCardInfo}>
                    <Text style={[styles.rateCardTitle, { color: colors.textBlack }]}>
                      {selectedAsset.label} Buy Rate
                    </Text>
                    <Text style={[styles.rateCardSub, { color: colors.textSecColor }]}>
                      Current selling rate from our platform
                    </Text>
                  </View>
                </View>
                {isLoadingRates ? (
                  <ActivityIndicator
                    color={selectedAsset.color}
                    style={{ marginVertical: spacing.lg }}
                  />
                ) : selectedRate ? (
                  <>
                    <View style={[styles.rateDivider, { backgroundColor: colors.dividerColor }]} />
                    <RateRow
                      label="Exchange Rate"
                      value={`₦${Number(selectedRate.rate).toLocaleString()} per $1`}
                      colors={colors}
                    />
                    {selectedRate.min_amount && (
                      <RateRow
                        label="Minimum Amount"
                        value={`₦${Number(selectedRate.min_amount * selectedRate.rate).toLocaleString()}`}
                        colors={colors}
                      />
                    )}
                  </>
                ) : (
                  <Text style={[styles.noRateText, { color: colors.textSecColor }]}>
                    No rate available at the moment. Please try again later.
                  </Text>
                )}
              </View>
            )}

            {/* ── Form Card ────────────────────── */}
            {selectedAsset && selectedRate && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

                {/* NGN Amount */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Amount to Spend (₦)
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: amountFocused
                        ? selectedAsset.color
                        : colors.dividerColor,
                        backgroundColor: colors.bgLight,
                    },
                  ]}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={amountFocused ? selectedAsset.color : colors.textSecColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="Enter Naira amount to spend"
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                      onFocus={() => setAmountFocused(true)}
                      onBlur={() => setAmountFocused(false)}
                    />
                    {amount.length > 0 && (
                      <TouchableOpacity onPress={() => setAmount('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {amount.length > 0 && (
                    <Text style={[styles.inputHint, {
                      color: Number(amount) > walletBalance
                        ? colors.dangerColor
                        : colors.successColor,
                    }]}>
                      {Number(amount) > walletBalance
                        ? `Insufficient — balance is ₦${walletBalance.toLocaleString()}`
                        : `Remaining: ₦${(walletBalance - Number(amount)).toLocaleString()}`}
                    </Text>
                  )}
                </View>

                {/* USD Equivalent */}
                {amount.length > 0 && (
                  <View style={[styles.equivalentCard, {
                    backgroundColor: colors.bgLight,
                    borderColor: selectedAsset.color,
                  }]}>
                    <Text style={[styles.equivalentLabel, { color: colors.textSecColor }]}>
                      You will receive approximately
                    </Text>
                    <Text style={[styles.equivalentValue, { color: selectedAsset.color }]}>
                      ${usdEquivalent()} {selectedAsset.currency}
                    </Text>
                    <Text style={[styles.equivalentNote, { color: colors.textSecColor }]}>
                      Rate: ₦{Number(selectedRate.rate).toLocaleString()} per $1
                    </Text>
                  </View>
                )}

                {/* Account Detail */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    {selectedAsset.label === 'Bitcoin'
                      ? 'Bitcoin Wallet Address'
                      : `${selectedAsset.label} Email Address`}
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: accountFocused ? colors.primaryColor1 : colors.dividerColor,
                      backgroundColor: accountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                    },
                  ]}>
                    <Image
                      source={selectedAsset.image}
                      style={styles.inputAssetIcon}
                      resizeMode="contain"
                    />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder={
                        selectedAsset.label === 'Bitcoin'
                          ? 'Enter your Bitcoin wallet address'
                          : `Enter your ${selectedAsset.label} email`
                      }
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType={
                        selectedAsset.label === 'Bitcoin' ? 'default' : 'email-address'
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={accountDetail}
                      onChangeText={setAccountDetail}
                      onFocus={() => setAccountFocused(true)}
                      onBlur={() => setAccountFocused(false)}
                    />
                  </View>
                  <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                    {selectedAsset.hint}
                  </Text>
                </View>

                {/* Proceed Button */}
                <TouchableOpacity
                  style={[
                    styles.proceedBtn,
                    { backgroundColor: selectedAsset?.color || '#3B82F6' },
                    (!amount || !accountDetail || isProcessing) && { opacity: 0.6 },
                  ]}
                  onPress={handleProceed}
                  disabled={!amount || !accountDetail || isProcessing}
                  activeOpacity={0.85}>
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" size={22} />
                  ) : (
                    <>
                      <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
                      <Text style={styles.proceedBtnText}>
                        Buy {selectedAsset.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── How it Works ──────────────────── */}
            <View style={[styles.howCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.howTitle, { color: colors.textBlack }]}>
                How It Works
              </Text>
              {[
                { icon: 'hand-left-outline', text: 'Select the asset you want to buy and enter the NGN amount' },
                { icon: 'mail-outline', text: 'Provide your account email or wallet address to receive the funds' },
                { icon: 'checkmark-circle-outline', text: 'We deduct the NGN amount from your wallet and process your order' },
                { icon: 'time-outline', text: 'Your digital asset is delivered to your account within minutes' },
              ].map((step, i) => (
                <View key={i} style={styles.howRow}>
                  <View style={[styles.howNum, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name={step.icon} size={18} color="#3B82F6" />
                  </View>
                  <Text style={[styles.howText, { color: colors.textSecColor }]}>
                    {step.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.notice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                Always double-check your account details before proceeding. Incorrect account details may result in loss of funds.
              </Text>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBanner: {
    marginHorizontal: spacing.xl,
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
    lineHeight: 22,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.card,
  },
  balanceIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  balanceValue: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
  },
  fundBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  fundBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  assetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  assetCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    position: 'relative',
    ...shadows.sm,
  },
  assetImage: {
    width: 40,
    height: 40,
    marginBottom: spacing.sm,
    borderRadius: radius.sm,
  },
  assetLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
  },
  assetCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    ...shadows.card,
  },
  rateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rateCardImage: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },
  rateCardInfo: { flex: 1 },
  rateCardTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  rateCardSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
  rateDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  rateLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  rateValue: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  noRateText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  inputAssetIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.lg,
    paddingVertical: 0,
  },
  inputHint: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  equivalentCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
  },
  equivalentLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  equivalentValue: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    lineHeight: 42,
  },
  equivalentNote: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 4,
  },
  proceedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  proceedBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  howCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  howTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.lg,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  howNum: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  howText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
    paddingTop: spacing.xs,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  noticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
});

export default BuyScreen;