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

// ── Bank Item in Picker ───────────────────────────
const BankPickerItem = ({ bank, onSelect, colors }) => (
  <TouchableOpacity
    style={[styles.bankPickerItem, { borderBottomColor: colors.dividerColor }]}
    onPress={() => onSelect(bank)}
    activeOpacity={0.7}>
    <View style={[styles.bankPickerIcon, { backgroundColor: colors.bgLight }]}>
      <Ionicons name="business-outline" size={18} color={colors.primaryColor1} />
    </View>
    <Text style={[styles.bankPickerName, { color: colors.textBlack }]}>
      {bank.name}
    </Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
  </TouchableOpacity>
);

// ── Main Bank Details Screen ──────────────────────
const BankDetailsScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [existingBank, setExistingBank] = useState(null);
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(true);
  const [accountFocused, setAccountFocused] = useState(false);

  const userId = userInfo?.userData?._id;

  // ── Fetch existing bank details ───────────────
  useEffect(() => {
    if (isFocused) {
      fetchExistingBank();
      fetchBanks();
    }
  }, [isFocused]);

  const fetchExistingBank = async () => {
    setIsFetchingExisting(true);
    try {
      const res = await client.get(`/api/user_bankDetails/${userId}`, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setExistingBank(res.data.bankDetail);
        setBankName(res.data.bankDetail.bank_name || '');
        setBankCode(res.data.bankDetail.bank_code || '');
        setAccountNumber(res.data.bankDetail.bank_acct_number || '');
        setAccountName(res.data.bankDetail.bank_acct_name || '');
      }
    } catch (error) {
      console.log('Fetch bank error:', error.message);
    } finally {
      setIsFetchingExisting(false);
    }
  };

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const res = await client.get('/api/fetch_banks', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setBanks(res.data.banks || []);
        setFilteredBanks(res.data.banks || []);
      }
    } catch (error) {
      console.log('Fetch banks error:', error.message);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // ── Search banks ──────────────────────────────
  const handleBankSearch = (text) => {
    setBankSearch(text);
    if (!text.trim()) {
      setFilteredBanks(banks);
      return;
    }
    setFilteredBanks(
      banks.filter((b) =>
        b.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // ── Select bank ───────────────────────────────
  const handleSelectBank = (bank) => {
    setBankName(bank.name);
    setBankCode(bank.code);
    setShowBankModal(false);
    setBankSearch('');
    setFilteredBanks(banks);
    // Auto-verify if account number already entered
    if (accountNumber.length === 10) {
      verifyAccount(accountNumber, bank.code);
    }
  };

  // ── Verify account ────────────────────────────
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
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Account Verified',
          textBody: `Account found: ${res.data.account_name}`,
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Not Found',
          textBody: 'Could not verify account. Please check the number and bank.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
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

  // ── Save bank details ─────────────────────────
  const handleSave = async () => {
    Keyboard.dismiss();
    if (!bankName) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Bank', textBody: 'Please select your bank from the list.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Account Number', textBody: 'Please enter a valid 10-digit account number.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!accountName) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Verify Account', textBody: 'Please verify your account number before saving.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsSaving(true);
    try {
      const res = await client.post(
        '/api/save_bankDetails',
        {
          bank_name: bankName,
          bank_code: bankCode,
          bank_acct_number: accountNumber,
          bank_acct_name: accountName,
          userId,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Bank Details Saved!',
          textBody: 'Your bank details have been saved successfully.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Save Failed',
          textBody: res.data.message || 'Could not save bank details. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Network Error',
        textBody: 'Could not connect. Please check your internet connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsSaving(false);
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
                Bank Details
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
                <Ionicons name="business-outline" size={28} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Bank Account</Text>
                <Text style={styles.heroDesc}>
                  Add your bank account details to enable withdrawals to your account
                </Text>
              </View>
            </LinearGradient>

            {/* ── Existing Bank Card ────────────── */}
            {isFetchingExisting ? (
              <View style={[styles.loadingCard, { backgroundColor: colors.bgCard }]}>
                <ActivityIndicator color={colors.primaryColor1} />
                <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
                  Loading bank details...
                </Text>
              </View>
            ) : existingBank && (
              <View style={[styles.existingCard, {
                backgroundColor: colors.bgCard,
                borderColor: colors.successColor,
              }]}>
                <View style={styles.existingCardHeader}>
                  <View style={[styles.existingIconBox, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.successColor} />
                  </View>
                  <View style={styles.existingInfo}>
                    <Text style={[styles.existingTitle, { color: colors.textBlack }]}>
                      Current Bank Account
                    </Text>
                    <Text style={[styles.existingSub, { color: colors.textSecColor }]}>
                      You can update your details below
                    </Text>
                  </View>
                </View>
                <View style={[styles.existingDivider, { backgroundColor: colors.dividerColor }]} />
                <Text style={[styles.existingName, { color: colors.textBlack }]}>
                  {existingBank.bank_acct_name}
                </Text>
                <Text style={[styles.existingNumber, { color: colors.primaryColor1 }]}>
                  {existingBank.bank_acct_number}
                </Text>
                <Text style={[styles.existingBank, { color: colors.textSecColor }]}>
                  {existingBank.bank_name}
                </Text>
              </View>
            )}

            {/* ── Form Card ────────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.formTitle, { color: colors.textBlack }]}>
                {existingBank ? 'Update Bank Details' : 'Add Bank Account'}
              </Text>
              <Text style={[styles.formDesc, { color: colors.textSecColor }]}>
                Enter your bank account information. Your account name will be verified automatically.
              </Text>

              {/* Bank Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Bank Name
                </Text>
                <TouchableOpacity
                  style={[styles.bankSelector, {
                    borderColor: bankName ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: bankName ? colors.primaryColor1 + '10' : colors.bgLight,
                  }]}
                  onPress={() => setShowBankModal(true)}
                  activeOpacity={0.8}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={bankName ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <Text style={[
                    styles.bankSelectorText,
                    { color: bankName ? colors.textBlack : colors.textSecColor2 },
                  ]}>
                    {bankName || 'Select your bank'}
                  </Text>
                  {isLoadingBanks ? (
                    <ActivityIndicator size={16} color={colors.primaryColor1} />
                  ) : (
                    <Ionicons name="chevron-down" size={18} color={colors.textSecColor} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Account Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Account Number
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: accountFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: accountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={accountFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
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
                      if (clean.length === 10 && bankCode) {
                        verifyAccount(clean, bankCode);
                      }
                    }}
                    onFocus={() => setAccountFocused(true)}
                    onBlur={() => setAccountFocused(false)}
                  />
                  {isVerifying && (
                    <ActivityIndicator size={16} color={colors.primaryColor1} />
                  )}
                  {accountNumber.length === 10 && !isVerifying && !accountName && bankCode && (
                    <TouchableOpacity onPress={() => verifyAccount(accountNumber, bankCode)}>
                      <Text style={[styles.verifyText, { color: colors.primaryColor1 }]}>
                        Verify
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Enter your 10-digit NUBAN account number
                </Text>
              </View>

              {/* Verified Account Name */}
              {accountName ? (
                <View style={[styles.verifiedCard, {
                  backgroundColor: '#D1FAE5',
                  borderColor: colors.successColor,
                }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.successColor} />
                  <View style={styles.verifiedInfo}>
                    <Text style={[styles.verifiedLabel, { color: colors.successColor }]}>
                      Account Verified
                    </Text>
                    <Text style={[styles.verifiedName, { color: '#065F46' }]}>
                      {accountName}
                    </Text>
                  </View>
                </View>
              ) : accountNumber.length === 10 && !isVerifying ? (
                <View style={[styles.unverifiedCard, {
                  backgroundColor: colors.warningLight,
                  borderColor: '#FDE68A',
                }]}>
                  <Ionicons name="alert-circle-outline" size={18} color={colors.warningColor} />
                  <Text style={[styles.unverifiedText, { color: colors.warningColor }]}>
                    {bankCode
                      ? 'Tap Verify to confirm your account name'
                      : 'Please select a bank first to verify your account'}
                  </Text>
                </View>
              ) : null}

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primaryColor1 },
                  (!bankName || !accountNumber || !accountName || isSaving) && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={!bankName || !accountNumber || !accountName || isSaving}
                activeOpacity={0.85}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>
                      {existingBank ? 'Update Bank Details' : 'Save Bank Details'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.notice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                Your bank details are encrypted and stored securely. We only use them to process your withdrawals.
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
          <LinearGradient
            colors={[colors.primaryColor1, colors.primaryColor1b]}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Bank</Text>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setShowBankModal(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Search */}
          <View style={[styles.bankSearchContainer, { backgroundColor: colors.bgColor }]}>
            <View style={[styles.bankSearchInput, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
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
                <TouchableOpacity onPress={() => {
                  setBankSearch('');
                  setFilteredBanks(banks);
                }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item, index) => item.code || index.toString()}
            renderItem={({ item }) => (
              <BankPickerItem
                bank={item}
                onSelect={handleSelectBank}
                colors={colors}
              />
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
  loadingCard: {
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
  loadingText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  existingCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    ...shadows.card,
  },
  existingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  existingIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  existingInfo: { flex: 1 },
  existingTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  existingSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
  existingDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  existingName: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 26,
  },
  existingNumber: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
    letterSpacing: 2,
    marginTop: 2,
  },
  existingBank: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
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
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputIcon: { marginRight: spacing.sm },
  bankSelectorText: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.base,
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
  inputField: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.lg,
    paddingVertical: 0,
  },
  inputHint: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  verifyText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  verifiedInfo: { flex: 1 },
  verifiedLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  verifiedName: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    lineHeight: 26,
    marginTop: 2,
  },
  unverifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  unverifiedText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  saveBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
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
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  modalTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankSearchContainer: {
    padding: spacing.md,
  },
  bankSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    gap: spacing.sm,
  },
  bankSearchField: {
    flex: 1,
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    paddingVertical: 0,
  },
  bankList: {
    maxHeight: 400,
  },
  bankPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  bankPickerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankPickerName: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
  emptyText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    padding: spacing.xl,
  },
});

export default BankDetailsScreen;