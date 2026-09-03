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

// ── Accepted document types ───────────────────────
const PROOF_TYPES = [
  {
    id: 'utility_bill',
    label: 'Utility Bill',
    icon: 'flash-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    desc: 'Electricity, water or gas bill showing your name and address',
  },
  {
    id: 'bank_statement',
    label: 'Bank Statement',
    icon: 'business-outline',
    iconBg: '#EEF2FF',
    iconColor: '#4C5FD5',
    desc: 'Recent bank statement with your name and address (last 3 months)',
  },
  {
    id: 'tenancy_agreement',
    label: 'Tenancy Agreement',
    icon: 'home-outline',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    desc: 'Signed tenancy or lease agreement showing your current address',
  },
  {
    id: 'govt_letter',
    label: 'Government Letter',
    icon: 'document-text-outline',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    desc: 'Any official government correspondence addressed to you',
  },
];

// ── Proof Type Card ───────────────────────────────
const ProofTypeCard = ({ proof, isSelected, onSelect, colors }) => (
  <TouchableOpacity
    style={[
      styles.proofTypeCard,
      {
        backgroundColor: colors.bgCard,
        borderColor: isSelected ? colors.primaryColor1 : colors.dividerColor,
      },
      isSelected && { backgroundColor: colors.bgLight },
    ]}
    onPress={() => onSelect(proof)}
    activeOpacity={0.85}>
    <View style={[styles.proofTypeIcon, { backgroundColor: proof.iconBg }]}>
      <Ionicons name={proof.icon} size={22} color={proof.iconColor} />
    </View>
    <View style={styles.proofTypeInfo}>
      <Text style={[styles.proofTypeLabel, { color: colors.textBlack }]}>{proof.label}</Text>
      <Text style={[styles.proofTypeDesc, { color: colors.textSecColor }]}>{proof.desc}</Text>
    </View>
    <View style={[
      styles.proofRadio,
      {
        borderColor: isSelected ? colors.primaryColor1 : colors.dividerColor,
        backgroundColor: isSelected ? colors.primaryColor1 : 'transparent',
      },
    ]}>
      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
    </View>
  </TouchableOpacity>
);

// ── Main Upload Address Screen ────────────────────
const UploadProofAddress = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo } = useContext(AuthContext);

  const [selectedProofType, setSelectedProofType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── Pick from gallery ─────────────────────────
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.', [{ text: 'OK' }]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

  // ── Upload ────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedProofType) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'Select Document Type', textBody: 'Please select the type of proof of address document.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    if (!selectedImage) {
      Toast.show({ type: ALERT_TYPE.WARNING, title: 'No Document Selected', textBody: 'Please select or take a photo of your proof of address document.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = selectedImage.uri.split('/').pop();
      const ext = filename.split('.').pop()?.toLowerCase();
      formData.append('address_proof', {
        uri: selectedImage.uri,
        name: filename,
        type: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png',
      });
      formData.append('proof_type', selectedProofType.id);
      formData.append('proof_label', selectedProofType.label);
      formData.append('userId', userInfo?.userData?._id);

      const res = await client.post(
        '/api/uploadProofAddress_mobile',
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
          title: 'Document Uploaded!',
          textBody: 'Your proof of address has been submitted. We will review it within 24 hours.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Upload Failed', textBody: res.data.message || 'Could not upload document. Please try again.', titleStyle: noticeData[0].errorTitleStyle, textBodyStyle: noticeData[0].errorMessageStyle });
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

      {/* ── Header ──────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.bgLight }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textBlack }]}>
          Proof of Address
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Hero Banner ──────────────────────── */}
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
            <Ionicons name="home-outline" size={28} color="#10B981" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Proof of Address</Text>
            <Text style={styles.heroDesc}>
              Upload a document that confirms your current residential address to complete your KYC verification.
            </Text>
          </View>
        </LinearGradient>

        {/* ── Step 1 — Proof Type ───────────────── */}
        <View style={[styles.stepCard, { backgroundColor: colors.bgCard }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNum, { backgroundColor: '#10B981' }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={[styles.stepTitle, { color: colors.textBlack }]}>
              Select Document Type
            </Text>
          </View>
          <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
            Choose the type of proof of address document you want to upload
          </Text>

          {PROOF_TYPES.map((proof) => (
            <ProofTypeCard
              key={proof.id}
              proof={proof}
              isSelected={selectedProofType?.id === proof.id}
              onSelect={(p) => {
                setSelectedProofType(p);
                setSelectedImage(null);
              }}
              colors={colors}
            />
          ))}
        </View>

        {/* ── Step 2 — Upload Image ─────────────── */}
        {selectedProofType && (
          <View style={[styles.stepCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNum, { backgroundColor: '#10B981' }]}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.textBlack }]}>
                Upload Document
              </Text>
            </View>
            <Text style={[styles.stepDesc, { color: colors.textSecColor }]}>
              Upload a clear photo or scan of your {selectedProofType.label}
            </Text>

            {selectedImage ? (
              <View style={[styles.previewCard, {
                backgroundColor: colors.bgCard,
                borderColor: '#10B981',
              }]}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewInfo}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={[styles.previewLabel, { color: colors.textBlack }]}>
                    {selectedProofType.label} selected
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.previewRemove, { backgroundColor: colors.lightRed }]}
                  onPress={() => setSelectedImage(null)}>
                  <Ionicons name="close" size={16} color={colors.dangerColor} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadOptionsRow}>
                <TouchableOpacity
                  style={[styles.uploadOptionBtn, {
                    backgroundColor: colors.bgLight,
                    borderColor: colors.dividerColor,
                  }]}
                  onPress={pickFromGallery}
                  activeOpacity={0.85}>
                  <Ionicons name="images-outline" size={24} color={colors.primaryColor1} />
                  <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadOptionBtn, {
                    backgroundColor: colors.bgLight,
                    borderColor: colors.dividerColor,
                  }]}
                  onPress={takePhoto}
                  activeOpacity={0.85}>
                  <Ionicons name="camera-outline" size={24} color="#10B981" />
                  <Text style={[styles.uploadOptionText, { color: colors.textBlack }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Requirements Card ─────────────────── */}
        <View style={[styles.tipsCard, {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        }]}>
          <View style={styles.tipsTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color="#10B981" />
            <Text style={[styles.tipsTitle, { color: '#10B981' }]}>
              Document Requirements
            </Text>
          </View>
          {[
            'Document must show your full name and current address',
            'Must be issued within the last 3 months',
            'All text must be clearly visible and readable',
            'Document must not be altered or edited',
            'Digital or physical documents are both accepted',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.tipText, { color: colors.textSecColor }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Submit Button ─────────────────────── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: '#10B981' },
            (!selectedProofType || !selectedImage || isUploading) && { opacity: 0.6 },
          ]}
          onPress={handleUpload}
          disabled={!selectedProofType || !selectedImage || isUploading}
          activeOpacity={0.85}>
          {isUploading ? (
            <ActivityIndicator color="#fff" size={22} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Proof of Address</Text>
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
  proofTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  proofTypeIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofTypeInfo: { flex: 1 },
  proofTypeLabel: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  proofTypeDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  proofRadio: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
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

export default UploadProofAddress;