import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

const QUICK_AMOUNTS = ['1000', '2000', '5000', '10000', '20000', '50000'];

const WithdrawScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [note, setNote] = useState('');
  const [bankDetails, setBankDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBank, setIsFetchingBank] = useState(true);
  const [amountFocused, setAmountFocused] = useState(false);
  const [pinFocused, setPinFocused] = useState(false);
  const [pinSecure, setPinSecure] = useState(true);

  const walletBalance = Number(userInfo?.userData?.tran_account || 0);
  const userId = userInfo?.userData?._id;

  // ── Fetch user bank details ───────────────────
  useEffect(() => {
    const fetchBank = async () => {
      setIsFetchingBank(true);
      try {
        const res = await client.get(`/api/user_bankDetails/${userId}`, {
          headers: { 'Authorization': 'Bearer ' + userToken },
        });
        if (res.data.msg === '200') {
          setBankDetails(res.data.bankDetail);
        }
      } catch (error) {
        console.log('Bank fetch error:', error.message);
      } finally {
        setIsFetchingBank(false);
      }
    };
    if (isFocused) fetchBank();
  }, [isFocused]);

  // ── Validate ──────────────────────────────────
  const validate = () => {
    if (!bankDetails) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Bank Account', textBody: 'You need to add a bank account before withdrawing. Go to Profile → Bank Details.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Amount', textBody: 'Please enter a valid amount to withdraw.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) > walletBalance) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: `Your wallet balance is ₦${walletBalance.toLocaleString()}. You cannot withdraw more than your balance.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!pin || pin.length < 4) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'PIN Required', textBody: 'Please enter your 4-digit transaction PIN to authorise the withdrawal.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Submit withdrawal ─────────────────────────
  const handleWithdraw = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await client.post(
        '/api/withdrawFund_userMobile',
        {
          amount,
          pin,
          note,
          userId,
          bank_name: bankDetails?.bank_name,
          acct_name: bankDetails?.bank_acct_name,
          acct_number: bankDetails?.bank_acct_number,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Withdrawal Initiated!',
          textBody: `Your withdrawal of ₦${Number(amount).toLocaleString()} has been submitted. It will be processed within 24 hours.`,
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => {
            setAmount('');
            setPin('');
            setNote('');
            navigation.goBack();
          },
        });
      } else if (res.data.status === '401') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Invalid PIN', textBody: 'The transaction PIN you entered is incorrect. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else if (res.data.status === '403') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: 'Your wallet balance is not enough for this withdrawal.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsLoading(false);
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
                Withdraw Funds
              </Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons name="arrow-down-circle-outline" size={28} color="#F59E0B" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Withdraw to Bank</Text>
                <Text style={styles.heroDesc}>
                  Withdraw your wallet balance directly to your linked bank account
                </Text>
              </View>
            </LinearGradient>

            {/* ── Balance Card ──────────────────── */}
            <View style={[styles.balanceCard, {
              backgroundColor: colors.bgCard,
              borderColor: colors.dividerColor,
            }]}>
              <View style={[styles.balanceIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="wallet-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>
                  Available Balance
                </Text>
                <Text style={[styles.balanceValue, { color: colors.textBlack }]}>
                  ₦{walletBalance.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* ── Bank Account Card ─────────────── */}
            {isFetchingBank ? (
              <View style={[styles.bankLoadCard, { backgroundColor: colors.bgCard }]}>
                <ActivityIndicator color={colors.primaryColor1} />
                <Text style={[styles.bankLoadText, { color: colors.textSecColor }]}>
                  Loading bank details...
                </Text>
              </View>
            ) : bankDetails ? (
              <View style={[styles.bankCard, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>
                <View style={styles.bankCardHeader}>
                  <View style={[styles.bankIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="business-outline" size={20} color={colors.primaryColor1} />
                  </View>
                  <View style={styles.bankCardInfo}>
                    <Text style={[styles.bankCardTitle, { color: colors.textBlack }]}>
                      Withdrawal Account
                    </Text>
                    <Text style={[styles.bankCardSub, { color: colors.textSecColor }]}>
                      Funds will be sent to this account
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('BankDetails')}
                    style={[styles.changeBankBtn, { backgroundColor: colors.bgLight }]}>
                    <Text style={[styles.changeBankText, { color: colors.primaryColor1 }]}>
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.bankDivider, { backgroundColor: colors.dividerColor }]} />
                <Text style={[styles.bankDetailName, { color: colors.textBlack }]}>
                  {bankDetails.bank_acct_name}
                </Text>
                <Text style={[styles.bankDetailNumber, { color: colors.primaryColor1 }]}>
                  {bankDetails.bank_acct_number}
                </Text>
                <Text style={[styles.bankDetailBank, { color: colors.textSecColor }]}>
                  {bankDetails.bank_name}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.noBankCard, {
                  backgroundColor: colors.warningLight,
                  borderColor: '#FDE68A',
                }]}
                onPress={() => navigation.navigate('BankDetails')}
                activeOpacity={0.85}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warningColor} />
                <View style={styles.noBankInfo}>
                  <Text style={[styles.noBankTitle, { color: colors.textBlack }]}>
                    No Bank Account Found
                  </Text>
                  <Text style={[styles.noBankDesc, { color: colors.textSecColor }]}>
                    Tap here to add your bank account before withdrawing
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.warningColor} />
              </TouchableOpacity>
            )}

            {/* ── Form Card ────────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Withdrawal Amount (₦)
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: amountFocused ? '#F59E0B' : colors.dividerColor,
                    backgroundColor: amountFocused ? '#FEF3C7' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={amountFocused ? '#F59E0B' : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter amount to withdraw"
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
                      ? `Exceeds balance — max ₦${walletBalance.toLocaleString()}`
                      : `Remaining: ₦${(walletBalance - Number(amount)).toLocaleString()}`}
                  </Text>
                )}
              </View>

              {/* Quick Amounts */}
              <Text style={[styles.quickLabel, { color: colors.textSecColor }]}>
                Quick Select
              </Text>
              <View style={styles.quickAmtsRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickAmtBtn,
                      {
                        borderColor: amount === amt ? '#F59E0B' : colors.dividerColor,
                        backgroundColor: amount === amt ? '#FEF3C7' : colors.bgCard,
                      },
                    ]}
                    onPress={() => setAmount(amt)}
                    activeOpacity={0.8}>
                    <Text style={[
                      styles.quickAmtText,
                      { color: amount === amt ? '#F59E0B' : colors.textSecColor },
                    ]}>
                      ₦{Number(amt).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* PIN Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Transaction PIN
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: pinFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: pinFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={pinFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack, letterSpacing: 6 }]}
                    placeholder="Enter your 4-digit PIN"
                    placeholderTextColor={colors.textSecColor2}
                    keyboardType="numeric"
                    secureTextEntry={pinSecure}
                    maxLength={4}
                    value={pin}
                    onChangeText={setPin}
                    onFocus={() => setPinFocused(true)}
                    onBlur={() => setPinFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setPinSecure(!pinSecure)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons
                      name={pinSecure ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecColor}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Enter your 4-digit transaction PIN to authorise this withdrawal
                </Text>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity
                style={[
                  styles.withdrawBtn,
                  { backgroundColor: '#F59E0B' },
                  (!amount || !pin || isLoading || !bankDetails) && { opacity: 0.6 },
                ]}
                onPress={handleWithdraw}
                disabled={!amount || !pin || isLoading || !bankDetails}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="arrow-down-circle-outline" size={22} color="#fff" />
                    <Text style={styles.withdrawBtnText}>
                      Withdraw ₦{amount ? Number(amount).toLocaleString() : '0'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Processing Notice ─────────────── */}
            <View style={[styles.notice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                Withdrawals are processed within 24 hours on business days. Ensure your bank details are correct before submitting.
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
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Banner
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

  // Balance Card
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

  // Bank Card
  bankLoadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  bankLoadText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  bankCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankCardInfo: { flex: 1 },
  bankCardTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  bankCardSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
  changeBankBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  changeBankText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  bankDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  bankDetailName: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 26,
  },
  bankDetailNumber: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
    letterSpacing: 2,
    marginTop: 2,
  },
  bankDetailBank: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },

  // No Bank Card
  noBankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  noBankInfo: { flex: 1 },
  noBankTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  noBankDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },

  // Form Card
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  // Input
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
  inputField: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.lg,
    paddingVertical: 0,
  },
  inputHint: {
    fontFamily: '_regular',
    fontSize: typography.base,
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  // Quick Amounts
  quickLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  quickAmtsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAmtBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  quickAmtText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Withdraw Button
  withdrawBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  withdrawBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Notice
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

export default WithdrawScreen;