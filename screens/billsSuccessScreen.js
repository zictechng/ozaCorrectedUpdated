
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';


// ── Receipt Row ───────────────────────────────────
const ReceiptRow = ({ label, value, isHighlight }) => (
  <View style={[styles.receiptRow, isHighlight && styles.receiptRowHighlight]}>
    <Text style={styles.receiptLabel}>{label}</Text>
    <Text style={[
      styles.receiptValue,
      isHighlight && styles.receiptValueHighlight,
    ]}
      numberOfLines={3}
      selectable>
      {value}
    </Text>
  </View>
);

// ── Main Bills Success Screen ─────────────────────
const BillsSuccessScreen = ({ navigation, route }) => {
  const params = route?.params || {};
  const { S, colors, isDark } = useThemeStyles();
  const {
    serviceType,
    serviceTitle,
    amount,
    gradientColors = [colors.successColor, '#059669'],
    icon = 'checkmark-circle-outline',
    transactionRef,
    deliveryInfo,
    pins,
    token,
    summaryItems = [],
  } = params;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Success icon bounce animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 15,
      }),
    ]).start();

    // Content fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Share Receipt ─────────────────────────────
  const handleShareReceipt = async () => {
    try {
      const receiptText = [
        `✅ ${serviceTitle} - Payment Successful`,
        `Amount: ₦${Number(amount).toLocaleString()}`,
        transactionRef ? `Reference: ${transactionRef}` : '',
        token ? `Token: ${token}` : '',
        pins ? `PINs: ${Array.isArray(pins) ? pins.join(', ') : pins}` : '',
        '',
        ...summaryItems.map(item => `${item.label}: ${item.value}`),
      ].filter(Boolean).join('\n');

      await Share.share({ message: receiptText });
    } catch (error) {
      console.log('Share error:', error.message);
    }
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

        {/* ── Success Hero ──────────────────────── */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroSection, { backgroundColor: colors.bgColor }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Animated Success Icon */}
          <Animated.View style={[
            styles.successIconBox,
            { transform: [{ scale: scaleAnim }] },
          ]}>
            <Ionicons name="checkmark" size={48} color={gradientColors[0]} />
          </Animated.View>

          <Text style={styles.heroTitle}>Payment Successful!</Text>
          <Text style={styles.heroAmount}>
            ₦{Number(amount).toLocaleString()}
          </Text>
          <Text style={styles.heroService}>{serviceTitle}</Text>
        </LinearGradient>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>

          {/* ── Token/PIN Display (if available) ── */}
          {(token || pins) && (
            <View style={[styles.tokenCard, { borderColor: gradientColors[0] }]}>
              <View style={styles.tokenHeader}>
                <Ionicons name="key-outline" size={20} color={gradientColors[0]} />
                <Text style={[styles.tokenTitle, { color: gradientColors[0] }]}>
                  {token ? 'Electricity Token' : 'Scratch Card PIN(s)'}
                </Text>
              </View>

              {token && (
                <Text style={styles.tokenValue} selectable>{token}</Text>
              )}

              {pins && Array.isArray(pins) && pins.map((pin, index) => (
                <View key={index} style={styles.pinRow}>
                  <Text style={styles.pinIndex}>PIN {index + 1}</Text>
                  <Text style={styles.pinValue} selectable>{pin}</Text>
                </View>
              ))}

              {pins && !Array.isArray(pins) && (
                <Text style={styles.tokenValue} selectable>{pins}</Text>
              )}

              <Text style={styles.tokenHint}>
                Tap and hold the token/PIN to copy it
              </Text>
            </View>
          )}

          {/* ── Delivery Info ─────────────────────── */}
          {deliveryInfo && (
            <View style={[styles.deliveryCard, { backgroundColor: colors.bgLight, borderColor: colors.dividerColor }]}>
              <Ionicons name="send-outline" size={18} color={colors.primaryColor1} />
              <Text style={[styles.deliveryText, { color: colors.textSecColor }]}>{deliveryInfo}</Text>
            </View>
          )}

          {/* ── Transaction Receipt ───────────────── */}
          <View style={[styles.receiptCard, { backgroundColor: colors.bgCard }]}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Transaction Receipt</Text>
              <TouchableOpacity
                onPress={handleShareReceipt}
                style={styles.shareBtn}>
                <Ionicons name="share-outline" size={18} color={colors.primaryColor1} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.receiptDivider} />

            {transactionRef && (
              <ReceiptRow
                label="Transaction Ref"
                value={transactionRef}
                isHighlight
              />
            )}

            {summaryItems.map((item, index) => (
              <ReceiptRow key={index} label={item.label} value={item.value} />
            ))}

            <ReceiptRow
              label="Status"
              value="✅ Successful"
              isHighlight
            />
          </View>

          {/* ── Coins Earned Notice ───────────────── */}
          <View style={[styles.coinsCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.coinsEmoji}>🪙</Text>
            <View style={styles.coinsInfo}>
              <Text style={[styles.coinsTitle, { color: colors.textBlack }]}>Coins Earned!</Text>
              <Text style={[styles.coinsDesc, { color: colors.textSecColor }]}>
                You have earned coins for this transaction.
                Check your rewards wallet to see your balance.
              </Text>
            </View>
          </View>

          {/* ── Action Buttons ────────────────────── */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: gradientColors[0] }]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}>
            <Ionicons
              name="home-outline"
              size={20}
              color="#fff"
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.85}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color={colors.primaryColor1}
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.secondaryBtnText}>View Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => navigation.navigate('BillsHome')}
            activeOpacity={0.85}>
            <Text style={styles.tertiaryBtnText}>Make Another Payment</Text>
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
  successIconBox: {
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

  // Token Card
  tokenCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    ...shadows.card,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tokenTitle: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  tokenValue: {
    fontFamily: '_bold',
    fontSize: typography.xxl,
    
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: spacing.sm,
    lineHeight: 36,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    
  },
  pinIndex: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
  pinValue: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    letterSpacing: 1,
    lineHeight: 22,
  },
  tokenHint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },

  // Delivery Card
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  deliveryText: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },

  // Receipt Card
  receiptCard: {
    
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  receiptTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  shareBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    
  },
  receiptDivider: {
    height: 1,
    marginBottom: spacing.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    
    gap: spacing.md,
  },
  receiptRowHighlight: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 0,
    marginBottom: spacing.xs,
  },
  receiptLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    flex: 1,
    lineHeight: 22,
  },
  receiptValue: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    flex: 1,
    textAlign: 'right',
    lineHeight: 22,
  },
  receiptValueHighlight: {
    
    fontFamily: '_bold',
  },

  // Coins Card
  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    gap: spacing.md,
  },
  coinsEmoji: {
    fontSize: 32,
  },
  coinsInfo: {
    flex: 1,
  },
  coinsTitle: {
    fontFamily: '_bold',
    fontSize: typography.base,
    
    marginBottom: 2,
    lineHeight: 22,
  },
  coinsDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    
    lineHeight: 22,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  primaryBtnText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  secondaryBtn: {
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
  secondaryBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
  },
  tertiaryBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.xl,
  },
  tertiaryBtnText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    
    lineHeight: 22,
  },
});

export default BillsSuccessScreen;