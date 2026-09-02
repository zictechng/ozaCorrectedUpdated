
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
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import BillScreenHeader from '../components/BillScreenHeader';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';
import { EXAM_TYPES, getExamById } from '../constants/examTypes';

// ── Exam Type Card ────────────────────────────────
const ExamTypeCard = ({ exam, isSelected, onSelect }) => {
  const { colors } = useThemeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.examCard,
        {
          borderColor: colors.dividerColor,
          backgroundColor: colors.bgCard,
        },
        isSelected && {
          borderColor: exam.color,
          borderWidth: 2.5,
          backgroundColor: exam.bgColor,
        },
      ]}
      onPress={() => onSelect(exam)}
      activeOpacity={0.8}>

      {isSelected && (
        <View style={[styles.examCheck, { backgroundColor: exam.color }]}>
          <Text style={styles.examCheckText}>✓</Text>
        </View>
      )}

      <LinearGradient
        colors={isSelected ? [exam.color, exam.color + 'CC'] : ['#F3F4F6', '#E5E7EB']}
        style={styles.examIconBox}>
        <Text style={styles.examLogo}>{exam.logo}</Text>
      </LinearGradient>

      <Text style={[
        styles.examLabel,
        { color: isSelected ? exam.color : colors.textBlack },
      ]}>
        {exam.label}
      </Text>

      <Text style={[styles.examFullName, { color: colors.textSecColor }]} numberOfLines={2}>
        {exam.fullName}
      </Text>

      <View style={[
        styles.examPriceTag,
        { backgroundColor: isSelected ? exam.color : colors.bgLight },
      ]}>
        <Text style={[
          styles.examPriceText,
          { color: isSelected ? '#fff' : colors.primaryColor1 },
        ]}>
          ₦{Number(exam.buyPrice).toLocaleString()}
        </Text>
      </View>

    </TouchableOpacity>
  );
};

// ── Quantity Selector ─────────────────────────────
const QuantitySelector = ({ quantity, onIncrease, onDecrease, maxQty }) => {
  const { colors } = useThemeStyles();

  return (
    <View style={styles.quantityContainer}>
      <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Number of Pins</Text>
      <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
        Select how many scratch card pins you need (max {maxQty} per transaction)
      </Text>

      <View style={[styles.quantityRow, { backgroundColor: colors.bgLight }]}>
        <TouchableOpacity
          style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
          onPress={onDecrease}
          disabled={quantity <= 1}>
          <Ionicons
            name="remove"
            size={22}
            color={quantity <= 1 ? colors.textSecColor : colors.primaryColor1}
          />
        </TouchableOpacity>

        <View style={styles.quantityDisplay}>
          <Text style={[styles.quantityNumber, { color: colors.primaryColor1 }]}>{quantity}</Text>
          <Text style={[styles.quantityLabel, { color: colors.textSecColor }]}>
            {quantity === 1 ? 'Pin' : 'Pins'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.quantityBtn, quantity >= maxQty && styles.quantityBtnDisabled]}
          onPress={onIncrease}
          disabled={quantity >= maxQty}>
          <Ionicons
            name="add"
            size={22}
            color={quantity >= maxQty ? colors.textSecColor : colors.primaryColor1}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickQtyRow}>
        {[1, 2, 3, 5, 10].filter(q => q <= maxQty).map((q) => (
          <TouchableOpacity
            key={q}
            style={[
              styles.quickQtyBtn,
              { borderColor: colors.dividerColor },
              quantity === q && {
                borderColor: colors.primaryColor1,
                backgroundColor: colors.primaryColor1 + '20',
              },
            ]}
            onPress={() => {
              const diff = q - quantity;
              if (diff > 0) Array.from({ length: diff }).forEach(() => onIncrease());
              else if (diff < 0) Array.from({ length: Math.abs(diff) }).forEach(() => onDecrease());
            }}>
            <Text style={[
              styles.quickQtyBtnText,
              { color: colors.textSecColor },
              quantity === q && { color: colors.primaryColor1, fontFamily: '_bold' },
            ]}>
              {q} {q === 1 ? 'Pin' : 'Pins'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ── Phone & Email Input ───────────────────────────
const DeliveryInput = ({
  phone, onPhoneChange, onUseMine,
  email, onEmailChange,
}) => {
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const { colors } = useThemeStyles();

  return (
    <View>
      {/* Phone Number */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Phone Number</Text>
        <View style={[
          styles.inputContainer,
          phoneFocused && styles.inputContainerFocused,
        ]}>
          <Ionicons
            name="phone-portrait-outline"
            size={20}
            color={phoneFocused ? colors.primaryColor1 : '#9CA3AF'}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.inputField, { color: colors.textBlack }]}
            value={phone}
            onChangeText={(t) => onPhoneChange(t.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 08012345678"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            maxLength={11}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
          />
          <TouchableOpacity onPress={onUseMine} style={[styles.useMineBtn, { backgroundColor: colors.bgLight }]}>
            <Text style={[styles.useMineBtnText, { color: colors.primaryColor1 }]}>Use Mine</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
          Pin will be sent as SMS to this number
        </Text>
      </View>

      {/* Email Address */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Email Address</Text>
        <View style={[
          styles.inputContainer,
          emailFocused && styles.inputContainerFocused,
        ]}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={emailFocused ? colors.primaryColor1 : '#9CA3AF'}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.inputField, { color: colors.textBlack }]}
            value={email}
            onChangeText={onEmailChange}
            placeholder="e.g. name@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
        <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
          Pin will also be delivered to this email address
        </Text>
      </View>
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
const RewardsTipsCard = ({ examLabel }) => {
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
    <View style={[styles.tipsCard, { backgroundColor: colors.bgLight }]}>
      <View style={styles.tipsTitleRow}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.primaryColor1}
        />
        <Text style={[styles.tipsTitle, { color: colors.primaryColor1 }]}>Quick Tips</Text>
      </View>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Scratch card pins are delivered instantly to your phone and email
      </Text>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Keep your pin safe — it cannot be replaced once revealed
      </Text>
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • You can purchase up to 10 pins per transaction
      </Text>
      {rewardRate && (
        <Text style={[styles.tipText, { color: colors.textSecColor }]}>
          • You earn{' '}
          <Text style={styles.tipHighlight}>{rewardRate}% in coins</Text>
          {' '}on every {examLabel} card purchase
        </Text>
      )}
      {coinValue && (
        <Text style={[styles.tipText, { color: colors.textSecColor }]}>
          • 🪙 1 coin ={' '}
          <Text style={styles.tipHighlight}>₦{coinValue} NGN</Text>
          {' '}— redeemable as bonus
        </Text>
      )}
      <Text style={[styles.tipText, { color: colors.textSecColor }]}>
        • Top users earn quarterly & annual gift rewards 🎁
      </Text>
    </View>
  );
};

// ── Main Exam Cards Screen ────────────────────────
const ExamCardsScreen = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  // Pre-select exam type from navigation params
  const preSelectedType = route?.params?.examType || null;

  const [selectedExam, setSelectedExam] = useState(
    preSelectedType ? getExamById(preSelectedType) : null
  );
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const MAX_QUANTITY = 10;

  const { serviceStatus, isCheckingStatus, fetchServiceStatus, preFlightCheck } =
    useBillService('exam_cards');

  const walletBalance = userInfo?.userData?.tran_account || '0';
  const userPhone = userInfo?.userData?.phone || '';
  const userEmail = userInfo?.userData?.email || '';

  useEffect(() => {
    if (isFocused) {
      fetchServiceStatus();
      // Auto fill user details
      if (userPhone) setPhoneNumber(userPhone);
      if (userEmail) setEmail(userEmail);
    }
  }, [isFocused]);

  // ── Calculate Total ────────────────────────────
  const unitPrice = Number(selectedExam?.buyPrice || 0);
  const totalPrice = unitPrice * quantity;

  // ── Quantity Handlers ─────────────────────────
  const handleIncrease = () => {
    if (quantity < MAX_QUANTITY) setQuantity(q => q + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  // ── Validation ────────────────────────────────
  const validateInputs = () => {
    if (!selectedExam) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Select Exam Type',
        textBody: 'Please select an exam card type to continue.',
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
    if (!email || !email.includes('@')) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Email',
        textBody: 'Please enter a valid email address for pin delivery.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return false;
    }
    if (totalPrice > Number(walletBalance)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient Balance',
        textBody: `You need ₦${totalPrice.toLocaleString()} but your wallet has ₦${Number(walletBalance).toLocaleString()}. Please fund your account.`,
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
        serviceType: 'exam_cards',
        serviceTitle: `${selectedExam.label} Scratch Card`,
        examType: selectedExam.id,
        examApiCode: selectedExam.apiCode,
        examLabel: selectedExam.label,
        quantity,
        phoneNumber,
        email,
        unitPrice: selectedExam.buyPrice,
        amount: totalPrice.toString(),
        fee: '0',
        totalAmount: totalPrice.toString(),
        gradientColors: [selectedExam.color, selectedExam.color + 'CC'],
        icon: selectedExam.icon,
        summaryItems: [
          { label: 'Exam Type', value: selectedExam.label },
          { label: 'Full Name', value: selectedExam.fullName },
          { label: 'Quantity', value: `${quantity} ${quantity === 1 ? 'Pin' : 'Pins'}` },
          { label: 'Unit Price', value: `₦${unitPrice.toLocaleString()}` },
          { label: 'Phone Number', value: phoneNumber },
          { label: 'Email', value: email },
          { label: 'Delivery', value: selectedExam.deliveryMethod },
          { label: 'Total Amount', value: `₦${totalPrice.toLocaleString()}` },
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
              title="Exam Scratch Cards"
              description="Buy WAEC, NECO, JAMB & NABTEB result checker pins instantly — delivered to your phone and email"
              icon="school-outline"
              gradientColors={
                selectedExam
                  ? [selectedExam.color, selectedExam.color + 'CC']
                  : ['#10B981', '#059669']
              }
              serviceStatus={serviceStatus}
              balance={`₦${Number(walletBalance).toLocaleString()}`}
              balanceLabel="Wallet Balance"
            />

            {serviceStatus !== 'paused' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

                {/* Exam Type Selector */}
                <View style={styles.sectionContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Select Exam Type</Text>
                  <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                    Choose the examination body for your scratch card
                  </Text>
                  <View style={styles.examGrid}>
                    {EXAM_TYPES.map((exam) => (
                      <ExamTypeCard
                        key={exam.id}
                        exam={exam}
                        isSelected={selectedExam?.id === exam.id}
                        onSelect={(e) => {
                          setSelectedExam(e);
                          setQuantity(1);
                          setShowSummary(false);
                        }}
                      />
                    ))}
                  </View>
                </View>

                {/* Selected Exam Info Banner */}
                {selectedExam && (
                  <View style={[
                    styles.examInfoBanner,
                    { backgroundColor: selectedExam.bgColor, borderColor: selectedExam.color },
                  ]}>
                    <Text style={styles.examInfoLogo}>{selectedExam.logo}</Text>
                    <View style={styles.examInfoContent}>
                      <Text style={[styles.examInfoLabel, { color: selectedExam.color }]}>
                        {selectedExam.fullName}
                      </Text>
                      <Text style={styles.examInfoDesc}>
                        {selectedExam.description}
                      </Text>
                      <Text style={[styles.examInfoDelivery, { color: selectedExam.color }]}>
                        ✓ {selectedExam.deliveryMethod}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Quantity Selector */}
                {selectedExam && (
                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    maxQty={MAX_QUANTITY}
                  />
                )}

                {/* Price Calculation */}
                {selectedExam && (
                  <View style={[
                    styles.priceCalcRow,
                    { borderColor: selectedExam.color },
                  ]}>
                    <View style={styles.priceCalcItem}>
                      <Text style={styles.priceCalcLabel}>Unit Price</Text>
                      <Text style={[styles.priceCalcValue, { color: selectedExam.color }]}>
                        ₦{unitPrice.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.priceCalcDivider} />
                    <View style={styles.priceCalcItem}>
                      <Text style={styles.priceCalcLabel}>Quantity</Text>
                      <Text style={[styles.priceCalcValue, { color: selectedExam.color }]}>
                        × {quantity}
                      </Text>
                    </View>
                    <View style={styles.priceCalcDivider} />
                    <View style={styles.priceCalcItem}>
                      <Text style={styles.priceCalcLabel}>Total</Text>
                      <Text style={[styles.priceCalcTotal, { color: selectedExam.color }]}>
                        ₦{totalPrice.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Delivery Details */}
                {selectedExam && (
                  <DeliveryInput
                    phone={phoneNumber}
                    onPhoneChange={setPhoneNumber}
                    onUseMine={() => {
                      setPhoneNumber(userPhone);
                      setEmail(userEmail);
                    }}
                    email={email}
                    onEmailChange={setEmail}
                  />
                )}

                {/* Proceed Button */}
                {selectedExam && (
                  <TouchableOpacity
                    style={[
                      gs.primaryButton,
                      { backgroundColor: selectedExam?.color || colors.primaryColor1 },
                      (!phoneNumber || !email || isCheckingStatus) && { opacity: 0.6 },
                    ]}
                    onPress={handleProceed}
                    disabled={!phoneNumber || !email || isCheckingStatus}
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
                          Proceed — ₦{totalPrice.toLocaleString()}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Order Summary ─────────────────── */}
            {showSummary && serviceStatus !== 'paused' && (
              <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.summaryTitle, { color: colors.textBlack }]}>Order Summary</Text>
                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />

                <SummaryRow label="Exam Type" value={selectedExam?.label} />
                <SummaryRow
                  label="Full Name"
                  value={selectedExam?.fullName}
                />
                <SummaryRow
                  label="Quantity"
                  value={`${quantity} ${quantity === 1 ? 'Pin' : 'Pins'}`}
                />
                <SummaryRow
                  label="Unit Price"
                  value={`₦${unitPrice.toLocaleString()}`}
                />
                <SummaryRow label="Phone Number" value={phoneNumber} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow
                  label="Delivery"
                  value={selectedExam?.deliveryMethod}
                />
                <SummaryRow label="Service Fee" value="₦0.00" />

                <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />

                <SummaryRow
                  label="Total"
                  value={`₦${totalPrice.toLocaleString()}`}
                  isTotal
                  valueColor={selectedExam?.color}
                />

                {/* Wallet Balance Check */}
                <View style={[styles.balanceCheckRow, { backgroundColor: colors.bgLight }]}>
                  <Ionicons
                    name={
                      totalPrice <= Number(walletBalance)
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={18}
                    color={
                      totalPrice <= Number(walletBalance)
                        ? colors.successColor
                        : colors.dangerColor
                    }
                  />
                  <Text style={[styles.balanceCheckText, { color: colors.textBlack }]}>
                    Wallet Balance: ₦{Number(walletBalance).toLocaleString()}
                  </Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: selectedExam?.color },
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
                        Confirm & Pay ₦{totalPrice.toLocaleString()}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setShowSummary(false)}>
                  <Text style={[styles.editBtnText, { color: colors.textSecColor }]}>Edit Order</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Rewards Tips ─────────────────── */}
            <RewardsTipsCard examLabel={selectedExam?.label || 'exam'} />

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

  // Exam Grid
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  examCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    
    
    position: 'relative',
    ...shadows.sm,
  },
  examCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examCheckText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  examIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  examLogo: {
    fontSize: 28,
  },
  examLabel: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    
    marginBottom: 4,
  },
  examFullName: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  examPriceTag: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  examPriceText: {
    fontFamily: '_bold',
    fontSize: typography.sm,
  },

  // Exam Info Banner
  examInfoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  examInfoLogo: {
    fontSize: 32,
    marginTop: 2,
  },
  examInfoContent: {
    flex: 1,
  },
  examInfoLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    marginBottom: 4,
    lineHeight: 22,
  },
  examInfoDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  examInfoDelivery: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Quantity
  quantityContainer: {
    marginBottom: spacing.lg,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
    borderRadius: radius.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  quantityBtnDisabled: {
    opacity: 0.4,
  },
  quantityDisplay: {
    alignItems: 'center',
    marginHorizontal: spacing.xxxl,
  },
  quantityNumber: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    
  },
  quantityLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },
  quickQtyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  quickQtyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    
    
  },
  quickQtyBtnSelected: {
  },
  quickQtyBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  quickQtyBtnTextSelected: {
    
  },

  // Price Calculation
  priceCalcRow: {
    flexDirection: 'row',
    
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
  },
  priceCalcItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceCalcDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },
  priceCalcLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    marginBottom: 4,
    lineHeight: 20,
  },
  priceCalcValue: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  priceCalcTotal: {
    fontFamily: '_bold',
    fontSize: typography.xl,
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
    alignItems: 'flex-start',
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
    flex: 1,
    textAlign: 'right',
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

export default ExamCardsScreen;
