import React, { useContext, useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import Checkbox from 'expo-checkbox';
import { KeyboardAvoidingView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gs, spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import IsValidEmail from '../components/checkEmailFormat';
import { _AppSystemSettings } from '../components/controls';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { S, colors, isDark } = useThemeStyles();
  const { loginAction, isBtnLoading, isButtonDisable } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isChecked, setChecked] = useState(false);
  const [checkLoginState, setCheckLoginState] = useState(false);
  const [appDetails, setAppDetails] = useState({});
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const _getAppLocalInfo = async () => {
    AsyncStorage.getItem('AppSettingInfo').then(res => {
      if (res !== null) setAppDetails(JSON.parse(res));
    }).catch(err => console.log(err.message));
  };

  _AppSystemSettings().then((res) => {
    if (res?.app_stop_login_status == false) setCheckLoginState(true);
    else if (res?.app_stop_login_status == true) setCheckLoginState(false);
  });

  useEffect(() => {
    _getAppLocalInfo();
    _AppSystemSettings();
  }, []);

  const UserLogin = () => {
    if (!password || !email) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Please fill in all required fields',
        textBodyStyle: noticeData[0].errorMessageStyle,
        titleStyle: noticeData[0].errorTitleStyle,
      });
      return;
    }
    if (!IsValidEmail(email)) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Please enter a valid email address',
        textBodyStyle: noticeData[0].errorMessageStyle,
        titleStyle: noticeData[0].errorTitleStyle,
      });
      return;
    }
    loginAction(email, password);
  };

  const appName = appDetails.infoData?.app_name || 'your account';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bgColor }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgColor }}>
          {isFocused && (
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              translucent
              backgroundColor="transparent"
            />
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>

            {/* Header Gradient Bar */}
            <LinearGradient
              colors={[colors.primaryColor1, colors.secondaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerBar}
            />

            {/* Logo / Brand Area */}
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="wallet-outline" size={32} color={colors.textColor} />
              </View>
              <Text style={styles.brandName}>
                {appDetails.infoData?.app_name || 'OtaMobile'}
              </Text>
              <Text style={styles.brandTagline}>
                Your trusted financial companion
              </Text>
            </View>

            {/* Login Card */}
             <View style={[styles.card, { backgroundColor: colors.bgCard }]}>

              <Text style={[styles.cardTitle, { color: colors.textBlack }]}>Welcome back</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecColor }]}>
                Sign in to {appName} and continue
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={gs.inputLabel}>Email Address</Text>
                <View style={[
                  gs.inputContainer,
                  emailFocused && gs.inputContainerFocused,
                ]}>
                  <MaterialIcons
                    name="alternate-email"
                    size={20}
                    color={emailFocused ? colors.primaryColor1 : '#9CA3AF'}
                    style={gs.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    style={gs.inputField}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email?.toLowerCase()}
                    onChangeText={text => setEmail(text)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={gs.inputLabel}>Password</Text>
                <View style={[
                  gs.inputContainer,
                  passwordFocused && gs.inputContainerFocused,
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passwordFocused ? colors.primaryColor1 : '#9CA3AF'}
                    style={gs.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    style={gs.inputField}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={text => setPassword(text)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                    style={{ padding: 4 }}>
                    <Feather
                      name={secureTextEntry ? 'eye-off' : 'eye'}
                      color={passwordFocused ? colors.primaryColor1 : '#9CA3AF'}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me + Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setChecked(!isChecked)}>
                  <Checkbox
                    value={isChecked}
                    onValueChange={setChecked}
                    color={isChecked ? colors.primaryColor1 : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.rememberText, { color: colors.textSecColor }]}>Stay signed in</Text>
                </TouchableOpacity>
                <Pressable onPress={() => navigation.navigate('ForgetPassword')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  gs.primaryButton,
                  (isButtonDisable || checkLoginState) && { opacity: 0.6 },
                  { marginTop: spacing.xl },
                ]}
                onPress={UserLogin}
                disabled={isButtonDisable || checkLoginState}
                activeOpacity={0.85}>
                {isBtnLoading ? (
                  <ActivityIndicator color={colors.textColor} size={24} />
                ) : (
                  <Text style={gs.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.dividerColor }]} />
              <Text style={[styles.dividerText, { color: colors.textSecColor }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.dividerColor }]} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupRow}>
                <Text style={[styles.signupPrompt, { color: colors.textSecColor }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signupLink}>Create Account</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* Footer */}
            <Text style={[styles.footerText, { color: colors.textSecColor }]}>
              By signing in, you agree to our{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('TermCondition')}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>
            </Text>

          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  headerBar: {
    height: 5,
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#4C5FD5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brandName: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: 4,
  },
  card: {
    borderRadius: radius.xxl,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: '_regular',
    fontSize: typography.base,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  rememberText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
  },
  forgotText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginHorizontal: spacing.md,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPrompt: {
    fontFamily: '_regular',
    fontSize: typography.base,
  },
  signupLink: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },
  footerText: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    lineHeight: 18,
  },
  footerLink: {
    fontFamily: '_semiBold',
  },
});

export default LoginScreen;