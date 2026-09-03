import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';
import paystackImage from '../assets/images/paystack_logo.png';

const FundAccountPaystackScreen = ({ route, navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);
  const routeData = route.params?.amt;

  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [payStackAPI, setPayStackAPI] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const paystackRef = useRef(paystackProps.PayStackRef);

  // ── Load Paystack key & verify gateway ────────
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('AppSettingData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPayStackAPI(parsed.app_paypayKey || '');
        }
        await checkPaymentGateway();
      } catch (error) {
        console.log('Init error:', error.message);
      } finally {
        setIsChecking(false);
      }
    };
    const timer = setTimeout(init, 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Check gateway availability ────────────────
  const checkPaymentGateway = async () => {
    try {
      const res = await client.get('/api/check_paymentBtn', {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.app_payStack_btn === false ||
        res.data.app_payStack_btn === 'false' ||
        res.data.status === '404') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Gateway Unavailable',
          textBody: 'Paystack is currently unavailable. Please use Manual Transfer.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        navigation.replace('Home');
      }
    } catch (error) {
      console.log('Gateway check error:', error.message);
    }
  };

  // ── Handle successful payment ─────────────────
  const handlePaystackSuccess = async (reference) => {
    setIsLoading(true);
    try {
      const res = await client.post(
        '/api/userAccount_funding',
        {
          tag_id: routeData?.tag_id,
          serviceName: routeData?.serviceName,
          serviceCategory: 'Exchange',
          method: 'Paystack Checkout',
          total_money: routeData?.total_money,
          payId: reference,
          amt: routeData?.total_money,
          note: routeData?.note,
          userId: userInfo?.userData?._id,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Payment Successful!',
          textBody: 'Your wallet has been funded successfully. Check your email for confirmation.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.replace('Home'),
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: res.data.message || 'Something went wrong. Please contact support.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Network error. Please check your connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading screen ────────────────────────────
  if (isChecking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.primaryColor1} />
          <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
            Connecting to payment gateway...
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
          <Ionicons name="close" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Paystack Checkout
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Payment Card ─────────────────────────── */}
      <View style={[styles.paymentCard, { backgroundColor: colors.bgCard }]}>

        {/* Paystack Logo */}
        <View style={[styles.logoBox, { backgroundColor: colors.bgLight }]}>
          <Image source={paystackImage} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Amount */}
        <Text style={[styles.amountLabel, { color: colors.textSecColor }]}>
          Amount to Pay
        </Text>
        <Text style={[styles.amountValue, { color: colors.primaryColor1 }]}>
          ₦{Number(routeData?.total_money || 0).toLocaleString()}
        </Text>

        {/* Status */}
        {paymentStatus === 'Approved' ? (
          <View style={[styles.successBadge, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.successBadgeText, { color: '#10B981' }]}>
              Payment Approved!
            </Text>
          </View>
        ) : (
          <Text style={[styles.paymentDesc, { color: colors.textSecColor }]}>
            Secure payment powered by Paystack. Your card details are encrypted and protected.
          </Text>
        )}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.dividerColor }]} />

        {/* Transaction Details */}
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>Service</Text>
          <Text style={[styles.detailValue, { color: colors.textBlack }]}>
            {routeData?.serviceName || 'Account Funding'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>Method</Text>
          <Text style={[styles.detailValue, { color: colors.textBlack }]}>
            Paystack (Card / Mobile Money)
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>Email</Text>
          <Text style={[styles.detailValue, { color: colors.textBlack }]}>
            {userInfo?.userData?.email}
          </Text>
        </View>
      </View>

      {/* ── Security Notice ───────────────────────── */}
      <View style={[styles.securityNotice, {
        backgroundColor: colors.bgLight,
        borderColor: colors.dividerColor,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
      }]}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
        <Text style={[styles.securityText, { color: colors.textSecColor }]}>
          256-bit SSL encryption. Your payment is completely secure.
        </Text>
      </View>

      {/* ── Paystack WebView (hidden) ─────────────── */}
      <View style={{ height: 0 }}>
        {payStackAPI ? (
          <Paystack
            paystackKey={payStackAPI}
            amount={routeData?.total_money}
            billingEmail={userInfo?.userData?.email}
            billingName={userInfo?.userData?.display_name}
            channels={['card', 'mobile_money']}
            onCancel={() => navigation.goBack()}
            onSuccess={(res) => {
              setPaymentStatus(res.data?.transactionRef?.message);
              handlePaystackSuccess(res.data?.transactionRef?.reference);
            }}
            ref={paystackRef}
            autoStart={false}
          />
        ) : null}
      </View>

      {/* ── Pay Button ────────────────────────────── */}
      {paymentStatus !== 'Approved' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.payBtn,
              { backgroundColor: colors.primaryColor1 },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={() => paystackRef.current?.startTransaction()}
            disabled={isLoading || !payStackAPI}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size={22} />
            ) : (
              <>
                <Image source={paystackImage} style={styles.payBtnIcon} resizeMode="contain" />
                <Text style={styles.payBtnText}>
                  Pay ₦{Number(routeData?.total_money || 0).toLocaleString()} with Paystack
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

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

  // Payment Card
  paymentCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  amountLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  amountValue: {
    fontFamily: '_bold',
    fontSize: 40,
    lineHeight: 50,
    marginBottom: spacing.lg,
  },
  paymentDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  successBadgeText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  detailValue: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
    textAlign: 'right',
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xl,
  },
  payBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  payBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
  },
  payBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
  },
});

export default FundAccountPaystackScreen;