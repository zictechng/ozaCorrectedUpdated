
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';


// ── Main Bills Failed Screen ──────────────────────
const BillsFailedScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  const { S, colors, isDark } = useThemeStyles();
  const {
    serviceType,
    serviceTitle,
    amount,
    gradientColors = [colors.dangerColor, '#B91C1C'],
    icon = 'close-circle-outline',
    errorMessage = 'Your transaction could not be completed. Please try again.',
    errorCode = 'ERR',
  } = params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Failed icon shake animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Common Failure Reasons ────────────────────
  const getFailureReasons = () => {
    if (errorCode === 'Network Error' || errorMessage.includes('network')) {
      return [
        'Check your internet connection',
        'Try switching between WiFi and mobile data',
        'Retry the transaction after a few seconds',
      ];
    }
    return [
      'Insufficient wallet balance',
      'Incorrect meter/smartcard number',
      'Temporary service disruption from provider',
      'Contact support if your wallet was debited',
    ];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── Failed Hero ───────────────────────── */}
        <LinearGradient
          colors={['#EF4444', '#B91C1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Animated Failed Icon */}
          <Animated.View style={[
            styles.failedIconBox,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}>
            <Ionicons name="close" size={48} color="#EF4444" />
          </Animated.View>

          <Text style={styles.heroTitle}>Payment Failed</Text>
          {amount && (
            <Text style={styles.heroAmount}>
              ₦{Number(amount).toLocaleString()}
            </Text>
          )}
          <Text style={styles.heroService}>{serviceTitle}</Text>

          {/* Error Code Badge */}
          <View style={styles.errorCodeBadge}>
            <Text style={styles.errorCodeText}>Error Code: {errorCode}</Text>
          </View>
        </LinearGradient>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>

          {/* ── Error Message Card ────────────────── */}
          <View style={styles.errorCard}>
            <View style={styles.errorIconRow}>
              <View style={styles.errorIconBox}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.dangerColor} />
              </View>
              <Text style={styles.errorTitle}>What went wrong?</Text>
            </View>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>

          {/* ── Possible Reasons ─────────────────── */}
          <View style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Possible Reasons</Text>
            {getFailureReasons().map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <View style={styles.reasonDot} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* ── Wallet Safety Notice ──────────────── */}
          <View style={styles.safetyCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.successColor}
            />
            <View style={styles.safetyInfo}>
              <Text style={styles.safetyTitle}>Your wallet is safe</Text>
              <Text style={styles.safetyDesc}>
                If your wallet was debited and the service was not delivered,
                your balance will be automatically refunded within 24 hours.
                Contact support if not resolved.
              </Text>
            </View>
          </View>

          {/* ── Support Notice ────────────────────── */}
          <View style={styles.supportCard}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportDesc}>
              If this issue persists, please contact our support team
              with your transaction reference number for quick resolution.
            </Text>
          </View>

          {/* ── Action Buttons ────────────────────── */}
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color="#fff"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}>
            <Ionicons
              name="home-outline"
              size={20}
              color={colors.primaryColor1}
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => navigation.navigate('contacts')}
            activeOpacity={0.85}>
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>

        </Animated.View>
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

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroCircle2: {
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  failedIconBox: {
    width: 90,
    height: 90,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    marginBottom: spacing.sm,
  },
  heroAmount: {
    fontFamily: '_bold',
    fontSize: typography.giant,
    lineHeight: 48,
  },
  heroService: {
    fontFamily: '_regular',
    fontSize: typography.base,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  errorCodeBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  errorCodeText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
  },

  // Error Card
  errorCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  errorIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  errorIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    
  },
  errorMessage: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Reasons Card
  reasonsCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  reasonsTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    
    marginBottom: spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  reasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    
    marginTop: 7,
  },
  reasonText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },

  // Safety Card
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    marginBottom: 4,
    lineHeight: 22,
  },
  safetyDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
  },

  // Support Card
  supportCard: {
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  supportTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    marginBottom: 4,
    lineHeight: 22,
  },
  supportDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
  },

  // Buttons
  retryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  retryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  homeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  homeBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
  },
  supportBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xl,
  },
  supportBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
});

export default BillsFailedScreen;