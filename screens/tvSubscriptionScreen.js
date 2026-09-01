
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
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import BillScreenHeader from '../components/BillScreenHeader';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';
import {
  TV_PROVIDERS,
  getBouquets,
  getProviderById,
} from '../constants/tvProviders';

// ── TV Provider Selector ──────────────────────────
const TVProviderSelector = ({ selectedProvider, onSelect, colors }) => (
  <View style={styles.sectionContainer}>
    <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Select TV Provider</Text>
    <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
      Choose your television subscription provider
    </Text>
    <View style={styles.providerGrid}>
      {TV_PROVIDERS.map((provider) => {
        const isSelected = selectedProvider?.id === provider.id;
        return (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerCard,
              isSelected && {
                borderColor: provider.color,
                borderWidth: 2.5,
                backgroundColor: provider.bgColor,
              },
            ]}
            onPress={() => onSelect(provider)}
            activeOpacity={0.8}>
            <Text style={styles.providerLogo}>{provider.logo}</Text>
            <Text style={[
              styles.providerLabel,
              isSelected && { color: provider.color, fontFamily: '_bold' },
            ]}>
              {provider.label}
            </Text>
            {isSelected && (
              <View style={[styles.providerCheck, { backgroundColor: provider.color }]}>
                <Text style={styles.providerCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ── Bouquet Plan Card ─────────────────────────────
const BouquetCard = ({ bouquet, isSelected, onSelect, providerColor }) => (
  <TouchableOpacity
    style={[
      styles.bouquetCard,
      isSelected && {
        borderColor: providerColor,
        borderWidth: 2,
        backgroundColor: `${providerColor}10`,
      },
    ]}
    onPress={() => onSelect(bouquet)}
    activeOpacity={0.8}>
    {isSelected && (
      <View style={[styles.bouquetCheck, { backgroundColor: providerColor }]}>
        <Text style={styles.bouquetCheckText}>✓</Text>
      </View>
    )}
    <Text style={[
      styles.bouquetLabel,
      isSelected && { color: providerColor },
    ]}>
      {bouquet.label}
    </Text>
    <Text style={styles.bouquetValidity}>{bouquet.validity}</Text>
    <Text style={[
      styles.bouquetPrice,
      isSelected && { color: providerColor },
    ]}>
      ₦{Number(bouquet.price).toLocaleString()}
    </Text>
  </TouchableOpacity>
);

// ── Smart Card Input ──────────────────────────────
const SmartCardInput = ({
  
  provider,
  value,
  onChangeText,
  onVerify,
  isVerifying,
  verifiedName,
}) => {
  const { colors } = useThemeStyles();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{provider?.verifyLabel}</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
      ]}>
        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={20}
          color={isFocused ? colors.primaryColor1 : '#9CA3AF'}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.inputField}
          value={value}
          onChangeText={(text) => {
            const cleaned = provider?.id === 'SHOWMAX'
              ? text
              : text.replace(/[^0-9]/g, '');
            onChangeText(cleaned);
          }}
          placeholder={provider?.verifyPlaceholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={provider?.id === 'SHOWMAX' ? 'email-address' : 'numeric'}
          maxLength={provider?.verifyLength || 50}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value.length >= 8 && (
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
        <Text style={styles.inputHint}>{provider?.verifyHint}</Text>
      )}
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
        • Subscription is activated on your decoder instantly after payment
      </Text>
      <Text style={styles.tipText}>
        • Always verify your smartcard or IUC number before proceeding
      </Text>
      {rewardRate && (
        <Text style={styles.tipText}>
          • You earn{' '}
          <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text>
          {' '}on every TV subscription
        </Text>
      )}
      {coinValue && (
        <Text style={styles.tipText}>
          • 🪙 1 coin ={' '}
          <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text>
          {' '}— redeemable as bonus
        </Text>
      )}
      <Text style={styles.tipText}>
        • Ensure your decoder is powered on for instant activation
      </Text>
      <Text style={styles.tipText}>
        • Top users earn quarterly & annual gift rewards 🎁
      </Text>
    </View>
  );
};

// ── Main TV Subscription Screen ───────────────────
const TVSubscriptionScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [bouquets, setBouquets] = useState([]);
  const [isLoadingBouquets, setIsLoadingBouquets] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('tv_subscription');

  const walletBalance = userInfo?.userData?.tran_account || '0';

  useEffect(() => {
    if (isFocused) fetchServiceStatus();
  }, [isFocused]);

  // ── Load Bouquets when provider changes ────────
  useEffect(() => {
    if (!selectedProvider) {
      setBouquets([]);
      setSelectedBouquet(null);
      setSmartCardNumber('');
      setVerifiedName('');
      return;
    }
    loadBouquets(selectedProvider.id);
  }, [selectedProvider]);

  const loadBouquets = async (providerId) => {
    setIsLoadingBouquets(true);
    setSelectedBouquet(null);
    try {
      // Try live API first
      const res = await client.get(
        `/api/bills/tv_bouquets/${providerId}`,
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200' && res.data.bouquets?.length > 0) {
        setBouquets(res.data.bouquets);
      } else {
        setBouquets(getBouquets(providerId)); // fallback
      }
    } catch (error) {
      setBouquets(getBouquets(providerId)); // fallback
    } finally {
      setIsLoadingBouquets(false);
    }
  };

  // ── Verify Smart Card ─────────────────────────
  const handleVerifySmartCard = async () => {
    if (!selectedProvider) return;
    setIsVerifying(true);
    try {
      const res = await client.post(
        '/api/bills/verify_tv_smartcard',
        {
          provider: selectedProvider.apiCode,
          smartcard_number: smartCardNumber,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setVerifiedName(res.data.customer_name);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Verified',
          textBody: `Customer: ${res.data.customer_name}`,
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Verification Failed',
          textBody: 'Could not verify your smartcard number. Please check and try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        setVerifiedName('');
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Verification failed. Please try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Validation ─────────────────────────────────
  const validateInputs = () => {
    if (!selectedProvider) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select Provider',
        textBody: 'Please select a TV subscription provider.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!selectedBouquet) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select Bouquet',
        textBody: 'Please select a subscription bouquet/plan.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!smartCardNumber || smartCardNumber.length < 8) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Smartcard Number',
        textBody: `Please enter a valid ${selectedProvider?.verifyLabel}.`,
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (!verifiedName) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Verify Smartcard',
        textBody: 'Please verify your smartcard number before proceeding.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (Number(selectedBouquet.price) > Number(walletBalance)) {
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
        serviceType: 'tv_subscription',
        serviceTitle: 'TV Subscription',
        provider: selectedProvider.id,
        providerName: selectedProvider.label,
        bouquet: selectedBouquet.label,
        bouquetApiCode: selectedBouquet.apiCode,
        smartCardNumber,
        customerName: verifiedName,
        amount: selectedBouquet.price,
        fee: '0',
        totalAmount: selectedBouquet.price,
        gradientColors: [selectedProvider.color, selectedProvider.color + 'CC'],
        icon: 'tv-outline',
        summaryItems: [
          { label: 'Provider', value: selectedProvider.label },
          { label: 'Bouquet', value: selectedBouquet.label },
          { label: selectedProvider.verifyLabel, value: smartCardNumber },
          { label: 'Customer Name', value: verifiedName },
          { label: 'Validity', value: selectedBouquet.validity },
          { label: 'Amount', value: `₦${Number(selectedBouquet.price).toLocaleString()}` },
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
              title="TV Subscription"
              description="Renew DStv, GOtv, Startimes & Showmax subscriptions instantly — no hassle, no queues"
              icon="tv-outline"
              gradientColors={['#8B5CF6', '#6D28D9']}
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {serviceStatus !== 'paused' && (
              <View style={styles.formCard}>

                {/* Provider Selector */}
                <TVProviderSelector
                  selectedProvider={selectedProvider}
                  colors={colors}
                  onSelect={(provider) => {
                    setSelectedProvider(provider);
                    setShowSummary(false);
                    setVerifiedName('');
                    setSmartCardNumber('');
                  }}
                />

                {/* Bouquet Plans */}
                {selectedProvider && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.inputLabel}>
                      Select {selectedProvider.label} Bouquet
                    </Text>
                    <Text style={styles.inputHint}>
                      Choose a subscription plan that suits you
                    </Text>

                    {isLoadingBouquets ? (
                      <ActivityIndicator
                        size="large"
                        color={selectedProvider.color}
                        style={{ marginVertical: spacing.xl }}
                      />
                    ) : (
                      <View style={styles.bouquetGrid}>
                        {bouquets.map((bouquet) => (
                          <BouquetCard
                            key={bouquet.id}
                            bouquet={bouquet}
                            isSelected={selectedBouquet?.id === bouquet.id}
                            onSelect={(b) => {
                              setSelectedBouquet(b);
                              setShowSummary(false);
                            }}
                            providerColor={selectedProvider.color}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Smart Card Input */}
                {selectedProvider && selectedBouquet && (
                  <SmartCardInput
                    provider={selectedProvider}
                    value={smartCardNumber}
                    onChangeText={(text) => {
                      setSmartCardNumber(text);
                      setVerifiedName('');
                    }}
                    onVerify={handleVerifySmartCard}
                    isVerifying={isVerifying}
                    verifiedName={verifiedName}
                  />
                )}

                {/* Selected Plan Strip */}
                {selectedProvider && selectedBouquet && (
                  <View style={[
                    styles.selectedStrip,
                    { borderLeftColor: selectedProvider.color },
                  ]}>
                    <Text style={styles.selectedStripLogo}>
                      {selectedProvider.logo}
                    </Text>
                    <View style={styles.selectedStripInfo}>
                      <Text style={styles.selectedStripLabel}>
                        {selectedProvider.label} — {selectedBouquet.label}
                      </Text>
                      <Text style={styles.selectedStripSub}>
                        {selectedBouquet.validity} subscription
                      </Text>
                    </View>
                    <Text style={[
                      styles.selectedStripPrice,
                      { color: selectedProvider.color },
                    ]}>
                      ₦{Number(selectedBouquet.price).toLocaleString()}
                    </Text>
                  </View>
                )}

                {/* Proceed Button */}
                {selectedProvider && selectedBouquet && (
                  <TouchableOpacity
                    style={[
                      gs.primaryButton,
                      { backgroundColor: selectedProvider?.color || colors.primaryColor1 },
                      (!verifiedName || isCheckingStatus) && { opacity: 0.6 },
                    ]}
                    onPress={handleProceed}
                    disabled={!verifiedName || isCheckingStatus}
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
                )}
              </View>
            )}

            {/* ── Order Summary ─────────────────── */}
            {showSummary && serviceStatus !== 'paused' && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryDivider} />

                <SummaryRow label="Provider" value={selectedProvider?.label} />
                <SummaryRow label="Bouquet" value={selectedBouquet?.label} />
                <SummaryRow
                  label={selectedProvider?.verifyLabel}
                  value={smartCardNumber}
                />
                <SummaryRow label="Customer" value={verifiedName} />
                <SummaryRow label="Validity" value={selectedBouquet?.validity} />
                <SummaryRow
                  label="Amount"
                  value={`₦${Number(selectedBouquet?.price).toLocaleString()}`}
                />
                <SummaryRow label="Service Fee" value="₦0.00" />

                <View style={styles.summaryDivider} />

                <SummaryRow
                  label="Total"
                  value={`₦${Number(selectedBouquet?.price).toLocaleString()}`}
                  isTotal
                  valueColor={selectedProvider?.color}
                />

                {/* Wallet Balance Check */}
                <View style={styles.balanceCheckRow}>
                  <Ionicons
                    name={
                      Number(selectedBouquet?.price) <= Number(walletBalance)
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={18}
                    color={
                      Number(selectedBouquet?.price) <= Number(walletBalance)
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
                    { backgroundColor: selectedProvider?.color },
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
                        Confirm & Pay ₦{Number(selectedBouquet?.price).toLocaleString()}
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

  // Section
  sectionContainer: {
    marginBottom: spacing.lg,
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
    lineHeight: 20,
  },

  // Verify
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

  // Provider Grid
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  providerCard: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    
    
    position: 'relative',
    minHeight: 80,
  },
  providerLogo: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  providerLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    textAlign: 'center',
  },
  providerCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerCheckText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Bouquet Grid
  bouquetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bouquetCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    
    
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
  },
  bouquetCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bouquetCheckText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bouquetLabel: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    
    textAlign: 'center',
  },
  bouquetValidity: {
    fontFamily: '_regular',
    fontSize: 10,
    
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  bouquetPrice: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Selected Strip
  selectedStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    gap: spacing.md,
  },
  selectedStripLogo: {
    fontSize: 24,
  },
  selectedStripInfo: {
    flex: 1,
  },
  selectedStripLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  selectedStripSub: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },
  selectedStripPrice: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },

  // Summary
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

  // Tips
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

export default TVSubscriptionScreen;
