import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

// ── Source Account Selector ───────────────────────
const SOURCE_OPTIONS = [
  { value: '1', label: 'Main Wallet', currency: '₦', icon: 'wallet-outline',    color: '#4C5FD5' },
  { value: '2', label: 'USD Wallet',  currency: '$', icon: 'globe-outline',      color: '#10B981' },
];

const SendFundScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const myTagId      = userInfo?.userData?.tag_id;
  const ngnBalance   = Number(userInfo?.userData?.amount        || 0);
  const usdBalance   = Number(userInfo?.userData?.usd_balance   || 0);
  const bonusBalance = Number(userInfo?.userData?.all_bonus_acct || 0);

  const [tagId, setTagId]             = useState('');
  const [amount, setAmount]           = useState('');
  const [note, setNote]               = useState('');
  const [accountSource, setAccountSource] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [recipientData, setRecipientData] = useState(null);
  const [isSelfTransfer, setIsSelfTransfer] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin]                 = useState('');
  const [pinSecure, setPinSecure]     = useState(true);
  const [tagFocused, setTagFocused]   = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Current balance based on source
  const currentBalance = accountSource === '2' ? usdBalance : ngnBalance;
  const currencySymbol = accountSource === '2' ? '$' : '₦';
  const selectedSource = SOURCE_OPTIONS.find(s => s.value === accountSource);

  // ── Auto-search on 7-char tag_id ─────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setRecipientData(null);
    setIsSelfTransfer(false);

    if (tagId.length === 7) {
      if (tagId.toUpperCase() === myTagId?.toUpperCase()) {
        // Self transfer — move bonus to main
        setIsSelfTransfer(true);
        setAccountSource('1');
        setRecipientData(userInfo?.userData);
      } else {
        searchTimeoutRef.current = setTimeout(() => {
          searchRecipient(tagId);
        }, 500);
      }
    }
    return () => clearTimeout(searchTimeoutRef.current);
  }, [tagId]);

  // ── Search Recipient ──────────────────────────
  const searchRecipient = async (id) => {
    setIsSearching(true);
    try {
      const res = await client.post(
        '/api/fetch_AccountDetailsMobile',
        { data: id.trim() },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setRecipientData(res.data.userData);
      } else {
        setRecipientData(null);
        Toast.show({ type: ALERT_TYPE.WARNING, title: 'User Not Found', textBody: 'No user found with that Tag ID. Please check and try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSearching(false);
    }
  };

  // ── Handle Move to Main (self-transfer shortcut) ──
  const handleMoveToMain = () => {
    setTagId(myTagId || '');
    setAccountSource('1');
    setIsSelfTransfer(true);
    setRecipientData(userInfo?.userData);
  };

  const handleCancelSelf = () => {
    setTagId('');
    setAccountSource('1');
    setIsSelfTransfer(false);
    setRecipientData(null);
    setAmount('');
  };

  // ── Validate before opening PIN modal ─────────
  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!recipientData) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Recipient', textBody: 'Please enter a valid recipient Tag ID.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!accountSource) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Source', textBody: 'Please select the account to send from.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Amount', textBody: 'Please enter a valid amount to send.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (Number(amount) > currentBalance) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: `Your ${selectedSource?.label} balance is ${currencySymbol}${currentBalance.toLocaleString()}.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    // Block main → main self-transfer
    if (isSelfTransfer && accountSource === '2') {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Not Allowed', textBody: 'You cannot send from your USD wallet to yourself. Use Main Wallet for bonus transfer.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setPin('');
    setShowPinModal(true);
  };

  // ── Confirm Send ──────────────────────────────
  const handleConfirmSend = async () => {
    if (!pin || pin.length < 4) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'PIN Required', textBody: 'Please enter your 4-digit transaction PIN.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setShowPinModal(false);
    setIsSending(true);
    try {
      const res = await client.post(
        '/api/userSending_funding',
        {
          tagId:          tagId.trim(),
          amt:            amount,
          note,
          userId:         userInfo?.userData?._id,
          account_source: accountSource,
          acctPin:        pin,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: isSelfTransfer ? 'Bonus Moved!' : 'Transfer Successful!',
          textBody: isSelfTransfer
            ? `${currencySymbol}${Number(amount).toLocaleString()} has been moved from your bonus to your main wallet.`
            : `${currencySymbol}${Number(amount).toLocaleString()} sent to ${recipientData?.display_name} successfully.`,
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => {
            setTagId(''); setAmount(''); setNote('');
            setRecipientData(null); setIsSelfTransfer(false);
            setAccountSource('1'); setPin('');
            navigation.goBack();
          },
        });
      } else if (res.data.status === '403') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: 'Your wallet balance is not enough.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Transfer Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSending(false);
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
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Send Funds</Text>
              <View style={styles.backBtn} />
            </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons name="send-outline" size={26} color="#8B5CF6" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Transfer Funds</Text>
                <Text style={styles.heroDesc}>Send to any user instantly using their Tag ID</Text>
              </View>
            </LinearGradient>

            {/* ── Balance Cards ─────────────────── */}
            <View style={styles.balanceRow}>
              <View style={[styles.balanceCard, { backgroundColor: colors.bgCard, borderColor: '#4C5FD5' }]}>
                <Text style={[styles.balanceCurrency, { color: '#4C5FD5' }]}>NGN</Text>
                <Text style={[styles.balanceAmount, { color: colors.textBlack }]}>
                  ₦{ngnBalance.toLocaleString()}
                </Text>
                <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>Main Wallet</Text>
              </View>
              <View style={[styles.balanceCard, { backgroundColor: colors.bgCard, borderColor: '#10B981' }]}>
                <Text style={[styles.balanceCurrency, { color: '#10B981' }]}>USD</Text>
                <Text style={[styles.balanceAmount, { color: colors.textBlack }]}>
                  ${usdBalance.toLocaleString()}
                </Text>
                <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>USD Wallet</Text>
              </View>
            </View>

            {/* ── Bonus Move to Main Card ─────────── */}
            <View style={[styles.bonusCard, {
              backgroundColor: isSelfTransfer ? '#EDE9FE' : colors.bgCard,
              borderColor: isSelfTransfer ? '#8B5CF6' : colors.dividerColor,
            }]}>
              <View style={styles.bonusCardLeft}>
                <Text style={[styles.bonusTitle, { color: '#8B5CF6' }]}>
                  💰 Bonus Balance: ₦{bonusBalance.toLocaleString()}
                </Text>
                <Text style={[styles.bonusDesc, { color: colors.textSecColor }]}>
                  {isSelfTransfer
                    ? 'Moving bonus funds to your main wallet'
                    : 'Move bonus funds into your main wallet'}
                </Text>
              </View>
              {isSelfTransfer ? (
                <TouchableOpacity
                  style={[styles.bonusActionBtn, { borderColor: '#EF4444', backgroundColor: '#FEE2E2' }]}
                  onPress={handleCancelSelf}>
                  <Text style={[styles.bonusActionText, { color: '#EF4444' }]}>Cancel</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.bonusActionBtn, { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' }]}
                  onPress={handleMoveToMain}>
                  <Text style={[styles.bonusActionText, { color: '#8B5CF6' }]}>Move to Main</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Form Card ────────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

              {/* Tag ID Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Recipient Tag ID</Text>
                <View style={[styles.inputContainer, {
                  borderColor: tagFocused ? '#8B5CF6' : colors.dividerColor,
                  backgroundColor: tagFocused ? '#8B5CF610' : colors.bgLight,
                }]}>
                  <Ionicons name="pricetag-outline" size={20}
                    color={tagFocused ? '#8B5CF6' : colors.textSecColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter 7-digit Tag ID"
                    placeholderTextColor={colors.textSecColor2}
                    value={tagId}
                    onChangeText={(t) => setTagId(t.toUpperCase())}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={7}
                    onFocus={() => setTagFocused(true)}
                    onBlur={() => setTagFocused(false)}
                  />
                  {isSearching && <ActivityIndicator size={18} color="#8B5CF6" />}
                  {!isSearching && tagId.length > 0 && (
                    <TouchableOpacity onPress={() => { setTagId(''); setRecipientData(null); setIsSelfTransfer(false); }}>
                      <Ionicons name="close-circle" size={20} color={colors.textSecColor} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Auto-searches when 7 digits are entered
                </Text>
              </View>

              {/* Self Transfer Notice */}
              {isSelfTransfer && (
                <View style={[styles.selfTransferNotice, { backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' }]}>
                  <Text style={styles.selfTransferIcon}>🔄</Text>
                  <View style={styles.selfTransferText}>
                    <Text style={[styles.selfTransferTitle, { color: '#8B5CF6' }]}>Bonus → Main Transfer</Text>
                    <Text style={[styles.selfTransferDesc, { color: '#6D28D9' }]}>
                      Funds will move from your bonus account to your main wallet
                    </Text>
                  </View>
                </View>
              )}

              {/* Recipient Card */}
              {recipientData && !isSelfTransfer && (
                <View style={[styles.recipientCard, { backgroundColor: colors.bgCard, borderColor: colors.successColor }]}>
                  <View style={[styles.recipientAvatar, { backgroundColor: '#8B5CF6' }]}>
                    <Text style={styles.recipientInitial}>
                      {recipientData.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={[styles.recipientName, { color: colors.textBlack }]}>{recipientData.display_name}</Text>
                    <Text style={[styles.recipientTag, { color: colors.textSecColor }]}>Tag: {recipientData.tag_id}</Text>
                  </View>
                  <View style={[styles.verifiedBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
                    <Text style={[styles.verifiedText, { color: colors.successColor }]}>Verified</Text>
                  </View>
                </View>
              )}

              {/* Source Account Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Source Account</Text>
                <View style={styles.sourceRow}>
                  {SOURCE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.sourceBtn,
                        { borderColor: colors.dividerColor, backgroundColor: colors.bgLight },
                        accountSource === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '15' },
                        isSelfTransfer && opt.value === '2' && { opacity: 0.4 },
                      ]}
                      onPress={() => {
                        if (isSelfTransfer) return;
                        setAccountSource(opt.value);
                        setAmount('');
                      }}
                      disabled={isSelfTransfer}
                      activeOpacity={0.85}>
                      <Ionicons name={opt.icon} size={18} color={accountSource === opt.value ? opt.color : colors.textSecColor} />
                      <Text style={[styles.sourceBtnText, { color: accountSource === opt.value ? opt.color : colors.textSecColor },
                        accountSource === opt.value && { fontFamily: '_bold' }]}>
                        {opt.label}
                      </Text>
                      {accountSource === opt.value && (
                        <View style={[styles.sourceCheck, { backgroundColor: opt.color }]}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Amount ({currencySymbol})
                </Text>
                <View style={[styles.inputContainer, {
                  borderColor: amountFocused ? '#8B5CF6' : colors.dividerColor,
                  backgroundColor: amountFocused ? '#8B5CF610' : colors.bgLight,
                }]}>
                  <Text style={[styles.currencyLabel, { color: amountFocused ? '#8B5CF6' : colors.textSecColor }]}>
                    {currencySymbol}
                  </Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter amount to send"
                    placeholderTextColor={colors.textSecColor2}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                  />
                  {amount.length > 0 && (
                    <TouchableOpacity onPress={() => setAmount('')}>
                      <Ionicons name="close-circle" size={20} color={colors.textSecColor} />
                    </TouchableOpacity>
                  )}
                </View>
                {amount.length > 0 && (
                  <Text style={[styles.inputHint, {
                    color: Number(amount) > currentBalance ? colors.dangerColor : colors.successColor,
                  }]}>
                    {Number(amount) > currentBalance
                      ? `Insufficient — balance is ${currencySymbol}${currentBalance.toLocaleString()}`
                      : `Remaining: ${currencySymbol}${(currentBalance - Number(amount)).toLocaleString()}`}
                  </Text>
                )}
              </View>

              {/* Note Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                </Text>
                <View style={[styles.noteContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight }]}>
                  <TextInput
                    style={[styles.noteField, { color: colors.textBlack }]}
                    placeholder="e.g. Payment for goods, Loan repayment..."
                    placeholderTextColor={colors.textSecColor2}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendBtn,
                  { backgroundColor: '#8B5CF6' },
                  (!recipientData || !amount || isSending) && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={!recipientData || !amount || isSending}
                activeOpacity={0.85}>
                {isSending ? <ActivityIndicator color="#fff" size={22} /> : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.sendBtnText}>
                      {isSelfTransfer ? 'Move to Main Wallet' : `Send ${currencySymbol}${amount ? Number(amount).toLocaleString() : '0'}`}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── How it Works ─────────────────── */}
            <View style={[styles.howCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.howTitle, { color: colors.textBlack }]}>How to Send Funds</Text>
              {[
                "Enter the recipient's 7-digit Tag ID",
                'Account auto-verifies when found',
                'Select wallet to send from (NGN or USD)',
                'Enter amount and optional note',
                'Tap Send — enter PIN to confirm',
                'Funds are transferred instantly',
              ].map((step, i) => (
                <View key={i} style={styles.howRow}>
                  <View style={[styles.howNum, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={[styles.howNumText, { color: '#8B5CF6' }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.howText, { color: colors.textSecColor }]}>{step}</Text>
                </View>
              ))}
            </View>

            {/* ── Warning Card ──────────────────── */}
            <View style={[styles.warningCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
              <Text style={[styles.warningText, { color: '#92400E' }]}>
                Transfers are instant and cannot be reversed. Always verify the recipient's name before confirming.
              </Text>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── PIN Authorization Modal ───────────────── */}
            <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={[styles.modalCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.modalTitle, { color: colors.textBlack }]}>Authorization Required</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecColor }]}>
              Enter your account PIN to authorize this transaction
            </Text>

            {/* Transfer Summary */}
            <View style={[styles.modalSummary, { backgroundColor: colors.bgLight }]}>
              <Text style={[styles.modalSummaryLabel, { color: colors.textSecColor }]}>Sending</Text>
              <Text style={[styles.modalSummaryAmount, { color: '#8B5CF6' }]}>
                {currencySymbol}{Number(amount).toLocaleString()}
              </Text>
              <Text style={[styles.modalSummaryTo, { color: colors.textSecColor }]}>
                to {isSelfTransfer ? 'Your Main Wallet' : recipientData?.display_name}
              </Text>
            </View>

            {/* PIN Input */}
            <View style={[styles.inputContainer, { borderColor: colors.dividerColor, backgroundColor: colors.bgLight, marginBottom: spacing.lg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputField, { color: colors.textBlack }]}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor={colors.textSecColor2}
                keyboardType="numeric"
                secureTextEntry={pinSecure}
                maxLength={4}
                value={pin}
                onChangeText={setPin}
                
              />
              <TouchableOpacity onPress={() => setPinSecure(!pinSecure)}>
                <Ionicons name={pinSecure ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#8B5CF6' }, (!pin || pin.length < 4) && { opacity: 0.5 }]}
                onPress={handleConfirmSend}
                disabled={!pin || pin.length < 4}>
                <Text style={styles.modalConfirmText}>Confirm Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPinModal(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSecColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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

  // Balance Cards
  balanceRow: { flexDirection: 'row', marginHorizontal: spacing.xl, gap: spacing.md, marginBottom: spacing.lg },
  balanceCard: { flex: 1, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1.5, alignItems: 'center', ...shadows.sm },
  balanceCurrency: { fontFamily: '_bold', fontSize: typography.sm, marginBottom: 2 },
  balanceAmount: { fontFamily: '_bold', fontSize: typography.lg, lineHeight: 24 },
  balanceLabel: { fontFamily: '_regular', fontSize: typography.xs, marginTop: 2 },

  // Bonus Card
  bonusCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.md, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  bonusCardLeft: { flex: 1 },
  bonusTitle: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },
  bonusDesc: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20, marginTop: 2 },
  bonusActionBtn: { borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bonusActionText: { fontFamily: '_bold', fontSize: typography.sm },

  // Form
  formCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { fontFamily: '_semiBold', fontSize: typography.base, marginBottom: spacing.sm, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 56 },
  inputIcon: { marginRight: spacing.sm },
  currencyLabel: { fontFamily: '_bold', fontSize: typography.xl, marginRight: spacing.sm },
  inputField: { flex: 1, fontFamily: '_semiBold', fontSize: typography.lg, paddingVertical: 0 },
  inputHint: { fontFamily: '_regular', fontSize: typography.base, marginTop: spacing.xs, lineHeight: 22 },

  // Self Transfer
  selfTransferNotice: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5, gap: spacing.sm },
  selfTransferIcon: { fontSize: 20 },
  selfTransferText: { flex: 1 },
  selfTransferTitle: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },
  selfTransferDesc: { fontFamily: '_regular', fontSize: typography.sm, lineHeight: 20, marginTop: 2 },

  // Recipient
  recipientCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5, gap: spacing.md },
  recipientAvatar: { width: 46, height: 46, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },
  recipientInitial: { fontFamily: '_bold', fontSize: typography.xl, color: '#fff' },
  recipientInfo: { flex: 1 },
  recipientName: { fontFamily: '_bold', fontSize: typography.base, lineHeight: 22 },
  recipientTag: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginTop: 2 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, gap: 3 },
  verifiedText: { fontFamily: '_semiBold', fontSize: typography.sm, lineHeight: 20 },

  // Source
  sourceRow: { flexDirection: 'row', gap: spacing.md },
  sourceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: spacing.md, gap: spacing.xs, position: 'relative' },
  sourceBtnText: { fontFamily: '_semiBold', fontSize: typography.base },
  sourceCheck: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  // Note
  noteContainer: { borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  noteField: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, textAlignVertical: 'top', maxHeight: 72 },

  // Send Button
  sendBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: radius.lg, gap: spacing.sm, marginTop: spacing.sm, ...shadows.md },
  sendBtnText: { fontFamily: '_bold', fontSize: typography.lg, color: '#fff' },

  // How Card
  howCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  howTitle: { fontFamily: '_bold', fontSize: typography.lg, marginBottom: spacing.lg },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.md },
  howNum: { width: 28, height: 28, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  howNumText: { fontFamily: '_bold', fontSize: typography.sm },
  howText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1, paddingTop: 4 },

  // Warning
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: spacing.xl, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, gap: spacing.sm, marginBottom: spacing.lg },
  warningText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // PIN Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  modalTitle: { fontFamily: '_bold', fontSize: typography.xxl, marginBottom: spacing.sm },
  modalDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.lg },
  modalSummary: { borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginBottom: spacing.lg, gap: 4 },
  modalSummaryLabel: { fontFamily: '_regular', fontSize: typography.sm },
  modalSummaryAmount: { fontFamily: '_bold', fontSize: 32, lineHeight: 40 },
  modalSummaryTo: { fontFamily: '_regular', fontSize: typography.base },
  modalBtns: { gap: spacing.md },
  modalConfirmBtn: { height: 52, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  modalConfirmText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
  modalCancelBtn: { alignItems: 'center', padding: spacing.md },
  modalCancelText: { fontFamily: '_semiBold', fontSize: typography.base },
});

export default SendFundScreen;

