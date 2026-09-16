import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import Modal from 'react-native-modal';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

// ── Nigerian Banks — static list (Paystack-verified) ─
const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Parallex Bank', code: '526' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'SunTrust Bank', code: '100' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

// ── Bank Picker Item ──────────────────────────────
const BankPickerItem = ({ bank, onSelect, colors }) => (
  <TouchableOpacity
    style={[styles.bankPickerItem, { borderBottomColor: colors.dividerColor }]}
    onPress={() => onSelect(bank)}
    activeOpacity={0.7}>
    <View style={[styles.bankPickerIcon, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="business-outline" size={18} color={colors.primaryColor1} />
    </View>
    <Text style={[styles.bankPickerName, { color: colors.textBlack }]}>{bank.name}</Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
  </TouchableOpacity>
);

// ── Tab ───────────────────────────────────────────
const TAB_OPTIONS = [
  { id: 'bank',     label: 'Bank Account', icon: 'business-outline' },
  { id: 'digital',  label: 'Digital Wallets', icon: 'globe-outline' },
];

const BankDetailsScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const userId = userInfo?.userData?._id;

  // ── Tab ───────────────────────────────────────
  const [activeTab, setActiveTab] = useState('bank');

  // ── Bank tab state ────────────────────────────
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [existingBank, setExistingBank] = useState(null);
  const [filteredBanks, setFilteredBanks] = useState(NIGERIAN_BANKS);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountFocused, setAccountFocused] = useState(false);

  // ── Digital wallets state ─────────────────────
  const [paypalAddress, setPaypalAddress] = useState('');
  const [payoneerAddress, setPayoneerAddress] = useState('');
  const [btcAddress, setBtcAddress] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(true);

  useEffect(() => {
    if (isFocused) fetchExistingDetails();
  }, [isFocused]);

  // ── Fetch existing details ────────────────────
  const fetchExistingDetails = async () => {
    setIsFetchingExisting(true);
    try {
      const res = await client.get(`/api/user_bankDetails/${userId}`, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200' && res.data.bankDetail) {
        const d = res.data.bankDetail;
        setExistingBank(d);
        setBankName(d.bank_name || '');
        setBankCode(d.bank_code || '');
        setAccountNumber(String(d.bank_acct_number || ''));
        setAccountName(d.bank_acct_name || '');
        setPaypalAddress(d.paypal_address || '');
        setPayoneerAddress(d.payoneer_address || '');
        setBtcAddress(d.btc_address || '');
        // Pre-select bank code from list
        if (d.bank_name) {
          const found = NIGERIAN_BANKS.find(b =>
            b.name.toLowerCase() === d.bank_name.toLowerCase()
          );
          if (found) setBankCode(found.code);
        }
      }
    } catch (error) {
      console.log('Fetch bank error:', error.message);
    } finally {
      setIsFetchingExisting(false);
    }
  };

  // ── Bank search ───────────────────────────────
  const handleBankSearch = (text) => {
    setBankSearch(text);
    if (!text.trim()) { setFilteredBanks(NIGERIAN_BANKS); return; }
    setFilteredBanks(NIGERIAN_BANKS.filter(b =>
      b.name.toLowerCase().includes(text.toLowerCase())
    ));
  };

  // ── Select bank ───────────────────────────────
  const handleSelectBank = (bank) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setShowBankModal(false);
    setBankSearch('');
    setFilteredBanks(NIGERIAN_BANKS);
    setAccountName('');
    if (accountNumber.length === 10) verifyAccount(accountNumber, bank.code);
  };

  // ── Verify account via Paystack ───────────────
  const verifyAccount = async (acctNum, code) => {
    const bCode = code || bankCode;
    if (!acctNum || acctNum.length !== 10 || !bCode) return;
    setIsVerifying(true);
    setAccountName('');
    try {
      const res = await client.post(
        '/api/verify_bankAccount',
        { account_number: acctNum, bank_code: bCode },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setAccountName(res.data.account_name);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Account Verified', textBody: `Account found: ${res.data.account_name}`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Not Found', textBody: 'Could not verify account. Please check the number and bank.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Verification failed. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Save all details ──────────────────────────
  const handleSave = async () => {
    Keyboard.dismiss();
    if (activeTab === 'bank') {
      if (!bankName) {
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Bank', textBody: 'Please select your bank.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        return;
      }
      if (!accountNumber || accountNumber.length !== 10) {
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Account Number', textBody: 'Enter a valid 10-digit account number.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        return;
      }
      if (!accountName) {
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'Verify Account', textBody: 'Please verify your account number before saving.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await client.post(
        '/api/complete_registration',
        {
          userId,
          bank_name:        bankName,
          acct_name:        accountName,
          acct_number:      accountNumber,
          paypal_address:   paypalAddress,
          payoneer_address: payoneerAddress,
          btc_address:      btcAddress,
          // Pass existing personal info unchanged
          sex:     userInfo?.userData?.gender     || '',
          dob:     userInfo?.userData?.dob         || '',
          state:   userInfo?.userData?.state       || '',
          address: userInfo?.userData?.address     || '',
          country: userInfo?.userData?.country     || '',
          city:    userInfo?.userData?.city        || '',
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Details Saved!',
          textBody: activeTab === 'bank'
            ? 'Your bank account details have been saved successfully.'
            : 'Your digital wallet addresses have been saved successfully.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => fetchExistingDetails(),
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Save Failed', textBody: res.data.message || 'Could not save details. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            {/* ── Header ──────────────────────── */}
            <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
              <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.bgLight }]} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Payment Details</Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero ────────────────────────── */}
            <LinearGradient
              colors={[colors.primaryColor1, colors.primaryColor1b]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons name="wallet-outline" size={28} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Payment Details</Text>
                <Text style={styles.heroDesc}>
                  Manage your bank account and digital wallet addresses for withdrawals and payments
                </Text>
              </View>
            </LinearGradient>

            {/* ── Existing Card ─────────────────── */}
            {isFetchingExisting ? (
              <View style={[styles.loadingCard, { backgroundColor: colors.bgCard }]}>
                <ActivityIndicator color={colors.primaryColor1} />
                <Text style={[styles.loadingText, { color: colors.textSecColor }]}>Loading details...</Text>
              </View>
            ) : existingBank && (existingBank.bank_acct_number || existingBank.paypal_address) ? (
              <View style={[styles.existingCard, { backgroundColor: colors.bgCard, borderColor: colors.successColor }]}>
                <View style={styles.existingCardHeader}>
                  <View style={[styles.existingIconBox, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.successColor} />
                  </View>
                  <View style={styles.existingInfo}>
                    <Text style={[styles.existingTitle, { color: colors.textBlack }]}>Details Saved</Text>
                    <Text style={[styles.existingSub, { color: colors.textSecColor }]}>You can update your details below</Text>
                  </View>
                </View>
                <View style={[styles.existingDivider, { backgroundColor: colors.dividerColor }]} />
                {existingBank.bank_acct_number ? (
                  <>
                    <Text style={[styles.existingName, { color: colors.textBlack }]}>{existingBank.bank_acct_name}</Text>
                    <Text style={[styles.existingNumber, { color: colors.primaryColor1 }]}>{existingBank.bank_acct_number}</Text>
                    <Text style={[styles.existingBank, { color: colors.textSecColor }]}>{existingBank.bank_name}</Text>
                  </>
                ) : null}
                {existingBank.paypal_address ? (
                  <Text style={[styles.existingBank, { color: colors.textSecColor, marginTop: spacing.xs }]}>
                    PayPal: {existingBank.paypal_address}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* ── Tab Selector ─────────────────── */}
            <View style={[styles.tabRow, { backgroundColor: colors.bgLight }]}>
              {TAB_OPTIONS.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabBtn,
                    activeTab === tab.id && [styles.tabBtnActive, { backgroundColor: colors.bgCard }],
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.85}>
                  <Ionicons name={tab.icon} size={16} color={activeTab === tab.id ? colors.primaryColor1 : colors.textSecColor} />
                  <Text style={[
                    styles.tabBtnText,
                    { color: activeTab === tab.id ? colors.primaryColor1 : colors.textSecColor },
                    activeTab === tab.id && { fontFamily: '_bold' },
                  ]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── BANK ACCOUNT FORM ─────────────── */}
            {activeTab === 'bank' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.formTitle, { color: colors.textBlack }]}>
                  {existingBank?.bank_acct_number ? 'Update Bank Account' : 'Add Bank Account'}
                </Text>
                <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                  Your account name will be verified automatically when you enter your account number.
                </Text>

                {/* Bank Selector */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Bank Name</Text>
                  <TouchableOpacity
                    style={[styles.bankSelector, {
                      borderColor: bankName ? colors.primaryColor1 : colors.dividerColor,
                      backgroundColor: bankName ? colors.primaryColor1 + '10' : colors.bgLight,
                    }]}
                    onPress={() => setShowBankModal(true)}
                    activeOpacity={0.8}>
                    <Ionicons name="business-outline" size={20}
                      color={bankName ? colors.primaryColor1 : colors.textSecColor} style={styles.inputIcon} />
                    <Text style={[styles.bankSelectorText, { color: bankName ? colors.textBlack : colors.textSecColor2 }]}>
                      {bankName || 'Select your bank'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textSecColor} />
                  </TouchableOpacity>
                </View>

                {/* Account Number */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Account Number</Text>
                  <View style={[styles.inputContainer, {
                    borderColor: accountFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: accountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  }]}>
                    <Ionicons name="card-outline" size={20}
                      color={accountFocused ? colors.primaryColor1 : colors.textSecColor} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="Enter 10-digit account number"
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType="numeric"
                      maxLength={10}
                      value={accountNumber}
                      onChangeText={(v) => {
                        const clean = v.replace(/[^0-9]/g, '');
                        setAccountNumber(clean);
                        setAccountName('');
                        if (clean.length === 10 && bankCode) verifyAccount(clean, bankCode);
                      }}
                      onFocus={() => setAccountFocused(true)}
                      onBlur={() => setAccountFocused(false)}
                    />
                    {isVerifying && <ActivityIndicator size={16} color={colors.primaryColor1} />}
                    {accountNumber.length === 10 && !isVerifying && !accountName && bankCode && (
                      <TouchableOpacity onPress={() => verifyAccount(accountNumber, bankCode)}>
                        <Text style={[styles.verifyText, { color: colors.primaryColor1 }]}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                    Enter your 10-digit NUBAN account number
                  </Text>
                </View>

                {/* Verified Account Name */}
                {accountName ? (
                  <View style={[styles.verifiedCard, { backgroundColor: '#D1FAE5', borderColor: colors.successColor }]}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.successColor} />
                    <View style={styles.verifiedInfo}>
                      <Text style={[styles.verifiedLabel, { color: colors.successColor }]}>Account Verified</Text>
                      <Text style={[styles.verifiedName, { color: '#065F46' }]}>{accountName}</Text>
                    </View>
                  </View>
                ) : accountNumber.length === 10 && !isVerifying ? (
                  <View style={[styles.unverifiedCard, { backgroundColor: colors.warningLight, borderColor: '#FDE68A' }]}>
                    <Ionicons name="alert-circle-outline" size={18} color={colors.warningColor} />
                    <Text style={[styles.unverifiedText, { color: colors.warningColor }]}>
                      {bankCode ? 'Tap Verify to confirm your account name' : 'Please select a bank first'}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primaryColor1 },
                    (!bankName || !accountNumber || !accountName || isSaving) && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={!bankName || !accountNumber || !accountName || isSaving}
                  activeOpacity={0.85}>
                  {isSaving ? <ActivityIndicator color="#fff" size={22} /> : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>Save Bank Details</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── DIGITAL WALLETS FORM ──────────── */}
            {activeTab === 'digital' && (
              <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.formTitle, { color: colors.textBlack }]}>Digital Wallet Addresses</Text>
                <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                  Add your PayPal, Payoneer and Bitcoin addresses for receiving payments.
                </Text>

                {/* PayPal */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    PayPal Email Address
                  </Text>
                  <View style={[styles.inputContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                    <Ionicons name="logo-paypal" size={20} color="#003087" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="your@paypal.com"
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={paypalAddress}
                      onChangeText={setPaypalAddress}
                    />
                    {paypalAddress.length > 0 && (
                      <TouchableOpacity onPress={() => setPaypalAddress('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Payoneer */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Payoneer Email Address
                  </Text>
                  <View style={[styles.inputContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                    <Ionicons name="card-outline" size={20} color="#FF4800" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="your@payoneer.com"
                      placeholderTextColor={colors.textSecColor2}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={payoneerAddress}
                      onChangeText={setPayoneerAddress}
                    />
                    {payoneerAddress.length > 0 && (
                      <TouchableOpacity onPress={() => setPayoneerAddress('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Bitcoin */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Bitcoin (BTC) Wallet Address
                  </Text>
                  <View style={[styles.inputContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                    <Ionicons name="logo-bitcoin" size={20} color="#F7931A" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: colors.textBlack }]}
                      placeholder="Your BTC wallet address"
                      placeholderTextColor={colors.textSecColor2}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={btcAddress}
                      onChangeText={setBtcAddress}
                    />
                    {btcAddress.length > 0 && (
                      <TouchableOpacity onPress={() => setBtcAddress('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecColor} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primaryColor1 },
                    (!paypalAddress && !payoneerAddress && !btcAddress || isSaving) && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={(!paypalAddress && !payoneerAddress && !btcAddress) || isSaving}
                  activeOpacity={0.85}>
                  {isSaving ? <ActivityIndicator color="#fff" size={22} /> : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#fff" />
                      <Text style={styles.saveBtnText}>Save Wallet Addresses</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.notice, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                Your payment details are encrypted and stored securely. We only use them to process your withdrawals and payments.
              </Text>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Bank Picker Modal ─────────────────────── */}
      <Modal
        isVisible={showBankModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={300}
        backdropOpacity={0.6}
        onBackdropPress={() => setShowBankModal(false)}
        style={styles.modal}>
        <View style={[styles.modalCard, { backgroundColor: colors.bgCard }]}>
          <LinearGradient colors={[colors.primaryColor1, colors.primaryColor1b]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setShowBankModal(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={[styles.bankSearchContainer, { backgroundColor: colors.bgColor }]}>
            <View style={[styles.bankSearchInput, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
              <Ionicons name="search-outline" size={18} color={colors.textSecColor} />
              <TextInput
                style={[styles.bankSearchField, { color: colors.textBlack }]}
                placeholder="Search banks..."
                placeholderTextColor={colors.textSecColor2}
                value={bankSearch}
                onChangeText={handleBankSearch}
                autoFocus
              />
              {bankSearch.length > 0 && (
                <TouchableOpacity onPress={() => { setBankSearch(''); setFilteredBanks(NIGERIAN_BANKS); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <BankPickerItem bank={item} onSelect={handleSelectBank} colors={colors} />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.bankList}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textSecColor }]}>
                No banks found. Try a different search term.
              </Text>
            }
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  headerTitle: { fontFamily: '_bold', fontSize: typography.xl },
  backBtn: { width: 42, height: 42, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },

  heroBanner: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadows.lg },
  heroCircle1: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroCircle2: { position: 'absolute', left: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroIconBox: { width: 54, height: 54, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: '_bold', fontSize: typography.xl, color: '#fff', marginBottom: 4 },
  heroDesc: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  loadingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.md, ...shadows.card },
  loadingText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22 },

  existingCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1.5, ...shadows.card },
  existingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  existingIconBox: { width: 44, height: 44, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center' },
  existingInfo: { flex: 1 },
  existingTitle: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },
  existingSub: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginTop: 2 },
  existingDivider: { height: 1, marginBottom: spacing.md },
  existingName: { fontFamily: '_bold', fontSize: typography.lg, lineHeight: 26 },
  existingNumber: { fontFamily: '_bold', fontSize: typography.xl, lineHeight: 28, letterSpacing: 2, marginTop: 2 },
  existingBank: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginTop: 2 },

  tabRow: { flexDirection: 'row', marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: 4, marginBottom: spacing.lg },
  tabBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.lg, gap: spacing.xs },
  tabBtnActive: { ...shadows.sm },
  tabBtnText: { fontFamily: '_semiBold', fontSize: typography.base },

  formCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  formTitle: { fontFamily: '_bold', fontSize: typography.xl, marginBottom: 4 },
  formDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.xl },

  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { fontFamily: '_semiBold', fontSize: typography.base, marginBottom: spacing.sm, lineHeight: 22 },
  bankSelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56 },
  inputIcon: { marginRight: spacing.sm },
  bankSelectorText: { flex: 1, fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56 },
  inputField: { flex: 1, fontFamily: '_semiBold', fontSize: typography.lg, paddingVertical: 0 },
  inputHint: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginTop: spacing.xs },
  verifyText: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },

  verifiedCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5, gap: spacing.sm },
  verifiedInfo: { flex: 1 },
  verifiedLabel: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22 },
  verifiedName: { fontFamily: '_bold', fontSize: typography.lg, lineHeight: 26, marginTop: 2 },
  unverifiedCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, gap: spacing.sm },
  unverifiedText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: radius.lg, gap: spacing.sm, marginTop: spacing.sm, ...shadows.md },
  saveBtnText: { fontFamily: '_bold', fontSize: typography.lg, color: '#fff' },

  notice: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: spacing.xl, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, gap: spacing.sm },
  noticeText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  modal: { justifyContent: 'flex-end', margin: 0 },
  modalCard: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  modalTitle: { fontFamily: '_bold', fontSize: typography.lg, color: '#fff', flex: 1 },
  modalCloseBtn: { width: 32, height: 32, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },
  bankSearchContainer: { padding: spacing.md },
  bankSearchInput: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 48, borderWidth: 1, gap: spacing.sm },
  bankSearchField: { flex: 1, fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, paddingVertical: 0 },
  bankList: { maxHeight: 400 },
  bankPickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, gap: spacing.md },
  bankPickerIcon: { width: 36, height: 36, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  bankPickerName: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22, flex: 1 },
  emptyText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, textAlign: 'center', padding: spacing.xl },
});

export default BankDetailsScreen;
