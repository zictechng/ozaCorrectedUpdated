import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import useThemeStyles from '../hooks/useThemeStyles';
import { spacing, radius, typography } from '../styles';

const ReferralCard = ({ item }) => {
  const { colors } = useThemeStyles();

  const isActive = item.ref_status === 'Active'
    || item.ref_status === 'Completed';

  return (
    <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.bgLight }]}>
        <Text style={[styles.avatarText, { color: colors.primaryColor1 }]}>
          {item.ref_userName?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: colors.textBlack }]}
          numberOfLines={1}>
          {item.ref_userName || 'Anonymous'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecColor }]}>
          {moment(item.createdOn).format('DD MMM YYYY • hh:mm A')}
        </Text>
      </View>

      {/* Status */}
      <View style={[
        styles.statusBadge,
        {
          backgroundColor: isActive
            ? '#D1FAE5'
            : '#FEF3C7',
        },
      ]}>
        <Ionicons
          name={isActive ? 'checkmark-circle' : 'time-outline'}
          size={12}
          color={isActive ? '#10B981' : '#F59E0B'}
        />
        <Text style={[
          styles.statusText,
          { color: isActive ? '#10B981' : '#F59E0B' },
        ]}>
          {item.ref_status || 'Pending'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: '_bold',
    fontSize: typography.lg,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: '_semiBold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 2,
  },
  date: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 3,
  },
  statusText: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    lineHeight: 20,
  },
});

export default ReferralCard;