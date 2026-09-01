
import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { sheetHeight, isSmallPhone } from '../utils/responsive';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import useBillService from '../hooks/useBillService';
import client from '../contextAPI/client';

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
    ]}
      numberOfLines={2}>
      {value}
    </Text>
  </View>
);

// ── PIN Confirm Modal ─────────────────────────────
const PinConfirmModal = ({ visible, onClose, onConfirm, isProcessing, totalAmount, serviceTitle }) => {
  const { colors } = useThemeStyles();
  const [pin, setPin] = useState('');

  const handleKeyPress = (key) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          onConfirm(newPin);
          setPin('');
        }, 300);
      }
    }
  };

  const KEYPAD = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pinModalOverlay}>
        <View style={styles.pinModalCard}>

          {/* Header */}
          <View style={styles.pinModalHeader}>
            <Text style={styles.pinModalTitle}>Confirm Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.pinModalClose}>
              <Ionicons name="close" size={22} color={colors.textSecColor} />
            </TouchableOpacity>
          </View>

          <Text style={styles.pinModalAmount}>
            ₦{Number(totalAmount).toLocaleString()}
          </Text>
          <Text style={styles.pinModalService}>{serviceTitle}</Text>

          {/* PIN Dots */}
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  i < pin.length && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.pinHint}>Enter your 4-digit transaction PIN</Text>

          {/* Keypad */}
          {isProcessing ? (
            <ActivityIndicator
              size="large"
              color={colors.primaryColor1}
              style={{ marginVertical: spacing.xl }}
            />
          ) : (
            <View style={styles.keypad}>
              {KEYPAD.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keypadRow}>
                  {row.map((key, keyIndex) => (
                    <TouchableOpacity
                      key={keyIndex}
                      style={[
                        styles.keypadBtn,
                        key === '' && { opacity: 0 },
                      ]}
                      onPress={() => key !== '' && handleKeyPress(key)}
                      disabled={key === ''}
                      activeOpacity={0.7}>
                      {key === 'del' ? (
                        <Ionicons
                          name="backspace-outline"
                          size={22}
                          color={colors.textBlack}
                        />
                      ) : (
                        <Text style={styles.keypadBtnText}>{key}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ── Main Bills Confirm Screen ─────────────────────
const BillsConfirmScreen = ({ navigation, route }) => {
  const { userToken, userInfo } = useContext(AuthContext);
  const { S, colors, isDark } = useThemeStyles();
  const params = route?.params || {};

  const {
    serviceType,
    serviceTitle,
    summaryItems = [],
    amount,
    totalAmount,
    fee,
    gradientColors = [colors.primaryColor1, colors.primaryColor1b],
    icon = 'receipt-outline',
  } = params;

  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { preFlightCheck } = useBillService(serviceType);

  // ── Handle Pay Button ─────────────────────────
  const handlePay = async () => {
    const isActive = await preFlightCheck();
    if (!isActive) return;
    setShowPinModal(true);
  };

  // ── Handle PIN Confirm ────────────────────────
  const handlePinConfirm = async (pin) => {
    setIsProcessing(true);
    try {
      // Validate PIN with backend
      const pinRes = await client.post(
        '/api/validate_transaction_pin',
        { pin, user_id: userInfo?.userData?._id },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );

      if (pinRes.data.msg !== '200') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Invalid PIN',
          textBody: 'The PIN you entered is incorrect. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        setShowPinModal(false);
        setIsProcessing(false);
        return;
      }

      // Final pre-flight check before processing
      const isActive = await preFlightCheck();
      if (!isActive) {
        setShowPinModal(false);
        setIsProcessing(false);
        return;
      }

      // Process the bill payment
      const res = await client.post(
        `/api/bills/${serviceType}`,
        {
          ...params,
          user_id: userInfo?.userData?._id,
          wallet_balance: userInfo?.userData?.tran_account,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );

      setShowPinModal(false);

      if (res.data.msg === '200') {
        // Navigate to success screen
        navigation.replace('BillsSuccess', {
          serviceType,
          serviceTitle,
          amount: totalAmount,
          gradientColors,
          icon,
          transactionRef: res.data.reference || res.data.transaction_ref,
          deliveryInfo: res.data.delivery_info || null,
          pins: res.data.pins || null,
          token: res.data.token || null,
          summaryItems,
        });
      } else {
        // Navigate to failed screen
        navigation.replace('BillsFailed', {
          serviceType,
          serviceTitle,
          amount: totalAmount,
          gradientColors,
          icon,
          errorMessage: res.data.message || 'Transaction could not be completed.',
          errorCode: res.data.status || '500',
        });
      }
    } catch (error) {
      setShowPinModal(false);
      navigation.replace('BillsFailed', {
        serviceType,
        serviceTitle,
        amount: totalAmount,
        gradientColors,
        icon,
        errorMessage: error.message === 'Network Error'
          ? 'No internet connection. Please check your network and try again.'
          : 'Something went wrong. Please contact support if your wallet was debited.',
        errorCode: 'ERR',
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

      {/* ── Header ───────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={[gs.homeSideMenu, { opacity: 0 }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Service Banner ───────────────────── */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceBanner}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
          <View style={styles.bannerIconBox}>
            <Ionicons name={icon} size={32} color="#fff" />
          </View>
          <Text style={styles.bannerTitle}>{serviceTitle}</Text>
          <Text style={styles.bannerAmount}>
            ₦{Number(totalAmount).toLocaleString()}
          </Text>
          <Text style={styles.bannerLabel}>Total Amount</Text>
        </LinearGradient>

        {/* ── Review Notice ─────────────────────── */}
        <View style={styles.reviewNotice}>
          <Ionicons
            name="eye-outline"
            size={18}
            color={colors.primaryColor1}
          />
          <Text style={styles.reviewNoticeText}>
            Please review your order carefully before confirming payment.
            This transaction cannot be reversed once processed.
          </Text>
        </View>

        {/* ── Order Summary Card ────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Details</Text>
          <View style={styles.summaryDivider} />

          {summaryItems.map((item, index) => (
            <SummaryRow
              key={index}
              label={item.label}
              value={item.value}
            />
          ))}

          <View style={styles.summaryDivider} />

          <SummaryRow
            label="Service Fee"
            value={`₦${Number(fee || 0).toLocaleString()}`}
          />
          <SummaryRow
            label="Total Amount"
            value={`₦${Number(totalAmount).toLocaleString()}`}
            isTotal
            valueColor={gradientColors[0]}
          />
        </View>

        {/* ── Wallet Balance ────────────────────── */}
        <View style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet-outline" size={20} color={colors.primaryColor1} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletBalance}>
                ₦{Number(userInfo?.userData?.tran_account || 0).toLocaleString()}
              </Text>
            </View>
            <View style={[
              styles.walletStatusBadge,
              {
                backgroundColor:
                  Number(totalAmount) <= Number(userInfo?.userData?.tran_account || 0)
                    ? colors.greenColorLight
                    : colors.lightRed,
              },
            ]}>
              <Ionicons
                name={
                  Number(totalAmount) <= Number(userInfo?.userData?.tran_account || 0)
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={18}
                color={
                  Number(totalAmount) <= Number(userInfo?.userData?.tran_account || 0)
                    ? colors.successColor
                    : colors.dangerColor
                }
              />
              <Text style={[
                styles.walletStatusText,
                {
                  color:
                    Number(totalAmount) <= Number(userInfo?.userData?.tran_account || 0)
                      ? colors.successColor
                      : colors.dangerColor,
                },
              ]}>
                {Number(totalAmount) <= Number(userInfo?.userData?.tran_account || 0)
                  ? 'Sufficient'
                  : 'Insufficient'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Security Notice ───────────────────── */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
          <Text style={styles.securityText}>
            Your transaction is secured with end-to-end encryption.
            You will be asked to enter your PIN to authorize this payment.
          </Text>
        </View>

        {/* ── Pay Button ────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.payBtn,
            { backgroundColor: gradientColors[0] },
            Number(totalAmount) > Number(userInfo?.userData?.tran_account || 0)
            && { opacity: 0.5 },
          ]}
          onPress={handlePay}
          disabled={
            Number(totalAmount) > Number(userInfo?.userData?.tran_account || 0)
          }
          activeOpacity={0.85}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#fff"
            style={{ marginRight: spacing.sm }}
          />
          <Text style={styles.payBtnText}>
            Authorize & Pay ₦{Number(totalAmount).toLocaleString()}
          </Text>
        </TouchableOpacity>

        {/* ── Cancel Button ─────────────────────── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel Transaction</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* ── PIN Modal ─────────────────────────── */}
      <PinConfirmModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        isProcessing={isProcessing}
        totalAmount={totalAmount}
        serviceTitle={serviceTitle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
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

  // Service Banner
  serviceBanner: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  bannerCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bannerCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  bannerIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bannerTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  bannerAmount: {
    fontFamily: '_bold',
    fontSize: typography.giant,
    lineHeight: 48,
  },
  bannerLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: 4,
    lineHeight: 20,
  },

  // Review Notice
  reviewNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  reviewNoticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },

  // Summary Card
  summaryCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
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
    gap: spacing.md,
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

  // Wallet Card
  walletCard: {
    
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  walletIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    lineHeight: 20,
  },
  walletBalance: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    
  },
  walletStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  walletStatusText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },

  // Pay Button
  payBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  payBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },

  // Cancel Button
  cancelBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cancelBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },

  // PIN Modal
  pinModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
   pinModalCard: {
    
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: isSmallPhone ? spacing.lg : spacing.xl,
    paddingBottom: isSmallPhone ? spacing.xl : spacing.xxxl,
  },
  pinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pinModalTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
  },
  pinModalClose: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinModalAmount: {
    fontFamily: '_bold',
    fontSize: typography.huge,
    
    textAlign: 'center',
  },
  pinModalService: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
  },
  pinHint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  keypad: {
    gap: spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  keypadBtn: {
    flex: 1,
    height: 64,
    borderRadius: radius.lg,
    
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  keypadBtnText: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    
  },
});

export default BillsConfirmScreen;