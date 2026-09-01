import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Platform, StatusBar, ActivityIndicator,
  ToastAndroid, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import RBSheet from 'react-native-raw-bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import {
  LogoutModal,
  send2FANotification,
  sendEmailNotification,
  sendInAppNotification,
} from '../components/controls';
import MenuItem from '../components/MenuItem';
import SectionCard from '../components/SectionCard';
import InfoRow from '../components/InfoRow';
import SettingToggleRow from '../components/SettingToggleRow';
import client from '../contextAPI/client';

const SettingScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { S, colors, isDark, toggleTheme } = useThemeStyles();
  const { logoutAction, userToken, userInfo, setUserInfo, appSettingDetails } =
    useContext(AuthContext);

  const refBankSheet = useRef();

  const [userBankInfo, setUserBankInfo] = useState({});
  const [noRecord, setNoRecord] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [isInAppMode, setIsInAppMode] = useState(false);
  const [f2AMode, setF2Mode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [acctPinLoading, setAcctPinLoading] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinSecure, setPinSecure] = useState(true);

  const myId = userInfo?.userData?._id;

  const RefreshUserDetails = useCallback(async () => {
    try {
      const res = await client.get('/api/userProfileMobile/' + myId);
      if (res.data.msg === '200') {
        AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUserInfo(res.data);
        setIsEmailEnabled(res.data.userData.receive_email_notification);
        setF2Mode(res.data.userData.activate_2fa_login);
        setIsInAppMode(res.data.userData.receive_app_message);
      }
    } catch (error) {
      console.log('Refresh error:', error.message);
    }
  }, [myId]);

  const getUserBankDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(`api/user_bankDetails/${myId}`, {
        headers: { 'Authorization': 'Bearer ' + userToken },
      });
      if (res.data.msg === '200') {
        setUserBankInfo(res.data.bankDetail);
      } else if (res.data.status === '404') {
        setNoRecord(true);
      }
    } catch (error) {
      console.log('Bank details error:', error.message);
    } finally {
      setLoading(false);
    }
  }, [myId, userToken]);

  useEffect(() => {
    RefreshUserDetails();
    getUserBankDetails();
    setIsEmailEnabled(userInfo?.userData?.receive_email_notification || false);
    setF2Mode(userInfo?.userData?.activate_2fa_login || false);
    setIsInAppMode(userInfo?.userData?.receive_app_message || false);
  }, [isFocused]);

  const toggleEmail = (value) => {
    setIsEmailEnabled(value);
    sendEmailNotification(myId, value, userToken);
  };

  const toggle2FA = (value) => {
    setF2Mode(value);
    send2FANotification(myId, value, userToken);
  };

  const toggleInApp = (value) => {
    setIsInAppMode(value);
    sendInAppNotification(myId, value, userToken);
  };

  const resetPinAction = async () => {
    if (!pinValue || pinValue.length === 0) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Please enter a PIN to continue.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    try {
      setAcctPinLoading(true);
      const res = await client.post(
        '/api/updateUser_AccountPinMobile',
        { pin: pinValue, userEmail: userInfo?.userData?.email, userId: myId },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '201') {
        setPinValue('');
        setShowPinModal(false);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Transaction PIN updated successfully!',
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: res.data.message || 'Could not update PIN.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: error.message === 'Network Error'
          ? 'No internet connection.'
          : 'Something went wrong.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
    } finally {
      setAcctPinLoading(false);
    }
  };

  const blockMyAccount = async () => {
    try {
      const res = await client.post(
        '/api/block_AccountMobile',
        { uid: myId },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );
      if (res.data.msg === '200') {
        logoutAction();
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Failed',
          textBody: 'Could not block account. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      console.log('Block account error:', error.message);
    }
  };

  const confirmBlockAccount = () => {
    Alert.alert(
      'Block Account',
      'Are you sure you want to block your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block', style: 'destructive', onPress: blockMyAccount },
      ]
    );
  };

  const copyCustomerId = async () => {
    await Clipboard.setStringAsync(userInfo?.userData?.tag_id || '');
    if (Platform.OS === 'android') {
      ToastAndroid.show('Customer ID copied!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied!', 'Customer ID copied to clipboard');
    }
  };

  const signMeOut = () => {
    logoutAction();
    setShowLogoutModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Settings
        </Text>
        <View style={[styles.headerBtn, { opacity: 0 }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Account Overview Card */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}>
          <View style={styles.overviewCircle} />
          <View style={styles.overviewRow}>
            <View style={styles.overviewAvatar}>
              <Text style={styles.overviewInitial}>
                {userInfo?.userData?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewName}>
                {userInfo?.userData?.display_name}
              </Text>
              <Text style={styles.overviewEmail}>
                {userInfo?.userData?.email}
              </Text>
            </View>
          </View>
          <View style={styles.overviewTagRow}>
            <View style={styles.overviewTagBox}>
              <Text style={styles.overviewTagLabel}>Customer ID</Text>
              <Text style={styles.overviewTagValue}>
                {userInfo?.userData?.tag_id}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.overviewCopyBtn}
              onPress={copyCustomerId}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
              <Text style={styles.overviewCopyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Account */}
        <SectionCard title="Account">
          <MenuItem
            icon="person-circle-outline"
            label="My Profile"
            subtitle="View and edit your personal information"
            iconBg="#EEF2FF"
            iconColor={colors.primaryColor1}
            onPress={() => navigation.navigate('profile')}
          />
          <MenuItem
            icon="card-outline"
            label="Bank Details"
            subtitle="Manage your linked bank account"
            iconBg="#F0FDF4"
            iconColor={colors.successColor}
            onPress={() => navigation.navigate('BankDetails')}
          />
          <MenuItem
            icon="wallet-outline"
            label="My Wallet"
            subtitle="View balances and fund transactions"
            iconBg="#FFF3CD"
            iconColor={colors.accentGold}
            onPress={() => navigation.navigate('Wallet')}
          />
          <MenuItem
            icon="documents-outline"
            label="KYC Documents"
            subtitle="Upload identity verification documents"
            iconBg="#ECFDF5"
            iconColor={colors.successColor}
            onPress={() => navigation.navigate('DocumentView')}
          />
          <MenuItem
            icon="eye-outline"
            label="Account Details"
            subtitle="View your bank and account information"
            iconBg={colors.bgLight}
            iconColor={colors.primaryColor1}
            onPress={() => refBankSheet.current.open()}
          />
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security">
          <SettingToggleRow
            icon="mail-outline"
            iconBg="#EEF2FF"
            iconColor={colors.primaryColor1}
            label="Email Notifications"
            subtitle="Receive transaction alerts via email"
            value={isEmailEnabled}
            onValueChange={toggleEmail}
          />
          <SettingToggleRow
            icon="shield-checkmark-outline"
            iconBg="#F0FDF4"
            iconColor={colors.successColor}
            label="Two-Factor Authentication"
            subtitle="Add extra security to your login"
            value={f2AMode}
            onValueChange={toggle2FA}
          />
          <SettingToggleRow
            icon="notifications-outline"
            iconBg="#FFF3CD"
            iconColor={colors.accentGold}
            label="In-App Notifications"
            subtitle="Receive notifications within the app"
            value={isInAppMode}
            onValueChange={toggleInApp}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Reset Password"
            subtitle="Change your account login password"
            iconBg="#FEE2E2"
            iconColor={colors.dangerColor}
            onPress={() => navigation.navigate('ResetPassword')}
          />
          <MenuItem
            icon="keypad-outline"
            label="Transaction PIN"
            subtitle="Set or update your 4-digit transaction PIN"
            iconBg="#FFEDD5"
            iconColor={colors.warningColor}
            onPress={() => setShowPinModal(true)}
          />
        </SectionCard>

        {/* Display */}
        <SectionCard title="Display">
          <SettingToggleRow
            icon={isDark ? 'moon' : 'sunny-outline'}
            iconBg={isDark ? '#1E1B4B' : '#FFF3CD'}
            iconColor={isDark ? '#818CF8' : '#F59E0B'}
            label="Dark Mode"
            subtitle={isDark
              ? 'Dark theme is currently active'
              : 'Light theme is currently active'}
            value={isDark}
            onValueChange={toggleTheme}
          />
        </SectionCard>

        {/* Support */}
        <SectionCard title="Support & Information">
          <MenuItem
            icon="headset-outline"
            label="Help & Support"
            subtitle="Contact our support team"
            iconBg="#ECFDF5"
            iconColor={colors.successColor}
            onPress={() => navigation.navigate('contacts')}
          />
          <MenuItem
            icon="people-outline"
            label="About Us"
            subtitle="Learn more about OtaMobile"
            iconBg={colors.bgLight}
            iconColor={colors.primaryColor1}
            onPress={() => navigation.navigate('About')}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy Policy"
            subtitle="Read our privacy policy"
            iconBg={colors.bgLight}
            iconColor={colors.textSecColor}
            onPress={() => navigation.navigate('Privacy_Policy')}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Conditions"
            subtitle="Read our terms of service"
            iconBg={colors.bgLight}
            iconColor={colors.textSecColor}
            onPress={() => navigation.navigate('Terms_Conditions')}
          />
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Danger Zone">
          <MenuItem
            icon="ban-outline"
            label="Block Account"
            subtitle="Temporarily disable your account access"
            iconBg="#FEE2E2"
            iconColor={colors.dangerColor}
            onPress={confirmBlockAccount}
          />
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, {
            borderColor: colors.dangerColor,
            backgroundColor: colors.lightRed,
          }]}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.85}>
          <Ionicons
            name="log-out-outline"
            size={22}
            color={colors.dangerColor}
            style={{ marginRight: spacing.sm }}
          />
          <Text style={[styles.logoutBtnText, { color: colors.dangerColor }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecColor }]}>
            {appSettingDetails?.app_name} • v{appSettingDetails?.app_version || '2.0.1'}
          </Text>
          <Text style={[styles.appCopyright, { color: colors.textSecColor2 }]}>
            © 2026 OtaMobile. All rights reserved.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        isVisible={showPinModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={400}
        backdropOpacity={0.6}
        onBackdropPress={() => setShowPinModal(false)}>
        <View style={[styles.pinModal, { backgroundColor: colors.bgCard }]}>
          <LinearGradient
            colors={[colors.primaryColor1, colors.primaryColor1b]}
            style={styles.pinModalHeader}>
            <Text style={styles.pinModalTitle}>Update Transaction PIN</Text>
            <TouchableOpacity
              style={styles.pinModalClose}
              onPress={() => setShowPinModal(false)}>
              <Ionicons name="close" size={20} color={colors.primaryColor1} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={[styles.pinNotice, {
            backgroundColor: '#EEF2FF',
            borderColor: '#C7D2FE',
          }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={colors.primaryColor1}
            />
            <Text style={[styles.pinNoticeText, { color: colors.primaryColor1 }]}>
              Your PIN is used to authorize all transactions.
              Keep it secret and never share it with anyone.
            </Text>
          </View>

          <View style={styles.pinInputWrapper}>
            <Text style={[styles.pinInputLabel, { color: colors.textSecColor }]}>
              New Transaction PIN
            </Text>
            <View style={[styles.pinInputContainer, {
              borderColor: colors.dividerColor,
              backgroundColor: colors.bgColor,
            }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={[styles.pinInput, { color: colors.textBlack }]}
                placeholder="Enter new PIN"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={pinSecure}
                autoCorrect={false}
                keyboardType="numeric"
                maxLength={6}
                value={pinValue}
                onChangeText={setPinValue}
              />
              <TouchableOpacity onPress={() => setPinSecure(!pinSecure)}>
                <Feather
                  name={pinSecure ? 'eye-off' : 'eye'}
                  color="#9CA3AF"
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pinModalActions}>
            <TouchableOpacity
              style={[styles.pinCancelBtn, { borderColor: colors.dividerColor }]}
              onPress={() => { setPinValue(''); setShowPinModal(false); }}>
              <Text style={[styles.pinCancelBtnText, { color: colors.textSecColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pinSaveBtn,
                { backgroundColor: colors.primaryColor1 },
                (!pinValue || acctPinLoading) && { opacity: 0.6 },
              ]}
              onPress={resetPinAction}
              disabled={!pinValue || acctPinLoading}>
              {acctPinLoading ? (
                <ActivityIndicator color="#fff" size={20} />
              ) : (
                <Text style={styles.pinSaveBtnText}>Update PIN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <LogoutModal
        openModal={showLogoutModal}
        modalTitle="Sign Out"
        ModalDesc="Are you sure you want to sign out?"
        closeBtn={() => setShowLogoutModal(false)}
        logoutBtn={signMeOut}
        bntYesText="Sign Out"
      />

      {/* Bank Details Bottom Sheet */}
      <RBSheet
        ref={refBankSheet}
        closeOnDragDown
        closeOnPressMask
        openDuration={400}
        closeDuration={300}
        height={380}
        closeOnPressBack
        customStyles={{
          container: {
            backgroundColor: colors.bgColor,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
          draggableIcon: { backgroundColor: colors.dividerColor },
        }}>
        <View style={styles.bankSheet}>
          <Text style={[styles.bankSheetTitle, { color: colors.textBlack }]}>
            Account Details
          </Text>
          <Text style={[styles.bankSheetSubtitle, { color: colors.textSecColor }]}>
            Your linked bank and account information
          </Text>
          <View style={[styles.bankSheetDivider, {
            backgroundColor: colors.dividerColor,
          }]} />
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primaryColor1}
              style={{ marginTop: spacing.xl }}
            />
          ) : noRecord ? (
            <View style={styles.bankSheetEmpty}>
              <Ionicons name="card-outline" size={40} color={colors.textSecColor2} />
              <Text style={[styles.bankSheetEmptyText, { color: colors.textSecColor }]}>
                No bank details found.
              </Text>
              <TouchableOpacity
                style={[styles.bankSheetAddBtn, { backgroundColor: colors.primaryColor1 }]}
                onPress={() => {
                  refBankSheet.current.close();
                  navigation.navigate('BankDetails');
                }}>
                <Text style={styles.bankSheetAddBtnText}>Add Bank Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <InfoRow
                icon="person-outline"
                label="Account Name"
                value={userBankInfo?.bank_acct_name}
              />
              <InfoRow
                icon="card-outline"
                label="Account Number"
                value={userBankInfo?.bank_acct_number}
              />
              <InfoRow
                icon="business-outline"
                label="Bank Name"
                value={userBankInfo?.bank_name}
              />
              <InfoRow
                icon="keypad-outline"
                label="Account PIN"
                value={userInfo?.userData?.acct_cot_pin ? '••••' : 'Not set'}
              />
              <InfoRow
                icon="pricetag-outline"
                label="Tag ID"
                value={userInfo?.userData?.tag_id}
              />
            </ScrollView>
          )}
        </View>
      </RBSheet>
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  overviewCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  overviewAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  overviewInitial: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    color: '#fff',
  },
  overviewInfo: {
    flex: 1,
  },
  overviewName: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
    lineHeight: 22,
  },
  overviewEmail: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    marginTop: 2,
  },
  overviewTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  overviewTagBox: {
    flex: 1,
  },
  overviewTagLabel: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
  overviewTagValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
    letterSpacing: 1,
  },
  overviewCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  overviewCopyText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    color: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1.5,
  },
  logoutBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  appVersion: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  appCopyright: {
    fontFamily: '_regular',
    fontSize: typography.xs,
    marginTop: 4,
    lineHeight: 16,
  },
  pinModal: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  pinModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  pinModalTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
    flex: 1,
  },
  pinModalClose: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  pinNoticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },
  pinInputWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  pinInputLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  pinInput: {
    flex: 1,
    fontFamily: '_semiBold',
    fontSize: typography.xl,
    paddingVertical: 0,
    letterSpacing: 4,
  },
  pinModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: 0,
  },
  pinCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  pinCancelBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
  },
  pinSaveBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  pinSaveBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },
  bankSheet: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  bankSheetTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 4,
  },
  bankSheetSubtitle: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  bankSheetDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  bankSheetEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  bankSheetEmptyText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  bankSheetAddBtn: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  bankSheetAddBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },
});

export default SettingScreen;