import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

// ── Camera Control Button ─────────────────────────
const CameraControlBtn = ({ icon, label, onPress, color = '#fff', bgColor = 'rgba(255,255,255,0.15)', size = 24 }) => (
  <TouchableOpacity style={[styles.controlBtn, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name={icon} size={size} color={color} />
    {label ? <Text style={[styles.controlLabel, { color }]}>{label}</Text> : null}
  </TouchableOpacity>
);

// ── Permission Screen ─────────────────────────────
const PermissionScreen = ({ colors, isDark, onRequest }) => (
  <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgColor} />

    <View style={styles.permissionWrapper}>
      {/* Icon */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.permissionIconRing}>
        <View style={[styles.permissionIconInner, { backgroundColor: colors.bgCard }]}>
          <Ionicons name="camera-outline" size={36} color="#10B981" />
        </View>
      </LinearGradient>

      <Text style={[styles.permissionTitle, { color: colors.textBlack }]}>
        Camera Access Required
      </Text>
      <Text style={[styles.permissionDesc, { color: colors.textSecColor }]}>
        To capture documents and photos, we need permission to access your device camera. Your privacy is respected — no photos are taken without your action.
      </Text>

      {/* Permission grant button */}
      <TouchableOpacity onPress={onRequest} activeOpacity={0.85} style={styles.permissionBtnWrapper}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.permissionBtn}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
          <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Info row */}
      <View style={[styles.permissionNote, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
        <Ionicons name="lock-closed-outline" size={14} color="#10B981" />
        <Text style={[styles.permissionNoteText, { color: colors.textSecColor }]}>
          Permission is only used while the camera is open
        </Text>
      </View>
    </View>
  </SafeAreaView>
);

// ── Main Camera Screen ────────────────────────────
export default function OpenCamera({ navigation }) {
  const { colors, isDark } = useThemeStyles();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isCaptured, setIsCaptured] = useState(false);
  const cameraRef = useRef(null);
  const captureAnim = useRef(new Animated.Value(1)).current;

  // ── Permission loading ───────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={[styles.loadingText, { color: colors.textSecColor }]}>
            Checking camera access…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Permission not granted ───────────────────
  if (!permission.granted) {
    return (
      <PermissionScreen
        colors={colors}
        isDark={isDark}
        onRequest={requestPermission}
      />
    );
  }

  // ── Toggle camera facing ─────────────────────
  const toggleFacing = () => {
    setFacing(curr => (curr === 'back' ? 'front' : 'back'));
  };

  // ── Toggle flash ─────────────────────────────
  const toggleFlash = () => {
    setFlash(curr => (curr === 'off' ? 'on' : curr === 'on' ? 'auto' : 'off'));
  };

  const flashIcon =
    flash === 'on' ? 'flash' :
    flash === 'auto' ? 'flash-outline' :
    'flash-off-outline';

  // ── Capture shutter animation ────────────────
  const handleCapture = async () => {
    if (!cameraRef.current || isCaptured) return;
    setIsCaptured(true);
    Animated.sequence([
      Animated.timing(captureAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(captureAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, skipProcessing: false });
      // Hand off to parent / navigation as needed
      navigation?.navigate('ReviewCapture', { photo });
    } catch (e) {
      console.log('Capture error:', e.message);
    } finally {
      setIsCaptured(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Camera Feed ──────────────────────── */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        flash={flash}
      />

      {/* ── Dark gradient overlay — top ──────── */}
      <LinearGradient
        colors={['rgba(0,0,0,0.62)', 'transparent']}
        style={styles.overlayTop}
        pointerEvents="none"
      />

      {/* ── Dark gradient overlay — bottom ───── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.overlayBottom}
        pointerEvents="none"
      />

      {/* ── Top bar ──────────────────────────── */}
      <SafeAreaView style={styles.topBar}>
        {/* Back */}
        <TouchableOpacity
          style={styles.topIconBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.topTitle}>
          <Text style={styles.topTitleText}>Camera</Text>
          <View style={styles.liveDot} />
        </View>

        {/* Flash */}
        <TouchableOpacity style={styles.topIconBtn} onPress={toggleFlash} activeOpacity={0.8}>
          <Ionicons name={flashIcon} size={22} color={flash === 'on' ? '#FCD34D' : '#fff'} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Document frame guide ─────────────── */}
      <View style={styles.frameGuideWrapper} pointerEvents="none">
        <View style={styles.frameGuide}>
          {/* Corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.frameHint}>Align document within the frame</Text>
      </View>

      {/* ── Bottom controls ───────────────────── */}
      <View style={styles.bottomBar}>
        {/* Grid / extra control left */}
        <CameraControlBtn
          icon="grid-outline"
          label="Grid"
          onPress={() => {}}
        />

        {/* Shutter */}
        <Animated.View style={{ transform: [{ scale: captureAnim }] }}>
          <TouchableOpacity
            style={styles.shutterOuter}
            onPress={handleCapture}
            activeOpacity={0.9}
            disabled={isCaptured}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shutterInner}>
              {isCaptured
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="camera" size={28} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Flip camera right */}
        <CameraControlBtn
          icon="camera-reverse-outline"
          label="Flip"
          onPress={toggleFacing}
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Loading ──────────────────────────────────
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: '_regular',
    fontSize: typography.base,
  },

  // ── Permission ───────────────────────────────
  permissionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  permissionIconRing: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: 3,
    ...shadows.lg,
  },
  permissionIconInner: {
    flex: 1,
    width: '100%',
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  permissionDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  permissionBtnWrapper: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.lg,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: spacing.sm,
  },
  permissionBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  permissionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  permissionNoteText: {
    fontFamily: '_regular',
    fontSize: typography.sm,
  },

  // ── Overlay gradients ────────────────────────
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },

  // ── Top bar ──────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  topIconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topTitleText: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    color: '#fff',
    letterSpacing: 0.3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: '#10B981',
    marginLeft: 2,
  },

  // ── Document frame guide ─────────────────────
  frameGuideWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameGuide: {
    width: '78%',
    aspectRatio: 1.58, // ~ID card ratio
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10B981',
    borderWidth: 2.5,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  frameHint: {
    marginTop: spacing.md,
    fontFamily: '_regular',
    fontSize: typography.sm,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.2,
  },

  // ── Bottom controls ──────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: radius.full,
    gap: 4,
  },
  controlLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.xs,
  },

  // ── Shutter ──────────────────────────────────
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});