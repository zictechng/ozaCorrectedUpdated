import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getFormatedDate } from 'react-native-modern-datepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

// ── Section Header ────────────────────────────────
const SectionHeader = ({ icon, title, colors }) => (
  <View style={[styles.sectionHeader, { borderBottomColor: colors.dividerColor }]}>
    <View style={[styles.sectionIconBox, { backgroundColor: colors.bgLight }]}>
      <Ionicons name={icon} size={18} color={colors.primaryColor1} />
    </View>
    <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>{title}</Text>
  </View>
);

// ── Form Input ────────────────────────────────────
const FormInput = ({
  icon, placeholder, value, onChangeText,
  keyboardType, maxLength, colors, focused, onFocus, onBlur,
  autoCapitalize, autoCorrect,
}) => (
  <View style={[
    styles.inputContainer,
    {
      borderColor: focused ? colors.primaryColor1 : colors.dividerColor,
      backgroundColor: focused ? colors.primaryColor1 + '10' : colors.bgLight,
    },
  ]}>
    <Ionicons
      name={icon}
      size={20}
      color={focused ? colors.primaryColor1 : colors.textSecColor}
      style={styles.inputIcon}
    />
    <TextInput
      style={[styles.inputField, { color: colors.textBlack }]}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecColor2}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize || 'sentences'}
      autoCorrect={autoCorrect !== false}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
);

// ── Gender Selector ───────────────────────────────
const GenderSelector = ({ selected, onSelect, colors }) => (
  <View style={styles.genderRow}>
    {['Male', 'Female', 'Other'].map((g) => (
      <TouchableOpacity
        key={g}
        style={[
          styles.genderBtn,
          {
            borderColor: selected === g ? colors.primaryColor1 : colors.dividerColor,
            backgroundColor: selected === g ? colors.primaryColor1 + '15' : colors.bgLight,
          },
        ]}
        onPress={() => onSelect(g)}
        activeOpacity={0.8}>
        <Ionicons
          name={selected === g ? 'checkmark-circle' : 'ellipse-outline'}
          size={18}
          color={selected === g ? colors.primaryColor1 : colors.textSecColor}
        />
        <Text style={[
          styles.genderBtnText,
          { color: selected === g ? colors.primaryColor1 : colors.textSecColor },
        ]}>
          {g}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ── Main Screen ───────────────────────────────────
const CompleteSignupScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userInfo, setUserInfo, userToken } = useContext(AuthContext);

  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    state: '',
    address: '',
    acct_name: '',
    acct_number: '',
    bank_name: '',
    paypal_address: '',
    payoneer_address: '',
    btc_address: '',
  });

  const [focused, setFocused] = useState({});

  const handleFocus = (field) => setFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFocused(prev => ({ ...prev, [field]: false }));
  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // ── Redirect if already complete ──────────────
  useEffect(() => {
    if (isFocused && userInfo?.userData?.reg_stage2 === 'Yes') {
      navigation.navigate('Home');
    }
  }, [isFocused]);

  // ── Validate ──────────────────────────────────
  const validate = () => {
    if (!gender) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Gender Required', textBody: 'Please select your gender.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!dob) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Date of Birth Required', textBody: 'Please select your date of birth.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!form.state.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'State Required', textBody: 'Please enter your state or city.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!form.address.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Address Required', textBody: 'Please enter your home address.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!form.acct_name.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Account Name Required', textBody: 'Please enter your bank account name.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!form.acct_number || form.acct_number.length < 10) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Invalid Account Number', textBody: 'Please enter a valid 10-digit bank account number.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!form.bank_name.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Bank Name Required', textBody: 'Please enter your bank name.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────
  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await client.post(
        '/api/complete_registration',
        {
          sex: gender,
          dob,
          state: form.state.trim(),
          address: form.address.trim(),
          bank_name: form.bank_name.trim(),
          acct_name: form.acct_name.trim(),
          acct_number: form.acct_number.trim(),
          btc_address: form.btc_address.trim(),
          payoneer_address: form.payoneer_address.trim(),
          paypal_address: form.paypal_address.trim(),
          userId: userInfo?.userData?._id,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '201') {
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Profile Updated!', textBody: 'Your details have been saved successfully.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUserInfo(res.data);
        navigation.navigate('UploadProfile_image');
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Network Error', textBody: 'Could not connect. Please check your internet connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsLoading(false);
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
                onPress={() => navigation.navigate('SignupSteps')}>
                <Ionicons name="close" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                Complete Profile
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
                <Ionicons name="person-add-outline" size={28} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Complete Your Profile</Text>
                <Text style={styles.heroDesc}>
                  Fill in your details to unlock full access. All information is encrypted and stored securely.
                </Text>
              </View>
            </LinearGradient>

            {/* ── Personal Info ─────────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <SectionHeader icon="person-outline" title="Personal Information" colors={colors} />

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Gender</Text>
                <GenderSelector selected={gender} onSelect={setGender} colors={colors} />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Date of Birth</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, {
                    borderColor: dob ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: dob ? colors.primaryColor1 + '10' : colors.bgLight,
                  }]}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.8}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={dob ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <Text style={[
                    styles.inputField,
                    { color: dob ? colors.textBlack : colors.textSecColor2, lineHeight: 56 },
                  ]}>
                    {dob || 'Select your date of birth'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecColor} />
                </TouchableOpacity>
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>State / City</Text>
                <FormInput
                  icon="business-outline"
                  placeholder="e.g. Lagos, Abuja..."
                  value={form.state}
                  onChangeText={(v) => handleChange('state', v)}
                  maxLength={100}
                  colors={colors}
                  focused={focused.state}
                  onFocus={() => handleFocus('state')}
                  onBlur={() => handleBlur('state')}
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Home Address</Text>
                <FormInput
                  icon="location-outline"
                  placeholder="Enter your current home address"
                  value={form.address}
                  onChangeText={(v) => handleChange('address', v)}
                  maxLength={200}
                  colors={colors}
                  focused={focused.address}
                  onFocus={() => handleFocus('address')}
                  onBlur={() => handleBlur('address')}
                />
              </View>
            </View>

            {/* ── Bank Information ──────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <SectionHeader icon="business-outline" title="Bank Information" colors={colors} />

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Account Name</Text>
                <FormInput
                  icon="person-outline"
                  placeholder="Name on your bank account"
                  value={form.acct_name}
                  onChangeText={(v) => handleChange('acct_name', v)}
                  maxLength={150}
                  colors={colors}
                  focused={focused.acct_name}
                  onFocus={() => handleFocus('acct_name')}
                  onBlur={() => handleBlur('acct_name')}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Account Number</Text>
                <FormInput
                  icon="card-outline"
                  placeholder="10-digit account number"
                  value={form.acct_number}
                  onChangeText={(v) => handleChange('acct_number', v.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={10}
                  colors={colors}
                  focused={focused.acct_number}
                  onFocus={() => handleFocus('acct_number')}
                  onBlur={() => handleBlur('acct_number')}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Bank Name</Text>
                <FormInput
                  icon="business-outline"
                  placeholder="e.g. GTBank, First Bank, Opay..."
                  value={form.bank_name}
                  onChangeText={(v) => handleChange('bank_name', v)}
                  maxLength={100}
                  colors={colors}
                  focused={focused.bank_name}
                  onFocus={() => handleFocus('bank_name')}
                  onBlur={() => handleBlur('bank_name')}
                />
              </View>
            </View>

            {/* ── Wallet Addresses ──────────────── */}
            <View style={[styles.formCard, { backgroundColor: colors.bgCard }]}>
              <SectionHeader icon="wallet-outline" title="Wallet Addresses (Optional)" colors={colors} />
              <Text style={[styles.walletDesc, { color: colors.textSecColor }]}>
                Add your digital wallet addresses to receive funds directly when selling assets.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>PayPal Email</Text>
                <FormInput
                  icon="mail-outline"
                  placeholder="Your PayPal email address"
                  value={form.paypal_address}
                  onChangeText={(v) => handleChange('paypal_address', v)}
                  keyboardType="email-address"
                  maxLength={100}
                  colors={colors}
                  focused={focused.paypal}
                  onFocus={() => handleFocus('paypal')}
                  onBlur={() => handleBlur('paypal')}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Payoneer Email</Text>
                <FormInput
                  icon="mail-outline"
                  placeholder="Your Payoneer email address"
                  value={form.payoneer_address}
                  onChangeText={(v) => handleChange('payoneer_address', v)}
                  keyboardType="email-address"
                  maxLength={100}
                  colors={colors}
                  focused={focused.payoneer}
                  onFocus={() => handleFocus('payoneer')}
                  onBlur={() => handleBlur('payoneer')}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>Bitcoin Address</Text>
                <FormInput
                  icon="logo-bitcoin"
                  placeholder="Your Bitcoin wallet address"
                  value={form.btc_address}
                  onChangeText={(v) => handleChange('btc_address', v)}
                  maxLength={100}
                  colors={colors}
                  focused={focused.btc}
                  onFocus={() => handleFocus('btc')}
                  onBlur={() => handleBlur('btc')}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* ── Notice ────────────────────────── */}
            <View style={[styles.notice, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.successColor} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                All your information is encrypted and stored securely. We never share your data with third parties.
              </Text>
            </View>

            {/* ── Submit Button ─────────────────── */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primaryColor1 },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#fff" size={22} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                  <Text style={styles.submitBtnText}>Save & Continue</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterBtn}
              onPress={() => navigation.navigate('Home')}
              disabled={isLoading}>
              <Text style={[styles.laterBtnText, { color: colors.textSecColor }]}>
                Maybe Later
              </Text>
            </TouchableOpacity>

            {/* Date Picker */}
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              maximumDate={new Date()}
              minimumDate={new Date(1970, 0, 1)}
              onConfirm={(date) => {
                setDob(getFormatedDate(date, 'DD/MM/YYYY'));
                setDatePickerVisible(false);
              }}
              onCancel={() => setDatePickerVisible(false)}
            />

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
  formCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.sm,
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
    fontFamily: '_regular',
    fontSize: typography.base,
    paddingVertical: 0,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  genderBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  walletDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  noticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    flex: 1,
  },
  submitBtn: {
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
  submitBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  laterBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xl,
  },
  laterBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default CompleteSignupScreen;