import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Image, Alert,
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

// ── Document types accepted ───────────────────────
const DOC_TYPES = [
  {
    id: 'national_id',
    label: 'National ID Card',
    icon: 'card-outline',
    iconBg: '#EEF2FF',
    iconColor: '#4C5FD5',
    desc: 'Your NIMC national identity card (front and back)',
  },
  {
    id: 'voters_card',
    label: "Voter's Card",
    icon: 'checkmark-circle-outline',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    desc: 'Your INEC permanent voter\'s card',
  },
  {
    id: 'drivers_license',
    label: "Driver's Licence",
    icon: 'car-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    desc: 'Your valid Nigerian driver\'s licence',
  },
  {
    id: 'intl_passport',
    label: 'International Passport',
    icon: 'airplane-outline',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    desc: 'Your valid international passport (data page)',
  },
];

// ── Document Type Selector ────────────────────────
const DocTypeCard = ({ doc, isSelected, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.docTypeCard,
      {
        backgroundColor: colors.bgCard,
        borderColor: isSelected ? colors.primaryColor1 : colors.dividerColor,
      },
      isSelected && { backgroundColor: colors.bgLight },
    ]}
    onPress={() => onSelect(doc)}
    activeOpacity={0.85}>
    <View style={[styles.docTypeIcon, { backgroundColor: doc.iconBg }]}>
      <Ionicons name={doc.icon} size={22} color={doc.iconColor} />
    </View>
    <View style={styles.docTypeInfo}>
      <Text style={[styles.docTypeLabel, { color: colors.textBlack }]}>{doc.label}</Text>
      <Text style={[styles.docTypeDesc, { color: colors.textSecColor }]}>{doc.desc}</Text>
    </View>
    <View style={[
      styles.docTypeRadio,
      {
        borderColor: isSelected ? colors.primaryColor1 : colors.dividerColor,
        backgroundColor: isSelected ? colors.primaryColor1 : 'transparent',
      },
    ]}>
      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
    </View>
  </TouchableOpacity>
);

// ── Image Preview Card ────────────────────────────
const ImagePreviewCard = ({ image, label, onRemove, colors }) => (
  <View style={[styles.previewCard, { backgroundColor: colors.bgCard, borderColor: colors.successColor }]}>
    <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
    <View style={styles.previewInfo}>
      <Ionicons name="checkmark-circle" size={18} color={colors.successColor} />
      <Text style={[styles.previewLabel, { color: colors.textBlack }]}>{label}</Text>
    </View>
    <TouchableOpacity
      style={[styles.previewRemove, { backgroundColor: colors.lightRed }]}
      onPress={onRemove}>
      <Ionicons name="close" size={16} color={colors.dangerColor} />
    </TouchableOpacity>
  </View>
);

// ── Main Upload Document Screen ───────────────────
const UploadDocumentScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedDocType, setSelectedDocType] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const needsBack = selectedDocType?.id === 'national_id' ||
    selectedDocType?.id === 'drivers_license';

  // ── Pick image ────────────────────────────────
  const pickImage = async (side) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload documents.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        if (side === 'front') setFrontImage(result.assets[0]);
        else setBackImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Pick image error:', error.message);
    }
  };

  // ── Take photo ────────────────────────────────
  const takePhoto = async (side) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take document photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled && result.assets?.length > 0) {
        if (side === 'front') setFrontImage(result.assets[0]);
        else setBackImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error.message);
    }
  };

  // ── Validate ──────────────────────────────────
  const validate = () => {
    if (!selectedDocType) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Document Type', textBody: 'Please select the type of document you are uploading.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (!frontImage) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Front Image Required', textBody: 'Please upload the front side of your document.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    if (needsBack && !backImage) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Back Image Required', textBody: 'This document type requires both front and back images.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return false;
    }
    return true;
  };

  // ── Upload ────────────────────────────────────
  const handleUpload = async () => {
    if (!validate()) return;
    setIsUploading(true);
    try {
      const formData = new FormData();

      const frontFilename = frontImage.uri.split('/').pop();
      const frontExt = frontFilename.split('.').pop()?.toLowerCase();
      formData.append('front_image', {
        uri: frontImage.uri,
        name: frontFilename,
        type: frontExt === 'jpg' || frontExt === 'jpeg' ? 'image/jpeg' : 'image/png',
      });

      if (backImage) {
        const backFilename = backImage.uri.split('/').pop();
        const backExt = backFilename.split('.').pop()?.toLowerCase();
        formData.append('back_image', {
          uri: backImage.uri,
          name: backFilename,
          type: backExt === 'jpg' || backExt === 'jpeg' ? 'image/jpeg' : 'image/png',
        });
      }

      formData.append('doc_type', selectedDocType.id);
      formData.append('doc_label', selectedDocType.label);
      formData.append('userId', userInfo?.userData?._id);

      const res = await client.post(
        '/api/uploadKYCDocument_mobile',
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
          title: 'Documents Uploaded!',
          textBody: 'Your KYC documents have been submitted. We will review and verify them within 24 hours.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Upload Failed', textBody: res.data.message || 'Could not upload documents. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      }
    } catch (error) {
      Toast.show({ type: ALERT_TYPE.DANGER, title: 'Error', textBody: 'Something went wrong. Please check your connection and try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
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

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Upload Documents
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={[colors.primaryColor1, colors.primaryColor1b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name="shield-checkmark-outline" size={28} color={colors.primaryColor1} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>KYC Verification</Text>
            <Text style={styles.heroDesc}>
              Upload a valid government-issued ID to verify your identity and unlock all platform features.
            </Text>
          </View>
        </LinearGradient>

        {/* ── Step 1 — Document Type ────────────── */}
        <View style={[styles.stepCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNum, { backgroundColor: colors.primaryColor1 }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textBlack }]}>
              Select Document Type
            </Text>
          </View>
          <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
            Choose the type of government-issued ID you want to upload
          </Text>

          {DOC_TYPES.map((doc) => (
            <DocTypeCard
              key={doc.id}
              doc={doc}
              isSelected={selectedDocType?.id === doc.id}
              onSelect={(d) => {
                setSelectedDocType(d);
                setFrontImage(null);
                setBackImage(null);
              }}
              colors={colors}
            />
          ))}
        </View>

        {/* ── Step 2 — Upload Images ────────────── */}
        {selectedDocType && (
          <View style={[styles.stepCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryColor1 }]}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.textBlack }]}>
                Upload Document Images
              </Text>
            </View>
            <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
              Upload clear, well-lit photos of your {selectedDocType.label}.
              {needsBack ? ' Both front and back are required.' : ''}
            </Text>

            {/* Front Image */}
            <Text style={[styles.imageLabel, { color: colors.textSecColor }]}>
              Front Side {needsBack ? '(Required)' : ''}
            </Text>
            {frontImage ? (
              <ImagePreviewCard
                image={frontImage}
                label="Front image selected"
                onRemove={() => setFrontImage(null)}
                colors={colors}
              />
            ) : (
              <View style={styles.uploadOptionsRow}>
                <TouchableOpacity
                  style={[styles.uploadOptionBtn, {
                    backgroundColor: colors.bgLight,
                    borderColor: colors.dividerColor,
                  }]}
                  onPress={() => pickImage('front')}
                  activeOpacity={0.85}>
                  <Ionicons name="images-outline" size={22} color={colors.primaryColor1} />
                  <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadOptionBtn, {
                    backgroundColor: colors.bgLight,
                    borderColor: colors.dividerColor,
                  }]}
                  onPress={() => takePhoto('front')}
                  activeOpacity={0.85}>
                  <Ionicons name="camera-outline" size={22} color={colors.successColor} />
                  <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Back Image */}
            {needsBack && (
              <>
                <Text style={[styles.imageLabel, { color: colors.textSecColor }]}>
                  Back Side (Required)
                </Text>
                {backImage ? (
                  <ImagePreviewCard
                    image={backImage}
                    label="Back image selected"
                    onRemove={() => setBackImage(null)}
                    colors={colors}
                  />
                ) : (
                  <View style={styles.uploadOptionsRow}>
                    <TouchableOpacity
                      style={[styles.uploadOptionBtn, {
                        backgroundColor: colors.bgLight,
                        borderColor: colors.dividerColor,
                      }]}
                      onPress={() => pickImage('back')}
                      activeOpacity={0.85}>
                      <Ionicons name="images-outline" size={22} color={colors.primaryColor1} />
                      <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                        Gallery
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.uploadOptionBtn, {
                        backgroundColor: colors.bgLight,
                        borderColor: colors.dividerColor,
                      }]}
                      onPress={() => takePhoto('back')}
                      activeOpacity={0.85}>
                      <Ionicons name="camera-outline" size={22} color={colors.successColor} />
                      <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                        Camera
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── Tips Card ─────────────────────────── */}
        <View style={[styles.tipsCard, {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        }]}>
          <View style={styles.tipsTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
            <Text style={[styles.tipsTitle, { color: colors.primaryColor1 }]}>
              Document Tips
            </Text>
          </View>
          {[
            'Ensure the document is valid and not expired',
            'All text on the document must be clearly visible',
            'Take photos in good lighting — avoid shadows and glare',
            'Documents are reviewed within 24 hours',
            'Your documents are encrypted and stored securely',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
              <Text style={[styles.tipText, { color: colors.textSecColor }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Submit Button ─────────────────────── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primaryColor1 },
            (!selectedDocType || !frontImage || (needsBack && !backImage) || isUploading) && { opacity: 0.6 },
          ]}
          onPress={handleUpload}
          disabled={!selectedDocType || !frontImage || (needsBack && !backImage) || isUploading}
          activeOpacity={0.85}>
          {isUploading ? (
            <ActivityIndicator color="#fff" size={22} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Documents</Text>
            </>
          )}
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
  stepCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
    lineHeight: 22,
  },
  stepTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  stepDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
    marginLeft: 46,
  },
  docTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  docTypeIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTypeInfo: { flex: 1 },
  docTypeLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  docTypeDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  docTypeRadio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  uploadOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  uploadOptionText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  previewInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  previewLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  previewRemove: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
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

export default UploadDocumentScreen;