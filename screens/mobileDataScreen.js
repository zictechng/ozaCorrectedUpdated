
import React, { useState, useEffect, useContext } from 'react';
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
import BillScreenHeader from '../components/BillScreenHeader';
import NetworkSelector from '../components/NetworkSelector';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';
import { NETWORKS } from '../constants/networkList';
import { DATA_PLANS, getDataPlans } from '../constants/dataPlansList';

// ── Data Plan Card ────────────────────────────────
const DataPlanCard = ({ plan, isSelected, onSelect, networkColor }) => (
  <TouchableOpacity
    style={[
      styles.planCard,
      isSelected && {
        borderColor: networkColor,
        borderWidth: 2,
        backgroundColor: `${networkColor}10`,
      },
    ]}
    onPress={() => onSelect(plan)}
    activeOpacity={0.8}>

    {isSelected && (
      <View style={[styles.planCheck, { backgroundColor: networkColor }]}>
        <Text style={styles.planCheckText}>✓</Text>
      </View>
    )}

    <Text style={[
      styles.planSize,
      isSelected && { color: networkColor },
    ]}>
      {plan.label}
    </Text>

    <Text style={styles.planValidity}>{plan.validity}</Text>

    <Text style={[
      styles.planPrice,
      isSelected && { color: networkColor },
    ]}>
      ₦{Number(plan.price).toLocaleString()}
    </Text>

  </TouchableOpacity>
);

// ── Phone Number Input ────────────────────────────
const PhoneInput = ({ value, onChangeText, onUseMine }) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Phone Number</Text>
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
          style={styles.inputField}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          placeholder="e.g. 08012345678"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={11}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          onPress={onUseMine}
          style={styles.useMineBtn}>
          <Text style={styles.useMineBtnText}>Use Mine</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.inputHint}>
        Enter the 11-digit Nigerian mobile number to recharge
      </Text>
    </View>
  );
};

// ── Summary Row ───────────────────────────────────
const SummaryRow = ({ label, value, isTotal, valueColor }) => (
  <View style={[styles.summaryRow, isTotal && styles.summaryRowTotal]}>
    <Text style={[styles.summaryLabel, isTotal && styles.summaryLabelTotal]}>
      {label}
    </Text>
    <Text style={[
      styles.summaryValue,
      isTotal && styles.summaryValueTotal,
      valueColor && { color: valueColor },
    ]}>
      {value}
    </Text>
  </View>
);

// ── Rewards Tips Card ─────────────────────────────
const RewardsTipsCard = () => {
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
        • Data is activated on the number within seconds of payment
      </Text>
      <Text style={styles.tipText}>
        • We offer the cheapest data rates in Nigeria
      </Text>
      {rewardRate && (
        <Text style={styles.tipText}>
          • You earn <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text> on every data purchase
        </Text>
      )}
      {coinValue && (
        <Text style={styles.tipText}>
          • 🪙 1 coin = <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text> — redeemable as bonus
        </Text>
      )}
      <Text style={styles.tipText}>
        • Your wallet must have sufficient balance to proceed
      </Text>
      <Text style={styles.tipText}>
        • Top users earn quarterly & annual gift rewards 🎁
      </Text>
    </View>
  );
};

// ── Main Mobile Data Screen ───────────────────────
const MobileDataScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dataPlans, setDataPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('mobile_data');

  const walletBalance = userInfo?.userData?.tran_account || '0';
  const userPhone = userInfo?.userData?.phone || '';

  useEffect(() => {
    if (isFocused) fetchServiceStatus();
  }, [isFocused]);

  // ── Load Data Plans when network changes ──────
  useEffect(() => {
    if (!selectedNetwork) {
      setDataPlans([]);
      setSelectedPlan(null);
      return;
    }
    loadDataPlans(selectedNetwork);
  }, [selectedNetwork]);

  const loadDataPlans = async (network) => {
    setIsLoadingPlans(true);
    setSelectedPlan(null);
    try {
      // Try fetching live plans from backend first
      const res = await client.get(`/api/bills/data_plans/${network}`, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200' && res.data.plans?.length > 0) {
        setDataPlans(res.data.plans);
      } else {
        // Fallback to local constants if API not ready
        setDataPlans(getDataPlans(network));
      }
    } catch (error) {
      // Fallback to local constants
      setDataPlans(getDataPlans(network));
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // ── Get selected network color ────────────────
  const getNetworkColor = () => {
    return NETWORKS.find((n) => n.id === selectedNetwork)?.color || colors.primaryColor1;
  };

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
    if (!selectedPlan) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select Data Plan',
        textBody: 'Please select a data plan to continue.',
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
    if (Number(selectedPlan.price) > Number(walletBalance)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient Balance',
        textBody: 'Your wallet balance is not enough for this plan. Please fund your account.',
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
        serviceType: 'mobile_data',
        serviceTitle: 'Mobile Data',
        network: selectedNetwork,
        plan: selectedPlan.label,
        planApiCode: selectedPlan.apiCode,
        validity: selectedPlan.validity,
        phoneNumber,
        amount: selectedPlan.price,
        fee: '0',
        totalAmount: selectedPlan.price,
        gradientColors: ['#3B82F6', '#1D4ED8'],
        icon: 'wifi-outline',
        summaryItems: [
          { label: 'Network', value: selectedNetwork },
          { label: 'Data Plan', value: `${selectedPlan.label} — ${selectedPlan.validity}` },
          { label: 'Phone Number', value: phoneNumber },
          { label: 'Amount', value: `₦${Number(selectedPlan.price).toLocaleString()}` },
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

  const networkColor = getNetworkColor();

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
              title="Mobile Data"
              description="Buy the cheapest data bundles for MTN, Airtel, Glo & 9mobile — instant delivery guaranteed"
              icon="wifi-outline"
              gradientColors={['#3B82F6', '#1D4ED8']}
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {serviceStatus !== 'paused' && (
              <View style={styles.formCard}>

                {/* Network Selector — Reusable */}
                <NetworkSelector
                  selectedNetwork={selectedNetwork}
                  onSelect={(network) => {
                    setSelectedNetwork(network);
                    setShowSummary(false);
                  }}
                />

                {/* Data Plans Grid */}
                {selectedNetwork !== '' && (
                  <View style={styles.plansSection}>
                    <Text style={styles.inputLabel}>Select Data Plan</Text>
                    <Text style={styles.inputHint}>
                      Choose a plan that suits your data needs
                    </Text>

                    {isLoadingPlans ? (
                      <ActivityIndicator
                        size="large"
                        color={networkColor}
                        style={{ marginVertical: spacing.xl }}
                      />
                    ) : (
                      <View style={styles.plansGrid}>
                        {dataPlans.map((plan) => (
                          <DataPlanCard
                            key={plan.id}
                            plan={plan}
                            isSelected={selectedPlan?.id === plan.id}
                            onSelect={(p) => {
                              setSelectedPlan(p);
                              setShowSummary(false);
                            }}
                            networkColor={networkColor}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Phone Number */}
                {selectedPlan && (
                  <PhoneInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onUseMine={() => setPhoneNumber(userPhone)}
                  />
                )}

                {/* Selected Plan Summary Strip */}
                {selectedPlan && (
                  <View style={[
                    styles.selectedPlanStrip,
                    { borderLeftColor: networkColor },
                  ]}>
                    <MaterialCommunityIcons
                      name="wifi"
                      size={20}
                      color={networkColor}
                    />
                    <View style={styles.selectedPlanInfo}>
                      <Text style={styles.selectedPlanLabel}>
                        {selectedNetwork} — {selectedPlan.label}
                      </Text>
                      <Text style={styles.selectedPlanSub}>
                        {selectedPlan.validity} validity
                      </Text>
                    </View>
                    <Text style={[styles.selectedPlanPrice, { color: networkColor }]}>
                      ₦{Number(selectedPlan.price).toLocaleString()}
                    </Text>
                  </View>
                )}

                {/* Proceed Button */}
                {selectedPlan && phoneNumber.length === 11 && (
                  <TouchableOpacity
                    style={[
                      gs.primaryButton,
                      { backgroundColor: networkColor },
                      isCheckingStatus && { opacity: 0.7 },
                    ]}
                    onPress={handleProceed}
                    disabled={isCheckingStatus}
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
                        <Text style={gs.primaryButtonText}>
                          Proceed — ₦{Number(selectedPlan.price).toLocaleString()}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Order Summary ────────────────── */}
            {showSummary && serviceStatus !== 'paused' && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryDivider} />

                <SummaryRow label="Network" value={selectedNetwork} />
                <SummaryRow
                  label="Data Plan"
                  value={`${selectedPlan?.label}`}
                />
                <SummaryRow
                  label="Validity"
                  value={selectedPlan?.validity}
                />
                <SummaryRow
                  label="Phone Number"
                  value={phoneNumber}
                />
                <SummaryRow
                  label="Amount"
                  value={`₦${Number(selectedPlan?.price).toLocaleString()}`}
                />
                <SummaryRow label="Service Fee" value="₦0.00" />

                <View style={styles.summaryDivider} />

                <SummaryRow
                  label="Total"
                  value={`₦${Number(selectedPlan?.price).toLocaleString()}`}
                  isTotal
                  valueColor={networkColor}
                />

                {/* Wallet Balance Check */}
                <View style={styles.balanceCheckRow}>
                  <Ionicons
                    name={
                      Number(selectedPlan?.price) <= Number(walletBalance)
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={18}
                    color={
                      Number(selectedPlan?.price) <= Number(walletBalance)
                        ? colors.successColor
                        : colors.dangerColor
                    }
                  />
                  <Text style={styles.balanceCheckText}>
                    Wallet Balance: ₦{Number(walletBalance).toLocaleString()}
                  </Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: networkColor },
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
                        Confirm & Pay ₦{Number(selectedPlan?.price).toLocaleString()}
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
            <RewardsTipsCard />

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

  // Plans
  plansSection: {
    marginBottom: spacing.lg,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  planCard: {
    width: '22%',
    
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
  },
  planCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCheckText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  planSize: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    textAlign: 'center',
  },
  planValidity: {
    fontFamily: '_regular',
    fontSize: 10,
    
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  planPrice: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Selected Plan Strip
  selectedPlanStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    gap: spacing.md,
  },
  selectedPlanInfo: {
    flex: 1,
  },
  selectedPlanLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  selectedPlanSub: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },
  selectedPlanPrice: {
    fontFamily: '_bold',
    fontSize: typography.lg,
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
  balanceCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  balanceCheckText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  confirmBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 52,
    marginTop: spacing.sm,
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

export default MobileDataScreen;
