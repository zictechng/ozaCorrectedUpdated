import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';
import { spacing, radius, typography } from '../styles';

const STATUS_CONFIG = {
  Completed: { color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
  Approved:  { color: '#10B981', bgColor: '#D1FAE5', icon: 'checkmark-circle' },
  Pending:   { color: '#F59E0B', bgColor: '#FEF3C7', icon: 'time-outline' },
  Processing:{ color: '#4C5FD5', bgColor: '#EEF2FF', icon: 'reload-circle-outline' },
  Failed:    { color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
  Rejected:  { color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' },
  Cancelled: { color: '#6B7280', bgColor: '#F3F4F6', icon: 'ban-outline' },
};

const TransactionStatusBadge = ({ status, size = 'md' }) => {
  const { colors } = useThemeStyles();
  const config = STATUS_CONFIG[status] || {
    bgColor: colors.bgLight,
    icon: 'ellipse-outline',
  };
  const isLarge = size === 'lg';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: config.bgColor },
      isLarge && styles.badgeLarge,
    ]}>
      <Ionicons name={config.icon} size={isLarge ? 18 : 14} color={config.color} />
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