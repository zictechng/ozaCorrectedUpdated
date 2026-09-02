import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, KeyboardAvoidingView,
  TextInput, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';

const ResetPasswordScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  // ── State ─────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  // ── Validation ────────────────────────────────
  const validate = () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Required Fields',
        textBody: 'Please fill in all fields to continue.',
      });
      return false;
    }
    if (newPassword.length < 6) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Weak Password',
        textBody: 'Password must be at least 6 characters.',
      });
      return false;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Mismatch',
        textBody: 'Passwords do not match. Please check and try again.',
      });
      return false;
    }
    return true;
  };

  // ── Reset Password ────────────────────────────
  const resetPasswordAction = async () => {
    if (!validate()) return;
    try {
      setRequestLoading(true);
      const res = await client.post(
        '/api/updateUser_passwordMobile',
        {
          password: newPassword,
          userEmail: userInfo.userData.email,
          userId: userInfo.userData._id,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '201') {
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert(
          '✅ Password Updated',
          'Your password has been reset successfully. Please use your new password to sign in.',
          [{ text: 'Go Home', onPress: () => navigation.navigate('Home') }]
        );
      } else if (res.data.status === '401') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Access Denied',
          textBody: 'You are not authorized to perform this action.',
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Network Error',
        textBody: 'Could not connect. Please check your internet connection.',
      });
    } finally {
      setRequestLoading(false);
    }
  };

  // ── Password strength ─────────────────────────
  const getStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6) return { label: 'Weak', color: '#EF4444', width: '30%' };
    if (newPassword.length < 10) return { label: 'Fair', color: '#F59E0B', width: '60%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };
  const strength = getStrength();

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
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Reset Password
        </Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={true}>

          {/* ── Hero Banner ────────────────────── */}
          <LinearGradient
            colors={['#4C5FD5', '#6C7FE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={[
              styles.heroIconBox,
              { backgroundColor: 'rgba(255,255,255,0.95)' },
            ]}>
              <Ionicons name="lock-open-outline" size={30} color="#4C5FD5" />
            </View>
            <Text style={styles.heroTitle}>Create New Password</Text>
            <Text style={styles.heroDesc}>
              Choose a strong password to keep your account secure
            </Text>

            {/* Security tips row */}
            <View style={styles.tipsRow}>
              {['6+ characters', 'Mix letters & numbers', 'Unique password'].map((tip) => (
                <View key={tip} style={styles.tipPill}>
                  <Ionicons name="checkmark-circle" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* ── Form Card ──────────────────────── */}
          <View style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.dividerColor,
            },
          ]}>

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
                  autoCorrect={false}
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

              {/* Password strength bar */}
              {strength && (
                <View style={styles.strengthContainer}>
                  <View style={[styles.strengthBarBg, { backgroundColor: colors.dividerColor }]}>
                    <View style={[
                      styles.strengthBarFill,
                      {
                        width: strength.width,
                        backgroundColor: strength.color,
                      },
                    ]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}
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
                  autoCorrect={false}
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

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchRow}>
                  <Ionicons
                    name={newPassword === confirmPassword
                      ? 'checkmark-circle'
                      : 'close-circle'}
                    size={14}
                    color={newPassword === confirmPassword ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[
                    styles.matchText,
                    {
                      color: newPassword === confirmPassword
                        ? '#10B981'
                        : '#EF4444',
                    },
                  ]}>
                    {newPassword === confirmPassword
                      ? 'Passwords match'
                      : 'Passwords do not match'}
                  </Text>
                </View>
              )}
            </View>

            {/* Security Notice */}
            <View style={[
              styles.securityNotice,
              {
                backgroundColor: colors.bgLight,
                borderColor: isDark ? colors.dividerColor : '#E0E7FF',
              },
            ]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#4C5FD5"
              />
              <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                After resetting, you'll use your new password to sign in across all devices.
              </Text>
            </View>

            {/* Reset Button */}
            <LinearGradient
              colors={['#4C5FD5', '#6C7FE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.actionBtn, requestLoading && { opacity: 0.7 }]}>
              <TouchableOpacity
                style={styles.actionBtnInner}
                onPress={resetPasswordAction}
                disabled={requestLoading}
                activeOpacity={0.85}>
                {requestLoading ? (
                  <ActivityIndicator color="#fff" size={22} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
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
  tipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  tipText: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    color: '#fff',
    lineHeight: 16,
  },

  // Card
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
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
  eyeBtn: {
    padding: 4,
  },

  // Strength Bar
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  strengthLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
    lineHeight: 16,
    minWidth: 40,
  },

  // Match Row
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  matchText: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    lineHeight: 16,
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    flex: 1,
    lineHeight: 20,
  },

  // Action Button
  actionBtn: {
    borderRadius: radius.lg,
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

  // Cancel
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default ResetPasswordScreen;