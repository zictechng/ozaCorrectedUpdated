import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView,
  Platform, TextInput,
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
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';

// ── Fixed clean networks — Step 1 ────────────────
const CLEAN_NETWORKS = [
  { id: 'mtn',     label: 'MTN',     color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  { id: 'airtel',  label: 'Airtel',  color: '#EF4444', bgColor: '#FEE2E2', textColor: '#991B1B' },
  { id: 'glo',     label: 'Glo',     color: '#10B981', bgColor: '#D1FAE5', textColor: '#065F46' },
  { id: '9mobile', label: '9mobile', color: '#059669', bgColor: '#ECFDF5', textColor: '#064E3B' },
];

// Category display names — maps raw type key to clean label + icon
const CATEGORY_META = {
  sme:       { label: 'SME',       icon: 'phone-portrait-outline', desc: 'Cheapest rates — personal use' },
  gifting:   { label: 'Gifting',   icon: 'gift-outline',           desc: 'Gift data to others' },
  corporate: { label: 'Corporate', icon: 'business-outline',       desc: 'Business plans' },
  awoof:     { label: 'Awoof',     icon: 'pricetag-outline',        desc: 'Special offer plans' },
  cg:        { label: 'CG',        icon: 'star-outline',           desc: 'CG data plans' },
  direct:    { label: 'Direct',    icon: 'flash-outline',          desc: 'Standard data plans' },
  data:      { label: 'Data',      icon: 'wifi-outline',           desc: 'Regular data plans' },
};

const getCategoryMeta = (typeKey) =>
  CATEGORY_META[typeKey?.toLowerCase()] || {
    label: typeKey?.toUpperCase() || 'Data',
    icon: 'wifi-outline',
    desc: 'Data plans',
  };

// ── Step Indicator ────────────────────────────────
const StepIndicator = ({ currentStep, colors }) => {
  const steps = ['Network', 'Type', 'Plan', 'Pay'];
  return (
    <View style={styles.stepRow}>
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        return (
          <View key={step} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              { borderColor: colors.dividerColor, backgroundColor: colors.bgColor },
              isActive && { borderColor: colors.primaryColor1, backgroundColor: colors.primaryColor1 },
              isDone && { borderColor: colors.successColor, backgroundColor: colors.successColor },
            ]}>
              {isDone
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <Text style={[styles.stepNum, { color: isActive ? '#fff' : colors.textSecColor }]}>{step}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, {
              color: isActive ? colors.primaryColor1 : isDone ? colors.successColor : colors.textSecColor,
              fontFamily: isActive ? '_bold' : '_regular',
            }]}>{label}</Text>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, {
                backgroundColor: isDone ? colors.successColor : colors.dividerColor,
              }]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

// ── Network Card — Step 1 ─────────────────────────
const NetworkCard = ({ network, isSelected, onSelect }) => {
  const { colors } = useThemeStyles();
  return (
    <TouchableOpacity
      style={[
        styles.networkCard,
        { backgroundColor: network.bgColor, borderColor: 'transparent' },
        isSelected && { borderColor: network.color, borderWidth: 2.5 },
      ]}
      onPress={() => onSelect(network)}
      activeOpacity={0.8}>
      {isSelected && (
        <View style={[styles.networkCheck, { backgroundColor: network.color }]}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}
      <View style={[styles.networkDot, { backgroundColor: network.color }]} />
      <Text style={[
        styles.networkLabel,
        { color: network.textColor },
        isSelected && { fontFamily: '_bold' },
      ]}>
        {network.label}
      </Text>
    </TouchableOpacity>
  );
};

// ── Category Card — Step 2 ────────────────────────
const CategoryCard = ({ category, onSelect, networkColor }) => {
  const { colors } = useThemeStyles();
  const meta = getCategoryMeta(category.type);
  return (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}
      onPress={() => onSelect(category)}
      activeOpacity={0.8}>
      <View style={[styles.categoryIconBox, { backgroundColor: `${networkColor}15` }]}>
        <Ionicons name={meta.icon} size={24} color={networkColor} />
      </View>
      <Text style={[styles.categoryLabel, { color: colors.textBlack }]}>{meta.label}</Text>
      <Text style={[styles.categoryDesc, { color: colors.textSecColor }]}>{meta.desc}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} style={styles.categoryArrow} />
    </TouchableOpacity>
  );
};

// ── Plan Card — Step 3 ─────────────────────────────
const PlanCard = ({ plan, isSelected, onSelect, networkColor }) => {
  const { colors } = useThemeStyles();

  // Strip ALL network prefixes from plan name — provider labels with MTN
  // regardless of actual network bought. Show just the data size.
  const cleanLabel = plan.label
    ?.replace(/^(MTN|Airtel|Glo|9mobile|Etisalat)\s+/i, '')
    ?.replace(/\s*\(\d+\s*days?\)\s*(validity)?/i, '')
    ?.trim() || plan.label;

  const cleanValidity = plan.validity
    || plan.label?.match(/\((\d+\s*days?)\)/i)?.[1]
    || '';

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        { backgroundColor: colors.bgCard, borderColor: colors.dividerColor },
        isSelected && { borderColor: networkColor, borderWidth: 2, backgroundColor: `${networkColor}10` },
      ]}
      onPress={() => onSelect(plan)}
      activeOpacity={0.8}>
      {isSelected && (
        <View style={[styles.planCheck, { backgroundColor: networkColor }]}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}
      <Text style={[styles.planSize, { color: colors.textBlack }, isSelected && { color: networkColor }]}>
        {cleanLabel}
      </Text>
      {cleanValidity ? (
        <Text style={[styles.planValidity, { color: colors.textSecColor }]}>{cleanValidity}</Text>
      ) : null}
      <Text style={[styles.planPrice, { color: colors.textSecColor }, isSelected && { color: networkColor }]}>
        ₦{Number(plan.price).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
};

// ── Selected Badge ────────────────────────────────
const SelectedBadge = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    style={[styles.selectedBadge, { backgroundColor: `${color}15`, borderColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}>
    {icon && <Ionicons name={icon} size={14} color={color} />}
    <Text style={[styles.selectedBadgeText, { color }]}>{label}</Text>
    <Ionicons name="pencil-outline" size={12} color={color} />
  </TouchableOpacity>
);

// ── Phone Input ───────────────────────────────────
const PhoneInput = ({ value, onChangeText, onUseMine, colors }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Phone Number</Text>
      <View style={[
        styles.inputContainer,
        { borderColor: isFocused ? colors.primaryColor1 : colors.dividerColor, backgroundColor: colors.bgCard },
      ]}>
        <Ionicons name="phone-portrait-outline" size={20}
          color={isFocused ? colors.primaryColor1 : '#9CA3AF'} style={styles.inputIcon} />
        <TextInput
          style={[styles.inputField, { color: colors.textBlack }]}
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
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
      <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
        Enter the 11-digit number to receive data
      </Text>
    </View>
  );
};

// ── Summary Row ───────────────────────────────────
const SummaryRow = ({ label, value, isTotal, valueColor }) => (
  <View style={[styles.summaryRow, isTotal && styles.summaryRowTotal]}>
    <Text style={[styles.summaryLabel, isTotal && styles.summaryLabelTotal]}>{label}</Text>
    <Text style={[styles.summaryValue, isTotal && styles.summaryValueTotal, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

// ── Rewards Tips ──────────────────────────────────
const RewardsTipsCard = ({ colors }) => {
  const [rewardRate, setRewardRate] = useState(null);
  const [coinValue, setCoinValue] = useState(null);
  useEffect(() => {
    client.get('/api/rewards_settings').then(res => {
      if (res.data.msg === '200') {
        setRewardRate(res.data.settings?.digital_services_coin_rate || null);
        setCoinValue(res.data.settings?.coin_ngn_value || null);
      }
    }).catch(() => {});
  }, []);
  return (
    <View style={[styles.tipsCard, { backgroundColor: colors.bgLight }]}>
      <View style={styles.tipsTitleRow}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
        <Text style={[styles.tipsTitle, { color: colors.primaryColor1 }]}>Quick Tips</Text>
      </View>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>• Data is activated within seconds of payment</Text>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>• SME plans are the cheapest — best for personal use</Text>
      {rewardRate && <Text style={[styles.tipText, { color: colors.textSecColor }]}>• You earn <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text> on every data purchase</Text>}
      {coinValue && <Text style={[styles.tipText, { color: colors.textSecColor }]}>• 🪙 1 coin = <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text> — redeemable as bonus</Text>}
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>• Top users earn quarterly & annual gift rewards 🎁</Text>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────
const MobileDataScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState(null);   // { id, label, color... }
  const [selectedCategory, setSelectedCategory] = useState(null); // { type, service_id }
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [dataPlans, setDataPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('mobile_data');

  const walletBalance = userInfo?.userData?.amount || '0';
  const userPhone = userInfo?.userData?.phone || '';
  const networkColor = selectedNetwork?.color || colors.primaryColor1;

  useEffect(() => {
    if (isFocused) fetchServiceStatus();
  }, [isFocused]);

  // ── Step 1 → 2: Network selected ─────────────
  const handleNetworkSelect = async (network) => {
    setSelectedNetwork(network);
    setSelectedCategory(null);
    setSelectedPlan(null);
    setDataPlans([]);
    setShowSummary(false);
    setCurrentStep(2);
    await loadCategories(network.id);
  };

  // ── Load categories for selected network ──────
  // Calls /api/bills/networks/data — filters entries that start with network id
  // e.g. for mtn: mtn_sme, mtn_gifting → types: sme, gifting
  const loadCategories = async (networkId) => {
    setIsLoadingCategories(true);
    setCategories([]);
    try {
      const res = await client.get('/api/bills/networks/data', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200' && res.data.networks?.length > 0) {
        // Filter networks that belong to this network provider
        const filtered = res.data.networks.filter(n => {
          const name = n.id?.toLowerCase() || '';
          // Match: exact network name OR network_type pattern (mtn_sme, airtel_gifting)
          return name === networkId.toLowerCase() ||
            name.startsWith(networkId.toLowerCase() + '_');
        });

        if (filtered.length > 0) {
          // Extract type from network_name (e.g. mtn_sme → sme, mtn → direct)
          const cats = filtered.map(n => {
            const parts = n.id?.toLowerCase().split('_');
            const type = parts?.length > 1
              ? parts.slice(1).join('_')  // e.g. mtn_sme → sme
              : 'direct';
            return {
              type,
              service_id: n.service_id,
              networkName: n.id,
            };
          });
          setCategories(cats);
        } else {
          // No sub-categories found — treat as single direct type
          setCategories([{ type: 'direct', service_id: null, networkName: networkId }]);
        }
      } else {
        setCategories([{ type: 'direct', service_id: null, networkName: networkId }]);
      }
    } catch {
      setCategories([{ type: 'direct', service_id: null, networkName: networkId }]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // ── Step 2 → 3: Category selected ────────────
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setSelectedPlan(null);
    setShowSummary(false);
    setCurrentStep(3);
    await loadDataPlans(selectedNetwork.id, category.type);
  };

  // ── Load plans from backend ───────────────────
  const loadDataPlans = async (networkId, type) => {
    setIsLoadingPlans(true);
    setDataPlans([]);
    try {
      // Use service_id if available (direct lookup), else use network+type
      const url = type === 'direct'
        ? `/api/bills/plans/data/${networkId}`
        : `/api/bills/plans/data/${networkId}?type=${type}`;

      const res = await client.get(url, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200' && res.data.plans?.length > 0) {
        setDataPlans(res.data.plans.map((p, index) => ({
          id:       p.plan_code || p.code || p.id || p.plan_id || `plan_${index}`,
          label:    p.plan_name || p.name || p.label || p.allowance || '',
          validity: p.month_validate || p.validity || p.duration || '',
          price:    String(p.plan_amount || p.price || p.amount || '0'),
          apiCode:  p.plan_code || p.code || p.id || `plan_${index}`,
        })));
      } else {
        setDataPlans([]);
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'No Plans Available',
          textBody: `No plans found for this category. Please try another.`,
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch {
      setDataPlans([]);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Failed to Load Plans',
        textBody: 'Could not load plans. Please check your connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // ── Step 3 → 4: Plan selected ─────────────────
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowSummary(false);
    setCurrentStep(4);
  };

  // ── Go back to step ───────────────────────────
  const goBackTo = (step) => {
    if (step <= 1) { setSelectedNetwork(null); setCategories([]); }
    if (step <= 2) { setSelectedCategory(null); setDataPlans([]); }
    if (step <= 3) { setSelectedPlan(null); }
    setShowSummary(false);
    setCurrentStep(step);
  };

  // ── Validation ────────────────────────────────
  const validateInputs = () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Phone Number', textBody: 'Please enter a valid 11-digit Nigerian phone number.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(selectedPlan.price) > Number(walletBalance)) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: 'Your wallet balance is not enough. Please fund your account.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

    const handleProceed = async () => {
    Keyboard.dismiss();
    if (!validateInputs()) return;
    const isActive = await preFlightCheck();
    if (!isActive) return;
    setIsProcessing(true);
    try {
      navigation.navigate('BillsConfirm', {
        serviceType:  'mobile_data',
        serviceTitle: 'Mobile Data',
        network:      selectedNetwork?.id,
        network_name: selectedNetwork?.label,
        phone:        phoneNumber,
        service_id:   selectedCategory?.service_id,
        plan_code:    selectedPlan.apiCode,
        plan_name:    cleanPlanLabel,
        validity:     selectedPlan.validity,
        amount:       selectedPlan.price,
        fee:          '0',
        totalAmount:  selectedPlan.price,
        gradientColors: [selectedNetwork?.color || '#3B82F6', '#1D4ED8'],
        icon:         'wifi-outline',
        summaryItems: [
          { label: 'Network',      value: selectedNetwork?.label },
          { label: 'Type',         value: getCategoryMeta(selectedCategory?.type).label },
          { label: 'Network',       value: selectedNetwork?.label },
          { label: 'Data Plan',     value: cleanPlanLabel },
          { label: 'Validity',     value: selectedPlan.validity },
          { label: 'Phone Number', value: phoneNumber },
          { label: 'Amount',       value: `₦${Number(selectedPlan.price).toLocaleString()}` },
          { label: 'Service Fee',  value: '₦0.00' },
        ],
      });
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsProcessing(false);
    }
  };

  const categoryMeta = getCategoryMeta(selectedCategory?.type);
    const cleanPlanLabel = selectedPlan?.label
    ?.replace(new RegExp(`^${selectedNetwork?.label}\\s+`, 'i'), '')
    ?.replace(/^(MTN|Airtel|Glo|9mobile)\s+/i, '')
    ?.replace(/\s*\(\d+\s*days?\)\s*validity/i, '')
    ?.trim() || selectedPlan?.label;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            <BillScreenHeader
              navigation={navigation}
              title="Mobile Data"
              description="Buy data bundles for MTN, Airtel, Glo & 9mobile — instant delivery"
              icon="wifi-outline"
              gradientColors={selectedNetwork
                ? [selectedNetwork.color, selectedNetwork.color + 'CC']
                : ['#3B82F6', '#1D4ED8']}
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {serviceStatus !== 'paused' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} colors={colors} />

                {/* ── STEP 1: Select Network ───────────── */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                    1. Select Network
                  </Text>
                  {currentStep > 1 && (
                    <TouchableOpacity onPress={() => goBackTo(1)}>
                      <Text style={[styles.changeBtn, { color: colors.primaryColor1 }]}>Change</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {currentStep === 1 ? (
                  <View style={styles.networkGrid}>
                    {CLEAN_NETWORKS.map((net) => (
                      <NetworkCard
                        key={net.id}
                        network={net}
                        isSelected={selectedNetwork?.id === net.id}
                        onSelect={handleNetworkSelect}
                      />
                    ))}
                  </View>
                ) : (
                  <SelectedBadge
                    icon="wifi-outline"
                    label={selectedNetwork?.label}
                    color={networkColor}
                    onPress={() => goBackTo(1)}
                  />
                )}

                {/* ── STEP 2: Select Data Type ─────────── */}
                {currentStep >= 2 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                        2. Select Data Type
                      </Text>
                      {currentStep > 2 && (
                        <TouchableOpacity onPress={() => goBackTo(2)}>
                          <Text style={[styles.changeBtn, { color: colors.primaryColor1 }]}>Change</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {currentStep === 2 ? (
                      isLoadingCategories ? (
                        <ActivityIndicator size="small" color={networkColor} style={{ marginVertical: spacing.lg }} />
                      ) : (
                        <View style={styles.categoryList}>
                          {categories.map((cat) => (
                            <CategoryCard
                              key={cat.type}
                              category={cat}
                              onSelect={handleCategorySelect}
                              networkColor={networkColor}
                            />
                          ))}
                        </View>
                      )
                    ) : (
                      <SelectedBadge
                        icon={getCategoryMeta(selectedCategory?.type).icon}
                        label={getCategoryMeta(selectedCategory?.type).label}
                        color={networkColor}
                        onPress={() => goBackTo(2)}
                      />
                    )}
                  </>
                )}

                {/* ── STEP 3: Select Plan ──────────────── */}
                {currentStep >= 3 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                        3. Select Plan
                      </Text>
                      {currentStep > 3 && (
                        <TouchableOpacity onPress={() => goBackTo(3)}>
                          <Text style={[styles.changeBtn, { color: colors.primaryColor1 }]}>Change</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {currentStep === 3 ? (
                      isLoadingPlans ? (
                        <ActivityIndicator size="large" color={networkColor} style={{ marginVertical: spacing.xl }} />
                      ) : dataPlans.length === 0 ? (
                        <View style={styles.emptyState}>
                          <Ionicons name="wifi-outline" size={40} color={colors.textSecColor2} />
                          <Text style={[styles.emptyText, { color: colors.textSecColor }]}>
                            No plans available.{'\n'}Try a different data type.
                          </Text>
                          <TouchableOpacity
                            style={[styles.retryBtn, { borderColor: networkColor }]}
                            onPress={() => goBackTo(2)}>
                            <Text style={[styles.retryBtnText, { color: networkColor }]}>Go Back</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.plansGrid}>
                          {dataPlans.map((plan, index) => (
                            <PlanCard
                              key={`${plan.id}_${index}`}
                              plan={plan}
                              isSelected={selectedPlan?.id === plan.id}
                              onSelect={handlePlanSelect}
                              networkColor={networkColor}
                            />
                          ))}
                        </View>
                      )
                    ) : (
                      <SelectedBadge
                        icon="wifi-outline"
                        label={`${cleanPlanLabel} — ₦${Number(selectedPlan?.price).toLocaleString()}`}
                        color={networkColor}
                        onPress={() => goBackTo(3)}
                      />
                    )}
                  </>
                )}

                {/* ── STEP 4: Phone & Proceed ──────────── */}
                {currentStep >= 4 && (
                  <>
                    <View style={[styles.sectionHeader, { marginTop: spacing.sm }]}>
                      <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                        4. Enter Phone Number
                      </Text>
                    </View>
                    <PhoneInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      onUseMine={() => setPhoneNumber(userPhone)}
                      colors={colors}
                    />
                    {phoneNumber.length === 11 && !showSummary && (
                      <TouchableOpacity
                        style={[gs.primaryButton, { backgroundColor: networkColor }, isCheckingStatus && { opacity: 0.7 }]}
                        onPress={handleProceed}
                        disabled={isCheckingStatus}
                        activeOpacity={0.85}>
                        {isCheckingStatus
                          ? <ActivityIndicator color="#fff" size={22} />
                          : <>
                              <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" style={{ marginRight: spacing.sm }} />
                              <Text style={gs.primaryButtonText}>Proceed — ₦{Number(selectedPlan?.price).toLocaleString()}</Text>
                            </>
                        }
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}

            {/* ── Order Summary ─────────────────────── */}
            {/* {showSummary && serviceStatus !== 'paused' && (
              <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.summaryTitle, { color: colors.textBlack }]}>Order Summary</Text>
                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />
                <SummaryRow label="Network"      value={selectedNetwork?.label} />
                <SummaryRow label="Data Type"    value={categoryMeta.label} />
                <SummaryRow label="Plan"         value={cleanPlanLabel} />
                <SummaryRow label="Validity"     value={selectedPlan?.validity} />
                <SummaryRow label="Phone Number" value={phoneNumber} />
                <SummaryRow label="Amount"       value={`₦${Number(selectedPlan?.price).toLocaleString()}`} />
                <SummaryRow label="Service Fee"  value="₦0.00" />
                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />
                <SummaryRow label="Total"
                  value={`₦${Number(selectedPlan?.price).toLocaleString()}`}
                  isTotal valueColor={networkColor} />

                <View style={[styles.balanceCheckRow, { backgroundColor: colors.bgLight }]}>
                  <Ionicons
                    name={Number(selectedPlan?.price) <= Number(walletBalance) ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={Number(selectedPlan?.price) <= Number(walletBalance) ? colors.successColor : colors.dangerColor}
                  />
                  <Text style={[styles.balanceCheckText, { color: colors.textBlack }]}>
                    Wallet Balance: ₦{Number(walletBalance).toLocaleString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: networkColor }, isProcessing && { opacity: 0.7 }]}
                  onPress={handleConfirmPay}
                  disabled={isProcessing}
                  activeOpacity={0.85}>
                  {isProcessing
                    ? <ActivityIndicator color="#fff" size={22} />
                    : <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: spacing.sm }} />
                        <Text style={gs.primaryButtonText}>Confirm & Pay ₦{Number(selectedPlan?.price).toLocaleString()}</Text>
                      </>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={styles.editBtn} onPress={() => setShowSummary(false)}>
                  <Text style={[styles.editBtnText, { color: colors.textSecColor }]}>Edit Order</Text>
                </TouchableOpacity>
              </View>
            )} */}

            <RewardsTipsCard colors={colors} />
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
  formCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  stepItem: { alignItems: 'center', position: 'relative', flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepNum: { fontFamily: '_bold', fontSize: typography.xs },
  stepLabel: { fontSize: 10, textAlign: 'center' },
  stepLine: { position: 'absolute', height: 2, top: 13, left: '55%', right: '-55%', zIndex: -1 },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: '_semiBold', fontSize: typography.base },
  changeBtn: { fontFamily: '_semiBold', fontSize: typography.sm },

  // Network grid — 2x2
  networkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  networkCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    gap: spacing.sm,
    minHeight: 52,
    position: 'relative',
  },
  networkCheck: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  networkDot: { width: 12, height: 12, borderRadius: 6 },
  networkLabel: { fontFamily: '_semiBold', fontSize: typography.lg },

  // Selected badge
  selectedBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: 'flex-start', gap: spacing.xs, marginBottom: spacing.lg },
  selectedBadgeText: { fontFamily: '_semiBold', fontSize: typography.sm, flexShrink: 1 },

  // Category list — full width rows
  categoryList: { gap: spacing.sm, marginBottom: spacing.lg },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    gap: spacing.md,
    ...shadows.sm,
  },
  categoryIconBox: { width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  categoryLabel: { fontFamily: '_semiBold', fontSize: typography.lg, flex: 1 },
  categoryDesc: { fontFamily: '_regular', fontSize: typography.sm },
  categoryArrow: { marginLeft: 'auto' },

  // Plans grid
  plansGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  planCard: {
    width: '22%',
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 85,
    justifyContent: 'center',
  },
  planCheck: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  planSize: { fontFamily: '_bold', fontSize: typography.sm, textAlign: 'center' },
  planValidity: { fontFamily: '_regular', fontSize: 10, textAlign: 'center', marginTop: 2, lineHeight: 14 },
  planPrice: { fontFamily: '_bold', fontSize: typography.sm, textAlign: 'center', marginTop: spacing.xs },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyText: { fontFamily: '_regular', fontSize: typography.base, textAlign: 'center', lineHeight: 22 },
  retryBtn: { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  retryBtnText: { fontFamily: '_semiBold', fontSize: typography.sm },

  // Input
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { fontFamily: '_semiBold', fontSize: typography.base, marginBottom: spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56 },
  inputIcon: { marginRight: spacing.sm },
  inputField: { flex: 1, fontFamily: '_semiBold', fontSize: typography.lg, paddingVertical: 0 },
  inputHint: { fontFamily: '_regular', fontSize: typography.sm, marginTop: spacing.xs, lineHeight: 20 },
  useMineBtn: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  useMineBtnText: { fontFamily: '_semiBold', fontSize: typography.sm },

  // Summary
  summaryCard: { borderRadius: radius.xl, padding: spacing.xl, marginHorizontal: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  summaryTitle: { fontFamily: '_bold', fontSize: typography.xl, marginBottom: spacing.md },
  summaryDivider: { height: 1, marginVertical: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  summaryRowTotal: { marginTop: spacing.xs },
  summaryLabel: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },
  summaryLabelTotal: { fontFamily: '_bold', fontSize: typography.lg },
  summaryValue: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },
  summaryValueTotal: { fontFamily: '_bold', fontSize: typography.xl },
  balanceCheckRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  balanceCheckText: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },
  confirmBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: radius.lg, height: 52, marginTop: spacing.sm, ...shadows.md },
  editBtn: { alignItems: 'center', marginTop: spacing.md, padding: spacing.sm },
  editBtnText: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },

  // Tips
  tipsCard: { borderRadius: radius.xl, padding: spacing.xl, marginHorizontal: spacing.xl, borderWidth: 1, marginBottom: spacing.lg },
  tipsTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.xs },
  tipsTitle: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },
  tipText: { fontFamily: '_regular', fontSize: typography.base, marginBottom: spacing.sm, lineHeight: 22 },
  tipHighlight: { fontFamily: '_bold' },
});

export default MobileDataScreen;