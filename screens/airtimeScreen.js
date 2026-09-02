
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import { NumberValueFormat } from '../components/formatValue';
import BillScreenHeader from '../components/BillScreenHeader';
import NetworkSelector from '../components/NetworkSelector';
import BillAmountInput from '../components/BillAmountInput';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';

// ── Phone Number Input ────────────────────────────
// ── Rewards Tips Card — fetches rate from admin ───
const RewardsTipsCard = ({ serviceType, serviceName, minAmount }) => {
  const { colors } = useThemeStyles();
  const [rewardRate, setRewardRate] = useState(null);
  const [coinValue, setCoinValue] = useState(null);

  useEffect(() => {
    const fetchRewardSettings = async () => {
      try {
        const res = await client.get('/api/rewards_settings');
        if (res.data.msg === '200') {
          const settings = res.data.settings;
          setRewardRate(settings?.digital_services_coin_rate || null);
          setCoinValue(settings?.coin_ngn_value || null);
        }
      } catch (error) {
        console.log('Reward settings fetch error:', error.message);
      }
    };
    fetchRewardSettings();
  }, []);

  return (
    <View style={[styles.tipsCard, { backgroundColor: colors.bgLight }]}>
      <View style={styles.tipsTitleRow}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
        <Text style={[styles.tipsTitle, { color: colors.primaryColor1 }]}>Quick Tips</Text>
      </View>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Airtime is delivered instantly to the phone number provided
      </Text>
      {rewardRate && (
        <Text style={[styles.tipText, { color: colors.textSecColor }]}>
          • You earn <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text> on every {serviceName}
        </Text>
      )}
      {coinValue && (
        <Text style={[styles.tipText, { color: colors.textSecColor }]}>
          • 🪙 1 coin = <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text> — redeemable as bonus
        </Text>
      )}
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Minimum {serviceName} amount is {minAmount}
      </Text>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Your wallet must have sufficient balance to proceed
      </Text>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Top users earn quarterly & annual gift rewards 🎁
      </Text>
    </View>
  );
};

// ── Phone Number Input ────────────────────────────
const PhoneInput = ({ value, onChangeText, onUseMine }) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Phone Number</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
      ]}>
        <Ionicons
          name="phone-portrait-outline"
          size={20}
          color={isFocused ? colors.primaryColor1 : '#9CA3AF'}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.inputField, { color: colors.textBlack }]}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          placeholder="e.g. 08012345678"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={11}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity onPress={onUseMine} style={[styles.useMineBtn, { backgroundColor: colors.bgLight }]}>
          <Text style={[styles.useMineBtnText, { color: colors.primaryColor1 }]}>Use Mine</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.inputHint, { color: colors.textSecColor }]}>Enter 11-digit Nigerian mobile number</Text>
    </View>
  );
};

// ── Summary Row ───────────────────────────────────
const SummaryRow = ({ label, value, isTotal }) => (
  <View style={[styles.summaryRow, isTotal && styles.summaryRowTotal]}>
    <Text style={[styles.summaryLabel, isTotal && styles.summaryLabelTotal]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, isTotal && styles.summaryValueTotal]}>
      {value}
    </Text>
  </View>
);

// ── Main Airtime Screen ───────────────────────────
const AirtimeScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // ── Reusable bill service hook ────────────────
  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('airtime');

  const walletBalance = userInfo?.userData?.tran_account || '0';
  const userPhone = userInfo?.userData?.phone || '';

  useEffect(() => {
    if (isFocused) fetchServiceStatus();
  }, [isFocused]);

  // ── Validation ────────────────────────────────
  const validateInputs = () => {
    if (!selectedNetwork) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select Network',
        textBody: 'Please select a network provider to continue.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!phoneNumber || phoneNumber.length < 11) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Phone Number',
        textBody: 'Please enter a valid 11-digit Nigerian phone number.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!amount || Number(amount) < 50) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Amount',
        textBody: 'Minimum airtime recharge is ₦50.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (Number(amount) > Number(walletBalance)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient Balance',
        textBody: 'Your wallet balance is not enough for this transaction. Please fund your account.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    return true;
  };

  // ── Handle Proceed ────────────────────────────
  const handleProceed = async () => {
    Keyboard.dismiss();
    if (!validateInputs()) return;

    // Pre-flight status check before navigating
    const isActive = await preFlightCheck();
    if (!isActive) return;

    setShowSummary(true);
  };

  // ── Handle Confirm & Pay ──────────────────────
  const handleConfirmPay = async () => {
    // Second pre-flight check right before payment
    const isActive = await preFlightCheck();
    if (!isActive) return;

    setIsProcessing(true);
    try {
      navigation.navigate('BillsConfirm', {
        serviceType: 'airtime',
        serviceTitle: 'Airtime Recharge',
        network: selectedNetwork,
        phoneNumber,
        amount,
        fee: '0',
        totalAmount: amount,
        gradientColors: ['#EC4899', '#DB2777'],
        icon: 'phone-in-talk-outline',
        summaryItems: [
          { label: 'Network', value: selectedNetwork },
          { label: 'Phone Number', value: phoneNumber },
          { label: 'Amount', value: `₦${Number(amount).toLocaleString()}` },
          { label: 'Service Fee', value: '₦0.00' },
        ],
      });
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Something went wrong. Please try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
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
            contentContainerStyle={styles.scrollContent}>

            {/* ── Reusable Header ─────────────── */}
            <BillScreenHeader
              navigation={navigation}
              title="Buy Airtime"
              description="Instant airtime recharge for MTN, Airtel, Glo & 9mobile at discounted rates"
              icon="phone-portrait-outline"
              gradientColors={['#EC4899', '#DB2777']}
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {/* ── Form Section ─────────────────── */}
            {serviceStatus !== 'paused' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

                {/* Network Selector — Reusable */}
                <NetworkSelector
                  selectedNetwork={selectedNetwork}
                  onSelect={setSelectedNetwork}
                />

                {/* Phone Number */}
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onUseMine={() => setPhoneNumber(userPhone)}
                />

                {/* Amount Input — Reusable */}
                <BillAmountInput
                  value={amount}
                  onChangeText={setAmount}
                  label="Recharge Amount"
                  placeholder="Enter amount"
                  minAmount="50"
                  maxAmount="50000"
                  quickAmounts={['100', '200', '500', '1000', '2000', '5000']}
                />

                {/* Proceed Button */}
                <TouchableOpacity
                  style={[
                    gs.primaryButton,
                    (!selectedNetwork || !phoneNumber || !amount) && { opacity: 0.6 },
                  ]}
                  onPress={handleProceed}
                  disabled={isCheckingStatus || !selectedNetwork || !phoneNumber || !amount}
                  activeOpacity={0.85}>
                  {isCheckingStatus ? (
                    <ActivityIndicator color="#fff" size={22} />
                  ) : (
                    <>
                      <Ionicons
                        name="arrow-forward-circle-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: spacing.sm }}
                      />
                      <Text style={gs.primaryButtonText}>Proceed</Text>
                    </>
                  )}
                </TouchableOpacity>

              </View>
            )}

            {/* ── Order Summary ────────────────── */}
            {showSummary && serviceStatus !== 'paused' && (
              <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.summaryTitle, { color: colors.textBlack }]}>Order Summary</Text>
                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />
                <SummaryRow label="Network" value={selectedNetwork} />
                <SummaryRow label="Phone Number" value={phoneNumber} />
                <SummaryRow
                  label="Amount"
                  value={`₦${Number(amount).toLocaleString()}`}
                />
                <SummaryRow label="Service Fee" value="₦0.00" />
                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />
                <SummaryRow
                  label="Total"
                  value={`₦${Number(amount).toLocaleString()}`}
                  isTotal
                />

                {/* Confirm Pay Button */}
                <TouchableOpacity
                  style={[styles.confirmBtn, isProcessing && { opacity: 0.7 }]}
                  onPress={handleConfirmPay}
                  disabled={isProcessing}
                  activeOpacity={0.85}>
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" size={22} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: spacing.sm }}
                      />
                      <Text style={gs.primaryButtonText}>
                        Confirm & Pay ₦{Number(amount).toLocaleString()}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Edit Order */}
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setShowSummary(false)}>
                  <Text style={[styles.editBtnText, { color: colors.textSecColor }]}>Edit Order</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Info Tips ────────────────────── */}
            <RewardsTipsCard
              serviceType="digital_services"
              serviceName="airtime recharge"
              minAmount="₦50"
            />

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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

  // Form Card
  formCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  // Input
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputContainerFocused: {
  },
  inputIcon: {
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
    fontSize: typography.sm,
    
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  useMineBtn: {
    
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  useMineBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },

  // Summary Card
  summaryCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  summaryTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
    marginBottom: spacing.md,
  },
  summaryDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryRowTotal: {
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  summaryLabelTotal: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    
  },
  summaryValue: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  summaryValueTotal: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
  },
  confirmBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    height: 52,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  editBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  editBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },

  // Tips Card
  tipsCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    borderWidth: 1,
  },
    tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tipsTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  tipHighlight: {
    fontFamily: '_bold',
    
  },
  tipText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
});

export default AirtimeScreen;
