import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import RBSheet from 'react-native-raw-bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import { ShowLogoutModal } from '../components/controls';
import client from '../contextAPI/client';

// ── Quick Amount Button ───────────────────────────
const QuickAmount = ({ amount, selected, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.quickAmtBtn,
      {
        borderColor: selected ? colors.primaryColor1 : colors.dividerColor,
        backgroundColor: selected ? colors.bgLight : colors.bgCard,
      },
    ]}
    onPress={() => onSelect(amount)}
    activeOpacity={0.8}>
    <Text style={[
      styles.quickAmtText,
      { color: selected ? colors.primaryColor1 : colors.textSecColor },
    ]}>
      ₦{Number(amount).toLocaleString()}
    </Text>
  </TouchableOpacity>
);

const QUICK_AMOUNTS = ['1000', '2000', '5000', '10000', '20000', '50000'];

// ── Main Fund Account Screen ──────────────────────
const FundAccountScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const refCheckoutSheet = useRef();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);

  // Load min/max from local storage
  const [minimFunding, setMinimFunding] = useState(100);
  const [maxiFunding, setMaxiFunding] = useState(500000);

  React.useEffect(() => {
    AsyncStorage.getItem('AppSettingData').then((res) => {
      if (res) {
        const data = JSON.parse(res);
        if (data?.app_minim_funding) setMinimFunding(data.app_minim_funding);
        if (data?.app_maxi_funding) setMaxiFunding(data.app_maxi_funding);
      }
    }).catch(() => {});
  }, []);

  // ── Validation ────────────────────────────────
  const validate = () => {
    if (!amount || amount === '') {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Amount Required', textBody: 'Please enter the amount you want to fund.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) <= 0) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Invalid Amount', textBody: 'Please enter a valid amount greater than zero.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) < minimFunding) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Amount Too Low', textBody: `Minimum funding amount is ₦${Number(minimFunding).toLocaleString()}.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) > maxiFunding) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Amount Too High', textBody: `Maximum funding amount is ₦${Number(maxiFunding).toLocaleString()}.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Proceed Button ────────────────────────────
  const handleProceed = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    refCheckoutSheet.current.open();
  };

  // ── Manual Transfer ───────────────────────────
  const checkOutManually = async () => {
    setIsManualLoading(true);
    try {
      const res = await client.post(
        '/api/userAccount_funding',
        { amt: amount, note, userId: userInfo.userData._id },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        refCheckoutSheet.current.close();
        navigation.navigate('FundingNextPage', {
          payment: amount,
          track_id: res.data.feedback,
        });
        setAmount('');
        setNote('');
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsManualLoading(false);
    }
  };

  // ── Paystack Checkout ─────────────────────────
  const PaystackOut = async () => {
    setIsPaystackLoading(true);
    try {
      const checkRes = await client.get('/api/check_paymentBtn', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (checkRes.data.app_payStack_btn === false || checkRes.data.app_payStack_btn === 'false') {
        setShowGatewayModal(true);
        refCheckoutSheet.current.close();
        return;
      }
      const payStackData = {
        tag_id: userInfo.userData.tag_id,
        myId: userInfo.userData._id,
        amt: amount,
        note,
        userId: userInfo.userData._id,
        serviceName: 'Account Funding',
        serviceCategory: 'Exchange',
        method: 'Paystack Checkout',
        total_money: amount,
      };
      const res = await client.post('/api/check_fundingLimit', payStackData, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.status === '403' || res.data.status === '401') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: res.data.message || 'Funding limit exceeded.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        return;
      }
      refCheckoutSheet.current.close();
      navigation.navigate('FundAcctPaystackCheckout', { amt: payStackData });
      setAmount('');
      setNote('');
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not connect to payment gateway. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsPaystackLoading(false);
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
                Fund Account
              </Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={[colors.primaryColor1, colors.primaryColor1b]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <FontAwesome5 name="wallet" size={26} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Top Up Your Wallet</Text>
                <Text style={styles.heroDesc}>
                  Fund your account securely via Paystack or manual bank transfer
                </Text>
              </View>
            </LinearGradient>

            {/* ── Balance Card ──────────────────── */}
            <View style={[styles.balanceCard, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>
              <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>
                Current Wallet Balance
              </Text>
              <Text style={[styles.balanceValue, { color: colors.primaryColor1 }]}>
                ₦{Number(userInfo?.userData?.tran_account || 0).toLocaleString()}
              </Text>
            </View>

            {/* ── Form Card ────────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.formTitle, { color: colors.textBlack }]}>
                Enter Funding Details
              </Text>
              <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                Enter the amount you want to add to your wallet
              </Text>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Amount (₦)
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: amountFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: amountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={amountFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter amount in Naira"
                    placeholderTextColor={colors.textSecColor2}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(val) => setAmount(val.replace(/[^0-9]/g, ''))}
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                  />
                  {amount.length > 0 && (
                    <TouchableOpacity onPress={() => setAmount('')}>
                      <Ionicons name="close-circle" size={20} color={colors.textSecColor} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Min: ₦{Number(minimFunding).toLocaleString()} • Max: ₦{Number(maxiFunding).toLocaleString()}
                </Text>
              </View>

              {/* Quick Amounts */}
              <Text style={[styles.quickLabel, { color: colors.textSecColor }]}>
                Quick Select
              </Text>
              <View style={styles.quickAmtsRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <QuickAmount
                    key={amt}
                    amount={amt}
                    selected={amount === amt}
                    onSelect={setAmount}
                    colors={colors}
                  />
                ))}
              </View>

              {/* Note Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Purpose / Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                </Text>
                <View style={[
                  styles.noteContainer,
                  {
                    borderColor: noteFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: noteFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <TextInput
                    style={[styles.noteField, { color: colors.textBlack }]}
                    placeholder="e.g. Monthly top-up, Trading funds..."
                    placeholderTextColor={colors.textSecColor2}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={200}
                    onFocus={() => setNoteFocused(true)}
                    onBlur={() => setNoteFocused(false)}
                  />
                </View>
              </View>

              {/* Proceed Button */}
              <TouchableOpacity
                style={[
                  styles.proceedBtn,
                  { backgroundColor: colors.primaryColor1 },
                  !amount && { opacity: 0.6 },
                ]}
                onPress={handleProceed}
                disabled={!amount}
                activeOpacity={0.85}>
                <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
                <Text style={styles.proceedBtnText}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.securityNotice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                All transactions are secured with bank-level encryption. Your funds are protected at all times.
              </Text>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Checkout Method Bottom Sheet ─────────── */}
      <RBSheet
        ref={refCheckoutSheet}
        closeOnDragDown
        closeOnPressMask
        openDuration={400}
        closeDuration={300}
        height={300}
        closeOnPressBack
        customStyles={{
          container: {
            backgroundColor: colors.bgColor,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
          draggableIcon: { backgroundColor: colors.dividerColor },
        }}>
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: colors.textBlack }]}>
            Choose Payment Method
          </Text>
          <Text style={[styles.sheetDesc, { color: colors.textSecColor }]}>
            Select how you want to fund ₦{Number(amount).toLocaleString()}
          </Text>

          <View style={[styles.sheetDivider, { backgroundColor: colors.dividerColor }]} />

          {/* Paystack Button */}
          <TouchableOpacity
            style={[styles.sheetBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={PaystackOut}
            disabled={isPaystackLoading}
            activeOpacity={0.85}>
            {isPaystackLoading ? (
              <ActivityIndicator color="#fff" size={22} />
            ) : (
              <>
                <Ionicons name="card-outline" size={22} color="#fff" />
                <View style={styles.sheetBtnInfo}>
                  <Text style={styles.sheetBtnText}>Pay with Paystack</Text>
                  <Text style={styles.sheetBtnSub}>Instant • Debit/Credit Card</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
              </>
            )}
          </TouchableOpacity>

          {/* Manual Transfer Button */}
          <TouchableOpacity
            style={[styles.sheetBtn, {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: colors.primaryColor1,
            }]}
            onPress={checkOutManually}
            disabled={isManualLoading}
            activeOpacity={0.85}>
            {isManualLoading ? (
              <ActivityIndicator color={colors.primaryColor1} size={22} />
            ) : (
              <>
                <Ionicons name="business-outline" size={22} color={colors.primaryColor1} />
                <View style={styles.sheetBtnInfo}>
                  <Text style={[styles.sheetBtnText, { color: colors.primaryColor1 }]}>
                    Manual Bank Transfer
                  </Text>
                  <Text style={[styles.sheetBtnSub, { color: colors.textSecColor }]}>
                    Bank transfer • Takes 1–24 hours
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primaryColor1} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </RBSheet>

      {/* ── Gateway Unavailable Modal ─────────────── */}
      <ShowLogoutModal
        openModal={showGatewayModal}
        animationType="fade"
        modalTitle="Gateway Unavailable"
        ModalDesc="Paystack payment gateway is currently unavailable. Please use Manual Bank Transfer instead."
        closeBtn={() => setShowGatewayModal(false)}
        logoutBtn={() => setShowGatewayModal(false)}
        modalBgColor="rgba(0,0,0,0.5)"
        bntYesText="Okay"
      />
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
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
    ...shadows.card,
  },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    lineHeight: 42,
  },

  // Form Card
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  formTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 4,
  },
  formDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.xl,
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
    fontSize: typography.xl,
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

  // Note Input
  noteContainer: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 90,
  },
  noteField: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlignVertical: 'top',
  },

  // Proceed Button
  proceedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  proceedBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Bottom Sheet
  sheetContent: {
    padding: spacing.xl,
    flex: 1,
  },
  sheetTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 4,
  },
  sheetDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  sheetDivider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  sheetBtnInfo: { flex: 1 },
  sheetBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
  },
  sheetBtnSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginTop: 2,
  },
});

export default FundAccountScreen;