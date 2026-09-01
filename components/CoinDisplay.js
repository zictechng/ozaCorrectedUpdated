import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../hooks/useTheme';
import { spacing, radius, typography, shadows } from '../styles';
import {
  getUserTier,
  getNextTier,
  getTierProgress,
  getCoinsToNextTier,
} from '../constants/tierSystem';

const CoinDisplay = ({
  coins = 0,
  coinNgnValue = 1,
  coinUsdValue = 0.001,
  onPress,
  compact = false,
}) => {
  const { colors } = useTheme();

  const tier = getUserTier(coins);
  const nextTier = getNextTier(tier.name);
  const progress = getTierProgress(coins, tier);
  const coinsToNext = getCoinsToNextTier(coins, tier);

  const totalNgn = (coins * coinNgnValue).toLocaleString();
  const totalUsd = (coins * coinUsdValue).toFixed(4);

  // ── Compact version ───────────────────────────
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, {
          ...shadows.sm,
        }]}
        onPress={onPress}
        activeOpacity={0.8}>
        <Text style={styles.compactEmoji}>{tier.icon}</Text>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactCoins, { color: colors.textBlack }]}>
            {coins.toLocaleString()} coins
          </Text>
          <Text style={[styles.compactValue, { color: colors.textSecColor }]}>
            ≈ ₦{totalNgn}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
      </TouchableOpacity>
    );
  }

  // ── Full version ──────────────────────────────
  return (
    <View style={styles.container}>

      {/* Coin Balance Row */}
      <View style={styles.balanceRow}>
        <View style={[styles.coinCountBox, { backgroundColor: colors.bgLight }]}>
          <Text style={styles.coinEmoji}>{tier.icon}</Text>
          <Text style={[styles.coinCount, { color: '#4C5FD5' }]}>
            {coins.toLocaleString()}
          </Text>
          <Text style={[styles.coinLabel, { color: colors.textSecColor }]}>
            Total Coins
          </Text>
        </View>

        <View style={styles.valuesCol}>
          <View style={[styles.valueRow, { backgroundColor: colors.bgLight }]}>
            <Text style={[styles.valueLabel, { color: colors.textSecColor }]}>
              NGN Value
            </Text>
            <Text style={[styles.valueAmount, { color: colors.textBlack }]}>
              ₦{totalNgn}
            </Text>
          </View>
          <View style={[styles.valueRow, { backgroundColor: colors.bgLight }]}>
            <Text style={[styles.valueLabel, { color: colors.textSecColor }]}>
              USD Value
            </Text>
            <Text style={[styles.valueAmount, { color: colors.textBlack }]}>
              ${totalUsd}
            </Text>
          </View>
        </View>
      </View>

      {/* Tier Badge */}
      <View style={[styles.tierRow, { backgroundColor: tier.bgColor }]}>
        <Text style={styles.tierEmoji}>{tier.icon}</Text>
        <View style={styles.tierInfo}>
          <Text style={[styles.tierName, { color: tier.color }]}>
            {tier.name} Tier
          </Text>
          <Text style={[styles.tierPerks, { color: colors.textSecColor }]}>
            {tier.perks}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      {tier.max !== Infinity && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecColor }]}>
              Progress to {nextTier.name}
            </Text>
            <Text style={[styles.progressPct, { color: tier.color }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.dividerColor }]}>
            <View style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: tier.color },
            ]} />
          </View>
          <Text style={[styles.progressHint, { color: colors.textSecColor }]}>
            {coinsToNext.toLocaleString()} coins to {nextTier.icon} {nextTier.name}
          </Text>
        </View>
      )}

      {tier.max === Infinity && (
        <View style={[styles.tierRow, { backgroundColor: '#CFFAFE' }]}>
          <Text style={styles.tierEmoji}>🎉</Text>
          <Text style={[styles.maxTierText, { color: '#0E7490' }]}>
            You have reached the highest tier! Enjoy VIP perks.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  compactEmoji: { fontSize: 22 },
  compactInfo: { flex: 1 },
  compactCoins: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  compactValue: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },

  // Full
  container: { gap: spacing.md },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  coinCountBox: {
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    minWidth: 100,
  },
  coinEmoji: { fontSize: 28, marginBottom: spacing.xs },
  coinCount: {
    fontFamily: '_bold',
    fontSize: typography.huge,
  },
  coinLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginTop: 2,
    lineHeight: 20,
  },
  valuesCol: { flex: 1, gap: spacing.sm },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  valueLabel: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  valueAmount: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },

  // Tier
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tierEmoji: { fontSize: 20 },
  tierInfo: { flex: 1 },
  tierName: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  tierPerks: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },

  // Progress
  progressSection: { gap: spacing.xs },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
  },
  progressPct: {
    fontFamily: '_bold',
    fontSize: typography.base,
  },
  progressBar: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressHint: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  maxTierText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    flex: 1,
    lineHeight: 22,
  },
});

export default CoinDisplay;