import React, { useState, useRef, useEffect, useContext } from 'react';
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

const QUICK_AMOUNTS = ['1500', '2000', '5000', '10000', '20000', '50000'];

// ── USD Asset Button ──────────────────────────────
const UsdAssetBtn = ({ asset, isSelected, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.usdAssetBtn,
      { borderColor: isSelected ? asset.color : colors.dividerColor,
        backgroundColor: isSelected ? asset.bgColor : colors.bgCard },
    ]}
    onPress={() => onSelect(asset)}
    activeOpacity={0.85}>
    {isSelected && (
      <View style={[styles.usdAssetCheck, { backgroundColor: asset.color }]}>
        <Ionicons name="checkmark" size={10} color="#fff" />
      </View>
    )}
    <View style={[styles.usdAssetIcon, { backgroundColor: isSelected ? asset.color + '20' : colors.bgLight }]}>
      <Ionicons name={asset.icon} size={22} color={isSelected ? asset.color : colors.textSecColor} />
    </View>
    <Text style={[styles.usdAssetLabel, { color: isSelected ? asset.color : colors.textBlack },
      isSelected && { fontFamily: '_bold' }]}>
      {asset.label}
    </Text>
  </TouchableOpacity>
);

const USD_ASSETS = [
  { id: 'paypal',   label: 'PayPal',   icon: 'logo-paypal', color: '#003087', bgColor: '#E8F0FE' },
  { id: 'payoneer', label: 'Payoneer', icon: 'card-outline', color: '#FF4800', bgColor: '#FFF0EC' },
  { id: 'bitcoin',  label: 'Bitcoin',  icon: 'logo-bitcoin', color: '#F7931A', bgColor: '#FFF8EC' },
];

// ── Main Fund Account Screen ──────────────────────
const FundAccountScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo, appSettingDetails } = useContext(AuthContext);

  const refCheckoutSheet = useRef();
  const refUsdSheet = useRef();
  const scrollRef = useRef();
  const noteInputRef = useRef();
  const usdNoteInputRef = useRef();

  // ── Tab state ─────────────────────────────────
  const [activeTab, setActiveTab] = useState('naira');

  // ── Naira state ───────────────────────────────
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [minimFunding, setMinimFunding] = useState(100);
  const [maxiFunding, setMaxiFunding] = useState(500000);

  // ── USD state ─────────────────────────────────
  const [usdAsset, setUsdAsset] = useState(null);
  const [usdAmount, setUsdAmount] = useState('');
  const [usdNote, setUsdNote] = useState('');
  const [usdAmountFocused, setUsdAmountFocused] = useState(false);
  const [isUsdPaypalLoading, setIsUsdPaypalLoading] = useState(false);
  const [isUsdManualLoading, setIsUsdManualLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('AppSettingData').then((res) => {
      if (res) {
        const data = JSON.parse(res);
        if (data?.app_minim_funding) setMinimFunding(data.app_minim_funding);
        if (data?.app_maxi_funding)  setMaxiFunding(data.app_maxi_funding);
      }
    }).catch(() => {});
  }, []);

  // Reset on focus
  useEffect(() => {
    if (isFocused) {
      setAmount('');
      setNote('');
      setUsdAmount('');
      setUsdNote('');
      setUsdAsset(null);
    }
  }, [isFocused]);

  // ── Naira Validation ──────────────────────────
  const validate = () => {
    if (!amount) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Amount Required', textBody: 'Please enter the amount you want to fund.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
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

  // ── USD Validation ────────────────────────────
  const validateUsd = () => {
    if (!usdAsset) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Method', textBody: 'Please select a funding method (PayPal, Payoneer or Bitcoin).', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!usdAmount || Number(usdAmount) <= 0) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Amount Required', textBody: 'Please enter a valid USD amount.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Naira: Proceed ────────────────────────────
  const handleProceed = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    refCheckoutSheet.current.open();
  };

  // ── Naira: Manual Transfer ────────────────────
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
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsManualLoading(false);
    }
  };

  // ── Naira: Paystack ───────────────────────────
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
        tag_id:          userInfo.userData.tag_id,
        myId:            userInfo.userData._id,
        amt:             amount,
        note,
        userId:          userInfo.userData._id,
        serviceName:     'Account Funding',
        serviceCategory: 'Exchange',
        method:          'Paystack Checkout',
        total_money:     amount,
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
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not connect to payment gateway.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsPaystackLoading(false);
    }
  };

  // ── USD: Proceed ──────────────────────────────
 const handleUsdProceed = () => {
    Keyboard.dismiss();
    if (!validateUsd()) return;
    refUsdSheet.current.open();
  };

  // ── USD: PayPal Checkout ──────────────────────
  const handleUsdPaypalCheckout = async () => {
    setIsUsdPaypalLoading(true);
    try {
      const res = await client.post('/api/create-payment', {
        amount:          usdAmount,
        currency:        'USD',
        tag_id:          userInfo?.userData?.tag_id,
        myId:            userInfo?.userData?._id,
        sell_note:       usdNote,
        serviceName:     'PayPal',
        serviceCategory: 'Exchange',
        serviceType:     'USD Funding',
        method:          'Paypal Checkout',
      }, { headers: { 'Authorization': 'Bearer ' + userToken } });

      refUsdSheet.current.close();
      if (res.data?.approvalUrl) {
        navigation.navigate('paypalWebview', {
          uri:         res.data.approvalUrl,
          amount:      usdAmount,
          currency:    'USD',
          assetLabel:  'PayPal USD Funding',
          ngnAmount:   '0',
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'PayPal Error', textBody: 'Could not initiate PayPal. Try manual transfer.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      refUsdSheet.current.close();
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not connect. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsUsdPaypalLoading(false);
    }
  };

  // ── USD: Manual Transfer ──────────────────────
  const handleUsdManualTransfer = async () => {
    setIsUsdManualLoading(true);
    try {
      const res = await client.post('/api/usd_account_funding', {
        userId:      userInfo?.userData?._id,
        amt:         Number(usdAmount),
        serviceName: usdAsset.label,
        method:      'Manual',
        note:        usdNote,
      }, { headers: { 'Authorization': 'Bearer ' + userToken } });

      refUsdSheet.current.close();
      if (res.data.msg === '200') {
        navigation.navigate('CheckManual', {
          asset:           usdAsset.id,
          assetLabel:      usdAsset.label,
          amount:          usdAmount,
          currency:        'USD',
          ngnAmount:       '0',
          serviceName:     usdAsset.label,
          serviceCategory: 'Exchange',
          serviceType:     'USD Funding',
          method:          'Manually Checkout',
          tag_id:          userInfo?.userData?.tag_id,
        });
        setUsdAmount('');
        setUsdNote('');
        setUsdAsset(null);
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not connect. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsUsdManualLoading(false);
    }
  };

  // ── Tab gradients ─────────────────────────────
  const nairaGradient = [colors.primaryColor1, colors.primaryColor1b || '#3D4EAA'];
  const usdGradient   = ['#10B981', '#059669'];
  const activeGradient = activeTab === 'naira' ? nairaGradient : usdGradient;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />
              <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 }]}
            keyboardShouldPersistTaps="handled">

            {/* ── Header ──────────────────────── */}
            <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Fund Account</Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={activeGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                {activeTab === 'naira'
                  ? <FontAwesome5 name="wallet" size={26} color={colors.primaryColor1} />
                  : <Ionicons name="globe-outline" size={26} color="#10B981" />
                }
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>
                  {activeTab === 'naira' ? 'Fund Naira Wallet' : 'Fund USD Wallet'}
                </Text>
                <Text style={styles.heroDesc}>
                  {activeTab === 'naira'
                    ? 'Add NGN via Paystack or manual bank transfer'
                    : 'Send via PayPal, Payoneer or Bitcoin'}
                </Text>
              </View>
            </LinearGradient>

            {/* ── Tab Selector ─────────────────── */}
            <View style={[styles.tabRow, { backgroundColor: colors.bgLight }]}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'naira' && [styles.tabBtnActive, { backgroundColor: colors.bgCard }],
                ]}
                onPress={() => setActiveTab('naira')}
                activeOpacity={0.85}>
                <Text style={[
                  styles.tabBtnText,
                  { color: activeTab === 'naira' ? colors.primaryColor1 : colors.textSecColor },
                  activeTab === 'naira' && { fontFamily: '_bold' },
                ]}>
                  🇳🇬 Naira Funding
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  activeTab === 'usd' && [styles.tabBtnActive, { backgroundColor: colors.bgCard }],
                ]}
                onPress={() => setActiveTab('usd')}
                activeOpacity={0.85}>
                <Text style={[
                  styles.tabBtnText,
                  { color: activeTab === 'usd' ? '#10B981' : colors.textSecColor },
                  activeTab === 'usd' && { fontFamily: '_bold' },
                ]}>
                  💵 USD Funding
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── NAIRA FORM ─────────────────────── */}
            {activeTab === 'naira' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.formTitle, { color: colors.textBlack }]}>Enter Funding Details</Text>
                <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                  Enter the amount you want to add to your wallet
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Amount (₦)</Text>
                  <View style={[styles.inputContainer, {
                    borderColor: amountFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: amountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  }]}>
                    <Ionicons name="cash-outline" size={20}
                      color={amountFocused ? colors.primaryColor1 : colors.textSecColor}
                      style={styles.inputIcon} />
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

                <Text style={[styles.quickLabel, { color: colors.textSecColor }]}>Quick Select</Text>
                <View style={styles.quickAmtsRow}>
                  {QUICK_AMOUNTS.map((amt) => (
                    <QuickAmount key={amt} amount={amt} selected={amount === amt} onSelect={setAmount} colors={colors} />
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Purpose / Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                  </Text>
                  <View style={[styles.noteContainer, {
                    borderColor: noteFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: noteFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  }]}>
                    <TextInput
                      ref={noteInputRef}
                      style={[styles.noteField, { color: colors.textBlack }]}
                      placeholder="e.g. Monthly top-up, Trading funds..."
                      placeholderTextColor={colors.textSecColor2}
                      value={note}
                      onChangeText={setNote}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                      onFocus={() => {
                        setNoteFocused(true);
                        setTimeout(() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }, 150);
                      }}
                      onBlur={() => setNoteFocused(false)}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.proceedBtn, { backgroundColor: colors.primaryColor1 }, !amount && { opacity: 0.6 }]}
                  onPress={handleProceed}
                  disabled={!amount}
                  activeOpacity={0.85}>
                  <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
                  <Text style={styles.proceedBtnText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── USD FORM ─────────────────────── */}
            {activeTab === 'usd' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.formTitle, { color: colors.textBlack }]}>Fund USD Wallet</Text>
                <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                  Send via PayPal, Payoneer or Bitcoin and upload proof of payment
                </Text>

                {/* USD Asset Selection */}
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Funding Method *
                </Text>
                <View style={styles.usdAssetsRow}>
                  {USD_ASSETS.map((asset) => (
                    <UsdAssetBtn
                      key={asset.id}
                      asset={asset}
                      isSelected={usdAsset?.id === asset.id}
                      onSelect={setUsdAsset}
                      colors={colors}
                    />
                  ))}
                </View>

                {/* USD Amount */}
                <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Amount (USD) *</Text>
                  <View style={[styles.inputContainer, {
                    borderColor: usdAmountFocused ? '#10B981' : colors.dividerColor,
                    backgroundColor: usdAmountFocused ? '#10B98110' : colors.bgLight,
                  }]}>
                    <Text style={[styles.currencySymbol, { color: usdAmountFocused ? '#10B981' : colors.textSecColor }]}>$</Text>
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="Enter amount in USD"
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType="decimal-pad"
                      value={usdAmount}
                      onChangeText={(val) => setUsdAmount(val.replace(/[^0-9.]/g, ''))}
                      onFocus={() => setUsdAmountFocused(true)}
                      onBlur={() => setUsdAmountFocused(false)}
                    />
                    {usdAmount.length > 0 && (
                      <TouchableOpacity onPress={() => setUsdAmount('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textSecColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* USD Note */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                  </Text>
                  <View style={[styles.noteContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                    <TextInput
                      ref={usdNoteInputRef}
                      style={[styles.noteField, { color: colors.textBlack }]}
                      placeholder="Additional notes..."
                      placeholderTextColor={colors.textSecColor2}
                      value={usdNote}
                      onChangeText={setUsdNote}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      maxLength={200}
                     onFocus={() => {
                        setTimeout(() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }, 150);
                      }}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.proceedBtn, { backgroundColor: '#10B981' },
                    (!usdAsset || !usdAmount) && { opacity: 0.6 }]}
                  onPress={handleUsdProceed}
                  disabled={!usdAsset || !usdAmount}
                  activeOpacity={0.85}>
                  <Ionicons name="arrow-forward-circle-outline" size={22} color="#fff" />
                  <Text style={styles.proceedBtnText}>Fund USD Wallet</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Info Card ─────────────────────── */}
            <View style={[styles.infoCard, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
              <Text style={[styles.infoTitle, { color: colors.textBlack }]}>
                {activeTab === 'naira' ? '💳 Payment Methods' : '💡 USD Funding Methods'}
              </Text>
              {(activeTab === 'naira' ? [
                { icon: 'card-outline',     color: colors.primaryColor1, title: 'Paystack', desc: 'Instant funding via debit/credit card or bank transfer' },
                { icon: 'business-outline', color: colors.successColor,  title: 'Manual Bank Transfer', desc: 'Transfer to our bank account and upload proof' },
              ] : [
                { icon: 'logo-paypal',  color: '#003087', title: 'PayPal', desc: 'Pay via PayPal checkout — instant processing' },
                { icon: 'card-outline', color: '#FF4800', title: 'Payoneer / Bitcoin', desc: 'Transfer manually and upload proof of payment' },
              ]).map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <View style={[styles.infoIconBox, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={[styles.infoItemTitle, { color: colors.textBlack }]}>{item.title}</Text>
                    <Text style={[styles.infoItemDesc, { color: colors.textSecColor }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.securityNotice, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                All transactions are secured with bank-level encryption. Your funds are protected at all times.
              </Text>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Naira: Checkout Bottom Sheet ─────────── */}
      <RBSheet
        ref={refCheckoutSheet}
        closeOnDragDown
        closeOnPressMask
        openDuration={400}
        closeDuration={300}
        height={380}
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
          <Text style={[styles.sheetTitle, { color: colors.textBlack }]}>Choose Payment Method</Text>
          <Text style={[styles.sheetDesc, { color: colors.textSecColor }]}>
            Select how you want to fund ₦{Number(amount).toLocaleString()}
          </Text>
          <View style={[styles.sheetDivider, { backgroundColor: colors.dividerColor }]} />

          <TouchableOpacity
            style={[styles.sheetBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={PaystackOut}
            disabled={isPaystackLoading}
            activeOpacity={0.85}>
            {isPaystackLoading ? <ActivityIndicator color="#fff" size={22} /> : (
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

          <TouchableOpacity
            style={[styles.sheetBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primaryColor1 }]}
            onPress={checkOutManually}
            disabled={isManualLoading}
            activeOpacity={0.85}>
            {isManualLoading ? <ActivityIndicator color={colors.primaryColor1} size={22} /> : (
              <>
                <Ionicons name="business-outline" size={22} color={colors.primaryColor1} />
                <View style={styles.sheetBtnInfo}>
                  <Text style={[styles.sheetBtnText, { color: colors.primaryColor1 }]}>Manual Bank Transfer</Text>
                  <Text style={[styles.sheetBtnSub, { color: colors.textSecColor }]}>Bank transfer • 1–24 hours</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primaryColor1} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </RBSheet>

    {/* ── USD: Checkout Bottom Sheet ───────────── */}
      <RBSheet
        ref={refUsdSheet}
        closeOnDragDown
        closeOnPressMask
        openDuration={400}
        closeDuration={300}
        height={usdAsset?.id === 'paypal' ? 380 : 300}
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
            Choose Funding Method
          </Text>
          <Text style={[styles.sheetDesc, { color: colors.textSecColor }]}>
            {usdAsset?.id === 'paypal'
              ? 'Pay via PayPal checkout or transfer manually and upload proof.'
              : `Transfer via ${usdAsset?.label} manually and upload your proof of payment.`}
          </Text>
          <View style={[styles.sheetDivider, { backgroundColor: colors.dividerColor }]} />

          {/* PayPal — only for PayPal method */}
          {usdAsset?.id === 'paypal' && (
            <TouchableOpacity
              style={[styles.sheetBtn, { backgroundColor: '#003087' }]}
              onPress={handleUsdPaypalCheckout}
              disabled={isUsdPaypalLoading}
              activeOpacity={0.85}>
              {isUsdPaypalLoading ? <ActivityIndicator color="#fff" size={22} /> : (
                <>
                  <Ionicons name="logo-paypal" size={22} color="#fff" />
                  <View style={styles.sheetBtnInfo}>
                    <Text style={styles.sheetBtnText}>Pay With PayPal</Text>
                    <Text style={styles.sheetBtnSub}>Instant • Secured by PayPal</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Manual Transfer — always shown */}
          <TouchableOpacity
            style={[styles.sheetBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#10B981' }]}
            onPress={handleUsdManualTransfer}
            disabled={isUsdManualLoading}
            activeOpacity={0.85}>
            {isUsdManualLoading ? <ActivityIndicator color="#10B981" size={22} /> : (
              <>
                <Ionicons name="swap-horizontal-outline" size={22} color="#10B981" />
                <View style={styles.sheetBtnInfo}>
                  <Text style={[styles.sheetBtnText, { color: '#10B981' }]}>Manual Transfer</Text>
                  <Text style={[styles.sheetBtnSub, { color: colors.textSecColor }]}>
                    Transfer and upload proof • 1–24 hours
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#10B981" />
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

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: '_bold', fontSize: typography.xl },
  backBtn: { width: 42, height: 42, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },

  heroBanner: {
    marginHorizontal: spacing.xl, borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing.lg,
    overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadows.lg,
  },
  heroCircle1: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroCircle2: { position: 'absolute', left: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroIconBox: { width: 54, height: 54, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: '_bold', fontSize: typography.xl, color: '#fff', marginBottom: 4 },
  heroDesc: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  // Tabs
  tabRow: {
    flexDirection: 'row', marginHorizontal: spacing.xl,
    borderRadius: radius.xl, padding: 4, marginBottom: spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  tabBtnActive: { ...shadows.sm },
  tabBtnText: { fontFamily: '_semiBold', fontSize: typography.base },

  // Form
  formCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  formTitle: { fontFamily: '_bold', fontSize: typography.xl, marginBottom: 4 },
  formDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.xl },

  // Inputs
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { fontFamily: '_semiBold', fontSize: typography.base, marginBottom: spacing.sm, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56 },
  inputIcon: { marginRight: spacing.sm },
  currencySymbol: { fontFamily: '_bold', fontSize: typography.xl, marginRight: spacing.sm },
  inputField: { flex: 1, fontFamily: '_semiBold', fontSize: typography.xl, paddingVertical: 0 },
  inputHint: { fontFamily: '_regular', fontSize: typography.base, marginTop: spacing.xs, lineHeight: 22 },
  noteContainer: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.md, minHeight: 90 },
  noteField: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, textAlignVertical: 'top' },

  // Quick Amounts
  quickLabel: { fontFamily: '_semiBold', fontSize: typography.base, marginBottom: spacing.sm, lineHeight: 22 },
  quickAmtsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  quickAmtBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1.5 },
  quickAmtText: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },

  // USD Assets
  usdAssetsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  usdAssetBtn: { flex: 1, alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1.5, position: 'relative', gap: spacing.xs },
  usdAssetCheck: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  usdAssetIcon: { width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  usdAssetLabel: { fontFamily: '_semiBold', fontSize: typography.sm, textAlign: 'center' },

  // Proceed
  proceedBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54, borderRadius: radius.lg, gap: spacing.sm, marginTop: spacing.sm, ...shadows.md },
  proceedBtnText: { fontFamily: '_bold', fontSize: typography.lg, color: '#fff' },

  // Info Card
  infoCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1 },
  infoTitle: { fontFamily: '_bold', fontSize: typography.base, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  infoIconBox: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1 },
  infoItemTitle: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },
  infoItemDesc: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20, marginTop: 2 },

  // Security
  securityNotice: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: spacing.xl, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, gap: spacing.sm },
  securityText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // Bottom Sheet
  sheetContent: { padding: spacing.xl, flex: 1 },
  sheetTitle: { fontFamily: '_bold', fontSize: typography.xl, marginBottom: 4 },
  sheetDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.md },
  sheetDivider: { height: 1, marginBottom: spacing.lg },
  sheetBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md, ...shadows.sm },
  sheetBtnInfo: { flex: 1 },
  sheetBtnText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff', lineHeight: 22 },
  sheetBtnSub: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  modalTitle: { fontFamily: '_bold', fontSize: typography.xxl, marginBottom: spacing.sm },
  modalDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.lg },
  modalBtns: { gap: spacing.md },
  modalBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 52, borderRadius: radius.lg, gap: spacing.sm, ...shadows.md },
  modalBtnText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
  modalCancel: { alignItems: 'center', padding: spacing.md },
  modalCancelText: { fontFamily: '_semiBold', fontSize: typography.base },
});

export default FundAccountScreen;