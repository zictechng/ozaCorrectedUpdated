
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gs, spacing, radius, typography, shadows } from '../styles';
import useThemeStyles from '../hooks/useThemeStyles';

// ─────────────────────────────────────────────────
// BillScreenHeader — Reusable header for all bill
// payment screens. Shows back button, title,
// gradient hero banner with icon and description.
// ─────────────────────────────────────────────────
const BillScreenHeader = React.memo(({
  navigation,
  title,
  description,
  icon,
  gradientColors,
  serviceStatus,
  balance,
  balanceLabel,
}) => {
  const { S, colors } = useThemeStyles();
  return (
    <>
      {/* Top Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.bgColor }]}>
        <TouchableOpacity
          style={gs.homeSideMenu}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.textBlack} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.textBlack }]}>{title}</Text>
        <View style={[gs.homeSideMenu, { backgroundColor: 'transparent' }]} />
      </View>

      {/* Hero Banner */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}>

        {/* Decorative circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        <View style={styles.heroContent}>
          {/* Icon */}
          <View style={styles.heroIconBox}>
            <Ionicons name={icon} size={32} color="#fff" />
          </View>

          {/* Text */}
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroDesc}>{description}</Text>
          </View>
        </View>

        {/* Status Banner */}
        {serviceStatus === 'paused' && (
          <View style={styles.maintenanceBanner}>
            <Ionicons name="time-outline" size={16} color={colors.warningColor} />
            <Text style={styles.maintenanceText}>
              This service is currently under maintenance
            </Text>
          </View>
        )}

        {/* Balance Display */}
        {balance !== undefined && (
          <View style={styles.balanceRow}>
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>
                {balanceLabel || 'Wallet Balance'}
              </Text>
              <Text style={styles.balanceAmount}>{balance}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </>
  );
});

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  navTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
  },
  heroBanner: {
    marginHorizontal: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  circleTopRight: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  circleBottomLeft: {
    position: 'absolute',
    left: -20,
    bottom: -25,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: '_bold',
    fontSize: typography.xl,
    marginBottom: 4,
  },
  heroDesc: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
  },
  maintenanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  maintenanceText: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    marginLeft: spacing.sm,
    lineHeight: 22,
  },
  balanceRow: {
    marginTop: spacing.md,
  },
  balanceBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignSelf: 'flex-start',
  },
  balanceLabel: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    marginBottom: 2,
  },
  balanceAmount: {
    fontFamily: '_bold',
    fontSize: typography.xl,
  },
});

export default BillScreenHeader;