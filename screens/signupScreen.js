import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Checkbox from 'expo-checkbox';
import CountryPicker from 'react-native-country-picker-modal';
import PasswordStrengthMeterBar from 'react-native-password-strength-meter-bar';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import IsValidEmail from '../components/checkEmailFormat';
import FormInput from '../components/FormInput';
import { isSmallPhone } from '../utils/responsive';

// ─────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────
const StepIndicator = ({ currentStep, totalSteps, colors, accentColor }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: totalSteps }).map((_, i) => {
      const stepNum = i + 1;
      const isCompleted = stepNum < currentStep;
      const isActive = stepNum === currentStep;

      return (
        <React.Fragment key={i}>
          <View style={styles.stepItem}>
              <View style={[
              styles.stepCircle,
              {
                backgroundColor: isCompleted
                  ? accentColor
                  : isActive
                    ? accentColor
                    : 'rgba(255,255,255,0.2)',                          
                borderColor: isActive
                  ? '#fff'
                  : isCompleted
                    ? accentColor
                    : 'rgba(255,255,255,0.3)',                          
              },
            ]}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  { color: isActive ? '#fff' : colors.textSecColor },
                ]}>
                  {stepNum}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              {
                color: isActive
                  ? accentColor
                  : isCompleted
                    ? colors.successColor
                    : colors.textSecColor,
              },
            ]}>
              {stepNum === 1 ? 'Account' : stepNum === 2 ? 'Security' : 'Confirm'}
            </Text>
          </View>
          {i < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              {
                backgroundColor: isCompleted
                  ? accentColor
                  : 'rgba(255,255,255,0.25)',                            
              },
            ]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────
// MAIN SIGNUP SCREEN
// ─────────────────────────────────────────────────
const SignupScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { registerAction, isBtnLoading, isButtonDisable } = useContext(AuthContext);

  const [currentStep, setCurrentStep] = useState(1);
  const [isChecked, setChecked] = useState(false);

  // ── Step 1 — Account Info ─────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // ── Step 2 — Personal Info ────────────────────
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [countryCode, setCountryCode] = useState('NG');
  const [countryFlag, setCountryFlag] = useState('🇳🇬');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // ── Step 3 — Review ───────────────────────────
  const [errors, setErrors] = useState({});

  const accentColor = colors.primaryColor1;

  // ── Validation per step ───────────────────────
  const validateStep1 = () => {
    const newErrors = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!IsValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!phone.trim() || phone.length < 11) {
      newErrors.phone = 'Enter a valid 11-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isChecked) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Step navigation ───────────────────────────
  const handleNext = () => {
    Keyboard.dismiss();
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else navigation.goBack();
  };

  // ── Submit ────────────────────────────────────
  const handleRegister = () => {
    Keyboard.dismiss();
    registerAction(
      fullName.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      password,
      country,
      referralCode.trim(),
    );
  };


  // ── Country select ────────────────────────────
const onSelectCountry = (c) => {
  setCountry(c.name);
  setCountryCode(c.cca2);
  // ✅ Don't use c.flag — it's a base64 image, not an emoji
  // Use cca2 to derive the emoji flag instead
  const emojiFlag = c.cca2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
  setCountryFlag(emojiFlag);
  setShowCountryPicker(false);
};

  // ── Review row ────────────────────────────────
  const ReviewRow = ({ label, value, onEdit, step }) => (
    <View style={[styles.reviewRow, { borderBottomColor: colors.dividerColor }]}>
      <View style={styles.reviewLeft}>
        <Text style={[styles.reviewLabel, { color: colors.textSecColor }]}>{label}</Text>
        <Text style={[styles.reviewValue, { color: colors.textBlack }]} numberOfLines={1}>
          {value || '—'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.reviewEditBtn, { backgroundColor: colors.bgLight }]}
        onPress={() => { setCurrentStep(step); setErrors({}); }}>
        <Text style={[styles.reviewEditText, { color: colors.primaryColor1 }]}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

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
            {/* ── Header ──────────────────────── */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={[styles.headerIconBtn, { backgroundColor: colors.bgLight }]}
                  onPress={handleBack}>
                  <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                  Create Account
                </Text>

                <TouchableOpacity
                  style={[styles.headerTextBtn, { backgroundColor: colors.bgLight }]}
                  onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.signInText, { color: colors.primaryColor1 }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

            {/* ── Hero Banner ──────────────────── */}
            <LinearGradient
                colors={[colors.primaryColor1, colors.primaryColor1b]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBanner}>
                <View style={[
                  styles.heroCircle1,
                  { backgroundColor: 'rgba(255,255,255,0.08)' },           
                ]} />
                <View style={[
                  styles.heroCircle2,
                  { backgroundColor: 'rgba(255,255,255,0.06)' },           
                ]} />

                <View style={styles.heroContent}>
                  <View style={[
                    styles.heroIconBox,
                    { backgroundColor: 'rgba(255,255,255,0.95)' },         
                  ]}>
                    <Ionicons name="person-add" size={28} color={colors.primaryColor1} />
                  </View>
                  <View style={styles.heroText}>
                    <Text style={[styles.heroTitle, { color: '#fff' }]}>   
                      {currentStep === 1
                        ? 'Account Details'
                        : currentStep === 2
                          ? 'Set Password'
                          : 'Review & Confirm'}
                    </Text>
                    <Text style={[styles.heroDesc, { color: 'rgba(255,255,255,0.85)' }]}> 
                      {currentStep === 1
                        ? 'Enter your basic information to get started'
                        : currentStep === 2
                          ? 'Create a strong password for your account'
                          : 'Review your information before submitting'}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.stepIndicatorWrapper,
                  { backgroundColor: 'rgba(255,255,255,0.15)' },
                ]}>
                  <StepIndicator
                    currentStep={currentStep}
                    totalSteps={3}
                    colors={colors}
                    accentColor="#fff"
                  />
                </View>
              </LinearGradient>

            {/* ── Step 1 — Account Info ─────────── */}
            {currentStep === 1 && (
              <View style={[styles.formCard, {
                backgroundColor: colors.bgCard,
                borderWidth: isDark ? 1 : 0,                             
                borderColor: isDark ? colors.dividerColor : 'transparent',
                ...shadows.card,
              }]}>
                <FormInput
                  label="Full Name"
                  icon="person-outline"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  error={errors.fullName}
                  colors={colors}
                />
                <FormInput
                  label="Email Address"
                  icon="mail-outline"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={(t) => setEmail(t.toLowerCase())}
                  keyboardType="email-address"
                  error={errors.email}
                  colors={colors}
                />
                <FormInput
                  label="Phone Number"
                  icon="phone-portrait-outline"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={11}
                  error={errors.phone}
                  hint="Enter your 11-digit Nigerian mobile number"
                  colors={colors}
                />
                <FormInput
                  label="Referral Code (Optional)"
                  icon="people-outline"
                  placeholder="Enter referral code if you have one"
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                  hint="Got a referral code? Enter it here to earn a signup bonus"
                  colors={colors}
                />

                <LinearGradient
                  colors={[colors.primaryColor1, colors.primaryColor1b]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.nextBtn, { padding: 0 }]}>
                  <TouchableOpacity
                    style={styles.nextBtnInner}
                    onPress={handleNext}
                    activeOpacity={0.85}>
                    <Text style={styles.nextBtnText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* ── Step 2 — Password ─────────────── */}
            {currentStep === 2 && (
              <View style={[styles.formCard, {
                backgroundColor: colors.bgCard,
                borderWidth: isDark ? 1 : 0,                             
                borderColor: isDark ? colors.dividerColor : 'transparent',
                ...shadows.card,
              }]}>
                <FormInput
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Create a strong password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  error={errors.password}
                  colors={colors}
                />

                {/* Password Strength Bar */}
                {password.length > 0 && (
                  <View style={styles.strengthWrapper}>
                    <PasswordStrengthMeterBar password={password} />
                    <Text style={[styles.strengthHint, { color: colors.textSecColor }]}>
                      Use 8+ characters with letters, numbers and symbols
                    </Text>
                  </View>
                )}

                <FormInput
                  label="Confirm Password"
                  icon="lock-closed-outline"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={errors.confirmPassword}
                  colors={colors}
                />

                {/* Country Picker */}
                <View style={styles.countryWrapper}>
                  <Text style={[styles.countryLabel, { color: colors.textSecColor }]}>
                    Country
                  </Text>
                    <TouchableOpacity
                      style={[
                        styles.countryBtn,
                        {
                          borderColor: colors.dividerColor,
                          backgroundColor: colors.bgLight,
                        },
                      ]}
                      onPress={() => setShowCountryPicker(true)}
                      activeOpacity={0.8}>
                      <Text style={styles.countryFlag}>{countryFlag}</Text>
                      <Text style={[styles.countryName, { color: colors.textBlack }]}>
                        {country}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color={colors.textSecColor} />
                    </TouchableOpacity>
                </View>

                <CountryPicker
                  visible={showCountryPicker}
                  onSelect={onSelectCountry}
                  onClose={() => setShowCountryPicker(false)}
                  withFilter
                  withFlag
                  withCountryNameButton
                  withAlphaFilter
                  withCallingCode
                  countryCode={countryCode}
                  containerButtonStyle={{ display: 'none' }}
                />

                {/* Terms & Conditions */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setChecked(!isChecked)}
                  activeOpacity={0.8}>
                  <Checkbox
                    value={isChecked}
                    onValueChange={setChecked}
                    color={isChecked ? colors.primaryColor1 : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.termsText, { color: colors.textSecColor }]}>
                    I agree to the{' '}
                    <Text
                      style={[styles.termsLink, { color: colors.primaryColor1 }]}
                      onPress={() => navigation.navigate('TermCondition')}>
                      Terms & Conditions
                    </Text>
                    {' '}and{' '}
                    <Text
                      style={[styles.termsLink, { color: colors.primaryColor1 }]}
                      onPress={() => navigation.navigate('PrivacyPolicy')}>
                      Privacy Policy
                    </Text>
                  </Text>
                </TouchableOpacity>

                {errors.terms && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={colors.dangerColor} />
                    <Text style={[styles.errorText, { color: colors.dangerColor }]}>
                      {errors.terms}
                    </Text>
                  </View>
                )}

                <LinearGradient
                  colors={[colors.primaryColor1, colors.primaryColor1b]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.nextBtn, { padding: 0 }]}>
                  <TouchableOpacity
                    style={styles.nextBtnInner}
                    onPress={handleNext}
                    activeOpacity={0.85}>
                    <Text style={styles.nextBtnText}>Review Details</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* ── Step 3 — Review & Submit ──────── */}
            {currentStep === 3 && (
              <View style={[styles.formCard, {
                backgroundColor: colors.bgCard,
                borderWidth: isDark ? 1 : 0,                             
                borderColor: isDark ? colors.dividerColor : 'transparent',
                ...shadows.card,
              }]}>
                {/* Review Header */}
                <View style={[styles.reviewHeader, { backgroundColor: colors.bgLight }]}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color={colors.successColor}
                  />
                  <Text style={[styles.reviewHeaderText, { color: colors.textBlack }]}>
                    Please review your information carefully before submitting
                  </Text>
                </View>

                {/* Review Rows */}
                <ReviewRow
                  label="Full Name"
                  value={fullName}
                  step={1}
                />
                <ReviewRow
                  label="Email Address"
                  value={email}
                  step={1}
                />
                <ReviewRow
                  label="Phone Number"
                  value={phone}
                  step={1}
                />
                <ReviewRow
                  label="Country"
                  value={`${countryFlag} ${country}`}   
                  step={2}
                />
                <ReviewRow
                  label="Referral Code"
                  value={referralCode || 'None'}
                  step={1}
                />
                <ReviewRow
                  label="Password"
                  value="••••••••"
                  step={2}
                />

                {/* Security Notice */}
                <View style={[styles.securityNotice, {
                  backgroundColor: colors.bgLight,
                  borderColor: isDark ? colors.dividerColor : '#E0E7FF',
                }]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={colors.primaryColor1}
                  />
                  <Text style={[styles.securityText, { color: colors.textSecColor }]}>
                    Your data is encrypted and protected. We never share your information with third parties.
                  </Text>
                </View>

                {/* Submit Button */}
                <LinearGradient
                  colors={[colors.primaryColor1, colors.primaryColor1b]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.submitBtn,
                    (isBtnLoading || isButtonDisable) && { opacity: 0.7 },
                  ]}>
                  <TouchableOpacity
                    style={styles.nextBtnInner}
                    onPress={handleRegister}
                    disabled={isBtnLoading || isButtonDisable}
                    activeOpacity={0.85}>
                    {isBtnLoading ? (
                      <ActivityIndicator color="#fff" size={22} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                        <Text style={styles.nextBtnText}>Create My Account</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>

                {/* Already have account */}
                <View style={styles.signinRow}>
                  <Text style={[styles.signinText, { color: colors.textSecColor }]}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.signinLink, { color: colors.primaryColor1 }]}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
  signInText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heroCircle2: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 4,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  headerIconBtn: {
  width: 42,
  height: 42,
  borderRadius: radius.full,
  justifyContent: 'center',
  alignItems: 'center',
},
headerTextBtn: {
  borderRadius: radius.full,
  paddingHorizontal: spacing.md,   
  paddingVertical: spacing.xs,
  height: 42,
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 42,                    
},

  nextBtnInner: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: 54,
  gap: spacing.sm,
  width: '100%',
},

  // Step Indicator
  stepIndicatorWrapper: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepNumber: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  stepLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 16,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xl,
    borderRadius: radius.full,
  },

  // Form Card
  formCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },

  // Password Strength
  strengthWrapper: {
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  strengthHint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  // Country
  countryWrapper: {
    marginBottom: spacing.lg,
  },
  countryLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    borderRadius: 4,
    marginTop: 2,
  },
  termsText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 24,
  },
  termsLink: {
    fontFamily: '_bold',
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    flex: 1,
    lineHeight: 20,
  },

  // Buttons
  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.md,
  },
  nextBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff', 
  },

  // Review
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reviewHeaderText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  reviewLeft: {
    flex: 1,
  },
  reviewLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginBottom: 2,
  },
  reviewValue: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  reviewEditBtn: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewEditText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  securityText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  submitBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff', 
  },

  // Sign In Row
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  signinLink: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default SignupScreen;