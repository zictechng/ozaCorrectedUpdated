import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Collapsible from 'react-native-collapsible';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import client from '../contextAPI/client';
import CheckPhotoType from '../components/checkPhotoType';
import Verify2faImageSample from '../components/verif2faImageSample';
import sampleSelfieImage from '../assets/images/2fa_sample.png';
import { CLOUDINARY_ACCOUNT_NAME, CLOUDINARY_PRESET_NAME } from '@env';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { noticeData } from '../components/errorNotice';
import LoaderIndicator from '../components/loaderIndicator';

const MAX_FILE_SIZE_MB = 5;

// ── Collapsible Info Section ──────────────────────
const InfoSection = ({ title, children, colors, isDark }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <TouchableOpacity
      style={[
        styles.infoSection,
        {
          backgroundColor: colors.bgCard,
          borderColor: isDark ? colors.dividerColor : '#F3F4F6',
        },
      ]}
      onPress={() => setCollapsed(!collapsed)}
      activeOpacity={0.85}>
      <View style={styles.infoSectionHeader}>
        <Text style={[styles.infoSectionTitle, { color: colors.textBlack }]}>
          {title}
        </Text>
        <View style={[styles.chevronBox, { backgroundColor: colors.bgLight }]}>
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={colors.primaryColor1}
          />
        </View>
      </View>
      <Collapsible collapsed={collapsed}>
        <View style={styles.infoSectionBody}>
          {children}
        </View>
      </Collapsible>
    </TouchableOpacity>
  );
};

// ── Bullet Item ───────────────────────────────────
const BulletItem = ({ text, color, colors }) => (
  <View style={styles.bulletRow}>
    <View style={[styles.bulletDot, { backgroundColor: color || colors.primaryColor1 }]} />
    <Text style={[styles.bulletText, { color: colors.textSecColor }]}>{text}</Text>
  </View>
);

// ── Main Screen ───────────────────────────────────
const Verify2faAccountScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useThemeStyles();
  const { userInfo, setUserInfo, userToken, setCompleteRegData } = useContext(AuthContext);

  let newPhoto = route.params?.userPhoto;
  let myId = userInfo.userData._id;

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading2fa, setLoading2FA] = useState(false);
  const [isDisableBtn, setIsDisableBtn] = useState(false);
  const [otpSend, setOtpSend] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [imageValue, setImageValue] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      const processPhoto = async () => {
        if (newPhoto) {
          const resizedUri = await CheckFileSize(newPhoto);
          setImage(resizedUri);
          const type = await CheckPhotoType(resizedUri);
          setDocumentType(type);
          if (userInfo?.userData.reg_stage5 === 'Yes') {
            navigation.navigate('Home');
          }
        }
      };
      processPhoto();
    }
  }, [isFocused, navigation, newPhoto]);

  const CheckFileSize = async (uri) => {
    try {
      let file = new File(uri);
      let info = await file.info({ size: true });
      if (!info.exists) return uri;
      if (info.size <= MAX_FILE_SIZE_MB * 1024 * 1024) return uri;
      let resizedImage = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 500 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      file = new File(resizedImage.uri);
      info = await file.info({ size: true });
      while (info.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        resizedImage = await ImageManipulator.manipulateAsync(
          resizedImage.uri,
          [{ resize: { width: resizedImage.width * 0.8 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        file = new File(resizedImage.uri);
        info = await file.info({ size: true });
      }
      return resizedImage.uri;
    } catch (error) {
      return uri;
    }
  };

  const FetchLocalStorage = async () => {
    try {
      let info = await AsyncStorage.getItem('userInfo');
      info = JSON.parse(info);
      if (info) setUserInfo(info);
    } catch (error) {
      console.log('Fetch local storage error', error);
    }
  };

  const sendOTPCode = async () => {
    if (!userInfo.userData.email) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please login to get started', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    try {
      setLoading2FA(true);
      setIsDisableBtn(true);
      const res = await client.post('/api/user_2fa_otpSend', { userId: userInfo.userData._id }, {
        headers: { Authorization: 'Bearer ' + userToken },
      });
      if (res.data.msg === '201') {
        FetchLocalStorage();
        setOtpSend(true);
        setCompleteRegData(false);
        navigation.navigate('OpeCamera');
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading2FA(false);
      setIsDisableBtn(false);
    }
  };

  const deleteImageId = async (data) => {
    try {
      await client.post('/api/deleteUploaded_image', { userId: myId, delete_url: data }, {
        headers: { Authorization: 'Bearer ' + userToken },
      });
    } catch (error) {
      console.log('Delete error', error.message);
    }
  };

  const upload2FADocument = async () => {
    if (!image) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Please take a selfie first', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setLoading(true);
    const newfile = { uri: image, type: `document2FA/${image.split('.')[1]}`, name: `document2FA.${image.split('.')[1]}` };
    const data = new FormData();
    data.append('file', newfile);
    data.append('upload_preset', CLOUDINARY_PRESET_NAME);
    data.append('upload_name', CLOUDINARY_ACCOUNT_NAME);
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/ddm1owlon/image/upload', { method: 'POST', body: data });
      const result = await response.json();
      setImageValue(result.public_id);
      if (result.secure_url) {
        uploadPhotoURL(result.secure_url);
      }
    } catch (error) {
      deleteImageId(imageValue);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotoURL = async (data) => {
    setLoading2(true);
    try {
      const res = await client.post('/api/user_upload2fa',
        { userId: myId, image_url: data, fileType: documentType, public_id: imageValue },
        { headers: { Authorization: 'Bearer ' + userToken } }
      );
      if (res.data.msg === '201') {
        AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        FetchLocalStorage();
        setCompleteRegData(false);
        setImage(null);
        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Success', textBody: 'Verification uploaded successfully', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        navigation.navigate('UploadProofAddress');
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: res.data.message || 'Something went wrong', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
        deleteImageId(imageValue);
      }
    } catch (error) {
      deleteImageId(imageValue);
      console.log('Upload error', error.message);
    } finally {
      setLoading2(false);
    }
  };

  const resetOtpSending = () => {
    setOtpSend(false);
    setImage(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      {(loading || loading2) && (
        <LoaderIndicator
          loader={loading || loading2}
          textInfo={loading2 ? '  Uploading...' : '  Processing...'}
        />
      )}

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.navigate('SignupSteps')}
          activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Ownership Verification
        </Text>
        <View style={[styles.headerBtn, { backgroundColor: 'transparent' }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces>

        {/* ── Hero Banner ────────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.heroTop}>
            <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
              <Ionicons name="shield-checkmark-outline" size={28} color={colors.primaryColor1} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Prove Account Ownership</Text>
              <Text style={styles.heroDesc}>
                A quick selfie confirms you're the person behind this account
              </Text>
            </View>
          </View>

          {/* Step indicator pill */}
          <View style={styles.stepPill}>
            <Ionicons name="camera-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.stepPillText}>Step 5 of 6</Text>
          </View>
        </LinearGradient>

        {/* ── Info notice ───────────────────────── */}
        <View style={[styles.noticeCard, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
          <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
            We'll send a one-time code to your email. Then take a selfie to verify it's really you — takes under a minute.
          </Text>
        </View>

        {/* ── Selfie Card ───────────────────────── */}
        <View style={[
          styles.selfieCard,
          {
            backgroundColor: colors.bgCard,
            borderColor: image
              ? colors.primaryColor1 + '40'
              : isDark ? colors.dividerColor : '#F3F4F6',
          },
        ]}>
          {/* Preview / placeholder */}
          <TouchableOpacity
            style={styles.selfiePreviewArea}
            onPress={() => navigation.navigate('OpeCamera')}
            disabled={!otpSend}
            activeOpacity={0.85}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selfieImage} />
            ) : (
              <View style={[
                styles.selfiePlaceholder,
                {
                  backgroundColor: isDark
                    ? colors.bgLight
                    : colors.primaryColor1 + '08',
                  borderColor: otpSend
                    ? colors.primaryColor1 + '40'
                    : colors.dividerColor,
                },
              ]}>
                <View style={[styles.selfieIconCircle, { backgroundColor: colors.primaryColor1 + '15' }]}>
                  <Ionicons
                    name="camera-outline"
                    size={36}
                    color={otpSend ? colors.primaryColor1 : colors.textSecColor}
                  />
                </View>
                <Text style={[
                  styles.selfiePlaceholderText,
                  { color: otpSend ? colors.primaryColor1 : colors.textSecColor },
                ]}>
                  {otpSend ? 'Tap to take your selfie' : 'Waiting for OTP verification'}
                </Text>
                {!otpSend && (
                  <Text style={[styles.selfiePlaceholderSub, { color: colors.textSecColor }]}>
                    Click "Get Started" below first
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.selfieActions}>
            {loading2fa ? (
              <View style={[styles.actionBtn, { backgroundColor: colors.primaryColor1 + '20' }]}>
                <ActivityIndicator size={18} color={colors.primaryColor1} />
                <Text style={[styles.actionBtnText, { color: colors.primaryColor1 }]}>
                  Sending OTP...
                </Text>
              </View>
            ) : !otpSend ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primaryColor1 }]}
                onPress={sendOTPCode}
                disabled={isDisableBtn}
                activeOpacity={0.85}>
                <Ionicons name="mail-outline" size={18} color="#fff" />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Get Started</Text>
              </TouchableOpacity>
            ) : image ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.bgLight, borderWidth: 1, borderColor: colors.dividerColor }]}
                onPress={() => {
                  setImage(null);
                  navigation.navigate('OpeCamera', { userPhoto: null });
                }}
                activeOpacity={0.85}>
                <Ionicons name="camera-reverse-outline" size={18} color={colors.primaryColor1} />
                <Text style={[styles.actionBtnText, { color: colors.primaryColor1 }]}>Retake Photo</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* OTP resend */}
          {!image && otpSend && (
            <View style={styles.otpResendRow}>
              <Text style={[styles.otpResendText, { color: colors.textSecColor }]}>
                Didn't receive the OTP?{' '}
              </Text>
              <TouchableOpacity onPress={resetOtpSending}>
                <Text style={[styles.otpResendLink, { color: colors.primaryColor1 }]}>
                  Start again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Upload Button ─────────────────────── */}
        {newPhoto && (
          <TouchableOpacity
            style={[styles.uploadBtn, { backgroundColor: colors.primaryColor1 }]}
            onPress={upload2FADocument}
            activeOpacity={0.85}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload Verification</Text>
          </TouchableOpacity>
        )}

        {/* ── Why we ask ───────────────────────── */}
        <InfoSection title="Why do we ask for this?" colors={colors} isDark={isDark}>
          <BulletItem text="To confirm you are the real account holder" colors={colors} />
          <BulletItem text="To secure your account from unauthorised access" colors={colors} />
          <BulletItem text="To remove restrictions and unlock all features" colors={colors} />
          <BulletItem text="To grant access to loans without paperwork" colors={colors} />
          <BulletItem text="To build trust with others on the platform" colors={colors} />
          <BulletItem
            text="Your image is used only for verification — it is not stored permanently."
            color="#EF4444"
            colors={colors}
          />
        </InfoSection>

        {/* ── Tips ─────────────────────────────── */}
        <InfoSection title="Tips for a successful selfie" colors={colors} isDark={isDark}>
          <BulletItem text="Click 'Get Started' and wait for your OTP email" colors={colors} />
          <BulletItem text="Keep the OTP code handy for future reference" colors={colors} />
          <BulletItem text="Align your face clearly within the camera frame" colors={colors} />
          <BulletItem text="Ensure good lighting — avoid shadows and glare" colors={colors} />
          <BulletItem text="Do not upload documents other than a selfie" colors={colors} />
          <BulletItem
            text="Your photo must be in focus, clear, and free of reflections."
            color="#EF4444"
            colors={colors}
          />
        </InfoSection>

        {/* ── Maybe Later ──────────────────────── */}
        <TouchableOpacity
          style={styles.laterBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}>
          <Text style={[styles.laterText, { color: colors.textSecColor }]}>Maybe Later</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Verify2faImageSample
          image={sampleSelfieImage}
          modalVisible={isModalVisible}
          actionButton1={() => setModalVisible(false)}
          actionButton2={() => setModalVisible(false)}
        />

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
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
  headerBtn: {
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
    marginBottom: spacing.md,
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
  heroTop: {
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
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  stepPillText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.9)',
  },

  // Notice Card
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
  },
  noticeText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Selfie Card
  selfieCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  selfiePreviewArea: {
    width: '100%',
  },
  selfieImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  selfiePlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  selfieIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  selfiePlaceholderText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  selfiePlaceholderSub: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 18,
    opacity: 0.7,
  },

  // Action Buttons (inside card)
  selfieActions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.lg,
  },
  actionBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
  },

  // OTP resend
  otpResendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
  otpResendText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
  },
  otpResendLink: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },

  // Upload Button
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    height: 52,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  uploadBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.lg,
    color: '#fff',
  },

  // Collapsible Info Section
  infoSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...shadows.sm,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  infoSectionTitle: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    flex: 1,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSectionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  // Bullet Items
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },

  // Maybe Later
  laterBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  laterText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
  },
});

export default Verify2faAccountScreen;  