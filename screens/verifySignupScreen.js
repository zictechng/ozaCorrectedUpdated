import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, BackHandler, Alert,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

const VerifySignupScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userEmail, otpStatus } = useContext(AuthContext);

  const verifyCode = route.params?.otpCode;
  const otpRef = useRef(null);

  const [enterCode, setEnterCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Email display — mask middle part
  const [namePart] = userEmail?.split('@') || [''];
  const displayEmail = namePart?.substring(0, 3) + '***@' + (userEmail?.split('@')[1] || '');

  // ── Hardware back button ──────────────────────
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Go Back?',
        'Are you sure you want to cancel account activation?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Go Back', onPress: () => navigation.navigate('Register') },
        ]
      );
      return true;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, []);

  // ── Focus OTP and send OTP on load ───────────
  useEffect(() => {
    if (isFocused) {
      setTimeout(() => otpRef.current?.focusField(0), 300);
      if (verifyCode) sendOTP();
    }
  }, [isFocused]);

  // ── Send OTP to email ─────────────────────────
  const sendOTP = async () => {
    if (!verifyCode) return;
    try {
      setIsSendingOtp(true);
      await client.post('/api/sendUserOTP', {
        email: userEmail,
        otp_code: verifyCode.reg_otp,
      });
    } catch (error) {
      console.log('Send OTP error:', error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Verify OTP ────────────────────────────────
  const verifyOTP = async (code, email) => {
    if (!code || code.length !== 6) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Incomplete Code',
        textBody: 'Please enter the full 6-digit OTP code.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await client.post('/api/otp_verify', {
        otp_code: code,
        user_email: email || userEmail,
      });
      if (res.data.msg === '200') {
        await AsyncStorage.removeItem('userOTP');
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Account Activated!',
          textBody: 'Your account has been successfully activated. You can now sign in.',
          button: 'Sign In',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.navigate('Login'),
        });
      } else if (res.data.status === '404') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Invalid Code', textBody: 'The OTP code you entered is incorrect. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else if (res.data.status === '401') {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Not Found', textBody: 'No account found for this email.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────
  const resendOTP = async () => {
    setIsResending(true);
    try {
      const res = await client.post('/api/otpResend', { email: userEmail });
      if (res.data.msg === '200') {
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'OTP Sent!', textBody: 'A new OTP code has been sent to your email. Check your inbox or spam folder.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        setEnterCode('');
        setTimeout(() => otpRef.current?.focusField(0), 300);
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: 'Could not resend OTP. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Network error. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsResending(false);
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
                onPress={() => {
                  Alert.alert(
                    'Go Back?',
                    'Are you sure you want to cancel account activation?',
                    [
                      { text: 'Stay', style: 'cancel' },
                      { text: 'Go Back', onPress: () => navigation.navigate('Register') },
                    ]
                  );
                }}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                Verify Account
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
                <Ionicons name="mail-unread-outline" size={30} color={colors.primaryColor1} />
              </View>
              <Text style={styles.heroTitle}>Check Your Email</Text>
              <Text style={styles.heroDesc}>
                We sent a 6-digit OTP code to
              </Text>
              <View style={styles.emailPill}>
                <Ionicons name="mail-outline" size={14} color="#fff" />
                <Text style={styles.emailText}>{displayEmail}</Text>
              </View>
              {isSendingOtp && (
                <View style={styles.sendingRow}>
                  <ActivityIndicator size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.sendingText}>Sending OTP to your email...</Text>
                </View>
              )}
            </LinearGradient>

            {/* ── OTP Card ─────────────────────── */}
            <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.dividerColor }]}>

              <Text style={[styles.cardTitle, { color: colors.textBlack }]}>
                Enter OTP Code
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecColor }]}>
                {otpStatus
                  ? 'You have a pending activation. Enter the OTP code to activate your account.'
                  : 'Enter the 6-digit code sent to your email. Check your spam folder if you don\'t see it.'}
              </Text>

              {/* OTP Input */}
              <OTPInputView
                ref={otpRef}
                style={styles.otpInput}
                pinCount={6}
                autoFocusOnLoad={false}
                code={enterCode}
                onCodeChanged={(code) => setEnterCode(code)}
                codeInputFieldStyle={[
                  styles.otpField,
                  {
                    borderColor: colors.dividerColor,
                    color: colors.textBlack,
                    backgroundColor: colors.bgLight,
                  },
                ]}
                codeInputHighlightStyle={{
                  borderColor: colors.primaryColor1,
                  backgroundColor: colors.primaryColor1 + '10',
                }}
                keyboardType="number-pad"
                autofillFromClipboard
                returnKeyType="done"
                onCodeFilled={(code) => {
                  setEnterCode(code);
                  verifyOTP(code, userEmail);
                }}
              />

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyBtn,
                  { backgroundColor: colors.primaryColor1 },
                  (isLoading || enterCode.length < 6) && { opacity: 0.6 },
                ]}
                onPress={() => verifyOTP(enterCode, userEmail)}
                disabled={isLoading || enterCode.length < 6}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.verifyBtnText}>Activate Account</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.dividerColor }]} />

              {/* Resend */}
              <View style={styles.resendRow}>
                <Text style={[styles.resendLabel, { color: colors.textSecColor }]}>
                  Didn't receive the code?
                </Text>
                <TouchableOpacity
                  onPress={resendOTP}
                  disabled={isResending}
                  activeOpacity={0.7}>
                  {isResending ? (
                    <ActivityIndicator size={16} color={colors.primaryColor1} />
                  ) : (
                    <Text style={[styles.resendLink, { color: colors.primaryColor1 }]}>
                      Resend OTP
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Info Notice ───────────────────── */}
            <View style={[styles.notice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                The OTP code expires after 10 minutes. If you don't receive it, check your spam folder or request a new code.
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
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    color: '#fff',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  emailText: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 20,
  },
  sendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  sendingText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },

  // Card
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  cardTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // OTP Input
  otpInput: {
    width: '100%',
    height: 80,
    marginBottom: spacing.xl,
  },
  otpField: {
    width: 46,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    fontFamily: '_bold',
    fontSize: typography.xl,
  },

  // Verify Button
  verifyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  verifyBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },

  // Resend
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resendLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  resendLink: {
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
    fontSize: typography.sm,
    lineHeight: 20,
    flex: 1,
  },
});

export default VerifySignupScreen;