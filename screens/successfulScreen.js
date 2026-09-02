import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

const SuccessfulScreen = ({ route, navigation }) => {
  const { colors, isDark } = useThemeStyles();

  const title = route.params?.title || 'Transaction Successful!';
  const message = route.params?.message || 'Your transaction has been completed successfully.';
  const subMessage = route.params?.subMessage || '';
  const btnText = route.params?.btnText || 'Go to Home';
  const btnRoute = route.params?.btnRoute || 'Home';
  const amount = route.params?.amount || '';
  const reference = route.params?.reference || '';

  // ── Animation refs ────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bgColor}
      />

      <View style={styles.content}>

        {/* ── Success Icon ──────────────────────── */}
        <Animated.View style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconGradient}>
            <View style={styles.iconCircle1} />
            <View style={styles.iconCircle2} />
            <Ionicons name="checkmark" size={64} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* ── Title & Message ───────────────────── */}
        <Animated.View style={[
          styles.textBlock,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          <Text style={[styles.title, { color: colors.textBlack }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.textSecColor }]}>
            {message}
          </Text>
          {subMessage ? (
            <Text style={[styles.subMessage, { color: colors.textSecColor }]}>
              {subMessage}
            </Text>
          ) : null}
        </Animated.View>

        {/* ── Transaction Details ───────────────── */}
        {(amount || reference) && (
          <Animated.View
            style={[
              styles.detailsCard,
              {
                backgroundColor: colors.bgCard,
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            {amount ? (
              <View style={[styles.detailRow, { borderBottomColor: colors.dividerColor }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>
                  Amount
                </Text>
                <Text style={[styles.detailValue, { color: colors.successColor }]}>
                  {amount}
                </Text>
              </View>
            ) : null}
            {reference ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecColor }]}>
                  Reference
                </Text>
                <Text style={[styles.detailValue, { color: colors.textBlack }]}>
                  {reference}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        )}

        {/* ── Status Pills ──────────────────────── */}
        <Animated.View style={[
          styles.pillsRow,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
          {['Verified', 'Secure', 'Instant'].map((pill) => (
            <View key={pill} style={[styles.pill, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.pillText, { color: '#065F46' }]}>{pill}</Text>
            </View>
          ))}
        </Animated.View>

      </View>

      {/* ── Buttons ───────────────────────────────── */}
      <Animated.View style={[
        styles.buttonsBlock,
        { opacity: opacityAnim },
      ]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.successColor }]}
          onPress={() => navigation.replace(btnRoute)}
          activeOpacity={0.85}>
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>{btnText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, {
            borderColor: colors.dividerColor,
            backgroundColor: colors.bgCard,
          }]}
          onPress={() => navigation.replace('History')}
          activeOpacity={0.85}>
          <Ionicons name="time-outline" size={20} color={colors.primaryColor1} />
          <Text style={[styles.secondaryBtnText, { color: colors.primaryColor1 }]}>
            View Transaction History
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Icon
  iconWrapper: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.lg,
  },
  iconCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -20,
    right: -20,
  },
  iconCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -10,
    left: -10,
  },

  // Text
  textBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontFamily: '_bold',
    fontSize: typography.xxxl,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 38,
  },
  message: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  subMessage: {
    fontFamily: '_regular',
    fontSize: typography.base,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Details Card
  detailsCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  detailValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Pills
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  pillText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Buttons
  buttonsBlock: {
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default SuccessfulScreen;