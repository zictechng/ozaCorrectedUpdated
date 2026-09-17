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
const ALERT_ICONS = {
  Transaction:  { icon: 'receipt-outline',         color: '#4C5FD5', bg: '#EEF2FF' },
  Bonus:        { icon: 'gift-outline',             color: '#F0A500', bg: '#FFF3CD' },
  Security:     { icon: 'shield-checkmark-outline', color: '#10B981', bg: '#D1FAE5' },
  Referral:     { icon: 'people-outline',           color: '#EC4899', bg: '#FCE7F3' },
  Payment:      { icon: 'card-outline',             color: '#3B82F6', bg: '#DBEAFE' },
  System:       { icon: 'settings-outline',         color: '#6B7280', bg: '#F3F4F6' },
  default:      { icon: 'notifications-outline',    color: '#4C5FD5', bg: '#EEF2FF' },
};

const getAlertConfig = (nature = '') => {
  const key = Object.keys(ALERT_ICONS).find(k =>
    nature.toLowerCase().includes(k.toLowerCase())
  );
  return ALERT_ICONS[key] || ALERT_ICONS.default;
};

const MessageCard = ({ item, onMarkRead }) => {
  const { colors } = useThemeStyles();
  const navigation = useNavigation();
  const config  = getAlertConfig(item.alert_nature || item.alert_name || '');
  const isUnread = item.alert_status === 1;

  const handlePress = () => {
    if (isUnread && onMarkRead) onMarkRead(item);
    navigation.navigate('messages', { item });
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
          {item.alert_name || 'Notification'}
        </Text>
        <Text
          style={[styles.message, { color: colors.textSecColor }]}
          numberOfLines={3}>
          {item.alert_nature || ''}
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