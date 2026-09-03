import React, { useState, useRef } from 'react';
import {
  TouchableOpacity, Image, View, Text, StyleSheet,
  Dimensions, Linking, Alert, Platform, StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Mask, Ellipse } from 'react-native-svg';

import { spacing, radius, typography } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OVAL_WIDTH = screenWidth * 0.75;
const OVAL_HEIGHT = screenHeight * 0.42;

const Verify2faCamera = ({ navigation }) => {
  const { colors } = useThemeStyles();
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const isFocused = useIsFocused();

  // ── Take picture ──────────────────────────────
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setImage(photo.uri);
    } catch (error) {
      console.log('Take picture error:', error.message);
    }
  };

  const retakePicture = () => setImage(null);

  const usePhoto = () => {
    if (!image) return;
    navigation.navigate('Verify2faces', { userPhoto: image });
  };

  // ── No permission yet ─────────────────────────
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.permissionView}>
          <View style={[styles.permissionIconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Ionicons name="camera-outline" size={56} color="#fff" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            We need access to your camera to verify your identity with a selfie.
            Your photo is processed securely and never shared.
          </Text>
          <TouchableOpacity
            style={styles.grantBtn}
            onPress={async () => {
              const { status } = await requestPermission();
              if (status === 'denied') {
                Alert.alert(
                  'Permission Required',
                  Platform.OS === 'ios'
                    ? 'Please enable camera access in Settings → Privacy → Camera.'
                    : 'Please enable camera access in your device settings.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                  ]
                );
              }
            }}
            activeOpacity={0.85}>
            <Text style={styles.grantBtnText}>Allow Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Photo preview ─────────────────────────────
  if (image) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Image source={{ uri: image }} style={styles.previewImage} />

        {/* Dark overlay at top */}
        <View style={styles.previewTopBar}>
          <Text style={styles.previewTopTitle}>Use this photo?</Text>
          <Text style={styles.previewTopDesc}>
            Make sure your face is clear and well-lit
          </Text>
        </View>

        {/* Bottom action buttons */}
        <View style={styles.previewBottomBar}>
          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={retakePicture}
            activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.usePhotoBtn}
            onPress={usePhoto}
            activeOpacity={0.85}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.usePhotoBtnText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Camera viewfinder ─────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Camera */}
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
          ref={cameraRef}
        />
      )}

      {/* Oval overlay mask */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Mask id="faceMask">
            <Rect width="100%" height="100%" fill="white" />
            <Ellipse
              cx={screenWidth / 2}
              cy={screenHeight / 2 - 40}
              rx={OVAL_WIDTH / 2}
              ry={OVAL_HEIGHT / 2}
              fill="black"
            />
          </Mask>
          <Rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.72)"
            mask="url(#faceMask)"
          />
          {/* Oval border */}
          <Ellipse
            cx={screenWidth / 2}
            cy={screenHeight / 2 - 40}
            rx={OVAL_WIDTH / 2}
            ry={OVAL_HEIGHT / 2}
            stroke="#7f8cda"
            strokeWidth={2.5}
            fill="transparent"
          />
        </Svg>
      </View>

      {/* Top instructions */}
      <View style={styles.topInstructions}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.instructionTitle}>Face Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Face guide text */}
      <View style={styles.guideTextBox}>
        <Text style={styles.guideText}>
          Position your face inside the oval
        </Text>
        <Text style={styles.guideSubText}>
          Ensure good lighting and look straight at the camera
        </Text>
      </View>

      {/* Tips row */}
      <View style={styles.tipsRow}>
        {[
          { icon: 'sunny-outline', label: 'Good light' },
          { icon: 'eye-outline', label: 'Look straight' },
          { icon: 'move-outline', label: 'Stay still' },
        ].map((tip) => (
          <View key={tip.label} style={styles.tipItem}>
            <Ionicons name={tip.icon} size={18} color="rgba(255,255,255,0.85)" />
            <Text style={styles.tipLabel}>{tip.label}</Text>
          </View>
        ))}
      </View>

      {/* Capture button — clearly visible */}
      <TouchableOpacity
        style={styles.captureBtn}
        onPress={takePicture}
        activeOpacity={0.85}>
        <View style={styles.captureBtnOuter}>
          <View style={styles.captureBtnInner} />
        </View>
        <Text style={styles.captureBtnLabel}>Tap to capture</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Permission screen
  permissionView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl * 1.5,
  },
  permissionIconBox: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  permissionTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl * 1.5,
  },
  grantBtn: {
    backgroundColor: '#7f8cda',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl * 1.5,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  grantBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  backLink: {
    padding: spacing.md,
  },
  backLinkText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.6)',
  },

  // Preview screen
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  previewTopTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
    marginBottom: 4,
  },
  previewTopDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    textAlign: 'center',
  },
  previewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: 48,
    gap: spacing.md,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    gap: spacing.sm,
  },
  retakeBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },
  usePhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: '#7f8cda',
    gap: spacing.sm,
  },
  usePhotoBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
  },

  // Camera viewfinder
  topInstructions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  guideTextBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  guideText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guideSubText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tipsRow: {
    position: 'absolute',
    bottom: 170,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  tipItem: {
    alignItems: 'center',
    gap: 4,
  },
  tipLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },

  // Capture button — fully visible
  captureBtn: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },
  captureBtnLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
});

export default Verify2faCamera;