import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';
import { spacing, radius, typography } from '../styles';

const STATUS_CONFIG = {
  Completed:  { color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
  Approved:   { color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
  Pending:    { color: '#F59E0B', bgColor: '#FEF3C7', icon: 'time-outline' },
  Processing: { color: '#4C5FD5', bgColor: '#EEF2FF', icon: 'reload-circle-outline' },
  Failed:     { color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
  Rejected:   { color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
  Cancelled:  { color: '#6B7280', bgColor: '#F3F4F6', icon: 'ban-outline' },
};

// ── On-gradient variant config — always visible on any colored background
const STATUS_CONFIG_GRADIENT = {
  Completed:  { color: '#fff', bgColor: 'rgba(16,185,129,0.35)',  borderColor: '#10B981', icon: 'checkmark-circle' },
  Approved:   { color: '#fff', bgColor: 'rgba(16,185,129,0.35)',  borderColor: '#10B981', icon: 'checkmark-circle' },
  Pending:    { color: '#fff', bgColor: 'rgba(245,158,11,0.35)',  borderColor: '#F59E0B', icon: 'time-outline' },
  Processing: { color: '#fff', bgColor: 'rgba(76,95,213,0.35)',   borderColor: '#818CF8', icon: 'reload-circle-outline' },
  Failed:     { color: '#fff', bgColor: 'rgba(239,68,68,0.35)',   borderColor: '#EF4444', icon: 'close-circle' },
  Rejected:   { color: '#fff', bgColor: 'rgba(239,68,68,0.35)',   borderColor: '#EF4444', icon: 'close-circle' },
  Cancelled:  { color: '#fff', bgColor: 'rgba(107,114,128,0.35)', borderColor: '#9CA3AF', icon: 'ban-outline' },
};

const TransactionStatusBadge = ({ status, size = 'md', variant = 'default' }) => {
  const { colors } = useThemeStyles();
  const isLarge = size === 'lg';
  const isOnGradient = variant === 'onGradient';

  const configMap = isOnGradient ? STATUS_CONFIG_GRADIENT : STATUS_CONFIG;
  const config = configMap[status] || {
    color: isOnGradient ? '#fff' : colors.textSecColor,
    bgColor: isOnGradient ? 'rgba(255,255,255,0.2)' : colors.bgLight,
    borderColor: isOnGradient ? 'rgba(255,255,255,0.4)' : colors.dividerColor,
    icon: 'ellipse-outline',
  };

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bgColor },
      isOnGradient && {
        borderWidth: 1.5,
        borderColor: config.borderColor,
      },
      isLarge && styles.badgeLarge,
    ]}>
      <Ionicons
        name={config.icon}
        size={isLarge ? 18 : 14}
        color={config.color}
      />
      <Text style={[
        styles.badgeText,
        { color: config.color },
        isLarge && styles.badgeTextLarge,
      ]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  badgeTextLarge: {
    fontSize: typography.base,
    lineHeight: 22,
  },
});

export default TransactionStatusBadge;