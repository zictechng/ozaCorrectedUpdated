import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

const SendFundScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [tagId, setTagId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipientData, setRecipientData] = useState(null);
  const [tagFocused, setTagFocused] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  const walletBalance = Number(userInfo?.userData?.tran_account || 0);

  // ── Search Recipient ──────────────────────────
  const searchRecipient = async () => {
    if (!tagId.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Tag ID Required', textBody: 'Please enter the recipient\'s Tag ID to search.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    Keyboard.dismiss();
    setIsSearching(true);
    setRecipientData(null);
    try {
      const res = await client.post(
        '/api/searchUser_tagId',
        { tag_id: tagId.trim() },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setRecipientData(res.data.userData);
      } else if (res.data.status === '404') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'User Not Found', textBody: 'No user found with that Tag ID. Please check and try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Search Failed', textBody: 'Could not find user. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSearching(false);
    }
  };

  // ── Validate ──────────────────────────────────
  const validate = () => {
    if (!recipientData) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Recipient', textBody: 'Please search and select a recipient first.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Amount', textBody: 'Please enter a valid amount to send.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (Number(amount) > walletBalance) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: `Your wallet balance is ₦${walletBalance.toLocaleString()}. You cannot send more than your balance.`, titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Send Funds ────────────────────────────────
  const handleSend = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setIsSending(true);
    try {
      const res = await client.post(
        '/api/sendFund_userMobile',
        {
          sender_id: userInfo?.userData?._id,
          receiver_tag: tagId.trim(),
          amount,
          note,
          userId: userInfo?.userData?._id,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Transfer Successful!',
          textBody: `₦${Number(amount).toLocaleString()} has been sent to ${recipientData?.display_name} successfully.`,
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => {
            setTagId('');
            setAmount('');
            setNote('');
            setRecipientData(null);
            navigation.goBack();
          },
        });
      } else if (res.data.status === '403') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Insufficient Balance', textBody: 'Your wallet balance is not enough to complete this transfer.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Transfer Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsSending(false);
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
                Send Funds
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
                <Ionicons name="send-outline" size={26} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Transfer Funds</Text>
                <Text style={styles.heroDesc}>
                  Send funds instantly to any user on the platform using their Tag ID
                </Text>
              </View>
            </LinearGradient>

            {/* ── Balance Card ──────────────────── */}
            <View style={[styles.balanceCard, {
              backgroundColor: colors.bgCard,
              borderColor: colors.dividerColor,
            }]}>
              <View style={[styles.balanceIconBox, { backgroundColor: colors.bgLight }]}>
                <Ionicons name="wallet-outline" size={20} color={colors.primaryColor1} />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.textSecColor }]}>
                  Available Balance
                </Text>
                <Text style={[styles.balanceValue, { color: colors.textBlack }]}>
                  ₦{walletBalance.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* ── Form Card ────────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>

              {/* Tag ID Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Recipient Tag ID
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: tagFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: tagFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="pricetag-outline"
                    size={20}
                    color={tagFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter recipient's Tag ID"
                    placeholderTextColor={colors.textSecColor2}
                    value={tagId}
                    onChangeText={(t) => {
                      setTagId(t.toUpperCase());
                      setRecipientData(null);
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onFocus={() => setTagFocused(true)}
                    onBlur={() => setTagFocused(false)}
                    returnKeyType="search"
                    onSubmitEditing={searchRecipient}
                  />
                  <TouchableOpacity
                    style={[styles.searchBtn, { backgroundColor: colors.primaryColor1 }]}
                    onPress={searchRecipient}
                    disabled={isSearching}>
                    {isSearching ? (
                      <ActivityIndicator size={16} color="#fff" />
                    ) : (
                      <Ionicons name="search" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Ask the recipient for their Tag ID found on their profile page
                </Text>
              </View>

              {/* Recipient Card */}
              {recipientData && (
                <View style={[styles.recipientCard, {
                  backgroundColor: colors.bgLight,
                  borderColor: colors.successColor,
                }]}>
                  <View style={[styles.recipientAvatar, { backgroundColor: colors.primaryColor1 }]}>
                    <Text style={styles.recipientInitial}>
                      {recipientData.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={[styles.recipientName, { color: colors.textBlack }]}>
                      {recipientData.display_name}
                    </Text>
                    <Text style={[styles.recipientTag, { color: colors.textSecColor }]}>
                      Tag: {recipientData.tag_id}
                    </Text>
                  </View>
                  <View style={[styles.verifiedBadge, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
                    <Text style={[styles.verifiedText, { color: colors.successColor }]}>Found</Text>
                  </View>
                </View>
              )}

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Amount (₦)
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: amountFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: amountFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={amountFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter amount to send"
                    placeholderTextColor={colors.textSecColor2}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                  />
                </View>
                {amount.length > 0 && (
                  <Text style={[styles.inputHint, {
                    color: Number(amount) > walletBalance
                      ? colors.dangerColor
                      : colors.successColor,
                  }]}>
                    {Number(amount) > walletBalance
                      ? `Insufficient balance — you only have ₦${walletBalance.toLocaleString()}`
                      : `Remaining balance: ₦${(walletBalance - Number(amount)).toLocaleString()}`}
                  </Text>
                )}
              </View>

              {/* Note Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                </Text>
                <View style={[
                  styles.noteContainer,
                  {
                    borderColor: noteFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: noteFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <TextInput
                    style={[styles.noteField, { color: colors.textBlack }]}
                    placeholder="e.g. Payment for goods, Loan repayment..."
                    placeholderTextColor={colors.textSecColor2}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={200}
                    onFocus={() => setNoteFocused(true)}
                    onBlur={() => setNoteFocused(false)}
                  />
                </View>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  { backgroundColor: colors.primaryColor1 },
                  (!recipientData || !amount || isSending) && { opacity: 0.6 },
                ]}
                onPress={handleSend}
                disabled={!recipientData || !amount || isSending}
                activeOpacity={0.85}>
                {isSending ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.sendBtnText}>
                      Send ₦{amount ? Number(amount).toLocaleString() : '0'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Security Notice ───────────────── */}
            <View style={[styles.securityNotice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                Always verify the recipient's name after searching before sending. Transfers are instant and cannot be reversed.
              </Text>
            </View>

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

  // Header
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

  // Hero Banner
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

  // Balance Card
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.card,
  },
  balanceIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  balanceValue: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
  },

  // Form Card
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  // Input
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
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
  inputIcon: { marginRight: spacing.sm },
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
  searchBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Recipient Card
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  recipientAvatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientInitial: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
  },
  recipientInfo: { flex: 1 },
  recipientName: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  recipientTag: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 3,
  },
  verifiedText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Note Input
  noteContainer: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 90,
  },
  noteField: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlignVertical: 'top',
  },

  // Send Button
  sendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  sendBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
});

export default SendFundScreen;