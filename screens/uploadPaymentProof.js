import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Image, Alert, TextInput,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

const UploadPaymentProof = ({ route, navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const trackId = route.params?.track_id;

  const [selectedImage, setSelectedImage] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [bankFocused, setBankFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);

  // ── Pick from gallery ─────────────────────────
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.', [{ text: 'OK' }]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Gallery error:', error.message);
    }
  };

  // ── Take photo ────────────────────────────────
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access.', [{ text: 'OK' }]);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error.message);
    }
  };

  // ── Upload proof ──────────────────────────────
  const handleUpload = async () => {
    Keyboard.dismiss();
    if (!selectedImage) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Proof Selected', textBody: 'Please upload a screenshot or photo of your payment receipt.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!senderName.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Sender Name Required', textBody: 'Please enter the name on the sending account.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!senderBank.trim()) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Bank Name Required', textBody: 'Please enter the name of the bank you sent from.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = selectedImage.uri.split('/').pop();
      const ext = filename.split('.').pop()?.toLowerCase();
      formData.append('payment_proof', {
        uri: selectedImage.uri,
        name: filename,
        type: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png',
      });
      formData.append('track_id', trackId);
      formData.append('sender_name', senderName.trim());
      formData.append('sender_bank', senderBank.trim());
      formData.append('note', note.trim());
      formData.append('userId', userInfo?.userData?._id);

      const res = await client.post(
        '/api/uploadPaymentProof_mobile',
        formData,
        {
          headers: {
            'Authorization': 'Bearer ' + userToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.msg === '200') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Proof Submitted!',
          textBody: 'Your payment proof has been submitted. We will verify and credit your wallet within 30 minutes to 24 hours.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.replace('Home'),
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Upload Failed', textBody: res.data.message || 'Could not upload proof. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Something went wrong. Please check your connection.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsUploading(false);
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
                onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
                Payment Proof
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
                <Ionicons name="receipt-outline" size={28} color={colors.primaryColor1} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Upload Payment Proof</Text>
                <Text style={styles.heroDesc}>
                  Upload your bank receipt or transfer screenshot to confirm your payment and get your wallet credited.
                </Text>
              </View>
            </LinearGradient>

            {/* ── Track ID Card ─────────────────── */}
            {trackId && (
              <View style={[styles.trackCard, {
                backgroundColor: colors.bgCard,
                borderColor: colors.dividerColor,
              }]}>
                <View style={[styles.trackIconBox, { backgroundColor: colors.bgLight }]}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.primaryColor1} />
                </View>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackLabel, { color: colors.textSecColor }]}>
                    Transaction Reference
                  </Text>
                  <Text style={[styles.trackValue, { color: colors.primaryColor1 }]}>
                    {trackId}
                  </Text>
                </View>
              </View>
            )}

            {/* ── Upload Section ────────────────── */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                Payment Receipt
              </Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecColor }]}>
                Upload a clear screenshot or photo of your bank transfer receipt
              </Text>

              {selectedImage ? (
                <View style={[styles.previewCard, {
                  backgroundColor: colors.bgLight,
                  borderColor: colors.successColor,
                }]}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewOverlay}>
                    <View style={[styles.previewBadge, { backgroundColor: colors.successColor }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.previewBadgeText}>Receipt Selected</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.previewChangeBtn, { backgroundColor: colors.bgCard }]}
                      onPress={() => setSelectedImage(null)}>
                      <Ionicons name="refresh-outline" size={16} color={colors.primaryColor1} />
                      <Text style={[styles.previewChangeBtnText, { color: colors.primaryColor1 }]}>
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadRow}>
                  <TouchableOpacity
                    style={[styles.uploadBtn, {
                      backgroundColor: colors.bgLight,
                      borderColor: colors.dividerColor,
                    }]}
                    onPress={pickFromGallery}
                    activeOpacity={0.85}>
                    <Ionicons name="images-outline" size={26} color={colors.primaryColor1} />
                    <Text style={[styles.uploadBtnTitle, { color: colors.textBlack }]}>Gallery</Text>
                    <Text style={[styles.uploadBtnSub, { color: colors.textSecColor }]}>
                      Pick screenshot
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.uploadBtn, {
                      backgroundColor: colors.bgLight,
                      borderColor: colors.dividerColor,
                    }]}
                    onPress={takePhoto}
                    activeOpacity={0.85}>
                    <Ionicons name="camera-outline" size={26} color={colors.successColor} />
                    <Text style={[styles.uploadBtnTitle, { color: colors.textBlack }]}>Camera</Text>
                    <Text style={[styles.uploadBtnSub, { color: colors.textSecColor }]}>
                      Take photo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Payment Details Form ──────────── */}
            <View style={[styles.sectionCard, { backgroundColor: colors.bgCard }]}>
              <Text style={[styles.sectionTitle, { color: colors.textBlack }]}>
                Payment Details
              </Text>
              <Text style={[styles.sectionDesc, { color: colors.textSecColor }]}>
                Provide details of the account you sent the payment from
              </Text>

              {/* Sender Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Sender Account Name
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: nameFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: nameFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={nameFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="Enter name on sending account"
                    placeholderTextColor={colors.textSecColor2}
                    value={senderName}
                    onChangeText={setSenderName}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>
                <Text style={[styles.inputHint, { color: colors.textSecColor }]}>
                  Must match the name on your bank account
                </Text>
              </View>

              {/* Sender Bank */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Sending Bank Name
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    borderColor: bankFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: bankFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={bankFocused ? colors.primaryColor1 : colors.textSecColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.inputField, { color: colors.textBlack }]}
                    placeholder="e.g. GTBank, First Bank, Opay..."
                    placeholderTextColor={colors.textSecColor2}
                    value={senderBank}
                    onChangeText={setSenderBank}
                    autoCapitalize="words"
                    onFocus={() => setBankFocused(true)}
                    onBlur={() => setBankFocused(false)}
                  />
                </View>
              </View>

              {/* Note */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecColor }]}>
                  Additional Note <Text style={{ color: colors.textSecColor }}>(Optional)</Text>
                </Text>
                <View style={[
                  styles.noteContainer,
                  {
                    borderColor: noteFocused ? colors.primaryColor1 : colors.dividerColor,
                    backgroundColor: noteFocused ? colors.primaryColor1 + '10' : colors.bgLight,
                  },
                ]}>
                  <TextInput
                    style={[styles.noteField, { color: colors.textBlack }]}
                    placeholder="Any additional information about your payment..."
                    placeholderTextColor={colors.textSecColor2}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    maxLength={300}
                    onFocus={() => setNoteFocused(true)}
                    onBlur={() => setNoteFocused(false)}
                  />
                </View>
              </View>
            </View>

            {/* ── Notice Card ───────────────────── */}
            <View style={[styles.noticeCard, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
              <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
                Your wallet will be credited within 30 minutes to 24 hours after verification. Keep your transaction reference number for follow-up.
              </Text>
            </View>

            {/* ── Submit Button ─────────────────── */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primaryColor1 },
                (!selectedImage || !senderName || !senderBank || isUploading) && { opacity: 0.6 },
              ]}
              onPress={handleUpload}
              disabled={!selectedImage || !senderName || !senderBank || isUploading}
              activeOpacity={0.85}>
              {isUploading ? (
                <ActivityIndicator color="#fff" size={22} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Payment Proof</Text>
                </>
              )}
            </TouchableOpacity>

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
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
    ...shadows.card,
  },
  trackIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: { flex: 1 },
  trackLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  trackValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  uploadBtnTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  uploadBtnSub: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  previewCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  previewBadgeText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
  },
  previewChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
    ...shadows.sm,
  },
  previewChangeBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  inputGroup: { marginBottom: spacing.lg },
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
  inputIcon: { marginRight: spacing.sm },
  inputField: {
    flex: 1,
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    paddingVertical: 0,
  },
  inputHint: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  noteContainer: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 90,
  },
  noteField: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
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
    gap: spacing.sm,
    ...shadows.md,
  },
  submitBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
});

export default UploadPaymentProof;