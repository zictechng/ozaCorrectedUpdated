import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Image, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';
import { AuthContext } from '../contextAPI/authContext';
import { noticeData } from '../components/errorNotice';
import client from '../contextAPI/client';

const UploadProfileImageScreen = ({ navigation }) => {
  const { colors, isDark } = useThemeStyles();
  const { userToken, userInfo, setUserInfo } = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentPhoto = userInfo?.userData?.profile_photo;
  const userName = userInfo?.userData?.display_name || 'User';

  // ── Pick from gallery ─────────────────────────
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Gallery pick error:', error.message);
    }
  };

  // ── Take a photo ──────────────────────────────
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a profile photo.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.log('Camera error:', error.message);
    }
  };

  // ── Upload photo ──────────────────────────────
  const handleUpload = async () => {
    if (!selectedImage) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'No Image Selected',
        textBody: 'Please select or take a photo before uploading.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = selectedImage.uri.split('/').pop();
      const ext = filename.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';

      formData.append('profile_photo', {
        uri: selectedImage.uri,
        name: filename,
        type: mimeType,
      });
      formData.append('userId', userInfo?.userData?._id);

      const res = await client.post(
        '/api/uploadProfilePhoto_mobile',
        formData,
        {
          headers: {
            'Authorization': 'Bearer ' + userToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.data.msg === '200') {
        const updatedInfo = {
          ...userInfo,
          userData: {
            ...userInfo.userData,
            profile_photo: res.data.photo_url,
          },
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedInfo));
        setUserInfo(updatedInfo);
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Photo Updated!',
          textBody: 'Your profile photo has been updated successfully.',
          button: 'Done',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Upload Failed',
          textBody: res.data.message || 'Could not upload photo. Please try again.',
          titleStyle: noticeData[0].errorTitleStyle,
          textBodyStyle: noticeData[0].errorMessageStyle,
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Something went wrong. Please check your connection and try again.',
        titleStyle: noticeData[0].errorTitleStyle,
        textBodyStyle: noticeData[0].errorMessageStyle,
      });
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
          Profile Photo
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

          {/* Current / Selected Photo */}
          <View style={styles.avatarWrapper}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.avatar}
              />
            ) : currentPhoto ? (
              <Image
                source={{ uri: currentPhoto }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarInitial}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {selectedImage && (
              <View style={[styles.newBadge, { backgroundColor: colors.successColor }]}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{userName}</Text>
          <Text style={styles.heroDesc}>
            {selectedImage
              ? 'New photo selected — tap upload to save'
              : 'Tap below to choose or take a photo'}
          </Text>
        </LinearGradient>

        {/* ── Pick Options ──────────────────────── */}
        <View style={[styles.optionsCard, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.optionsTitle, { color: colors.textBlack }]}>
            Choose Photo Source
          </Text>
          <Text style={[styles.optionsDesc, { color: colors.textSecColor }]}>
            Select a clear, well-lit photo of your face. Square photos work best.
          </Text>

          <TouchableOpacity
            style={[styles.optionBtn, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}
            onPress={pickFromGallery}
            activeOpacity={0.85}>
            <View style={[styles.optionIconBox, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="images-outline" size={24} color={colors.primaryColor1} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: colors.textBlack }]}>
                Choose from Gallery
              </Text>
              <Text style={[styles.optionDesc, { color: colors.textSecColor }]}>
                Select an existing photo from your phone
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionBtn, {
              backgroundColor: colors.bgLight,
              borderColor: colors.dividerColor,
            }]}
            onPress={takePhoto}
            activeOpacity={0.85}>
            <View style={[styles.optionIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="camera-outline" size={24} color={colors.successColor} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: colors.textBlack }]}>
                Take a Photo
              </Text>
              <Text style={[styles.optionDesc, { color: colors.textSecColor }]}>
                Use your camera to take a new photo now
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecColor} />
          </TouchableOpacity>
        </View>

        {/* ── Tips Card ─────────────────────────── */}
        <View style={[styles.tipsCard, {
          backgroundColor: colors.bgLight,
          borderColor: colors.dividerColor,
        }]}>
          <View style={styles.tipsTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primaryColor1} />
            <Text style={[styles.tipsTitle, { color: colors.primaryColor1 }]}>
              Photo Tips
            </Text>
          </View>
          {[
            'Use a clear, recent photo of your face',
            'Good lighting makes a big difference',
            'Avoid sunglasses or hats that cover your face',
            'Square or portrait orientation works best',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.successColor} />
              <Text style={[styles.tipText, { color: colors.textSecColor }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Upload Button ─────────────────────── */}
        {selectedImage && (
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              { backgroundColor: colors.primaryColor1 },
              isUploading && { opacity: 0.7 },
            ]}
            onPress={handleUpload}
            disabled={isUploading}
            activeOpacity={0.85}>
            {isUploading ? (
              <ActivityIndicator color="#fff" size={22} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
                <Text style={styles.uploadBtnText}>Upload Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ── Cancel / Change Selection ─────────── */}
        {selectedImage && (
          <TouchableOpacity
            style={[styles.cancelBtn, {
              borderColor: colors.dividerColor,
            }]}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.8}>
            <Text style={[styles.cancelBtnText, { color: colors.textSecColor }]}>
              Choose Different Photo
            </Text>
          </TouchableOpacity>
        )}

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

  // Hero Banner
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
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
    left: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: {
    fontFamily: '_bold',
    fontSize: 48,
    color: '#fff',
  },
  newBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  newBadgeText: {
    fontFamily: '_bold',
    fontSize: typography.sm,
    color: '#fff',
    lineHeight: 16,
  },
  heroName: {
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
    textAlign: 'center',
  },

  // Options Card
  optionsCard: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  optionsTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    marginBottom: 4,
  },
  optionsDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  optionIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: { flex: 1 },
  optionTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Tips Card
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

  // Buttons
  uploadBtn: {
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
  uploadBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  cancelBtn: {
    height: 52,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  cancelBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default UploadProfileImageScreen;