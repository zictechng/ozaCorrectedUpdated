import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import useThemeStyles from '../hooks/useThemeStyles';
import { spacing, radius, typography } from '../styles';

// ─────────────────────────────────────────────────
// Alert icon config — hardcoded hex only
// Never use colors.xxx here — top level object
// ─────────────────────────────────────────────────
const ALERT_TYPES = [
  { keys: ['withdrawal', 'withdraw'],        label: 'Withdrawal',         icon: 'arrow-down-circle-outline',  color: '#EF4444', bg: '#FEE2E2' },
  { keys: ['funded', 'funding', 'credited', 'account fund'], label: 'Account Funded',    icon: 'wallet-outline',             color: '#10B981', bg: '#D1FAE5' },
  { keys: ['transfer', 'sent', 'debit'],     label: 'Transfer',           icon: 'send-outline',               color: '#4C5FD5', bg: '#EEF2FF' },
  { keys: ['received', 'credit'],            label: 'Payment Received',   icon: 'arrow-down-outline',         color: '#10B981', bg: '#D1FAE5' },
  { keys: ['paystack', 'payment'],           label: 'Payment',            icon: 'card-outline',               color: '#3B82F6', bg: '#DBEAFE' },
  { keys: ['paypal'],                        label: 'PayPal',             icon: 'logo-paypal',                color: '#003087', bg: '#E8F0FE' },
  { keys: ['bonus', 'coins', 'reward'],      label: 'Bonus & Rewards',    icon: 'gift-outline',               color: '#F0A500', bg: '#FFF3CD' },
  { keys: ['referral', 'refer'],             label: 'Referral',           icon: 'people-outline',             color: '#EC4899', bg: '#FCE7F3' },
  { keys: ['approved', 'approval'],          label: 'Approved',           icon: 'checkmark-circle-outline',   color: '#10B981', bg: '#D1FAE5' },
  { keys: ['rejected', 'decline'],          label: 'Rejected',           icon: 'close-circle-outline',       color: '#EF4444', bg: '#FEE2E2' },
  { keys: ['document', 'kyc', 'identity'],   label: 'Document',           icon: 'document-text-outline',      color: '#8B5CF6', bg: '#EDE9FE' },
  { keys: ['exchange', 'sell', 'purchase', 'buy'], label: 'Exchange',    icon: 'swap-horizontal-outline',    color: '#F59E0B', bg: '#FEF3C7' },
  { keys: ['airtime', 'data', 'bill', 'electricity', 'tv', 'exam'], label: 'Bills Payment', icon: 'receipt-outline', color: '#4C5FD5', bg: '#EEF2FF' },
  { keys: ['usd', 'dollar'],                 label: 'USD Wallet',         icon: 'globe-outline',              color: '#10B981', bg: '#D1FAE5' },
  { keys: ['security', 'login', 'password'], label: 'Security',          icon: 'shield-checkmark-outline',   color: '#10B981', bg: '#D1FAE5' },
  { keys: ['system', 'update', 'notice'],    label: 'System Notice',      icon: 'settings-outline',           color: '#6B7280', bg: '#F3F4F6' },
];

const getAlertConfig = (nature = '') => {
  const text = nature.toLowerCase();
  const match = ALERT_TYPES.find(t => t.keys.some(k => text.includes(k)));
  return match || { label: 'Notification', icon: 'notifications-outline', color: '#4C5FD5', bg: '#EEF2FF' };
};

const MessageCard = ({ item, onMarkRead }) => {
  const { colors } = useThemeStyles();
  const navigation = useNavigation();
  const config  = getAlertConfig(item.alert_nature || item.alert_name || '');
  const isUnread = item.alert_status === 1;

  const handlePress = () => {
    if (onMarkRead) onMarkRead(item);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.bgCard },
        isUnread && { borderLeftWidth: 3, borderLeftColor: '#4C5FD5' },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}>
      {/* Unread dot */}
      {isUnread && (
        <View style={[styles.unreadDot, { backgroundColor: '#4C5FD5' }]} />
      )}

      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
          <Text
          style={[
            styles.title,
            { color: colors.textBlack },
            isUnread && { fontFamily: '_bold' },
          ]}
          numberOfLines={1}>
          {config.label}
        </Text>
          <Text
          style={[styles.message, { color: colors.textSecColor }]}
          numberOfLines={2}>
          {item.alert_nature || ''}
        </Text>
        <Text style={[styles.readMore, { color: colors.primaryColor1 }]}>
          {isUnread ? 'Tap to read →' : 'View message →'}
        </Text>
        <Text style={[styles.date, { color: colors.textSecColor2 }]}>
          {moment(item.alert_date).format('DD MMM YYYY • hh:mm A')}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textSecColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: '_bold',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: 4,
  },
  message: {
    fontFamily: '_regular',
    fontSize: typography.base,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
      date: {
    fontFamily: '_regular',
    fontSize: typography.sm,
    lineHeight: 20,
    marginTop: 2,
  },
  readMore: {
    fontFamily: '_semiBold',
    fontSize: typography.sm,
    marginTop: 4,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default MessageCard;