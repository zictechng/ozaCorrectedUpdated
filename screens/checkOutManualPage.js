import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Platform, ToastAndroid, Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import CountDownTimer from 'react-native-countdown-timer-hooks';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

import paypalImage from '../assets/images/paypal2.png';
import payoonerImage from '../assets/images/payooner3.png';
import bitcoinImage from '../assets/images/bitcoin1.png';

const ASSET_IMAGES = {
  paypal: paypalImage,
  payoneer: payoonerImage,
  bitcoin: bitcoinImage,
};

// ── Detail Row ────────────────────────────────────
const DetailRow = ({ label, value, copyable, onCopy, colors }) => (
  <View style={[styles.detailRow, { borderBottomColor: colors.dividerColor }]}>
    <View style={styles.detailLeft}>
      <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.textBlack }]} selectable>
        {value || '—'}
      </Text>
    </View>
    {copyable && (
      <TouchableOpacity
        style={[styles.copyBtn, { backgroundColor: colors.bgLight }]}
        onPress={onCopy}
        activeOpacity={0.8}>
        <Ionicons name="copy-outline" size={16} color={colors.primaryColor1} />
      </TouchableOpacity>
    )}
  </View>
);

// ── Main Checkout Manual Page ─────────────────────
const CheckOutManualPage = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const asset = route.params?.asset || 'paypal';
  const assetLabel = route.params?.assetLabel || 'PayPal';
  const amount = route.params?.amount || '0';
  const rate = route.params?.rate || '0';
  const ngnAmount = route.params?.ngnAmount || '0';
  const rateId = route.params?.rateId;
  const currency = route.params?.currency || 'USD';

  const [checkoutData, setCheckoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [blink, setBlink] = useState(true);

  // ── Blink on expiry ───────────────────────────
  useEffect(() => {
    if (!timerExpired) return;
    const interval = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(interval);
  }, [timerExpired]);

  // ── Init checkout ─────────────────────────────
  useEffect(() => {
    initCheckout();
  }, []);

  const initCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await client.post(
        '/api/initiate_selling',
        {
          asset,
          amount,
          rate,
          ngnAmount,
          rateId,
          userId: userInfo?.userData?._id,
          currency,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        setCheckoutData(res.data.checkoutData);
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Checkout Failed',
          textBody: res.data.message || 'Could not initiate checkout. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Network Error',
        textBody: 'Could not connect. Please check your internet connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // ── Copy helper ───────────────────────────────
  const copyText = async (text, label) => {
    try {
      await Clipboard.setStringAsync(text);
      if (Platform.OS === 'android') {
        ToastAndroid.show(`${label} copied!`, ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied!', `${label} copied to clipboard.`);
      }
    } catch (e) {
      console.log('Copy error:', e.message);
    }
  };

  // ── Confirm payment sent ──────────────────────
  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await client.post(
        '/api/confirm_selling',
        {
          checkoutId: checkoutData?._id,
          userId: userInfo?.userData?._id,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Confirmed!',
          textBody: 'Your payment has been confirmed. We will process your order and credit your wallet shortly.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.replace('Home'),
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: res.data.message || 'Could not confirm payment. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Something went wrong. Please try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.bgColor}
        />
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.primaryColor1} />
          <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
            Preparing your checkout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Complete Payment
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <Image
            source={ASSET_IMAGES[asset] || paypalImage}
            style={styles.heroAssetImage}
            resizeMode="contain"
          />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Send {assetLabel}</Text>
            <Text style={styles.heroDesc}>
              Send exactly the amount shown below to our official wallet to complete your sale
            </Text>
          </View>
        </LinearGradient>

        {/* ── Amount Summary Card ───────────────── */}
        <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecColor }]}>
                You Send
              </Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                ${amount} {currency}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.dividerColor }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecColor }]}>
                You Receive
              </Text>
              <Text style={[styles.summaryValue, { color: colors.successColor }]}>
                ₦{Number(ngnAmount).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={[styles.rateRow, { backgroundColor: colors.bgLight }]}>
            <Text style={[styles.rateText, { color: colors.textSecColor }]}>
              Rate: ₦{Number(rate).toLocaleString()} per $1
            </Text>
          </View>
        </View>

        {/* ── Timer Card ────────────────────────── */}
        <View style={[styles.timerCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.timerTitle, { color: colors.textBlack }]}>
            Time Remaining
          </Text>
          <Text style={[styles.timerDesc, { color: colors.textSecColor }]}>
            Complete your payment before the timer expires
          </Text>
          <View style={styles.timerBox}>
            {!timerExpired ? (
              <CountDownTimer
                timestamp={1800}
                timerCallback={() => setTimerExpired(true)}
                containerStyle={[styles.timerContainer, {
                  backgroundColor: colors.primaryColor1,
                }]}
                textStyle={styles.timerText}
              />
            ) : (
              <View style={[styles.timerContainer, { backgroundColor: '#EF4444' }]}>
                {blink && <Text style={styles.timerText}>EXPIRED</Text>}
              </View>
            )}
          </View>
        </View>

        {/* ── Wallet Details Card ───────────────── */}
        {checkoutData && (
          <View style={[styles.walletCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.walletCardHeader}>
              <View style={[styles.walletIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="send-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.walletCardInfo}>
                <Text style={[styles.walletCardTitle, { color: colors.textBlack }]}>
                  Send to Our {assetLabel} Account
                </Text>
                <Text style={[styles.walletCardSub, { color: colors.textSecColor }]}>
                  Copy the details below and send exactly ${amount} {currency}
                </Text>
              </View>
            </View>

            <View style={[styles.walletDivider, { backgroundColor: colors.dividerColor }]} />

            {checkoutData.wallet_address && (
              <DetailRow
                label="Wallet Address / Email"
                value={checkoutData.wallet_address}
                copyable
                onCopy={() => copyText(checkoutData.wallet_address, 'Wallet address')}
                colors={colors}
              />
            )}
            {checkoutData.account_name && (
              <DetailRow
                label="Account Name"
                value={checkoutData.account_name}
                copyable
                onCopy={() => copyText(checkoutData.account_name, 'Account name')}
                colors={colors}
              />
            )}
            <DetailRow
              label="Amount to Send"
              value={`$${amount} ${currency}`}
              copyable
              onCopy={() => copyText(`${amount}`, 'Amount')}
              colors={colors}
            />
            {checkoutData.reference && (
              <DetailRow
                label="Reference / Note"
                value={checkoutData.reference}
                copyable
                onCopy={() => copyText(checkoutData.reference, 'Reference')}
                colors={colors}
              />
            )}
          </View>
        )}

        {/* ── Instructions Card ─────────────────── */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.instructionsTitle, { color: colors.textBlack }]}>
            Payment Instructions
          </Text>
          {[
            `Log in to your ${assetLabel} account`,
            `Send exactly $${amount} ${currency} to the wallet address above`,
            'Include the reference number in your payment note',
            'Click "I\'ve Sent Payment" below after sending',
            'We will verify and credit your wallet within minutes',
          ].map((step, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={[styles.instructionNum, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.instructionNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, { color: colors.textSecColor }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Confirm Button ────────────────────── */}
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: colors.successColor },
            isConfirming && { opacity: 0.7 },
          ]}
          onPress={handleConfirm}
          disabled={isConfirming}
          activeOpacity={0.85}>
          {isConfirming ? (
            <ActivityIndicator color="#fff" size={22} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.confirmBtnText}>I've Sent Payment</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Cancel Button ─────────────────────── */}
        <TouchableOpacity
          style={[styles.cancelBtn, {
            borderColor: colors.dangerColor,
            backgroundColor: colors.lightRed,
          }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}>
          <Ionicons name="close-circle-outline" size={20} color={colors.dangerColor} />
          <Text style={[styles.cancelBtnText, { color: colors.dangerColor }]}>
            Cancel Transaction
          </Text>
        </TouchableOpacity>

        {/* ── Security Notice ───────────────────── */}
        <View style={[styles.notice, {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
          <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
            Only send to the official wallet address provided above. We will never ask you to send to a personal account. Do not send a different amount.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

  // Loading
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

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
  heroAssetImage: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
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

  // Summary Card
  summaryCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    lineHeight: 28,
  },
  summaryDivider: {
    width: 1,
    height: 48,
    marginHorizontal: spacing.md,
  },
  rateRow: {
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
  },
  rateText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
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
  timerBox: { alignItems: 'center' },
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

  // Wallet Card
  walletCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  walletIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletCardInfo: { flex: 1 },
  walletCardTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  walletCardSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: 2,
  },
  walletDivider: {
    height: 1,
    marginBottom: spacing.md,
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  detailLeft: { flex: 1 },
  detailLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  instructionText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },

  // Buttons
  confirmBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.md,
  },
  confirmBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  cancelBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Notice
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
});

export default CheckOutManualPage;