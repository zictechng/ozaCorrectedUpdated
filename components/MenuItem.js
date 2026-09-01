
// ─────────────────────────────────────────────────
// MenuItem.js
// Reusable menu item with icon, label, subtitle,
// optional badge and arrow. Used on Profile,
// Settings, Account screens.
// ─────────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStyles from '../hooks/useThemeStyles';

const MenuItem = React.memo(({
  icon,
  label,
  subtitle,
  onPress,
  iconBg,
  iconColor,
  rightBadge,
  rightBadgeColor,
  showArrow = true,
  disabled = false,
}) => {
  const { S, colors } = useThemeStyles();

  return (
    <TouchableOpacity
      style={[S.menuItem, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}>
      <View style={[S.menuIconBox, { backgroundColor: iconBg || colors.bgLight }]}>
        <Ionicons name={icon} size={20} color={iconColor || colors.primaryColor1} />
      </View>
      <View style={S.flex1}>
        <Text style={S.menuLabel}>{label}</Text>
        {subtitle && (
          <Text style={S.menuSubtitle} numberOfLines={2}>{subtitle}</Text>
        )}
      </View>
      {rightBadge && (
        <View style={[
          S.badgeWarning,
          rightBadgeColor && { backgroundColor: rightBadgeColor + '20' },
        ]}>
          <Text style={[
            S.badgeWarningText,
            rightBadgeColor && { color: rightBadgeColor },
          ]}>
            {rightBadge}
          </Text>
        </View>
      )}
      {showArrow && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecColor} />
      )}
    </TouchableOpacity>
  );
});



export default MenuItem;