
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import { NumberValueFormat } from '../components/formatValue';
import BillScreenHeader from '../components/BillScreenHeader';
import BillAmountInput from '../components/BillAmountInput';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';

// ── DISCO List ────────────────────────────────────
import { DISCOS } from '../constants/discoList';
// ── Meter Type Selector ───────────────────────────
const MeterTypeSelector = ({ selectedType, onSelect }) => {
  const { colors } = useThemeStyles();
  return (
  
  <View style={styles.meterTypeContainer}>
    <Text style={styles.inputLabel}>Meter Type</Text>
    <View style={styles.meterTypeRow}>
      {['Prepaid', 'Postpaid'].map((type) => {
        const isSelected = selectedType === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.meterTypeBtn, isSelected && styles.meterTypeBtnSelected]}
            onPress={() => onSelect(type)}
            activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={type === 'Prepaid' ? 'meter-electric' : 'meter-electric-outline'}
              size={20}
              color={isSelected ? '#fff' : colors.textSecColor}
            />
            <Text style={[
              styles.meterTypeBtnText,
              isSelected && styles.meterTypeBtnTextSelected,
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
   );
  };

// ── DISCO Selector ────────────────────────────────
const DiscoSelector = ({ selectedDisco, onSelect }) => {
  const { colors } = useThemeStyles();
  const [showAll, setShowAll] = useState(false);
  const displayList = showAll ? DISCOS : DISCOS.slice(0, 6);

  return (
    <View style={styles.discoContainer}>
      <Text style={styles.inputLabel}>Select Your DISCO</Text>
      <Text style={styles.inputHint}>
        Choose the electricity distribution company for your area
      </Text>
      <View style={styles.discoGrid}>
        {displayList.map((disco) => {
          const isSelected = selectedDisco?.id === disco.id;
          return (
            <TouchableOpacity
              key={disco.id}
              style={[
                styles.discoCard,
                { borderColor: isSelected ? disco.color : colors.dividerColor },
                isSelected && { backgroundColor: disco.bgColor },
              ]}
              onPress={() => onSelect(disco)}
              activeOpacity={0.8}>
              <View style={[
                styles.discoIconBox,
                { backgroundColor: isSelected ? disco.color : disco.bgColor },
              ]}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={18}
                  color={isSelected ? '#fff' : disco.color}
                />
              </View>
              <Text style={[
                styles.discoLabel,
                isSelected && { color: disco.color, fontFamily: '_bold' },
              ]}
                numberOfLines={1}>
                {disco.id}
              </Text>
              <Text style={styles.discoState} numberOfLines={1}>
                {disco.state.split('/')[0]}
              </Text>
              {isSelected && (
                <View style={[styles.discoCheck, { backgroundColor: disco.color }]}>
                  <Text style={styles.discoCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={styles.showMoreBtn}
        onPress={() => setShowAll(!showAll)}>
        <Text style={styles.showMoreText}>
          {showAll ? 'Show Less' : `Show All ${DISCOS.length} DISCOs`}
        </Text>
        <Ionicons
          name={showAll ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.primaryColor1}
        />
      </TouchableOpacity>
    </View>
  );
};

// ── Meter Number Input ────────────────────────────
const MeterInput = ({ value, onChangeText, onVerify, isVerifying, verifiedName }) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Meter Number</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
      ]}>
        <MaterialCommunityIcons
          name="counter"
          size={20}
          color={isFocused ? colors.primaryColor1 : '#9CA3AF'}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          placeholder="Enter meter number"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={13}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value.length >= 11 && (
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={onVerify}
            disabled={isVerifying}>
            {isVerifying ? (
              <ActivityIndicator size={14} color={colors.primaryColor1} />
            ) : (
              <Text style={styles.verifyBtnText}>Verify</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {verifiedName ? (
        <View style={styles.verifiedRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
          <Text style={styles.verifiedText}>{verifiedName}</Text>
        </View>
      ) : (
        <Text style={styles.inputHint}>
          Enter your 11–13 digit meter number to verify
        </Text>
      )}
    </View>
  );
};

// ── Summary Row ───────────────────────────────────
const SummaryRow = ({ label, value, isTotal }) => {
  const { colors } = useThemeStyles();
  return (
  <View style={[styles.summaryRow, isTotal && styles.summaryRowTotal]}>
    <Text style={[styles.summaryLabel, isTotal && styles.summaryLabelTotal]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, isTotal && styles.summaryValueTotal]}>
      {value}
    </Text>
  </View>
    );
  };

// ── Rewards Tips Card ─────────────────────────────
const RewardsTipsCard = ({ serviceName, minAmount }) => {
  const { colors } = useThemeStyles();
  const [rewardRate, setRewardRate] = useState(null);
  const [coinValue, setCoinValue] = useState(null);

  useEffect(() => {
    const fetchRewardSettings = async () => {
      try {
        const res = await client.get('/api/rewards_settings');
        if (res.data.msg === '200') {
          setRewardRate(res.data.settings?.digital_services_coin_rate || null);
          setCoinValue(res.data.settings?.coin_ngn_value || null);
        }
      } catch (error) {
        console.log('Reward settings error:', error.message);
      }
    };
    fetchRewardSettings();
  }, []);

  return (
    <View style={styles.tipsCard}>
      <View style={styles.tipsTitleRow}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
        <Text style={styles.tipsTitle}>Quick Tips</Text>
      </View>
      <Text style={styles.tipText}>
        • Token is delivered to your email and SMS instantly
      </Text>
      <Text style={styles.tipText}>
        • Always verify your meter number before payment
      </Text>
      {rewardRate && (
        <Text style={styles.tipText}>
          • You earn <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text> on every {serviceName}
        </Text>
      )}
      {coinValue && (
        <Text style={styles.tipText}>
          • 🪙 1 coin = <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text> — redeemable as bonus
        </Text>
      )}
      <Text style={styles.tipText}>
        • Minimum {serviceName} payment is {minAmount}
      </Text>
      <Text style={styles.tipText}>
        • Top users earn quarterly & annual gift rewards 🎁
      </Text>
    </View>
  );
};

// ── Main Electricity Screen ───────────────────────
const ElectricityScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedDisco, setSelectedDisco] = useState(null);
  const [meterType, setMeterType] = useState('Prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('electricity');

  const walletBalance = userInfo?.userData?.tran_account || '0';

  useEffect(() => {
    if (isFocused) fetchServiceStatus();
  }, [isFocused]);

  // ── Verify Meter Number ───────────────────────
  const handleVerifyMeter = async () => {
    if (!selectedDisco) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select DISCO',
        textBody: 'Please select your electricity distribution company first.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    setIsVerifying(true);
    try {
      const res = await client.post('/api/bills/verify_meter', {
        disco: selectedDisco.id,
        meter_number: meterNumber,
        meter_type: meterType.toLowerCase(),
      }, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setVerifiedName(res.data.customer_name);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Meter Verified',
          textBody: `Customer: ${res.data.customer_name}`,
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Verification Failed',
          textBody: 'Could not verify meter number. Please check and try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        setVerifiedName('');
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Meter verification failed. Please try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Validation ────────────────────────────────
  const validateInputs = () => {
    if (!selectedDisco) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select DISCO',
        textBody: 'Please select your electricity distribution company.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!meterNumber || meterNumber.length < 11) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Meter Number',
        textBody: 'Please enter a valid meter number (11–13 digits).',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!verifiedName) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Verify Meter',
        textBody: 'Please verify your meter number before proceeding.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!amount || Number(amount) < 100) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Amount',
        textBody: 'Minimum electricity payment is ₦100.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (Number(amount) > Number(walletBalance)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient Balance',
        textBody: 'Your wallet balance is not enough. Please fund your account.',
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
    const isActive = await preFlightCheck();
    if (!isActive) return;
    setShowSummary(true);
  };

  // ── Handle Confirm & Pay ──────────────────────
  const handleConfirmPay = async () => {
    const isActive = await preFlightCheck();
    if (!isActive) return;
    setIsProcessing(true);
    try {
      navigation.navigate('BillsConfirm', {
        serviceType: 'electricity',
        serviceTitle: 'Electricity Token',
        disco: selectedDisco.id,
        discoName: selectedDisco.label,
        meterNumber,
        meterType,
        customerName: verifiedName,
        amount,
        fee: '0',
        totalAmount: amount,
        gradientColors: ['#F59E0B', '#D97706'],
        icon: 'flash-outline',
        summaryItems: [
          { label: 'DISCO', value: selectedDisco.label },
          { label: 'Meter Type', value: meterType },
          { label: 'Meter Number', value: meterNumber },
          { label: 'Customer Name', value: verifiedName },
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
              title="Electricity Token"
              description="Buy prepaid & postpaid electricity tokens for all 11 DISCOs across Nigeria instantly"
              icon="flash-outline"
              gradientColors={['#F59E0B', '#D97706']}
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {serviceStatus !== 'paused' && (
              <View style={styles.formCard}>

                {/* DISCO Selector */}
                <DiscoSelector
                  selectedDisco={selectedDisco}
                  onSelect={(disco) => {
                    setSelectedDisco(disco);
                    setVerifiedName('');
                  }}
                />

                {/* Meter Type */}
                <MeterTypeSelector
                  selectedType={meterType}
                  onSelect={(type) => {
                    setMeterType(type);
                    setVerifiedName('');
                  }}
                />

                {/* Meter Number */}
                <MeterInput
                  value={meterNumber}
                  onChangeText={(text) => {
                    setMeterNumber(text);
                    setVerifiedName('');
                  }}
                  onVerify={handleVerifyMeter}
                  isVerifying={isVerifying}
                  verifiedName={verifiedName}
                />

                {/* Amount */}
                <BillAmountInput
                  value={amount}
                  onChangeText={setAmount}
                  label="Payment Amount"
                  placeholder="Enter amount"
                  minAmount="100"
                  maxAmount="500000"
                  quickAmounts={['500', '1000', '2000', '5000', '10000', '20000']}
                />

                {/* Proceed Button */}
                <TouchableOpacity
                  style={[
                    gs.primaryButton,
                    { backgroundColor: '#F59E0B' },
                    (!selectedDisco || !meterNumber || !amount || !verifiedName)
                    && { opacity: 0.6 },
                  ]}
                  onPress={handleProceed}
                  disabled={
                    isCheckingStatus ||
                    !selectedDisco ||
                    !meterNumber ||
                    !amount ||
                    !verifiedName
                  }
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
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryDivider} />
                <SummaryRow label="DISCO" value={selectedDisco?.label} />
                <SummaryRow label="Meter Type" value={meterType} />
                <SummaryRow label="Meter Number" value={meterNumber} />
                <SummaryRow label="Customer Name" value={verifiedName} />
                <SummaryRow
                  label="Amount"
                  value={`₦${Number(amount).toLocaleString()}`}
                />
                <SummaryRow label="Service Fee" value="₦0.00" />
                <View style={styles.summaryDivider} />
                <SummaryRow
                  label="Total"
                  value={`₦${Number(amount).toLocaleString()}`}
                  isTotal
                />

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: '#F59E0B' },
                    isProcessing && { opacity: 0.7 },
                  ]}
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

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setShowSummary(false)}>
                  <Text style={styles.editBtnText}>Edit Order</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Rewards Tips ─────────────────── */}
            <RewardsTipsCard
              serviceName="electricity payment"
              minAmount="₦100"
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
    fontSize: typography.base,
    
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  // Verify Button
  verifyBtn: {
    
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verifyBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  verifiedText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },

  // Meter Type
  meterTypeContainer: {
    marginBottom: spacing.lg,
  },
  meterTypeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  meterTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    
    
    gap: spacing.sm,
  },
  meterTypeBtnSelected: {
  },
  meterTypeBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
  },
  meterTypeBtnTextSelected: {
  },

  // DISCO Selector
  discoContainer: {
    marginBottom: spacing.lg,
  },
  discoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  discoCard: {
    width: '30%',
    
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  discoIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  discoLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
    textAlign: 'center',
  },
  discoState: {
    fontFamily: '_regular',
    fontSize: 10,
    
    textAlign: 'center',
    marginTop: 2,
  },
  discoCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoCheckText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  showMoreText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
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
    flex: 1,
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
    marginBottom: spacing.lg,
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
  tipText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  tipHighlight: {
    fontFamily: '_bold',
    
  },
});

export default ElectricityScreen;