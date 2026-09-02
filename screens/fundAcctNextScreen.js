import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Platform, ToastAndroid, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Modal from 'react-native-modal';
import CountDownTimer from 'react-native-countdown-timer-hooks';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { NumberValueFormat } from '../components/formatValue';
import { applicationDetails } from '../components/controls';
import client from '../contextAPI/client';

// ── Bank Detail Row ───────────────────────────────
const BankDetailRow = ({ label, value, colors }) => (
  <View style={[styles.bankDetailRow, { borderBottomColor: colors.dividerColor }]}>
    <Text style={[styles.bankDetailLabel, { color: colors.textSecColor }]}>{label}</Text>
    <Text style={[styles.bankDetailValue, { color: colors.textBlack }]}>{value || '—'}</Text>
  </View>
);

// ── Bank Card ─────────────────────────────────────
const BankCard = ({ title, bank, onCopy, colors }) => (
  <View style={[styles.bankCard, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
    <View style={styles.bankCardHeader}>
      <Text style={[styles.bankCardTitle, { color: colors.textBlack }]}>{title}</Text>
      <TouchableOpacity
        style={[styles.copyBtn, { backgroundColor: colors.primaryColor1 }]}
        onPress={onCopy}
        activeOpacity={0.8}>
        <Ionicons name="copy-outline" size={14} color="#fff" />
        <Text style={styles.copyBtnText}>Copy</Text>
      </TouchableOpacity>
    </View>
    <BankDetailRow label="Account Name" value={bank.acctName} colors={colors} />
    <BankDetailRow label="Account Number" value={bank.acctNumber} colors={colors} />
    <BankDetailRow label="Bank Name" value={bank.bankName} colors={colors} />
  </View>
);

// ── Main Screen ───────────────────────────────────
const FundAccountNextScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const amtReceive = route.params?.payment;
  const payId = route.params?.track_id;

  const [companyBank, setCompanyBank] = useState({});
  const [appInfo, setAppInfo] = useState({});
  const [showBankModal, setShowBankModal] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [blink, setBlink] = useState(true);

  // ── Fetch Company Bank & App Info ─────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bankRes = await client.get('/api/fetchBankInfo');
        if (bankRes.data.msg === '200') setCompanyBank(bankRes.data.bankData);
      } catch (e) { console.log('Bank fetch error:', e.message); }
      applicationDetails().then((res) => {
        if (res?.infoData) setAppInfo(res.infoData);
      });
    };
    fetchData();
  }, []);

  // ── Blink effect for expired timer ───────────
  useEffect(() => {
    if (!timerExpired) return;
    const interval = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(interval);
  }, [timerExpired]);

  // ── Copy helpers ──────────────────────────────
  const copyBank = async (acctNumber, acctName, bankName) => {
    try {
      await Clipboard.setStringAsync(
        `${appInfo.app_name || 'OtaMobile'}\nAccount Name: ${acctName}\nAccount Number: ${acctNumber}\nBank Name: ${bankName}`
      );
      if (Platform.OS === 'android') {
        ToastAndroid.show('Bank details copied!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied!', 'Bank details copied to clipboard.');
      }
    } catch (e) { console.log('Copy error:', e.message); }
  };

  const bank1 = {
    acctName: companyBank.company_acct_name1,
    acctNumber: companyBank.company_acct_number1,
    bankName: companyBank.company_bank1,
  };
  const bank2 = {
    acctName: companyBank.company_acct_name2,
    acctNumber: companyBank.company_acct_number2,
    bankName: companyBank.company_bank2,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.replace('Home')}>
          <Ionicons name="close" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Funding Initiated
        </Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name="time-outline" size={28} color={colors.primaryColor1} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Payment Pending</Text>
            <Text style={styles.heroDesc}>
              Your funding request is awaiting payment. Complete your transfer within the time shown below.
            </Text>
          </View>
        </LinearGradient>

        {/* ── Amount Card ───────────────────────── */}
        <View style={[styles.amountCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.amountLabel, { color: colors.textSecColor }]}>
            Amount to Transfer
          </Text>
          <Text style={[styles.amountValue, { color: colors.primaryColor1 }]}>
            <NumberValueFormat value={amtReceive} />
          </Text>
          <View style={[styles.amountDivider, { backgroundColor: colors.dividerColor }]} />
          <Text style={[styles.amountNote, { color: colors.textSecColor }]}>
            Transfer exactly this amount in Naira to our official account below
          </Text>
        </View>

        {/* ── Countdown Timer ───────────────────── */}
        <View style={[styles.timerCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.timerTitle, { color: colors.textBlack }]}>
            Time Remaining
          </Text>
          <Text style={[styles.timerDesc, { color: colors.textSecColor }]}>
            Complete your transfer before the timer expires
          </Text>
          <View style={styles.timerBox}>
            {!timerExpired ? (
              <CountDownTimer
                timestamp={3540}
                timerCallback={() => setTimerExpired(true)}
                containerStyle={[styles.timerContainer, { backgroundColor: colors.primaryColor1 }]}
                textStyle={styles.timerText}
              />
            ) : (
              <View style={[styles.timerContainer, { backgroundColor: '#EF4444' }]}>
                {blink && (
                  <Text style={styles.timerText}>EXPIRED</Text>
                )}
              </View>
            )}
          </View>
          {timerExpired && (
            <View style={[styles.expiredNotice, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Ionicons name="warning-outline" size={18} color="#EF4444" />
              <Text style={[styles.expiredText, { color: '#EF4444' }]}>
                Timer expired. Your request is still valid for 24 hours. You can still make the transfer.
              </Text>
            </View>
          )}
        </View>

        {/* ── Instructions Card ─────────────────── */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.instructionsTitle, { color: colors.textBlack }]}>
            Payment Instructions
          </Text>
          {[
            'Transfer exactly the amount shown above in Nigerian Naira',
            `Use your email address or Transaction ID as payment description to fast-track processing`,
            'Make payment to our official bank account only',
            'After payment, click "I\'ve Made Payment" below to notify us',
          ].map((instruction, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={[styles.instructionNum, { backgroundColor: colors.primaryColor1 }]}>
                <Text style={styles.instructionNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.textSecColor }]}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>

        {/* ── View Account Details Button ───────── */}
        <TouchableOpacity
          style={[styles.viewBankBtn, {
            backgroundColor: colors.bgLight,
            borderColor: colors.primaryColor1,
          }]}
          onPress={() => setShowBankModal(true)}
          activeOpacity={0.85}>
          <Ionicons name="business-outline" size={20} color={colors.primaryColor1} />
          <Text style={[styles.viewBankBtnText, { color: colors.primaryColor1 }]}>
            View Bank Account Details
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primaryColor1} />
        </TouchableOpacity>

        {/* ── I've Made Payment Button ──────────── */}
        <TouchableOpacity
          style={[styles.paymentBtn, { backgroundColor: colors.primaryColor1 }]}
          onPress={() => navigation.navigate('UploadPaymentProof', { track_id: payId })}
          activeOpacity={0.85}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
          <Text style={styles.paymentBtnText}>I've Made Payment</Text>
        </TouchableOpacity>

        {/* ── Security Notice ───────────────────── */}
        <View style={[styles.securityNotice, {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
          <Text style={[styles.securityText, { color: colors.textSecColor }]}>
            Only transfer to our official bank accounts shown above. We will never ask you to transfer to a personal account.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── Bank Details Modal ─────────────────────── */}
      <Modal
        isVisible={showBankModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={300}
        backdropOpacity={0.6}
        onBackdropPress={() => setShowBankModal(false)}>
        <View style={[styles.modalCard, { backgroundColor: colors.bgCard }]}>
          <LinearGradient
            colors={[colors.primaryColor1, colors.primaryColor1b]}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Company Bank Accounts</Text>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => setShowBankModal(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalDesc, { color: colors.textSecColor }]}>
              Make your transfer to any of the accounts below. Include your email or transaction ID as payment description.
            </Text>

            <BankCard
              title="Account 1"
              bank={bank1}
              colors={colors}
              onCopy={() => copyBank(bank1.acctNumber, bank1.acctName, bank1.bankName)}
            />

            {bank2.acctNumber && (
              <BankCard
                title="Account 2"
                bank={bank2}
                colors={colors}
                onCopy={() => copyBank(bank2.acctNumber, bank2.acctName, bank2.bankName)}
              />
            )}

            <TouchableOpacity
              style={[styles.modalDoneBtn, { backgroundColor: colors.primaryColor1 }]}
              onPress={() => setShowBankModal(false)}
              activeOpacity={0.85}>
              <Text style={styles.modalDoneBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  closeBtn: {
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

  // Amount Card
  amountCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  amountLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    lineHeight: 48,
    marginBottom: spacing.md,
  },
  amountDivider: {
    width: '100%',
    height: 1,
    marginBottom: spacing.md,
  },
  amountNote: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Timer Card
  timerCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  timerTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 4,
  },
  timerDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timerBox: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerContainer: {
    height: 56,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
  },
  timerText: {
    fontSize: typography.xl,
    fontFamily: '_bold',
    color: '#fff',
    letterSpacing: 1,
  },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  expiredText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Instructions Card
  instructionsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  instructionsTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: spacing.lg,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  instructionNum: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  instructionNumText: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 16,
  },
  instructionText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // View Bank Button
  viewBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  viewBankBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Payment Button
  paymentBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  paymentBtnText: {
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

  // Modal
  modalCard: {
    borderRadius: radius.xl,
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
  modalBody: {
    padding: spacing.xl,
  },
  modalDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  // Bank Card
  bankCard: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bankCardTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  copyBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 20,
  },

  // Bank Detail Row
  bankDetailRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  bankDetailLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  bankDetailValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Modal Done Button
  modalDoneBtn: {
    height: 52,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  modalDoneBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
});

export default FundAccountNextScreen;