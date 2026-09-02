import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, Platform, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import client from '../contextAPI/client';
import { noticeData } from '../components/errorNotice';
import IsValidEmail from '../components/checkEmailFormat';

const ForgetPasswordScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();

  // ── State ─────────────────────────────────────
  const [isEmailSend, setIsEmailSend] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [emailVerify, setEmailVerify] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  // ── Send OTP ──────────────────────────────────
  const sendResetMail = async () => {
    if (!userEmail) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Please enter your email address',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    if (!IsValidEmail(userEmail)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid Email',
        textBody: 'Please enter a valid email address',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    try {
      setEmailLoading(true);
      const res = await client.post('/api/forgetPasswordMobile', {
        user_email: userEmail,
      });
      if (res.data.msg === '200') {
        setIsEmailSend(true);
        setVerifyCode(res.data.otpPin);
        setEmailVerify(res.data.myEmail);
        setUserEmail('');
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: res.data.status === '404'
            ? 'No account found with this email'
            : 'Something went wrong, please try again',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Network error occurred. Please check your connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Reset Password ────────────────────────────
  const resetPasswordAction = async () => {
    if (!newPassword || !confirmPassword || !otpCode) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'All fields are required',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Passwords do not match',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    if (otpCode !== verifyCode) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid OTP',
        textBody: 'The OTP code you entered is incorrect',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    try {
      setResetLoading(true);
      const res = await client.post('/api/resetPasswordMobile', {
        password: newPassword,
        otpPin: otpCode,
        userEmail: emailVerify,
      });
      if (res.data.msg === '200') {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Your password has been reset successfully',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: res.data.message || 'Something went wrong, please try again',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Network error occurred. Please check your connection.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (

    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.bgColor}
        />
        {/* ── Header ──────────────────────── */}
          <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
              onPress={() => navigation.navigate('Login')}>
              <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
              Forgot Password
            </Text>
            <View style={styles.backBtn} />
          </View>

    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}  
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"                      
            keyboardDismissMode="on-drag"                            
            bounces={true}>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
              colors={['#4C5FD5', '#6C7FE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />

              <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Ionicons
                  name={isEmailSend ? 'lock-open-outline' : 'lock-closed-outline'}
                  size={30}
                  color="#4C5FD5"
                />
              </View>

              <Text style={styles.heroTitle}>
                {isEmailSend ? 'Reset Your Password' : 'Forgot Password?'}
              </Text>
              <Text style={styles.heroDesc}>
                {isEmailSend
                  ? 'Enter the OTP sent to your email and set a new password'
                  : 'No worries — enter your registered email and we\'ll send you a reset code'}
              </Text>

              {/* Step pills */}
              <View style={styles.heroPillsRow}>
                <View style={[
                  styles.heroPill,
                  { backgroundColor: !isEmailSend ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' },
                ]}>
                  <Text style={[
                    styles.heroPillText,
                    { color: !isEmailSend ? '#4C5FD5' : '#fff' },
                  ]}>
                    1. Enter Email
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.6)" />
                <View style={[
                  styles.heroPill,
                  { backgroundColor: isEmailSend ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' },
                ]}>
                  <Text style={[
                    styles.heroPillText,
                    { color: isEmailSend ? '#4C5FD5' : '#fff' },
                  ]}>
                    2. Reset Password
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* ── Step 1 — Email Input ─────────── */}
            {!isEmailSend && (
              <View style={[
                styles.card,
                {
                  backgroundColor: colors.bgCard,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.dividerColor,
                },
              ]}>
                <Text style={[styles.cardTitle, { color: colors.textBlack }]}>
                  Enter Your Email
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textSecColor }]}>
                  We'll send a one-time password (OTP) to your registered email address.
                </Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Email Address
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: emailFocused ? '#4C5FD5' : colors.dividerColor,
                      backgroundColor: colors.bgLight,
                    },
                  ]}>
                    <MaterialIcons
                      name="alternate-email"
                      size={20}
                      color={emailFocused ? '#4C5FD5' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter your registered email"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.inputField, { color: colors.textBlack }]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={userEmail?.toLowerCase()}
                      onChangeText={setUserEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <LinearGradient
                  colors={['#4C5FD5', '#6C7FE8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.actionBtn, emailLoading && { opacity: 0.7 }]}>
                  <TouchableOpacity
                    style={styles.actionBtnInner}
                    onPress={sendResetMail}
                    disabled={emailLoading}
                    activeOpacity={0.85}>
                    {emailLoading ? (
                      <ActivityIndicator color="#fff" size={22} />
                    ) : (
                      <>
                        <Ionicons name="send-outline" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Send Reset Code</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>

                {/* Back to login */}
                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => navigation.navigate('Login')}>
                  <Ionicons name="arrow-back" size={16} color={colors.textSecColor} />
                  <Text style={[styles.backToLoginText, { color: colors.textSecColor }]}>
                    Back to Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step 2 — OTP + New Password ──── */}
            {isEmailSend && (
              <View style={[
                styles.card,
                {
                  backgroundColor: colors.bgCard,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: colors.dividerColor,
                },
              ]}>
                {/* OTP Notice */}
                <View style={[styles.otpNotice, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="mail-outline" size={18} color="#10B981" />
                  <Text style={[styles.otpNoticeText, { color: '#065F46' }]}>
                    OTP sent! Check your email inbox and enter the code below.
                  </Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.textBlack }]}>
                  Set New Password
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textSecColor }]}>
                  Enter the OTP from your email and choose a new strong password.
                </Text>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    New Password
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: newPassFocused ? '#4C5FD5' : colors.dividerColor,
                      backgroundColor: colors.bgLight,
                    },
                  ]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={newPassFocused ? '#4C5FD5' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter new password"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.inputField, { color: colors.textBlack }]}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={() => setNewPassFocused(true)}
                      onBlur={() => setNewPassFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeBtn}>
                      <Feather
                        name={showNewPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={newPassFocused ? '#4C5FD5' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    Confirm New Password
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: confirmPassFocused ? '#4C5FD5' : colors.dividerColor,
                      backgroundColor: colors.bgLight,
                    },
                  ]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={confirmPassFocused ? '#4C5FD5' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Re-enter new password"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.inputField, { color: colors.textBlack }]}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setConfirmPassFocused(true)}
                      onBlur={() => setConfirmPassFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeBtn}>
                      <Feather
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color={confirmPassFocused ? '#4C5FD5' : '#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                  {/* Password match indicator */}
                  {confirmPassword.length > 0 && (
                    <View style={styles.matchRow}>
                      <Ionicons
                        name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                        size={14}
                        color={newPassword === confirmPassword ? '#10B981' : '#EF4444'}
                      />
                      <Text style={{
                        fontFamily: '_regular',
                        fontSize: typography.xs,
                        color: newPassword === confirmPassword ? '#10B981' : '#EF4444',
                        marginLeft: 4,
                      }}>
                        {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* OTP Code */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                    OTP Code
                  </Text>
                  <View style={[
                    styles.inputContainer,
                    {
                      borderColor: otpFocused ? '#4C5FD5' : colors.dividerColor,
                      backgroundColor: colors.bgLight,
                    },
                  ]}>
                    <Ionicons
                      name="keypad-outline"
                      size={20}
                      color={otpFocused ? '#4C5FD5' : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Enter 6-digit OTP code"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.inputField, { color: colors.textBlack }]}
                      keyboardType="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      onFocus={() => setOtpFocused(true)}
                      onBlur={() => setOtpFocused(false)}
                    />
                  </View>
                  <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                    Enter the 6-digit code sent to your email
                  </Text>
                </View>

                {/* Reset Button */}
                <LinearGradient
                  colors={['#4C5FD5', '#6C7FE8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.actionBtn, resetLoading && { opacity: 0.7 }]}>
                  <TouchableOpacity
                    style={styles.actionBtnInner}
                    onPress={resetPasswordAction}
                    disabled={resetLoading}
                    activeOpacity={0.85}>
                    {resetLoading ? (
                      <ActivityIndicator color="#fff" size={22} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Reset Password</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>

                {/* Resend / Back */}
                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => {
                    setIsEmailSend(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setOtpCode('');
                  }}>
                  <Ionicons name="arrow-back" size={16} color={colors.textSecColor} />
                  <Text style={[styles.backToLoginText, { color: colors.textSecColor }]}>
                    Use a different email
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Security Notice ─────────────── */}
            <View style={[
              styles.securityCard,
              {
                backgroundColor: colors.bgLight,
                borderColor: colors.dividerColor,
              },
            ]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#4C5FD5" />
              <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                Your password reset is secured with one-time verification. Never share your OTP with anyone.
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
    container: {
    flex: 1,
    },
  scrollContent: {
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
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroPillText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Card
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  // OTP Notice
  otpNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpNoticeText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    flex: 1,
    lineHeight: 20,
  },

  // Input
  inputGroup: {
    marginBottom: spacing.lg,
  },
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
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.base,
    paddingVertical: 0,
  },
  inputHint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  eyeBtn: {
    padding: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  // Action Button
  actionBtn: {
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  actionBtnInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    gap: spacing.sm,
  },
  actionBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Back to login
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  backToLoginText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Security Card
  securityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    flex: 1,
    lineHeight: 20,
  },
});

export default ForgetPasswordScreen;