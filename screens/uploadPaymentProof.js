import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Image, Alert, Platform,
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

// Cloudinary config from .env
const CLOUDINARY_CLOUD_NAME  = process.env.CLOUDINARY_ACCOUNT_NAME  || 'ddm1owlon';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_PRESET_NAME || 'oza_mobile';

// ── Transaction Detail Row ────────────────────────
const DetailRow = ({ label, value, highlight, colors }) => (
  <View style={[styles.detailRow, { borderBottomColor: colors.dividerColor }]}>
    <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>{label}</Text>
    <Text style={[
      styles.detailValue,
      { color: highlight ? colors.primaryColor1 : colors.textBlack },
      highlight && { fontFamily: '_bold' },
    ]}>
      {value || '—'}
    </Text>
  </View>
);

// ── Main Screen ───────────────────────────────────
const UploadPaymentProof = ({ route, navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  // Params from checkOutManualPage
  const trackId    = route.params?.track_id;
  const assetLabel = route.params?.assetLabel  || 'PayPal';
  const amount     = route.params?.amount      || '0';
  const currency   = route.params?.currency    || 'USD';
  const ngnAmount  = route.params?.ngnAmount   || '0';

  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadDone, setUploadDone]     = useState(false);

  // ── Pick from gallery ─────────────────────────
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
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
        Alert.alert('Permission Required', 'Please allow camera access.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error.message);
    }
  };

  // ── Upload to Cloudinary then backend ─────────
  const handleUpload = async () => {
    if (!selectedImage) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Image Selected', textBody: 'Please select or take a photo of your payment receipt.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsUploading(true);
    try {
      // Step 1 — Upload to Cloudinary
      const uri      = selectedImage.uri;
      const filename = uri.split('/').pop();
      const ext      = filename.split('.').pop()?.toLowerCase();
      const mimeType = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';

      const formData = new FormData();
      formData.append('file', { uri, name: filename, type: mimeType });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) {
        throw new Error('Cloudinary upload failed');
      }

      const secureUrl = cloudData.secure_url;
      const publicId  = cloudData.public_id;

      // Step 2 — Send to backend
      const res = await client.post(
        '/api/user_uploadPaymentProof',
        {
          userId:    userInfo?.userData?._id,
          image_url: secureUrl,
          trackId,
          fileType:  mimeType,
          public_id: publicId,
        },
        { headers: { 'Authorization': 'Bearer ' + userToken } }
      );

      if (res.data.msg === '201') {
        setUploadDone(true);
      } else {
        // Delete from Cloudinary if backend fails
        await client.post('/api/deleteUploaded_image', {
          userId: userInfo?.userData?._id,
          delete_url: publicId,
        }, { headers: { 'Authorization': 'Bearer ' + userToken } }).catch(() => {});

        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Upload Failed', textBody: res.data.message || 'Could not submit proof. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Could not upload. Please check your connection and try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Success State ─────────────────────────────
  if (uploadDone) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />
        <View style={styles.successView}>
          <View style={[styles.successIconBox, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.textBlack }]}>
            Proof Submitted!
          </Text>
          <Text style={[styles.successRef, { color: colors.textSecColor }]}>
            Reference: <Text style={{ color: colors.primaryColor1, fontFamily: '_bold' }}>{trackId}</Text>
          </Text>
          <Text style={[styles.successDesc, { color: colors.textSecColor }]}>
            Our team will verify your payment within 1–24 hours and credit your bank account.
          </Text>

          <View style={styles.successBtns}>
            <TouchableOpacity
              style={[styles.successBtnSecondary, { borderColor: colors.primaryColor1 }]}
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.85}>
              <Text style={[styles.successBtnSecondaryText, { color: colors.primaryColor1 }]}>
                View History
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.successBtnPrimary, { backgroundColor: colors.primaryColor1 }]}
              onPress={() => navigation.replace('Home')}
              activeOpacity={0.85}>
              <Text style={styles.successBtnPrimaryText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* ── Header ──────────────────────────── */}
        <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textBlack }]}>Payment Proof</Text>
          <View style={styles.backBtn} />
        </View>

        {/* ── Hero ────────────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name="cloud-upload-outline" size={28} color={colors.primaryColor1} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Upload Payment Proof</Text>
            <Text style={styles.heroDesc}>
              Upload a clear screenshot of your {assetLabel} transfer receipt
            </Text>
          </View>
        </LinearGradient>

        {/* ── Transaction Summary (auto-filled) ── */}
        <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.summaryTitle, { color: colors.textBlack }]}>
            Transaction Summary
          </Text>
          <DetailRow label="Reference"    value={trackId}                           highlight colors={colors} />
          <DetailRow label="Service"      value={assetLabel}                        colors={colors} />
          <DetailRow label="Amount Sent"  value={`$${Number(amount).toLocaleString()} ${currency}`} colors={colors} />
          <DetailRow label="NGN Expected" value={`₦${Number(ngnAmount).toLocaleString()}`}          colors={colors} />
          <DetailRow label="Status"       value="Awaiting Proof Upload"             colors={colors} />
        </View>

        {/* ── Upload Card ──────────────────────── */}
        <View style={[styles.uploadCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.uploadTitle, { color: colors.textBlack }]}>
            Payment Receipt
          </Text>
          <Text style={[styles.uploadDesc, { color: colors.textSecColor }]}>
            Upload a clear screenshot or photo of your {assetLabel} transfer receipt
          </Text>

          {selectedImage ? (
            <View style={[styles.previewCard, { borderColor: colors.successColor }]}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.previewFooter}>
                <View style={[styles.previewBadge, { backgroundColor: colors.successColor }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#fff" />
                  <Text style={styles.previewBadgeText}>Ready to upload</Text>
                </View>
                <TouchableOpacity
                  style={[styles.changeBtn, { backgroundColor: colors.bgLight }]}
                  onPress={() => setSelectedImage(null)}>
                  <Ionicons name="refresh-outline" size={14} color={colors.primaryColor1} />
                  <Text style={[styles.changeBtnText, { color: colors.primaryColor1 }]}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.pickRow}>
              <TouchableOpacity
                style={[styles.pickBtn, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}
                onPress={pickFromGallery}
                activeOpacity={0.85}>
                <Ionicons name="images-outline" size={28} color={colors.primaryColor1} />
                <Text style={[styles.pickBtnTitle, { color: colors.textBlack }]}>Gallery</Text>
                <Text style={[styles.pickBtnSub, { color: colors.textSecColor }]}>Pick screenshot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickBtn, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}
                onPress={takePhoto}
                activeOpacity={0.85}>
                <Ionicons name="camera-outline" size={28} color={colors.successColor} />
                <Text style={[styles.pickBtnTitle, { color: colors.textBlack }]}>Camera</Text>
                <Text style={[styles.pickBtnSub, { color: colors.textSecColor }]}>Take photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Requirements Card ────────────────── */}
        <View style={[styles.reqCard, { backgroundColor: colors.bgLight }]}>
          <Text style={[styles.reqTitle, { color: colors.primaryColor1 }]}>
            📋 Receipt Requirements
          </Text>
          {[
            'Must be a clear, readable screenshot',
            'Show the full transfer details and amount',
            'Include the reference number in the narration',
            'File size under 5MB — PNG or JPG only',
          ].map((item, i) => (
            <View key={i} style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
              <Text style={[styles.reqText, { color: colors.textSecColor }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* ── Notice ───────────────────────────── */}
        <View style={[styles.noticeCard, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
          <Ionicons name="time-outline" size={18} color={colors.primaryColor1} />
          <Text style={[styles.noticeText, { color: colors.textSecColor }]}>
            Your wallet will be credited within 30 minutes to 24 hours after verification. Keep your reference number for follow-up.
          </Text>
        </View>

        {/* ── Submit Button ─────────────────────── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primaryColor1 },
            (!selectedImage || isUploading) && { opacity: 0.55 },
          ]}
          onPress={handleUpload}
          disabled={!selectedImage || isUploading}
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

        <TouchableOpacity
          style={styles.laterBtn}
          onPress={() => navigation.replace('Home')}>
          <Text style={[styles.laterBtnText, { color: colors.textSecColor }]}>
            I'll Upload Later
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerTitle: { fontFamily: '_bold', fontSize: typography.xl },
  backBtn: { width: 42, height: 42, borderRadius: radius.full, justifyContent: 'center', alignItems: 'center' },

  heroBanner: {
    marginHorizontal: spacing.xl, borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing.lg,
    overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadows.lg,
  },
  heroCircle1: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroCircle2: { position: 'absolute', left: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroIconBox: { width: 54, height: 54, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: '_bold', fontSize: typography.xl, color: '#fff', marginBottom: 4 },
  heroDesc: { fontFamily: '_regular', fontSize: typography.base, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  // Summary
  summaryCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  summaryTitle: { fontFamily: '_bold', fontSize: typography.lg, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  detailLabel: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22 },
  detailValue: { fontFamily: '_semiBold', fontSize: typography.base, lineHeight: 22, flex: 1, textAlign: 'right' },

  // Upload
  uploadCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.lg, ...shadows.card },
  uploadTitle: { fontFamily: '_bold', fontSize: typography.lg, marginBottom: 4 },
  uploadDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, marginBottom: spacing.lg },
  pickRow: { flexDirection: 'row', gap: spacing.md },
  pickBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1.5, gap: spacing.xs },
  pickBtnTitle: { fontFamily: '_bold', fontSize: typography.base },
  pickBtnSub: { fontFamily: '_regular', fontSize: typography.sm },
  previewCard: { borderRadius: radius.xl, overflow: 'hidden', borderWidth: 2 },
  previewImage: { width: '100%', height: 220 },
  previewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  previewBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: 4 },
  previewBadgeText: { fontFamily: '_semiBold', fontSize: typography.sm, color: '#fff' },
  changeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: 4, ...shadows.sm },
  changeBtnText: { fontFamily: '_semiBold', fontSize: typography.sm },

  // Requirements
  reqCard: { marginHorizontal: spacing.xl, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  reqTitle: { fontFamily: '_bold', fontSize: typography.base, marginBottom: spacing.md },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  reqText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // Notice
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: spacing.xl, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, gap: spacing.sm },
  noticeText: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 22, flex: 1 },

  // Buttons
  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: radius.lg, marginHorizontal: spacing.xl, gap: spacing.sm, ...shadows.md },
  submitBtnText: { fontFamily: '_bold', fontSize: typography.lg, color: '#fff' },
  laterBtn: { alignItems: 'center', padding: spacing.lg },
  laterBtnText: { fontFamily: '_semiBold', fontSize: typography.base },

  // Success
  successView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  successIconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontFamily: '_bold', fontSize: typography.xxl, textAlign: 'center' },
  successRef: { fontFamily: '_regular', fontSize: typography.base, textAlign: 'center' },
  successDesc: { fontFamily: '_regular', fontSize: typography.base, lineHeight: 24, textAlign: 'center' },
  successBtns: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  successBtnSecondary: { flex: 1, height: 52, borderRadius: radius.lg, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  successBtnSecondaryText: { fontFamily: '_bold', fontSize: typography.base },
  successBtnPrimary: { flex: 1, height: 52, borderRadius: radius.lg, justifyContent: 'center', alignItems: 'center', ...shadows.md },
  successBtnPrimaryText: { fontFamily: '_bold', fontSize: typography.base, color: '#fff' },
});

export default UploadPaymentProof;